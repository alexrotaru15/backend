const sequelize = require("../config/database");
const models = require("../models");

async function syncDatabase() {
	try {
		// Sincronizează toate modelele cu baza de date
		await sequelize.sync({ force: true }); // force: true va șterge și recrea tabelele
		console.log("Baza de date a fost sincronizată cu succes!");
	} catch (error) {
		console.error("Eroare la sincronizarea bazei de date:", error);
	} finally {
		await sequelize.close();
	}
}

syncDatabase();
