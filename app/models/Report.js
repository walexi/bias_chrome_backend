// npm packages
const mongoose = require("mongoose");
const { XXHash128 } = require('xxhash-addon');

// app imports
const { APIError } = require("../helpers");

// globals
const Schema = mongoose.Schema;
const harsher = new XXHash128(0)


const reportSchema = new Schema({
  text: String,
  hash: String,
  url: String,
  bias_type: String,
  bias_level: Number
});

reportSchema.statics = {
  /**
   * Create a Single New Report
   * @param {object} newReport - an instance of Report
   * @returns {Promise<Report, APIError>}
   */
  async createReport(newReport) {
    const hash = harsher.hash(Buffer.from(newReport.text))
    const duplicate = await this.findOne({ hash });
    if (duplicate) {
      //check for hash collision here, 2 different string with the same hash
      throw new APIError(
        409,
        "Report Already Exists",
        `There is already a report with name '${newReport.text}'`
      );
    }
    newReport.hash = hash
    const report = await newReport.save();
    return report.toObject();
  },
  /**
   * Delete a single Report
   * @param {String} text - the Report
   * @returns {Promise<Report, APIError>}
   */
  async deleteReport(text) {
    const hash = harsher.hash(Buffer.from(text))

    const deleted = await this.findOneAndRemove({ hash });
    if (!deleted) {
      throw new APIError(404, "Report Not Found", `No report '${text}' found.`);
    }
    return deleted.toObject();
  },

  /**
   * Get a list of Reports
   * @param {Object} query - pre-formatted query to retrieve reports.
   * @param {Object} fields - a list of fields to select or not in object form
   * @param {String} skip - number of docs to skip (for pagination)
   * @param {String} limit - number of docs to limit by (for pagination)
   * @returns {Promise<Reports, APIError>}
   */
  async readReports(query, fields, skip, limit) {
    const reports = await this.find(query, fields)
      .skip(skip)
      .limit(limit)
      .exec();
    if (!reports.length) {
      return [];
    }
    return reports.map(report => report.toObject());
  },
  /**
   * Patch/Update a single Report
   * @param {String} text - the Report's text
   * @param {Object} reportUpdate - the json containing the Report attributes
   * @returns {Promise<Report, APIError>}
   */
  async updateReport(text, reportUpdate) {
    const hash = harsher.hash(Buffer.from(text))

    const report = await this.findOneAndUpdate({ hash }, reportUpdate, {
      new: true
    });
    if (!report) {
      throw new APIError(404, "Report Not Found", `No report '${text}' found.`);
    }
    return report.toObject();
  }
};

/* Transform with .toObject to remove __v and _id from response */
if (!reportSchema.options.toObject) reportSchema.options.toObject = {};
reportSchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

/** Ensure MongoDB Indices **/
reportSchema.index({ hash: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);
