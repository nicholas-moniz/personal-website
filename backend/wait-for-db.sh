#!/bin/sh
set -e

MAX_WAIT_TIME=120
elapsed_time=0

while [ "$elapsed_time" -lt "$MAX_WAIT_TIME" ]; do
  if nc -z "$DB_HOST" "$DB_PORT"; then
    echo "Postgres is ready. Starting Prisma setup for mode: $MODE"

    case "$MODE" in
      development)
        echo "Applying schema (db push) ..."
        npx prisma db push
        ;;
      staging)
        echo "Creating and applying migration ..."
        MIGRATION_NAME=${MIGRATION_NAME:-"from-$(date +%s)"}
        npx prisma migrate reset --force
        npx prisma migrate dev --name "$MIGRATION_NAME" --skip-seed
        ;;
      production)
        echo "Applying committed migrations (migrate deploy) ..."
        npx prisma migrate deploy
        ;;
      *)
        echo "Unknown MODE: $MODE — defaulting to development ..."
        npx prisma db push
        ;;
    esac

    echo "Generating Prisma client..."
    npx prisma generate
    
    echo "Prisma ready. Starting app ..."
    exec "$@"
  else
    echo "Waiting for Postgres at $DB_HOST:$DB_PORT ..."
    sleep 10
    elapsed_time=$((elapsed_time + 10))
  fi
done

echo "Error: Postgres is not ready after ${MAX_WAIT_TIME} seconds."
exit 1