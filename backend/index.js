const express = require('express');
const mysql = require('mysql');
const createConnection = mysql.createConnection;
const cors = require('cors');

const app = express();
const PORT = 3001;

// This will add the CORS headers to the response
app.use(cors());

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

// Example endpoint to get all data from a table
app.get('/getData', (req, res) => {
    const sql = `SELECT players.*, player_vehicles.vehicle, player_vehicles.plate, player_vehicles.garage, player_vehicles.fuel, player_vehicles.engine, player_vehicles.body, player_vehicles.drivingdistance, player_vehicles.mods FROM players LEFT JOIN player_vehicles ON players.citizenid = player_vehicles.citizenid`;

    db.query(sql, (err, results) => {
        if (err) throw err;
        // Aggregate vehicles per player
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
                    vehicles: []
                };
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

app.listen(PORT, () => {
   console.log(`Server started on http://localhost:${PORT}`);
});
