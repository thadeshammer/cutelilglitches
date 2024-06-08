import path from "path";
import { logger } from "../common/logger.mjs";
import { initializeTwitchChat, viewers } from "../common/twitch_chat.mjs";
import { fileURLToPath } from "url";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

function ensureAuthenticated(req, res, next) {
  /* Stores the protected URL, redirects to auth, then back to that stored URL.
    See "/auth/twitch/callback" route definition for more details.
  */
  if (req.isAuthenticated()) {
    return next();
  }

  // Store the original URL in the session
  req.session.returnTo = req.originalUrl;
  logger.info(`Redirecting from ${req.session.returnTo} to /auth/twitch`);

  // Redirect to authentication route
  res.redirect("/auth/twitch");
}

function setupRoutes(serverApp, passport) {
  /*
      Log all incoming requests
  */
  serverApp.use((req, res, next) => {
    logger.debug(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

  /*
      Unprotected routes
  */
  serverApp.get("/", (req, res) => {
    logger.debug("Root route accessed");
    res.sendFile(path.join(moduleDirectory, "public", "index.html"));
  });

  serverApp.get("/test", (req, res) => {
    logger.debug("Test route accessed");
    res.send("Test route working");
  });

  /*
      Auth routes
  */
  serverApp.get(
    "/auth/twitch",
    (req, res, next) => {
      logger.debug(
        `Twitch auth route accessed, should return to ${req.session.returnTo}`
      );
      next();
    },
    passport.authenticate("twitch", { keepSessionInfo: true })
  );

  serverApp.get(
    "/auth/twitch/callback",
    (req, res, next) => {
      logger.debug("Twitch callback route accessed");
      next();
    },
    passport.authenticate("twitch", {
      keepSessionInfo: true,
      failureRedirect: "/",
    }),
    async (req, res) => {
      const returnTo = req.session.returnTo || "/";
      try {
        const { login, accessToken } = req.user;
        console.log("trying to login chat with channelname: ", login);
        await initializeTwitchChat(login, accessToken);

        logger.debug(`Successful auth to twitch, redirecting to ${returnTo}`);
        res.redirect(returnTo);
      } catch (error) {
        logger.error(`Error initializing Twitch chat: ${error}`);
        res.redirect(returnTo);
      }
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

  /*
      Protected routes
  */
  serverApp.get("/profile", ensureAuthenticated, (req, res) => {
    logger.debug("Profile route accessed");
    if (!req.isAuthenticated()) {
      logger.warn("Twitch user is not authenticated");
      return res.status(401).send("You are not authenticated");
    }
    res.json(req.user);
  });

  serverApp.get("/channelid", ensureAuthenticated, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("You are not authenticated");
    }
    const profile = req.user;
    const channelId = profile.id; // Twitch channel ID
    res.json({ channelId });
  });
}

export { setupRoutes };
