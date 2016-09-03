'use strict';

angular.module('OfflineAuction')
    .controller('MainCtrl', function ($scope, $http, $location, $window, $rootScope, $sce) {

        $scope.config = {
            sources: [
                {src: $sce.trustAsResourceUrl("videos/ooh_neck.mp4"), type: "video/mp4"},
                {src: $sce.trustAsResourceUrl("videos/ooh_neck.webm"), type: "video/webm"},
                {src: $sce.trustAsResourceUrl("videos/ooh_neck.ogv"), type: "video/ogv"}
            ],
            tracks: [
                {
                    src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                    kind: "subtitles",
                    srclang: "en",
                    label: "English",
                    default: ""
                }
            ],
            theme: "bower_components/videogular-themes-default/videogular.css",
            plugins: {
                poster: "images/neck_tub.png"
            }
        };

        $scope.PageTitleNotification = {
            Vars:{
                OriginalTitle: document.title,
                Interval: null
            },    
            On: function(notification, intervalSpeed){
                var _this = this;
                _this.Vars.Interval = setInterval(function(){
                     document.title = (_this.Vars.OriginalTitle == document.title)
                                         ? notification
                                         : _this.Vars.OriginalTitle;
                }, (intervalSpeed) ? intervalSpeed : 1000);
            },
            Off: function(){
                clearInterval(this.Vars.Interval);
                document.title = this.Vars.OriginalTitle;   
            }
        };

        var initializeUser = function() {
             $scope.user = {
                username: '',
                password: '',
                loggedIn: false
            };
        };

        $scope.invalidLoginAlert = "Incorrect username or password";

        $scope.hasSuccess = { value: false };
        $scope.hasError = { value: false };
        $scope.successMessage = { value: '' };
        $scope.alertMessage = { value: '' };

        initializeUser();

        $scope.socket = io();

        // check if the user already has an active session, if so redirect them somewhere!
        $http.get('/user').then(function(response) {
            populateUserWithLoginResponse(response.data);
        }, function(error) {
            $scope.goToLoginPage();
        });

        $scope.login = function() {
            var signInUrl = '/user/signin';
            console.log($scope.user);
            $http.post(signInUrl, $scope.user).then(function(response) {
                $scope.clearError();
                populateUserWithLoginResponse(response.data);

                if ($scope.isAdmin()) {
                    $scope.goToRegisterPage();
                } else {
                    $scope.goToDraftPage();
                }
                
            }, function(error) {
                $scope.addError($scope.invalidLoginAlert);
                clearFields();
            });
        };

        $scope.goToRegisterPage = function() {
            $location.url('/register');
        }

        var populateUserWithLoginResponse = function(data) {
            $scope.user.username = data.username;
            $scope.user.user_id = data.user_id;
            $scope.user.loggedIn = true;
        };

        var clearFields = function() {
            $scope.user.username = '';
            $scope.user.password = '';
        };

        $scope.clearError = function() {
            $scope.hasError.value = false;
            $scope.alertMessage.value = '';
        };

        $scope.clearSuccess = function() {
            $scope.hasSuccess.value = false;
            $scope.successMessage.value = '';
        };

        $scope.addError = function(errorMsg) {
            $scope.hasError.value = true;
            $scope.alertMessage.value = errorMsg;
            $scope.clearSuccess();
        }

        $scope.addSuccess = function(successMsg) {
            $scope.hasSuccess.value = true;
            $scope.successMessage.value = successMsg;
            $scope.clearError();
        };

        $scope.logout = function() {
            var signOutUrl = '/user/signout'; 
            $http.post(signOutUrl).then(function(response) {
                initializeUser();
                $location.url('/');
                // this is necessary - if you login as user, then logout, then log back in, the google timeline UI throws an error.
                // this fixes the error as is restarts the entire state of the application
                $window.location.reload();
            }, function(error) {
                console.log('There is an error when logging out, so the session most likely timed out.');
                initializeUser();
                $location.url('/');
                // this is necessary - if you login as user, then logout, then log back in, the google timeline UI throws an error.
                // this fixes the error as is restarts the entire state of the application
                $window.location.reload();
            });
        };

        $scope.isAdmin = function() {
            return $scope.user.username === 'admin';
        }

        $scope.goToDraftPage = function() {
            $location.url('/draft');
        };
        
        $scope.goToRulesPage = function() {
            $location.url('/oooohneck');
        };

        $scope.goToDraftBoardPage = function() {
            $location.url('/draft_board');
        };

        $scope.goToLoginPage = function() {
            $location.url('/login');
        };

        $scope.isTabSelected = function(loadedPage) {
            if ($location.path() == loadedPage) {
                return 'active';
            }
            return '';
        };

});