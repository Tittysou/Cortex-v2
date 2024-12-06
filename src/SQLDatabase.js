const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { sql } = require('./utils/logs')

const dbPath = path.join(__dirname, '..', 'snipes.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not open database:', err.message);
    } else {
        sql('SQL database online!')
        db.run(`CREATE TABLE IF NOT EXISTS snipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            channel_id TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Could not create table:', err.message);
            }
        });
    }
});

module.exports = db;
