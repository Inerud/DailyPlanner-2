const express = require('express');
const router = express.Router();
const controller = require("../controllers/dashboardcontroller");
const { authenticateUser } = require("../middleware/authMiddleware");

router.get('/', authenticateUser, controller.getDashboardData);

module.exports = router;