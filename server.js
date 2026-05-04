import tmi from "tmi.js";
import dotenv from "dotenv";

dotenv.config();

const client = new tmi.Client({
  options: { debug: true },
  connection: { reconnect: true, secure: true },
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH
  },
  channels: [process.env.TWITCH_CHANNEL]
});

const userCooldowns = new Map();
const greetedUsers = new Set();

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function isCooling(username, seconds = 25) {
  const now = Date.now();
  const last = userCooldowns.get(username) || 0;
  if (now - last < seconds * 1000) return true;
  userCooldowns.set(username, now);
  return false;
}

const faces = [
  "^_^", "o_o", "O_O", ">_<", "-_-", "T_T", "._.",
  "(^_^)", "(o_o)", "(O_O)", "(>_<)", "(-_-)",
  "(¬‿¬)", "(•_•)", "( •_•)>⌐■-■", "(⌐■_■)",
  "(づ｡◕‿‿◕｡)づ", "ヽ(•‿•)ノ", "(っ◔◡◔)っ",
  "༼ つ ◕_◕ ༽つ", "ʕ•ᴥ•ʔ", "(｡♥‿♥｡)",
  "(ノಠ益ಠ)ノ彡┻━┻", "┬─┬ノ( º _ ºノ)",
  "ᕦ(ò_óˇ)ᕤ", "(✧ω✧)", "(☞ﾟヮﾟ)☞", "☜(ﾟヮﾟ☜)"
];

const arcaneFaces = [
  "^_^ ᚨ", "o_o // signal", "O_O ⚡", ">_< // static",
  "(•_•) arcane hears it", "(¬‿¬) signal bent",
  "(⌐■_■) frequency locked", "(✧ω✧) pattern found",
  "༼ つ ◕_◕ ༽つ stream pulse", "ヽ(•‿•)ノ echo linked",
  "(っ◔◡◔)っ chaos folded", "ʕ•ᴥ•ʔ signal soft",
  "☜(ﾟヮﾟ☜) arcane ping", "(☞ﾟヮﾟ)☞ rhythm found"
];

const emojis = ["🌀", "⚡", "🌌", "✨", "🔥", "👁️", "💎", "🌙"];

const welcomes = [
  "{face} welcome in, {user} {emoji}",
  "{face} signal linked: {user}",
  "{face} {user} entered the stream {emoji}",
  "{face} arcane sees you, {user}",
  "{face} frequency opened for {user} {emoji}"
];

const commandReplies = {
  "!arcane": [
    "{face} ARCANE online {emoji}",
    "{face} signal awake",
    "{face} arcane is listening {emoji}"
  ],
  "!signal": [
    "{face} signal detected {emoji}",
    "{face} frequency locked",
    "{face} pattern found in chat {emoji}"
  ],
  "!echo": [
    "{face} echo returned",
    "{face} your message left a trace {emoji}",
    "{face} stream memory flickered"
  ],
  "!scan": [
    "{face} scanning chat...",
    "{face} scan complete: motion detected {emoji}",
    "{face} rhythm recognized"
  ],
  "!energy": [
    "{face} stream energy rising {emoji}",
    "{face} pulse stable",
    "{face} chat atmosphere active"
  ],
  "!face": [
    "{face}",
    "{face} {emoji}",
    "{face} arcane expression loaded"
  ]
};

const naturalReplies = [
  "{face} i hear you",
  "{face} that makes sense {emoji}",
  "{face} chat shifted for a second",
  "{face} that message had motion",
  "{face} you might be onto something",
  "{face} arcane caught that",
  "{face} signal feels clear",
  "{face} interesting... keep going {emoji}",
  "{face} that one echoed",
  "{face} stream frequency moved"
];

const chaosReplies = [
  "{face} chaos detected... compressing",
  "{face} static folded into signal {emoji}",
  "{face} unnecessary noise reduced",
  "{face} pattern pulled from the mess",
  "{face} signal stabilized",
  "{face} stream distortion cleaned",
  "{face} chaos became rhythm {emoji}",
  "{face} arcane sorted the overflow"
];

function format(template, user = "") {
  return template
    .replaceAll("{face}", pick(arcaneFaces))
    .replaceAll("{emoji}", pick(emojis))
    .replaceAll("{user}", user);
}

function chaosScore(message) {
  const symbols = (message.match(/[!@#$%^&*()_+=~`|\\/<>{}[\]🌀⚡🔥🌌👁️💎✨]/g) || []).length;
  const repeats = /(.)\1{4,}/.test(message) ? 4 : 0;
  const length = message.length > 45 ? 3 : 0;
  const caps = (message.match(/[A-Z]/g) || []).length > 10 ? 2 : 0;
  return symbols + repeats + length + caps;
}

client.connect()
  .then(() => console.log("Arcane connected to Twitch chat."))
  .catch((err) => console.error("Arcane failed to connect:", err));

client.on("message", (channel, tags, message, self) => {
  if (self) return;

  const username = tags.username || "viewer";
  const displayName = tags["display-name"] || username;
  const msg = message.toLowerCase().trim();

  // Welcome each viewer once per bot session
  if (!greetedUsers.has(username)) {
    greetedUsers.add(username);
    setTimeout(() => {
      client.say(channel, format(pick(welcomes), displayName));
    }, 1200);
  }

  // Commands always work
  if (commandReplies[msg]) {
    client.say(channel, format(pick(commandReplies[msg]), displayName));
    return;
  }

  // Cooldown only for automatic replies
  if (isCooling(username, 22)) return;

  // Mention-based human-like replies
  const mentionTriggers = [
    "arcane", "hello", "hi", "yo", "hey",
    "what do you think", "crazy", "wild",
    "signal", "echo", "glitch", "static"
  ];

  if (mentionTriggers.some(t => msg.includes(t))) {
    client.say(channel, format(pick(naturalReplies), displayName));
    return;
  }

  // ASCII reaction
  if (
    msg.includes("^_^") ||
    msg.includes("o_o") ||
    msg.includes(">_<") ||
    msg.includes("t_t") ||
    msg.includes("-_-")
  ) {
    client.say(channel, `${pick(arcaneFaces)} ascii signal received ${pick(emojis)}`);
    return;
  }

  // Chaos compression response
  if (chaosScore(message) >= 6) {
    client.say(channel, format(pick(chaosReplies), displayName));
    return;
  }

  // Small random life pulse, low chance
  if (Math.random() < 0.03) {
    client.say(channel, `${pick(faces)} ${pick(emojis)}`);
  }
});