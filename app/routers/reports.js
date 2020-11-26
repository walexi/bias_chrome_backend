// npm packages
const express = require("express");

// app imports
const { reportHandler, reportsHandler } = require("../handlers");

// globals
const router = new express.Router();
const { readReports } = reportsHandler;
const { createReport, updateReport, deleteReport } = reportHandler;

/* All the Reports Route */
router
  .route("")
  .get(readReports)
  .post(createReport);

/* Single Report by Name Route */
router
  .route("/:text")
  .patch(updateReport)
  .delete(deleteReport);

module.exports = router;
