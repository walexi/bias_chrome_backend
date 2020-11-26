// npm packages
const mongoose = require("mongoose");
const { XXHash128 } = require('xxhash-addon');

// app imports
const { APIError } = require("../helpers");

// globals
const Schema = mongoose.Schema;
const harsher = new XXHash128(0)

const feedbackSchema = new Schema({
  text: String,
  hash: String,
  url: String,
  bias_type: String,
  bias_level_predicted: Number,
  bias_level_feedback: Number
});

feedbackSchema.statics = {
  /**
   * Create a Single New Feedback
   * @param {object} newFeedback - an instance of Feedback
   * @returns {Promise<Feedback, APIError>}
   */
  async createFeedback(newFeedback) {
    const hash = harsher.hash(Buffer.from(newReport.text))
    const duplicate = await this.findOne({ hash });
    if (duplicate) {
      // check for collision before throwing error,compare text
      throw new APIError(
        409,
        "Feedback Already Exists",
        `There is already a feedback with name '${newFeedback.text}'.`
      );
    }
    newFeedback.hash = hash
    const feedback = await newFeedback.save();
    return feedback.toObject();
  },
  /**
   * Delete a single Feedback
   * @param {String} name - the Feedback's name
   * @returns {Promise<Feedback, APIError>}
   */
  async deleteFeedback(text) {

    const hash = harsher.hash(Buffer.from(text))
    const deleted = await this.findOneAndRemove({ hash });
    if (!deleted) {
      throw new APIError(404, "Feedback Not Found", `No feedback '${text}' found.`);
    }
    return deleted.toObject();
  },

  /**
   * Get a list of Feedbacks
   * @param {Object} query - pre-formatted query to retrieve feedbacks.
   * @param {Object} fields - a list of fields to select or not in object form
   * @param {String} skip - number of docs to skip (for pagination)
   * @param {String} limit - number of docs to limit by (for pagination)
   * @returns {Promise<Feedbacks, APIError>}
   */
  async readFeedbacks(query, fields, skip, limit) {
    const feedbacks = await this.find(query, fields)
      .skip(skip)
      .limit(limit)
      .exec();
    if (!feedbacks.length) {
      return [];
    }
    return feedbacks.map(feedback => feedback.toObject());
  },
  /**
   * Patch/Update a single Feedback
   * @param {String} name - the Feedback's name
   * @param {Object} feedbackUpdate - the json containing the Feedback attributes
   * @returns {Promise<Feedback, APIError>}
   */
  async updateFeedback(text, feedbackUpdate) {

    const hash = harsher.hash(Buffer.from(text))
    const feedback = await this.findOneAndUpdate({ hash }, feedbackUpdate, {
      new: true
    });
    if (!feedback) {
      throw new APIError(404, "Feedback Not Found", `No feedback '${text}' found.`);
    }
    return feedback.toObject();
  }
};

/* Transform with .toObject to remove __v and _id from response */
if (!feedbackSchema.options.toObject) feedbackSchema.options.toObject = {};
feedbackSchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

/** Ensure MongoDB Indices **/
feedbackSchema.index({ hash: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
