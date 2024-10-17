import mongoose, { Schema } from "mongoose";

const noticeSchema = new Schema(
  {
    team: [{ type: Schema.Types.ObjectId, ref: "User", required: true, }],
    text: { type: String, required: true, trim: true, },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true, },
    notiType: { type: String, default: "alert", enum: ["alert", "message"] },
    isRead: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Notice = mongoose.model("Notice", noticeSchema);

export default Notice;