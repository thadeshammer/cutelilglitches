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
import { fetchViewerList } from "../common/twitch_util.mjs";

dotenv.config();

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDirectory, "../../");

const PORT = 3000;
const HOST = "localhost";

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

// Configure session middleware
serverApp.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: "Lax",
      secure: false, // Ensure this is set to true if you are using HTTPS
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
      scope: "user_read",
    },
    function (accessToken, refreshToken, profile, done) {
      logger.info(`Twitch profile: ${JSON.stringify(profile)}`);
      // In a real application, you would save the user information in a database
      return done(null, profile);
    }
  )
);

// Serialize user information into the session
passport.serializeUser(function (user, done) {
  logger.info(`Serializing user: ${JSON.stringify(user)}`);
  done(null, user);
});

// Deserialize user information from the session
passport.deserializeUser(function (obj, done) {
  logger.info(`Deserializing user: ${JSON.stringify(obj)}`);
  done(null, obj);
});

// Serve static files from the 'public' directory
serverApp.use(express.static(path.join(projectRoot, "public")));

// Define debug route for testing
serverApp.get("/test", (req, res) => {
  logger.debug("Test route accessed");
  res.send("Test route working");
});

// Define routes
serverApp.get(
  "/auth/twitch",
  (req, res, next) => {
    logger.debug("Twitch auth route accessed");
    next();
  },
  passport.authenticate("twitch")
);

serverApp.get(
  "/auth/twitch/callback",
  (req, res, next) => {
    logger.debug("Twitch callback route accessed");
    next();
  },
  passport.authenticate("twitch", { failureRedirect: "/" }),
  (req, res) => {
    logger.debug("Successful auth to twitch, redirecting home.");
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

serverApp.get("/logout", (req, res) => {
  logger.debug("Logout route accessed");
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

serverApp.get("/profile", (req, res) => {
  logger.debug("Profile route accessed");
  if (!req.isAuthenticated()) {
    logger.warn("Twitch user is not authenticated");
    return res.status(401).send("You are not authenticated");
  }
  res.json(req.user);
});

serverApp.get("/channelid", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send("You are not authenticated");
  }
  const profile = req.user;
  const channelId = profile.id; // Twitch channel ID
  res.json({ channelId });
});

serverApp.get("/viewers", async (req, res) => {
  logger.debug("Handing /viewers request");
  if (!req.isAuthenticated()) {
    logger.log("User is not authenticated");
    return res.status(401).send("You are not authenticated");
  }

  try {
    logger.info(`Fetching viewer list for ${req.user.id}`);
    const viewerList = await fetchViewerList(req.user.id);
    res.json(viewerList);
  } catch (error) {
    logger.error("Error fetching viewer list:", error);
    res.status(500).send(error.message);
  }
});

// Send the main HTML file when accessing the root URL
serverApp.get("/", (req, res) => {
  logger.debug("Root route accessed");
  res.sendFile(path.join(moduleDirectory, "public", "index.html"));
});

// Start the server
serverApp.listen(PORT, HOST, () => {
  logger.info(`Server is running at http://${HOST}:${PORT}`);
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(moduleDirectory, "preload.mjs"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(`http://${HOST}:${PORT}`); // Load the URL served by the server
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
