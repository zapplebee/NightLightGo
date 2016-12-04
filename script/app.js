









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
        angularStart('/map');

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
      // route for the contact page
      .when('/map', {
        templateUrl: '/templates/map.html',
        controller: 'mapCtrl'
      });
  });


app.directive('mainNav', function($location,$rootScope) {
  return {
    restrict: 'C',
    transclude: true,
    link: function(scope){
      scope.c = function (path) {
  return ($location.path().substr(0, path.length) === path) ? 'active' : '';
}

scope.darkness = function(){
  return $rootScope.inDark ? "disabled" : "";
}

    },
    template: '<a ng-class="c(\'/map\')" href="#/map"><img src="/map.png"></a><a ng-class="[c(\'/cam\'),darkness()]" href="#/cam"><img  src="/eye.png"></a><a ng-class="c(\'/house\')" href="#/house"><img src="/house.png"></a><a ng-class="c(\'/info\')" href="#/info"><img src="/scroll.png"></a>'
  };
});




  app.run(function($rootScope, $location,$interval) {




    $rootScope.errors = {};



    if ("geolocation" in navigator) {
      $interval(function(){
        navigator.geolocation.getCurrentPosition(function(position) {
          //console.log(position.coords.latitude, position.coords.longitude);
          $rootScope.location = position.coords.latitude + "," + position.coords.longitude;
          $rootScope.coords = position.coords
        });
      }, 1000);
    } else {
      $rootScope.errors.geo = true;
    }


    $rootScope.user = userGlobal;


  })



app.service("db",function($rootScope,$firebaseAuth,$firebaseObject,$firebaseArray,$q,$interval){

  //set new dark zone

  //https://github.com/firebase/angularfire/blob/master/docs/reference.md#bindtoscope-varname


  //$rootScope.user = $rootScope.user || {uid:""};


  $rootScope.$watch('coords',function(coords){
    var inDark = false;
      _.each(dzO,function(e,i,dz){
        if(!_.startsWith(i,"$")){

          if(0.000125 >= Math.abs(e.latitude - coords.latitude) && 0.000125 >= Math.abs(e.longitude - coords.longitude)){
            inDark = true;
          }



        }
      })

      $rootScope.inDark = inDark;
  })




  var db = firebase.database().ref($rootScope.user.uid);
  var darkzones = db.child('darkzones');
  var lumens    = db.child('lumens');

  var dzO = $firebaseObject(darkzones);



  var s = {
    getDB: function(){return db},
    setDark : function(){

      db.child('lumens').once('value',function(snapshot){
        var previous = snapshot.val() || 0;
        db.child('lumens').set(previous + 10);
      });

      db.child('darkzones').push({time: Date.now(), longitude:$rootScope.coords.longitude, latitude:$rootScope.coords.latitude});
    },

    deleteDark : function(key){
      $firebaseObject(db.child('darkzones/'+key)).$remove();
    },

    darkZones : function(){
      return dzO;
    }

  }


  $interval(function(){
    //console.log('yaaaas');
    _.each(dzO,function(e,i,collection){
      if(!_.startsWith(i, '$')){
        if(Math.abs(e.time - Date.now()) > 1800000){
          //if darknesses are over half hour old, delete them.
          s.deleteDark(i);
        }
      }
      
    })

  },20000) //every 20 seconds


  $interval(function(){
    db.child('lumens').once('value',function(snapshot){
    var previous = snapshot.val() || 0;
    if(previous !== 0){
      console.log('losing lumens');
      db.child('lumens').set(Math.max(0,previous - 1));
    }
    
    });
  },(20000 * 3))
  //return firebase.database().ref($rootScope.user.uid);

  return s;

})






