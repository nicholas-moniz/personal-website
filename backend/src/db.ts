import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USERNAME as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        logging: false
    }
);

export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connection has been established successfully");
    } catch (error) {
        console.log(`Unable to connect to the database: ${error}`);
        process.exit(1);
    }
};

export default sequelize;