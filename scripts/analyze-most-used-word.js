const { Channel, Message } = require("../src/models");
const sequelize = require("../src/config/database");

async function analyzeMostUsedWord() {
	try {
		// Find the mavro_jr channel
		const mavroChannel = await Channel.findOne({
			where: { name: "mavro_jr" },
		});

		if (!mavroChannel) {
			console.error("Channel mavro_jr not found");
			return;
		}

		// Get messages and count words
		const messages = await Message.findAll({
			include: [
				{
					model: sequelize.models.Vod,
					where: { channelId: mavroChannel.id },
					attributes: [],
				},
			],
			attributes: ["content"],
		});

		const wordCount = {};
		const excludedWords = new Set([
			"that",
			"this",
			"have",
			"with",
			"they",
			"what",
			"from",
			"would",
			"there",
			"their",
			"about",
			"which",
			"when",
			"were",
			"will",
			"more",
			"into",
			"other",
			"than",
			"first",
			"some",
			"then",
			"these",
			"could",
			"your",
			"them",
			"time",
			"only",
			"like",
			"just",
			"should",
			"also",
			"much",
			"been",
			"over",
			"where",
			"through",
			"still",
			"before",
			"after",
			"those",
			"most",
			"because",
			"sunt",
			"care",
			"pentru",
			"este",
			"asta",
			"daca",
			"aici",
			"doar",
			"buna",
			"ziua",
			"seara",
			"noapte",
			"dimineata",
			"salut",
			"hello",
			"cand",
			"fost",
			"acum",
			"cred",
			"dupa",
			"chat",
			"ceva",
			"cine",
			"https",
			"roll",
			"bine",
			"mavro",
		]);

		messages.forEach((message) => {
			if (
				message.content.includes("subscribed") ||
				message.content.includes("cheered") ||
				message.content.includes("donated") ||
				message.content.includes("bits") ||
				message.content.startsWith("!")
			) {
				return;
			}

			const words = message.content
				.toLowerCase()
				.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
				.split(/\s+/);

			words.forEach((word) => {
				if (
					word.length >= 4 &&
					!excludedWords.has(word) &&
					!/^\d+$/.test(word) &&
					!/^(clap|peepoclap|dinodance|headbang|bongotap|cheer|clown|peepoclown|mvr|duck|https?)/i.test(
						word
					) &&
					!word.startsWith("@")
				) {
					wordCount[word] = (wordCount[word] || 0) + 1;
				}
			});
		});

		// Find the most used word
		let mostUsedWord = "";
		let maxCount = 0;

		Object.entries(wordCount)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 20)
			.forEach(([word, count]) => {
				console.log(`${word}: ${count}`);
				if (count > maxCount) {
					maxCount = count;
					mostUsedWord = word;
				}
			});

		if (mostUsedWord) {
			// Update the channel with the most used word
			await Channel.update(
				{ most_used_word: mostUsedWord },
				{ where: { id: mavroChannel.id } }
			);

			console.log(
				`\nMost used word: "${mostUsedWord}" (used ${maxCount} times)`
			);
		} else {
			console.log("No words found matching the criteria");
		}
	} catch (error) {
		console.error("Error analyzing messages:", error);
	} finally {
		await sequelize.close();
	}
}

analyzeMostUsedWord();
