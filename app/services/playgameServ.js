(function () {
    'use strict';
    var app =angular.module("hoolApp");

    app.service("playGameServ",function($http, webapiUrl, $localStorage){
      
        this.handGeneration=function(tableId){
            //alert('tableId '+tableId);
            return $http({
                method: 'GET',
                url: webapiUrl + '/game/table/generate/hand/'+tableId,                  
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': $localStorage.token
                }
             })

        };
    });
} ());	