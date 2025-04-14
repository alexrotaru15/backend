const { Channel, Message, UserMentions } = require("../src/models");
const sequelize = require("../src/config/database");

async function analyzeDocMentions() {
	try {
		// Find the doctorul channel
		const docChannel = await Channel.findOne({
			where: { id: "272573477" },
		});

		if (!docChannel) {
			console.error("Channel doctorul not found");
			return;
		}

		// Get all messages grouped by user
		const messages = await Message.findAll({
			include: [
				{
					model: sequelize.models.Vod,
					where: { channelId: docChannel.id },
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
			const mentionCount = {};

			// Count mentions for this user
			contents.forEach((content) => {
				// Find all @mentions in the message
				const mentions = content.match(/@(\w+)/g);
				if (mentions) {
					mentions.forEach((mention) => {
						// Remove the @ and clean the username
						const username = mention.substring(1).toLowerCase();
						mentionCount[username] = (mentionCount[username] || 0) + 1;
					});
				}
			});

			// Sort mentions by count and get top 5
			const sortedMentions = Object.entries(mentionCount)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5); // Get top 5

			if (sortedMentions.length > 0) {
				// Delete existing mentions for this user and channel
				await UserMentions.destroy({
					where: {
						userId,
						channelId: docChannel.id,
					},
				});

				// Store new mentions
				await Promise.all(
					sortedMentions.map(([mentionedUser, count], index) => {
						return UserMentions.create({
							userId,
							channelId: docChannel.id,
							mentionedUser,
							count,
							rank: index + 1,
						});
					})
				);

				console.log(
					`Processed mentions for user ${userId}: ${sortedMentions
						.map(([user, count]) => `@${user}(${count})`)
						.join(", ")}`
				);
			}
		}

		console.log(
			"Successfully analyzed and stored user mentions for doctorul channel"
		);
	} catch (error) {
		console.error("Error analyzing user mentions:", error);
	} finally {
		await sequelize.close();
	}
}

analyzeDocMentions();
