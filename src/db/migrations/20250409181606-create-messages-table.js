"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("messages", {
			id: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
			},
			content: {
				type: Sequelize.TEXT,
				allowNull: false,
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
			vodId: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {
					model: "vods",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			offsetSeconds: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			bitsSpent: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			userColor: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("messages");
	},
};
