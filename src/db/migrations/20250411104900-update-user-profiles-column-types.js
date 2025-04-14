"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.changeColumn("user_profiles", "communication_style", {
			type: Sequelize.TEXT,
			allowNull: true,
		});

		await queryInterface.changeColumn("user_profiles", "sports_team", {
			type: Sequelize.TEXT,
			allowNull: true,
		});

		await queryInterface.changeColumn("user_profiles", "political_preference", {
			type: Sequelize.STRING(10),
			allowNull: true,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.changeColumn("user_profiles", "communication_style", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.changeColumn("user_profiles", "sports_team", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.changeColumn("user_profiles", "political_preference", {
			type: Sequelize.STRING,
			allowNull: true,
		});
	},
};
