import { contextBridge } from "electron";
import { HOST, PORT } from "../main/config.mjs";

contextBridge.exposeInMainWorld("config", {
  host: HOST,
  port: PORT,
});
