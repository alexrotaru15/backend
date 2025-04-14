"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("users", "doc_messages", {
			type: Sequelize.INTEGER,
			allowNull: true,
		});

		await queryInterface.addColumn("users", "doc_messages_percentage", {
			type: Sequelize.DECIMAL(5, 2),
			allowNull: true,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("users", "doc_messages");
		await queryInterface.removeColumn("users", "doc_messages_percentage");
	},
};
