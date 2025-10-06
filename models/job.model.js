import mongoose from "mongoose";

const salaryRangeSchema = new mongoose.Schema({
  min: { type: Number, required: false },
  max: { type: Number, required: false },
  currency: { type: String, default: "INR" },
  period: { type: String, enum: ["per_month", "per_year", "per_annum", "per_hour"], default: "per_month" }
}, { _id: false });

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true }, // Keep for backward compatibility
    locations: { type: [String], default: [], trim: true }, // New multiple locations field
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: true,
    },

    // better: object with numeric min/max
    salaryRange: { type: salaryRangeSchema, default: {} },

    description: { type: String, required: true, trim: true },

    // arrays instead of single string
    requirements: { type: [String], default: [], trim: true },
    responsibilities: { type: [String], default: [], trim: true },

    applicationDeadline: { type: Date },
    isPublished: { type: Boolean, default: true },

    // useful metadata
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    slug: { type: String, index: true },
    views: { type: Number, default: 0 },
    applicantsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({
  title: "text",
  companyName: "text",
  description: "text",
  location: "text",
  locations: "text",
});

// Compound index for filtering
jobSchema.index({ jobType: 1, location: 1, isPublished: 1 });
jobSchema.index({ jobType: 1, locations: 1, isPublished: 1 });

export default mongoose.model("Job", jobSchema);
