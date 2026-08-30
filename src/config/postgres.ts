import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_URI,
    port: Number(process.env.DB_PORT ?? 5432),
    dialect: "postgres",
    logging: false,
  }
);
const db: any = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

export { db };
