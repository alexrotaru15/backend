const { Channel, Message, UserWordStats } = require("../src/models");
const sequelize = require("../src/config/database");

// Helper function to clean and validate words
function isValidWord(word) {
	// Remove any punctuation and special characters
	word = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

	// Skip if it's a command
	if (word.startsWith("!")) return false;

	// Skip if it's a mention
	if (word.startsWith("@")) return false;

	// Skip if it's a URL
	if (word.startsWith("http") || word.includes(".com") || word.includes(".tv"))
		return false;

	// Skip if it's too short
	if (word.length < 4) return false;

	// Skip if it's just numbers
	if (/^\d+$/.test(word)) return false;

	return true;
}

async function analyzeUserWords() {
	try {
		// Find the mavro_jr channel
		const mavroChannel = await Channel.findOne({
			where: { name: "mavro_jr" },
		});

		if (!mavroChannel) {
			console.error("Channel mavro_jr not found");
			return;
		}

		// Get all messages grouped by user
		const messages = await Message.findAll({
			include: [
				{
					model: sequelize.models.Vod,
					where: { channelId: mavroChannel.id },
					attributes: [],
				},
			],
			attributes: ["userId", "content"],
		});

		// Group messages by user
		const userMessages = {};
		messages.forEach((message) => {
			// Skip system messages
			if (message.content.startsWith("SYSTEM:")) return;

			if (!userMessages[message.userId]) {
				userMessages[message.userId] = [];
			}
			userMessages[message.userId].push(message.content);
		});

		// Process each user's messages
		for (const [userId, contents] of Object.entries(userMessages)) {
			const wordCount = {};

			// Count words for this user
			contents.forEach((content) => {
				const words = content.toLowerCase().split(/\s+/);

				words.forEach((word) => {
					// Clean and validate the word
					word = word.trim();
					if (isValidWord(word)) {
						wordCount[word] = (wordCount[word] || 0) + 1;
					}
				});
			});

			// Sort words by count
			const sortedWords = Object.entries(wordCount)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10); // Get top 10

			// Delete existing stats for this user and channel
			await UserWordStats.destroy({
				where: {
					userId,
					channelId: mavroChannel.id,
				},
			});

			// Store new stats
			await Promise.all(
				sortedWords.map(([word, count], index) => {
					return UserWordStats.create({
						userId,
						channelId: mavroChannel.id,
						word,
						count,
						rank: index + 1,
					});
				})
			);

			console.log(
				`Processed user ${userId}: ${sortedWords
					.map(([word, count]) => `${word}(${count})`)
					.join(", ")}`
			);
		}

		console.log("Successfully analyzed and stored user word stats");
	} catch (error) {
		console.error("Error analyzing user words:", error);
	} finally {
		await sequelize.close();
	}
}

analyzeUserWords();
