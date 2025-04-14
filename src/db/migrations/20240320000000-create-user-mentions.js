"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("user_mentions", {
			userId: {
				type: Sequelize.STRING,
				allowNull: false,
				primaryKey: true,
			},
			channelId: {
				type: Sequelize.STRING,
				allowNull: false,
				primaryKey: true,
			},
			mentionedUser: {
				type: Sequelize.STRING,
				allowNull: false,
				primaryKey: true,
			},
			count: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			rank: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});

		// Add index for efficient querying
		await queryInterface.addIndex("user_mentions", [
			"userId",
			"channelId",
			"rank",
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("user_mentions");
	},
};
