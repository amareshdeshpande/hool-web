(function () {
    'use strict';
    var app = angular.module("hoolApp");    
    app.run(function($rootScope,tableServ, webapiUrl, $timeout,$interval, $localStorage, $location, $window, $stomp) {  	
        let subscription={}; 
        let wsConn=null;
        let channel;
        let memberInfo;
        $rootScope.lastSavedMessageId=0;
        $rootScope.lastPlayedMemberId=0;
        $rootScope.isSplashOn=true;
        $timeout(function(){
            $rootScope.isSplashOn=false;
        },4000);

        // store the interval promise in this variable
        /*let promise;
        let intervalTime=1000;
        let sessionTimeInMS=2400000; //40 minutes
        let playerSessionTime=sessionTimeInMS;
        var sessionValidator = function() {
            playerSessionTime= playerSessionTime - intervalTime;
            if(playerSessionTime<=20000){
                //console.log("Are you ther? Left time : "+playerSessionTime);               
                if (confirm("HOOL asks if you are online?")) {                    
                    playerSessionTime = sessionTimeInMS;
                }else{
                    $interval.cancel(promise);
                    AbondanPlayerSession();   	
                }               
                if(playerSessionTime<=0){
                    $interval.cancel(promise);
                    AbondanPlayerSession();   	                 
                }
            }           
        };*/
        // starts the interval
        $rootScope.start = function() {            
            // store the interval promise
            //playerSessionTime=sessionTimeInMS;
            //promise = $interval(sessionValidator, 1000);
        };
        

        $rootScope.initializeWebSocket = function(){ 
            $rootScope.start(); 
        	wsConn = (wsConn==null) ? $stomp.connect(webapiUrl+'/ws', {}) : wsConn;         	
        	wsConn.then(function () { 
        		memberInfo=JSON.parse($localStorage.memberinfo); 
        		/*** subscribe for player info update for table **/
    			subscription.default = $stomp.subscribe('/topic/public', function (payload, headers, res) {	 	
                    //console.log("message received from channel :"+channel +" and data is "+payload);
                    if(payload.type=='ONLINE'){                        					
                        //console.log("Local: "+parseInt(memberInfo.lastLogin) +" Server: "+parseInt(payload.content));
                        //console.log(payload.sender==memberInfo.memberId+"---------"+parseInt(memberInfo.lastLogin) < parseInt(payload.content));
    					if(payload.sender==memberInfo.memberId && parseInt(memberInfo.lastLogin) < parseInt(payload.content)){						
    					    subscription.game=null;
                            channel=null;
                            AbondanPlayerSession(); 
    					} 				
    				}
    				else if(payload.type=='OFFLINE'){
						tableServ.getTableList().then(function(result){								
							$rootScope.tables=result.data.list;											
						});
    				}
    				else if(payload.type=='UGTL'){	
                        //console.log("data received at point : "+JSON.stringify(payload));                      
						tableServ.getTableList().then(function(result){								
							$rootScope.tables=result.data.list;											
						});
                    }
                    else if(payload.type=='TABLE_REMOVED'){	
                        let tableId=channel.split('_');  
                        var data =  JSON.parse(payload.content);      
                        if(subscription.game && tableId[2]==data.table_id){
                            subscription.game.unsubscribe();
                            subscription.game=null;
                            $rootScope.changePage('views/home.html',1);                                            
                        } 	
						tableServ.getTableList().then(function(result){								
							$rootScope.tables=result.data.list;											
						});
    				}
                });                
                //To notify all users about online status.
                $stomp.send('/app/chat.addUser', {sender: memberInfo.memberId, content: memberInfo.lastLogin, type: 'ONLINE'}, { });	
        	});
        };
        
        $rootScope.joinChannel = function(channelName){
            channel=channelName;                       	
        	wsConn.then(function () { 
                //console.log("Channel is going to subscribe : "+channel);    
                subscription.game = $stomp.subscribe('/topic/table/'+channel, function (payload, headers, res) {
                    //To increase player session time
                    //playerSessionTime=sessionTimeInMS;                   
                    $rootScope.initializeGame(payload); 
                });
            });
        }; 

        /**********************************************************************
         * This block is written to Send message from Room as well as Lobby
         **********************************************************************/ 
        $rootScope.sendMessage = function(msg){             
            //To increase player session time
            //playerSessionTime=sessionTimeInMS;
            if(msg.type!='TAKEBACK_APPROVAL' && msg.type!='CHAT' && msg.type!='TAKEBACK_REQUEST' && msg.type!='DISTRIBUTE' && msg.type!='UGTL' && msg.type!="LEAVE"){
                var table=JSON.parse($localStorage.table);
                var memberInfo=JSON.parse($localStorage.memberinfo);  
                if(table){
                    var messageInfo={tableId:table.id, memberId:memberInfo.memberId, message:msg.content, type: msg.type};                		        
                    tableServ.saveGameTableMemberHistory(messageInfo).then(function(result){
                        $rootScope.lastSavedMessageId=result.data.data.id;
                        $rootScope.lastPlayedMemberId=result.data.data.memberId;						
                        //console.log($rootScope.lastSavedMessageId+"save result : "+ JSON.stringify(result));                		
                    });            
                }
            }

            if($localStorage.memberType =='KIBITZER') {
                if(msg.type=='CHAT' || msg.type=='DISTRIBUTE' || msg.type=='LEAVE'){
                    $stomp.send('/app/chat.sendMessage/'+channel, msg, {});
                }                 
            }

            if($localStorage.memberType =='PLAYER') {
                $stomp.send('/app/chat.sendMessage/'+channel, msg, {});                                
            }

            if(msg.type=='UGTL' || !subscription.game){                
                $stomp.send('/app/chat.sendMessage', msg, {}); 
            } 
        }; 

        $rootScope.disconnect=function(){             
            AbondanPlayerSession();
        };

        $rootScope.leaveChannel=function(){            
            if(subscription.game){
                subscription.game.unsubscribe();
                subscription.game=null;                
                let table=JSON.parse($localStorage.table);                
                let isHost = memberInfo.memberId==table.hostId ? true : false;                
                let content={"login_id":memberInfo.loginId,"is_sender_host":isHost,"player_type": $localStorage.memberType};//TODO : we need to assign logged user is host or not.
                //console.log(" left the table :"+ JSON.stringify(content));
                $rootScope.sendMessage({sender: memberInfo.memberId, type: 'UGTL', content: JSON.stringify(content)});	
                $rootScope.sendMessage({sender: memberInfo.memberId, type: 'LEAVE', content:JSON.stringify(content)});               
                channel=null;
                //console.log("player left : "+JSON.stringify(memberInfo));	
            }
        };
       
        var AbondanPlayerSession=function(){           
            //$localStorage.username=null;
            //$localStorage.password
            $localStorage.memberInfo=null;
            $localStorage.table=null;            
            $localStorage.token=null;
            $localStorage.memberType=null;
            if(subscription.game)
                subscription.game.unsubscribe();
            subscription.default.unsubscribe();
            //$localStorage.$reset(); 
            //$interval.cancel(promise);
            $stomp.disconnect().then(function () {
                //console.log('disconnected');
                wsConn = null;
            });
            $location.path('/login');  
        };
        $rootScope.reLogin=function(){        	
            AbondanPlayerSession();   	
        };
        $rootScope.clearLocalStorage=function(){
        	$localStorage.memberInfo=null;        	
        };
       
        let offlinePromis;
        let offTimer=0;
        //to check offline
        $rootScope.online = navigator.onLine;
        $window.addEventListener("offline", function() {  
            $rootScope.$apply(function() {          
                offlinePromis = $interval(function(){
                    offTimer+=1;
                    if(offTimer==20){                    
                        $rootScope.online = false;	                                                    
                        AbondanPlayerSession(); 
                        $interval.cancel(offlinePromis);
                        offTimer=0;                         
                    }
                }, 1000);   
            });       
        }, false);
        
        //to check online
        $window.addEventListener("online", function() {
          $rootScope.$apply(function() {
                $interval.cancel(offlinePromis);
                offTimer=0; 
                $rootScope.online = true;               
          });
        }, false);

        $window.addEventListener('beforeunload', function(e) {
            let msg='Do you want to leave the game?'; 
            return e.returnValue = msg;                                   
            if(subscription.game){             
                subscription.game.unsubscribe();
                subscription.game=null;
                //console.log("Right now user who left the table :"+ memberInfo.memberId);
                let content={"login_id":memberInfo.loginId,"is_sender_host":false};//TODO : we need to assign logged user is host or not.
                $rootScope.sendMessage({sender: memberInfo.memberId, type: 'UGTL', content: JSON.stringify(content)});	
                $rootScope.sendMessage({sender: memberInfo.memberId, type: 'LEAVE', content:JSON.stringify(content)});   	
            }          
        });
        
        //Put this code on controller to get message about Online and Offline
        /*$scope.$watch('online', function(newStatus) {
            alert(JSON.stringify(newStatus));
      	});*/
    });
  } ());	
      