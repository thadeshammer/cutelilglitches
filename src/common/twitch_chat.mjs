import tmi from "tmi.js";
import { getTwitchOAuthToken } from "./twitch_oauth.mjs"; // Adjust the path as needed

let viewers = new Set();

async function initializeTwitchChat(channelName, accessToken) {
  try {
    console.log(`Connecting to Twitch chat with username: ${channelName}.`);

    const client = new tmi.Client({
      options: { debug: true },
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: channelName,
        password: `oauth:${accessToken}`,
      },
      channels: [channelName],
    });

    await client.connect().catch((err) => {
      console.error("Error connecting to Twitch chat:", err);
    });

    client.on("join", (channel, username, self) => {
      if (!self) {
        viewers.add(username);
        console.log(`${username} joined the chat`);
      }
    });

    client.on("part", (channel, username, self) => {
      if (!self) {
        viewers.delete(username);
        console.log(`${username} left the chat`);
      }
    });

    client.on("chat", (channel, userstate, message, self) => {
      if (self) return;
      console.log(`[${userstate.username}] ${message}`);
    });

    client.on("connected", (address, port) => {
      console.log(`Connected to ${address}:${port}`);
    });

    client.on("disconnected", (reason) => {
      console.log(`Disconnected: ${reason}`);
    });

    client.on("error", (err) => {
      console.error(`TMI Client Error: ${err.message}`);
    });
  } catch (error) {
    console.error("Error initializing Twitch chat:", error);
  }
}

export { initializeTwitchChat, viewers };
