const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 7000;

// Configurar multer para manejar form-data sin archivos
const upload = multer();

// Middlewares para manejar JSON y form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('students.sqlite', (err) => {
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
      } else {
        res.json(rows);
      }
    });
  })
  .post(upload.none(), (req, res) => {
    const { firstname, lastname, gender, age } = req.body;

    if (!firstname || !lastname || !gender) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    const sql = `INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)`;
    db.run(sql, [firstname, lastname, gender, age], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ message: `Student with ID ${this.lastID} created.` });
      }
    });
  });

// Ruta GET, PUT y DELETE para un estudiante específico
app.route('/student/:id')
  .get((req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (!row) {
        res.status(404).json({ error: 'Estudiante no encontrado' });
      } else {
        res.json(row);
      }
    });
  })
  .put(upload.none(), (req, res) => {
    const id = req.params.id;
    const { firstname, lastname, gender, age } = req.body;

    const sql = `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`;
    db.run(sql, [firstname, lastname, gender, age, id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: `Estudiante con ID ${id} actualizado.` });
      }
    });
  })
  .delete((req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM students WHERE id = ?', [id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: `Estudiante con ID ${id} eliminado.` });
      }
    });
  });

// Iniciar el servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
