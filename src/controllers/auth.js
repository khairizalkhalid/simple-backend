const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
const { login, refreshToken, logOut } = require("../services/authService");

module.exports = (app) => {
  app.post("/login", async (req, res) => {
    if (process.env.NODE_ENV === "dev") {
      logger.info("/login Request received := " + JSON.stringify(req.body));
    } else {
      logger.info(
        "/login Request received := " +
        JSON.stringify(req.body).replace(
          /"password":"[^"]*"/,
          '"password":"********"'
        )
      );
    }

    const { email, password } = req.body;

    try {
      const result = await login(email, password);
      logger.info("/login Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/refreshToken", async (req, res) => {
    logger.info(
      "/refreshToken Request received := " + JSON.stringify(req.body)
    );
    const { sessionId } = req.body;

    try {
      const result = await refreshToken(sessionId);
      logger.info("/refreshToken Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.put("/logOut/:sessionId", async (req, res) => {
    logger.info("/logOut Request received := " + JSON.stringify(req.params));
    const { sessionId } = req.params;

    try {
      const result = await logOut(sessionId);
      logger.info("/logOut Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};
