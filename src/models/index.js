const User = require("./User");
const Badge = require("./Badge");
const Channel = require("./Channel");
const Vod = require("./Vod");
const Message = require("./Message");
const UserBadge = require("./UserBadge");
const UserWordStats = require("./UserWordStats");
const UserProfile = require("./UserProfile");
const UserMentions = require("./UserMentions");

// User - Message (One-to-Many)
User.hasMany(Message, { foreignKey: "userId" });
Message.belongsTo(User, { foreignKey: "userId" });

// Channel - Vod (One-to-Many)
Channel.hasMany(Vod, { foreignKey: "channelId" });
Vod.belongsTo(Channel, { foreignKey: "channelId" });

// Vod - Message (One-to-Many)
Vod.hasMany(Message, { foreignKey: "vodId" });
Message.belongsTo(Vod, { foreignKey: "vodId" });

// User - Badge (Many-to-Many)
User.belongsToMany(Badge, { through: UserBadge, foreignKey: "userId" });
Badge.belongsToMany(User, { through: UserBadge, foreignKey: "badgeId" });

// User - Channel - UserWordStats (Many-to-Many with extra fields)
User.hasMany(UserWordStats, { foreignKey: "userId" });
UserWordStats.belongsTo(User, { foreignKey: "userId" });
Channel.hasMany(UserWordStats, { foreignKey: "channelId" });
UserWordStats.belongsTo(Channel, { foreignKey: "channelId" });

// User - Channel - UserProfile (One-to-One per channel)
User.hasMany(UserProfile, { foreignKey: "userId" });
UserProfile.belongsTo(User, { foreignKey: "userId" });
Channel.hasMany(UserProfile, { foreignKey: "channelId" });
UserProfile.belongsTo(Channel, { foreignKey: "channelId" });

// User - UserMentions (Many-to-Many)
User.hasMany(UserMentions, { foreignKey: "userId", as: "Mentions" });
UserMentions.belongsTo(User, { foreignKey: "userId", as: "User" });

Channel.hasMany(UserMentions, { foreignKey: "channelId" });
UserMentions.belongsTo(Channel, { foreignKey: "channelId" });

module.exports = {
	User,
	Badge,
	Channel,
	Vod,
	Message,
	UserBadge,
	UserWordStats,
	UserProfile,
	UserMentions,
};
