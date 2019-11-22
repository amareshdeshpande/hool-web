(function () {
    'use strict';
   var app = angular.module("hoolApp");
   
  var memberId=0;  
  var isGameTableCreated=true;
  app.controller("createTableCtrl", function ($scope, $rootScope,$localStorage,$timeout,$window,commonServ,$http,$location,tableServ) {
		$rootScope.pageNo=2;    	
		$rootScope.table={history:1, kibitzer:0, privacy:0, turnTime:15, tableType:4, NoOfKibitzer:100};			
		$scope.selectHistory=function(val){
			$rootScope.table.history=val;			
		};	

		$scope.createTable=function(){				
			if(isGameTableCreated==true){
				$rootScope.IsLoadingOn = $rootScope.IsLightBoxOn = true;	
				isGameTableCreated=false;						
				tableServ.createTable($rootScope.table).then(function(result){					
					var table=result.data.gameTable;
					$rootScope.table=table;
					/* PLAYER, HOST,KIBITZER*/				
					var memberInfo=JSON.parse($localStorage.memberinfo);				
					memberId=memberInfo.memberId;								
					var tableInfo={memberType:'KIBITZER', gameTableMemberKey : {tableId : table.id, memberId : memberId}};				

					tableServ.joinTableAsKibitzer(tableInfo).then(function(result){										
						$localStorage.memberType='KIBITZER';
						$localStorage.table=JSON.stringify(table);
						$rootScope.sendMessage({sender: memberId, type: 'UGTL', content:null});
						//var noOfMember=$rootScope.table.NoOfKibitzer + 4;					
						var channelName="game_table_"+table.id;					
						$rootScope.joinChannel(channelName);
						isGameTableCreated=true; 						
						$rootScope.changePage('views/game_table.html',4);
						$rootScope.IsLoadingOn = $rootScope.IsLightBoxOn = false;				
					});
				});				
			}
		};
		$scope.$on('$destroy', function() {	
			//alert("createTable");					
		});	
	});

//=============================================================================================================

	app.controller("joinInviteCtrl", function ($scope, $rootScope,$localStorage,$timeout,commonServ,$location,$window,$http) {
	    $rootScope.pageNo=2;	//upen    
		$scope.joinText='OPEN';
		$scope.imgSrc="assets/images/HOOLAsset8mdpi.svg";
		$scope.imgSrcUser="assets/images/compass.png";
		$scope.imgSrcArr=[];
		$scope.playerText=[$scope.joinText,$scope.joinText,$scope.joinText,$scope.joinText];
		$scope.imgSrcArr =[$scope.imgSrc,$scope.imgSrc,$scope.imgSrc,$scope.imgSrc];
		$scope.currentSide=-1;

		if($rootScope.table.privacy==1){			
			$scope.playerText=['INVITE','INVITE','INVITE','INVITE'];
			$scope.joinText='INVITE'
		}

		$scope.joinOrInvite=function(val){
			//console.log("Joined : "+val);
			if($scope.currentSide!=-1){			
				$scope.imgSrcArr[$scope.currentSide]=$scope.imgSrc;
				$scope.playerText[$scope.currentSide]=$scope.joinText;				
			}else{
          		$scope.currentSide=val;
			}

			$scope.imgSrcArr[val]="assets/images/HOOLAsset11mdpi.svg";
			$scope.playerText[val]='Han Solo';
			$scope.currentSide=val;
					
			$timeout(function(){
				$rootScope.changePage('views/play_game.html',4);					
			}, 1000);
		};
		$scope.$on('$destroy', function() {	
			//alert("JoinOrInviteTable");					
		});		
	});

//============================================================================================================

	app.controller("joinTableCtrl",function($scope,$rootScope,commonServ,webapiUrl,$timeout,tableServ,$window,$localStorage,ngNotify, $interval){
	 		 $rootScope.pageNo=2;		 		
			 $scope.second='Sec';
			 //$interval(function(){  
				tableServ.getTableList().then(function(result){ 				 				
					$rootScope.tables=result.data.list;
				});
			 //},1000);
	 		/** sort table on header click start========*/	

			$scope.sortColumn='time';
			$scope.reverseSort=false;

			$scope.sortData=function(column){
				$scope.reverseSort=($scope.sortColumn==column) ? !$scope.reverseSort :false;
				$scope.sortColumn=column;
			};

			$scope.getSortClass=function(column){
				if(!$scope.sortColumn==column){
					return $scope.reverseSort ? 'arrow-down' :'arrow-up';
				}else{
					return '';
				}
			};

			/** sort table on header click  End=============*/

			$scope.tableListClicked=false;		
			$scope.clickTableList=function(table){
				$rootScope.table = table;				
				/* PLAYER, HOST,KIBITZER*/
				if(!($scope.tableListClicked)){
					$rootScope.IsLoadingOn = $rootScope.IsLightBoxOn = true;
					$scope.tableListClicked=true;
					var memberInfo=JSON.parse($localStorage.memberinfo);				
					memberId=memberInfo.memberId;										
					var tableInfo={memberType:'KIBITZER', gameTableMemberKey : {tableId : table.id, memberId : memberId}};				
					
					tableServ.joinTableAsKibitzer(tableInfo).then(function(result){							
						/*if($rootScope.isMenuClicked){ 
							commonServ.resetMenu();
							commonServ.setSideBar($rootScope.pageNo);
							$rootScope.menuArea='';
						}*/													
						$localStorage.memberType='KIBITZER';
						$localStorage.table=JSON.stringify(table);
						//console.log("Joined table info : "+JSON.stringify(table));
						$rootScope.sendMessage({sender: memberId, type: 'UGTL', content:null});
						var channelName="game_table_"+table.id;								
						$rootScope.joinChannel(channelName);	
						if(table.noOfPlayer<4){					
							$rootScope.changePage('views/game_table.html',4);
						}else{
							$rootScope.changePage('views/game_table_kbz.html',5);
						}
						$rootScope.IsLoadingOn = $rootScope.IsLightBoxOn = false;																				
					});
				} 
			};

			$scope.$on('$destroy', function() {	
				//alert("JoinTable");					
			});		
	});


//====================================================================================================


app.controller("gameTableCtrl", function ($scope, $rootScope,commonServ,$log,webapiUrl,tableServ,$timeout,$localStorage,$sce,$location,ngNotify) {
	  
	var isOpponentAbleToTackBack=true;
	var isAbleToPlay=true;
	$scope.IsTakeBackVisible=false;
	$scope.vPlayerName="";
	var isTakeBackApproved=0;
	var lastCardPlayedInfo={};
	//$rootScope.isTakeBackEnabled=false;
	//$rootScope.isHistoryEnabled=false;	//history only visible if first card played
	$rootScope.pageNo=4;
	$scope.isJoinTable=0;
	$scope.startingPole=0;	
	var sideMenuStatus=[];
	var imgSrc="assets/images/HOOLAsset8mdpi.svg";
	var table=JSON.parse($localStorage.table);
	var isKibitzerMovedToOwnScreen=false;
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
	var dealerPole=-1;
	$scope.activePole=[false,false,false,false];
	$scope.topMember={status:0}; $scope.rightMember={status:0,isClaimed:false};$scope.bottomMember={status:0};$scope.leftMember={status:0,isClaimed:false};
	var claimedBySide=-1; //0: north, 1: East, 2: South and 3: West
	$scope.init=function(){
		tableServ.gameTableRecord(table.id).then(function(result){					
			populatePlayerList(result.data.table);
		});		 
	};

	/***********************************************************************************
	 * This block of code is written to receive each and every message throught the game
	 * All messages have payload with following JSON key attributes..
	 * {sender:'', type:'', content:''}
	 * Sender : The name of person who sends the message.
	 * Type	  : The objective of message like JOIN, LEAVE, DISTRIBUTE etc.
	 * Content: Message content send by sender.
	 ***********************************************************************************/
	$rootScope.initializeGame=function(payload){									
			if(payload.type=='UGTL'){				
				//console.log("data received at UGTL : ---"+JSON.stringify(payload));
				tableServ.gameTableRecord(table.id).then(function(result){
					populatePlayerList(result.data.table);
					//send kibitzer on table list if there is no player except host kibitzer
					//console.log("Length : "+result.data.table.length+" Type : "+$localStorage.memberType+" Host : "+table.hostId +"  User Id :"+memberInfo.memberId);
					//result.data.table.length==0 && 
					/*if($localStorage.memberType=="KIBITZER" && table.hostId!=memberInfo.memberId){
						$rootScope.changePage('views/join_table.html',2);
					}*/					
				});							
			}else if(payload.type=='LEAVE'){			    
				let content=JSON.parse(payload.content);				
				if(content.player_type=="PLAYER"){	
					if(table.hostId==payload.sender){											
						tableServ.getGameTableById(table.id).then(function(result){																	
							if(result.data.table){													
								$rootScope.table=table=result.data.table;								
								updateLeavedUserInfo(payload.sender);									
							}else{
								//if($localStorage.memberType=="KIBITZER" && table.hostId!=memberInfo.memberId){					
									$rootScope.changePage('views/join_table.html',3);						
								//};	
							}								
						});
					}else{							
						updateLeavedUserInfo(payload.sender);										
					}
					//To noify all user
					let msg=memberInfo.memberId == payload.sender? "you" : content.login_id;
					//ngNotify.config({html: false});					
					//ngNotify.set(msg+ " left the table!",{type: 'grimace',duration: 3000,position: 'top'});
					$rootScope.confirmbox={message : msg+ " left the table!", boxType : "alert", boxCode : "back"};
					$rootScope.IsConfirmBoxOn = $rootScope.IsLightBoxOn = true;
					$timeout(function(){
						$rootScope.IsConfirmBoxOn = $rootScope.IsLightBoxOn = false;
					},3000);

					$timeout(function(){
						resetGameTableOnLeave();
						$rootScope.isChatClicked=false;                
						$rootScope.chatArea='';
						$rootScope.chatIcon="HOOLAsset13mdpi";
					},3100);
				}else if(content.player_type=="KIBITZER"){
					if(content.is_sender_host){						
						tableServ.getGameTableById(table.id).then(function(result){																	
							if(result.data.table){	
							    $rootScope.table = table = result.data.table;								
								if($scope.topMember.memberId==result.data.table.hostId){
									$scope.topMember.isHost=true;
								}else if($scope.rightMember.memberId==result.data.table.hostId){
									$scope.rightMember.isHost=true;
								}else if($scope.bottomMember.memberId==result.data.table.hostId){
									$scope.bottomMember.isHost=true;
								}else if($scope.leftMember.memberId==result.data.table.hostId){
									$scope.leftMember.isHost=true;	
								}
							}else{
								$rootScope.changePage('views/join_table.html',3);
							}								
						});
					}
					else if($localStorage.memberType=="KIBITZER" && table.hostId!=memberInfo.memberId && playersInfo.length==0 && !table.hostId){
						$rootScope.changePage('views/join_table.html',3);
					}
				}					
			}else if(payload.type=='DISTRIBUTE'){
				//resetGameTable();
				$scope.isShareActive=false;
				$scope.isFourCard=false;
				$scope.threeCards=false;								
				resetSharingInfo();
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
						//saroj commented for infoSharing
						$scope.isShareActive=true;
						$timeout(function(){
							$scope.infoSharing(dealerPole);
						},3000);
					});
				},1000);
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
				},1000);
			}else if(payload.type=='SCORE'){				
				showGameResult(JSON.parse(payload.content));									
			}else if(payload.type=='TAKEBACK_REQUEST'){					
				$timeout(function(){					
					$scope.vPlayerName = payload.content.sender;				
					onTakeBackClicked(JSON.parse(payload.content));
				},1000);							
			}else if(payload.type=='TAKEBACK_APPROVAL'){	
				$timeout(function(){				
					onTakeBackDone(JSON.parse(payload.content));				
				},1000);				
			}else if(payload.type=='CLAIM_REQUEST'){					
				$timeout(function(){	
					if(payload.content!="NA"){
						sideMenuStatus = $rootScope.sidebar;								
						showAcceptRejectClaimDialogueBox(JSON.parse(payload.content));
						$rootScope.sidebar=[false,false,false,false,false];	
					}
				},1000);							
			}else if(payload.type=='CLAIM_APPROVAL'){	
				claimAcceptedByPlayer+=1;	
				let data = JSON.parse(payload.content);			
				if(claimAcceptedByPlayer==2 || $scope.Declarer.pole==data.accepted_by_pole){
					$timeout(function(){									
						onClaimRequestAcceptDone(data);	
						claimAcceptedByPlayer=0;
						$rootScope.sidebar=sideMenuStatus;			
					},1000);
				}				
			}else if(payload.type=='CLAIM_CANCEL'){					
				$timeout(function(){	
					let data = JSON.parse(payload.content);	
					//alert(JSON.stringify(payload.content));
					onClaimRequestRejectedDone(data);
					$rootScope.sidebar=sideMenuStatus;
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
	};

	/*************TAKE BACK CARD MODEL START FROM HERE************************** */
	/****************************************************************************
	 * This block of code is writen to generate request to take back card
	 ***************************************************************************/
	$rootScope.takeBack=function(){	
		lastCardPlayedInfo.sender = $localStorage.username;			
		var takebackMessage = {sender:memberInfo.memberId, type: 'TAKEBACK_REQUEST', content:JSON.stringify(lastCardPlayedInfo)};	
		$rootScope.sendMessage(takebackMessage);
		//$rootScope.isTakeBackEnabled=false;		//Added by Shuvankar dated 2019.01.28 (for hiding takeback button once clicked)
		$rootScope.sidebar[4]=false;
	};

	/****************************************************************************
	 * This block of code is writen to accept or reject to take back request
	 ***************************************************************************/
	$scope.TakeBackApproval=function(val){		
		if($scope.IsTakeBackVisible){
			lastCardPlayedInfo.responseVal=val;
			lastCardPlayedInfo.sender = $localStorage.username;	
			if(val==1){	//Here 1 is for accept and 0 for reject	
				var takebackMessage = {sender: memberInfo.memberId, type: 'TAKEBACK_APPROVAL', content:JSON.stringify(lastCardPlayedInfo)};
				$rootScope.sendMessage(takebackMessage);
			}else{
				//If player rejects the takeback request of right side player 
				//then he/she would be able to play next card
				isAbleToPlay=true
			}
			$scope.IsTakeBackVisible=false;
		}		
	};

	/****************************************************************************
	 * This block of code is writen to show accept or reject popup on opponent
	 * screen to take back approval
	 * ***************************************************************************/
	var onTakeBackClicked=function(data){		
		turnOffWhenPlayerTurnToPlay();
		if(isOpponentAbleToTackBack){
			lastCardPlayedInfo=data;
			var vSide=data.playerPole;			
			if(loggedInMemberPole==((vSide+3)%4) || loggedInMemberPole==((vSide+1)%4)){											
				if(!$scope.bottomMember.isDummy){	//to not show takeback alert for dummy																		
					if(loggedInMemberPole==$scope.Declarer.pole || $scope.topMember.pole==$scope.dummy.pole){
						$scope.IsTakeBackVisible=true;
						isAbleToPlay=false;			
					}else{						
						if(loggedInMemberPole==(vSide== 3 ? 0 : vSide+1)){
							$scope.IsTakeBackVisible=true;
							isAbleToPlay=false;
						}
					}
				}
			}			
		}			
	};

	/****************************************************************************
	 * This block of code is writen to take back played card on approval of 
	 * opponent players
	 * ***************************************************************************/
	var onTakeBackDone=function(data){
		//console.log("Tack back approval data : "+JSON.stringify(data));		
		isTakeBackApproved+=data.responseVal;		
		if(isTakeBackApproved==1 && lastCardPlayedInfo!='{}'){
			isTakeBackApproved=0;			
			$scope.IsTakeBackVisible=false;						
			//Code to take back last played card			
			var TakenBackCard=data.cardNo+data.cardSuit;
			if(data.isDummy==true){
				//console.log('Testing approval if');
				$scope.dummy.cards.splice(data.cardIndex,0,TakenBackCard);
			}else{
				//console.log('Testing approval else');
				if(data.playerPole==$scope.bottomMember.pole){					
					$scope.bottomMember.cards.splice(data.cardIndex,0,TakenBackCard);
					//console.log(JSON.stringify($scope.bottomMember.cards));
				}						
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
			//var vNisDummy
			$scope.isPoleActiveToPlay[data.playerPole]= true;
			$scope.activePole[data.playerPole]=true;

			//To delete last played card from array once takeback happen.
			playedCardInfo = playedCardInfo.splice(0, playedCardInfo.length-1);
			//console.log('playedCardInfo.length : '+playedCardInfo.length);
			lastCardPlayedInfo={};				
			//$rootScope.isTakeBackEnabled=false;	
			$rootScope.sidebar[4]=false;
			isOpponentAbleToTackBack=true;
			if(data.isDummy==false && data.playerPole==loggedInMemberPole){
				deletePreviousCardFromHistory();
			}else if(data.isDummy==true && (((data.playerPole+2)%4)==loggedInMemberPole)){
				deletePreviousCardFromHistory();
			}
			//Now Player will be able to play the card.
			isAbleToPlay=true				  			
		}	
	};
	//To delete card taken back from history (from database)
	var deletePreviousCardFromHistory = function(){
		//console.log("from dummy end messaged id at momnet of takeback done :"+$rootScope.lastSavedMessageId);
		tableServ.deleteGameTableMemberHistory($rootScope.lastSavedMessageId).then(function(result){						
			//console.log("last played record deleted : "+ JSON.stringify(result));  
		});
	};

	/*************TAKE BACK CARD MODEL ENDS HERE************************** */
	var isPositionTaken=true;
	$scope.joinTableAsPlayer=function(val){				
		if(isPositionTaken){			
			isPositionTaken=false;				
			if(($scope.topMember.status==0 && val==0) || ($scope.rightMember.status==0 && val==1) ||
					($scope.bottomMember.status==0 && val==2)||($scope.leftMember.status==0 && val==3)){
				$rootScope.IsLoadingOn = $rootScope.IsLightBoxOn = true;
				var playerInfo={gameTableMemberKey : {tableId : table.id, memberId : memberId}, pole:val,memberType:'PLAYER'};		
				
				tableServ.joinTableAsPlayer(playerInfo).then(function(result){										
					if(result.data.status='SUCCESS'){
						loggedInMemberPole=val;
						// update game table  player info on player join 					
						$localStorage.memberType="PLAYER";
						var chatMessage = {sender: $localStorage.username, type: 'UGTL', content:null};
						$rootScope.sendMessage(chatMessage);
					}
					$rootScope.IsLoadingOn = $rootScope.IsLightBoxOn = false;					
				});				
			}
			isPositionTaken=true;
		}
	};	
		
	var populatePlayerList=function(data){		
		resetPlayerSides();
		var count=0;		
		angular.forEach(data, function(value, key){
			var isHost=table.hostId == value.gameTableMemberKey.memberId ? true: false;								
			var palyerInfo={pole:value.pole, username:value.member.username, memberId:value.member.id,
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

				//if(table.hostId==memberInfo.memberId){ //changed by Upen
				if(loggedInMemberPole==0){	
					tableServ.generateHand(table.id).then(function(result){																					
						$rootScope.sendMessage({sender: table.hostId, type: 'DISTRIBUTE', content:''}); 	
					});
				}
				//kibitzer 				
				if($localStorage.memberType=="KIBITZER"){
					isKibitzerMovedToOwnScreen=true;
					$rootScope.changePage('views/game_table_kbz.html',5);
				}					
			}			
		});	
	};

	function showPlayerArea(playersInfo){
		$scope.isJoinTable=1;	
		resetPlayerSides();
		$scope.topMember={};    
		$scope.rightMember={};  
		$scope.bottomMember={}; 
		$scope.leftMember={}; 
		

		if(loggedInMemberPole==0){
			$scope.topMember=playersInfo[2];    
			$scope.rightMember=playersInfo[3];  
			$scope.bottomMember=playersInfo[0]; 
			$scope.leftMember=playersInfo[1];  
	
		}else if(loggedInMemberPole==1){
			$scope.topMember=playersInfo[3];    
			$scope.rightMember=playersInfo[0]; 
			$scope.bottomMember=playersInfo[1]; 
			$scope.leftMember=playersInfo[2];  

		}else if(loggedInMemberPole==2){
			$scope.topMember=playersInfo[0];    
			$scope.rightMember=playersInfo[1];  
			$scope.bottomMember=playersInfo[2];
			$scope.leftMember=playersInfo[3];   
	
		}else if(loggedInMemberPole==3){
			$scope.topMember=playersInfo[1];   
			$scope.rightMember=playersInfo[2];  
			$scope.bottomMember=playersInfo[3]; 
			$scope.leftMember=playersInfo[0];   
		}else{
			$scope.topMember=playersInfo[0];   
			$scope.rightMember=playersInfo[1];  
			$scope.bottomMember=playersInfo[2]; 
			$scope.leftMember=playersInfo[3]; 
			
		}	
		
	}


	$scope.widHt=window.innerHeight;	
	var distributeCards=function (hands){
		
		
		resetSharingInfo();
		$scope.leftMember.bidStatus=false;
		$scope.rightMember.bidStatus=false;
		$scope.topMember.bidStatus=false;
		$scope.bottomMember.bidStatus=false;
		
		if(loggedInMemberPole==-1){			
			angular.forEach(hands,function(value,key){		
				
				if(value.directionCode==0){
					$scope.topMember.cards=value.cards;
					$scope.topMember.isDummy=true;
				}else if(value.directionCode==1){
					$scope.rightMember.cards=value.cards;
					$scope.rightMember.isDummy=true;
				}else if(value.directionCode==2){
					$scope.bottomMember.cards=value.cards;
					$scope.bottomMember.isDummy=true;
				}else if(value.directionCode==3){
					$scope.leftMember.cards=value.cards;
					$scope.leftMember.isDummy=true;
				}		
				
				
			});
			
			
		}else{			
			
			angular.forEach(hands,function(value,key){		
				
				if($scope.bottomMember.pole==value.directionCode){
					$scope.bottomMember.cards=value.cards;
					$scope.bottomMember.noOfCardSInSuit=value.handStats.noOfCardSInSuit;
					$scope.bottomMember.pattern=value.handStats.pattern;
					$scope.bottomMember.hcp=value.handStats.hcp;
					//console.log(JSON.stringify($scope.bottomMember));	
					
					//startGame2();
				}
				if($scope.topMember.pole==value.directionCode){
					$scope.topMember.cards=value.cards;				
				}else if($scope.rightMember.pole==value.directionCode){
					$scope.rightMember.cards=value.cards;				
				}else if($scope.leftMember.pole==value.directionCode){
					$scope.leftMember.cards=value.cards;				
				}
			});
		}
	};



	function resetPlayerSides(){
		$scope.topMember={pole:0,status:0,userImage:imgSrc,username:addName,poleName:poleArr[0]};
		$scope.rightMember={pole:1,status:0,userImage:imgSrc,username:addName,poleName:poleArr[1]};
		$scope.bottomMember={pole:2,status:0,userImage:imgSrc,username:addName,poleName:poleArr[2]};
		$scope.leftMember={pole:3,status:0,userImage:imgSrc,username:addName,poleName:poleArr[3]};

	}

//===================================================================================================

	$scope.isFourCard=false;
	$scope.threeCardArr=[true,true,true];
	$scope.sevenCardArr=[true,true,true,true,true,true,true];	
	 
	
	$scope.infoSharing=function(pole){		
		if(shareCount==4){				
			shareRound+=1;
			shareCount=0;							
		}   
		if(shareRound<=2){
			$scope.activePole=[false,false,false,false];
			$scope.activePole[pole]=true;		
			if(loggedInMemberPole==pole){			
				$scope.threeCards=true; 
				$scope.tpntArea=true;					
			}				
		}else if(shareRound>2){			
			$scope.sevenCardArr=[true,true,true,true,true,true,true];
			$scope.activePole=[false,false,false,false];
			$timeout(function(){
				$scope.activePole=[true,true,true,true];
				$scope.isShareActive=false;						
				startBidding();
			},1000);
		}		
	};

	

	$scope.threeCardClick=function(val){		
		
			if($scope.sevenCardArr[val]){			

				if(val==2){				
					$scope.isFourCard=true;
					$scope.sevenCardArr[val]=false;
				}else{
					$scope.sevenCardArr[2]=true;
					$scope.isFourCard=false;
					$scope.threeCards=false; 
					$scope.tpntArea=false;
					if(!$scope.isFourCard){
						$scope.sevenCardArr[val]=false;
						$scope.addSharedInfo(val);
					}
				}		
				
			}
		
		//}
		   
	};

	var sharedFourCardSuit=0; 
	$scope.fourCardClicked=function(val){
	   var cardName='';
	   if($scope.sevenCardArr[val]){
			   $scope.isFourCard=false;
			   $scope.sevenCardArr[val]=false;
			   $scope.sevenCardArr[2]=true;
   
			   if(val==3){
				   cardName='spades';
			   }else if(val==4){
				   cardName='hearts';
			   }else if(val==5){
				   cardName='diamonds';
			   }else if(val==6){
				   cardName='clubs';
			   }
			   
			   var suitNum=$scope.bottomMember.noOfCardSInSuit[val-3];
		        suitNum=findAndReplace(suitNum.toString(),1,"I");
			   var info={'type':'NCS','value':suitNum,'suit':cardName};
   
			   var html='<div class="BID_body_1"><div class="BID_TX_1">'+cardName+'</div></div><div class="BID_body_2"><div class="BID_TX_2"><span>'+suitNum+'</span></div></div>';   
			   
		   		//shareRound+=1;
			   $scope.bottomInfo[shareRound-1]=true;			   
			  
			   var newEle = angular.element(html);
			   var target = document.getElementById('TWO_'+shareRound);
			   angular.element(target).append(newEle);			  
   
			   var content=JSON.stringify({pole:$scope.bottomMember.pole,info,round:shareRound});				 
				$rootScope.sendMessage({sender: memberInfo.memberId, type: 'SHARE',content:content});   
				$scope.threeCards=false; 
				$scope.tpntArea=false;
				   
	   }
   
   };
	

	$scope.addSharedInfo=function(val){
		
		 var divHtml='';
		 var pattern=$scope.bottomMember.pattern[0]+','+$scope.bottomMember.pattern[1]+','+$scope.bottomMember.pattern[2]+','+$scope.bottomMember.pattern[3];
		 	 pattern=findAndReplace(pattern,1,"I");	
		 var hcp=findAndReplace($scope.bottomMember.hcp+"",1,"I");					
		 var html1='<div class="BID_body_1"><div class="BID_TX_1">HCP</div></div><div class="BID_body_2"><div class="BID_TX_2"><span>'+hcp+'</span></div></div>';
		 var html2='<div class="BID_body_1"><div class="BID_TX_1">pattern</div></div><div class="BID_body_2"><div class="BID_TX_2"><span>'+pattern+'</span></div></div>';
		
		 var infoName=''; var infoValue;
		 var info={};
		  if(val==0){
			divHtml=html1;			
			info={'type':'hcp','value':hcp};
		  }else if(val==1){
			divHtml=html2;			
			info={'type':'pattern','value':pattern};
		  }
		  $scope.bottomInfo[shareRound-1]=true;
		
		
		 //shareRound+=1;
		 var newEle = angular.element(divHtml);
		 var target = document.getElementById('TWO_'+shareRound);
		 angular.element(target).append(newEle);
		

		// ++infoCount;

		 var content=JSON.stringify({pole:$scope.bottomMember.pole,info,round:shareRound});		
		 $rootScope.sendMessage({sender: memberInfo.memberId, type: 'SHARE',content:content});
		
   };

   var sideInfoShared=[false,false,false];
   var updateOtherMemberInfo=function(data){	 
	    if($scope.topMember.pole==data.pole){			
			addInfoToOthersides('TOP',data);
	    }else if($scope.rightMember.pole==data.pole){		
			addInfoToOthersides('RIGHT',data);
		}else if($scope.leftMember.pole==data.pole){
			addInfoToOthersides('LEFT',data);			
		}
		shareCount+=1;		
		if(data.pole==0){
			$scope.infoSharing(1);
		}else if(data.pole==1){
			$scope.infoSharing(2);
		}else if(data.pole==2){
			$scope.infoSharing(3);
		}else if(data.pole==3){
			$scope.infoSharing(0);
		}	
   };

   $scope.leftInfo=[false,false]; $scope.topInfo=[false,false]; $scope.rightInfo=[false,false];
   $scope.bottomInfo=[false,false];
   var addInfoToOthersides=function(side,data){	  
	   var html='';	 
	   if(data.info.type=='hcp'){
		  html='<div class="BID_body_1"><div class="BID_TX_1">HCP</div></div><div class="BID_body_2"><div class="BID_TX_2">'+data.info.value+'</div></div>';
	   }else  if(data.info.type=='pattern'){
		//var pattern=data.info.value[0]+','+data.info.value[1]+','+data.info.value[2]+','+data.info.value[3];
		var pattern=data.info.value;
		   html='<div class="BID_body_1"><div class="BID_TX_1">pattern</div></div>'+
		   		'<div class="BID_body_2"><div class="BID_TX_2">'+pattern+'</div></div>';
	   }else  if(data.info.type='NCS'){
		//	html='<div class="CARDWITHBG"><div class="BID_body_1"><div class="BID_TX_1">'+data.info.suit+'</div></div><div class="BID_body_2"><div class="BID_TX_2"><span>'+data.info.value+'</span></div></div></div>';   
			html='<div class="BID_body_1"><div class="BID_TX_1">'+data.info.suit+'</div></div><div class="BID_body_2"><div class="BID_TX_2">'+data.info.value+'</div></div>';
	   }
	   
	   var newEle = angular.element(html);
	   var mainId;

	   if(side=='TOP'){
			$scope.topInfo[data.round-1]=true; 

	   }else if(side=='LEFT'){
			$scope.leftInfo[data.round-1]=true; 

	   }else if(side=='RIGHT'){
		 	$scope.rightInfo[data.round-1]=true; 
	   }

	   if(data.round==1){
			mainId='BID_'+side+'_L';
	   }else if(data.round==2){
			mainId='BID_'+side+'_R'; 
	   }
	    
	   var target = document.getElementById(mainId);
	   angular.element(target).append(newEle);  
   };


   //*======================================== Bidding Section==============================//
	$scope.biddingStart=false;
	$scope.biddingRound=1;
	$scope.cssClassDblRdblPass=[1,0,0];
	var dblRdblPassArr=['pass','double','redouble'];
   	var startBidding=function(){ 
		//This is hide features when players turn to bid
		$rootScope.IsHistoryVisible=false;			
		$rootScope.tpntAreaHist=false;
		$rootScope.historyIcon= "HOOLAsset14mdpi";
		$rootScope.isChatClicked=false;
		$rootScope.chatIcon="HOOLAsset13mdpi"; 
		//Show bidding screen to bid 
		$scope.biddingStart=true;
		$scope.cssClassIndex=[1,1,1,1,1,1,1];
		$scope.bidSuitStatus=[0,0,0,0,0];
	};


				
	$scope.isEnabled=[true,true,true,true,true,true,true];
	$scope.suit=['C','D','H','S','NT']; //Suit priority will be deside by index no.
	
	$scope.test=" first directive";
	$scope.cssClass=['BID_TX_Change2','BID_TX_1','BID_TX_Change1'];//GRAY,WHITE,YELLOW
	$scope.cssClassIndex=[0,0,0,0,0,0,0];
	
	$scope.cssClassSuit=['BTM_cardG','BTM_cardW','BTM_cardY'];//GRAY,WHITE,YELLOW
	$scope.bidSuitStatus=[1,1,1,1,1];
	
	var currSelectedSuit='';
	var currSelectedNo=0;
	var currSuitPriority = 0;
	
	var prevSelectedNo=-1;   //This value will be set on event of message listener of websocket
	var prevSelectedSuitIndex=-1; //This value will be set on event of message listener of websocket
	var prevSelectedSuitNum=-1;
	var currentSuitNum=-1;
	var currentSuitIndex =-1;

	

	var currentBid='';
	var suits=['C','D','H','S','NT'];
	var TempDeclarer={};
	var permanentDeclarer={};
	$scope.isBidSelected=false;

	
	//$scope.bidSuitStatus[$scope.suit.indexOf(prevSelectedSuit)]=2;
	//$scope.cssClassIndex[prevSelectedNo-1]=2;
	
	//This function is used to selected the desired suit with no.
	
	$scope.selectSuitNum=function(val){
			currentBid='';
			$scope.isBidSelected=false;
			currentSuitIndex=-1;
			if($scope.cssClassIndex[val]==1){

				if(currentSuitNum!=-1){					
					$scope.cssClassIndex[currentSuitNum-1]=1;
				}
				currentSuitNum=val+1;
				$scope.cssClassIndex[val]=2;
				
				if($scope.biddingRound==1){
					$scope.bidSuitStatus=[1,1,1,1,1];
					$scope.cssClassDblRdblPass[0]=1;
				}else if($scope.biddingRound==2||$scope.biddingRound==3){
					$scope.cssClassDblRdblPass[0]=1;
					$scope.cssClassDblRdblPass[1]=1;
					if($scope.biddingRound==3){
						$scope.cssClassDblRdblPass[1]=0;
					}
						
					var hightestBidRound1;
					   if($scope.biddingRound==2){
							hightestBidRound1=$scope.biddingInfo[0].bid;	
					   }else if($scope.biddingRound==3){
							hightestBidRound1=$scope.biddingInfo[1].bid;
					   }					   
					   
					    var hightSuitNum=parseInt(hightestBidRound1.substring(0,1));					
						var i=0;					
						if(val==hightSuitNum-1){
							i=suits.indexOf(hightestBidRound1.substring(1))+1;
						}

						$scope.bidSuitStatus=[0,0,0,0,0];
					
						for(i;i<suits.length;i++){
							$scope.bidSuitStatus[i]=1;
						}
				}
			}

	};

	$scope.selectSuit=function(val){
		
		if($scope.bidSuitStatus[val]==1){
			if(currentSuitIndex!=-1){					
				$scope.bidSuitStatus[currentSuitIndex]=1;
		
			}else if(currentBid=='pass'||currentBid=='double'||currentBid=='redouble'){
				currentBid='';
			}

			currentSuitIndex=val;
			$scope.bidSuitStatus[val]=2;				
			$scope.cssClassDblRdblPass[0]=1;
			currentBid=currentSuitNum+$scope.suit[currentSuitIndex];				
			$scope.isBidSelected=true;

		}

	};

	$scope.dblRdblPassClick=function(val){
		if($scope.cssClassDblRdblPass[val]==1){	
			$scope.isBidSelected=true;

			if($scope.biddingRound==0||$scope.biddingRound=='double'||$scope.biddingRound=='redouble'){
				$scope.bidSuitStatus=[0,0,0,0,0];	
				var index=$scope.cssClassDblRdblPass.indexOf(2);				
				if(index!=-1){
					$scope.cssClassDblRdblPass[index]=1;
				}
								
			}else if($scope.biddingRound==2){					
				setSuitNumber(2);
			}else if($scope.biddingRound==3){
				setSuitNumber(3);
			}else{				
				$scope.cssClassIndex=[1,1,1,1,1,1,1];
			}			
			
			$scope.bidSuitStatus=[0,0,0,0,0];
			
			var index=$scope.cssClassDblRdblPass.indexOf(2);			
			$scope.cssClassDblRdblPass[index]=1;			
			$scope.cssClassDblRdblPass[val]=2;
			

			currentSuitIndex=-1;
			currentBid=dblRdblPassArr[val];
			
		}
		
	};

			
    $scope.biddingInfo=[];
	$scope.bidClick=function(){		
		var currentSuit;
		var round=$scope.biddingRound;
		$scope.activePole[loggedInMemberPole]=false;
		if(currentBid!==''){		
			var num=currentBid.substring(0,1);
			if(currentBid=="double"||currentBid=="redouble"||currentBid=="pass"){
				num='';
				round=currentBid;
				currentSuit=currentBid;					
			}else if(currentBid.substring(1)!='NT'){
				//currentSuit=getSuitAscii(currentBid.substring(1));
				currentSuit=currentBid.substring(1);
			}else{
				currentSuit=currentBid.substring(1);
			}		
			
			$scope.bottomMember.bidStatus=true;				
			$scope.bottomMember.bid={suit:currentSuit,num:num};
		
			$scope.cssClassDblRdblPass=[1,0,0];

			var bidInfo={'pole':loggedInMemberPole,'BID':currentBid,'round':$scope.biddingRound};
			var content=JSON.stringify({bidInfo});		
			$rootScope.sendMessage({sender: memberInfo.memberId, type: 'BID',content:content});
			$scope.biddingStart=false;	
			currentSuitIndex=-1;
			currentSuitNum=-1;
			currentBid='';
			$scope.isBidSelected=false;
	  }
	};

	//var hightestBidding=currentBid;
	var hightestBidding='';
	var hightBidPole=loggedInMemberPole;
	var count=0;
	var passCount=0;
	var doubleCount=0;
	var redoubleCount=0;
	var roundBidInfo=[];
	$scope.HighestBid={double:0};

	
	var shareBidding=function(data){
		permanentDeclarer.double=0;	
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
			if(passCount==4){
				$timeout(function(){
					//if(table.hostId==memberInfo.memberId){//Changed by upen on 21st Aug 2019
					if(loggedInMemberPole==0){	
						tableServ.generateHand(table.id).then(function(result){																					
							$rootScope.sendMessage({sender: memberInfo.memberId, type: 'DISTRIBUTE', content:''});
						});						
					}
				},600);
				roundBidInfo=[];	
			}else{			
				setHighestPole(roundBidInfo,0);
				updateAllBiddingInfo(roundBidInfo);
				$scope.activePole=[false,false,false,false];
				$timeout(function(){				
					openBiddingForOppositePoles(hightBidPole,1);
				},2000);				
			}
			//roundBidInfo=[];
			count=0;
			passCount=0;

		}else if(data.bidInfo.round==2&&count==2){			
			$scope.activePole=[false,false,false,false];
				var secondRoundBidInfo={pole:hightBidPole,bid:hightestBidding};		
				$scope.biddingInfo[1]=secondRoundBidInfo;						
				updateAllBiddingInfo(roundBidInfo);

				if(passCount==2){
					permanentDeclarer=$scope.biddingInfo[0];
					permanentDeclarer.double=0;
					var content=JSON.stringify({Declarer:permanentDeclarer});
					//if(table.hostId==memberInfo.memberId){
					if(loggedInMemberPole==0){								
						$timeout(function(){							
							$rootScope.sendMessage({sender: memberInfo.memberId, type: 'START_PLAY',content:content});
						},500);	
					}					
					
				}else if((doubleCount==1&&passCount==1)||(doubleCount==2)){
					permanentDeclarer=$scope.biddingInfo[0];
					permanentDeclarer.double=1;
					$scope.HighestBid.double=1;					
					$scope.activePole[$scope.HighestBid.pole]=true;									
					if(loggedInMemberPole==$scope.HighestBid.pole){
						doubleRedoubleBiddingRound('redouble');
					}
					

				}else if((doubleCount>=0&&passCount==0)||(doubleCount==0&&passCount==1)){
					$scope.biddingRound=3;
					$scope.HighestBid.suit=hightestBidding.substring(1);	
					$scope.HighestBid.num=hightestBidding[0];
					$scope.HighestBid.pole=hightBidPole;									
					setHighestPole(roundBidInfo,1);
					
					$timeout(function(){											
						thirdBiddingRound();
					},3000);			
				}
				//roundBidInfo=[];
				doubleCount=0;
				passCount=0;
				count=0;
					
		}else if(data.bidInfo.round==3&&count==2){
			$scope.activePole=[false,false,false,false];
			updateAllBiddingInfo(roundBidInfo);
			
			permanentDeclarer=$scope.biddingInfo[1];
			$scope.HighestBid=$scope.biddingInfo[1];
			setHighestPole(roundBidInfo,2);				
			
			if(passCount==2){	
				$scope.HighestBid.double=0;					
				var content=JSON.stringify({Declarer:permanentDeclarer});	
				//if(table.hostId==memberInfo.memberId){
				if(loggedInMemberPole==0){						
					$timeout(function(){
						$rootScope.sendMessage({sender: memberInfo.memberId, type: 'START_PLAY',content:content});
					},500);							
				}		
				
			}else if((doubleCount==2 && passCount==0)||(doubleCount==1 && passCount==1)){					
				$scope.HighestBid.double=1;
				$scope.activePole[$scope.HighestBid.pole]=true;					
				if(loggedInMemberPole==$scope.HighestBid.pole){
					doubleRedoubleBiddingRound('redouble');
				}			
				
			}else{					
				updateAllBiddingInfo(roundBidInfo);
				$scope.HighestBid={pole:hightBidPole,poleName:poleNameArr[hightBidPole],
					suit:hightestBidding.substring(1), num:hightestBidding[0],
					BID:hightestBidding,double:0};				

				permanentDeclarer={pole:hightBidPole,bid:hightestBidding};
				//highLightHighestBid(hightBidPole);					
				setHighestPole(roundBidInfo,0);

				
				$scope.activePole=[false,false,false,false];
				$timeout(function(){				
					openBiddingForOppositePoles(hightBidPole,2);
				},2000);
				
			}
			// permanent declarer double=0 no double 1=double 2=redouble; 	
			permanentDeclarer.double=0;
			passCount=0;
			count=0;
		/*
			$timeout(function(){				
				openBiddingForOppositePoles(hightBidPole,2);
			},1000);*/

		}else if(data.bidInfo.round=='double'&&count==2){
			$scope.activePole=[false,false,false,false];
			updateAllBiddingInfo(roundBidInfo);
			if(passCount==2){					
				var content=JSON.stringify({Declarer:permanentDeclarer});	
				//if(table.hostId==memberInfo.memberId){
				if(loggedInMemberPole==0){						
					$timeout(function(){
						$rootScope.sendMessage({sender: memberInfo.memberId, type: 'START_PLAY',content:content});
					},500);
						
				}	
			}else if(doubleCount>=1){			
				$scope.HighestBid.double=1;					
				$scope.activePole[$scope.HighestBid.pole]=true;				
				if(loggedInMemberPole==$scope.HighestBid.pole){
					doubleRedoubleBiddingRound('redouble');
				}
				
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
				permanentDeclarer.double=2;
			}
		
			var content=JSON.stringify({Declarer:permanentDeclarer});
			//if(table.hostId==memberInfo.memberId){
			if(loggedInMemberPole==0){							
				$timeout(function(){
					$rootScope.sendMessage({sender: memberInfo.memberId, type: 'START_PLAY',content:content});
				},500);				
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
							
			}
			$scope.activePole[parseInt(bidPole)]=false;
	};

	var updateAllBiddingInfo=function(roundBidInfo){		
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
			}
		}
	};

	var getSuitAscii=function(val){
		var suit=''; 
			if(val=='C'){
				suit='&#x2663;';						
			}else if(val=='D'){
				suit='&#x2666;';
			}else if(val=='H'){
				suit='&#x2665;';
			}else if(val=='S'){
				suit='&#x2660;';
			}else if(val=='NT'){
				suit=val;
			}
			return suit;
	};

	var secondRoundBidding=function(){	
		$timeout(function(){
			startBidding();
			setSuitNumber(2);			
			$scope.biddingRound=2;		
		},1000);
	};


	var setSuitNumber=function(roundNum){	
		var hightestSuitIndex=suits.indexOf(hightestBidding.substring(1));;
		var hightestSuitNum=parseInt(hightestBidding.substring(0,1));	
					
		var highestNum=-1;
		if(hightestBidding.substring(1)=='NT'){
			highestNum=hightestSuitNum;
		}else{
			highestNum=hightestSuitNum=hightestSuitNum-1;
		}
		$scope.cssClassIndex=[1,1,1,1,1,1,1];
		$scope.bidSuitStatus=[0,0,0,0,0];		
				
		for(var i=0;i<highestNum;i++){
			$scope.cssClassIndex[i]=0;
		}		
		$scope.cssClassDblRdblPass=[1,1,0];		
	};


	var thirdBiddingRound=function(){	
		$scope.biddingRound=3;
		$scope.tempDeclarerPole=parseInt($scope.biddingInfo[0].pole);		
		$scope.tempDeclarerPartnerPole=$scope.tempDeclarerPole<2?($scope.tempDeclarerPole+2):($scope.tempDeclarerPole==2?0:1);		
		
		$scope.activePole[$scope.tempDeclarerPole]=true;
		$scope.activePole[$scope.tempDeclarerPartnerPole]=true;
		
		if(loggedInMemberPole==$scope.tempDeclarerPole || loggedInMemberPole==$scope.tempDeclarerPartnerPole){			
			setSuitNumber(3);			
			$timeout(function(){			
				$scope.biddingStart=true;
			},1000);
		}
	};
	

	$scope.doubleRedoubleRound='';
	var doubleRedoubleBiddingRound=function(val){	
		if(val=='double'){
			$scope.doubleRedoubleRound='double';
		}else if(val=='redouble'){
			$scope.doubleRedoubleRound='redouble';
		}
		$timeout(function(){
			$scope.biddingStart=true;			
			$scope.cssClassIndex=[0,0,0,0,0,0,0];
			$scope.bidSuitStatus=[0,0,0,0,0];
			$scope.biddingRound=0;
			if(val=='double'){				
				$scope.biddingRound='double';
				$scope.cssClassDblRdblPass=[1,1,0];	
			}else if(val=='redouble'){
				$scope.cssClassDblRdblPass=[1,0,1];			
				$scope.biddingRound='redouble';
			}
			
		},2000);
	};

	var openBiddingForOppositePoles=function(hightBidPole,val){		
		var biddingCondition=false;		
		
		if(hightBidPole==0||hightBidPole==2){
			$scope.activePole[1]=true;
			$scope.activePole[3]=true;
		}else if(hightBidPole==1||hightBidPole==3){
			$scope.activePole[0]=true;
			$scope.activePole[2]=true;
		}

		if((hightBidPole==0||hightBidPole==2)&&(!(loggedInMemberPole==0||loggedInMemberPole==2))){
			biddingCondition=true;			
		}else if((hightBidPole==1||hightBidPole==3)&&(!(loggedInMemberPole==1||loggedInMemberPole==3))){
			biddingCondition=true;
		}

		if(biddingCondition){
			if(val==1){
				secondRoundBidding();
			}else if(val==2){
				doubleRedoubleBiddingRound('double');
			}
		}
	};

	$scope.dummy={};
	$scope.isPlayStart=false;
	$scope.winningTrickSide="right";
	$scope.gameContractSide="right";
	$scope.NSPoint=0;
	$scope.EWPoint=0;
	$scope.playedCard=[];
	$scope.isPoleActiveToPlay=[false,false,false,false];
	$scope.showScore=false;
	$scope.isBidAndTrickBoxInBottom=false;
	var turnCount=0;
	$scope.NSScore=0;
	$scope.EWScore=0;
	$scope.TotalNSPoint=0;
	$scope.TotalEWPoint=0;
	
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
			$scope.dummy.pole=$scope.Declarer.pole>=2 ? $scope.Declarer.pole-2 : $scope.Declarer.pole+2; 
		
			angular.forEach(hands,function(value,key){
				if($scope.dummy.pole==value.directionCode){
					$scope.dummy.cards=value.cards;
					
					$scope.isJoinTable=2;
					$scope.isPlayStart=true;
				}
			});
			if(loggedInMemberPole==$scope.Declarer.pole){
				$scope.isAbleToPlayDummy=true;
			}			
		},1000);
	};

	$scope.isDummyCardPlayed=false;
	$scope.bottomCardLength=0;
	$scope.playCard=function(card,type){
		//console.log("During Card Play-- isAbleToPlay : "+isAbleToPlay+" isOpponentAbleToTackBack : "+isOpponentAbleToTackBack);
		var cardNo=card[0];
		var cardSuit=card[1];
		var pole=parseInt(card[2]);
		if($scope.isPoleActiveToPlay[pole] && loggedInMemberPole!=$scope.dummy.pole && isAbleToPlay==true){			
			if(playedCardInfo.length==0 || checkForStartingSuitCard(cardSuit,pole,type)==true){
				isOpponentAbleToTackBack=false;
				//console.log("No of counts : "+turnCount);		
				$scope.playedCard[pole]="assets/images/deck/"+cardNo + cardSuit+".svg";	
				playedCardInfo[turnCount]= cardNo + "-"+ cardSuit+"-"+pole;

				if(pole!=$scope.dummy.pole){
					var index1 = $scope.bottomMember.cards.indexOf(cardNo+cardSuit);				
					$scope.bottomMember.cards.splice(index1, 1); 
					lastCardPlayedInfo={cardIndex:index1,cardNo:cardNo,cardSuit:cardSuit,playerPole:pole,isDummy:false};
					
				}else if(pole==$scope.dummy.pole){
					var index2 = $scope.dummy.cards.indexOf(cardNo+cardSuit);				
					$scope.dummy.cards.splice(index2, 1); 
					lastCardPlayedInfo={cardIndex:index2,cardNo:cardNo,cardSuit:cardSuit,playerPole:pole,isDummy:true};
				}
						
				var poleIndexForNextTurn= (pole == 3 ? 0 : pole+1);	
				var content=JSON.stringify({cardNo:cardNo, cardSuit:cardSuit, pole:pole, nextPoleToPlay : poleIndexForNextTurn});				
				$rootScope.sendMessage({sender: memberInfo.memberId, type: 'PLAY_CARD', content:content});
				$scope.isPoleActiveToPlay[pole]= false;
				$scope.activePole[pole]=false;
				//In this version fourth player woun't be able to take back
				if(turnCount<3){	
					//$rootScope.isTakeBackEnabled=true;
					$rootScope.sidebar[4]=true;																			
				}	
				//$rootScope.isHistoryEnabled=true;	//history only visible if first card played		
				$rootScope.sidebar[3]=true;									
			}
		}		
	};


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
		if(!isFirstCardPlayed){			
			isFirstCardPlayed=true;			
			if($scope.topMember.pole==$scope.dummy.pole){
				$scope.topMember.isDummy=true;
			}else if($scope.rightMember.pole==$scope.dummy.pole){
				$scope.rightMember.isDummy=true;
				$scope.winningTrickSide="left";
				$scope.gameContractSide="left";							
			}else if($scope.leftMember.pole==$scope.dummy.pole){
				$scope.leftMember.isDummy=true;			
			}else if($scope.bottomMember.pole==$scope.dummy.pole){
				$scope.bottomMember.isDummy=true;				
			}	
		}		

		if(loggedInMemberPole==data.pole || ($scope.dummy.pole==data.pole && $scope.topMember.pole==$scope.dummy.pole)){
			if($scope.bottomMember.pole!=$scope.dummy.pole)
				$rootScope.sidebar[4]=true;
				//$rootScope.isTakeBackEnabled=true;
		}			
		else{
			//$rootScope.isTakeBackEnabled=false;
			$rootScope.sidebar[4]=false;		
		}
		$scope.activePole[data.pole]=false;
		$scope.isPoleActiveToPlay[data.pole]= false;
		$scope.playedCard[data.pole]="assets/images/deck/"+data.cardNo + data.cardSuit+".svg";	
		playedCardInfo[turnCount]= data.cardNo + "-"+ data.cardSuit+"-"+data.pole;		
		turnCount+=1;
		//$rootScope.isHistoryEnabled=true;		
		$rootScope.sidebar[3]=true;		
		if($scope.bottomMember.pole!=$scope.dummy.pole){
			$rootScope.sidebar[2]=true;		
			var index2=$scope.dummy.cards.indexOf(data.cardNo+data.cardSuit);			
			if(index2!=-1){				
				$scope.dummy.cards.splice(index2, 1); 
			}
		}else if($scope.bottomMember.pole==$scope.dummy.pole){
			var index1 =-1;
			if($scope.topMember.pole==data.pole){			
				index1= $scope.topMember.cards.indexOf(data.cardNo+data.cardSuit);	
				if(index1!=-1)
					$scope.topMember.cards.splice(index1, 1);	
			}else{
				index1= $scope.bottomMember.cards.indexOf(data.cardNo+data.cardSuit);
				if(index1!=-1)
					$scope.bottomMember.cards.splice(index1, 1);			
			}
		}

		//To reduce played card from left & right side except dummy pole
		if($scope.leftMember.pole != $scope.dummy.pole){
			let indx= $scope.leftMember.cards.indexOf(data.cardNo+data.cardSuit);
				if(indx!=-1)
					$scope.leftMember.cards.splice(indx, 1);
		}
		if($scope.rightMember.pole != $scope.dummy.pole){
			let indx= $scope.rightMember.cards.indexOf(data.cardNo+data.cardSuit);
				if(indx!=-1)
					$scope.rightMember.cards.splice(indx, 1);
		}

		//console.log("Turn count: "+turnCount+" Takeback permission status : "+isOpponentAbleToTackBack);		
		if(turnCount==4){
			//$rootScope.isTakeBackEnabled=false;	
			$rootScope.sidebar[4]=false;		
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
					//var transImg="assets/images/deck/trans.svg";
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
					
						if(wonTricksCount[0]+wonTricksCount[1]==13){ //upen 							
							let dealInfo=$scope.HighestBid;								
							dealInfo.wonTricks=wonTricksCount;
							dealInfo.tableId=table.id;
							dealInfo.doubleCount=$scope.HighestBid.double;
							$scope.isPoleActiveToPlay=[false,false,false,false];
							$scope.activePole=[false,false,false,false];
							
						    if(loggedInMemberPole==dealerPole){	
								tableServ.saveGameResult(dealInfo).then(function(result){						
									 $rootScope.sendMessage({sender: memberInfo.memberId, type: 'SCORE', content:JSON.stringify(result.data)}); 
								});							
						    }														
						}						
					  },2000);   // As per Arun suggestion
					}
			 }
		 
		}else{
			$timeout(function(){							
				$scope.isPoleActiveToPlay[data.nextPoleToPlay]= true;
				$scope.activePole[data.nextPoleToPlay]= true;
				isOpponentAbleToTackBack=true;	
			},1000);	
		}		
	};
  
  
	var checkForStartingSuitCard=function(cardSuit,pole,type){
		var isStartingSuitExist=true;	
		var firstCard=playedCardInfo[0].split("-");		
		if(cardSuit!=firstCard[1]){
			var data=(type=='bottom'? $scope.bottomMember.cards: $scope.dummy.cards);	
			for(var i=0;i<data.length;i++){
				var card=data[i];
				if(card[1]==firstCard[1]){					
					isStartingSuitExist=false;
					break;
				}
			}
		}
		return isStartingSuitExist;	
	};
	
	
	var showAllCards=function(){	
		$scope.isBiddingStart=false;
		$scope.isPlayStart=false;		
		if(loggedInMemberPole==-1){				
			angular.forEach(hands,function(value,key){				
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
		}else{
			angular.forEach(hands_1,function(value,key){			
				if($scope.bottomMember.pole==value.directionCode){
					$scope.bottomMember.cards=value.cards;
					$scope.bottomMember.isDummy=false;					
				}else if($scope.topMember.pole==value.directionCode){
					$scope.topMember.cards=value.cards;	
					$scope.topMember.isDummy=true;
				}else if($scope.rightMember.pole==value.directionCode){
					$scope.rightMember.cards=value.cards;	
					$scope.rightMember.isDummy=true;
				}else if($scope.leftMember.pole==value.directionCode){
					$scope.leftMember.cards=value.cards;
					$scope.leftMember.isDummy=true;
				}
			});
		}						
		$timeout(function(){
			$scope.showScore=false;
			$scope.isBidAndTrickBoxInBottom=false;
			resetGameTable();
		},15000);	//chnaged as per Amresh's suggestion 6th April 2019	
	};
	
	var showGameResult=function(result){		 
		showAllCards();
		$timeout(function(){
			//$rootScope.isTakeBackEnabled=false;
			$rootScope.sidebar[4]=false;
			//$rootScope.isHistoryEnabled=false;
			$rootScope.sidebar[3]=false;
			$rootScope.sidebar[2]=false;
			$rootScope.IsHistoryVisible=false;			
			$rootScope.tpntAreaHist=false;
			$rootScope.historyIcon= "HOOLAsset14mdpi";
			$rootScope.isChatClicked=false;
			$rootScope.chatIcon="HOOLAsset13mdpi";

			$scope.NSScore=result.NSPoint;
			$scope.EWScore=result.EWPoint;			
			$scope.TotalNSPoint=$scope.TotalNSPoint+ $scope.NSScore;
			$scope.TotalEWPoint=$scope.TotalEWPoint+ $scope.EWScore;			
			$scope.showScore=true;
			$scope.isBidAndTrickBoxInBottom=true;
		},3000);	
	};	

	var resetGameTable=function(){
		resetBiddingScreen();
		$scope.topMember.isDummy=false;
		$scope.leftMember.isDummy=false;	
		$scope.rightMember.isDummy=false;	
		$scope.bottomMember.isDummy=false;

		$scope.topMember.highestBid=false;
		$scope.leftMember.highestBid=false;	
		$scope.rightMember.highestBid=false;	
		$scope.bottomMember.highestBid=false;
		
		$scope.leftMember.isClaimed=false;
		$scope.rightMember.isClaimed=false;		
		$scope.bottomMember.cards=[];

		$rootScope.sidebar[4]=false;//takeback			
		$rootScope.sidebar[3]=false;//history
		$rootScope.sidebar[2]=false;//claim
		
		isFirstCardPlayed=false;
        $scope.isJoinTable=1;
		$scope.dummy.cards=[];
		$scope.isPlayStart=false;
		$scope.isBiddingStart=false;
		$scope.isPoleActiveToPlay=[false,false,false,false];
		$scope.activePole=[false,false,false,false];
		wonTricksCount=[0,0];
		$scope.HighestBid={};

		tempCardNo=0;
		tempSuitName="NA";	
		currCardNo=0;
		currSuitName="NA";
		tempTrickWinnerPole=-1;
		turnCount=0;
		playedCardInfo=[];
	
		// reset InfoSharing
		resetSharingInfo();

		//if(table.hostId==memberInfo.memberId){
		if(loggedInMemberPole==0){	
			tableServ.generateHand(table.id).then(function(result){																					
				$rootScope.sendMessage({sender: memberInfo.memberId, type: 'DISTRIBUTE', content:''});
			});	
		}		
	};
	
	var resetGameTableOnLeave=function(){
		resetBiddingScreen();
		 $scope.isJoinTable=0;
		// reset InfoSharing		
		
		/* reset score board */
		$scope.showScore=false;
		$scope.isBidAndTrickBoxInBottom=false;
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
		$rootScope.sidebar[2]=false;
		$rootScope.sidebar[3]=false;//$rootScope.isHistoryEnabled=false;
		$rootScope.sidebar[4]=false;
		$rootScope.tpntAreaHist=false;
		$rootScope.IsHistoryVisible=false;
		$rootScope.historyIcon="HOOLAsset14mdpi";

		tableServ.gameTableRecord(table.id).then(function(result){						
			 populatePlayerList(result.data.table);						
		});		
	};


	var resetSharingInfo=function(){
		$scope.leftInfo=[false,false]; $scope.topInfo=[false,false];
		$scope.rightInfo=[false,false];  $scope.bottomInfo=[false,false];
		$scope.sevenCardArr=[true,true,true,true,true,true,true];		
		angular.element(document.querySelector('#TWO_1')).empty();
		angular.element(document.querySelector('#TWO_2')).empty();
		angular.element(document.querySelector('#BID_LEFT_L')).empty();
    	angular.element(document.querySelector('#BID_LEFT_R')).empty();
		angular.element(document.querySelector('#BID_TOP_L')).empty();
		angular.element(document.querySelector('#BID_TOP_R')).empty();
		angular.element(document.querySelector('#BID_RIGHT_L')).empty();
		angular.element(document.querySelector('#BID_RIGHT_R')).empty();
		$scope.activePole=[false,false,false,false];
	};

	var resetBiddingScreen=function(){
		//permapermanentDeclarer={};
		$scope.cssClassIndex=[1,1,1,1,1,1,1];
		$scope.bidSuitStatus=[0,0,0,0,0];
		$scope.cssClassDblRdblPass=[1,0,0];
		$scope.biddingRound=1;
		currentBid='';
		currentSuitNum=-1;
		currentSuitIndex=-1;
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
	
	function updateLeavedUserInfo(leavedMemberId){
		$timeout(function(){			
			if($scope.isJoinTable==0){
				tableServ.gameTableRecord(table.id).then(function(result){
					populatePlayerList(result.data.table);									
				});					
			}else if($scope.isJoinTable>0){		
				if($scope.topMember.memberId==leavedMemberId){
					$scope.topMember.username=addName;
					$scope.topMember.isHost=false;
				}else if($scope.rightMember.memberId==leavedMemberId){
					$scope.rightMember.username=addName;
					$scope.rightMember.isHost=false;
				}else if($scope.bottomMember.memberId==leavedMemberId){
					$scope.bottomMember.username=addName;
					$scope.bottomMember.isHost=false;
				}else if($scope.leftMember.memberId==leavedMemberId){
					$scope.leftMember.username=addName;	
					$scope.leftMember.isHost=false;
				}
				
				if($scope.topMember.memberId==table.hostId){
					$scope.topMember.isHost=true;								
				}else if($scope.rightMember.memberId==table.hostId){
					$scope.rightMember.isHost=true;
				}else if($scope.bottomMember.memberId==table.hostId){
					$scope.bottomMember.isHost=true;
				}else if($scope.leftMember.memberId==table.hostId){
					$scope.leftMember.isHost=true;	
				}
				$localStorage.table = JSON.stringify(table);
			} 
		},1000);		
	}

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
					let iWinningPole=hstry.winnerPoleList[iCntr];
					angular.forEach(hstry.playedCard,function(val, key){
						let data=JSON.parse(val);	
						iCounter++;
						if(iCounter>1 && iCounter%4==1){
								iCntr++;
								iWinningPole=hstry.winnerPoleList[iCntr];
						}       			
						if(data.pole==$scope.topMember.pole){			
								$scope.playedCardsByTop.push({card:data.cardNo+data.cardSuit,won:iWinningPole==data.pole?true:false});
						}else if(data.pole==$scope.rightMember.pole){			
								$scope.playedCardsByRight.push({card:data.cardNo+data.cardSuit,won:iWinningPole==data.pole?true:false});
						}else if(data.pole==$scope.bottomMember.pole){			
								$scope.playedCardsByBottom.push({card:data.cardNo+data.cardSuit,won:iWinningPole==data.pole?true:false});
						}else if(data.pole==$scope.leftMember.pole){			
								$scope.playedCardsByLeft.push({card:data.cardNo+data.cardSuit,won:iWinningPole==data.pole?true:false});
						} 
					});
					isHistoryButtonClicked=true;
			});
		};		
	};	
	/**To hide required features when player turn will come to play */
	var turnOffWhenPlayerTurnToPlay = function(){		
		if(($scope.activePole[parseInt(loggedInMemberPole)]==true || $scope.topMember.pole==$scope.dummy.pole) && $scope.bottomMember.pole!=$scope.dummy.pole){
			$rootScope.IsHistoryVisible=false;			
			$rootScope.tpntAreaHist=false;
			$rootScope.historyIcon= "HOOLAsset14mdpi";
			$rootScope.isChatClicked=false;
			$rootScope.chatIcon="HOOLAsset13mdpi";				
		};
	};

	$scope.$watch("activePole", function(newValue, oldValue){
		//if(newValue != oldValue && newValue==true)		 
		  turnOffWhenPlayerTurnToPlay();		
	},true);
	
	/***************************************************************************************
	 * This block of code written to claim tricks by player to approve by opponent.
	 * Once player claims for selected tricks then all cards of that player will be visible  
	 * for all axcept his/her partner. But it's not applicable for Dummy and kibitzer.
	 * *************************************************************************************/
	$scope.claimNoCls =[];
	$scope.isTricksActiveToClaim=[];
	$scope.range = function(min, max, step){
		step = step || 1;
		var input = [];
		let noOfPlayedTricks=wonTricksCount[0]+wonTricksCount[1];
		for (var i = min; i <= max; i += step){ 
			input.push(i);			
		}	
		return input;
	};
	$scope.selectedTricksToClaim = 0;
	$rootScope.showTricksClaimDialogueBox=function(){	
		$scope.isClaimBtnActive=false;
		$scope.selectedTricksToClaim = 0;	
		$scope.isTrickClaimVisible = $scope.tpntArea = $scope.tpntArea ==true? false:true;
		let noOfPlayedTricks = wonTricksCount[0] + wonTricksCount[1];	
		for (var i = 0; i <= 13; i++){ 
			$scope.isTricksActiveToClaim[i]= i <=(13-noOfPlayedTricks)? true:false;
			$scope.claimNoCls[i]= i <=(13-noOfPlayedTricks)? 'grid-item btn': 'grid-item btn-inactive'		
		}	
	};
	$rootScope.selectTricksToClaim=function(tricks){		
		let noOfPlayedTricks = wonTricksCount[0] + wonTricksCount[1];
		for (var i = 0; i <= (13-noOfPlayedTricks); i++){ 
			$scope.claimNoCls[i]=(tricks == i? 'grid-item btn-active': 'grid-item btn');			
		}
		$scope.selectedTricksToClaim = tricks;
		if(tricks>=0)
			$scope.isClaimBtnActive=true;					
	};
	$scope.claimSelectedTricksToApprove=function(){
		if($scope.isClaimBtnActive){
			$scope.isTrickClaimVisible = $scope.tpntArea = false;
			let content=JSON.stringify({'claimed_by_pole':loggedInMemberPole,'claimed_tricks':$scope.selectedTricksToClaim,'sender': $localStorage.username});
			let claimMessage = {sender: memberInfo.memberId, type: 'CLAIM_REQUEST', content:content};	
			$rootScope.sendMessage(claimMessage);
		}
	};

	var claimedInfo=null;
	var showAcceptRejectClaimDialogueBox = function(content){		
		if(content.claimed_by_pole==$scope.rightMember.pole){
			$scope.rightMember.isClaimed=true;
		}else if(content.claimed_by_pole==$scope.leftMember.pole){			
			$scope.leftMember.isClaimed=true;
		}
		$scope.isBidAndTrickBoxInBottom=true;//To show bidding box in bottom side of the screen;

		claimedInfo=content;		
		claimedBySide=content.claimed_by_pole;			
		if(loggedInMemberPole==((claimedBySide+3)%4) || loggedInMemberPole==((claimedBySide+1)%4)){											
			if(!$scope.bottomMember.isDummy){	//to not show takeback alert for dummy																		
				if(loggedInMemberPole==$scope.Declarer.pole || $scope.topMember.pole==$scope.dummy.pole){
					$scope.isClaimAcceptRejectVisible = $scope.tpntArea = $scope.tpntArea ==true? false:true;
					$scope.claimedTricks=content.claimed_tricks;
					$scope.claimedByPlayer = content.sender;
					let msg=content.claimed_tricks>1 ? "I claim "+content.claimed_tricks+" of the remaining tricks":(content.claimed_tricks==1?"I claim "+content.claimed_tricks+" trick":"I concede all the tricks");
					$scope.claimedMessage=msg;		
				}else{	
					$scope.isClaimAcceptRejectVisible = $scope.tpntArea = $scope.tpntArea ==true? false:true;
					$scope.claimedTricks=content.claimed_tricks;
					$scope.claimedByPlayer=content.sender;
					let msg=content.claimed_tricks>1 ? "I claim "+content.claimed_tricks+" of the remaining tricks":(content.claimed_tricks==1?"I claim "+content.claimed_tricks+" trick":"I concede all the tricks");
					$scope.claimedMessage=msg;	
				}
			}
		}
	};


	var isAccept=true;
	$scope.acceptRejectClaimedTricks=function(actionCode){	
		//Action Code 0 is rejected and 1 stand for accepted
		if(isAccept){
			isAccept=false;
			if(actionCode==1){
				$scope.isClaimAcceptRejectVisible = $scope.tpntArea = $scope.tpntArea ==true? false:true;
				let claimMessage = {sender: memberInfo.memberId, type: 'CLAIM_APPROVAL', content:JSON.stringify({'accepted_by_pole':loggedInMemberPole,'claimed_by_pole':claimedBySide, 'claimed_tricks':$scope.claimedTricks,'sender': $localStorage.username})};	
				$rootScope.sendMessage(claimMessage);
				isAccept=true;
			}else{
				$scope.isClaimAcceptRejectVisible = $scope.tpntArea =false;
				let claimMessage = {sender: memberInfo.memberId, type: 'CLAIM_CANCEL', content:JSON.stringify({'canceled_by_pole':loggedInMemberPole,'claimed_by_pole':claimedBySide, 'claimed_tricks':$scope.claimedTricks,'sender': $localStorage.username})};	
				$rootScope.sendMessage(claimMessage);
				isAccept=true;
			}
		};
	};
	var onClaimRequestRejectedDone=function(content){
		$scope.isClaimAcceptRejectVisible = $scope.tpntArea = false;
		$rootScope.confirmbox={message : content.sender+ ": rejected the claim!", boxType : "alert", boxCode : "back"};
		$rootScope.IsConfirmBoxOn = $rootScope.IsLightBoxOn = true;
		$timeout(function(){
			$rootScope.IsConfirmBoxOn = $rootScope.IsLightBoxOn = false;
		},2000);
	};
	var onClaimRequestAcceptDone= function(content){			
		let claimedTricks = $scope.claimedTricks = content.claimed_tricks;
		let claimedByPole = content.claimed_by_pole;	
		$scope.isClaimAcceptRejectVisible = $scope.tpntArea =false;	
		$scope.isMessageVisibleAfterClaim = $scope.tpntArea = $scope.tpntArea ==true? false:true;			
		if(claimedByPole==0 || claimedByPole==2){			
			$scope.NSPoint = wonTricksCount[0] = (wonTricksCount[0] + claimedTricks); //Assigned claimed tricks to claimer
			$scope.EWPoint = wonTricksCount[1] = (13 - wonTricksCount[0]);//Assigned rest tricks to opponent of claimer
		}else if(claimedByPole==1 || claimedByPole==3){			
			$scope.EWPoint = wonTricksCount[1] = (wonTricksCount[1] + claimedTricks); //Assigned claimed tricks to claimer
			$scope.NSPoint = wonTricksCount[0] = (13 - wonTricksCount[1]);//Assigned rest tricks to opponent of claimer
		}
		
		$timeout(function(){
			$scope.isMessageVisibleAfterClaim = $scope.tpntArea =false;			
			let dealInfo = $scope.HighestBid;								
			dealInfo.wonTricks = wonTricksCount;
			dealInfo.tableId=table.id;
			dealInfo.doubleCount=$scope.HighestBid.double;

			$scope.isPoleActiveToPlay=[false,false,false,false];
			$scope.activePole=[false,false,false,false];
			claimedInfo=null;				
			if(loggedInMemberPole==dealerPole){	
				tableServ.saveGameResult(dealInfo).then(function(result){						
					$rootScope.sendMessage({sender: memberInfo.memberId, type: 'SCORE', content:JSON.stringify(result.data)});				
				});						
			}		
		},2000);
	};
	
    /***********************************************************************************************
	 * This block of code will be used in case of controller unload
	 ************************************************************************************************/
	$scope.$on('$destroy', function() {					        
		var tableInfo={tableId : table.id, memberId : memberInfo.memberId};	 
		if($localStorage.memberType=="PLAYER" || ($localStorage.memberType=="KIBITZER" && isKibitzerMovedToOwnScreen==false)){      
			tableServ.leaveTable(tableInfo).then(function(result){
				$rootScope.leaveChannel();					
			});
		}
		//$rootScope.isTakeBackEnabled=false;
		$rootScope.sidebar[4]=false;
		//$rootScope.isHistoryEnabled=false;
		$rootScope.sidebar[3]=false;
	});

	$scope.hitAndTest=function(){
		let data={pole:0,poleName:"North",BID:"4H",num:"4",suit:"H",double:0,wonTricks:[1,9],tableId:1,doubleCount:0};
		tableServ.saveGameResult(data).then(function(result){
			console.log("Score Result----"+JSON.stringify(result.data));
		});	
	}
});


function findAndReplace(string, target, replacement) {
 
 var i = 0, length = string.length; 
 for (i; i < length; i++) { 
   string = string.replace(target, replacement); 
 } 
 return string; 
}

	app.directive('biddingBlock', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/bidding_block.html'
		};
	});

	app.filter('capitalize', function() {
		return function(input) {
			//return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
		  	return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1) : '';
		}
	});


	app.filter('html',function($sce){
		return function(input){
			return $sce.trustAsHtml(input);
		}
	});

	app.filter('replace', [function () {
		return function (input, from, to) {      
		  if(input === undefined) {
			return;
		  }  
		  var regex = new RegExp(from, 'g');
		  return input.replace(regex, to);       
		};
	}]);
	
} ());	
	