const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize =
	process.env.NODE_ENV === "production"
		? new Sequelize(process.env.DATABASE_URL, {
				dialect: "postgres",
				dialectOptions: {
					ssl: {
						require: true,
						rejectUnauthorized: false,
					},
				},
				logging: false,
		  })
		: new Sequelize(
				process.env.DB_NAME,
				process.env.DB_USER,
				process.env.DB_PASSWORD,
				{
					host: process.env.DB_HOST,
					port: process.env.DB_PORT,
					dialect: "postgres",
					logging: false,
				}
		  );

module.exports = sequelize;
