const db = require("../config/db");

// Fetch all to-do items for authenticated user
exports.getAllTodos = (req, res) => {
    const query = "SELECT * FROM todos WHERE user_id = ? ORDER BY date, time";

    db.query(query, [req.userId], (err, results) => {
        if (err) {
            console.error("Error fetching todos:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch todos" });
        }

        // Convert completed field to boolean
        const todos = results.map(todo => ({
            ...todo,
            completed: Boolean(todo.completed)
        }));

        res.json({ success: true, todos });
    });
};

// Fetch all todos for a certain date
exports.getTodosByDate = (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: "Date is required" });

    const query = "SELECT * FROM todos WHERE user_id = ? AND DATE(date) = ? ORDER BY priority DESC, time";

    db.query(query, [req.userId, date], (err, results) => {
        if (err) {
            console.error("Error fetching todos for date:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch todos" });
        }

        const todos = results.map(todo => ({
            ...todo,
            completed: Boolean(todo.completed)
        }));

        res.json({ success: true, todos });
    });
};

// Insert a new to-do item
exports.addTodo = (req, res) => {
    const { description, date, time, priority, completed, recurring, tags } = req.body;

    if (!description || !date) {
        return res.status(400).json({ success: false, message: "Description and date are required" });
    }

    const query = `
        INSERT INTO todos (user_id, date, time, priority, description, completed, recurring)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [req.userId, date, time || null, priority || "Low", description, completed || false, recurring || "None"];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error adding todo:", err);
            return res.status(500).json({ success: false, message: "Failed to add todo" });
        }

        // If tags are provided, insert them into the todo_tags table
        if (tags && tags.length > 0) {
            const todoId = result.insertId;
            const tagValues = tags.map(tag => [todoId, tag]);
            db.query("INSERT INTO todo_tags (todo_id, tag) VALUES ?", [tagValues], (tagErr) => {
                if (tagErr) {
                    console.error("Error adding tags:", tagErr);
                }
            });
        }

        res.json({ success: true, message: "To-do added!", id: result.insertId });
    });
};

// Update existing to-do item
exports.updateTodo = (req, res) => {
    const { id } = req.params;
    const { description, date, time, priority, completed, recurring, tags } = req.body;

    let updates = [];
    let values = [];

    if (description !== undefined) {
        updates.push("description = ?");
        values.push(description);
    }
    if (date !== undefined) {
        updates.push("date = ?");
        values.push(date);
    }
    if (time !== undefined) {
        updates.push("time = ?");
        values.push(time);
    }
    if (priority !== undefined) {
        updates.push("priority = ?");
        values.push(priority);
    }
    if (completed !== undefined) {
        updates.push("completed = ?");
        values.push(completed);
    }
    if (recurring !== undefined) {
        updates.push("recurring = ?");
        values.push(recurring);
    }

    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: "No fields to update" });
    }

    const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`;
    values.push(id, req.userId);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error updating todo:", err);
            return res.status(500).json({ success: false, message: "Failed to update todo" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Todo not found" });
        }

        // Update tags if provided
        if (tags) {
            db.query("DELETE FROM todo_tags WHERE todo_id = ?", [id], (delErr) => {
                if (delErr) {
                    console.error("Error removing old tags:", delErr);
                    return res.status(500).json({ success: false, message: "Failed to update tags" });
                }

                if (tags.length > 0) {
                    const tagValues = tags.map(tag => [id, tag]);
                    db.query("INSERT INTO todo_tags (todo_id, tag) VALUES ?", [tagValues], (tagErr) => {
                        if (tagErr) {
                            console.error("Error adding new tags:", tagErr);
                            return res.status(500).json({ success: false, message: "Failed to insert new tags" });
                        }
                        res.json({ success: true, message: "To-do updated!" });
                    });
                } else {
                    res.json({ success: true, message: "To-do updated, no tags provided!" });
                }
            });
        } else {
            res.json({ success: true, message: "To-do updated!" });
        }
    });
};

// Delete to-do item
exports.deleteTodo = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM todo_tags WHERE todo_id = ?", [id], (tagErr) => {
        if (tagErr) {
            console.error("Error deleting tags:", tagErr);
        }

        const query = "DELETE FROM todos WHERE id = ? AND user_id = ?";
        db.query(query, [id, req.userId], (err, result) => {
            if (err) {
                console.error("Error deleting todo:", err);
                return res.status(500).json({ success: false, message: "Failed to delete todo" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Todo not found" });
            }

            res.json({ success: true, message: "To-do deleted!" });
        });
    });
};
