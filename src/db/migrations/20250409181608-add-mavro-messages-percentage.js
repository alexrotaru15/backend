"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("users", "mavro_messages_percentage", {
			type: Sequelize.DECIMAL(5, 2),
			allowNull: false,
			defaultValue: 0,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("users", "mavro_messages_percentage");
	},
};
