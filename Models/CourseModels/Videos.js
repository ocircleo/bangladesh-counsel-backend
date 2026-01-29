const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    /* ---------- Identity ---------- */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    /* ---------- Ownership / Access ---------- */

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      index: true,
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    /* ---------- Storage (CRITICAL) ---------- */
    storage: {
      provider: {
        type: String,
        enum: ["cloudflare-r2"],
        default: "cloudflare-r2",
      },

      // Directory only — NEVER a full URL
      basePath: {
        type: String,
        required: true,
        unique: true,
        index: true,
        example: "videos/course-42/lesson-3",
      },

      manifest: {
        type: String,
        default: "master.m3u8",
      },
    },

    /* ---------- Encoding Metadata ---------- */
    playback: {
      durationSeconds: {
        type: Number,
        required: true,
      },

      resolutions: [
        {
          label: {
            type: String,
            enum: ["360p", "480p", "720p", "1080p", "1440p", "2160p"],
          },
          bitrateKbps: Number,
          codec: {
            type: String,
            enum: ["h264", "vp9", "av1"],
            default: "h264",
          },
        },
      ],

      audioCodec: {
        type: String,
        enum: ["aac", "opus"],
        default: "aac",
      },

      segmentDuration: {
        type: Number,
        default: 4,
      },
    },

    /* ---------- Status Tracking ---------- */
    status: {
      type: String,
      enum: ["uploaded", "processing", "ready", "failed"],
      default: "uploaded",
      index: true,
    },

    processingError: {
      type: String,
      default: null,
    },

    /* ---------- Integrity ---------- */
    checksum: {
      type: String,
      required: true,
      comment: "SHA-256 of original upload",
    },

    fileSizeBytes: {
      type: Number,
      required: true,
    },

    /* ---------- Audit ---------- */
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

const Videos = mongoose.model("Videos", VideoSchema);
module.exports = { Videos };





