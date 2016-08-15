'use strict';

angular
  .module('LiarsPoker', ['ngRoute', 'angular-deck', "ngSanitize",
      "com.2fdevs.videogular",
      "com.2fdevs.videogular.plugins.controls",
      "com.2fdevs.videogular.plugins.overlayplay",
      "com.2fdevs.videogular.plugins.poster",
      "timer"])
  .config(function ($routeProvider) {
      $routeProvider
            .when('/login', {
                templateUrl: '/views/login.html'
                // NOTE: do not include controller for this templateUrl so it can default to the same main_controller as index.html
            })
            .when('/register', {
                templateUrl: '/views/register.html',
                controller: 'RegisterCtrl'
            })
            .when('/rules', {
                templateUrl: '/views/rules.html'
            })
            .when('/rooms', {
                templateUrl: '/views/rooms.html',
                controller: 'RoomsCtrl'
            })
            .otherwise({
              redirectTo: '/login'
           });
    })
    .run(function($rootScope, $templateCache) {
        $rootScope.$on('$routeChangeStart', function(event, next, current) {
            if (typeof(current) !== 'undefined'){
                $templateCache.remove(current.templateUrl);
            }
         });
    });
