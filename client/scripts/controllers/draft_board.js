'use strict';

/// FUTURE: DON'T HARDCODE LEAGUE TO 1

angular.module('OfflineAuction')
  .controller('DraftBoardCtrl', function ($scope, $http, $q) {

    $scope.draft_position = 1000;

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
      });
    };

    $scope.resetToPosition = function() {
      sendResetToPositionRequest().then(function(response) {
        alert("RESET TO POSITION");
      });
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
