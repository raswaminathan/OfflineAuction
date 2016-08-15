USE test_auction;
CREATE TABLE IF NOT EXISTS user (user_id INT NOT NULL AUTO_INCREMENT, username varchar(255) NOT NULL UNIQUE, password varchar(255) NOT NULL, PRIMARY KEY (user_id));
