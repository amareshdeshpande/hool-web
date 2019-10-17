(function () {
    'use strict';
    var app =angular.module("hoolApp");
    var wsConnection=null;
    app.factory("commonServ",function($rootScope,webapiUrl){    
        
        var menuActive=[true,true,true];
        var menuInActive=[false,false,false];
        var menuItems=menuInActive;
        var sidebar=menuInActive;       
    	return{
    		resetMenu:function(){
    			 $rootScope.isMenuClicked=false;
                 $rootScope.sidebar=[false,false,false,false];
                 $rootScope.menuIcon="assets/images/HOOLAsset4mdpi.svg"; 
                 $rootScope.settingIcon="assets/images/HOOLAsset15mdpi.svg";
                 $rootScope.menuSwitch="";
    			 $rootScope.menuItems=[false,false,false];               
    		},menuClicked:function(){
    			$rootScope.isMenuClicked=true;
    			$rootScope.menuIcon="assets/images/HOOLAsset18mdpi.svg"; 
                $rootScope.menuItems=[true,true,true];                                    
                if($rootScope.pageNo==4){
                    $rootScope.logoutOrBackIcon="assets/images/HOOLAsset10mdpi.svg";  //back icon
                }else{
                    $rootScope.logoutOrBackIcon="assets/images/HOOLAsset17mdpi.svg"; // logout icon                   
                }              
    		},hideSideItem:function(){
               $rootScope.sidebar=[false,false,false,false];
            },setSideBar:function(val){                
                if(val==1){
                    $rootScope.sidebar=[false,false,false,false];
                }else if(val==2){
                    $rootScope.sidebar=[false,false,false,false];
                    $rootScope.sidebar[0]=true; 
                }else if(val==3){
                    $rootScope.sidebar[0]=true; 
                    $rootScope.sidebar[1]=false; 
                    $rootScope.sidebar[2]=false;  
                    $rootScope.sidebar[3]=false;
                }
                else if(val==4){
                    $rootScope.sidebar[1]=true; 
                    $rootScope.sidebar[2]=true;  
                    $rootScope.sidebar[3]=true;
                }
                else if(val==5){
                    $rootScope.sidebar[1]=true;
                    $rootScope.sidebar[2]=false; 
                    $rootScope.sidebar[3]=true;                     
                }  
            }
    	};
    });
 } ());	 