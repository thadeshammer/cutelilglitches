import { fetchViewerList } from "../common/twitch_util.mjs";
import { logger } from "../common/logger.mjs";

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
      Unprotected routes
  */
  serverApp.get("/", (req, res) => {
    // This right here is the browser source target.
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
        `Twitch auth route accessed, should return to ${req.returnTo}`
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
    (req, res) => {
      const returnTo = req.session.returnTo;
      logger.debug(`Successful auth to twitch, redirecting to ${returnTo}`);
      res.redirect(returnTo);
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

  serverApp.get("/viewers", ensureAuthenticated, async (req, res) => {
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
}

export { setupRoutes };
