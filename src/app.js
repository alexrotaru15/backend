const express = require("express");
const cors = require("cors");
const usersRouter = require("./routes/users");
const channelsRouter = require("./routes/channels");

const app = express();

// Enable CORS for all origins
app.use(cors());

app.use(express.json());

// Routes
app.use("/api/users", usersRouter);
app.use("/api/channels", channelsRouter);

// Error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something broke!" });
});

module.exports = app;
