const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 3001;

async function startServer() {
	try {
		// Test database connection
		await sequelize.authenticate();
		console.log("Database connection has been established successfully.");

		// Start the server
		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Unable to start server:", error);
		process.exit(1);
	}
}

startServer();
