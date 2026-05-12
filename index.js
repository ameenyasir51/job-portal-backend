const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to Shared MongoDB..."))
  .catch(err => console.error("Could not connect to Shared MongoDB...", err));
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  company: { type: String, required: true },
  postedAt: { type: Date, default: Date.now }
});

const Job = mongoose.model("Job", jobSchema);

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: "Pending" },
  appliedAt: { type: Date, default: Date.now }
});

const Application = mongoose.model("Application", applicationSchema);

const app = express();
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
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
// --- MANAGEMENT ROUTES ---
app.get("/api/jobs/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: "Invalid ID format" });
    }
});
app.patch("/api/applications/:id", async (req, res) => {
    try {
        const updatedApp = await Application.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.json(updatedApp);
    } catch (err) {
        res.status(500).json({ message: "Error updating status" });
    }
});
app.delete("/api/applications/:id", async (req, res) => {
    try {
        await Application.findByIdAndDelete(req.params.id);
        res.json({ message: "Application deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting application" });
    }
});

});
app.listen(5000, '0.0.0.0', () => {
  console.log("Server is running on port 5000 and accessible to the network");
});