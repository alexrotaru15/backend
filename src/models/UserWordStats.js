const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserWordStats = sequelize.define(
	"UserWordStats",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
		channelId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "channels",
				key: "id",
			},
		},
		word: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		count: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		rank: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		tableName: "user_word_stats",
		timestamps: true,
	}
);

module.exports = UserWordStats;
