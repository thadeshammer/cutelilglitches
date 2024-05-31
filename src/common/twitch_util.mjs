import fetch from "node-fetch";

import {
  getTwitchOAuthToken,
  TWITCH_CLIENT_ID,
} from "../common/twitch_oauth.mjs";

async function fetchViewerList(channelId) {
  const oauthToken = await getTwitchOAuthToken();

  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_id=${channelId}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${oauthToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    // Process data to get viewer list if available
  } catch (error) {
    console.error("Error fetching viewer list:", error);
  }
}

export { fetchViewerList };
