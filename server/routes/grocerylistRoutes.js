const express = require("express");
const router = express.Router();
const controller = require("../controllers/grocerylistcontroller");
const { authenticateUser } = require("../middleware/authMiddleware");

router.get('/', authenticateUser, controller.getGroceryList);
router.post('/', authenticateUser, controller.saveGroceryList);

module.exports = router;
