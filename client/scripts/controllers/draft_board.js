'use strict';

angular.module('OfflineAuction')
    .controller('DraftBoardCtrl', function ($scope, $http, $q) {
        $scope.startDraft = function() {
            sendStartDraftRequest().then(function(response) {
              $scope.draftStarted = true;
            });
        };

        $scope.pauseDraft = function() {
            sendPauseDraftRequest().then(function(response) {
            });
        };

        $scope.resumeDraft = function() {
            sendResumeDraftRequest().then(function(response) {
            });
        };

        $scope.resetRound = function() {
            sendResetRoundRequest().then(function(response) {
            });
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

        function sendPauseDraftRequest() {
            var deferred = $q.defer();
            $http.post('/draft/pauseDraft').then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        function sendResumeDraftRequest() {
            var deferred = $q.defer();
            $http.post('/draft/resumeDraft').then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        function sendResetRoundRequest() {
            var deferred = $q.defer();
            $http.post('/draft/resetRound').then(function(response) {
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };
});
