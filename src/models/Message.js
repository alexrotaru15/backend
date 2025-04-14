const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define(
	"Message",
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
		vodId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "vods",
				key: "id",
			},
		},
		offsetSeconds: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		bitsSpent: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		userColor: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: "messages",
		timestamps: true,
		createdAt: "createdAt",
		updatedAt: false,
	}
);

module.exports = Message;
