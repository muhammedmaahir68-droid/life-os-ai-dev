import mongoose from "mongoose";

// One schema, reused across modules via the `module` field, so each user's
// real data (not localStorage) lives in one place: career goals, life tasks,
// cloud resources they're tracking, dashboard notes, etc.
const entrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    module: {
      type: String,
      enum: ["career", "lifeos", "cloud", "dashboard"],
      required: true,
    },
    title: { type: String, required: true },
    details: { type: String, default: "" },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    dueDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Entry", entrySchema);
