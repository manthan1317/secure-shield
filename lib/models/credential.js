import mongoose from "mongoose";

// Define the credential schema
const credentialSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["password", "credit/debit", "crypto", "note"],
    },
    title: {
      type: String,
      required: true,
    },
    encryptedData: {
      type: String,
      required: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create or retrieve the model
export const Credential =
  mongoose.models.Credential || mongoose.model("Credential", credentialSchema);
