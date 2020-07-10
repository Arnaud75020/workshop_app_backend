const express = require("express");
const router = express.Router();
const connection = require("../config");

//GET ALL NOTIFICATIONS http://localhost:5000/notifications

router.get("/", (req, res) => {
  connection.query("SELECT * FROM notification", (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    } else {
      res.json(results);
    }
  });
});

//ADD NEW NOTIFICATIONS http://localhost:5000/notifications

router.post("/", (req, res) => {
  const formData = req.body;

  let sql =
    "INSERT INTO notification (subject, content, state, send_to, date) VALUES ";
  formData.map((notification) => {
    if (formData.indexOf(notification) !== formData.length - 1) {
      sql += `("${notification.subject}", "${notification.content}", "${notification.state}", "${notification.send_to}", "${notification.date}"),`;
    } else {
      sql += `("${notification.subject}", "${notification.content}", "${notification.state}", "${notification.send_to}", "${notification.date}");`;
    }
  });
  return connection.query(sql, (err2, records) => {
    if (err2) {
      console.log(err2);
      return res.status(500).json({
        error: err2.message,
        sql: err2.sql,
      });
    } else {
      res.status(200).send("The notification are all confirmed");
    }
  });
});

//DELETE ONE NOTIFICATION http://localhost:5000/notifications/:id

router.delete("/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "DELETE FROM notification WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ msg: "user does not exist" });
      }

      return res.status(201).json(results);
    }
  );
});

module.exports = router;
