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
app.use(cors()); // for local development

/* use this instead if you want to deploy the backend on a server */
// app.use(cors({
//     origin: 'http://localhost:3000', // Replace With Server's IP address
// }));
// 
// const path = require('path');
// 
// // Serve static files from the React frontend app
// app.use(express.static(path.join(__dirname, 'path_to_your_build_directory')));
// 
// // Anything that doesn't match the above, send back the index.html file
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname + '/path_to_your_build_directory/index.html'));
// });
/* */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = createConnection({
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'qbcoreframework_f20197',
});

db.connect((err) => {
   if (err) throw err;
   console.log('Connected to the database');
});

app.get('/getData', (req, res) => {
    const usingPsMdt = req.query.usingPsMdt === 'true';
    const usingPsHousing = req.query.usingPsHousing === 'true';

    let sql = `
        SELECT players.*, 
            player_vehicles.vehicle, 
            player_vehicles.plate, 
            player_vehicles.garage, 
            player_vehicles.fuel, 
            player_vehicles.engine, 
            player_vehicles.body, 
            player_vehicles.drivingdistance, 
            player_vehicles.mods,
            apartments.name as apartment_name
    `;

    if (usingPsMdt) {
        sql += `, mdt_data.pfp`;
    }

    if (usingPsHousing) {
        sql += `, properties.door_data as house_coords`;
    } else {
        sql += `, houselocations.coords as house_coords`;
    }

    sql += `
        FROM players 
        LEFT JOIN player_vehicles ON players.citizenid = player_vehicles.citizenid
        LEFT JOIN stashitems ON players.name = stashitems.stash
        LEFT JOIN apartments ON players.citizenid = apartments.citizenid
    `;

    if (usingPsMdt) {
        sql += `LEFT JOIN mdt_data ON players.citizenid = mdt_data.cid `;
    }

    if (usingPsHousing) {
        sql += `
        LEFT JOIN properties ON players.citizenid = properties.owner_citizenid
        `;
    } else {
        sql += `
        LEFT JOIN player_houses ON players.citizenid = player_houses.citizenid
        LEFT JOIN houselocations ON player_houses.house = houselocations.name
        `;
    }

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
                    house_coords: []
                };
        
                if (usingPsMdt) {
                    acc[row.citizenid].pfp = row.pfp;
                }        
            }
        
            if (usingPsHousing && row.house_coords) {
                const coords = JSON.parse(row.house_coords);
                acc[row.citizenid].house_coords.push({
                    x: coords.x,
                    y: coords.y,
                    z: coords.z
                });
            } else if (!usingPsHousing && row.house_coords) {
                const coords = JSON.parse(row.house_coords).enter;
                acc[row.citizenid].house_coords.push(coords);
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

            if (row.apartment_name) {
                acc[row.citizenid].apartment_name = row.apartment_name;
            }

            return acc;
        }, {});        
    
        res.json(Object.values(aggregatedResults));
    });    
});

app.get('/getStashes', (req, res) => {
    const sql = `SELECT * FROM stashitems`;

    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Endpoint to save session duration
app.post('/setSessionDuration', (req, res) => {
    const { citizenid, duration } = req.body;
    const sessionEnd = new Date();
    const sessionStart = new Date(sessionEnd - duration * 1000); // milliseconds to seconds

    const sql = `
        INSERT INTO player_sessions (citizenid, session_start, session_end, duration)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [citizenid, sessionStart, sessionEnd, duration], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while saving the session duration.' });
        }
        res.json({ message: 'Session duration saved successfully.' });
    });
});

app.get('/getAveragePlaytime', (req, res) => {
    const sql = `
        SELECT AVG(duration) as average_duration
        FROM player_sessions
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while fetching average playtime.' });
        }
        res.json({ averagePlaytime: results[0].average_duration });
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
   console.log(`Server started on http://localhost:${PORT}`); // If you want to host this website on for example a VPS change "localhost" to "0.0.0.0"
});
