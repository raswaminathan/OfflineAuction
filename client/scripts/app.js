'use strict';

angular
  .module('OfflineAuction', ['ngRoute', "ngSanitize",
      "com.2fdevs.videogular",
      "com.2fdevs.videogular.plugins.controls",
      "com.2fdevs.videogular.plugins.overlayplay",
      "com.2fdevs.videogular.plugins.poster"])
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
            .when('/draft', {
                templateUrl: '/views/draft.html',
                controller: 'DraftCtrl'
            })
            .when('/draft_board', {
                templateUrl: '/views/draft_board.html',
                controller: 'DraftBoardCtrl'
            })
            .when('/oooohneck', {
                templateUrl: '/views/rules.html'
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
