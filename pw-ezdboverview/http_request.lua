QBCore = exports['qb-core']:GetCoreObject()

function sendOnlinePlayers()
    local players = GetPlayers()  -- Get list of online players
    
    local playerDetails = {}

    if #players == 0 then
        print("Nobody is online")
    end

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
            print("Failed to get Player object for source: " .. playerSource)
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
