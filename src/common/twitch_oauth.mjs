import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// NOTE My understanding is that I'll eventually run a tiny servlet/lambda that this app will use
// on end-user systems to auth with Twitch. Apparation provided me with sample code and I need to
// dig into those docs.
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
  throw new Error("Missing Twitch client ID or client secret.");
}

let twitchOAuthToken = null;
let twitchTokenExpiry = null;

async function fetchTwitchOAuthToken() {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "chat:read chat:edit channel:read:subscriptions",
    }),
  });

  const data = await response.json();
  if (response.ok) {
    twitchOAuthToken = data.access_token;
    twitchTokenExpiry = Date.now() + data.expires_in * 1000;
  } else {
    throw new Error(`Failed to fetch token: ${data.message}`);
  }
}

async function getTwitchOAuthToken() {
  if (!twitchOAuthToken || Date.now() >= twitchTokenExpiry) {
    await fetchTwitchOAuthToken();
  }
  return twitchOAuthToken;
}

export { getTwitchOAuthToken, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET };
