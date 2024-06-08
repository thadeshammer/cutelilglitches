import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define the path to the config.json file
const configPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../config.json"
);

// Read the configuration file
const configData = fs.readFileSync(configPath, "utf-8");
const config = JSON.parse(configData);

// Export the configuration values
export const HOST = config.host;
export const PORT = config.port;
