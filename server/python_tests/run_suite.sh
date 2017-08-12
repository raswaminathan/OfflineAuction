#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

function run_test {
  logFile=$1
  testFile=$2

  rm -rf ${DIR}/${logFile}
  ${DIR}/../bin/start-from-scratch.sh > ${DIR}/${logFile} 2>&1 &

  sleep 2
  python ${DIR}/${testFile}

  # should do something smarter here - right now this will kill all running node instances
  kill $(pgrep node)
}

run_test users-test.log users.py
run_test leagues-test.log leagues.py
run_test teams-test.log teams.py
