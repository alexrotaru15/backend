"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("user_word_stats", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
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
			word: {
				type: Sequelize.STRING,
				allowNull: false,
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

		// Add a composite unique constraint
		await queryInterface.addConstraint("user_word_stats", {
			fields: ["userId", "channelId", "word"],
			type: "unique",
			name: "unique_user_channel_word",
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("user_word_stats");
	},
};
