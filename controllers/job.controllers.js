import mongoose from "mongoose";
import Job from "../models/job.model.js";

// Escape user-provided strings for safe use in RegExp
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Create Job
export const createJob = async (req, res) => {
  try {
    // require admin role
    const user = req.user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const {
      title,
      companyName,
      location,
      locations, // New multiple locations field
      jobType,
      salaryRange,
      description,
      requirements,
      responsibilities,
      applicationDeadline,
      isPublished = true,
    } = req.body;

    // Basic validation
    if (!title || !companyName || !jobType || !description) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // Validate that either location or locations is provided
    if (!location && (!locations || locations.length === 0)) {
      return res.status(400).json({ message: "At least one location is required." });
    }

    // Create new job document
    const newJob = new Job({
      title,
      companyName,
      location: location || (locations && locations.length > 0 ? locations[0] : ""), // Primary location
      locations: locations || (location ? [location] : []), // Multiple locations
      jobType,
      salaryRange,
      description,
      requirements,
      responsibilities,
      applicationDeadline,
      isPublished,
      createdBy: user.id,
    });

    // Save to DB
    const savedJob = await newJob.save();

    // Respond to client
    res.status(201).json({
      message: "Job created successfully",
      job: savedJob,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getAllJobs = async (req, res) => {
  const { search, jobType, location, minSalary, maxSalary, remote } = req.query;

  const filter = { isPublished: true };

  if (search) {
    const term = String(search).trim();
    if (term) {
      const safe = escapeRegex(term);
      const regex = new RegExp(safe, "i");
      // Flexible search across multiple fields; also works if text index isn't present
      filter.$or = [
        { title: { $regex: regex } },
        { companyName: { $regex: regex } },
        { description: { $regex: regex } },
        { location: { $regex: regex } },
        { jobType: { $regex: regex } },
        { requirements: { $regex: regex } },
        { responsibilities: { $regex: regex } },
      ];
    }
  }
  if (jobType) {
    // Build a tolerant regex ignoring separators (space, hyphen, underscore)
    const raw = String(jobType).trim();
    const compact = raw.replace(/[-_\s]+/g, "");
    const chars = Array.from(compact).map(ch => escapeRegex(ch));
    const between = "[-_\\s]*"; // zero or more separators between characters
    const pattern = `^${chars.join(between)}$`;
    filter.jobType = { $regex: new RegExp(pattern, "i") };
  }
  if (location) {
    // Case-insensitive match ignoring separators
    const rawLoc = String(location).trim();
    const compactLoc = rawLoc.replace(/[-_\s]+/g, "");
    const charsLoc = Array.from(compactLoc).map(ch => escapeRegex(ch));
    const betweenLoc = "[-_\\s]*";
    const patternLoc = `^${charsLoc.join(betweenLoc)}$`;
    filter.location = { $regex: new RegExp(patternLoc, "i") };
  }
  if (remote === 'true') {
    filter.location = /remote/i;
  }

  // Salary range filtering
  // Desired behavior:
  // - If only min provided → show jobs whose range reaches or exceeds min (overlap on the right)
  // - If only max provided → show jobs whose range starts at or below max (overlap on the left)
  // - If both provided → show any jobs whose [min,max] overlaps user range [minSalary,maxSalary]
  const min = Number(minSalary);
  const max = Number(maxSalary);
  const hasMin = !Number.isNaN(min);
  const hasMax = !Number.isNaN(max);

  if (hasMin && hasMax) {
    // Overlap condition: job.min <= user.max AND job.max >= user.min
    const overlapClauses = [
      { $or: [
        { "salaryRange.min": { $lte: max } },
        { "salaryRange.min": { $exists: false } },
      ]},
      { $or: [
        { "salaryRange.max": { $gte: min } },
        { "salaryRange.max": { $exists: false } },
      ]},
    ];
    filter.$and = (filter.$and || []).concat(overlapClauses);
  } else if (hasMin) {
    // Any job whose max is >= min, or min itself is >= min (lenient), or missing max
    const rightSideClauses = [
      { "salaryRange.max": { $gte: min } },
      { "salaryRange.min": { $gte: min } },
      { "salaryRange.max": { $exists: false } },
    ];
    filter.$and = (filter.$and || []).concat([{ $or: rightSideClauses }]);
  } else if (hasMax) {
    // Any job whose min is <= max, or max itself is <= max (lenient), or missing min
    const leftSideClauses = [
      { "salaryRange.min": { $lte: max } },
      { "salaryRange.max": { $lte: max } },
      { "salaryRange.min": { $exists: false } },
    ];
    filter.$and = (filter.$and || []).concat([{ $or: leftSideClauses }]);
  }

  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .select("-__v");
  return res.status(200).json({ success: true, count: jobs.length, jobs });
};

export const getJobById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid job id" });
  }
  const job = await Job.findById(id).select("-__v");
  if (!job) return res.status(404).json({ success: false, message: "Job not found" });
  return res.status(200).json({ success: true, job });
};


export const updateJob = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid job id" });
  }

  // whitelist allowed update fields
  const allowed = [
    "title","companyName","location","jobType","salaryRange",
    "description","requirements","responsibilities","applicationDeadline","isPublished"
  ];

  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
  }

  const updated = await Job.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select("-__v");
  if (!updated) return res.status(404).json({ success: false, message: "Job not found" });

  return res.status(200).json({ success: true, job: updated });
};


export const deleteJob = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid job id" });
  }

  const job = await Job.findById(id);
  if (!job) return res.status(404).json({ success: false, message: "Job not found" });

  await job.remove();
  return res.status(200).json({ success: true, message: "Job deleted" });
};