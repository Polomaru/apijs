const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('students.sqlite');

const sqlQuery = `
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    gender TEXT NOT NULL,
    age TEXT
  )
`;

db.run(sqlQuery, (err) => {
  if (err) {
    console.error('Error al crear la tabla:', err.message);
  } else {
    console.log('Tabla "students" creada correctamente.');
  }
  db.close();
});
