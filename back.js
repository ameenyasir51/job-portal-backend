const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/jobportal")
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB...", err));

  const jobSchema = new mongoose.Schema({
  title: String,
  location: String,
  salary: String
});

const Job = mongoose.model("Job", jobSchema);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Job Portal API running");
});
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find(); 
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data from database" });
  }
});
app.listen(5000, () => {
  console.log("Server running on port 5000")
});