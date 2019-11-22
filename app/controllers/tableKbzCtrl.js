(function () {
    'use strict';
   var app = angular.module("hoolApp");
   
    app.controller("gameTableKbzCtrl", function ($scope, $rootScope,commonServ,$log,webapiUrl,tableServ,$timeout,$localStorage,$sce,$location,ngNotify,$interval) {
       
        $scope.IsTakeBackVisible=false;
        $scope.vPlayerName="";
        var isTakeBackApproved=0;
        var lastCardPlayedInfo={}; 
        $rootScope.pageNo=5;
        $scope.isJoinTable=0;
        $scope.startingPole=0;	      
        var imgSrc="assets/images/HOOLAsset8mdpi.svg";
        var table=JSON.parse($localStorage.table);
        var claimAcceptedByPlayer=0;
        var memberInfo=JSON.parse($localStorage.memberinfo);	
        var addName="Open";	
        var poleArr=['N','E','S','W'];
        var poleNameArr=['North','East','South','West'];

        var playersInfo=[];
        var loggedInMemberPole=-1;
        var hands=[];
        var hands_1=[];
        var shareRound=0;
        var shareCount=0;	
        var dealerPole=-1; // previously it was -1
        $scope.activePole=[false,false,false,false];
        $scope.isBiddingInfoBoxVisible=false;
        $scope.isWonTricksInfoBoxVisible=false;
        $scope.topMember={status:0}; $scope.rightMember={status:0};$scope.bottomMember={status:0};$scope.leftMember={status:0};
        var currentState="";
        $scope.isActiveToShowTop=false;
        $scope.isActiveToShowRight=false;
        $scope.isActiveToShowBottom=false;
        $scope.isActiveToShowLeft=false;
        $scope.ShowSharedCardArea=function(pole){
            if(pole==0)
            $scope.isActiveToShowTop=!$scope.isActiveToShowTop;
            else if(pole==1)
            $scope.isActiveToShowRight=!$scope.isActiveToShowRight;
            else if(pole==2)
            $scope.isActiveToShowBottom=!$scope.isActiveToShowBottom;
            else if(pole==3)
            $scope.isActiveToShowLeft=!$scope.isActiveToShowLeft;

            $timeout(function(){
                if(pole==0)
                $scope.isActiveToShowTop=!$scope.isActiveToShowTop;
                else if(pole==1)
                $scope.isActiveToShowRight=!$scope.isActiveToShowRight;
                else if(pole==2)
                $scope.isActiveToShowBottom=!$scope.isActiveToShowBottom;
                else if(pole==3)
                $scope.isActiveToShowLeft=!$scope.isActiveToShowLeft;
            },5000);
        };

        $scope.init=function(){            
            tableServ.gameTableRecord(table.id).then(function(result){                				
                populatePlayerList(result.data.table);              
                if(table.noOfPlayer==4){                 
                    $timeout(function(){
                        tableServ.getGeneratedHand(table.id).then(function(result){																					
                            var data1=JSON.parse(result.data.content);
                            var data=JSON.parse(result.data.content);;					
                            hands=data.dealHands;
                            hands_1=data1.dealHands;
                            table=data.table;		
                            
                            showPlayerArea(playersInfo);
                            distributeCards(hands);								
                            
                            shareRound=1;
                            shareCount=0;
                        
                            dealerPole=table.dealCount%4;	
                            $scope.isShareActive=true;
                            $timeout(function(){
                                tableServ.getGameTableMemberHistory(table.id).then(function(info){ 
                                    let hstry=info.data;                                     
                                    if(hstry.state=="SHARE"){
                                        currentState=hstry.state;
                                    }else if(hstry.state=="BID"){
                                        currentState=hstry.state;
                                    }else if(hstry.state=="START_PLAY"){
                                        $scope.isShareActive=false;
                                        $scope.isJoinTable=2;
                                        $scope.isPlayStart=true;
                                        $scope.isBiddingInfoBoxVisible=true;
                                        $scope.isWonTricksInfoBoxVisible=true;
                                        $scope.NSPoint=hstry.NSScore;
                                        $scope.EWPoint=hstry.EWScore; 
                                        $scope.HighestBid={pole:hstry.bid.pole, poleName:poleNameArr[hstry.bid.pole], 
                                                        suit:hstry.bid.bid.substring(1,3), num:hstry.bid.bid.substring(0,1), BID:hstry.bid.bid, double:hstry.bid.double};
 
                                    }else if(hstry.state=="PLAY_CARD"){
                                        //console.log(JSON.stringify(hstry));
                                        $scope.isShareActive=false;
                                        $scope.isJoinTable=2;
                                        $scope.isPlayStart=true;
                                        $scope.isBiddingInfoBoxVisible=true;
                                        $scope.isWonTricksInfoBoxVisible=true;
                                        wonTricksCount[0]=hstry.NSScore;
                                        wonTricksCount[1]=hstry.EWScore;
                                        $scope.NSPoint=hstry.NSScore;
                                        $scope.EWPoint=hstry.EWScore; 
                                        $scope.HighestBid={pole:hstry.bid.pole, poleName:poleNameArr[hstry.bid.pole], 
                                                        suit:hstry.bid.bid.substring(1,3), num:hstry.bid.bid.substring(0,1), BID:hstry.bid.bid, double:hstry.bid.double};
                                        $scope.Declarer=hstry.bid;
                                        $scope.Declarer.poleName=poleNameArr[parseInt(hstry.bid.pole)];

                                        angular.forEach(hstry.playedCard,function(val, key){
                                            let data=JSON.parse(val);
                                            let cardIndexInHand =-1;
                                            if(data.pole==0){			
                                                cardIndexInHand= $scope.topMember.cards.indexOf(data.cardNo+data.cardSuit);	
                                                if(cardIndexInHand>=0){
                                                    $scope.topMember.cards.splice(cardIndexInHand, 1);
                                                }	
                                            }else if(data.pole==1){			
                                                cardIndexInHand= $scope.rightMember.cards.indexOf(data.cardNo+data.cardSuit);	
                                                if(cardIndexInHand>=0){
                                                    $scope.rightMember.cards.splice(cardIndexInHand, 1);
                                                }	
                                            }else if(data.pole==2){			
                                                cardIndexInHand= $scope.bottomMember.cards.indexOf(data.cardNo+data.cardSuit);	
                                                if(cardIndexInHand>=0){
                                                    $scope.bottomMember.cards.splice(cardIndexInHand, 1);
                                                }	
                                            }else if(data.pole==3){			
                                                cardIndexInHand= $scope.leftMember.cards.indexOf(data.cardNo+data.cardSuit);	
                                                if(cardIndexInHand>=0){
                                                    $scope.leftMember.cards.splice(cardIndexInHand, 1);
                                                }	
                                            } 
                                        });

                                        if(hstry.inCompleteRound.length>0){
                                            let count=0;
                                            let interval = $interval(function(){                                                                      
                                                let msg = hstry.inCompleteRound[count];                                                                                
                                                let payload={content:msg, type:'PLAY_CARD'};               
                                                $rootScope.initializeGame(payload);                                            
                                                if(count==hstry.inCompleteRound.length-1){
                                                    $interval.cancel(interval);                                       
                                                }
                                                count++;                       
                                            },1500);
                                        }
                                        //To enable history button
                                        if(hstry.inCompleteRound.length>0 || hstry.playedCard.length>0){
                                            //$rootScope.isHistoryEnabled=true;
                                            $rootScope.sidebar[3]=true;
                                        }                                        
                                    }
                                });
                            },1000);
                        });
                    },2500);
                } 
            }); 
        };
        var kibitzerLeftReason;
        $rootScope.initializeGame=function(payload){           
            if(currentState!=payload.type){	
                if(payload.type=='UGTL'){	
                    tableServ.gameTableRecord(table.id).then(function(result){ 
                        kibitzerLeftReason="UGTL"; 
                        $scope.topMember=[]; $scope.rightMember=[]; $scope.bottomMember=[]; $scope.leftMember=[]; 
                        $rootScope.changePage('views/game_table.html',4);
                        resetGameTableOnLeave();
                    });							
                }else if(payload.type=='LEAVE'){    
                    let content=JSON.parse(payload.content);                
                    tableServ.getGameTableById(table.id).then(function(result){	
                        if(content.player_type=="PLAYER"|| content.is_sender_host==true){                       														
                            if(result.data.table){//if table exists that means host is available													
                                table=result.data.table;
                                kibitzerLeftReason="UGTL"; 
                                $rootScope.changePage('views/game_table.html',4);
                            }else{
                                kibitzerLeftReason="LEAVE"; 
                                $rootScope.changePage('views/join_table.html',2);
                            };	
                        };							
                    });            
                    	                   
                }else if(payload.type=='DISTRIBUTE'){                    
                    $scope.isShareActive=false;
                    $scope.isFourCard=false;
                    $scope.threeCards=false;
                    $timeout(function(){
                        tableServ.getGeneratedHand(table.id).then(function(result){																					
                            var data1=JSON.parse(result.data.content);
                            var data=JSON.parse(result.data.content);;					
                            hands=data.dealHands;
                            hands_1=data1.dealHands;
                            table=data.table;		
                                    
                            showPlayerArea(playersInfo);                            
                            distributeCards(hands);								
                            
                            shareRound=1;
                            shareCount=0;
                        
                            dealerPole=table.dealCount%4;	
                            $scope.isShareActive=true;
                            //to show active pole
                            $scope.activePole=[false,false,false,false];
			                $scope.activePole[dealerPole]=true;                           
                        });
                    },1500);
                }else if(payload.type=='SHARE'){
                    $timeout(function(){
                        var data=JSON.parse(payload.content);                   												
                        updateOtherMemberInfo(JSON.parse(payload.content));	
                    },1000);

                }else if(payload.type=='BID'){                       						
                        shareBidding(JSON.parse(payload.content));

                }else if(payload.type=='START_PLAY'){				
                    startGame(JSON.parse(payload.content));
                }else if(payload.type=='PLAY_CARD'){
                    $timeout(function(){
                        showPlayedCard(JSON.parse(payload.content));
                    },100);
                }else if(payload.type=='SCORE'){
                    $timeout(function(){				
                        showGameResult(JSON.parse(payload.content));	
                    },1000);					
                }else if(payload.type=='TAKEBACK_APPROVAL'){	
                    $timeout(function(){
                        onTakeBackDone(JSON.parse(payload.content));				
                    },1000);				
                }else if(payload.type=='CLAIM_REQUEST'){
                    let content=JSON.parse(payload.content);					
                    $timeout(function(){	
                        if(payload.content!="NA"){
                            let msg=content.claimed_tricks>1 ? "I claim "+content.claimed_tricks+" of the remaining tricks":(content.claimed_tricks==1?"I claim "+content.claimed_tricks+"of the remaining trick":"I concede all the tricks");
                            msg = content.sender+ " : "+msg;
                            onShowClaimEvents(content, msg);
                        }
                    },1000);							
                }else if(payload.type=='CLAIM_APPROVAL'){	
                    claimAcceptedByPlayer+=1;
                    if(claimAcceptedByPlayer==2){
                        let content=JSON.parse(payload.content);
                        $timeout(function(){	
                            let msg= "Claim of "+content.claimed_tricks+" tricks accepted"; 								
                            onShowClaimEvents(content, msg);	
                            claimAcceptedByPlayer=0;                            		
                        },1000);
                    }				
                }else if(payload.type=='CLAIM_CANCEL'){	
                    let content=JSON.parse(payload.content);				
                    $timeout(function(){  
                        let msg=  content.sender+ ": rejected the claim";                                        
                        onShowClaimEvents(content, msg);                      
                    },1000);							
                }else if(payload.type=='CHAT'){	
                    $timeout(function(){
                        $scope.showChatMessage(payload);				
                    },1000);
                    
                    //To blink chat icon
                    if($localStorage.username!=payload.sender && !$rootScope.isChatClicked){
                        $rootScope.blinkClass='chatblink';
                        $timeout(function(){
                            $rootScope.blinkClass='';							
                        },5000);
                    }	
                }
            }
        };
        /****************************************************************************
         * This block of code is writen to take back played card on approval of 
         * opponent players
         * ***************************************************************************/
        var onTakeBackDone=function(data){	            	
            isTakeBackApproved+=data.responseVal; 
            //console.log("ontake back by kibitzer screen :"+JSON.stringify(data)); 
            //console.log(data.responseVal+"-- :--- "+(isTakeBackApproved==1));                     
            if(isTakeBackApproved==1 && lastCardPlayedInfo!='{}'){  	
                //Code to take back last played card			
                var TakenBackCard=data.cardNo+data.cardSuit;              
                if(data.playerPole==0){
                    $scope.topMember.cards.splice(data.cardIndex,0,TakenBackCard);	                			
                }else if(data.playerPole==1){
                    $scope.rightMember.cards.splice(data.cardIndex,0,TakenBackCard);							
                }else if(data.playerPole==2){
                    $scope.bottomMember.cards.splice(data.cardIndex,0,TakenBackCard);	
                }else if(data.playerPole==3){
                    $scope.leftMember.cards.splice(data.cardIndex,0,TakenBackCard);	
                }

                turnCount-=1;
                if(turnCount<=0 && wonTricksCount[0]+wonTricksCount[1]<=0){
                    //$rootScope.isHistoryEnabled=false;
                    $rootScope.sidebar[3]=false;
                }
                //$scope.playedCard.splice(data.playerPole,1);	
                $scope.playedCard[data.playerPole]=null;

                $scope.isPoleActiveToPlay=[false,false,false,false];
                $scope.activePole=[false,false,false,false];              			
                $scope.isPoleActiveToPlay[data.playerPole]= true;
                $scope.activePole[data.playerPole]=true;  
                              
                //playedCardInfo.splice(playedCardInfo.length,1);
                //To delete last played card from array once takeback happen.
			    playedCardInfo = playedCardInfo.splice(0, playedCardInfo.length-1);
                lastCardPlayedInfo={};                		
            }		
            isTakeBackApproved=0;	
        };
        
        function showPlayerArea(playersInfo){	
            $scope.isJoinTable=1;	
            //resetPlayerSides();
            $scope.topMember=playersInfo[0];    
            $scope.rightMember=playersInfo[1];  
            $scope.bottomMember=playersInfo[2]; 
            $scope.leftMember=playersInfo[3]; 
        }

        $scope.widHt=window.innerHeight;	
        var distributeCards=function (hands){
            //resetSharingInfo();
            angular.forEach(hands,function(value,key){	
                //console.log('result:'+JSON.stringify( $scope.rightMember));				
                if(value.directionCode==0){                    
                    $scope.topMember.cards=value.cards;					
                }else if(value.directionCode==1){
                    $scope.rightMember.cards=value.cards;				
                }else if(value.directionCode==2){
                    $scope.bottomMember.cards=value.cards;					
                }else if(value.directionCode==3){
                    $scope.leftMember.cards=value.cards;				
                }	
            });
        };

            
        var populatePlayerList=function(data){			
            var count=0;		
            angular.forEach(data, function(value, key){			
                var isHost=table.hostId==value.gameTableMemberKey.memberId?true:false;			
                var palyerInfo={pole:value.pole, username:value.member.username,memberId:value.member.id,
                userImage:'assets/images/profile_icon/'+value.member.imageName,status:1,
                poleName:poleArr[value.pole],bidStatus:false,isHost:isHost,highestBid:false};
               
                if(value.pole==0){
                    $scope.topMember=palyerInfo;						
                }else if(value.pole==1){                   
                    $scope.rightMember=palyerInfo;						
                }else if(value.pole==2){
                    $scope.bottomMember=palyerInfo;
                }else if(value.pole==3){
                    $scope.leftMember=palyerInfo;
                }
                count++;

                if(count==4){
                    playersInfo[0]=$scope.topMember;
                    playersInfo[1]=$scope.rightMember;
                    playersInfo[2]=$scope.bottomMember;
                    playersInfo[3]=$scope.leftMember;
                }				
            });	
        };

        
        $scope.dummy={};
        $scope.isPlayStart=false;
        $scope.winningTrickSide="right";
        $scope.gameContractSide="right";
        $scope.NSPoint=0;
        $scope.EWPoint=0;
        $scope.isAbleToPlay=false;

        $scope.playedCard=[];
        $scope.isPoleActiveToPlay=[false,false,false,false];
        $scope.showScore=false;
        
        var turnCount=0;
        $scope.NSScore=0;
        $scope.EWScore=0;
        $scope.TotalNSPoint=0;
        $scope.TotalEWPoint=0;
        $scope.activePole=[false,false,false,false];
        var startGame=function(data){
            $timeout(function(){
                $scope.Declarer=data.Declarer;
                $scope.Declarer.poleName=poleNameArr[parseInt(data.Declarer.pole)];
                
                $scope.topMember.bidStatus=false;
                $scope.rightMember.bidStatus=false;
                $scope.bottomMember.bidStatus=false;
                $scope.leftMember.bidStatus=false;
                
                $scope.finaBid=$scope.Declarer.bid.substring(0,1)+" "+$scope.Declarer.bid.substring(1);
                var firstToPlayPole=($scope.Declarer.pole == 3 ? 0 : $scope.Declarer.pole+1);
                $scope.isPoleActiveToPlay=[false,false,false,false];	
                $scope.isPoleActiveToPlay[firstToPlayPole]=true;
                $scope.activePole=[false,false,false,false];
                $scope.activePole[firstToPlayPole]=true;

                $scope.isJoinTable=1;
                $scope.isPlayStart=true;
                $scope.isWonTricksInfoBoxVisible=true; 
               
            },1000);
        };

        
        $scope.bottomCardLength=0;
        var cardNoPriority=['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
        var wonTricksCount=[0,0];//0->NS & 1->EW
        var playedCardInfo=[];//At index 0->North, 1->East, 2->South & 3->West
        var tempCardNo=0;
        var tempSuitName="NA";	
        var currCardNo=0;
        var currSuitName="NA";
        var tempTrickWinnerPole=-1;
        var playedCardsArr=[];
        var isFirstCardPlayed=false;
        $scope.cardTrickArr=[true,true,true,true];
        
        var showPlayedCard=function(data){ 
            //console.log("Played Card Details : "+JSON.stringify(data));              
            $scope.activePole[data.pole]=false;
            $scope.isPoleActiveToPlay[data.pole]= false;
            $scope.playedCard[data.pole]="assets/images/deck/"+data.cardNo + data.cardSuit+".svg";	
            playedCardInfo[turnCount]= data.cardNo + "-"+ data.cardSuit+"-"+data.pole;               
            /**This block is written to slice played card from respective hand***************/
            var cardIndexInHand =-1;
            if(data.pole==0){			
                cardIndexInHand= $scope.topMember.cards.indexOf(data.cardNo+data.cardSuit);	
                if(cardIndexInHand>=0){
                    $scope.topMember.cards.splice(cardIndexInHand, 1);
                }	
            }else if(data.pole==1){			
                cardIndexInHand= $scope.rightMember.cards.indexOf(data.cardNo+data.cardSuit);	
                if(cardIndexInHand>=0){
                    $scope.rightMember.cards.splice(cardIndexInHand, 1);
                }	
            }else if(data.pole==2){			
                cardIndexInHand= $scope.bottomMember.cards.indexOf(data.cardNo+data.cardSuit);	
                if(cardIndexInHand>=0){
                    $scope.bottomMember.cards.splice(cardIndexInHand, 1);
                }	
            }else if(data.pole==3){			
                cardIndexInHand= $scope.leftMember.cards.indexOf(data.cardNo+data.cardSuit);	
                if(cardIndexInHand>=0){
                    $scope.leftMember.cards.splice(cardIndexInHand, 1);
                }	
            }             
            /**End of slicing card **********************************************************/             
            //console.log("played Card : "+data.cardNo + data.cardSuit+" by pole"+data.pole);
            //console.log("==========: "+JSON.stringify(playedCardInfo));
            turnCount+=1;
            //$rootScope.isHistoryEnabled=true;
            $rootScope.sidebar[3]=true;	
            if(turnCount==4){
                //console.log("played Cards List: "+JSON.stringify(playedCardInfo));
                for(var i=0;i<playedCardInfo.length; i++){
                    var card=playedCardInfo[i].split('-');
                    currCardNo= card[0];
                    currSuitName = card[1];	
                    var currPole=card[2];				
                    var tempCardNoPriority = cardNoPriority.indexOf(tempCardNo);
                    var currCardNoPriority = cardNoPriority.indexOf(currCardNo);
                    if(currCardNoPriority > tempCardNoPriority && (currSuitName==tempSuitName || tempSuitName=='NA')){							
                        tempTrickWinnerPole = currPole;
                        tempCardNo = currCardNo;
                        tempSuitName = currSuitName;

                    }else if(currSuitName!=tempSuitName){
                        if($scope.Declarer.bid.indexOf(currSuitName)>=0){
                            tempTrickWinnerPole =currPole;
                            tempCardNo = currCardNo;
                            tempSuitName = currSuitName;						
                        }
                    }                                        
                    
                    if(i==3){	
                        $scope.cardTrickArr=[false,false,false,false];
                        $scope.cardTrickArr[tempTrickWinnerPole]=true;                    
                        if(tempTrickWinnerPole==0 || tempTrickWinnerPole==2){
                            wonTricksCount[0]+=1;
                            $scope.NSPoint = wonTricksCount[0];

                        }else if(tempTrickWinnerPole==1 || tempTrickWinnerPole==3){
                            wonTricksCount[1]+=1;
                            $scope.EWPoint = wonTricksCount[1];
                        }                        
                        $timeout(function(){                     
                            $scope.isPoleActiveToPlay=[false,false,false,false];
                            $scope.activePole=[false,false,false,false];
                            $scope.cardTrickArr=[true,true,true,true];
                            
                            $scope.playedCard=[null,null,null,null];						
                            $scope.isPoleActiveToPlay[tempTrickWinnerPole]= true;
                            $scope.activePole[tempTrickWinnerPole]= true;
                            tempCardNo=0;
                            tempSuitName="NA";	
                            currCardNo=0;
                            currSuitName="NA";
                            tempTrickWinnerPole=-1;
                            turnCount=0;
                            playedCardInfo=[];
                        
                            if(wonTricksCount[0]+wonTricksCount[1]==13){//upen
                                var biddingContractNo = parseInt($scope.Declarer.bid.substring(0,1));
                                var biddingContractPole = parseInt($scope.Declarer.pole);
                                
                                var dealInfo=$scope.HighestBid;								
                                dealInfo.wonTricks=wonTricksCount;
                                dealInfo.tableId=table.id;
                                dealInfo.doubleCount=$scope.HighestBid.double;
                                $scope.isPoleActiveToPlay=[false,false,false,false];
                                $scope.activePole=[false,false,false,false];
                                
                                /*if(loggedInMemberPole==0){	
                                    tableServ.saveGameResult(dealInfo).then(function(result){						
                                        $rootScope.sendMessage({sender: memberInfo.memberId, type: 'SCORE', content:JSON.stringify(result.data)}); 
                                    });							
                                }*/														
                            }						
                        },2000);   // As per Arun suggestion
                    }
                }
            
            }else{
                $timeout(function(){	
                    $scope.isPoleActiveToPlay[data.nextPoleToPlay]= true;
                    $scope.activePole[data.nextPoleToPlay]= true;	
                },1000);	
            }
                
        };
        
        var sideInfoShared=[false,false,false];       
        var updateOtherMemberInfo=function(data){
            if($scope.topMember.pole==data.pole){               	
                addInfoToOthersides('TOP',data);               
            }else if($scope.rightMember.pole==data.pole){		
                addInfoToOthersides('RIGHT',data);
               
            }else if($scope.leftMember.pole==data.pole){
                addInfoToOthersides('LEFT',data);	                
            }else if($scope.bottomMember.pole==data.pole){
                addInfoToOthersides('BOTTOM',data);	               		
            } 


            $scope.activePole=[false,false,false,false];           
            shareCount=shareCount+1;
            //Once sharing finished bidding starts
            if(shareCount==8){
                $timeout(function(){                   
                    $scope.activePole=[true,true,true,true];
                },1000);
            }else{
                let nextPoleToShare = (parseInt(data.pole) ==3 ? 0 : parseInt(data.pole) + 1);               
                $scope.activePole[nextPoleToShare] = true;
            }            
        };

        $scope.leftInfo=[false,false]; $scope.topInfo=[false,false]; $scope.rightInfo=[false,false];
        $scope.bottomInfo=[false,false];
        var addInfoToOthersides=function(side,data){	  
            var html='';	 
            if(data.info.type=='hcp'){
                if(side=='BOTTOM'){
                    html='<div class="BID_body_1_SOUTH"><div class="BID_TX_1">HCP</div></div><div class="BID_body_2_SOUTH"><div class="BID_TX_2">'+data.info.value+'</div></div>';
                }
                else{
                    html='<div class="BID_body_1"><div class="BID_TX_1">HCP</div></div><div class="BID_body_2"><div class="BID_TX_2">'+data.info.value+'</div></div>';
                }
            }else  if(data.info.type=='pattern'){           
                var pattern=data.info.value;
                if(side=='BOTTOM'){
                html='<div class="BID_body_1_SOUTH"><div class="BID_TX_1">pattern</div></div>'+
                        '<div class="BID_body_2_SOUTH"><div class="BID_TX_2">'+pattern+'</div></div>';
                }
                else{
                    html='<div class="BID_body_1"><div class="BID_TX_1">pattern</div></div>'+
                        '<div class="BID_body_2"><div class="BID_TX_2">'+pattern+'</div></div>';
                }
            }else  if(data.info.type='NCS'){ 
                if(side=='BOTTOM'){          
                    html='<div class="BID_body_1_SOUTH"><div class="BID_TX_1">'+data.info.suit+'</div></div><div class="BID_body_2_SOUTH"><div class="BID_TX_2">'+data.info.value+'</div></div>';
                }
                else{
                    html='<div class="BID_body_1"><div class="BID_TX_1">'+data.info.suit+'</div></div><div class="BID_body_2"><div class="BID_TX_2">'+data.info.value+'</div></div>';
                }
            }
            
            var newEle = angular.element(html);
            var mainId;

            if(side=='TOP'){
                    $scope.topInfo[data.round-1]=true; 
                    $scope.ShowSharedCardArea(0);
            }else if(side=='LEFT'){
                    $scope.leftInfo[data.round-1]=true; 
                    $scope.ShowSharedCardArea(3);
            }else if(side=='RIGHT'){
                    $scope.rightInfo[data.round-1]=true; 
                    $scope.ShowSharedCardArea(1);
            }else if(side=='BOTTOM'){
                $scope.bottomInfo[data.round-1]=true; 
                $scope.ShowSharedCardArea(2);               
            }

            if(data.round==1){
                    mainId='BID_'+side+'_L';
            }else if(data.round==2){
                    mainId='BID_'+side+'_R'; 
            }            
          
            var target = document.getElementById(mainId);
            angular.element(target).append(newEle); 
        };


        /***********************************************************
         * The bidding module is start from here
         ***********************************************************/
        $scope.biddingStart=false;
        $scope.biddingRound=1;
        $scope.cssClassDblRdblPass=[1,0,0];
        var dblRdblPassArr=['pass','double','redouble'];

        var startBidding=function(){        
            $scope.biddingStart=true;
            $scope.cssClassIndex=[1,1,1,1,1,1,1];
            $scope.bidSuitStatus=[0,0,0,0,0];
        };

        var currentBid='';
	    var suits=['C','D','H','S','NT'];
	    var TempDeclarer={};
	    var permanentDeclarer={};
        $scope.biddingInfo=[];
        var hightestBidding=currentBid;      
        var hightBidPole=0;
        var count=0;
        var passCount=0;
        var doubleCount=0;
        var redoubleCount=0;
        var roundBidInfo=[];
        $scope.HighestBid={double:0}; 

        var shareBidding=function(data){                         
            var pole=parseInt(data.bidInfo.pole);                      
            roundBidInfo[data.bidInfo.pole]=data.bidInfo;
            $timeout(function(){
                $scope.activePole[pole]=false;			
            },500);	

            if(data.bidInfo.BID=='pass'){
                ++passCount;
            }else if(data.bidInfo.BID=='double'){
                ++doubleCount;
            }else if(data.bidInfo.BID=='redouble'){
                ++redoubleCount;
            }else{
                if(hightestBidding==''){
                    hightestBidding=data.bidInfo.BID;
                    hightBidPole=data.bidInfo.pole;
                }			
                setMaxBid(data);
            }    
            ++count;
            
            if($scope.biddingRound==1&&count==4){
                $scope.activePole=[false,false,false,false];            
                if(passCount!=4){                                         		
                    setHighestPole(roundBidInfo,0); 
                    $scope.isBiddingInfoBoxVisible=true;   
                    updateAllBiddingInfo(roundBidInfo);
                    $scope.activePole=[false,false,false,false];
                    $scope.isBidding                                      
                }               
                count=0;
                passCount=0;    
            }else if(data.bidInfo.round==2&&count==2){			
                $scope.activePole=[false,false,false,false];
                var secondRoundBidInfo={pole:hightBidPole,bid:hightestBidding};		
                $scope.biddingInfo[1]=secondRoundBidInfo;						
                updateAllBiddingInfo(roundBidInfo); 
                
                if((doubleCount==1&&passCount==1)||(doubleCount==2)){
					//permanentDeclarer=$scope.biddingInfo[0];
					//permanentDeclarer.double=1;
					$scope.HighestBid.double=1;					
					$scope.activePole[$scope.HighestBid.pole]=true;								
					
				}else if((doubleCount>=0&&passCount==0)||(doubleCount==0&&passCount==1)){
					$scope.biddingRound=3;
					$scope.HighestBid.suit=hightestBidding.substring(1);	
					$scope.HighestBid.num=hightestBidding[0];
					$scope.HighestBid.pole=hightBidPole;									
					setHighestPole(roundBidInfo,1);							
				}
                doubleCount=0;
				passCount=0;
				count=0;
                    
            }else if(data.bidInfo.round==3&&count==2){
                $scope.activePole=[false,false,false,false];
                updateAllBiddingInfo(roundBidInfo);                
                //permanentDeclarer=$scope.biddingInfo[1];
                $scope.HighestBid=$scope.biddingInfo[1];
                setHighestPole(roundBidInfo,2);

                if(passCount==2){	
					$scope.HighestBid.double=0;	
				}else if((doubleCount==2 && passCount==0)||(doubleCount==1 && passCount==1)){					
					$scope.HighestBid.double=1;
					$scope.activePole[$scope.HighestBid.pole]=true;						
				}else{					
					updateAllBiddingInfo(roundBidInfo);
					$scope.HighestBid={pole:hightBidPole,poleName:poleNameArr[hightBidPole],
						suit:hightestBidding.substring(1), num:hightestBidding[0],
						BID:hightestBidding,double:0};				

					////permanentDeclarer={pole:hightBidPole,bid:hightestBidding};
					//highLightHighestBid(hightBidPole);					
					setHighestPole(roundBidInfo,0);
					$scope.activePole=[false,false,false,false];					
				}
				// permanent declarer double=0 no double 1=double 2=redouble; 	
				//permanentDeclarer.double=0;
				passCount=0;
				count=0;

            }else if(data.bidInfo.round=='double'&&count==2){
                $scope.activePole=[false,false,false,false];
                updateAllBiddingInfo(roundBidInfo);
               if(doubleCount>=1){			
					$scope.HighestBid.double=1;					
					$scope.activePole[$scope.HighestBid.pole]=true;						
				}			
				doubleCount=0;
				passCount=0;
				count=0;                
            }else if(data.bidInfo.round=='redouble'&&count==1){		
                $scope.activePole=[false,false,false,false];
                updateAllBiddingInfo(roundBidInfo);
                if(redoubleCount==1){
					$scope.HighestBid.double=2;
					// permanent declarer double=0 no double 1=double 2=redouble; 
					//permanentDeclarer.double=2;
				}
				redoubleCount=0;
				passCount=0;
				count=0;
            }          
        };
        
        var setHighestPole=function(roundBidInfo,round){         
            var cnt=dealerPole;
            for(var i=0;i<roundBidInfo.length;i++){
                if(roundBidInfo[cnt].BID==hightestBidding){	                    
                    hightBidPole=roundBidInfo[cnt].pole;					
                    $scope.biddingInfo[round]={pole:hightBidPole,bid:hightestBidding};	
                    highLightHighestBid(hightBidPole);
                    $scope.HighestBid={pole:hightBidPole,poleName:poleNameArr[hightBidPole],BID:hightestBidding,num:hightestBidding[0],
                        suit:hightestBidding.substring(1), double:0};                    
                    $scope.isBiddingStart=true;				
                    break;
                }
                ++cnt;
                if(cnt==4){
                    cnt=0;
                }
            }
        };

        var  highLightHighestBid=function(hightBidPole){
            $scope.topMember.highestBid=false;
            $scope.rightMember.highestBid=false;
            $scope.bottomMember.highestBid=false;
            $scope.leftMember.highestBid=false;

            if($scope.topMember.pole==hightBidPole){
                $scope.topMember.highestBid=true;
            }else if($scope.rightMember.pole==hightBidPole){
                $scope.rightMember.highestBid=true;
            }else if($scope.bottomMember.pole==hightBidPole){
                $scope.bottomMember.highestBid=true;
            }else if($scope.leftMember.pole==hightBidPole){
                $scope.leftMember.highestBid=true;
            }
        };

        var setMaxBid=function(data){            
            if(hightestBidding.substring(0,1)==data.bidInfo.BID.substring(0,1)){			
                var suit1=hightestBidding.substring(1);
                var suit2=data.bidInfo.BID.substring(1);
                var index1=suits.indexOf(suit1);
                var index2=suits.indexOf(suit2);		

                if(index1<index2){
                    hightestBidding=data.bidInfo.BID;
                    hightBidPole=data.bidInfo.pole;
                }		
            }else if(hightestBidding.substring(0,1)<data.bidInfo.BID.substring(0,1)){
                hightestBidding=data.bidInfo.BID;
                hightBidPole=data.bidInfo.pole;
            }
        };

        var updateBiddingInfo=function(bid,bidPole){            
            var suit=''; var suitcount='';
            if(bid.substring(1)=='C'){
                suit='&#x2663;';							
            }else if(bid.substring(1)=='D'){
                suit='&#x2666;';
            }else if(bid.substring(1)=='H'){
                suit='&#x2665;';
            }else if(bid.substring(1)=='S'){
                suit='&#x2660;';
            }else if(bid.substring(1)=='NT'){
                suit=bid.substring(1);
            }
            suitcount=bid.substring(0,1);

            if((bid=='pass')||(bid=='double')||(bid=='redouble')){
                suit='';
                suitcount=bid;				
            }

            if($scope.topMember.pole==bidPole){
            $scope.topMember.bidStatus=true;
            $scope.topMember.bid={suit:suit,num:suitcount};
            
            }else if($scope.leftMember.pole==bidPole){
                $scope.leftMember.bidStatus=true;
                $scope.leftMember.bid={suit:suit,num:suitcount};
                            
            }else if($scope.rightMember.pole==bidPole){
                $scope.rightMember.bidStatus=true;
                $scope.rightMember.bid={suit:suit,num:suitcount};
                            
            }else if($scope.bottomMember.pole==bidPole){
                $scope.bottomMember.bidStatus=true;
                $scope.bottomMember.bid={suit:suit,num:suitcount};
            }
            $scope.activePole[parseInt(bidPole)]=false;
        };

        var updateAllBiddingInfo=function(roundBidInfo){
            //alert(JSON.stringify(roundBidInfo));
            for(var i=0;i<roundBidInfo.length;i++){			
                var bid=roundBidInfo[i].BID;
                var bidPole=parseInt(roundBidInfo[i].pole);
                var suit=''; var suitcount='';
                
                    suitcount=bid.substring(0,1);
                    suit=bid.substring(1);

                    if((bid=='pass')||(bid=='double')||(bid=='redouble')){
                        suitcount='';
                        suit=bid;				
                    }

                    if($scope.topMember.pole==bidPole){
                        $scope.topMember.bidStatus=true;
                        $scope.topMember.bid={suit:suit,num:suitcount};
                    }else if($scope.leftMember.pole==bidPole){
                        $scope.leftMember.bidStatus=true;
                        $scope.leftMember.bid={suit:suit,num:suitcount};                       
                    }else if($scope.rightMember.pole==bidPole){
                        $scope.rightMember.bidStatus=true;
                        $scope.rightMember.bid={suit:suit,num:suitcount};                      
                    }else if($scope.bottomMember.pole==bidPole){
                        $scope.bottomMember.bidStatus=true;
                        $scope.bottomMember.bid={suit:suit,num:suitcount};                      
                    }
            }
        };
        
        var showGameResult=function(result){          
            $timeout(function(){
                $scope.NSScore=result.NSPoint;
                $scope.EWScore=result.EWPoint;			
                $scope.TotalNSPoint=$scope.TotalNSPoint+ $scope.NSScore;
                $scope.TotalEWPoint=$scope.TotalEWPoint+ $scope.EWScore;			
                $scope.showScore=true;
            },3000);
            
            $timeout(function(){
                $scope.showScore=false;
                resetGameTable();               
                resetSharingInfo();
                resetBiddingScreen();
            },10000);
        };

        var resetGameTable=function(){           
            $scope.topMember.highestBid=false;
            $scope.leftMember.highestBid=false;	
            $scope.rightMember.highestBid=false;	
            $scope.bottomMember.highestBid=false;
            
            $scope.bottomMember.cards=[];            
            isFirstCardPlayed=false;
            $scope.isJoinTable=1;           
            $scope.isPlayStart=false;
            $scope.isBiddingStart=false;
            $scope.isPoleActiveToPlay=[false,false,false,false];
            $scope.activePole=[false,false,false,false];
            wonTricksCount=[0,0];
            $scope.HighestBid={};
            //To hid bidding and won trick box
            $scope.isBiddingInfoBoxVisible=false;
            $scope.isWonTricksInfoBoxVisible=false;
            //$rootScope.isHistoryEnabled=false;
            $rootScope.sidebar[3]=false;
            $rootScope.tpntAreaHist=false;
            $rootScope.IsHistoryVisible=false;
            $rootScope.historyIcon="HOOLAsset14mdpi";
        };

        var resetSharingInfo=function(){
            $scope.leftInfo=[false,false]; $scope.topInfo=[false,false];
            $scope.rightInfo=[false,false];  $scope.bottomInfo=[false,false];
            $scope.sevenCardArr=[true,true,true,true,true,true,true];		
            angular.element(document.querySelector('#BID_BOTTOM_L')).empty();
            angular.element(document.querySelector('#BID_BOTTOM_R')).empty();
            angular.element(document.querySelector('#BID_LEFT_L')).empty();
            angular.element(document.querySelector('#BID_LEFT_R')).empty();
            angular.element(document.querySelector('#BID_TOP_L')).empty();
            angular.element(document.querySelector('#BID_TOP_R')).empty();
            angular.element(document.querySelector('#BID_RIGHT_L')).empty();
            angular.element(document.querySelector('#BID_RIGHT_R')).empty();
            $scope.activePole=[false,false,false,false];
        };

        var resetBiddingScreen=function(){         
           
            $scope.cssClassIndex=[1,1,1,1,1,1,1];
            $scope.bidSuitStatus=[0,0,0,0,0];
            $scope.cssClassDblRdblPass=[1,0,0];
            $scope.biddingRound=1;
            currentBid='';           
            $scope.Declarer={};
            hightestBidding='';
            hightBidPole=loggedInMemberPole;
            roundBidInfo=[];
            $scope.finaBid='';
            $scope.dummy={};
            $scope.isPlayStart=false;
            $scope.winningTrickSide="right";
            $scope.gameContractSide="right";
            $scope.NSPoint=0;
            $scope.EWPoint=0;           
            
            $scope.playedCard=[];
            $scope.isPoleActiveToPlay=[false,false,false,false];
            $scope.activePole=[false,false,false,false];
            turnCount=0;
        };
      
        var isHistoryButtonClicked=true;
        $rootScope.showHistory=function(){           
            if(isHistoryButtonClicked){               
                isHistoryButtonClicked=false;
                $rootScope.historyIcon= ($rootScope.historyIcon=="HOOLAsset14mdpi")?"HOOLAsset14mdpi_on":"HOOLAsset14mdpi";		
                if($rootScope.chatIcon=="HOOLAsset13mdpi_on"){
                    $rootScope.isChatClicked=false;	
                    $rootScope.chatIcon="HOOLAsset13mdpi";
                }
                $scope.playedCardsByTop=[];
                $scope.playedCardsByRight=[];
                $scope.playedCardsByBottom=[];
                $scope.playedCardsByLeft=[]; 
                
                $rootScope.tpntAreaHist=$rootScope.tpntAreaHist==true? false: true;
                $rootScope.IsHistoryVisible=$rootScope.tpntAreaHist;                 
                tableServ.getGameTableMemberHistory(table.id).then(function(info){ 
                        let hstry=info.data;   
                        let iCntr=0; 
                        let iCounter=0;                   
                        let iWinningPole=-1;
                        if(hstry.winnerPoleList)
                            iWinningPole=hstry.winnerPoleList[iCntr];
                        angular.forEach(hstry.playedCard,function(val, key){
                            let data=JSON.parse(val);                       
                            iCounter++;
                            if(iCounter>1 && iCounter%4==1){
                                iCntr++;
                                iWinningPole=hstry.winnerPoleList[iCntr];
                            }                        
                            if(data.pole==0){                                			
                                    $scope.playedCardsByTop.push({card:data.cardNo+data.cardSuit,won:iWinningPole==0?true:false});                           
                            }else if(data.pole==1){			
                                    //$scope.playedCardsByRight.push(data.cardNo+data.cardSuit);                                			
                                    $scope.playedCardsByRight.push({card:data.cardNo+data.cardSuit,won:iWinningPole==1?true:false});                          
                            }else if(data.pole==2){			
                                    //$scope.playedCardsByBottom.push(data.cardNo+data.cardSuit);                                		
                                    $scope.playedCardsByBottom.push({card:data.cardNo+data.cardSuit,won:iWinningPole==2?true:false});                           
                            }else if(data.pole==3){			
                                    //$scope.playedCardsByLeft.push(data.cardNo+data.cardSuit);                              			
                                    $scope.playedCardsByLeft.push({card:data.cardNo+data.cardSuit,won:iWinningPole==3?true:false});                           
                            } 
                        });
                        isHistoryButtonClicked=true;
                });
            }
        };

        var onShowClaimEvents=function(content, msg){                
            $rootScope.confirmbox = {message : msg, boxType : "alert", boxCode : "back"};
            $rootScope.IsConfirmBoxOn = $rootScope.IsLightBoxOn = true;
            $timeout(function(){
                $rootScope.IsConfirmBoxOn = $rootScope.IsLightBoxOn = false;
            },4000);
        };

        var resetGameTableOnLeave=function(){
            resetBiddingScreen();
             $scope.isJoinTable=0;
            
            /* reset score board */
            $scope.showScore=false;
            $scope.NSScore=0;
            $scope.EWScore=0;		  
            $scope.TotalNSPoint=0;
            $scope.TotalEWPoint=0;	
            
            /* reset sharing info */
            resetSharingInfo();
            $scope.tpntArea=false;
            $scope.threeCards=false;		
            $scope.isFourCard=false;
            
        
            isFirstCardPlayed=false;
            $scope.isPlayStart=false;
            $scope.isBiddingStart=false;
            $scope.biddingStart=false;
            $scope.biddingInfo=[];
            
            wonTricksCount=[0,0];
            $scope.HighestBid={};
            
            $scope.isPoleActiveToPlay=[false,false,false,false];
            $scope.activePole=[false,false,false,false];		
            
             hightestBidding='';
             hightBidPole=loggedInMemberPole;
             count=0;
             passCount=0;
             doubleCount=0;
             redoubleCount=0;
        
            $scope.HighestBid={double:0};
            $scope.topMember={status:0}; $scope.rightMember={status:0};
            $scope.bottomMember={status:0};$scope.leftMember={status:0};
            //$rootScope.isHistoryEnabled=false;
            $rootScope.sidebar[3]=false;
            $rootScope.tpntAreaHist=false;
            $rootScope.IsHistoryVisible=false;
            $rootScope.historyIcon="HOOLAsset14mdpi";
    
            tableServ.gameTableRecord(table.id).then(function(result){						
                 populatePlayerList(result.data.table);						
            });		
        };    

        $scope.$on('$destroy', function() {	           		        
            var tableInfo={tableId : table.id, memberId : memberInfo.memberId};	           
            if($localStorage.memberType=="KIBITZER" && kibitzerLeftReason!="UGTL"){      
                tableServ.leaveTable(tableInfo).then(function(result){
                    $rootScope.leaveChannel();				
                });
            }
        });
    });
}());	