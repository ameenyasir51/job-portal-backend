const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to Shared MongoDB..."))
  .catch(err => console.error("Could not connect to Shared MongoDB...", err));
const jobSchema = new mongoose.Schema({
  title: String,
  location: String,
  salary: String,
  company: String
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
    const { title, location } = req.query;
    let query = {};
    if (location) {
      query.location = { $regex: location, $options: "i" }; 
    }

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    const jobs = await Job.find(query);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data from database" });
  }
});
app.post("/api/jobs", async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
   res.status(201).json({ message: "Job Published Successfully!", job: newJob });
  } catch (err) {
    res.status(400).json({ message: "Error saving job to database" });
  }
});

app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting job" });
  }
});

app.put("/api/jobs/:id", async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: "Error updating job" });
  }
});
app.listen(5000, '0.0.0.0', () => {
  console.log("Server is running on port 5000 and accessible to the network");
});