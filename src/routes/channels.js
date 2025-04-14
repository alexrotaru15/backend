const express = require("express");
const router = express.Router();
const {
	Channel,
	User,
	UserProfile,
	UserWordStats,
	UserMentions,
} = require("../models");
const { Op } = require("sequelize");

// Get all channels
router.get("/", async (req, res) => {
	try {
		const channels = await Channel.findAll({
			order: [["name", "ASC"]],
		});
		res.json({ channels });
	} catch (error) {
		console.error("Error fetching channels:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get channel by ID
router.get("/:id", async (req, res) => {
	try {
		const channel = await Channel.findByPk(req.params.id);
		if (!channel) {
			return res.status(404).json({ error: "Channel not found" });
		}
		res.json(channel);
	} catch (error) {
		console.error("Error fetching channel:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get channel users
router.get("/:id/users", async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 100;
		const search = req.query.search || "";
		const channelId = req.params.id;
		const offset = (page - 1) * limit;

		// Determine which message field to use based on channel
		const messageField =
			channelId === "272573477" ? "doc_messages" : "mavro_messages";
		const percentageField =
			channelId === "272573477"
				? "doc_messages_percentage"
				: "mavro_messages_percentage";

		// Build where clause for messages > 0
		const baseWhereClause = {
			[messageField]: {
				[Op.and]: [{ [Op.not]: null }, { [Op.gt]: 0 }],
			},
		};

		// Add search condition if search term exists
		const searchWhereClause = search
			? {
					[Op.or]: [
						{
							displayName: {
								[Op.iLike]: `%${search}%`,
							},
						},
						{
							name: {
								[Op.iLike]: `%${search}%`,
							},
						},
					],
			  }
			: {};

		// Combine base and search conditions
		const whereClause = {
			...baseWhereClause,
			...(search ? searchWhereClause : {}),
		};

		// First get all user IDs ordered by message count to calculate global ranks
		const allUserRanks = await User.findAll({
			where: baseWhereClause,
			attributes: ["id"],
			order: [
				[messageField, "DESC"],
				["id", "ASC"], // Secondary sort for consistent ordering
			],
		});

		// Create a map of user ID to global rank
		const userRankMap = new Map(
			allUserRanks.map((user, index) => [user.id, index + 1])
		);

		// Get total count for pagination
		const totalCount = await User.count({
			where: whereClause,
		});

		// Get paginated users with their profiles and word stats
		const users = await User.findAll({
			where: whereClause,
			order: [
				[messageField, "DESC"],
				["id", "ASC"],
			],
			limit: limit,
			offset: offset,
			attributes: [
				"id",
				"displayName",
				"name",
				"bio",
				"logo",
				"mavro_messages",
				"mavro_messages_percentage",
				"doc_messages",
				"doc_messages_percentage",
			],
			include: [
				{
					model: UserProfile,
					attributes: [
						"profile",
						"personality_traits",
						"interests",
						"sports_team",
						"political_preference",
						"favorite_celebrities",
						"communication_style",
						"additional_info",
						"last_updated",
					],
					required: false,
					where: {
						channelId: channelId,
					},
				},
				{
					model: UserWordStats,
					attributes: ["word", "count", "rank"],
					required: false,
					where: {
						channelId: channelId,
						rank: {
							[Op.lte]: 10,
						},
					},
					order: [["rank", "ASC"]],
				},
				{
					model: UserMentions,
					as: "Mentions",
					attributes: ["mentionedUser", "count", "rank"],
					required: false,
					where: {
						channelId: channelId,
						rank: {
							[Op.lte]: 5,
						},
					},
					order: [["rank", "ASC"]],
				},
			],
		});

		// Add global rank to each user
		const usersWithRank = users.map((user) => {
			const plainUser = user.get({ plain: true });
			return {
				...plainUser,
				globalRank: userRankMap.get(user.id),
			};
		});

		res.json({
			users: usersWithRank,
			page,
			limit,
			total: totalCount,
			hasMore: offset + users.length < totalCount,
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
