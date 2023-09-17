CREATE TABLE ezdbusers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('User', 'Admin', 'God') NOT NULL DEFAULT 'User'
);

CREATE TABLE player_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    citizenid VARCHAR(255) NOT NULL,
    session_start DATETIME NOT NULL,
    session_end DATETIME,
    duration INT, -- in seconds
    FOREIGN KEY (citizenid) REFERENCES players(citizenid)
);