app.controller("loginCtrl", function($scope,$rootScope,$location,$firebaseAuth) {



$scope.authObj = $firebaseAuth();


$scope.signIn = function(){


$scope.authObj.$signInWithEmailAndPassword($scope.username, $scope.password).then(function(firebaseUser) {
  console.log("Signed in as:", firebaseUser.uid);
  $rootScope.user = firebaseUser;
  $location.path('/map');
}).catch(function(error) {
  console.error("Authentication failed:", error);
});
}

});
