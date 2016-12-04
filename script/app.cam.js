

app.controller("camCtrl", function($scope,$rootScope,$location,db) {

if($rootScope.inDark){
  $location.path('/map');
}

var streamHelper;
var video = document.getElementById("video");
        $scope.$on("$locationChangeStart", function(event) {
          streamHelper.getVideoTracks()[0].stop();
          console.log('locationChange')
        });

var gameCanvas = document.getElementById("game-canvas");
var gameContext = gameCanvas.getContext("2d");

var videoCanvas = document.getElementById("video-canvas");
var videoContext = videoCanvas.getContext("2d");

var sensorCanvas = document.getElementById('sensor-canvas');
var sensorContext = sensorCanvas.getContext('2d');

var processedSensorPixels;

$scope.complete = false;
$scope.finish = function(){
  db.setDark();
  $scope.complete = true;

}


function describeSize(){
  gameCanvas.style.width = "100%";
  gameCanvas.style.height = "100%";
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;

  videoCanvas.style.width = "100%";
  videoCanvas.style.height = "100%";
  videoCanvas.width = window.innerWidth;
  videoCanvas.height = window.innerHeight;
  sensorCanvas.style.width = "100%";
  sensorCanvas.style.height = "100%";
  sensorCanvas.width = Math.floor(window.innerWidth * .025);
  sensorCanvas.height = Math.floor(window.innerHeight * .025);

}

var electros = [];

for (var i = 0; i < 5 ; i++){
  electros[i] = new Image();
  electros[i].src = 'elect' + i + '.png';

}

var busted = [];

for (var i = 0; i < 8 ; i++){
  busted[i] = new Image();
  busted[i].src = 'bust' + i + '.png';

}

console.log(window.innerWidth, window.innerHeight);


navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
if (navigator.getUserMedia){
  function videoSuccess(stream){
    streamHelper = stream;
    if(window.URL){
      video.src = window.URL.createObjectURL(stream);
    } else if (video.mozSrcObject !== undefined){
      video.mozSrcObject = stream;
    } else {
      video.src = stream;
    }
    

    video.addEventListener('play',function(){

      describeSize();
      requestAnimationFrame(advanceFrame);
    });
  };

  function videoError(error){
    console.log(error);
  }

  navigator.getUserMedia({video: true}, videoSuccess, videoError);
  
}


var captured = [];

$scope.test = function(e){

  var x = _.find(processedSensorPixels, function(o) { return o.x == Math.floor(e.layerX * .025) && o.y == Math.floor(e.layerY * .025) });
  if(x){
    x.animation = 0;
    captured.push(x);
  }
  
  
}


function advanceFrame(time){
    var videoRatio = video.videoWidth / video.videoHeight;
    var windowRatio = window.innerWidth / window.innerHeight;
    var videoComposedWidth = video.videoWidth;
    var videoComposedHeight = video.videoHeight;

    var videoLeftOffset = 0;
    var videoTopOffset  = 0;

    if(videoRatio > windowRatio){
      videoComposedWidth = videoComposedWidth * windowRatio;
      videoLeftOffset    = -1 * (videoComposedWidth - window.innerHeight) / 2; 
    }else {
       videoComposedHeight = videoComposedHeight / windowRatio;
      videoTopOffset    = -1 * (videoComposedHeight - window.innerHeight) / 2; 
    }

    processedSensorPixels = [];

    videoContext.drawImage(video,videoLeftOffset,videoTopOffset,videoComposedWidth,videoComposedHeight,0,0,window.innerWidth,window.innerHeight);
    sensorContext.drawImage(video,videoLeftOffset,videoTopOffset,videoComposedWidth,videoComposedHeight,0,0,sensorCanvas.width,sensorCanvas.height);
    var sensorPixels = _.chunk(sensorContext.getImageData(0, 0, sensorCanvas.width, sensorCanvas.height).data, 4);
    var sensorRows = _.chunk(sensorPixels,sensorCanvas.width);
    _.each(sensorRows,function(row,y,sensorRows){
      _.eachRight(row,function(pixel,nX,row){
        var x = ((sensorCanvas.width - 1) - nX);
        var light = _.inRange(pixel[0],200,256) && _.inRange(pixel[1],200,256) && _.inRange(pixel[2],200,256);
        if(light){
          var processedPixel = {x:x,y:y}
          if(!_.find(captured,function(o){
            return (!_.isUndefined(o) && (o.x == x && o.y == y));
    
          })) {
            processedSensorPixels.push(processedPixel)
          }
            
          
          
        }
        
      })
    })

    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    _.each(processedSensorPixels,function(pixel){
      var sprite = Math.floor(Math.random() * 5);
      gameContext.drawImage(electros[sprite],pixel.x /.025, pixel.y / .025, 10 / 0.25, 10 / 0.25);
    })

    _.each(captured,function(sprite){
      gameContext.drawImage(busted[sprite.animation],sprite.x /.025, sprite.y / .025, 10 / 0.25, 10 / 0.25);
      sprite.animation = Math.min(7,sprite.animation + 1);
    })

    //console.log(captured);

    if(captured.length < 10 || _.find(captured,function(dude){ return dude.animation !== 7})){
      requestAnimationFrame(advanceFrame);
      
    }else {
      $scope.finish();
    }

    



}


});