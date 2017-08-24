'use strict';

// FUTURE: ALL CALLS CURRENTLY USE LEAGUE_ID = 1

angular.module('OfflineAuction')
  .controller('DraftCtrl', function ($scope, $http, $q) {

    $scope.positionOptions = ["ALL", "QB", "RB", "WR", "TE", "DST", "K"];

    $scope.initializePage = function() {
      $scope.currentBid = 0;
      $scope.myBid = 0;
      $scope.timerValue = 0;
      $scope.currentPlayer = null;
      $scope.allTeams = [];
      $scope.currentBidTeamId = -1;
      $scope.availablePlayers=[];
      $scope.isMyTurn = false;
      $scope.chosenPlayer = -1;
      $scope.startingBid = 1;
      $scope.draftStarted = false;
      $scope.done = false;
      $scope.playersToSelect = [];
      $scope.selectedPosition = "ALL";
      $scope.draftPaused = false;
      $scope.team = {};

      removeAllListeners();
      addAllListeners();

      sendGetStateRequest().then(function(response) {
        const draft = response.data;
        $scope.draftStarted = true;
        $scope.draftPaused = draft.draftPaused;
        $scope.currentBid = draft.currentHighBid < 0 ? 0 : draft.currentHighBid;
        $scope.myBid = $scope.currentBid + 1;

        $scope.currentBidTeamId = draft.currentBidTeamId;
        $scope.availablePlayers = draft.availablePlayers;
        $scope.playersToSelect = $scope.availablePlayers;
        $scope.allTeams = draft.teams;

        populateMyTeam();

        const index = findTeamIndex($scope.team.team_id);

        if (index === -1) {
          $scope.done = true;
        } else {
          if (draft.currentBidTeamId === $scope.team.team_id && draft.currentState == 'nomination') {
            $scope.isMyTurn = true;
            createStartingBidOptions();
          }

          if (draft.currentState === 'bid') {
            $scope.currentPlayer = draft.currentNominatedPlayer;
            createPlaceBidOptions();
          }
        }

      }, function(error) {
        getAllTeams();
        getAllAvailablePlayers();
        populateMyTeam();
      });
    };

    $scope.filterByPosition = function(selectedPosition) {
      $scope.playersToSelect = [];
      if (selectedPosition === "ALL") {
        $scope.playersToSelect = $scope.availablePlayers;
      } else {
        for (var i = 0; i<$scope.availablePlayers.length; i++) {
          if ($scope.availablePlayers[i].position === selectedPosition) {
            $scope.playersToSelect.push($scope.availablePlayers[i]);
          }
        }
      }
    };

    function createStartingBidOptions() {
      $scope.startingBidOptions = [];
      for (var i = 1; i<$scope.team.maxBid + 1; i++) {
        $scope.startingBidOptions.push(i);
      }
    };

    function createPlaceBidOptions() {
      $scope.placeBidOptions = [];
      for (var i = $scope.currentBid + 1; i<$scope.team.maxBid + 1; i++) {
        $scope.placeBidOptions.push(i);
      }
    };


    function removeAllListeners() {
      $scope.socket.off('timer tick:1');
      $scope.socket.off('reset timer:1');
      $scope.socket.off('bid placed:1');
      $scope.socket.off('player nominated:1');
      $scope.socket.off('team turn:1');
      $scope.socket.off('player drafted:1');
      $scope.socket.off('draft paused:1');
      $scope.socket.off('draft resumed:1');
      $scope.socket.off('reset round:1');
    };

    function addAllListeners() {
      $scope.socket.on('timer tick:1', function(time) {
        $scope.timerValue = time.time;
        $scope.$apply();
      });

      $scope.socket.on('reset timer:1', function(time) {
        $scope.timerValue = 0;
      });

      $scope.socket.on('draft paused:1', function() {
        $scope.draftPaused = true;
        $scope.$apply();
      });

      $scope.socket.on('draft resumed:1', function() {
        $scope.draftPaused = false;
        $scope.$apply();
      });

      $scope.socket.on('reset round:1', function() {
        $scope.initializePage();
      });

      $scope.socket.on('bid placed:1', function(data) {
        $scope.currentBid = data.currentHighBid;
        $scope.currentBidTeamId = data.team_id;
        $scope.myBid = $scope.currentBid + 1;
        createPlaceBidOptions();
        $scope.$apply();
      });

      $scope.socket.on('player nominated:1', function(data) {
        $scope.currentPlayer = data.player;
        $scope.currentBid = data.startingBid;
        $scope.currentBidTeamId = data.team_id;
        $scope.myBid = $scope.currentBid + 1;
        createPlaceBidOptions();
        $scope.$apply();
      });

      $scope.socket.on('team done:1', function(data) {
        if (data.team_id === $scope.team.team_id) {
          $scope.done = true;
          $scope.$apply();
        }
      });

      // do more here
      $scope.socket.on('player drafted:1', function(data) {
          var playerName = data.player.first_name + " " + data.player.last_name;
          var price = data.amount;
          var team_name = data.team_name;
          $scope.initializePage();
          $scope.addSuccess(playerName + " drafted by " + team_name + " for $" + price);
          //alert();
      });

      $scope.socket.on('team turn:1', function(data) {
        if (data.team_id == $scope.team.team_id) {
          $scope.isMyTurn = true;
          getAllAvailablePlayers().then(function() {});
          createStartingBidOptions();
          $scope.$apply();
        }
      });
    };

    $scope.showPlaceBid = function() {
      return !($scope.draftPaused) && !($scope.done) && !($scope.currentPlayer == null || $scope.currentPlayer == {}) && ($scope.team.team_id != $scope.currentBidTeamId);
    };

    $scope.currentBidTeam = function() {
      return findTeamIndex($scope.currentBidTeamId) == -1 ? "" : $scope.allTeams[findTeamIndex($scope.currentBidTeamId)].name;
    };

    function findTeamIndex(team_id) {
      for (var i = 0; i<$scope.allTeams.length; i++) {
        if ($scope.allTeams[i].team_id == team_id) {
            return i;
        }
      }
      return -1;
    };

    $scope.placeBid = function() {
      sendPlaceBidRequest().then(function(response) {
        console.log("Bid placed");
      });
    };

    $scope.nominatePlayer = function() {
      if ($scope.chosenPlayer < 0 || $scope.startingBid < 1) {
        return;
      } else {
        sendNominatePlayerRequest().then(function(response){
          console.log("Player nominated");
          $scope.isMyTurn = false;
        });
      }
    };

    function populateMyTeam() {
      for (var i = 0; i<$scope.allTeams.length; i++) {
        if ($scope.allTeams[i].user_id == $scope.user.user_id){
          $scope.team = $scope.allTeams[i];
          $scope.team.maxBid = $scope.team.money_remaining - $scope.team.remaining_roster_spots + 1;
        }
      }
    }

    function getAllTeams() {
      const deferred = $q.defer();
      $http.get('/league/teams?league_id=1').then(function(response) {
        $scope.allTeams = response.data.results;
        deferred.resolve();
      }, function(error) {
        deferred.reject();
      });
      return deferred.promise;
    };

    function sendPlaceBidRequest() {
      const deferred = $q.defer();
      const reqBody = {
        league_id: 1,
        bid: $scope.myBid,
        team_id: $scope.team.team_id
      };
      $http.post('/draft/placeBid', reqBody).then(function(response) {
          deferred.resolve();
      }, function(error) {
          deferred.reject();
      });
      return deferred.promise;
    };

    function sendNominatePlayerRequest() {
      const deferred = $q.defer();
      const reqBody = {
        league_id: 1,
        player_id: $scope.chosenPlayer,
        startingBid: $scope.startingBid
      };
      $http.post('/draft/nominatePlayer', reqBody).then(function(response) {
        deferred.resolve();
      }, function(error) {
        deferred.reject();
      });
      return deferred.promise;
    };

    function sendGetStateRequest() {
      const deferred = $q.defer();
      $http.get('/draft/state?league_id=1', {league_id: 1}).then(function(response) {
        deferred.resolve(response);
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    };

    function getAllAvailablePlayers() {
      const deferred = $q.defer();
      $http.get('/league/availablePlayers?league_id=1').then(function(response) {
          $scope.availablePlayers = response.data.results;
          deferred.resolve();
      }, function(error) {
          deferred.reject();
      });
      return deferred.promise;
    };

    $scope.initializePage();
});
