app.controller("loginCtrl", function($scope,$rootScope,$location,$firebaseAuth,db) {



$scope.authObj = $firebaseAuth();


$scope.signIn = function(){


$scope.authObj.$signInWithEmailAndPassword($scope.username, $scope.password).then(function(firebaseUser) {
  console.log("Signed in as:", firebaseUser.uid);
  $rootScope.user = firebaseUser;
  db.init(firebaseUser.uid);
  $location.path('/map');
}).catch(function(error) {
  $scope.error = error;
  console.error("Authentication failed:", error);
});
}


$scope.signUp = function(){

$scope.authObj.$createUserWithEmailAndPassword($scope.username, $scope.password).then(function(){

  $scope.signIn();


}).catch(function(error) {
  console.log(error);
  // Handle Errors here.
  $scope.error = error;
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});

}

});
