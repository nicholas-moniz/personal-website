#!/bin/bash

set -e

export MODE="development"
export MIGRATION_NAME="temp_migration"

DETACH=false
CLEAN_DB=false
CONFIG=config.json

while [[ "$#" -gt 0 ]]; do
  case $1 in
    development|production)
      MODE="$1"
      ;;
    --detach)
      DETACH=true
      ;;
    --reset-db)
      CLEAN_DB=true
      ;;
    --config=*)
      CONFIG="${1#--config=}"
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
  shift
done

declare -A CONFIG_KEYS=(
  [PROJECT_NAME]='.projectName'

  [HEALTH_ENDPOINT]='.health.endpoint'
  [HEALTH_TIMEOUT]='.health.timeout'
  [HEALTH_INTERVAL]='.health.interval'

  [CERT_PATH]='.cert.path'
  [KEY_PATH]='.cert.keyPath'

  [OPENSSL_SUBJECT_COUNTRY]='.openssl.subject.country'
  [OPENSSL_SUBJECT_STATE]='.openssl.subject.state'
  [OPENSSL_SUBJECT_LOCATION]='.openssl.subject.location'
  [OPENSSL_SUBJECT_ORGANIZATION]='.openssl.subject.organization'
  [OPENSSL_SUBJECT_ORGANIZATION_UNIT]='.openssl.subject.organizationUnit'
  [OPENSSL_SUBJECT_COMMON_NAME]='.openssl.subject.commonName'
  [OPENSSL_DAYS]='.openssl.days'
  [OPENSSL_KEY_SIZE]='.openssl.keySize'
  [OPENSSL_KEY_ALGORITHM]='.openssl.keyAlgorithm'

  [NGINX_HOST]='.nginx.host'
  [NGINX_HTTP_PORT]='.nginx.ports.http'
  [NGINX_HTTPS_PORT]='.nginx.ports.https'
  [NGINX_IMAGE]='.nginx.image'
  [NGINX_CONTAINER_NAME]='.nginx.containerName' 
  [NGINX_TEMPLATE_PATH]='.nginx.templatePath'
  [NGINX_CONFIG_PATH]='.nginx.configurationPath'
  [NGINX_FRONTEND_ENDPOINT]='.nginx.frontendEndpoint'
  [NGINX_BACKEND_ENDPOINT]='.nginx.backendEndpoint'

  [FRONTEND_HOST]='.frontend.containerName'
  [FRONTEND_PORT]='.frontend.port'
  [FRONTEND_DIRECTORY]='.frontend.directory'
  [FRONTEND_WORKING_DIRECTORY]='.frontend.workingDirectory'
  [FRONTEND_CONTAINER_NAME]='.frontend.containerName'
  [FRONTEND_ENV_FILE]='.frontend.envFile'
  [FRONTEND_DOCKERFILE]='.frontend.production.dockerfile'
  [FRONTEND_IMAGE]='.frontend.production.image'
  [FRONTEND_DEV_DOCKERFILE]='.frontend.development.dockerfile'
  [FRONTEND_DEV_IMAGE]='.frontend.development.image'

  [BACKEND_HOST]='.backend.containerName'
  [BACKEND_PORT]='.backend.port'
  [BACKEND_DIRECTORY]='.backend.directory'
  [BACKEND_WORKING_DIRECTORY]='.backend.workingDirectory'
  [BACKEND_MIGRATIONS_PATH]='.backend.migrationsPath'
  [BACKEND_CONTAINER_NAME]='.backend.containerName'
  [BACKEND_ENV_FILE]='.backend.envFile'
  [BACKEND_DOCKERFILE]='.backend.production.dockerfile'
  [BACKEND_IMAGE]='.backend.production.image'
  [BACKEND_DEV_DOCKERFILE]='.backend.development.dockerfile'
  [BACKEND_DEV_IMAGE]='.backend.development.image'

  [POSTGRES_IMAGE]='.postgres.image'
  [POSTGRES_CONTAINER_NAME]='.postgres.containerName'
  [POSTGRES_DB]='.postgres.database'
)

CONFIG_ERRORS=()

for VAR in "${!CONFIG_KEYS[@]}"; do
  VALUE=$(jq -r "${CONFIG_KEYS[$VAR]}" "$CONFIG")
  
  if [ "$VALUE" = "null" ] || [ -z "$VALUE" ]; then
    CONFIG_ERRORS+=("${CONFIG_KEYS[$VAR]}")
    continue
  fi

  case "$VAR" in
    NGINX_FRONTEND_ENDPOINT|NGINX_BACKEND_ENDPOINT|FRONTEND_WORKING_DIRECTORY|BACKEND_WORKING_DIRECTORY)
      [[ "$VALUE" == /* ]] && VALUE="/$VALUE" ;;
  esac

  export "$VAR"="$VALUE"
done

if [ ${#CONFIG_ERRORS[@]} -ne 0 ]; then
  echo "Miss key or empty value for the following fields in $CONFIG:"
  for err in "${CONFIG_ERRORS[@]}"; do
    echo "  - $err"
  done
  exit 1
fi

set -a
source .env
set +a

DIST_VARS=$(grep -vE '^\s*#|^\s*$' .env.dist | cut -d= -f1)
CONFIG_VARS="${!CONFIG_KEYS[@]}"
EXPECTED_VARS=$(echo "$DIST_VARS $CONFIG_VARS" | tr ' ' '\n' | sort -u)
MISSING_VARS=()

for var in $EXPECTED_VARS; do
  if [ -z "${!var+x}" ]; then
    MISSING_VARS+=("$var (unset)")
  elif [ -z "${!var}" ]; then
    MISSING_VARS+=("$var (empty)")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo "Missing or empty variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  exit 1
fi

function generate_certs() {
  echo "Generating self-signed SSL certificate ..."
  openssl req -x509 -nodes -days "$OPENSSL_DAYS" \
    -subj "/C=$OPENSSL_SUBJECT_COUNTRY/ST=$OPENSSL_SUBJECT_STATE/L=$OPENSSL_SUBJECT_LOCATION/O=$OPENSSL_SUBJECT_ORGANIZATION/OU=$OPENSSL_SUBJECT_ORGANIZATION_UNIT/CN=$OPENSSL_SUBJECT_COMMON_NAME" \
    -newkey "$OPENSSL_KEY_ALGORITHM:$OPENSSL_KEY_SIZE" \
    -keyout "$KEY_PATH" \
    -out "$CERT_PATH"
  echo "Certificate generated at $CERT_PATH"
}

function cleanup() {
  echo "Cleaning up images, containers and dangling volumes ..."
  docker-compose -p "$PROJECT_NAME" down --rmi local
  docker volume prune -f

  if [[ "$MODE" == "production" ]]; then
    echo "Deleting temp migration: temp_migration"
    rm -rf "$BACKEND_MIGRATIONS_PATH"/*temp_migration*
  fi

  echo "Cleanup complete."
  exit 0
}

if [[ "$CLEAN_DB" == true ]]; then
  echo "Removing named volume: ${PROJECT_NAME}_postgres-data"
  docker volume rm "${PROJECT_NAME}_postgres-data" || echo "Volume does not exist or already removed"
fi

trap cleanup SIGINT SIGTERM EXIT

if [[ "$MODE" == "production" ]]; then
  echo "Creating migration: temp_migration using staging mode"
  MODE="staging"

  envsubst < "$BACKEND_ENV_FILE".production.dist > "$BACKEND_ENV_FILE"

  docker-compose -p "$PROJECT_NAME" up backend postgres -d --build

  TIME_WAITED=0

  echo "Waiting for Express backend to be ready on $HEALTH_ENDPOINT ..."

  until curl --silent --fail "$HEALTH_ENDPOINT" >/dev/null; do
    sleep "$HEALTH_INTERVAL"
    TIME_WAITED=$((TIME_WAITED + HEALTH_INTERVAL))
    echo "Still waiting... (${TIME_WAITED}s)"
    if [ "$TIME_WAITED" -ge "$HEALTH_TIMEOUT" ]; then
      echo "Backend did not become ready within $HEALTH_TIMEOUT seconds."
      exit 1
    fi
  done

  echo "Migration created: temp_migration"

  docker-compose -p "$PROJECT_NAME" down --rmi local
  docker volume prune -f

  MODE="production"
fi

envsubst < "$FRONTEND_ENV_FILE"."$MODE".dist | sed 's|\\/|/|g' > "$FRONTEND_ENV_FILE"
envsubst < "$BACKEND_ENV_FILE"."$MODE".dist > "$BACKEND_ENV_FILE"

echo "Starting in $MODE mode ..."

if [[ "$MODE" == "development" ]]; then
  docker-compose -p "$PROJECT_NAME" up $( [[ "$DETACH" == true ]] && echo "-d" ) --build
elif [[ "$MODE" == "production" ]]; then

  if [[ ! -f "$CERT_PATH" || ! -f "$KEY_PATH" ]]; then
    generate_certs
  fi

  ENV_VARS=$(printf '${%s} ' NGINX_HOST NGINX_HTTP_PORT NGINX_HTTPS_PORT NGINX_FRONTEND_ENDPOINT FRONTEND_HOST FRONTEND_PORT NGINX_BACKEND_ENDPOINT BACKEND_HOST BACKEND_PORT)
  envsubst "$ENV_VARS" < "$NGINX_TEMPLATE_PATH" | sed 's|\\/|/|g' > "$NGINX_CONFIG_PATH"

  docker-compose -p "$PROJECT_NAME" -f docker-compose.yaml --profile production up $( [[ "$DETACH" == true ]] && echo "-d" ) --build
else
  echo "Invalid mode. Usage: ./run.sh [development|production] [--detach] [--reset-db]"
  exit 1
fi