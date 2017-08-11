#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

rm ${DIR}/tests.log
${DIR}/../bin/start-from-scratch.sh > ${DIR}/tests.log 2>&1 &

sleep 2
python ${DIR}/users.py

# should do something smarter here - right now this will kill all running node instances 
kill $(pgrep node)
