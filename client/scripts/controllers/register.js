'use strict';

angular.module('OfflineAuction')
  .controller('RegisterCtrl', function ($scope, $http, $location, $window, $rootScope, $q) {

    $scope.clearError();
    $scope.clearSuccess();

    $scope.availableLeagues = [];
    $scope.newUser = {};
    $scope.team_name = ''
    $scope.chosenLeague = -1;

    init();

    function initializeNewUser() {
      $scope.newUser = {
        username: '',
        password: '',
        confirmPassword: ''
      };
    };

    function init() {
      initializeNewUser();
      populateAvailableLeagues();
      $scope.chosenLeague = '';
    }

    $scope.goToLoginPage = function() {
      $location.url('/login');
    }

    $scope.register = function() {
      if (!validate()) {
        return;
      }

      $http.put('/user', $scope.newUser).then(function(response) {
        const user_id = response.data.results.insertId;
        addTeam(user_id).then(function(response){
          $scope.addSuccess('User and Team created successfully');
          init();
        }, function(error) {
          $scope.addError('Fucked, league creation failed');
        });
      }, function(error) {
        $scope.addError('Username already exists, enter a new one!');
      });
     };

    function validate() {
      if ($scope.newUser.username.length == 0) {
        $scope.addError('Please enter a username.');
        return false;
      }
      if ($scope.newUser.password != $scope.newUser.confirmPassword) {
        $scope.addError('Passwords do not match.');
        return false;
      }
      if ($scope.team_name == '') {
        $scope.addError('Team name must not be empty');
        return false;
      }
      if ($scope.chosenLeague == '') {
        $scope.addError('Must choose a league');
        return false;
      }
      return true;
    };

    function addTeam(user_id) {
      const deferred = $q.defer();
      const body = {
        name: $scope.team_name,
        user_id: user_id,
        league_id: $scope.chosenLeague,
        money_remaining: 207 // HACK SHOULD REMOVE IN FUTURE
      }
      $http.put('/team', body).then(function(response) {
        deferred.resolve();
      }, function(error) {
        deferred.reject();
      });
      return deferred.promise;
    };

    function populateAvailableLeagues() {
      const deferred = $q.defer();
      $http.get('/league/all').then(function(response) {
          $scope.availableLeagues = response.data.results;
          console.log($scope.availableLeagues);
          deferred.resolve();
      }, function(error) {
          deferred.reject();
      });
      return deferred.promise;
    };
});