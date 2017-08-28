'use strict';

/// FUTURE: DON'T HARDCODE LEAGUE TO 1

angular.module('OfflineAuction')
  .controller('DraftBoardCtrl', function ($scope, $http, $q) {

    function initialize() {
      $scope.draft_position = 1000;
      $scope.draftStarted = false;
      $scope.draftPaused = false;
      $scope.allTeams = {};
      $scope.selectedTeam = {};
      $scope.teamPlayers = {};
      $scope.teamMoneySpent = 0;
      $scope.teamRosterSpots = -1;

      sendGetStateRequest().then(function(response) {
        const draft = response.data;
        $scope.draftStarted = true;
        $scope.draftPaused = draft.draftPaused;
        $scope.draftState = draft.currentState;
        sendGetAllTeamsRequest().then(function(response) {
          $scope.allTeams = response.data.results;
        });
      }, function(error){

      });
    }

    initialize();

    $scope.filterByTeam = function(selectedTeamId) {
      sendGetPlayersForTeamRequest(selectedTeamId).then(function(response) {
        $scope.teamPlayers = response.data.results;
        $scope.teamRosterSpots = $scope.teamPlayers.length;
        $scope.teamMoneySpent = 0;
        for (var i = 0; i<$scope.teamPlayers.length; i++) {
          $scope.teamMoneySpent += $scope.teamPlayers[i].cost;
        }
      });
    }

    $scope.disablePauseDraftBtn = function() {
      return $scope.draftPaused || !$scope.draftStarted || $scope.draftState==='nomination'
    }

    $scope.startDraft = function() {
      sendStartDraftRequest().then(function(response) {
        $scope.draftStarted = true;
      });
    };

    $scope.pauseDraft = function() {
      sendPauseDraftRequest().then(function(response) {
        alert("DRAFT PAUSED");
      });
    };

    $scope.resumeDraft = function() {
      sendResumeDraftRequest().then(function(response) {
        alert("DRAFT RESUMED");
      });
    };

    $scope.resetRound = function() {
      sendResetRoundRequest().then(function(response) {
        alert("ROUND RESET");
        initialize();
      });
    };

    $scope.resetToPosition = function() {
      sendResetToPositionRequest().then(function(response) {
        alert("RESET TO POSITION");
        initialize();
      });
    };

    function sendGetAllTeamsRequest() {
      const deferred = $q.defer();
      $http.get('/league/teams?league_id=1').then(function(response) {
        deferred.resolve(response);
      }, function(error) {
        deferred.reject();
      });
      return deferred.promise;
    };

    function sendGetPlayersForTeamRequest(team_id) {
      const deferred = $q.defer();
      $http.get('/team/players?team_id=' + team_id).then(function(response) {
        deferred.resolve(response);
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

    function sendStartDraftRequest() {
      const deferred = $q.defer();
      $http.post('/draft/start', {league_id: 1}).then(function(response) {
        deferred.resolve();
      }, function(error) {
        deferred.reject();
      });
      return deferred.promise;
    };

    function sendPauseDraftRequest() {
      const deferred = $q.defer();
      $http.post('/draft/pause', {league_id: 1}).then(function(response) {
        deferred.resolve();
      }, function(error) {
        deferred.reject();
      });
      return deferred.promise;
    };

    function sendResumeDraftRequest() {
      const deferred = $q.defer();
      $http.post('/draft/resume', {league_id: 1}).then(function(response) {
        deferred.resolve();
      }, function(error) {
        deferred.reject();
      });
      return deferred.promise;
    };

    function sendResetRoundRequest() {
      const deferred = $q.defer();
      $http.post('/draft/resetRound', {league_id: 1}).then(function(response) {
        deferred.resolve();
      }, function(error) {
        deferred.reject();
      });
      return deferred.promise;
    };

    function sendResetToPositionRequest() {
      console.log($scope.draft_position);
      const deferred = $q.defer();
      $http.post('/draft/resetToPosition', {league_id: 1, draft_position: $scope.draft_position}).then(function(response) {
        deferred.resolve();
      }, function(error) {
        deferred.reject();
      });
      return deferred.promise;
    };
});
