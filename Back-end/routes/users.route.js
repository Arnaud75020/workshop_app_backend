const express = require('express');
const router = express.Router();
const connection = require('../config');
const bcrypt = require('bcrypt');



//GET ALL USERS http://localhost:5000/users

router.get('/', (req, res) => {

    connection.query('SELECT u.*, r.role, COUNT(u_w.user_id) AS workshop_count FROM user u JOIN role r ON u.role_id=r.id LEFT JOIN user_workshops u_w ON u.id=u_w.user_id GROUP BY u.id', (err, results) => {
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


//GET ALL ATTENDEES http://localhost:5000/users/attendees


router.get('/attendees', (req, res) => {

  connection.query('SELECT u.*, r.role, COUNT(u_w.user_id) AS workshop_count FROM user u JOIN role r ON u.role_id=r.id LEFT JOIN user_workshops u_w ON u.id=u_w.user_id  WHERE role_id = 3 GROUP BY u.id', (err, results) => {
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


//GET ALL SPEAKERS http://localhost:5000/users/speakers


router.get('/speakers', (req, res) => {

  connection.query('SELECT u.*, r.role, COUNT(u_w.user_id) AS workshop_count FROM user u JOIN role r ON u.role_id=r.id LEFT JOIN user_workshops u_w ON u.id=u_w.user_id  WHERE role_id = 2 GROUP BY u.id', (err, results) => {
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


//GET ONE USER http://localhost:5000/:id


router.get('/getuser/:id', (req, res) => {

  const id = req.params.id

  connection.query('SELECT u.*, r.role FROM user u JOIN role r ON u.role_id=r.id WHERE u.id= ?',[id], (err, results) => {
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


//DELETE ONE USER http://localhost:5000/users/:id


router.delete('/:id', (req, res) => {

  const id = req.params.id;

  connection.query('DELETE FROM user WHERE id = ?', [id], (err, results) => {
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



router.put("/change-password", (req, res) => {
  const formData = req.body;

  const { email, newPassword}  = formData
  console.log(formData)

  bcrypt.hash(newPassword, 10, (err, hash) => {

   return connection.query(
     "UPDATE user SET password = ? WHERE email = ?",
     [hash, email],
     (err, results) => {
       if (err) {
         console.log("ERR", err)
         return res.status(500).json({
           error: err.message,
           sql: err.sql,
         });
       }
       res.status(200).send(results);
       console.log("RESULTS", results)
     }
   )});
});

module.exports = router;