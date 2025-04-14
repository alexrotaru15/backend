const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Channel = sequelize.define(
	"Channel",
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		displayName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		most_used_word: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "channels",
		timestamps: true,
	}
);

module.exports = Channel;
