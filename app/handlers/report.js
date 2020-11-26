// npm packages
const { validate } = require("jsonschema");

// app imports
const { Report } = require("../models");
const { APIError, parseSkipLimit } = require("../helpers");
const { report } = require("../schemas");

/**
 * Validate the POST request body and create a new Report
 */
async function createReport(request, response, next) {
  const validation = validate(request.body, report);
  if (!validation.valid) {
    return next(
      new APIError(
        400,
        "Bad Request",
        validation.errors.map(e => e.stack).join(". ")
      )
    );
  }

  try {
    const newReport = await Report.createReport(new Report(request.body));
    return response.status(201).json(newReport);
  } catch (err) {
    return next(err);
  }
}


/**
 * List all the reports. Query params ?skip=0&limit=1000 by default
 */
async function readReports(request, response, next) {
  /* pagination validation */
  let skip = parseSkipLimit(request.query.skip) || 0;
  let limit = parseSkipLimit(request.query.limit, 1000) || 1000;
  if (skip instanceof APIError) {
    return next(skip);
  } else if (limit instanceof APIError) {
    return next(limit);
  }

  try {
    const reports = await Report.readReports({}, {}, skip, limit);
    return response.json(reports);
  } catch (err) {
    return next(err);
  }
}


/**
 * Update a single report
 * @param {String} text - the Report to update
 */
async function updateReport(request, response, next) {
  const { text } = request.params;

  const validation = validate(request.body, report);
  if (!validation.valid) {
    return next(
      new APIError(
        400,
        "Bad Request",
        validation.errors.map(e => e.stack).join(". ")
      )
    );
  }

  try {
    const report = await Report.updateReport(text, request.body);
    return response.json(report);
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove a single report
 * @param {String} text - the Report to remove
 */
async function deleteReport(request, response, next) {
  const { text } = request.params;
  try {
    const deleteMsg = await Report.deleteReport(text);
    return response.json(deleteMsg);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createReport,
  readReports,
  updateReport,
  deleteReport
};
