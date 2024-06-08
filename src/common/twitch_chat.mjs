import tmi from "tmi.js";

import { logger } from "../common/logger.mjs";

let viewers = new Set();
let chatters = new Set();
let client;

async function initializeTwitchChat(channelName, accessToken) {
  /*
    https://github.com/tmijs/tmi.js

    This hasn't been updated in two years but is still working; I have mixed feelings about that.
  */
  if (!client) {
    try {
      logger.debug(`Connecting to Twitch chat with username: ${channelName}.`);

      client = new tmi.Client({
        options: { debug: false }, // Set to true for additional logging if chat gets weird
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
          logger.debug(`${username} joined the chat`);
        }
      });

      client.on("part", (channel, username, self) => {
        if (!self) {
          viewers.delete(username);
          logger.debug(`${username} left the chat`);
        }
      });

      client.on("chat", (channel, userstate, message, self) => {
        if (!self) {
          chatters.add(userstate.username);
          logger.debug(`[${userstate.username}] ${message}`);
        }
      });

      client.on("connected", (address, port) => {
        logger.debug(`Connected to ${address}:${port}`);
      });

      client.on("disconnected", (reason) => {
        logger.debug(`Disconnected: ${reason}`);
      });

      client.on("error", (err) => {
        logger.error(`TMI Client Error: ${err.message}`);
      });
    } catch (error) {
      logger.error("Error initializing Twitch chat:", error);
    }
  } else {
    log.console.warn("Tried to init chat more than once.");
  }
}

export { initializeTwitchChat, viewers };
