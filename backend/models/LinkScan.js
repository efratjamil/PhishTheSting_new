const mongoose = require("mongoose");

const LinkScanSchema = new mongoose.Schema({
  url: { type: String, required: true },
  domain: { type: String, required: true },
  domainResponse: { type: Object, default: {} },
  linkScore: { type: Number, default: 0 },
  verdict: { type: String, enum: ["safe","caution","suspicious"], default: "safe" },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LinkScan", LinkScanSchema);
