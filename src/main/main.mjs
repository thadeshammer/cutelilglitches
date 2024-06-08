// Electron housing
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { app, BrowserWindow } from "electron";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import passport from "passport";
import { Strategy as TwitchStrategy } from "passport-twitch-new";

import { logger, loggingDirectory } from "../common/logger.mjs";
import {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
} from "../common/twitch_oauth.mjs";
import { setupRoutes } from "./routes.mjs";
import { HOST, PORT } from "./config.mjs";

dotenv.config();

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDirectory, "../../");
const SESSION_SECRET = crypto.randomBytes(64).toString("hex");
const CALLBACK_URL = `http://${HOST}:${PORT}/auth/twitch/callback`;

logger.info(`Logger ready. Logs are in ${loggingDirectory}`);

// Create the Express app
const serverApp = express();

serverApp.use(helmet());

// Adjust CSP settings to allow Twitch
serverApp.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://id.twitch.tv",
        "https://static.twitchcdn.net",
        "'unsafe-inline'",
      ],
      connectSrc: ["'self'", "https://id.twitch.tv", "https://api.twitch.tv"],
      imgSrc: ["'self'", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["https://id.twitch.tv"], // Allow frames from Twitch for authentication
    },
  })
);

// Serve static files from the '/public' directory
serverApp.use(express.static(path.join(projectRoot, "public")));

// Log all requests for debugging
serverApp.use((req, res, next) => {
  logger.debug(`Request URL: ${req.url}`);
  next();
});

// Configure session middleware
serverApp.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: "Lax",
      secure: false,
    },
  })
);

// Initialize Passport and restore authentication state, if any, from the session
serverApp.use(passport.initialize());
serverApp.use(passport.session());

// Configure Passport to use the Twitch strategy
passport.use(
  new TwitchStrategy(
    {
      clientID: TWITCH_CLIENT_ID,
      clientSecret: TWITCH_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: "user_read chat:read chat:edit channel:read:subscriptions",
    },
    function (accessToken, refreshToken, profile, done) {
      logger.info(`Twitch profile: ${JSON.stringify(profile)}`);
      profile.accessToken = accessToken; // Store accessToken in the profile
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  logger.debug(`Serializing user: ${JSON.stringify(user)}`);
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  logger.debug(`Deserializing user: ${JSON.stringify(obj)}`);
  done(null, obj);
});

setupRoutes(serverApp, passport);

// Start the server
serverApp.listen(PORT, HOST, () => {
  logger.info(`Server is running at http://${HOST}:${PORT}`);
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(moduleDirectory, "../renderer/preload.mjs"),
      nodeIntegration: true,
      contextIsolation: true, // TODO what is this? I seem to need it
    },
    icon: path.join(projectRoot, "public/favicon.ico"),
  });

  mainWindow.loadFile(path.join(projectRoot, "public", "display.html"));

  mainWindow.on("closed", function () {
    app.quit();
  });
}

app.on("ready", () => {
  createWindow();
});

app.on("window-all-closed", function () {
  app.quit();
});
