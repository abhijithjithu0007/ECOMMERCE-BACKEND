const cron = require("node-cron");
const axios = require("axios");

const SERVER_URL = process.env.SERVER_URL;

if (!SERVER_URL) {
  throw new Error("SERVER_URL environment variable is not set");
}

const startCronJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log(`Pinging server at ${SERVER_URL}`);
      await axios.get(SERVER_URL);
    } catch (error) {
      console.error("Error pinging server:", error);
    }
  });

  console.log("Keep-alive cron job scheduled every 5 minutes.");
};

module.exports = startCronJob;
