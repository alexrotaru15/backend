const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vod = sequelize.define(
	"Vod",
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		channelId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "channels",
				key: "id",
			},
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: "vods",
		timestamps: true,
		createdAt: "createdAt",
		updatedAt: false,
	}
);

module.exports = Vod;
