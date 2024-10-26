const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

const events = require("events");
events.EventEmitter.defaultMaxListeners = 20;

const express = require("express");
const app = express();
const cors = require("cors");
const auth = require("./controllers/auth");
const userMaintenance = require("./controllers/userMaintenance");
const groupMaintenance = require("./controllers/groupMaintenance");
const customerMaintenance = require("./controllers/customerMaintenance");
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

app.use(express.json());

auth(app);
userMaintenance(app);
groupMaintenance(app);
customerMaintenance(app);

app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
