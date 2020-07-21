const express = require('express');
const router = express.Router();
const connection = require('../config');

//GET ALL WORKSHOPS http://localhost:5000/workshops

router.get('/', (req, res) => {
  connection.query(
    'SELECT w.*, MONTHNAME(w.date) AS workshop_month, CONCAT(u.firstname, " ", u.lastname) AS workshop_speaker, COUNT(u_w.workshop_id) as enrolled_attendees FROM workshops w JOIN user u ON w.speaker_id = u.id left join user_workshops u_w on w.id=u_w.workshop_id group by w.id;',
    (err, results) => {
      if (err) {
        res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.json(results);
      }
    }
  );
});

//GET WORKSHOP MONTHS http://localhost:5000/workshops/months

router.get('/months', (req, res) => {
  connection.query(
    'SELECT DISTINCT MONTHNAME(date) AS month FROM workshops ORDER BY Month(month)',
    (err, results) => {
      console.log(err)
      if (err) {
        console.log
        res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.json(results);
      }
    }
  );
});

//GET ONE WORKSHOP WITH THE SPEAKER_ID http://localhost:5000/workshops/:id

router.get('/:id', (req, res) => {
  const speakerId = req.params.id;

  connection.query(
    'SELECT w.*, MONTHNAME(w.date) AS workshop_month, CONCAT(u.firstname," ",u.lastname) AS workshop_speaker FROM workshops w JOIN user u ON w.speaker_id = u.id WHERE w.speaker_id = ?',
    [speakerId],
    (err, results) => {
      if (err) {
        res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.json(results);
      }
    }
  );
});

//ADD A NEW WORKSHOP http://localhost:5000/workshops

router.post('/', (req, res) => {
  const formData = req.body;

  console.log('formData', formData);

  let sql =
    'INSERT INTO workshops (title, status_open, date, starting_hour, ending_hour, description, speaker_id, room, room_capacity, room_manager, room_type) VALUES ';
  formData.map((workshop) => {
    if (formData.indexOf(workshop) !== formData.length - 1) {
      sql += `("${workshop.title}", ${workshop.status_open}, "${workshop.date}", "${workshop.starting_hour}", "${workshop.ending_hour}", "${workshop.description}", ${workshop.speaker_id}, "${workshop.room}", ${workshop.room_capacity}, "${workshop.room_manager}", "${workshop.room_type}" ),`;
    } else {
      sql += `("${workshop.title}", ${workshop.status_open}, "${workshop.date}", "${workshop.starting_hour}", "${workshop.ending_hour}", "${workshop.description}", ${workshop.speaker_id}, "${workshop.room}", ${workshop.room_capacity}, "${workshop.room_manager}", "${workshop.room_type}" );`;
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
      res.status(200).send('The workshops are all confirmed');
    }
  });
});

//UPDATE A WORKSHOP WITH THE WORKSHOP_ID http://localhost:5000/workshops/:id

router.put('/:id', (req, res) => {
  const formData = req.body;
  const idWorkshop = req.params.id;

  return connection.query(
    'UPDATE workshops SET ? WHERE id = ?',
    [formData, idWorkshop],
    (err, results) => {
      if (err) {
        console.log('ERR', err);
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      res.status(200).send(results);
      console.log('RESULTS', results);
    }
  );
});

//DELETE ONE WORKSHOP WITH WORKSHOP_ID http://localhost:5000/workshops/:id

router.delete('/:id', (req, res) => {
  const workshop_id = req.params.id;

  connection.query(
    'DELETE FROM workshops WHERE id = ?',
    [workshop_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      res.status(201).json(results);
    }
  );
});

//DELETE ONE WORKSHOP WITH THE SPEAKER_ID http://localhost:5000/workshops/speaker/:id

router.delete('/speaker/:id', (req, res) => {
  const workshop_id = req.params.id;

  connection.query(
    'DELETE FROM workshops WHERE speaker_id = ?',
    [workshop_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      res.status(201).json(results);
    }
  );
});

//GET ATTENDEES LIST FROM A WORKSHOP WITH SPEAKER_ID http://localhost:5000/workshops/:id/attendees

router.get('/:id/attendees', (req, res) => {
  const speakerId = req.params.id;

  connection.query(
    'SELECT u.firstname, u.lastname, u.email, u.position, u.company, u.country, u.registration_date FROM user u JOIN user_workshops u_w ON u_w.user_id = u.id JOIN workshops w ON u_w.workshop_id = w.id WHERE w.speaker_id = ?',
    [speakerId],
    (err, results) => {
      if (err) {
        res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.json(results);
      }
    }
  );
});

//GET ALL WORKSHOPS ONE ATTENDEE IS ATTENDING TO http://localhost:5000/workshops/user-workshops/:id

router.get('/user-workshops/:id', (req, res) => {
  const userId = req.params.id;

  connection.query(
    'SELECT * FROM user_workshops WHERE user_id=?',
    [userId],
    (err, results) => {
      if (err) {
        res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.json(results);
      }
    }
  );
});

//ATTENDEE ENROLLING IN A WORKSHOP http://localhost:5000/workshops/user-workshops/add

router.post('/user-workshops/add', (req, res) => {
  const formData = req.body;
  const { user_id } = formData;

  console.log("ADD")


  connection.query(
    'INSERT INTO user_workshops SET ?',
    [formData],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      return connection.query(
        'Update user SET max_workshops = max_workshops - 1 WHERE id = ?', [user_id], (err3, results3) => {
          if (err3) {
            console.log('ERR', err3);
            return res.status(500).json({
              error: err3.message,
              sql: err3.sql,
            });
          }
          return connection.query(
            'SELECT * FROM user_workshops WHERE user_id = ?',
            [user_id],
            (err2, records) => {
              if (err2) {
                console.log(err2);
                return res.status(500).json({
                  error: err2.message,
                  sql: err2.sql,
                });
              }
              const UserWorkshops = records;
              return res.status(201).json(UserWorkshops);
            }
          )
        }
      )
      
    }
  )
  
});

//ATTENDEE LEAVING A WORKSHOP http://localhost:5000/workshops/user-workshops/delete

router.delete('/user-workshops/delete', (req, res) => {
  const formData = req.body;
  const workshop_id = formData[0];
  const user_id = formData[1];

  console.log("REMOVE")

  connection.query(
    'DELETE FROM user_workshops WHERE workshop_id = ? AND user_id = ?',
    [workshop_id, user_id],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ msg: 'user does not exist' });
      }
      return connection.query(
        'Update user SET max_workshops = max_workshops + 1 WHERE id = ?', [user_id], (err3, results3) => {
          if (err3) {
            console.log('ERR', err3);
            return res.status(500).json({
              error: err3.message,
              sql: err3.sql,
            });
          }
          return connection.query(
            'SELECT * FROM user_workshops WHERE user_id = ?',
            [user_id],
            (err2, records) => {
              if (err2) {
                return res.status(500).json({
                  error: err2.message,
                  sql: err2.sql,
                });
              }
              const UserWorkshops = records;
              return res.status(201).json(UserWorkshops);
            }
          )
        }
      )
      
    }
  )
});

//DELETING ALL THE ENROLLES OF AN ATTENDEE http://localhost:5000/workshops/all-user-workshops/:id

router.delete('/all-user-workshops/:id', (req, res) => {
  const userId = req.params.id;

  connection.query(
    'DELETE FROM user_workshops WHERE user_id=?',
    [userId],
    (err, results) => {
      if (err) {
        res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      } else {
        res.json(results);
      }
    }
  );
});

//DELETE FROM USER_WORKSHOPS WITH THE WORKSHOP_ID http://localhost:5000/workshops/workshop-user-workshops/:id

router.delete('/workshop-user-workshops/:id', (req, res) => {
  const workshop_id = req.params.id;

  connection.query(
    'DELETE FROM user_workshops WHERE workshop_id = ?',
    [workshop_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      res.status(201).json(results);
    }
  );
});

//DELETE FROM USER_WORKSHOPS WITH THE SPEAKER_ID http://localhost:5000/workshops/all-speaker-workshops/:id

router.delete('/all-speaker-workshops/:id', (req, res) => {
  const speaker_id = req.params.id;

  connection.query(
    'DELETE FROM user_workshops WHERE speaker_id = ?',
    [speaker_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      res.status(201).json(results);
    }
  );
});

router.put('/workshop-user-workshops/:id', (req, res) => {
  const formData = req.body;

  const { speaker_id } = formData;
  const workshopId = req.params.id;

  console.log('formData', formData, 'workshopId', workshopId);

  return connection.query(
    'UPDATE user_workshops SET speaker_id = ?, workshop_id = ? WHERE workshop_id = ?',
    [speaker_id, workshopId, workshopId],
    (err, results) => {
      if (err) {
        console.log('ERR', err);
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      res.status(200).send(results);
      console.log('RESULTS', results);
    }
  );
});

router.put('/workshop-status/:id', (req, res) => {

  const { status } = req.body

  const id = req.params.id

  console.log(status)

  return connection.query(
    'UPDATE workshops SET status_open = ? WHERE id = ?',
    [status, id],
    (err, results) => {
      if (err) {
        console.log('ERR', err);
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }
      res.status(200).send(results);
      console.log('RESULTS', results);
    }
  );
});

module.exports = router;
