const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema({
  provideName: String,
  ipAdd: String
});


const TextRecordSchema = new mongoose.Schema({
  domainName: String,
  textRecord: String,
  domainVerified: {
    type: Boolean,
    default: false
  },
});
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // index: true,
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    // select: false,
  },
  status: { type: String, enum: ['Active', 'InActive'], default: 'InActive' },
  accountStatus: { type: String, enum: ['Active', 'InActive'], default: 'Active' },
  deleted_user: { type: String, enum: ['Active', 'Deleted'], default: 'Active' },
  providers: [ProviderSchema],
  textRecord: [TextRecordSchema],
  checklist: {
    type: [Boolean],
    default: [],
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "superadmin", "user"],
  },
  secretKey: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
