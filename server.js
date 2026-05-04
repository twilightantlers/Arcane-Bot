import tmi from "tmi.js";
import dotenv from "dotenv";

dotenv.config();

const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH
  },
  channels: [process.env.TWITCH_CHANNEL]
});

client.connect();

client.on("message", (channel, tags, message, self) => {
  if (self) return;

  const msg = message.toLowerCase();

  if (msg === "!arcane") {
    client.say(channel, "ARCANE ∞ online 🌀");
  }

  if (msg === "!signal") {
    client.say(channel, "signal detected ⚡");
  }

  if (msg === "!portal") {
    client.say(channel, "portal shimmer active 🌌");
  }

  if (message.length > 10 && /[^\w\s]/.test(message)) {
    client.say(channel, "chaos translated...");
  }
});