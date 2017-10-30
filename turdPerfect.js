var poopLayer = document.getElementById("pooplayer").getContext("2d");
var flyLayer = document.getElementById("flylayer").getContext("2d");

poopLayer.canvas.width = flyLayer.canvas.width = window.innerWidth;
poopLayer.canvas.height = flyLayer.canvas.height = window.innerHeight;

var isDrawing, cursor, counter = 1, poopArea = [], scrawl = [], currentMousePos = {};

document.addEventListener("mousemove", function(e) {
  currentMousePos.x = e.pageX;
  currentMousePos.y = e.pageY;
});

document.addEventListener("load", testLoop());

function testLoop() {
  var session = new TurdPerfect();
  session.loop();
};

function TurdPerfect() {

  this.flyArray = [];

  this.loop = function() {
    flyLayer.clearRect(0, 0, flyLayer.canvas.width, flyLayer.canvas.height);

    var that = this;

    cursor = cursor || document.getElementById("cursor");
    cursor.style.left = currentMousePos.x - 25;
    cursor.style.top = currentMousePos.y - 241;

    if (isDrawing) {
      scrawl.push({
        x: currentMousePos.x,
        y: currentMousePos.y,
        width: randomNumberInclusive(40, 50)
      });
      poopArea.push([currentMousePos.x, currentMousePos.y]);
    };

    this.update();

    setTimeout(function() { that.loop() }, 50);
  };

  this.update = function() {
    var poopExists = false;

    if (poopExists === false) {
      poop = new Poop();
      poopExists = true;
    };

    if (poopArea.length / 20 === counter && counter < 25) {
      this.flyArray.push(new Fly());
      counter += 1;
    };

    if (isDrawing) {
      poop.render();
    };

    for (var i = 0; i < this.flyArray.length; i++) {
      var fly = this.flyArray[i];
      fly.nextMove();

      if ((currentMousePos.x > (fly.position[0] - 25)) &&
           (currentMousePos.x < (fly.position[0] + 100)) &&
           (currentMousePos.y > (fly.position[1] - 25)) &&
           (currentMousePos.y < (fly.position[1] + 100))) {
             fly.escape();
           };

      fly.render();
    };
  };
};

function Poop() {

  document.addEventListener("mousedown", function(e) {
    isDrawing = true;

    scrawl.push({
      x: currentMousePos.x,
      y: currentMousePos.y,
      width: randomNumberInclusive(40, 50)
    });
  });

  document.addEventListener("mouseup", function() {
    isDrawing = false;
    scrawl = [];
  });

  this.render = function() {
    poopLayer.lineCap = "round";

    for (var i = 1; i < scrawl.length; i++) {
      poopLayer.beginPath();
      poopLayer.moveTo(scrawl[i - 1].x, scrawl[i - 1].y);
      poopLayer.lineWidth = scrawl[i].width;
      poopLayer.strokeStyle = "#703800";
      poopLayer.lineTo(scrawl[i].x, scrawl[i].y);
      poopLayer.stroke();
    };
  };

};

function Fly() {

  var img = document.createElement("img");
  img.src = "fly.png";
  var flyW = 75;
  var flyH = 75;

  var still = [0];
  var flying = [0, 1];
  var rubbing = [2, 2, 2, 2, 2, 3, 3, 3, 3, 3];
  var topOrigin = [randomNumberInclusive(0, flyLayer.canvas.width), -flyH];
  var rightOrigin = [(flyLayer.canvas.width), randomNumberInclusive(0, flyLayer.canvas.height)];
  var bottomOrigin = [randomNumberInclusive(0, flyLayer.canvas.width), (flyLayer.canvas.height)];
  var leftOrigin = [(-flyW), randomNumberInclusive(0, flyLayer.canvas.height)];
  var flyStates = [still, flying, rubbing];
  var initialPositions = [topOrigin, rightOrigin, bottomOrigin, leftOrigin];

  this.randomState = function() {
    return flyStates[Math.floor(Math.random() * flyStates.length)]
  };

  this.randomDuration = function() {
    return randomNumberInclusive(1, 3) * 1000;
  };

  this.randomSpeed = function() {
    var randomPoopSpot = poopArea[randomNumberInclusive(0, poopArea.length)];
    var poopOffset = [(randomPoopSpot[0] - this.position[0]), (randomPoopSpot[1] - this.position[1])];
    var poopMagnitude = Math.sqrt(poopOffset[0] * poopOffset[0] + poopOffset[1] * poopOffset[1]);
    return [((poopOffset[0] / poopMagnitude) * 3), ((poopOffset[1] / poopMagnitude) * 3)];
  };

  this.position = initialPositions[Math.floor(Math.random() * initialPositions.length)];
  this.index = 0;
  this.state = flying;
  this.duration = 5000;
  this.speed = this.randomSpeed();

  this.nextMove = function() {
    if (this.duration === 0) {
      this.state = this.randomState();
      this.duration = this.randomDuration();
      this.speed = this.randomSpeed();
      this.index = (this.index + 1) % (this.state.length);
      if (this.state === flying) {
        this.flight();
      };
      this.duration -= 50;
    } else {
      this.index = (this.index + 1) % (this.state.length);
      if (this.state === flying) {
        this.flight();
      };
      this.duration -= 50;
    };
  };

  this.render = function() {
    var that = this;
    flyLayer.save();
    this.flipHorizontally();
    flyLayer.drawImage(img,
                  that.state[that.index] * flyW, 0, flyW, flyH,
                  Math.round(that.position[0]), Math.round(that.position[1]), flyW, flyH);
    flyLayer.restore();
  };

  this.flight = function() {
    if (this.position[0] < 0 && this.speed[0] < 0) {
      this.speed[0] *= -1;
    };

    if (this.position[0] > (flyLayer.canvas.width - flyW) && this.speed[0] > 0) {
      this.speed[0] *= -1;
    };

    if (this.position[1] < 0 && this.speed[1] < 0) {
      this.speed[1] *= -1;
    };

    if (this.position[1] > (flyLayer.canvas.height - flyH) && this.speed[1] > 0) {
      this.speed[1] *= -1;
    };

    this.position[0] += this.speed[0];
    this.position[1] += this.speed[1];
  };

  this.flipHorizontally = function() {
    if (this.speed[0] > 0) {
      flyLayer.translate(this.position[0] + (flyW / 2), 0);
      flyLayer.scale(-1, 1);
      flyLayer.translate(-(this.position[0] + (flyW / 2)), 0);
    };
  };

  this.escape = function() {
    //escape should take mouse position as arguments and fly directly away from the mouse
    this.speed = [1, -15];
    this.state = flying;
  };
};

function randomNumberInclusive(min, max) {
  return (Math.floor(Math.random() * max) + min);
}; //not actually inclusive, need to add one to max first
