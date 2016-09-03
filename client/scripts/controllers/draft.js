'use strict';

angular.module('OfflineAuction')
    .controller('DraftCtrl', function ($scope, $http, $q) {

        $scope.currentBid = 0;
        $scope.myBid = 0;
        $scope.timerValue = 0;
        $scope.currentPlayer = null;
        $scope.allUsers = [];
        $scope.currentBidUserId = -1;
        $scope.availablePlayers = [];
        $scope.isMyTurn = false;
        $scope.chosenPlayer = -1;
        $scope.startingBid = 1;
        $scope.NEGATIVE_ONE = -1;
        $scope.draftStarted = false;
        $scope.done = false;
        $scope.selectedPosition = "ALL";
        $scope.positionOptions = ["ALL", "QB", "RB", "WR", "TE", "DST", "K"];
        $scope.playersToSelect = [];

        $scope.initializePage = function() {
            $scope.currentBid = 0;
            $scope.myBid = 0;
            $scope.timerValue = 0;
            $scope.currentPlayer = null;
            $scope.allUsers = [];
            $scope.currentBidUserId = -1;
            $scope.availablePlayers=[];
            $scope.isMyTurn = false;
            $scope.chosenPlayer = -1;
            $scope.startingBid = 1;
            $scope.draftStarted = false;
            $scope.done = false;
            $scope.playersToSelect = [];

            removeAllListeners();
            addAllListeners();

            sendGetStateRequest().then(function(response) {
              var draft = response.data;

              $scope.draftStarted = true;
              $scope.currentBid = draft.currentHighBid < 0 ? 0 : draft.currentHighBid;
              $scope.myBid = $scope.currentBid + 1;

              $scope.currentBidUserId = draft.currentHighBidUserId;
              $scope.availablePlayers = draft.availablePlayers;
              $scope.playersToSelect = $scope.availablePlayers;
              $scope.allUsers = draft.users;

              var index = findUserIndex($scope.user.user_id);

              if (index === -1) {
                $scope.done = true;
              } else {
                  $scope.user.cash_remaining = $scope.allUsers[index].cash_remaining;
                  $scope.user.remaining_roster_spots = $scope.allUsers[index].remaining_roster_spots;
                  $scope.user.maxBid = $scope.user.cash_remaining - $scope.user.remaining_roster_spots + 1;

                  if (draft.currentTurnUserId === $scope.user.user_id && draft.currentState == 'nomination') {
                    $scope.isMyTurn = true;
                    createStartingBidOptions();
                  }

                  if (draft.currentState === 'bid') {
                    $scope.currentPlayer = draft.currentNominatedPlayer;
                    createPlaceBidOptions();
                  }
            }

            },  function(error) {
              getAllUsers();
              getAllAvailablePlayers();
              //$scope.user.cash_remaining = 207;
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
            for (var i = 1; i<$scope.user.maxBid + 1; i++) {
                $scope.startingBidOptions.push(i);
            }
        };

        function createPlaceBidOptions() {
            $scope.placeBidOptions = [];
            for (var i = $scope.currentBid + 1; i<$scope.user.maxBid + 1; i++) {
                $scope.placeBidOptions.push(i);
            }
        };


        function removeAllListeners() {
            $scope.socket.off('timer tick ');
            $scope.socket.off('reset timer');
            $scope.socket.off('bid placed');
            $scope.socket.off('player nominated');
            $scope.socket.off('user turn');
            $scope.socket.off('player drafted');
        };

        function addAllListeners() {
            $scope.socket.on('timer tick', function(time) {
                $scope.timerValue = time.time;
                $scope.$apply();
            });

            $scope.socket.on('reset timer', function(time) {
                $scope.timerValue = 0;
            });

            $scope.socket.on('bid placed', function(data) {
                $scope.currentBid = data.currentHighBid;
                $scope.currentBidUserId = data.user_id;
                $scope.myBid = $scope.currentBid + 1;
                createPlaceBidOptions();
                $scope.$apply();
            });

            $scope.socket.on('player nominated', function(data) {
                $scope.currentPlayer = data.player;
                $scope.currentBid = data.startingBid;
                $scope.currentBidUserId = data.user_id;
                $scope.myBid = $scope.currentBid + 1;
                createPlaceBidOptions();
                $scope.$apply();
            });

            $scope.socket.on('user done', function(data) {
                if (data.user_id === $scope.user.user_id) {
                    $scope.done = true;
                    $scope.$apply();
                }
            });

            // do more here
            $scope.socket.on('player drafted', function(data) {
                var playerName = data.player.first_name + " " + data.player.last_name;
                var price = data.amount;
                var username = data.username;
                $scope.initializePage();
                $scope.addSuccess(playerName + " drafted by " + username + " for " + price);
                //alert();
            });

            $scope.socket.on('user turn', function(data) {
                if (data.user_id == $scope.user.user_id) {
                    $scope.isMyTurn = true;
                    getAllAvailablePlayers().then(function() {
                      //$scope.$apply();
                    });

                }
            });
        };

        $scope.showPlaceBid = function() {
          return !($scope.done) && !($scope.currentPlayer == null || $scope.currentPlayer == {}) && ($scope.user.user_id != $scope.currentBidUserId);
        };

        $scope.currentBidUser = function() {
            return findUserIndex($scope.currentBidUserId) == -1 ? "" : $scope.allUsers[findUserIndex($scope.currentBidUserId)].username;
        };

        var findUserIndex = function(user_id) {
            for (var i = 0; i<$scope.allUsers.length; i++) {
                if ($scope.allUsers[i].user_id == user_id) {
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

        $scope.startDraft = function() {
            sendStartDraftRequest();
        };

        function getAllUsers() {
            var deferred = $q.defer();
            $http.get('/user/all').then(function(response) {
                $scope.allUsers = response.data.results;
                console.log($scope.allUsers);

                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        function sendPlaceBidRequest() {
            var deferred = $q.defer();
            var reqBody = {
              bid: $scope.myBid,
            };
            $http.post('/draft/placeBid', reqBody).then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        function sendNominatePlayerRequest() {
            var deferred = $q.defer();
            var reqBody = {
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


        function sendStartDraftRequest() {
            var deferred = $q.defer();
            $http.post('/draft/start').then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        function sendGetStateRequest() {
            var deferred = $q.defer();
            $http.get('/draft/draftState').then(function(response) {
                deferred.resolve(response);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        function getAllAvailablePlayers() {
            var deferred = $q.defer();
            $http.get('/draft/getAllAvailablePlayers').then(function(response) {
                $scope.availablePlayers = response.data.results;
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        $scope.initializePage();
});
