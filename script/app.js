









  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAT0PIKTzsX9Te5rT9YQwBoNLb8JS9HTjY",
    authDomain: "nightlightgo.firebaseapp.com",
    databaseURL: "https://nightlightgo.firebaseio.com",
    storageBucket: "nightlightgo.appspot.com",
    messagingSenderId: "209803888858"
  };



  firebase.initializeApp(config);

/*
angular.element(document).ready(function() {
  angular.bootstrap(document, ["myApp"]);
});
*/

function angularStart(route){


        angular.element(document).ready(function() {
          angular.bootstrap(document, ["nightlightgo"]);
          var $injector = angular.element(document).injector();
          var $location = $injector.get('$location');
          $location.path(route);
          initlized = true;

        });


}

var userGlobal;
var initlized = false;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user && user.uid && !initlized) {
        //$rootScope.user = user;
        userGlobal = user;
        angularStart('/info');

      } else if (!initlized) {
        angularStart('/signin');

      }
    });
document.addEventListener('touchmove', function(e){e.preventDefault()}, false);


  var app = angular.module("nightlightgo", ['ngRoute', 'ngMap', 'firebase','ngTouch']);
  app.config(function($routeProvider) {
    $routeProvider
    // route for the home page
      .when('/cam', {
        templateUrl: '/templates/cam.html',
        controller: 'camCtrl'
      }).when('/g', {
        template: '<button ng-click="g()">g</button>',
        controller: 'gCtrl'
      })
      // route for the about page
      .when('/signin', {
        templateUrl: '/templates/login.html',
        controller: 'loginCtrl'
      })
      .when('/info', {
        templateUrl: '/templates/info.html',
        controller: 'infoCtrl'
      })
      // route for the contact page
      .when('/map', {
        templateUrl: '/templates/map.html',
        controller: 'mapCtrl'
      });
  });


app.directive('mainNav', function($location,db) {
  return {
    restrict: 'C',
    transclude: true,
    link: function(scope){
      scope.c = function (path) {
  return ($location.path().substr(0, path.length) === path) ? 'active' : '';
}

scope.darkness = function(){
  return db.inDark() ? "disabled" : "";
}

    },
    template: '<a ng-class="c(\'/map\')" href="#/map"><img src="/map.png"></a><a ng-class="[c(\'/cam\'),darkness()]" href="#/cam"><img  src="/eye.png"></a><a ng-class="c(\'/house\')" href="#/house"><img src="/house.png"></a><a ng-class="c(\'/info\')" href="#/info"><img src="/scroll.png"></a>'
  };
});




  app.run(function($rootScope, $location,$interval,db) {




    $rootScope.errors = {};


    $rootScope.user = userGlobal;
    if($rootScope.user && $rootScope.user.uid){
      db.init($rootScope.user.uid);  
    }
    
  })



app.service("db",function($rootScope,$firebaseAuth,$firebaseObject,$firebaseArray,$q,$interval){

  var $scope = $rootScope.$new();

    if ("geolocation" in navigator) {
      $interval(function(){
        navigator.geolocation.getCurrentPosition(function(position) {
          $scope.location = position.coords.latitude + "," + position.coords.longitude;
          $scope.coords = position.coords
        });
      }, 250);
    } else {
      $rootScope.errors.geo = true;
    }




    var Zuid = "";

  $scope.init = function(uid){
      Zuid = uid;
      $firebaseObject(firebase.database().ref(uid).child('darkzones')).$bindTo($scope, "darkzones");
      $firebaseObject(firebase.database().ref(uid).child('lumens')).$bindTo($scope, "lumens");
    }
  // drunk ass antipattern

  var getDarkZones = function(){return _.isUndefined($scope.darkzones) ? false : $scope.darkzones }
  var getCoords =  function(){return _.isUndefined($scope.coords) ? false : $scope.coords};
  var s = {
    init: $scope.init,
    getDarkZones: getDarkZones,
    inDark : function(){
      var darkzones = getDarkZones();
      var coords    = getCoords();
      if(darkzones && coords){
        var inDark = false;
        _.each(darkzones,function(e,i,dz){
          if(!_.startsWith(i,"$")){

            if(0.000125 >= Math.abs(e.latitude - coords.latitude) && 0.000125 >= Math.abs(e.longitude - coords.longitude)){
              inDark = true;
            }
          }
        })
        return inDark;
      } else {
        return false;
      }






      $rootScope.inDark = inDark;





    },
    getLumens: function(){return _.isUndefined($scope.lumens) ? false : $scope.lumens.$value },
    getCoords : getCoords,
    getLocation: function(){return _.isUndefined($scope.coords) ? '0,0': $scope.coords.latitude + "," + $scope.coords.longitude;},
    lumensCaught : function(){
      var ref = firebase.database().ref(Zuid);
      ref.child('darkzones').push({time: Date.now(), longitude:$scope.coords.longitude, latitude:$scope.coords.latitude});
      ref.child('lumens').once('value',function(snapshot){
        var previous = snapshot.val() || 0;
        ref.child('lumens').set(parseInt(previous) + 10);
      });
    },
    _bind : function(scope,funcToBind,key){
        scope.$watch(function() { return funcToBind(); },function(fresh){
          scope[key] = fresh;
        })
    }

  }





  $interval(function(){

if(Zuid !== ""){

var ref = firebase.database().ref(Zuid);
 var dzO = s.getDarkZones();

    console.log('yaaaas');
    _.each(dzO,function(e,i,collection){
      if(!_.startsWith(i, '$')){
        if(Math.abs(e.time - Date.now()) > 1800000){
          //if darknesses are over half hour old, delete them.
          $firebaseObject(ref.child('darkzones/'+i)).$remove();
        }
      }
      
    })
}

  },1000)



  $interval(function(){
    if(Zuid !== ""){
      var ref = firebase.database().ref(Zuid);
    ref.child('lumens').once('value',function(snapshot){
    var previous = snapshot.val() || 0;
    if(previous !== 0){
      ref.child('lumens').set(Math.max(0,parseInt(previous) - 1));
    }
    
    });
  }
  },(2000))



  return s;

})






