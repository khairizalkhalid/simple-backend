const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
const {
  getGroupList,
  getGroupDetailByGroupId,
  getDefaultMenuList,
  createGroup,
  updateGroup,
  deleteGroup,
} = require("../services/groupMaintenanceService");
const { getUserFromToken } = require("../utils/jwtGenerator");

module.exports = (app) => {
  app.get("/GetGroupList", async (req, res) => {
    logger.info("/GetGroupList Request received");

    try {
      const result = await getGroupList();
      logger.info("/GetGroupList Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/GetGroupDetailByGroupID/:groupId", async (req, res) => {
    logger.info("/GetGroupDetailByGroupID Request received");

    try {
      const result = await getGroupDetailByGroupId(req.params.groupId);
      logger.info(
        "/GetGroupDetailByGroupID Response := " + JSON.stringify(result)
      );
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/GetMenuList", async (req, res) => {
    logger.info("/GetMenuList Request received");

    try {
      const result = await getDefaultMenuList();
      logger.info("/GetMenuList Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/CreateGroup", async (req, res) => {
    try {
      const username = getUserFromToken(
        req.headers.authorization.split(" ")[1]
      );
      logger.info(
        "/CreateGroup Request received username:= " +
          username +
          " - " +
          JSON.stringify(req.body)
      );

      const result = await createGroup(req.body, username);
      logger.info("/CreateGroup Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.put("/UpdateGroup", async (req, res) => {
    try {
      const username = getUserFromToken(
        req.headers.authorization.split(" ")[1]
      );
      logger.info(
        "/UpdateGroup Request received username:= " +
          username +
          " - " +
          JSON.stringify(req.body)
      );
      const result = await updateGroup(req.body, username);
      logger.info("/UpdateGroup Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.delete("/DeleteGroup/:groupId", async (req, res) => {
    try {
      const username = getUserFromToken(
        req.headers.authorization.split(" ")[1]
      );
      logger.info(
        "/DeleteGroup Request received username:= " +
          username +
          " - " +
          JSON.stringify(req.params)
      );
      const result = await deleteGroup(req.params.groupId, username);
      logger.info("/DeleteGroup Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};
