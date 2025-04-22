const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealcontroller.js');
const { authenticateUser } = require("../middleware/authMiddleware");


router.get('/', authenticateUser, mealController.getMealsByWeek);
router.post('/', authenticateUser, mealController.saveMeal);

module.exports = router;
