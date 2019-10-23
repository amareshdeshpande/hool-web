(function () {
  'use strict';
   var app = angular.module("hoolApp");
   var playersInfo=[];
   var memberInfo;
   var loggedInMemberInfo={};
   var north=0;var east=1;var south=2; var west=3;
   var table;

   app.controller("playGameCtrl",function($scope, $timeout,$rootScope,commonServ,$localStorage,playGameServ,$stomp){

      $rootScope.pageNo=4; 
      $scope.fiveCards=false;
      $scope.tpntArea=false; 

      $scope.fiveCardArr=[true,true,true,true,true];
      $scope.threeCardArr=[true,true,true];
      $scope.used=false;
      $scope.threeCardNo=-1;    
  
      playersInfo=JSON.parse($localStorage.playersInfo);
      memberInfo=JSON.parse($localStorage.memberinfo);
      table=JSON.parse($localStorage.table);	    
      
      angular.forEach(playersInfo,function(value,key){
          if(memberInfo.loginId==value.username){
            loggedInMemberInfo=value;                    
          }
      });

     var poleArr=['N','E','S','W'];

      if(loggedInMemberInfo.pole==0){
          $scope.topMember=playersInfo[2];    $scope.topMember.pole=poleArr[2];
          $scope.rightMember=playersInfo[3];  $scope.rightMember.pole=poleArr[3];
          $scope.bottomMember=playersInfo[0]; $scope.bottomMember.pole=poleArr[0];
          $scope.leftMember=playersInfo[1];   $scope.leftMember.pole=poleArr[1];  

      }else if(loggedInMemberInfo.pole==1){
          $scope.topMember=playersInfo[3];    $scope.topMember.pole=poleArr[3];
          $scope.rightMember=playersInfo[0];  $scope.rightMember.pole=poleArr[0];
          $scope.bottomMember=playersInfo[1]; $scope.bottomMember.pole=poleArr[1];
          $scope.leftMember=playersInfo[2];   $scope.leftMember.pole= poleArr[2];  
          
      }else if(loggedInMemberInfo.pole==2){
          $scope.topMember=playersInfo[0];     $scope.topMember.pole=poleArr[0];
          $scope.rightMember=playersInfo[1];   $scope.rightMember.pole=poleArr[1];
          $scope.bottomMember=playersInfo[2]; $scope.bottomMember.pole=poleArr[2];
          $scope.leftMember=playersInfo[3];   $scope.leftMember.pole=poleArr[3];   

      }else if(loggedInMemberInfo.pole==3){
          $scope.topMember=playersInfo[1];    $scope.topMember.pole=poleArr[1];
          $scope.rightMember=playersInfo[2];  $scope.rightMember.pole=poleArr[2];
          $scope.bottomMember=playersInfo[3]; $scope.bottomMember.pole=poleArr[3];
          $scope.leftMember=playersInfo[0];   $scope.leftMember.pole= poleArr[0];  
      }


     

      var socketConn=commonServ.socketConn();
      socketConn.then(function (frame) {
      
        /*** subscribe for player info update for table **/
      
            $stomp.subscribe('/topic/table/'+table.id, function (payload, headers, res) {	          	        
                //console.log('####'+JSON.stringify(payload));        
                alert(23);
                if(payload.type=='DISTRIBUTE'){ 
                  console.log('####'+JSON.stringify(payload.content));        
                }  
            },{});

            $timeout(function(){
              if(table.hostId==memberInfo.memberId){                  
                alert(20);
                $stomp.send('/chat.generateHand/'+table.id, {sender: 'saroj', type: 'DISTRIBUTE'}, {});	
              }

            },500);

            
      });
      
      




      $scope.data=[{id:'S_9',mrgn:'10vh'},{id:'S_9',mrgn:'20vh'},{id:'S_9',mrgn:'30vh'},{id:'H_9',mrgn:'40vh'},{id:'H_8',mrgn:'50vh'},{id:'C_9',mrgn:'60vh'}];


      $scope.threeCard=function(val){

         if($scope.threeCardArr[val-1]){
             $scope.fiveCards=true; 
             $scope.tpntArea=true;
             $scope.threeCardNo=val;
             $scope.threeCardArr[val-1]=false;
         }

      		
            
      }


    $scope.addElement=function(val){      

         var divHtml='';

         var html1='<div class="CARDWITHBG"><div class="BID_body_1"><div class="BID_TX_1">pattern</div></div><div class="BID_body_2"><div class="BID_TX_2"><span>4,4,3,2</span></div></div></div>';
         var html3='<div class="CARDWITHBG"><div class="BID_body_1"><div class="BID_TX_1">card</div></div><div class="BID_body_2"><div class="BID_SimbolTX"><span>A&#x2666;</span></div></div></div>';
         var html2='<div class="CARDWITHBG"><div class="BID_body_1"><div class="BID_TX_1">diamonds</div></div><div class="BID_body_2"><div class="BID_TX_2"><span>4</span></div></div></div>';   

          if(val==1){
            divHtml=html1;
          }else if(val==2){
            divHtml=html2;
          }else if(val==3){
            divHtml=html3;
          }
  
         var newEle = angular.element(divHtml);
         var target = document.getElementById('BID_'+$scope.threeCardNo);
         angular.element(target).append(newEle);

    }


    $scope.fiveCardsClick=function(val){     

	      	if($scope.fiveCardArr[val]){

	      				$scope.fiveCardArr[val]=false;

	      			$timeout(function(){
	  	 				
	     				     $scope.fiveCards=false; 
	  	 				     $scope.tpntArea=false;

                   $scope.addElement(val);

	  	 	    	},1000);

	      	}      
      }

     


   });




 } ());  