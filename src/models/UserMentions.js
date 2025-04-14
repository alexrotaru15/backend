const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserMentions = sequelize.define(
	"UserMentions",
	{
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		channelId: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		mentionedUser: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
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
		tableName: "user_mentions",
		timestamps: true,
		indexes: [
			{
				fields: ["userId", "channelId", "rank"],
			},
		],
	}
);

module.exports = UserMentions;
