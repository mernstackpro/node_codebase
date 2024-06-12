const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String },
  linkText: { type: String },
  templateType: { type: String },
  backgroundColor: { type: String },
  logo: { type: String, required: true },
  landingContent: { type: String },
  landingBgColor: { type: String },
});

const Template = mongoose.model("Template", templateSchema);

module.exports = Template;
