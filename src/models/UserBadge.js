const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserBadge = sequelize.define(
	"UserBadge",
	{
		userId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: "users",
				key: "id",
			},
		},
		badgeId: {
			type: DataTypes.STRING,
			primaryKey: true,
			references: {
				model: "badges",
				key: "id",
			},
		},
	},
	{
		tableName: "user_badges",
		timestamps: false,
	}
);

module.exports = UserBadge;
