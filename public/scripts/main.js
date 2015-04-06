$(function () {

  var socket = io();
  console.log('start output!');

  var WIDTH = 1000;
  var HEIGHT = 600;
  var CENTER = {x: WIDTH/2, y: HEIGHT/2};

  var State = null;

  var resetGame = function () {
    State = {
      blocks: {}
    // , runState: 'PLAY'
    };
  }

  var blockCanvas = $('.js-canvas')[0];
  var ctx = blockCanvas.getContext("2d");

  blockCanvas.setAttribute('height', HEIGHT);
  blockCanvas.setAttribute('width', WIDTH);

  socket.on('block', function (e) {

/*
A typical TUIO bundle will contain an
initial ALIVE message, followed by an
arbitrary number of SET messages that
can fit into the actual bundle capacity
and a concluding FSEQ message. A minimal
TUIO bundle needs to contain at least the
compulsory ALIVE and FSEQ messages. The
FSEQ frame ID is incremented for each
delivered bundle, while redundant bundles
can be marked using the frame sequence ID -1.
The optional source message can be transmitted
to allow the multiplexing of several TUIO trackers
on the client side. The application@address
argument is a single string that specifies
the application name and any unique source
address (IP, host name, MAC address).
If sent on localhost, the second address
part can be omitted, hence any string without
the @ separator implicitly comes from localhost.
*/
// /tuio/2Dobj set s i x y a X Y A m r
    for (var i = e.length - 1; i >= 0; i--) {
      if (e[i][0] == "/tuio/2Dobj" && e[i][1] == "set") {
        var markerId = e[i][3];
        var markerX = e[i][4];
        var markerY = e[i][5];
        var markerAngle = e[i][6];
        var markerVelX = e[i][7];
        var markerVelY = e[i][8];
        var markerRotationVelVec = e[i][9];
        var markerMovAccel = e[i][10];
        var markerRotAccel = e[i][11];
        var marker = {
          x: markerX
        , y: markerY
        , angleRad: markerAngle
        , velX: markerVelX
        , velY: markerVelY
        , rotVel: markerRotationVelVec
        };
        State.blocks[markerId] = marker;
        console.log(marker);
      }
    };
  });

  var addVec = function (a, b) {
    return {x: a.x + b.x, y: a.y + b.y};
  }

  var scaleVec = function (a, val) {
    return {x: a.x * val, y: a.y * val};
  }

  var magnitude = function (a) {
    return Math.sqrt(a.x*a.x+a.y*a.y);
  }

  var normalize = function (a) {
    var m = magnitude(a);
    return {x: a.x/m, y: a.y/m};
  }

  // var collision = function (point, circle) {
  //   return (magnitude(addVec(point, scaleVec(circle, -1))) <= circle.radius);
  // }

  var lastTimestamp = null;
  var step = function (timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    var diff = timestamp - lastTimestamp;

    // update position info

    // Wipe screen
    ctx.clearRect(0,0,WIDTH,HEIGHT);

    // Draw Blocks
    // ctx.setFillColor('gray', 1);
    var blocks = State.blocks;
    for (var id in blocks) {
      if (blocks.hasOwnProperty(id)) {
        var x = blocks[id].x;
        var y = blocks[id].y;
        var angleRad = blocks[id].angleRad;
      ctx.save();
        var mWidth = 10;
        var mHeight = 10;
        ctx.font = "20px sans-serif";
        ctx.fillStyle = "gray";

        ctx.translate(x*WIDTH,y*HEIGHT);
        ctx.rotate(angleRad);
        ctx.fillRect(0,0,mWidth,mHeight);
        ctx.fillStyle = "red";
        ctx.fillText(id, 0, 0);
      ctx.restore();
      }
    }

    lastTimestamp = timestamp;
    window.requestAnimationFrame(step);
  }

  // Start the loop
  resetGame();
  window.requestAnimationFrame(step);

});