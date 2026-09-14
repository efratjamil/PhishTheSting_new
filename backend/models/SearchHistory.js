const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  message: { type: String, required: true },
  summary: { type: String, default: "" },
  analysis: { type: Object, default: {} },
  textAnalysis: { type: Boolean, default: false },
  safe: { type: Boolean, default: true },
  status: { type: String, default: "safe" },
  matchedWords: { type: [String], default: [] },
  extractedUrls: { type: [String], default: [] },
  urlAnalysis: { type: Boolean, default: false },
  urlCaution: { type: Boolean, default: false },
  checkedLinks: { type: [Object], default: [] },
  urlThreats: { type: [Object], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SearchHistory", SearchHistorySchema);
