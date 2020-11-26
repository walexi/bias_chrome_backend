// npm packages
const { validate } = require("jsonschema");

// app imports
const { Feedback } = require("../models");
const { feedback } = require("../schemas");
const { APIError, parseSkipLimit } = require("../helpers");



/**
 * Validate the POST request body and create a new Feedback
 */
async function createFeedback(request, response, next) {
  const validation = validate(request.body, feedback);
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
    const newFeedback = await Feedback.createFeedback(new Feedback(request.body));
    return response.status(201).json(newFeedback);
  } catch (err) {
    return next(err);
  }
}


/**
 * List all the feedbacks. Query params ?skip=0&limit=1000 by default
 */
async function readFeedbacks(request, response, next) {
  /* pagination validation */
  let skip = parseSkipLimit(request.query.skip) || 0;
  let limit = parseSkipLimit(request.query.limit, 1000) || 1000;
  if (skip instanceof APIError) {
    return next(skip);
  } else if (limit instanceof APIError) {
    return next(limit);
  }

  try {
    const feedbacks = await Feedback.readFeedbacks({}, {}, skip, limit);
    return response.json(feedbacks);
  } catch (err) {
    return next(err);
  }
}


/**
 * Update a single feedback
 * @param {String} text - the Report to update
 */
async function updateFeedback(request, response, next) {
  const { text } = request.params;

  const validation = validate(request.body, feedback);
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
    const feedback = await Feedback.updateFeedback(text, request.body);
    return response.json(feedback);
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove a single report
 * @param {String} text - the Report to remove
 */
async function deleteFeedback(request, response, next) {
  const { text } = request.params;
  try {
    const deleteMsg = await Feedback.deleteFeedback(text);
    return response.json(deleteMsg);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createFeedback,
  readFeedbacks,
  updateFeedback,
  deleteFeedback
};
