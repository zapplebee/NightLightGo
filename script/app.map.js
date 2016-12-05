var s;


app.controller("mapCtrl", function($scope,$rootScope,NgMap,$firebaseObject,db,$interval) {


db._bind($scope,db.getDarkZones,"dz");
db._bind($scope,db.getLocation,"location");

$scope.$watch('location',function(fresh){
  console.log(fresh);
})

function generateDark(coords){


  return [
            [coords.latitude + (0.000125), coords.longitude + (0.000125)],
            [coords.latitude - (0.000125), coords.longitude + (0.000125)],
            [coords.latitude - (0.000125), coords.longitude - (0.000125)],
            [coords.latitude + (0.000125), coords.longitude - (0.000125)],
          
        ];
}



$scope.paths = [];





s = function(){
  //$scope.paths.push(generateDark($rootScope.coords));
  //db.setDark();
  //db.testDark().then(function(){console.log(arguments)});

  var innerPath = []
  _.each($scope.dz,function(e,i,dz){
    if(!_.startsWith(i,"$")){
      innerPath.push(generateDark(e));

    }
    
  })

  $scope.paths = innerPath;



  //$scope.dz.push({time: Date.now(), location:$rootScope.location});
}



$scope.$watch('dz',s);



$scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyBdvNmILqyuwwFyp3J6_toanaOLoFbX1i4";

  NgMap.getMap().then(function(map) {
    google.maps.event.trigger(map, 'resize')
  });

});