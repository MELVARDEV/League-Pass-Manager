const mongoose = require("mongoose");

const cacheSchema = new mongoose.Schema({
  jsonString: {
    type: String,
  },
  timeFetched: {
    type: Date,
  },
  gameName: {
    type: String,
  },
  tagLine: {
    type: String,
  },
  endPoint: {
    type: String,
  },
  region: {
    type: String,
  },
  name: { type: String },
});

module.exports = mongoose.model("leagueApiCache", cacheSchema);
