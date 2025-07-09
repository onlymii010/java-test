// server.js

// 1. Abhängigkeiten importieren
const express = require('express');
const mysql = require('mysql2/promise'); // Wichtig: /promise für async/await
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors()); // CORS für alle Anfragen aktivieren
app.use(express.json()); // Ermöglicht das Lesen von JSON-Daten im Body

// 2. Datenbank-Konfiguration (sicher auf dem Server)
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Marcel1997', // Dein MySQL-Passwort
    database: 'web_db'
};

// Geheimer Schlüssel für JWT - ändere diesen in eine zufällige Zeichenfolge
const JWT_SECRET = 'dein-super-geheimer-schluessel-der-sehr-lang-ist';

// 3. API-Endpunkte definieren

// A. Benutzer registrieren
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Benutzername und Passwort sind erforderlich.' });
        }

        // Passwort hashen (niemals als Klartext speichern!)
        const hashedPassword = await bcrypt.hash(password, 10); // 10 Runden sind ein guter Standard

        const connection = await mysql.createConnection(dbConfig);
        
        // Standardrolle ist 'user'
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        await connection.execute(sql, [username, hashedPassword, 'user']);
        
        await connection.end();

        res.status(201).json({ message: 'Benutzer erfolgreich registriert!' });

    } catch (error) {
        // Fehlerbehandlung, z.B. wenn der Benutzername bereits existiert
        console.error(error);
        res.status(500).json({ message: 'Registrierung fehlgeschlagen.' });
    }
});

// B. Benutzer einloggen
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const connection = await mysql.createConnection(dbConfig);

        const sql = 'SELECT * FROM users WHERE username = ?';
        const [users] = await connection.execute(sql, [username]);

        await connection.end();

        if (users.length === 0) {
            return res.status(401).json({ message: 'Benutzer nicht gefunden.' });
        }

        const user = users[0];

        // Vergleiche das eingegebene Passwort mit dem Hash in der DB
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Falsches Passwort.' });
        }

        // Erstelle ein JSON Web Token (JWT)
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' } // Token ist 1 Stunde gültig
        );

        res.json({ message: 'Login erfolgreich!', token: token, role: user.role });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login fehlgeschlagen.' });
    }
});


// 4. Server starten
const PORT = 7789; // Der Port aus deiner SERVER_URL
app.listen(PORT, () => {
    console.log(`Server läuft auf http://127.0.0.1:${PORT}`);
});