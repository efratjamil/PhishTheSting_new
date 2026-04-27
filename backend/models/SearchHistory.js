const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  message: { type: String, required: true },
  analysis: { type: Object, default: {} },
  textAnalysis: { type: Boolean, default: false },
  matchedWords: { type: [String], default: [] },
  extractedUrls: { type: [String], default: [] },
  urlAnalysis: { type: Boolean, default: false },
  urlThreats: { type: [Object], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SearchHistory", SearchHistorySchema);
