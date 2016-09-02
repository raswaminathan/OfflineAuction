'use strict';

angular.module('OfflineAuction')
    .controller('RegisterCtrl', function ($scope, $http, $location, $window, $rootScope) {

        $scope.clearError();
        $scope.clearSuccess();

        var initializeNewUser = function() {
            $scope.newUser = {
                username: '',
                password: '',
                confirmPassword: ''
            };
        };

        initializeNewUser();

        var registerAlerts = {  usernameAlert: 'Please enter a username.',
                                passwordMatchAlert: 'Passwords do not match.',
                                failedRegisterAlert: 'Username already exists, enter a new one!'
                            };


        $scope.successfulRegisterMessage = 'User created successfully.';

        $scope.register = function() {
            if (!validate()) {
                return;
            }

            $http.put('/user', $scope.newUser).then(function(response) {
                $scope.addSuccess($scope.successfulRegisterMessage);
                initializeNewUser();
                // $location.url("/login");
            }, function(error) {
                $scope.addError(registerAlerts.failedRegisterAlert);
            });

         };

         var validate = function() {
            var validFields = validateNonEmptyField($scope.newUser.username, registerAlerts.usernameAlert);
                             
            validFields = validFields && validatePassword();
            return validFields;
         };

         var validateNonEmptyField = function(field, errorMessage) {
            if (field.length == 0) {
                $scope.addError(errorMessage);
                return false;
            }
            return true;
         };

         var validatePassword = function() {
            if ($scope.newUser.password != $scope.newUser.confirmPassword) {
                $scope.addError(registerAlerts.passwordMatchAlert);
                return false;
            }
            return true;
         };
});