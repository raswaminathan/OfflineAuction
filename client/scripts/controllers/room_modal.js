'use strict';

angular.module('LiarsPoker')
    .controller('RoomModalCtrl', function ($scope, $http, $q, $rootScope, $location, $window) {

        $scope.allMessages = [];
        $scope.chatMessage = '';
        $scope.colors = {readyColor: 'lawngreen', notReadyColor: 'red', eliminatedColor: 'red'};
        $scope.myReadyToStart = false;
        $scope.myIndex = -1;
        $scope.dealer_id = -1;
        $scope.hasCards = false;
        $scope.myCards = [];
        $scope.currentTurnId = -1;
        $scope.isMyTurn = false;
        $scope.myCalledHand = {};
        $scope.currentCalledHand = {};
        $scope.handHistory = [];
        $scope.handTypes = ['HighCard', 'Pair', 'TwoPair', 'ThreeOfAKind', 'Straight', 'Flush', 'FullHouse', 'FourOfAKind', 'StraightFlush'];
        $scope.oneValueHandTypes = ['HighCard', 'Pair', 'ThreeOfAKind', 'Straight', 'Flush', 'FourOfAKind', 'StraightFlush'];
        $scope.suitHandTypes = ['Flush', 'StraightFlush'];
        $scope.twoValueHandTypes = ['TwoPair', 'FullHouse'];
        $scope.suits = ['diamond', 'club', 'heart', 'spade'];
        $scope.values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        $scope.showSuitChoice = false;
        $scope.showTopAndBottomValueChoice = false;
        $scope.showValueChoice = false;
        $scope.timerValue = -1;

        $scope.initializeRoomModal = function() {

            $scope.allMessages = [];
            for (var i = 0; i<$scope.roomMap[$scope.selectedRoom.room_id].allMessages.length; i++) {
                $scope.allMessages.push($scope.roomMap[$scope.selectedRoom.room_id].allMessages[i]);
            }

            removeAllListeners();
            registerSocketEvents();

            $scope.usersInRoom = [];
            $scope.alreadyInRoom = false;
            $scope.hasEnteredRoom = false;
            $scope.myReadyToStart = false;
            $scope.myIndex = -1;
            $scope.dealer_id = -1;
            $scope.hasCards = false;
            $scope.myCards = [];
            $scope.currentTurnId = -1;
            $scope.isMyTurn = false;
            $scope.showSuitChoice = false;
            $scope.showTopAndBottomValueChoice = false;
            $scope.showValueChoice = false;
            $scope.myCalledHand = {};
            $scope.currentCalledHand = {};
            $scope.handHistory = [];
            $scope.gameStarted = $scope.selectedRoom.room_state == "playing" ? true : false;

            $scope.getAllUsersInRoom().then(function(response) {
                $scope.usersInRoom = response.data.results;
                populateColorsAndUpdateUserInfo();
                if ($scope.gameStarted) {
                    resetGameColors();
                    getGame().then(function(response) {
                        console.log(response);
                        var game = response.data;
                        setDealer(game.dealer_id);
                        $scope.selectedRoom.dealer_id = game.dealer_id;
                        if (game.gameState == 'postDeal' && $scope.alreadyInRoom) {
                            $scope.hasCards = true;
                            $scope.myCards = game.user.hand;
                            addImagesToMyCards();
                            setTurnBasedOnData(game);
                            $scope.currentCalledHand = game.currentHand;
                            $scope.handHistory = game.handHistory;
                        }
                    }, function(error) {
                        console.log("OH NO");
                    });
                    
                }
            });
        };

        $scope.isActive = true;

        $window.onfocus = function () { 
          $scope.isActive = true;
          $scope.PageTitleNotification.Off();
        }; 

        $window.onblur = function () { 
          $scope.isActive = false;
        };

        var removeAllListeners = function() {
            $scope.socket.off('added user');
            $scope.socket.off('chat message');
            $scope.socket.off('toggle ready');
            $scope.socket.off('started game ' + $scope.selectedRoom.room_id);
            $scope.socket.off('user is eliminated ' + $scope.selectedRoom.room_id);
            $scope.socket.off('user has left ' + $scope.selectedRoom.room_id);
            $scope.socket.off('game over ' + $scope.selectedRoom.room_id);
            $scope.socket.off("dealt cards to " + $scope.user.user_id + " in room " + $scope.selectedRoom.room_id);
            $scope.socket.off("set turn " + $scope.selectedRoom.room_id);
            $scope.socket.off("hand called " + $scope.selectedRoom.room_id);
            $scope.socket.off("user adds a card " + $scope.selectedRoom.room_id);
            $scope.socket.off("correct BS call " + $scope.selectedRoom.room_id);
            $scope.socket.off("incorrect BS call " + $scope.selectedRoom.room_id);
            $scope.socket.off("correct redraw call " + $scope.selectedRoom.room_id);
            $scope.socket.off("incorrect redraw call " + $scope.selectedRoom.room_id);
            $scope.socket.off("reset round " + $scope.selectedRoom.room_id);
            $scope.socket.off("time " + $scope.selectedRoom.room_id);
        };

        var registerSocketEvents = function() {
            $scope.socket.on('added user', function(user){
                var entered = $scope.hasEnteredRoom;
                $scope.initializeRoomModal();
                $scope.hasEnteredRoom = entered;
                $scope.$apply();
            });

            $scope.socket.on('chat message', function(msg) {
                if (msg.room_id == $scope.selectedRoom.room_id && $scope.roomMap[$scope.selectedRoom.room_id].allMessages.indexOf(msg) == -1) {
                    console.log('chattt');
                    if (!$scope.isActive) {
                        $scope.PageTitleNotification.On("chat message..");
                    }
                    $scope.roomMap[$scope.selectedRoom.room_id].allMessages.push(msg);
                    $scope.allMessages.push(msg);
                    
                    $scope.$apply();
                    updateScroll();
                }
            });

            // shouldnt reset modal here, just make the necessary update on the frontend 
            $scope.socket.on('toggle ready', function(user) {
                console.log('toggle ready');
                var index = findUserIndex(user.user_id);
                console.log(index + " " + user);
                $scope.usersInRoom[index].ready_to_start = user.ready_to_start;
                populateColorsAndUpdateUserInfo();
                $scope.$apply();
            });

            $scope.socket.on('started game ' + $scope.selectedRoom.room_id, function(result) {
                console.log('started game');
                $scope.selectedRoom.room_state = "playing";
                $scope.gameStarted = true;
                resetGameColors();
                setDealer(result.dealer_id);
                $scope.$apply();
            });

            $scope.socket.on('user is eliminated ' + $scope.selectedRoom.room_id, function(user) {
                console.log('user is eliminated');
                var index = findUserIndex(user.user_id);
                $scope.usersInRoom[index].color = $scope.colors.eliminatedColor;
                $scope.$apply();
            });

            $scope.socket.on('user has left ' + $scope.selectedRoom.room_id, function(user) {
                if (user.user_id != $scope.user.user_id) {
                    console.log('user has left');
                    alert(user.username + " has left the room");
                    var index = findUserIndex(user.user_id);
                    $scope.usersInRoom.splice(index, 1);
                    
                    $scope.$apply();
                }
            });

            $scope.socket.on('game over ' + $scope.selectedRoom.room_id, function(user) {
                console.log('game over ');
                alert("game over, " + user.username + " wins!");
                $scope.selectedRoom.room_state = "waiting";
                $scope.initializeRoomModal();
                $scope.hasEnteredRoom = true;
                // $scope.$apply();
                // $window.location.reload();
            });

            $scope.socket.on("dealt cards to " + $scope.user.user_id + " in room " + $scope.selectedRoom.room_id, function(hand) {
                console.log("received cards");

                $scope.hasCards = true;
                $scope.myCards = hand;
                addImagesToMyCards();
                $scope.showSuitChoice = false;
                $scope.showTopAndBottomValueChoice = false;
                $scope.showValueChoice = false;
            });

            $scope.socket.on("set turn " + $scope.selectedRoom.room_id, function(data) {
                console.log ("set turn");
                setTurnBasedOnData(data);
                $scope.$apply();
            });

            $scope.socket.on("hand called " + $scope.selectedRoom.room_id, function(data) {
                $scope.currentCalledHand = data.hand;
                $scope.handHistory.push(data);
                $scope.$apply();
            });

            $scope.socket.on("user adds a card " + $scope.selectedRoom.room_id, function(userWhoGotACard) {
                var index = findUserIndex(userWhoGotACard.user_id);
                $scope.usersInRoom[index].number_of_cards++;
                $scope.$apply();
            });

            $scope.socket.on("correct BS call " + $scope.selectedRoom.room_id, function(result) {
                var index = findUserIndex(result.user_id);
                var cards = result.cards;
                var cardsString = "";
                for (var i = 0; i<cards.length; i++) {
                    cardsString+=cards[i].unicodeRepresentation + " ";
                }
                alert("correct BS call made by " + $scope.usersInRoom[index].username + " on hand " + $scope.getReadableHand($scope.currentCalledHand) + "\n" + "cards in room were: " + cardsString);
            });

            $scope.socket.on("incorrect BS call " + $scope.selectedRoom.room_id, function(result) {
                var index = findUserIndex(result.user_id);
                var cards = result.cards;
                var cardsString = "";
                for (var i = 0; i<cards.length; i++) {
                    cardsString+=cards[i].unicodeRepresentation+ " ";
                }
                alert("incorrect BS call made by " + $scope.usersInRoom[index].username + " on hand " + $scope.getReadableHand($scope.currentCalledHand) + "\n" + "cards in room were: " + cardsString);
            });

            $scope.socket.on("correct redraw call " + $scope.selectedRoom.room_id, function(result) {
                var index = findUserIndex(result.user_id);
                var cards = result.cards;
                var cardsString = "";
                for (var i = 0; i<cards.length; i++) {
                    cardsString+=cards[i].unicodeRepresentation + " ";
                }
                alert("correct redraw call made by " + $scope.usersInRoom[index].username + " on hand " + $scope.getReadableHand($scope.currentCalledHand) + "\n" + "cards in room were: " + cardsString);
            });

            $scope.socket.on("incorrect redraw call " + $scope.selectedRoom.room_id, function(result) {
                var index = findUserIndex(result.user_id);
                var cards = result.cards;
                var cardsString = "";
                for (var i = 0; i<cards.length; i++) {
                    cardsString+=cards[i].unicodeRepresentation + " ";
                }
                alert("incorrect redraw call made by " + $scope.usersInRoom[index].username + " on hand " + $scope.getReadableHand($scope.currentCalledHand) + "\n" + "cards in room were: " + cardsString);
            });

            $scope.socket.on("reset round " + $scope.selectedRoom.room_id, function(dealer) {
                resetRound();
                setDealer(dealer.dealer_id);
                $scope.$apply();
            });

            $scope.socket.on("time " + $scope.selectedRoom.room_id, function(time) {
                console.log(time.time);
                timerValue = time.time;
            });
        };

        var addImagesToMyCards = function() {
            $scope.myCards.forEach(function(card) {
                var value = card.value;
                var suit = card.suit;

                if (value == '10') {
                    value = '0';
                }

                card.image = 'images/' + value + suit.charAt(0).toUpperCase() + '.svg';
            });
        };

        var setTurnBasedOnData = function(data) {
            resetCurrentTurnId();

            var index = findUserIndex(data.currentTurnId);
            $scope.usersInRoom[index].isTurn = true;
            $scope.currentTurnId = data.currentTurnId;
            if ($scope.usersInRoom[index].user_id == $scope.user.user_id) {
                $scope.isMyTurn = true;
                $scope.myCalledHand = {};
            } else {
                $scope.isMyTurn = false;
            }
        };

        var resetCurrentTurnId = function() {
            console.log($scope.usersInRoom);
            console.log($scope.currentTurnId);
            if ($scope.currentTurnId != -1) {
                var currentTurnIndex = findUserIndex($scope.currentTurnId);

                if (currentTurnIndex != -1) {
                    $scope.usersInRoom[currentTurnIndex].isTurn = false;
                }
            }
        };

        var resetRound = function() {
            $scope.hasCards = false;
            $scope.myCards = [];
            var indexOfDealer = findUserIndex($scope.dealer_id);

            if (indexOfDealer != -1) {
                $scope.usersInRoom[indexOfDealer].isDealer = false;
            }
            $scope.myCalledHand = {};
            $scope.currentCalledHand = {};
            $scope.handHistory = [];
            $scope.showSuitChoice = false;
            $scope.showTopAndBottomValueChoice = false;
            $scope.showValueChoice = false;
            resetCurrentTurnId();
        };

        $scope.joinRoom = function() {
            var reqBody = {room_id: $scope.selectedRoom.room_id};
            $http.post('/room/addUser', reqBody).then(function(response) {
                console.log("successfully added!");
                $scope.initializeRoomModal();
            }, function(error) {

            });
        };

        $scope.enterRoom = function() {
            $scope.hasEnteredRoom = true;
        };

        $scope.sendMessage = function() {
            $scope.socket.emit('chat message', {room_id: $scope.selectedRoom.room_id, username: $scope.user.username, message: $scope.chatMessage});
            $scope.chatMessage = "";
        }

        $scope.deleteRoom = function() {
            $http.delete('/room?room_id='+ $scope.selectedRoom.room_id).then(function(response) {
                console.log("successfully removed!");
                $scope.initializePage(false);
            }, function(error) {

            });
        };

        $scope.leaveRoom = function() {
            sendLeaveRoomRequest().then(function(result) {
                $window.location.reload();
            }, function(error) {
                alert("can't leave right now, try again before cards are dealt next");
            });
        };

        $scope.getAllUsersInRoom = function() {
            var deferred = $q.defer();
            $http.get('/room/users?room_id=' + $scope.selectedRoom.room_id).then(function(response) {
                deferred.resolve(response);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        $scope.toggleReadyToStart = function() {
            $scope.myReadyToStart = !$scope.myReadyToStart;
            var reqBody = {room_id: $scope.selectedRoom.room_id, ready_state: $scope.myReadyToStart};
            $http.post('/room/toggleReady', reqBody).then(function(response) {
                console.log(response);
                if (response.data.room_status == "playing") {
                    $scope.gameStarted = true;
                    prepareAndStartGame();
                }
            }, function(error) {
                console.log("HRERE");
            });
        };

        $scope.dealCards = function() {
            deal();
        };

        $scope.callHand = function() {
            sendCallHandRequest().then(function(result) {

            }, function(error) {
                alert("Invalid hand, try again!");
            });
        };

        $scope.callBS = function() {
            sendCallBSRequest().then(function(result) {

            }, function(error) {
                alert("Invalid BS call, try again!");
            });
        };

        $scope.callRedraw = function() {
            sendCallRedrawRequest().then(function(result) {

            }, function(error) {
                alert("Invalid Redraw call, try again!");
            });
        };

        $scope.selectedHandType = function() {
            var handType = $scope.myCalledHand.handType;
            if (handType == "") {
                return;
            }

            $scope.showSuitChoice = false;
            $scope.showTopAndBottomValueChoice = false;
            $scope.showValueChoice = false;

            if ($scope.oneValueHandTypes.indexOf(handType) != -1) {
                $scope.showValueChoice = true;
                $scope.myCalledHand.bottomValue = '2';
                $scope.myCalledHand.suit = 'club';
            }

            if ($scope.twoValueHandTypes.indexOf(handType) != -1) {
                $scope.showTopAndBottomValueChoice = true;
                $scope.myCalledHand.suit = 'club';
            }

            if ($scope.suitHandTypes.indexOf(handType) != -1) {
                $scope.showSuitChoice = true;
                $scope.myCalledHand.suit = '';
            }
        };

        $scope.getReadableHand = function(hand) {
            var toReturn = "";

            if (hand == null || !hand.handType) {
                return;
            }

            var handType = hand.handType;
            toReturn += handType;

            if ($scope.oneValueHandTypes.indexOf(handType) != -1) {
                toReturn += " " + hand.topValue;
            }

            if ($scope.suitHandTypes.indexOf(handType) != -1) {
                toReturn += " " + hand.suit;
            }

            if ($scope.twoValueHandTypes.indexOf(handType) != -1) {
                toReturn += " " + hand.topValue + " " + hand.bottomValue;
            }

            return toReturn;
        };

        $scope.getTotalCards = function() {
            var total = 0;
            for (var i = 0; i<$scope.usersInRoom.length; i++) {
                if ($scope.usersInRoom[i].number_of_cards < 6) {
                    total+=$scope.usersInRoom[i].number_of_cards;
                }
            }

            return total;
        };

        var prepareAndStartGame = function() {
            resetGameColors();
            startGame();
        };

        var resetGameColors = function() {
            $scope.usersInRoom.forEach(function(user) {
                user.color = '';
            });
        };

        var startGame = function() {
            var deferred = $q.defer();
            var reqBody = {room_id: $scope.selectedRoom.room_id};
            $http.post('/game/start', reqBody).then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        var deal = function() {
            var deferred = $q.defer();
            var reqBody = {room_id: $scope.selectedRoom.room_id};
            $http.post('/game/deal', reqBody).then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        var getGame = function() {
            var deferred = $q.defer();
            var reqBody = {room_id: $scope.selectedRoom.room_id};
            $http.post('/game/getGame', reqBody).then(function(response) {
                deferred.resolve(response);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        var setNumberOfCards = function(number_of_cards) {
            var deferred = $q.defer();
            var reqBody = {room_id: $scope.selectedRoom.room_id, number_of_cards: number_of_cards};
            $http.post('/game/setNumberOfCards', reqBody).then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        var sendCallHandRequest = function() {
            var deferred = $q.defer();
            var reqBody = $scope.myCalledHand;
            reqBody.room_id = $scope.selectedRoom.room_id;
            $http.post('/game/callHand', reqBody).then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        var sendLeaveRoomRequest = function() {
            var deferred = $q.defer();
            var reqBody = {room_id: $scope.selectedRoom.room_id, user_id: $scope.user.user_id};
            $http.post('/game/leave', reqBody).then(function(response) {
                deferred.resolve(response);
            }, function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        var sendCallBSRequest = function() {
            var deferred = $q.defer();
            var reqBody = {room_id: $scope.selectedRoom.room_id};
            $http.post('/game/callBS', reqBody).then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        var sendCallRedrawRequest = function() {
            var deferred = $q.defer();
            var reqBody = {room_id: $scope.selectedRoom.room_id};
            $http.post('/game/callRedraw', reqBody).then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        var setDealer = function(dealer_id) {
            $scope.usersInRoom[findUserIndex(dealer_id)].isDealer = true;
            $scope.dealer_id = dealer_id;
        };

        var findUserIndex = function(user_id) {
            for (var i = 0; i<$scope.usersInRoom.length; i++) {
                if ($scope.usersInRoom[i].user_id == user_id) {
                    return i;
                }
            }

            return -1;
        };
 
        var populateColorsAndUpdateUserInfo = function() {
            for (var i = 0; i<$scope.usersInRoom.length; i++) {
                var user = $scope.usersInRoom[i];
                if (user.username == $scope.user.username) {
                    $scope.myReadyToStart = user.ready_to_start;
                    $scope.alreadyInRoom = true;
                    $scope.myIndex = i;
                }

                if (user.ready_to_start) {
                    user.color = $scope.colors.readyColor;
                } else {
                    user.color = $scope.colors.notReadyColor;
                }

                if (user.number_of_cards == 6) {
                    user.color.$scope.colors.eliminatedColor;
                }
            }   
        };

        $scope.amIDealer = function() {
            return $scope.user.user_id == $scope.dealer_id;
        };

        var updateScroll = function() {
            var element = document.getElementById("scrollMessages");
            var isScrolledToBottom = element.scrollHeight - element.clientHeight <= element.scrollTop + 35;
            if (isScrolledToBottom) {
                element.scrollTop = element.scrollHeight;
            }
        };
        
        $scope.initializeRoomModal();
        
});
