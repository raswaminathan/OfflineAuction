var express = require('express');
var router = express.Router();
var app = express();
//var perm_service = require('../services/permissions');

var basePath =  '/Users/rahulswaminathan/OfflineAuction/client';

router.get('/', function(req, res, next){
  res.render(basePath + '/views/index.html');
});

router.get('/views/*.html', function(req, res, next){
  res.sendFile(basePath + req.path);
});

// // PERMISSIONLESS
// var anyViews = [
//     'rules.html',
//     'index.html',
//     'login.html',
//     'register.html'
// ];

// anyViews.forEach(function(view) {
//     router.get('/views/' + view, function (req, res) {
//         res.render(basePath + '/views/' + view);
//     });
// });

// //LOGGED IN
// var loginViews = [
//     'token_modal.html',
//     'filter_reservation.html',
//     'user_reservation.html',
//     'pending_reservations.html',
//     'select_resources.html',
//     'show_resources.html'
//     ];

// loginViews.forEach(function(view) {
//      router.get('/views/' + view, function (req, res) {
//         if(req.session.auth){
//             res.render(basePath + '/views/' + view);
//         }
//         else{
//             res.status(302).redirect('/views/login.html')
//         }
//     });
        
// });



// //USER MANAGEMENT PERMISSION REQUIRED
// var userManagementViews = [
//     'system_permission.html',
//     'edit_group.html',
//     'edit_user.html',
//     'register.html'
// ];

// userManagementViews.forEach(function(view) {
//     router.get('/views/' + view, function (req, res) {
//         if(perm_service.check_user_permission(req.session)){
//             res.render(basePath + '/views/' + view);
//         }
//         else{
//             res.status(302).redirect('/views/login.html')
//         }
//     }); 
// });

// //RESOURCE MANAGEMENT PERMISSION REQUIRED
// var resourceManagementViews = [
//     'resource.html',
//     'resource_permission.html',
//     'edit_resource_permission.html',
//     'add_parent.html',
//     'modify_resource.html'
// ];
// resourceManagementViews.forEach(function(view) {
//    router.get('/views/' + view, function (req, res) {
//         if(perm_service.check_resource_permission(req.session)){
//             res.render(basePath + '/views/' + view);
//         }
//         else{
//             res.status(302).redirect('/views/login.html')
//         }
//     }); 
// });
// //RESERVATION MANAGEMENT PERMISSION REQUIRED
// var reservationManagementViews = [
//     'manage_reservation.html'
// ];
// reservationManagementViews.forEach(function(view) {
//     router.get('/views/' + view, function (req, res) {
//         if(perm_service.check_reservation_permission(req.session)){
//             res.render(basePath + '/views/' + view);
//         }
//         else{
//             res.status(302).redirect('/views/login.html')
//         }
//     }); 
// });

module.exports = router;