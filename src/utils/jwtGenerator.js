const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
// Step 1: Install the jsonwebtoken library
// npm install jsonwebtoken node-machine-id
// or
// yarn add jsonwebtoken node-machine-id

// Step 2: Create a function to generate the JWT token

const jwt = require("jsonwebtoken");
const { machineIdSync } = require("node-machine-id");

// Retrieve the machine ID (in a real application, handle errors appropriately)
const secretKey = machineIdSync();

// Function to generate JWT token
const generateToken = (payload) => {
  // Set the expiration time for the token in 15 minutes
  const expirationTime = 15 * 60 * 1000;
  const options = { expiresIn: expirationTime.toString() };

  // Generate the token
  const token = jwt.sign(payload, secretKey);
  return token;
};

const getUserFromToken = (token) => {
  let username = "Unknown";
  try {
    const decoded = jwt.decode(token);
    if (decoded) {
      username = decoded?.username;
    }
    return username;
  } catch (error) {
    logger.error("getUserFromToken: " + error);
    return username;
  }
};

module.exports = { generateToken, getUserFromToken };
