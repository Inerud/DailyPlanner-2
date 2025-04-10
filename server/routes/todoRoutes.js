const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todocontroller.js");
const { authenticateUser } = require("../middleware/authMiddleware");

// Define todo routes
router.get("/", authenticateUser, todoController.getAllTodos);
router.get("/data", authenticateUser, todoController.getTodosByDate);
router.post("/", authenticateUser, todoController.addTodo);
router.put("/:id", authenticateUser, todoController.updateTodo);
router.delete("/:id", authenticateUser, todoController.deleteTodo);

module.exports = router;
