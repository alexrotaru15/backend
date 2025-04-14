const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Badge = sequelize.define(
	"Badge",
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		version: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: "badges",
		timestamps: false,
	}
);

module.exports = Badge;
