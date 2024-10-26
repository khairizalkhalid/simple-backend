const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
const {
  getUserList,
  getUserDetailByPfNumber,
  getUserDetailByUserId,
  createUser,
  updateUser,
  deleteUser,
} = require("../services/userMaintenanceService");
const { getUserFromToken } = require("../utils/jwtGenerator");

module.exports = (app) => {
  app.get("/getAllUser", async (req, res) => {
    logger.info("/getAllUser Request received");

    try {
      const result = await getUserList();
      logger.info("/getAllUser Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/SearchUserFromAD/:pfNumber", async (req, res) => {
    logger.info("/SearchUserFromAD Request received");

    try {
      const result = await getUserDetailByPfNumber(req.params.pfNumber);
      logger.info("/SearchUserFromAD Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/GetUserDetailByUserID/:userId", async (req, res) => {
    logger.info("/GetUserDetailByUserID Request received");

    try {
      const result = await getUserDetailByUserId(req.params.userId);
      logger.info(
        "/GetUserDetailByUserID Response := " + JSON.stringify(result)
      );
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/CreateUser", async (req, res) => {
    try {
      const username = getUserFromToken(
        req.headers.authorization.split(" ")[1]
      );
      logger.info(
        "/CreateUser Request received := username " +
          username +
          " - " +
          JSON.stringify(req.body).replace(
            /"newPassword":"[^"]*"/,
            '"newPassword":"********"'
          )
      );
      const result = await createUser(req.body, username);
      logger.info("/CreateUser Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.put("/UpdateUser", async (req, res) => {
    try {
      const { userId, username } = getUserFromToken(
        req.headers.authorization.split(" ")[1]
      );
      logger.info(
        "/UpdateUser Request received := userId " +
          userId +
          " - username:= " +
          username +
          " - " +
          JSON.stringify(req.body)
            .replace(/"newPassword":"[^"]*"/, '"newPassword":"********"')
            .replace(
              /"currentPassword":"[^"]*"/,
              '"currentPassword":"********"'
            )
      );

      const result = await updateUser(req.body, userId, username);
      logger.info("/UpdateUser Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.delete("/DeleteUser/:userId", async (req, res) => {
    try {
      const username = getUserFromToken(
        req.headers.authorization.split(" ")[1]
      );
      logger.info(
        "/DeleteUser Request received := username " +
          username +
          " - " +
          JSON.stringify(req.params)
      );
      const result = await deleteUser(req.params.userId, username);
      logger.info("/DeleteUser Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};
