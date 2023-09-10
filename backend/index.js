const express = require('express');
const mysql = require('mysql');
const createConnection = mysql.createConnection;
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

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
