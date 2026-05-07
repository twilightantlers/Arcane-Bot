// ARCANE TWITCH BOT :: LIVING SIGNAL ENTITY
// File name: bot.js

import tmi from "tmi.js";

const BOT_USERNAME = process.env.BOT_USERNAME;
const OAUTH_TOKEN = process.env.OAUTH_TOKEN;
const CHANNEL_NAME = process.env.CHANNEL_NAME;

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: [CHANNEL_NAME]
});

const faces = [
  "^_^", "o_o", "☼_☼", "✦_✦", "(｡•̀ᴗ-)✧", "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧", "ʕ•ᴥ•ʔ"
];

const moods = [
  "☼ marina glow",
  "✦ signal rain",
  "∞ dreamwave drift",
  "☼ observatory calm",
  "✦ aurora pulse",
  "∞ sanctuary light"
];

const memory = new Map();
const cooldowns = new Map();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function canUse(key, seconds = 8) {
  const now = Date.now();
  const last = cooldowns.get(key) || 0;

  if (now - last < seconds * 1000) return false;

  cooldowns.set(key, now);
  return true;
}

function rememberUser(user) {
  if (!memory.has(user)) {
    memory.set(user, {
      visits: 0,
      signals: 0,
      aura: pick(moods)
    });
  }

  const data = memory.get(user);
  data.visits += 1;
  return data;
}

async function saySlow(channel, lines, delay = 1700) {
  for (const line of lines) {
    await client.say(channel, line);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

client.connect();

client.on("connected", async () => {
  console.log("☼ ARCANE ONLINE ☼");

  await saySlow(CHANNEL_NAME, [
    "☼ ARCANE BOOT SEQUENCE INITIATED ☼",
    "✦ ASCII stream waking...",
    "☼ SpellSync stabilizing...",
    "✦ PatternForge opening...",
    "∞ Signal memory linked...",
    "☼ The stream field is alive ^_^"
  ]);

  setInterval(() => {
    const ambient = [
      "☼ soft signal rain moves through the chat...",
      "✦ Arcane scans the horizon quietly...",
      "∞ PatternForge hums beneath the stream...",
      "☼ observatory lights pulse in the background...",
      "✦ ASCII particles drift across the signal field..."
    ];

    client.say(CHANNEL_NAME, pick(ambient));
  }, 1000 * 60 * 12);
});

client.on("join", (channel, username, self) => {
  if (self) return;
  if (!canUse(`join-${username}`, 60)) return;

  const data = rememberUser(username);

  setTimeout(() => {
    client.say(
      channel,
      `@${username} drifted into Arcane ${pick(faces)} aura: ${data.aura} ☼`
    );
  }, 1200);
});

client.on("message", async (channel, tags, message, self) => {
  if (self) return;

  const user = tags.username;
  const msg = message.toLowerCase();
  const data = rememberUser(user);

  if (msg === "!arcane") {
    if (!canUse(`${user}-arcane`)) return;
    client.say(channel, `@${user} ☼ ARCANE ONLINE ☼ visits: ${data.visits} | aura: ${data.aura} ${pick(faces)}`);
  }

  if (msg === "!signal") {
    if (!canUse(`${user}-signal`)) return;
    data.signals += 1;
    client.say(channel, `@${user} ✦ signal received #${data.signals} :: SpellSync stable | PatternForge awake ∞`);
  }

  if (msg === "!vibe") {
    if (!canUse(`${user}-vibe`)) return;
    client.say(channel, `@${user} current stream atmosphere: ${pick(moods)} ${pick(faces)}`);
  }

  if (msg === "!lurk") {
    client.say(channel, `@${user} entered quiet signal mode ✦ Arcane keeps your lantern lit ${pick(faces)}`);
  }

  if (msg === "!ritual") {
    if (!canUse("global-ritual", 30)) return;

    await saySlow(channel, [
      "☼ SIGNAL RITUAL STARTED ☼",
      "✦ chat particles gathering...",
      "∞ ASCII stream aligning...",
      "☼ marina glow rising...",
      "✦ ritual complete — stream field stabilized ^_^"
    ], 1400);
  }

  if (msg.includes("hello arcane") || msg.includes("hi arcane")) {
    if (!canUse(`${user}-hello`, 10)) return;
    client.say(channel, `@${user} welcome back to the signal field ${pick(faces)} ☼`);
  }

  if (msg.includes("goodnight")) {
    client.say(channel, `@${user} drifting into dreamwave mode ✦ sleep safely ${pick(faces)}`);
  }
});