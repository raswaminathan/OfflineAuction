
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
### WIPE AND RECREATE MYSQL DATABASE

echo "Dropping and recreating db test_auction..."
mysql -e "drop database test_auction"
mysql -e "create database test_auction"

### CHECK IF REDIS IS RUNNING

echo "Checking if redis is already running..."

redisCheck=$(redis-cli ping)
if [[ ${redisCheck} = "PONG" ]]; then
  echo "Redis is already running"
else
  echo "Starting redis in the background..."
  nohup redis-server &>/dev/null &
  sleep 1
fi

echo "Starting node server!"
node ${DIR}/../server.js
