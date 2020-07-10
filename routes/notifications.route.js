const express = require('express');
const router = express.Router();
const connection = require('../config');


//GET ALL NOTIFICATIONS http://localhost:5000/notifications


router.get('/', (req, res) => {

    connection.query('SELECT * FROM notification', (err, results) => {
        if (err) {
            res.status(500).json({
              error: err.message,
              sql: err.sql,
            });
          } else {
            res.json(results);
          }
    })
});


//ADD NEW NOTIFICATIONS http://localhost:5000/notifications


router.post('/', (req, res) => {

  const formData = req.body;

  return connection.query('INSERT INTO notification SET ?' , [formData], (err, results) => {
      if(err) {
          return res.status(500).json({
              error: err.message,
              sql: err.sql,
          });
      }
      return connection.query('SELECT * FROM notification WHERE id = ?', results.insertId, (err2, records) => {
          if(err2){
              return res.status(500).json({
                  error: err2.message,
                  sql: err2.sql,
              });
          }
          const InsertedNotification = records[0];
          return res.status(201)
          .json(InsertedNotification)
      });
  });
});


//DELETE ONE NOTIFICATION http://localhost:5000/notifications/:id


router.delete('/:id', (req, res) => {

  const id = req.params.id;

  connection.query('DELETE FROM notification WHERE id = ?', [id], (err, results) => {
      if(err) {
        return res.status(500).json({
                   error: err.message,
                   sql: err.sql,
                  });
      }
      if(results.affectedRows === 0){
        return res
        .status(404)
        .json({msg: 'user does not exist'})
      }

      return res
      .status(201)
      .json(results)
  })
});


module.exports = router;