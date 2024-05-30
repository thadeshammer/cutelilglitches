// Electron housing
const { app, BrowserWindow } = require("electron");
const path = require("path");
const express = require("express");
const passport = require("passport");
const TwitchStrategy = require("passport-twitch-new").Strategy;
const session = require("express-session");
const crypto = require("crypto");
const helmet = require("helmet");
const winston = require("winston");
const { format } = require("logform");
const fs = require("fs");

const PORT = 3000;
const HOST = "localhost";

const TWITCH_CLIENT_ID = "hc6bmm49z0zc0hx4tcud4oz1cgpbld";
const TWITCH_CLIENT_SECRET = "dsaoduprxlfdpflihyga30k6ez77kk";
const SESSION_SECRET = crypto.randomBytes(64).toString("hex");
const CALLBACK_URL = `http://${HOST}:${PORT}/auth/twitch/callback`;

// Configure Winston logger
// logs will land in user's app data directory
const logDir = path.join(app.getPath("userData"), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const alignedWithColorsAndTime = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const logger = winston.createLogger({
  level: "debug",
  format: alignedWithColorsAndTime,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// If we're not in production, log to console as well.
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.json(),
    })
  );
}

// Override console methods for imported libs like Phaser.
console.log = (...args) => {
  logger.info(args.join(" "));
};
console.error = (...args) => {
  logger.error(args.join(" "));
};
console.warn = (...args) => {
  logger.warn(args.join(" "));
};
console.info = (...args) => {
  logger.info(args.join(" "));
};

logger.info("Logger ready.");
console.log(`Logger ready. See file at ${logDir}`);

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
      sameSite: "None",
      secure: true, // Ensure this is set to true if you are using HTTPS
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
      // In a real application, you would save the user information in a database
      return done(null, profile);
    }
  )
);

// Serialize user information into the session
passport.serializeUser(function (user, done) {
  done(null, user);
});

// Deserialize user information from the session
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Serve static files from the 'public' directory
serverApp.use(express.static(path.join(__dirname, "public")));

// Define debug route for testing
serverApp.get("/test", (req, res) => {
  logger.log({ level: "debug", message: "Test route accessed" });
  res.send("Test route working");
});

// Define routes
serverApp.get(
  "/auth/twitch",
  (req, res, next) => {
    logger.log({ level: "debug", message: "Twitch auth route accessed" });
    next();
  },
  passport.authenticate("twitch")
);

serverApp.get(
  "/auth/twitch/callback",
  (req, res, next) => {
    logger.log({ level: "debug", message: "Twitch callback route accessed" });
    next();
  },
  passport.authenticate("twitch", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

serverApp.get("/logout", (req, res) => {
  logger.log({ level: "debug", message: "Logout route accessed" });
  req.logout();
  res.redirect("/");
});

serverApp.get("/profile", (req, res) => {
  logger.log({ level: "debug", message: "Profile route accessed" });
  if (!req.isAuthenticated()) {
    return res.status(401).send("You are not authenticated");
  }
  res.json(req.user);
});

// Send the main HTML file when accessing the root URL
serverApp.get("/", (req, res) => {
  logger.log({ level: "debug", message: "Root route accessed" });
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
serverApp.listen(PORT, HOST, () => {
  logger.log({
    level: "debug",
    message: `Server is running at http://${HOST}:${PORT}`,
  });
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
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
