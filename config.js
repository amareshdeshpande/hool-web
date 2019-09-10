var db;
(function () {
'use strict';

	var app = angular.module("hoolApp", ["ngRoute","ngStorage","ngStomp","ngNotify"]);
	 //app.constant("webapiUrl","http://hool.org/hool");
	 app.constant("webapiUrl","http://hcspl.in:90/hool");  
	 //app.constant("webapiUrl","http://192.168.1.202:8080/hool");
	 
	//var apiUrl= window.location.protocol+"//"+ window.location.hostname+":"+window.location.port;	
	//var apiUrl= window.location.protocol+"//"+ window.location.hostname+":90";
	//app.constant("webapiUrl",apiUrl+"/hool");		
    //app.constant("localpath","///storage/emulated/0/android/data/com.hool.activity/files/");
	
    app.config(function ($routeProvider) {
        $routeProvider
		.when("/home", {
		    templateUrl: "views/home.html",
		    controller: "homeCtrl"
		})
		.when("/main", {
		    templateUrl: "views/main.html",
		    controller: "mainCtrl"
		})
		.when("/login", {
		    templateUrl: "views/login.html",
		    controller: "loginCtrl"
		})
		.when("/logout", {
		    templateUrl: "views/login.html",
		    controller: "logoutCtrl"
		})
		.when("/register", {
		    templateUrl: "views/register.html",
		    controller: "registerCtrl"
		})
		.when("/profile", {
		    templateUrl: "views/profile.html",
		    controller: "profileCtrl"
		}).when("/table/create", {
		    templateUrl: "views/create_table.html",
		    controller: "createTableCtrl"
		}).when("/table/join", {
		    templateUrl: "views/join_invite.html",
		    controller: "joinInviteCtrl"
		}).when("/sidebar", {
		    templateUrl: "views/side_bar.html",
		    controller: "sideBarCtrl"
		}).when("/recover/password", {
			templateUrl : "views/recover_password.html",
			controller:"recoverCtrl"
		}).when("/reset/password/:token", {
			templateUrl : "views/reset_password.html",
			controller:"resetCtrl"
		})
		.otherwise({ redirectTo: '/login' })  	
		
    }); 
}());