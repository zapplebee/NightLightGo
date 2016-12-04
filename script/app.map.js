var s;


app.controller("mapCtrl", function($scope,$rootScope,NgMap,$firebaseObject,db,$interval) {


db.darkZones().$bindTo($scope, "dz");


function generateDark(coords){


  return [
            [coords.latitude + (0.000125), coords.longitude + (0.000125)],
            [coords.latitude - (0.000125), coords.longitude + (0.000125)],
            [coords.latitude - (0.000125), coords.longitude - (0.000125)],
            [coords.latitude + (0.000125), coords.longitude - (0.000125)],
          
        ];
}



var ref =  db.getDB();// assume value here is { foo: "bar" }

//db.setDark();

$scope.update = function(){
  console.log($scope.data);

  $scope.data = {tet:6677};

}

$scope.paths = [];





s = function(){
  //$scope.paths.push(generateDark($rootScope.coords));
  //db.setDark();
  //db.testDark().then(function(){console.log(arguments)});

  var innerPath = []
  _.each($scope.dz,function(e,i,dz){
    if(!_.startsWith(i,"$")){
      console.log(i);
      innerPath.push(generateDark(e));

    }
    
  })

  $scope.paths = innerPath;



  console.log(innerPath);

  //$scope.dz.push({time: Date.now(), location:$rootScope.location});
}



$scope.$watch('dz',s);






     var obj = $firebaseObject(ref);
  obj.$bindTo($scope, "data");



$scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyBdvNmILqyuwwFyp3J6_toanaOLoFbX1i4";

  NgMap.getMap().then(function(map) {
    google.maps.event.trigger(map, 'resize')
  });

});
app.controller("gCtrl", function($scope,$rootScope) {

    console.log($rootScope.user);
    $scope.g = function(){
    firebase.database().ref('users/' + $rootScope.user.uid).set({
    childname: 'pz',
    light: 100
  }).then(function(){console.log('good',arguments)}).catch(function(){console.log(arguments)});
}
});
