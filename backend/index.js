const express = require('express');
const mysql = require('mysql');
const createConnection = mysql.createConnection;
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

//const generatesecret = crypto.randomBytes(64).toString('hex'); // Used to generate a secret key for JWT
//console.log(generatesecret);

require('dotenv').config();
const secret = process.env.JWT_SECRET;

// This will add the CORS headers to the response
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = createConnection({
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'qbcoreframework_b16ad6',
});

db.connect((err) => {
   if (err) throw err;
   console.log('Connected to the database');
});

app.get('/getData', (req, res) => {
    const usingPsMdt = req.query.usingPsMdt === 'true';

    const sql = `
        SELECT players.*, 
               player_vehicles.vehicle, 
               player_vehicles.plate, 
               player_vehicles.garage, 
               player_vehicles.fuel, 
               player_vehicles.engine, 
               player_vehicles.body, 
               player_vehicles.drivingdistance, 
               player_vehicles.mods,
               mdt_data.pfp
        FROM players 
        LEFT JOIN player_vehicles ON players.citizenid = player_vehicles.citizenid
        LEFT JOIN mdt_data ON players.citizenid = mdt_data.cid
    `;

    db.query(sql, (err, results) => {
        if (err) throw err;
        const aggregatedResults = results.reduce((acc, row) => {
            if (!acc[row.citizenid]) {
                acc[row.citizenid] = {
                    citizenid: row.citizenid,
                    name: row.name,
                    license: row.license,
                    money: row.money,
                    cid: row.cid,
                    charinfo: row.charinfo,
                    job: row.job,
                    gang: row.gang,
                    position: row.position,
                    metadata: row.metadata,
                    inventory: row.inventory,
                    vehicles: [],
                };
                if (usingPsMdt) {
                    acc[row.citizenid].pfp = row.pfp;
                }
            }

            if (row.vehicle) {
                acc[row.citizenid].vehicles.push({
                    vehicle: row.vehicle,
                    plate: row.plate,
                    garage: row.garage,
                    fuel: row.fuel,
                    engine: row.engine,
                    body: row.body,
                    drivingdistance: row.drivingdistance,
                    mods: row.mods,
                });
            }
            return acc;
        }, {});

        res.json(Object.values(aggregatedResults));
    });
});

app.get('/getAdminUsernames', (req, res) => {
    const sql = `
        SELECT username, role
        FROM ezdbusers
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while fetching admin usernames.' });
            return;
        }
        res.json(results);
    });
    
});

app.delete('/admin/:username', (req, res) => {
    const username = req.params.username;
 
    const sql = `DELETE FROM ezdbusers WHERE username = ?`;
 
    db.query(sql, [username], (err, results) => {
       if (err) return res.status(500).json({ error: 'An error occurred while deleting the admin.' });
       res.json({ message: 'Admin deleted successfully.' });
    });
});

app.put('/admin', (req, res) => {
    const changes = req.body;
 
    let queries = [];
 
    for (let [username, role] of Object.entries(changes)) {
       queries.push(db.query(`UPDATE ezdbusers SET role = ? WHERE username = ?`, [role, username]));
    }
 
    Promise.all(queries)
       .then(() => res.json({ message: 'Roles updated successfully.' }))
       .catch(err => res.status(500).json({ error: 'An error occurred while updating roles.' }));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM ezdbusers WHERE username = ?";
    db.query(query, [username], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(401).json({ message: 'Username or password is incorrect' });
        }

        const user = results[0];

        bcrypt.compare(password, user.hashed_password, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
                return res.status(401).json({ message: 'Username or password is incorrect' });
            }

            const token = jwt.sign({ 
                id: user.id, 
                username: user.username, 
                role: user.role 
            }, secret, { expiresIn: '1h' });

            return res.json({ token });
        });
    });
});

app.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    // First, hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        // Store the hashed password in the database
        const query = "INSERT INTO ezdbusers (username, hashed_password, role) VALUES (?, ?, ?)";
        db.query(query, [username, hashedPassword, role], (err, results) => {
            if (err) {
                // Handle duplicate username error
                if(err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Username already exists' });
                }
                throw err;
            }

            res.json({ message: 'User registered successfully' });
        });
    });
});

app.get('/getUserRole', (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];  // Assuming Bearer token
        const decoded = jwt.verify(token, secret);
        
        // Send the role back to the frontend
        res.json({ role: decoded.role });
        console.log(decoded);
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Sign a token
const token = jwt.sign({  }, secret, { expiresIn: '1h' });

// Verify a token
jwt.verify(token, secret, (err, decoded) => {
  if (err) {
    console.log("Token is not valid");
  } else {
    console.log("Token is valid", decoded);
  }
});

let onlinePlayers = [];

app.post('/setPlayers', (req, res) => {
    onlinePlayers = req.body;
    //console.log(onlinePlayers);
    res.json({ status: 'ok' });
});

// Endpoint to fetch online players
app.get('/getOnlinePlayers', (req, res) => {
    res.json(onlinePlayers);
});

// Assume this endpoint fetches all players and marks online players
app.get('/fetchAllPlayers', async (req, res) => {
    try {
        const allPlayers = await fetchAllPlayersFromAPI();
        
        allPlayers.forEach(player => {
            if(onlinePlayers.some(onlinePlayer => onlinePlayer.id === player.id)) {
                player.isOnline = true;
            } else {
                player.isOnline = false;
            }
        });

        res.json(allPlayers);
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

app.listen(PORT, () => {
   console.log(`Server started on http://localhost:${PORT}`);
});
