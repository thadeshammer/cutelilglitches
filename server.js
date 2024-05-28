// TODO "File is a CommonJS module; it may be converted to an ES module."
const express = require("express");
const path = require("path");
const passport = require("passport");
const TwitchStrategy = require("passport-twitch-new").Strategy;
const session = require("express-session");
const crypto = require("crypto");
const helmet = require("helmet");

const app = express();
const PORT = 3000;
const HOST = "localhost";

const TWITCH_CLIENT_ID = "hc6bmm49z0zc0hx4tcud4oz1cgpbld";
const TWITCH_CLIENT_SECRET = "dsaoduprxlfdpflihyga30k6ez77kk";
const SESSION_SECRET = crypto.randomBytes(64).toString("hex");
const CALLBACK_URL = `http://${HOST}:${PORT}/auth/twitch/callback`;

app.use(helmet());

// Adjust CSP settings to allow Twitch
// blob: was necessary for phaser image loading once it was moved to public/lib
app.use(
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
app.use(
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
app.use(passport.initialize());
app.use(passport.session());

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
      // For this example, we are just passing the profile information
      // TODO I should probably do this so the user doesn't have to login every app restart.
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
app.use(express.static(path.join(__dirname, "public")));

// Define debug route for testing
app.get("/test", (req, res) => {
  console.log("Test route accessed");
  res.send("Test route working");
});

// Define routes
app.get(
  "/auth/twitch",
  (req, res, next) => {
    console.log("Twitch auth route accessed");
    next();
  },
  passport.authenticate("twitch")
);

app.get(
  "/auth/twitch/callback",
  (req, res, next) => {
    console.log("Twitch callback route accessed");
    next();
  },
  passport.authenticate("twitch", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  console.log("Logout route accessed");
  req.logout();
  res.redirect("/");
});

app.get("/profile", (req, res) => {
  console.log("Profile route accessed");
  if (!req.isAuthenticated()) {
    return res.status(401).send("You are not authenticated");
  }
  res.json(req.user);
});

// Send the main HTML file when accessing the root URL
app.get("/", (req, res) => {
  console.log("Root route accessed");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
