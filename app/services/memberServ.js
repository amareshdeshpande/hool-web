(function () {
    'use strict';
    var app =angular.module("hoolApp");

    app.service("memberServ", function ($http, webapiUrl,$localStorage) {
        /*Function is used to validate user*/ 
        this.validate = function (credential) {	            	
            return $http({
                method: 'POST',
                url: webapiUrl + '/oauth/token',
                data: {
                    username: credential.loginId,
                    password: credential.password
                },
                headers: {'Content-Type': 'application/json'}
            });
        };

        
        this.register=function(member){        
            return $http({
                method:'POST',
                url:webapiUrl+'/register',
                data:member,
                headers: {'Content-Type': 'application/json'}
            });
        };
        

        this.userInfo=function(username){                 
            return $http({
                method: 'GET',
                url: webapiUrl + '/api/member/'+username,              
                headers: {                    
                    'Authorization': $localStorage.token
                }
            });
        };
        
        /*Function is used to change user password*/        
        this.changePasword = function (data) {         
            return $http({
                method: 'POST',
                url: webapiUrl + '/account/ChangePassword',
                data: data,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': $localStorage.token
                }
            });
        };
        this.recoverPassword=function(member){
            // alert(JSON.stringify(member));
              return $http({
                  method:'POST',
                  url:webapiUrl+'/member/password/recovery/request',             
                  data:member.email,
                  headers: {'Content-Type': 'application/json'}
              });
          };

          this.checkTokenValidity=function(token){            
               return $http({
                   method:'GET',
                   url:webapiUrl+'/member/check/validity/'+token,
                   headers: {'Content-Type': 'application/json'}
               });
           };
           
           this.resetPasword = function (data) {         
             return $http({
                 method: 'POST',
                 url: webapiUrl + '/member/reset/password',
                 data: data,
                 headers: {'Content-Type': 'application/json'}
             });
         };
        
    });

    app.factory('sharedUserPreferences', function () {
        var customer = {};
        return {

            getCustomerInfo: function () {
                return customer;
            },

            setCustomerInfo: function (customerName, mobileNo, isNewCustomer) {
                customer.customerName = customerName;
                customer.customerMobile = mobileNo;
                customer.isNewCustomer = isNewCustomer;
            }
        }
    });
} ());	
	