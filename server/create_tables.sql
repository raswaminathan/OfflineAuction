USE test_auction;
CREATE TABLE IF NOT EXISTS user (user_id INT NOT NULL AUTO_INCREMENT, remaining_roster_spots INT, username varchar(255) NOT NULL UNIQUE, cash_remaining INT, password varchar(255) NOT NULL, PRIMARY KEY (user_id));
CREATE TABLE IF NOT EXISTS player (player_id INT NOT NULL AUTO_INCREMENT, first_name varchar(255) NOT NULL, last_name varchar(255) NOT NULL, position ENUM('QB', 'WR', 'RB', 'TE', 'K', 'DST'), available BOOLEAN DEFAULT 1, team varchar(255) NOT NULL, PRIMARY KEY (player_id));
CREATE TABLE IF NOT EXISTS user_player (user_id INT, player_id INT, cost INT NOT NULL, PRIMARY KEY (player_id, user_id), FOREIGN KEY (player_id) REFERENCES player(player_id)ON DELETE CASCADE,FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE);
DELETE FROM player;