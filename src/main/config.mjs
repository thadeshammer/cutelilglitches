import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

// Define the path to the config.yaml file
const configPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../config.yaml"
);

// Read the configuration file
const configData = fs.readFileSync(configPath, "utf-8");
const config = yaml.load(configData);

// Export the configuration values
export const HOST = config.host;
export const PORT = config.port;
