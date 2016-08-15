'use strict';

angular.module('LiarsPoker')
    .controller('RoomsCtrl', function ($scope, $http, $q) {
        $scope.initializePage = function(showRoomModalValue) {
            $scope.roomNameToCreate = '';

            $scope.showRoomModal = { value: showRoomModalValue };
            $scope.roomList = [];
            $scope.roomMap = {};
            $scope.getAllRooms().then(function() {
                populateRoomMap();
            });
        };

        $scope.socket.on('created room', function(room){
            $scope.initializePage($scope.showRoomModal.value);
        });

        $scope.socket.on('deleted room', function(room){
            if ($scope.selectedRoom.room_id == room.room_id && $scope.user.username != 'admin') {
                alert('ya got dogged kid, this room has been deleted');
            }

            $scope.initializePage(false);
        });

        $scope.socket.on('room status set ', function(room) {
            var room_id = room.room_id;
            var index = findRoomIndex(room_id);
            $scope.roomList[index].room_state = room.room_status;
            if ($scope.selectedRoom.room_id == room_id) {
                $scope.selectedRoom.room_state = room.room_status;
            }
        });

        $scope.selectRoom = function(index) {
            $scope.selectedRoom = $scope.roomList[index];
            console.log($scope.selectedRoom);
            $scope.showRoomModal.value = true;
        };

        var populateRoomMap = function() {
            $scope.roomList.forEach(function(room) {
                $scope.roomMap[room.room_id] = {
                    initialized: false,
                    allMessages: []
                };
            });
        };

        var findRoomIndex = function(room_id) {
            for (var i = 0; i<$scope.roomList.length; i++) {
                if ($scope.roomList[i].room_id == room_id) {
                    return i;
                }
            }

            return -1;
        }

        $scope.getAllRooms = function() {
            var deferred = $q.defer();
            $http.get('/room/all').then(function(response) {
                $scope.roomList = response.data.results;
                console.log(response);
                
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        $scope.createNewRoom = function() {
            var reqBody = { room_name: $scope.roomNameToCreate };
            $http.put('/room', reqBody).then(function(response) {
                // must load new data after adding a new group
                $scope.initializePage();
            }, function(error) {
                console.log(error);
            });
        };

        $scope.initializePage(false);
});





