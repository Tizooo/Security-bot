import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const WATCH_CHANNEL_ID = process.env.CHANNEL_ID;

if (!TOKEN || !WATCH_CHANNEL_ID) {
  throw new Error("❌ Missing DISCORD_BOT_TOKEN or CHANNEL_ID in .env");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`👀 Watching channel: ${WATCH_CHANNEL_ID}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    if (message.channel.id !== WATCH_CHANNEL_ID) return;

    const guild = message.guild;
    if (!guild) return;

    const member = await guild.members.fetch(message.author.id).catch(() => null);
    if (!member) return;

    console.log(`🚨 Detected message from ${member.user.tag} in honeypot channel.`);

    try {
      await member.send(
        `🚫 Du wurdest von **${guild.name}** ausgeschlossen, weil du eine Nachricht in einem Honeypot-Kanal gesendet hast. Du kannst <@310844659821707264> anschreiben falls du entbannt werden willst.`
      );
    } catch {
      console.warn(`⚠️ Couldn't DM ${member.user.tag}`);
    }

    await guild.members.ban(member.id, {
      deleteMessageSeconds: 3600, // last hour
      reason: "Posted in honeypot channel",
    });

    console.log(`🔨 Banned ${member.user.tag} and deleted recent messages.`);
  } catch (err) {
    console.error("❌ Error processing message event:", err);
  }
});

client.login(TOKEN);
