const express = require("express");
const app = express();
app.use(express.json());
const PORT = 8765;
const db = require("mysql2");

const sql = db.createConnection({
  database: "thecurveafrica",
  user: "root",
  password: "Adeshina2000",
});
sql.connect((err) => {
  if (err) {
    console.log(`Unable to connect to db because ${err.message}`);
  } else {
    console.log(`MySQL connection established`);
  }
});

//create a user
app.post("/student", async (req, res) => {
  try {
    const query = `insert into thecurveafrica.studentTable
    (fullName, email, address, stack) values(?, ?, ?, ?)`;
    const { fullName, email, address, stack } = req.body;
    await sql.query(query, [fullName, email, address, stack], (err, result) => {
      if (err) {
        return res.status(400).json({ err: err.sqlMessage });
      } else {
        res.status(200).json({
          message: "new user created",
          data: result,
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      data: err.message,
    });
  }
});

//to get all students
app.get("/student", (req, res) => {
  try {
    const query = `SELECT * FROM thecurveafrica.studentTable`;
    sql.query(query, (err, result) => {
      if (err) {
        return res.status(400).json({ message: err.sqlMessage });
      } else {
        res.status(200).json({
          message: "Kindly find below all users",
          data: result,
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

//to get a student
app.get("/student/:userinfo", (req, res) => {
  const { userinfo } = req.params;

  const query = `SELECT * FROM thecurveafrica.studentTable WHERE id = ?`;

  sql.query(query, [userinfo], (err, result) => {
    if (err) {
      res.status(400).json({
        message: err.sqlMessage,
      });
    } else {
      res.status(200).json({
        message: "Kindly find the student with the corresponding id",
        data: result,
      });
    }
  });
});

// Update
app.put("/student/:id", (req, res) => {
  try {
    const query = `UPDATE thecurveafrica.studentTable SET fullName = ?, email = ?, address = ? WHERE id = ?
    `;
    sql.query(
      query,
      [req.body.fullName, req.body.email, req.body.address, req.params.id],
      (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        } else {
          res.status(200).json({ message: "update successfully" });
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

//DELETE
//Delete one student
app.delete("/student/:id", (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM thecurveafrica.studentTable WHERE id = ?
    `;
    sql.query(query, [req.params.id], (err, result) => {
      if (err) {
        res.status(400).json({
          message: err.sqlMessage,
        });
      } else {
        res.status(200).json({
          message: "Student deleted successfully",
          data: result,
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

//CREATE Student Scores
app.post("/score/:studentid", (req, res) => {
  try {
    const query = `INSERT INTO thecurveafrica.studentScore (userid, punctuality, assignment, totalScore) VALUES (?, ?, ?, ?)`;
    const { punctuality, assignment } = req.body;
    const totalScore = punctuality + assignment;
    const { studentid } = req.params;
    sql.query(
      query,
      [studentid, punctuality, assignment, totalScore],
      (err) => {
        if (err) {
          return res.status(400).json({
            message: "Something went wrong",
            error: err.sqlMessage,
          });
        }
        res.status(200).json({
          message: "Student score successfully created",
        });
      }
    );
  } catch (err) {
    return res.status(500).json({
      message: "Error",
      error: err.message,
    });
  }
});

//GET All student Scores
app.get("/scores", (req, res) => {
  try {
    const query = `SELECT p.fullName AS mystudentName, p.stack, b.punctuality, b.assignment, b.totalScore FROM thecurveafrica.studentTable p JOIN thecurveafrica.studentScore b ON p.id= b.userid`;
    sql.query(query, (err, result) => {
      if (err) {
        return res.status(400).json({ err: err.sqlMessage });
      }
      res
        .status(200)
        .json({ message: "Kindly find below, student info", data: result });
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error",
      error: err.message,
    });
  }
});

//Get one student score
app.get("/scores/:id", (req, res) => {
  try {
    const query = `SELECT p.fullName AS mystudentName, p.stack, b.punctuality, b.assignment, b.totalScore FROM thecurveafrica.studentTable p JOIN thecurveafrica.studentScore b ON p.id= b.userid WHERE p.id = ${req.params.id}`;
    sql.query(query, (err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "No student found", err: err.sqlMessage });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "No score found", error: err });
      }
      res
        .status(200)
        .json({ message: "Kindly find below, student info", data: result });
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error",
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
