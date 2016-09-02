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
            removeAllListeners();
            addAllListeners();

            sendGetStateRequest().then(response => {
              var draft = response.data;

              $scope.draftStarted = true;
              $scope.currentBid = draft.currentHighBid;
              $scope.myBid = $scope.currentBid + 1;

              $scope.currentBidUserId = draft.currentHighBidUserId;
              $scope.availablePlayers = draft.availablePlayers;
              $scope.allUsers = draft.users;
              if (draft.currentTurnUserId === $scope.user.user_id && draft.currentState == 'nomination') {
                $scope.isMyTurn = true;
              }

              if (draft.currentState == 'bid') {
                $scope.currentPlayer = draft.currentNominatedPlayer;
              }

              var index = findUserIndex($scope.user.user_id);
              $scope.user.cash_remaining = $scope.allUsers[index].cash_remaining;
              $scope.user.remaining_roster_spots = $scope.allUsers[index].remaining_roster_spots;
              $scope.user.maxBid = $scope.user.cash_remaining - $scope.user.remaining_roster_spots + 1;

            }, error => {
              getAllUsers();
              getAllAvailablePlayers();
              $scope.user.cash_remaining = 207;
            });

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
            $scope.socket.on('timer tick', time => {
                $scope.timerValue = time.time;
                $scope.$apply();
            });

            $scope.socket.on('reset timer', time => {
                $scope.timerValue = 0;
            });

            $scope.socket.on('bid placed', data => {
                $scope.currentBid = data.currentHighBid;
                $scope.currentBidUserId = data.user_id;
                $scope.myBid = $scope.currentHighBid + 1;
            });

            $scope.socket.on('player nominated', data => {
                console.log(data);
                $scope.currentPlayer = data.player;
                $scope.currentBid = data.startingBid;
                $scope.currentBidUserId = data.user_id;
                $scope.$apply();
            });

            // do more here
            $scope.socket.on('player drafted', data => {
                $scope.initializePage();
                alert("player drafted");
            });

            $scope.socket.on('user turn', data => {
                if (data.user_id == $scope.user.user_id) {
                    $scope.isMyTurn = true;
                    getAllAvailablePlayers().then(function() {
                      //$scope.$apply();
                    });

                }
            });
        };

        $scope.showPlaceBid = function() {
          return !($scope.currentPlayer == null || $scope.currentPlayer == {});
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

            sendPlaceBidRequest().then(response => {
              console.log("Bid placed");
            });
        };

        $scope.nominatePlayer = function() {

            if ($scope.chosenPlayer < 0 || $scope.startingBid < 1) {
                return;
            } else {
                sendNominatePlayerRequest().then(response => {
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
                console.log($scope.availablePlayers);

                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        $scope.initializePage();
});
