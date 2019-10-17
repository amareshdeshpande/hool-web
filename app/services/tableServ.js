(function () {
    'use strict';
    var app =angular.module("hoolApp");
    
    app.service("tableServ",function($http, webapiUrl, $localStorage){
            this.createTwilioToken=function(data){
                return $http({
                    method: 'POST',
                    url: webapiUrl + '/api/chat/token/'+data.identity+'/'+data.device,                 
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
                });
            };

	    	this.createTable=function(table){
	    	    return $http({
	    		 	method: 'POST',
	                url: webapiUrl + '/api/game/table/create',
	                data: table,
	                headers: { 
                    	'Content-Type': 'application/json',
                    	'Authorization': $localStorage.token
                    }
	    		 });
	    	};

            this.getTableList=function(){            	
                return $http({
                    method: 'GET',
                    url: webapiUrl + '/api/game/table/list',                  
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
                 });
            };

            this.joinTableAsKibitzer=function(tableInfo){           
                return $http({
                    method: 'POST',
                    url: webapiUrl + '/api/game/table/join',
                    data: tableInfo,
                    headers: { 'Authorization': $localStorage.token}
                 });
            }

            this.joinTableAsPlayer=function(memberInfo){            	
                return $http({
                    method: 'PUT',
                    url: webapiUrl + '/api/game/table/change/member/type',
                    data: memberInfo,
                    headers: {'Authorization': $localStorage.token}
                 });
            }
            
            this.leaveTable=function(memberInfo){
                return $http({
                    method: 'POST',
                    url: webapiUrl + '/api/game/table/leave',
                    data: memberInfo,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
                 });
            }

            this.gameTableRecord=function(tableId){
                return $http({
                    method: 'GET',
                    url: webapiUrl + '/api/game/table/players/'+tableId,                  
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
                 });
            }
            
            this.getGameTableById=function(tableId){            	
            	return $http({
            		method:'GET',
            		url:webapiUrl+'/api/game/table/'+tableId,
            		headers: { 
                         'Content-Type': 'application/json',
                         'Authorization': $localStorage.token
                     }
            	});            	
            }
            
            this.saveGameResult=function(dealInfo){
            	return $http({
            		method:'POST',
            		url:webapiUrl+'/api/game/deal/result',
            		data:JSON.stringify(dealInfo),
            		headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
            	});
            }
            //It is used to update room id into the gametable
            this.UpdateRoomID=function(roomId,hostId){
            	return $http({
            		method:'GET',
            		url:webapiUrl+'/api/game/register/'+roomId+'/'+hostId,            		
            		headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
            	});
            }

            this.generateHand=function(tableId){
            	return $http({
            		method:'GET',
            		url:webapiUrl+'/api/game/generate/hand/'+tableId,            		
            		headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
            	});
            }

            this.getGeneratedHand=function(tableId){
            	return $http({
            		method:'GET',
            		url:webapiUrl+'/api/game/get/generated/hand/'+tableId,            		
            		headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
            	});
            }
            //int tableId;
            //int memberId;
            //String message;
            //string type
            this.saveGameTableMemberHistory=function(msgInfo){
            	return $http({
            		method:'POST',
            		url:webapiUrl+'/api/game/member/register/table/history',
            		data:JSON.stringify(msgInfo),
            		headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
            	});
            }

            this.getGameTableMemberHistory=function(tableId){
            	return $http({
            		method:'GET',
            		url:webapiUrl+'/api/game/table/member/history/'+tableId,            		
            		headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
            	});
            }

            this.deleteGameTableMemberHistory=function(msgId){
            	return $http({
            		method:'DELETE',
            		url:webapiUrl+'/api/game/table/remove/history/'+msgId,            		
            		headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': $localStorage.token
                    }
            	});
            }
    });
 } ());	   