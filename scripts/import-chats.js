const fs = require("fs");
const path = require("path");
const {
	User,
	Badge,
	Channel,
	Vod,
	Message,
	UserBadge,
} = require("../src/models");
const sequelize = require("../src/config/database");

async function importChatData() {
	try {
		// Get all JSON files from the chats directory
		const chatsDir = path.join(__dirname, "..", "..", "chats");
		const files = fs
			.readdirSync(chatsDir)
			.filter((file) => file.endsWith(".json"));

		// Process each file
		for (const file of files) {
			console.log(`Processing ${file}...`);
			const filePath = path.join(chatsDir, file);
			const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

			// Extract streamer info
			const streamer = data.streamer;
			const channel = await Channel.findOrCreate({
				where: { id: String(streamer.id) },
				defaults: {
					name: streamer.login,
					displayName: streamer.name,
				},
			});

			// Extract video info
			const video = data.video;
			const vod = await Vod.findOrCreate({
				where: { id: String(video.id) },
				defaults: {
					title: video.title,
					channelId: String(streamer.id),
					createdAt: new Date(video.created_at),
				},
			});

			// Process each comment
			for (const comment of data.comments) {
				// Create or update user
				const user = await User.findOrCreate({
					where: { id: String(comment.commenter._id) },
					defaults: {
						displayName: comment.commenter.display_name,
						name: comment.commenter.name,
						bio: comment.commenter.bio,
						logo: comment.commenter.logo,
						createdAt: new Date(comment.commenter.created_at),
					},
				});

				// Create message
				await Message.findOrCreate({
					where: { id: String(comment._id) },
					defaults: {
						content: comment.message.body,
						userId: String(comment.commenter._id),
						vodId: String(video.id),
						offsetSeconds: comment.content_offset_seconds,
						bitsSpent: comment.message.bits_spent,
						userColor: comment.message.user_color,
						createdAt: new Date(comment.created_at),
					},
				});

				// Process user badges
				for (const badge of comment.message.user_badges) {
					// Create or update badge
					await Badge.findOrCreate({
						where: { id: String(badge._id) },
						defaults: {
							version: badge.version,
						},
					});

					// Create user-badge association
					await UserBadge.findOrCreate({
						where: {
							userId: String(comment.commenter._id),
							badgeId: String(badge._id),
						},
					});
				}
			}

			console.log(`Finished processing ${file}`);
		}

		console.log("Import completed successfully!");
	} catch (error) {
		console.error("Error importing data:", error);
	} finally {
		await sequelize.close();
	}
}

importChatData();
