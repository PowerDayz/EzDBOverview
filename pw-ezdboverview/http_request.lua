QBCore = exports['qb-core']:GetCoreObject()
local MySQL = exports.oxmysql

-- Table to store the start time for each player
local playerSessionStart = {}

-- When a player joins, start a timer and insert the session start into the database
RegisterServerEvent('playerJoined')
AddEventHandler('playerJoined', function()
    Citizen.CreateThread(function()
        local plysource = source
        local Player = QBCore.Functions.GetPlayer(plysource)
        
        if Player then
            local citizenId = Player.PlayerData.citizenid
            playerSessionStart[citizenId] = os.time()

            -- Insert session start into the database
            local id = MySQL.insert.await('INSERT INTO `player_sessions` (citizenid, session_start) VALUES (?, NOW())', {
                citizenId
            })
        end
    end)
end)

-- When a player leaves, calculate session duration and update it into the database
AddEventHandler('playerDropped', function(reason)
    local plysource = source
    local Player = QBCore.Functions.GetPlayer(plysource)
    if Player then
        local citizenId = Player.PlayerData.citizenid
        local sessionEndTime = os.time()

        if playerSessionStart[citizenId] then
            local sessionDuration = sessionEndTime - playerSessionStart[citizenId]

            -- Update session duration and session end in the database
            MySQL.execute('UPDATE `player_sessions` SET session_end = NOW(), duration = ? WHERE citizenid = ? AND session_end IS NULL', {
                sessionDuration, citizenId
            })
        end
    end
end)

function sendOnlinePlayers()
    local players = GetPlayers()  -- Get list of online players
    
    local playerDetails = {}

    for i=1, #players do
        local playerSource = players[i]
        local Player = QBCore.Functions.GetPlayer(tonumber(playerSource))
        
        if Player then  -- Check if the Player object is not nil
            local citizenId = Player.PlayerData.citizenid
            
            -- Check if the player is not already in the playerDetails list
            local alreadyAdded = false
            for j=1, #playerDetails do
                if playerDetails[j].citizenid == citizenId then
                    alreadyAdded = true
                    break
                end
            end
    
            if not alreadyAdded then
                table.insert(playerDetails, {
                    id = playerSource,
                    citizenid = citizenId
                })
            end
        else
            --print("Failed to get Player object for source: " .. playerSource) -- Debug Print Basically i mean it's not really needed. it will trigger if the player is in char select or not logged in yet.
        end
    end    

    PerformHttpRequest("http://localhost:3001/setPlayers", function(err, text, headers)
        if err == 200 then
            --print("Data sent successfully") -- Debug Print Basically
        else
            print("Failed to send data. Error: " .. text)
        end
    end, 'POST', json.encode(playerDetails), { ["Content-Type"] = 'application/json' })
end

-- Automatic loop to send players every 5 seconds (5000 ms)
Citizen.CreateThread(function()
    while true do
        sendOnlinePlayers()
        Citizen.Wait(5000)  -- Wait for 5 seconds
    end
end)
