const { User, Message, Channel, Vod } = require("../src/models");
const sequelize = require("../src/config/database");

async function countMavroMessages() {
	try {
		// Find the mavro_jr channel
		const mavroChannel = await Channel.findOne({
			where: { name: "mavro_jr" },
		});

		if (!mavroChannel) {
			console.error("Channel mavro_jr not found");
			return;
		}

		// Get all VODs for the mavro_jr channel
		const vods = await Vod.findAll({
			where: { channelId: mavroChannel.id },
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

		// Update each user's mavro_messages count and percentage
		for (const count of messageCounts) {
			const messageCount = parseInt(count.dataValues.messageCount);
			const percentage = (messageCount / totalMessages) * 100;

			await User.update(
				{
					mavro_messages: messageCount,
					mavro_messages_percentage: percentage,
				},
				{ where: { id: count.userId } }
			);
		}

		console.log("Successfully updated mavro_messages counts and percentages");
	} catch (error) {
		console.error("Error counting messages:", error);
	} finally {
		await sequelize.close();
	}
}

countMavroMessages();
