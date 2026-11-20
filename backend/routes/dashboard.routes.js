// routes/dashboard.routes.js
const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

router.get(
  "/metricas",
  requireAuth,
  requireRole("admin"),
  dashboardController.metricas,
);

module.exports = router;
