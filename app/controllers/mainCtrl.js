(function () {
  'use strict';
  var app = angular.module("hoolApp");
  //This block of code is used for Main page in which SideBar, Chat and main boday exists
  app.controller('mainCtrl',function($scope,$rootScope,commonServ,$sessionStorage, $localStorage,$location,$window,ngNotify,$timeout){
         $scope.viewName='views/home.html';
         $rootScope.pageNo=1;
         $rootScope.menuItems=[false,false,false];
         $rootScope.sidebar=[false,false,false,false];
         $scope.notClicked=true;
		 
         if(!$sessionStorage.memberinfo){
              $location.path('/login'); 
         }else{    
            $rootScope.username = $localStorage.username;
            $rootScope.initializeWebSocket();   
         }
         
		 $scope.changePage=function(pageName,no){
            $rootScope.pageNo=no;               
            $scope.viewName=pageName;               
            commonServ.setSideBar(1);
         }

         $rootScope.changePage=function(pageName,no){
            $rootScope.pageNo=no;               
            $scope.viewName=pageName;               
            commonServ.setSideBar(1);
        }
         $scope.chat= {};
         $rootScope.messages = [];
         //$scope.IsChatActive=($localStorage.memberType=='KIBITZER')?false:true;
         $scope.IsChatActive=true;
         $scope.sendChatMessage=function(chat){  
            if(chat.message)  {  
                let payload={sender: $localStorage.username, type: 'CHAT', content:chat.message};
                $scope.messages.push(payload);            
                $rootScope.sendMessage(payload);  
                $scope.chat= {}; 
            }
         };

         $scope.checkIfEnterKeyWasPressed = function($event){
            var keyCode = $event.which || $event.keyCode;
            if (keyCode === 13) {
                //console.log("enter button is clicked............")
                $scope.sendChatMessage($scope.chat);
            }        
          };

         $scope.showChatMessage=function(payload){           
            if($localStorage.username!=payload.sender){
                $scope.messages.push(payload);
            }          
        };
        $scope.avatarUrl = function(uuid){
            return 'http://robohash.org/'+uuid+'?set=set2&bgset=bg2&size=70x70';
        };
  });


   app.controller('homeCtrl',function($scope, $rootScope,commonServ,$localStorage){
	  
        $rootScope.menuIcon="assets/images/HOOLAsset4mdpi.svg"; 
        $rootScope.settingIcon="assets/images/HOOLAsset15mdpi.svg";              

        $rootScope.pageNo=1;
        $scope.one = true; 
        $scope.two = true; 
        $scope.three =true;

        $scope.playIcon=function(id){ 
            if(id=='three'){
                $scope.one = true;                  
                $scope.two = true;
                $scope.three = false;
            } 
        }

        $scope.createTable=function(){
        	if(!$localStorage.token)
        	 $rootScope.reLogin();        	 	    
            $scope.changePage('views/create_table.html',2);
        }

        $scope.joinTable=function(){
             $scope.changePage('views/join_table.html',2);
        }
   });

   app.controller('sideBarCtrl',function($scope, $rootScope,commonServ,$location, $localStorage,$timeout){
     
       $rootScope.isChatClicked=false;
       $rootScope.isMenuClicked=false;   
       $rootScope.historyIcon="HOOLAsset14mdpi";
       $rootScope.chatIcon="HOOLAsset13mdpi";
         $scope.menu=function(){ 
            if(!$rootScope.isMenuClicked){ 
                 commonServ.hideSideItem();                 
                 commonServ.menuClicked();
            }else{ 
                commonServ.resetMenu();
                commonServ.setSideBar($rootScope.pageNo);
                $rootScope.menuArea='';
            } 
         }

        $scope.showChat=function(){ 
            $rootScope.chatIcon= ($rootScope.chatIcon=="HOOLAsset13mdpi")?"HOOLAsset13mdpi_on":"HOOLAsset13mdpi";            
            if($rootScope.isChatClicked){
                $rootScope.isChatClicked=false;                
                $rootScope.chatArea='';
            }else{
                 $rootScope.isChatClicked=true;  
                 $rootScope.chatArea='views/chat.html';                
                 $timeout(function(){ 
                    //this peice of code is written to put scroll in bottom of the screen 
                    $scope.messages.push({sender:"", type: 'NA', content:""});					
                }, 100);
                 
            }            
            if($rootScope.historyIcon=="HOOLAsset14mdpi_on"){
                $rootScope.tpntAreaHist=false;
                $rootScope.IsHistoryVisible=false;
                $rootScope.historyIcon="HOOLAsset14mdpi";
            }
        }
		
        $scope.settings=function(){
            $rootScope.settingIcon="assets/images/HOOLAsset15_Ymdpi.svg"; 
            $rootScope.menuSwitch="settings";
        }


         $scope.backBtnCliked=function(){            
            $rootScope.isChatClicked=false;
            $rootScope.messages = [];
            $scope.changePage('views/home.html',1);
         }

         $scope.logoutOrBack=function(){  
            //alert("#"+$rootScope.pageNo);           
            $rootScope.isChatClicked=false; 
            $rootScope.messages = [];
            if($rootScope.pageNo==2){
                $scope.changePage('views/home.html',1);
            } 			
  			else if($rootScope.pageNo==3 || $rootScope.pageNo==4 || $rootScope.pageNo==5){    
                //$localStorage.table=null;   //Added by Upendra 2019.02.07 (to clear joined table info)            
                  $scope.changePage('views/join_table.html',2);
  			}else{   
  	       	 	$rootScope.disconnect();	
  			}              
        }
        $scope.TakeBack=function(){             
			$rootScope.takeBack();
        }              
   });

   app.directive('schrollBottom', function () {
        return {
        scope: {
            schrollBottom: "="
        },
        link: function (scope, element) {
            scope.$watchCollection('schrollBottom', function (newValue) {
            if (newValue)
            {
                $(element).scrollTop($(element)[0].scrollHeight);
            }
            });
        }
        }
    });
} ());	
	