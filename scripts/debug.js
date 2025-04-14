const fs = require("fs");
const path = require("path");

const filePath = path.join(
	__dirname,
	"..",
	"..",
	"chats",
	"[2-10-25] Doctorul_ - Vorbim, apoi vedem ce facem. !anunt !cefac - Chat.json"
);
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

console.log("Data structure:", JSON.stringify(data, null, 2));
