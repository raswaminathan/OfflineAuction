'use strict';

angular.module('OfflineAuction')
    .controller('DraftCtrl', function ($scope, $http, $q) {

        $scope.currentBid = 0;
        $scope.myBid = 0;
        $scope.timerValue = 0;
        $scope.currentPlayer = {};
        $scope.allUsers = [];
        $scope.currentBidUserId = -1;
        $scope.availablePlayers = [];
        $scope.isMyTurn = false;
        $scope.chosenPlayer = -1;
        $scope.startingBid = -1;
        $scope.NEGATIVE_ONE = -1;

        $scope.initializePage = function() {
            $scope.currentBid = 0;
            $scope.myBid = 0;
            $scope.timerValue = 0;
            $scope.currentPlayer = {};
            $scope.allUsers = [];
            $scope.currentBidUserId = -1;
            $scope.allPlayers=[];
            $scope.isMyTurn = false;
            $scope.chosenPlayer = -1;
            $scope.startingBid = -1;
            removeAllListeners();
            addAllListeners();
            getAllUsers();
            getAllAvailablePlayers();
        };


        function removeAllListeners() {
            $scope.socket.off('timer tick ');
            $scope.socket.off('reset timer');
            $scope.socket.off('bid placed');
            $scope.socket.off('player nominated');
            $scope.socket.off('user turn');
        };

        function addAllListeners() {
            $scope.socket.on('timer tick', time => {
                $scope.timerValue = time;
            });

            $scope.socket.on('reset timer', time => {
                $scope.timerValue = 0;
            });

            $scope.socket.on('bid placed', data => {
                $scope.currentBid = data.currentHighBid;
                $scope.currentBidUserId = data.user_id;
                $scope.myBid = currentHighBid + 1;
            });

            $scope.socket.on('player nominated', data => {
                $scope.currentPlayer = data.player;
                $scope.currentBid = $scope.startingBid;
                $scope.currentBidUserId = data.user_id;
            });

            $scope.socket.on('user turn', data => {
                if (data.user_id == $scope.user.user_id) {
                    $scope.isMyTurn = true;
                    $scope.$apply();
                }
            });
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
            $scope.socket.emit('place bid', {user_id: $scope.user.user_id, bid: $scope.myBid});
            $scope.myBid = currentHighBid + 1;
        };

        $scope.nominatePlayer = function() {
            
            if ($scope.chosenPlayer < 0) {
                return;
            } else {

                console.log($scope.chosenPlayer);
                $scope.socket.emit('nominate player', {user_id: $scope.user.user_id, 
                    startingBid: $scope.startingBid, player_id: $scope.chosenPlayer});
            }
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





