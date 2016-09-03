'use strict';

angular.module('OfflineAuction')
    .controller('DraftBoardCtrl', function ($scope, $http, $q) {
        $scope.startDraft = function() {
            sendStartDraftRequest().then(function(response) {
              $scope.draftStarted = true;
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
});
