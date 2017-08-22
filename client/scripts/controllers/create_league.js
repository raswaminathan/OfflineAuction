'use strict';

angular.module('OfflineAuction')
  .controller('CreateLeagueCtrl', function ($scope, $http, $location, $window, $rootScope) {

    $scope.clearError();
    $scope.clearSuccess();

    function initializeNewLeague() {
        $scope.newLeague = {
            name: '',
            num_teams: 10,
            num_positions: 17,
            salary_cap: 207,
            draft_type: 'AUCTION'
        };
    };

    initializeNewLeague();

    const registerAlerts = {  leagueNameAlert: 'Please enter a league name.',
                            invalidNumberFieldAlert: 'Numerical fields cannot be less than 0...',
                            failedRegisterAlert: 'League registration failed, please try again...'
                        };


    $scope.successfulRegisterMessage = 'League created successfully.';

    $scope.createLeague = function() {
      if (!validate()) {
          return;
      }

      $http.put('/league', $scope.newLeague).then(function(response) {
        $scope.addSuccess($scope.successfulRegisterMessage);
        initializeNewLeague();
      }, function(error) {
        $scope.addError(registerAlerts.failedRegisterAlert);
      });
     };

     function validate() {
      return validateName() && validateNumberFields();
     };

     function validateName() {
      if ($scope.newLeague.name.length == 0) {
        $scope.addError(registerAlerts.leagueNameAlert);
        return false;
      }
      return true;
     };

     function validateNumberFields() {
      if ($scope.newLeague.num_teams < 0 || $scope.newLeague.num_positions < 0 || $scope.newLeague.salary_cap < 0) {
        $scope.addError(registerAlerts.invalidNumberFieldAlert);
        return false;
      }
      return true;
     };
});