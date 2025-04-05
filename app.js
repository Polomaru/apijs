const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 7000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexión a la base de datos
const db = new sqlite3.Database('./students.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

// Ruta GET y POST para todos los estudiantes
app.route('/students')
  .get((req, res) => {
    db.all('SELECT * FROM students', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const students = rows.map(row => ({
        id: row.id,
        firstname: row.firstname,
        lastname: row.lastname,
        gender: row.gender,
        age: row.age
      }));
      res.json(students);
    });
  })
  .post((req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    const sql = 'INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)';
    db.run(sql, [firstname, lastname, gender, age], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.send(`Student with id: ${this.lastID} created successfully`);
    });
  });

// Ruta GET, PUT y DELETE para un solo estudiante
app.route('/student/:id')
  .get((req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).send('Student not found');
        return;
      }
      res.json(row);
    });
  })
  .put((req, res) => {
    const id = req.params.id;
    const { firstname, lastname, gender, age } = req.body;
    const sql = `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`;
    db.run(sql, [firstname, lastname, gender, age, id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, firstname, lastname, gender, age });
    });
  })
  .delete((req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM students WHERE id = ?';
    db.run(sql, [id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.send(`The Student with id: ${id} has been deleted.`);
    });
  });

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
