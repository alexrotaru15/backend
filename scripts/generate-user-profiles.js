const { Channel, Message, UserProfile, User } = require("../src/models");
const sequelize = require("../src/config/database");
const { Ollama } = require("ollama");

const ollama = new Ollama();

// Helper function to wait between requests
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Maximum number of retries per user
const MAX_RETRIES = 3;

async function generateUserProfile(userId, messages, retryCount = 0) {
	try {
		// Preprocess messages to remove noise and limit length
		const processedMessages = messages
			.filter((msg) => msg.length < 500) // Skip very long messages
			.filter((msg) => !msg.match(/^![a-zA-Z]/)) // Skip commands
			.slice(-100); // Analyze last 100 messages for better context

		// Prepare the messages for analysis with counts
		const messageStats = {
			totalMessages: messages.length,
			processedMessages: processedMessages.length,
			avgLength: Math.floor(
				processedMessages.reduce((acc, msg) => acc + msg.length, 0) /
					processedMessages.length
			),
		};

		const messageText = processedMessages.join("\n");

		// Create a prompt for the LLM
		const prompt = `Analizează aceste mesaje de chat Twitch și generează un profil de utilizator amuzant și captivant în format JSON.
Fii creativ și folosește umor în descrieri, dar păstrează acuratețea analizei.
Caută pattern-uri interesante în comportament și exprimare.
Evidențiază momentele amuzante și interacțiunile memorabile.

MESAJE DE ANALIZAT (${messageStats.processedMessages} din ${messageStats.totalMessages}):
${messageText}

RĂSPUNDE CU ACEST JSON (fii creativ și amuzant în descrieri):
{
	"profile": "O descriere haioasă dar precisă a persoanei, cu detalii specifice din mesajele lor",
	"personality_traits": [
		"trăsături de personalitate amuzante dar reale",
		"observații despre stilul lor unic",
		"caracteristici memorabile"
	],
	"interests": [
		"pasiuni identificate din mesaje",
		"subiecte favorite de discuție",
		"teme recurente în conversații"
	],
	"sports_team": "echipa favorită (dacă se poate identifica) sau null",
	"political_preference": "partid politic (doar din lista permisă) sau null",
	"favorite_celebrities": [
		"persoane publice menționate",
		"streameri sau creatori preferați"
	],
	"communication_style": "descriere amuzantă dar exactă a stilului lor de comunicare",
	"additional_info": [
		"observații haioase despre comportamentul în chat",
		"momente memorabile sau obiceiuri specifice"
	]
}

REGULI STRICTE:
1. Răspunde DOAR cu JSON valid
2. Folosește DOAR ghilimele duble
3. Scrie TOT în română
4. Pentru political_preference folosește DOAR: "PSD", "PNL", "USR", "AUR", "SENS", "DREPT", "POT", "SOS", null
5. Folosește limbaj neutru (persoană/participant/membru)
6. Fii creativ și amuzant, dar bazat pe dovezi din mesaje
7. Include detalii specifice din mesajele lor
8. NU adăuga text în afara JSON
9. Termină JSON-ul cu "}\\nEND_OF_JSON"`;

		// Generate the profile using Ollama
		const response = await ollama.generate({
			model: "mistral",
			prompt: prompt,
			stream: false,
			options: {
				temperature: 0.7,
				top_k: 50,
				top_p: 0.9,
				num_predict: 4000, // Increased significantly to ensure complete response
				stop: ["END_OF_JSON", "```"], // Wait for our explicit end token
			},
		});

		try {
			// Try to parse the response
			let cleanedResponse = response.response.trim();

			// Extract everything between the first { and the last }
			const startIndex = cleanedResponse.indexOf("{");
			const endIndex = cleanedResponse.lastIndexOf("}");

			if (startIndex === -1 || endIndex === -1) {
				throw new Error("No valid JSON structure found");
			}

			cleanedResponse = cleanedResponse.substring(startIndex, endIndex + 1);

			// Verify we have a complete JSON structure by counting braces
			const openBraces = (cleanedResponse.match(/{/g) || []).length;
			const closeBraces = (cleanedResponse.match(/}/g) || []).length;

			if (openBraces !== closeBraces) {
				throw new Error(
					`Incomplete JSON structure: ${openBraces} open braces vs ${closeBraces} close braces`
				);
			}

			// Additional validation for required fields before parsing
			if (
				!cleanedResponse.includes('"profile"') ||
				!cleanedResponse.includes('"personality_traits"') ||
				!cleanedResponse.includes('"interests"')
			) {
				throw new Error("Response missing required JSON fields");
			}

			// Log the response for debugging
			console.log("Raw response for user", userId, ":", cleanedResponse);

			// Try to parse and validate the JSON
			const profileData = JSON.parse(cleanedResponse);

			// Validate all required fields are present and have correct types
			const requiredFields = {
				profile: "string",
				personality_traits: "array",
				interests: "array",
				sports_team: ["string", "null"],
				political_preference: ["string", "null"],
				favorite_celebrities: "array",
				communication_style: "string",
				additional_info: "array",
			};

			for (const [field, type] of Object.entries(requiredFields)) {
				if (!(field in profileData)) {
					throw new Error(`Missing required field: ${field}`);
				}

				if (Array.isArray(type)) {
					if (
						!type.includes(typeof profileData[field]) &&
						profileData[field] !== null
					) {
						throw new Error(`Invalid type for ${field}`);
					}
				} else if (type === "array") {
					if (!Array.isArray(profileData[field])) {
						profileData[field] = [];
					}
				} else if (
					typeof profileData[field] !== type &&
					profileData[field] !== null
				) {
					throw new Error(`Invalid type for ${field}`);
				}
			}

			// Ensure arrays have at least one element for required arrays
			if (!profileData.personality_traits.length) {
				profileData.personality_traits = ["necunoscut"];
			}
			if (!profileData.interests.length) {
				profileData.interests = ["necunoscut"];
			}

			// Validate political_preference
			const validParties = [
				"PSD",
				"PNL",
				"USR",
				"AUR",
				"SENS",
				"DREPT",
				"POT",
				"SOS",
				null,
			];
			if (
				profileData.political_preference !== null &&
				!validParties.includes(profileData.political_preference)
			) {
				profileData.political_preference = null;
			}

			return profileData;
		} catch (parseError) {
			console.error(
				"Failed to parse LLM response for user",
				userId,
				":",
				response.response
			);

			// Retry logic
			if (retryCount < MAX_RETRIES) {
				console.log(
					`Retrying for user ${userId} (attempt ${
						retryCount + 1
					} of ${MAX_RETRIES})...`
				);
				await sleep(2000); // Wait longer between retries
				return generateUserProfile(userId, messages, retryCount + 1);
			}

			throw new Error(
				`Failed to generate valid JSON after ${MAX_RETRIES} attempts`
			);
		}
	} catch (error) {
		if (retryCount < MAX_RETRIES) {
			console.log(
				`Retrying for user ${userId} (attempt ${
					retryCount + 1
				} of ${MAX_RETRIES})...`
			);
			await sleep(2000);
			return generateUserProfile(userId, messages, retryCount + 1);
		}
		console.error(
			`Error generating profile for user ${userId} after ${MAX_RETRIES} attempts:`,
			error
		);
		return null;
	}
}

async function generateAllUserProfiles() {
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
				{
					model: User,
					attributes: ["name"],
				},
			],
			attributes: ["userId", "content"],
		});

		// Group messages by user
		const userMessages = {};
		messages.forEach((message) => {
			// Skip system messages and commands
			if (
				message.content.startsWith("SYSTEM:") ||
				message.content.startsWith("!")
			)
				return;

			if (!userMessages[message.userId]) {
				userMessages[message.userId] = [];
			}
			userMessages[message.userId].push(message.content);
		});

		// Process each user
		for (const [userId, contents] of Object.entries(userMessages)) {
			// Only process users with enough messages for meaningful analysis
			if (contents.length < 100) {
				console.log(
					`Skipping user ${userId} - not enough messages (${contents.length})`
				);
				continue;
			}

			console.log(
				`Generating profile for user ${userId} with ${contents.length} messages...`
			);

			const profileData = await generateUserProfile(userId, contents);

			if (profileData) {
				// Update or create the profile
				await UserProfile.upsert({
					userId: userId,
					channelId: mavroChannel.id,
					profile: profileData.profile,
					personality_traits: profileData.personality_traits,
					interests: profileData.interests,
					sports_team: profileData.sports_team,
					political_preference: profileData.political_preference,
					favorite_celebrities: profileData.favorite_celebrities,
					communication_style: profileData.communication_style,
					additional_info: profileData.additional_info,
					last_updated: new Date(),
				});

				console.log(`Profile generated for user ${userId}`);

				// Wait a bit between requests to avoid overwhelming the model
				await sleep(1000);
			}
		}

		console.log("Successfully generated all user profiles");
	} catch (error) {
		console.error("Error generating user profiles:", error);
	} finally {
		await sequelize.close();
	}
}

generateAllUserProfiles();
