const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
	"User",
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		displayName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		bio: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		logo: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		mavro_messages: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		mavro_messages_percentage: {
			type: DataTypes.DECIMAL(5, 2),
			allowNull: true,
		},
		doc_messages: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		doc_messages_percentage: {
			type: DataTypes.DECIMAL(5, 2),
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: "users",
		timestamps: true,
		createdAt: "createdAt",
		updatedAt: "updatedAt",
	}
);

module.exports = User;
