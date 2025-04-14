const { User, Message, Channel, Vod } = require("../src/models");
const sequelize = require("../src/config/database");

async function countDocMessages() {
	try {
		// Find the doctorul_ channel
		const docChannel = await Channel.findOne({
			where: { name: "doctorul_" },
		});

		if (!docChannel) {
			console.error("Channel doctorul_ not found");
			return;
		}

		// Get all VODs for the doctorul_ channel
		const vods = await Vod.findAll({
			where: { channelId: docChannel.id },
		});

		const vodIds = vods.map((vod) => vod.id);

		// Count messages for each user
		const messageCounts = await Message.findAll({
			attributes: [
				"userId",
				[sequelize.fn("COUNT", sequelize.col("id")), "messageCount"],
			],
			where: {
				vodId: vodIds,
			},
			group: ["userId"],
		});

		// Get total message count
		const totalMessages = messageCounts.reduce(
			(sum, count) => sum + parseInt(count.dataValues.messageCount),
			0
		);

		// Update each user's doc_messages count and percentage
		for (const count of messageCounts) {
			const messageCount = parseInt(count.dataValues.messageCount);
			const percentage = (messageCount / totalMessages) * 100;

			await User.update(
				{
					doc_messages: messageCount,
					doc_messages_percentage: percentage,
				},
				{ where: { id: count.userId } }
			);
		}

		console.log("Successfully updated doc_messages counts and percentages");
	} catch (error) {
		console.error("Error counting messages:", error);
	} finally {
		await sequelize.close();
	}
}

countDocMessages();
