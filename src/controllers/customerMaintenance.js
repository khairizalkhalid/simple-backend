const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

const {
  getCustomerList,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../services/customerMaintenanceService");

const { getUserFromToken } = require("../utils/jwtGenerator");

module.exports = (app) => {
  app.get("/GetCustomerList", async (req, res) => {
    logger.info("/GetCustomerList Request received");

    try {
      const result = await getCustomerList();
      logger.info("/GetCustomerList Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/CreateCustomer", async (req, res) => {
    try {
      const username = getUserFromToken(
        req.headers.authorization.split(" ")[1]
      );
      logger.info(
        "/CreateUser Request received := username " +
          username +
          " - " +
          JSON.stringify(req.body)
      );
      const result = await createCustomer(req.body, username);
      logger.info("/CreateCustomer Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.put("/UpdateCustomer", async (req, res) => {
    try {
      const username = getUserFromToken(
        req.headers.authorization.split(" ")[1]
      );
      logger.info(
        "/UpdateCustomer Request received := username " +
          username +
          " - " +
          JSON.stringify(req.body)
      );
      const result = await updateCustomer(req.body, username);
      logger.info("/UpdateCustomer Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.delete("/DeleteCustomer/:customerId", async (req, res) => {
    try {
      const username = getUserFromToken(
        req.headers.authorization.split(" ")[1]
      );
      logger.info(
        "/DeleteCustomer Request received := username " +
          username +
          " - " +
          JSON.stringify(req.params)
      );
      const result = await deleteCustomer(req.params.customerId, username);
      logger.info("/DeleteCustomer Response := " + JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};
