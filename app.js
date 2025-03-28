const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URL = process.env.MONGO_URL;
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const PORT = 5000;
const userRoutes = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const startCronJob = require("./jobs/cronJob");
app.use(
  cors({
    origin: "https://furniqo.vercel.app",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", adminRoute);

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas", err);
  });

startCronJob();

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
