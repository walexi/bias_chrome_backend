// npm packages
const express = require("express");

// app imports
const { feedbackHandler, feedbacksHandler } = require("../handlers");

// globals
const router = new express.Router();
const { readFeedbacks } = feedbacksHandler;
const { createFeedback, updateFeedback, deleteFeedback } = feedbackHandler;

/* All the Feedbacks Route */
router
  .route("")
  .get(readFeedbacks)
  .post(createFeedback);

/* Single Feedback by Name Route */
router
  .route("/:text")
  .patch(updateFeedback)
  .delete(deleteFeedback);

module.exports = router;
