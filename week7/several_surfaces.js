let pMapper
let quadMap, quadMap2, quadMap3, quadMap4, quadMap6
let squaresBuf, walkersBuf, flowersBuf, solidColorBuf, MaggieBuf

let guys = []
let frames = []
let flowers = []

let Maggieframes = [];
let Findex = 0;
let speed = 8;

let playing = true;



async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pMapper = createProjectionMapper(this);

  quadMap = pMapper.createQuadMap(400, 400, 20, 20);
  quadMap2 = pMapper.createQuadMap(400, 400, 20, 20);
  quadMap3 = pMapper.createQuadMap(800, 200, 20, 20);
  quadMap4 = pMapper.createQuadMap(400, 400, 20, 20);
  quadMap6 = pMapper.createQuadMap(400, 400, 20, 20);

  squaresBuf = createGraphics(400, 400);
  walkersBuf = createGraphics(400, 400);
  flowersBuf = createGraphics(400, 200);
  MaggieBuf = createGraphics(400, 400);
  flowersBuf.angleMode(DEGREES);


  solidColorBuf = createGraphics(400, 200);


//Maggie's initialization
  for (let i = 0; i<6; i++) {
    let flower = createGraphics(300, 300);
    flower.angleMode(DEGREES);
    flower.clear();


    flower.translate(150, 150);

    flower.noStroke();

    let petalLength = 15+i*11;
    let petalWidth = 10+i*3;

    flower.fill(255, 130, 175)

    for (let p = 0; p<8; p++) {
      flower.push();
      flower.rotate(p*45);


      flower.ellipse(0, -petalLength/2, petalWidth, petalLength);
      flower.pop();


    }

    flower.fill(255, 205, 65);
    flower.circle(0, 0, 26);

    Maggieframes.push(flower);
  }


  //walkers initialization

  for (let i = 1; i <= 12; i++) {
    frames.push(await loadImage("walk_cycle_png_sequence/" + i + ".png"));
  }
  for (let j = 0; j < 50; j++) {
    guys[j] = new Guy(
      random(walkersBuf.width),
      random(100, walkersBuf.height - 200),
      walkersBuf);
  }

  //flowers initialization

  for (let i = 0; i < 20; i++) {
    flowers.push(new Flower(random(flowersBuf.width), random(flowersBuf.height)));
  }


 
 

  pMapper.load("maps/map.json");
}

function draw() {
  background(0);


  maggieFlower(MaggieBuf);
  squares(squaresBuf);
  walkers(walkersBuf)
  flowerField(flowersBuf)
  solidColor(solidColorBuf)

  quadMap.displayTexture(squaresBuf);
  quadMap2.displayTexture(walkersBuf);
  quadMap3.displayTexture(flowersBuf);
  quadMap4.displayTexture(solidColorBuf);
  quadMap6.displayTexture(MaggieBuf);

}


function solidColor(pg){
  pg.push()
  pg.colorMode(HSB)
  pg.background(frameCount%360, 100,100,100)
  pg.pop()
}

function squares(pg) {
  pg.push();
  pg.background(255, 100, 100, 10);
  pg.noStroke();
  pg.fill(0, 100, 200);
  pg.rect(random(pg.width), random(pg.height), 100);
  pg.pop();
}


function walkers(pg) {
  pg.push();
  pg.background(255,200,200);
  for (let i = 0; i < guys.length; i++) {
    guys[i].move(pg);
  }
  pg.pop();
}


function flowerField(pg) {
  pg.push();
  pg.background(0);
  let d = map(mouseX, 0, width, -5, 5);
  for (let i = 0; i < flowers.length; i++) {
    flowers[i].move(d, pg);
    flowers[i].display(pg);
  }
  pg.pop();
}

function maggieFlower(pg) {

  pg.push();
  pg.background(0);

  if (playing && frameCount % speed == 0) {

    Findex++;

    if (Findex >= Maggieframes.length) {
      Findex = 0;
    }
  }

  pg.imageMode(CENTER);

  pg.image(
    Maggieframes[Findex],
    pg.width / 2,
    pg.height / 2
  );

  pg.imageMode(CORNER);

  pg.noStroke();
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);
  pg.textSize(15);

  pg.text(
    'Frame ' + (Findex + 1) +
    ' / ' + Maggieframes.length +
    '    Speed: ' + speed,
    pg.width / 2,
    pg.height / 2 + 175
  );

  pg.pop();
}

function taylorsSketch(pg) {
  if (frameCt == 0) {
    translate(width/2, height/2);
  }
  frameCt += frameCt;
  if (frameCt < curveLen){
    push()
    translate(crvX[3], crvY[3]);
    crvX[1] = crvX[3] - crvX[2];
    crvY[1] = crvY[3] - crvY[2];
    crvX[2] = random(-curveScale, curveScale);
    crvY[2] = random(-curveScale, curveScale);
    crvX[3] = random(-curveScale, curveScale);
    crvY[3] = random(-curveScale, curveScale);
    //bezier(crvX[0], crvY[0], crvX[1], crvY[1], crvX[2], crvY[2], crvX[3], crvY[3]);
    line(crvX[0], crvY[0], crvX[3], crvY[3])
    
    
  } else {
    //pop();
    translate(width/2, height/2);
    curveCt ++;
    frameCt = 0;
    // finish draaw if all curves drawn
    if (curveCt >= maxCt) {
      return
    }
  }
}


function keyPressed() {
  if (key === "c") pMapper.toggleCalibration();
  if (key === "s") pMapper.save("map.json");
  if (key === "l") pMapper.load("maps/map.json");
  if (key === "f") fullscreen(!fullscreen()); 
  if (keyCode == LEFT_ARROW) {
    speed = min(speed + 2, 30);
    return false;
  }

  if (keyCode == RIGHT_ARROW) {
    speed = max(speed - 2, 2);
    return false;
  }

  if (key == ' ') {
    playing = !playing;
    return false;
  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}





class Guy {
  constructor(x, y, pg) {
    this.xLoc = x;
    this.yLoc = y;
    this.sizeScalar = map(this.yLoc, 0, pg.height, 0.2, 1);
    this.direction = random([1, -1]);
    this.cycleSpeed = floor(random(1, 5));
    this.velocity = 7.5 * this.sizeScalar;
    this.counter = 0;
    this.framesElapsed = 0;
    this.img = frames[0];
  }

  move(pg) {
    this.img = frames[this.framesElapsed % frames.length];

    pg.push();
    pg.translate(this.xLoc, this.yLoc);
    pg.scale(this.direction * this.sizeScalar, this.sizeScalar);
    pg.image(this.img, 0, 0);
    pg.pop();

    if (this.direction == 1 && this.xLoc > pg.width) {
      this.xLoc = 0;
    } else if (this.direction == -1 && this.xLoc < 0) {
      this.xLoc = pg.width;
    }

    if (this.counter % this.cycleSpeed == 0) {
      this.framesElapsed++;
      this.xLoc += this.velocity * this.direction;
    }
    this.counter++;
  }
}




class Flower{
    constructor(x, y){
        this.x = x
        this.y = y
        this.numPetals = random(3,16)
        this.petalWidth = random(20,40)
        this.petalLength = random(30, 80)
        this.centerDiameter = random(30,40)
        this.centerCol = color(random(255),random(255),random(255))
        this.petalCol = color(random(255),random(255),random(255))
        this.xV = random(-5,5)
        this.yV = random(-5,5)
        this.rotations = 0
        this.rV = random(-5,5)
    }

    move(d, pg){

        this.x+=this.xV
        this.y+=this.yV
        this.rotations += this.rV*d

        // wrap around the edges of the buffer
        if (this.x > pg.width) this.x = 0
        if (this.x < 0) this.x = pg.width
        if (this.y > pg.height) this.y = 0
        if (this.y < 0) this.y = pg.height
    }
    display(pg){
        pg.push()
        pg.translate(this.x, this.y)
        pg.rotate(this.rotations)
        pg.fill(this.petalCol)
        for(let r = 0; r < this.numPetals; r++){
            pg.push()

            pg.rotate((360/this.numPetals)*r)
            pg.translate(this.petalLength/2,0)
            pg.ellipse(0,0,this.petalLength,this.petalWidth )
            pg.pop()
        }
        pg.fill(this.centerCol)
        pg.ellipse(0,0,this.centerDiameter)

        pg.pop()

     }


}