const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountcontroller"); 
const { authenticateUser } = require("../middleware/authMiddleware");


// Routes
router.get("/user", authenticateUser, accountController.getUserData);
router.get("/account", authenticateUser, accountController.getAccount);
router.put("/account", authenticateUser, accountController.updateAccount);

module.exports = router;