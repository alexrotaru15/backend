const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserProfile = sequelize.define(
	"UserProfile",
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
		profile: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		personality_traits: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		interests: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		sports_team: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		political_preference: {
			type: DataTypes.STRING(10),
			allowNull: true,
		},
		favorite_celebrities: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		communication_style: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		additional_info: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		last_updated: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "user_profiles",
		timestamps: true,
	}
);

module.exports = UserProfile;
