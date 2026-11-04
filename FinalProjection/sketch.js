let pMapper
let taylorsBezMap
let taylorsBuf

let time = 0;

async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pMapper = createProjectionMapper(this);
  taylorsBezMap = pMapper.createBezierMap(4);
  taylorsBuf = createGraphics(1200, 1200);

  // Taylor's sketch setup
  taylorsBuf.rectMode(CENTER);
  taylorsBuf.angleMode(DEGREES);
  taylorsBuf.colorMode(HSB);
  taylorsBuf.noFill();
  taylorsBuf.stroke(255);
  taylorsBuf.strokeWeight(0.5);


  pMapper.load("maps/map.json");
}

function draw() {
  background(0);
  taylorsSketch(taylorsBuf)
  taylorsBezMap.displayTexture(taylorsBuf, 0, 0, 1600, 1600);

}

function taylorsSketch(pg) {
  pg.background(356,100,50);
  time += deltaTime;

  pg.push();
    pg.translate(200, 200);
    for (let i = 0; i < (width / 30); i++) {
      pg.stroke(0, 0, 100-(i*12*noise(i*(time/200))));
      pg.strokeWeight(0.5*noise(0.6*(i+time/100)));
      pg.rotate(time/1000+noise(i + (time/1000)));
      pg.scale(1.1);
      pg.rect(0, 0, 5);
    }
  pg.pop();
}


function keyPressed() {
  if (key === "c") pMapper.toggleCalibration();
  if (key === "s") pMapper.save("map.json");
  if (key === "l") pMapper.load("maps/map.json");
  if (key === "f") fullscreen(!fullscreen()); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
