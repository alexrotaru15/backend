"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("user_profiles", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			userId: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			channelId: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {
					model: "channels",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			profile: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			personality_traits: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			interests: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			sports_team: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			political_preference: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			favorite_celebrities: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			communication_style: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			additional_info: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			last_updated: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});

		// Add a unique constraint to ensure one profile per user per channel
		await queryInterface.addConstraint("user_profiles", {
			fields: ["userId", "channelId"],
			type: "unique",
			name: "unique_user_channel_profile",
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("user_profiles");
	},
};
