let hotpotFoods = [];
let hotpotTypes = [
  "fishball", "mushroom", "tomato",
  "fishTofu", "greens", "lotus"
];

let hotpotX, hotpotY, hotpotR;
let hotpotCookSeconds = 7;

function initHotpot(pg) {
  hotpotX = pg.width / 2;
  hotpotY = pg.height / 2;
  hotpotR = min(pg.width, pg.height) * 0.44;

  let starters = [
    ["fishball", -0.52, -0.37],
    ["mushroom", -0.45, 0.32],
    ["fishTofu", -0.52, -0.05],
    ["tomato", 0.42, -0.38],
    ["greens", 0.60, 0.11],
    ["lotus", 0.39, 0.52]
  ];

  for (let item of starters) {
    hotpotAddFood(
      hotpotX + item[1] * hotpotR,
      hotpotY + item[2] * hotpotR,
      item[0]
    );
  }
}

function drawHotpot(pg) {
  pg.background(250, 249, 245);

  hotpotDrawPot(pg);
  hotpotDrawBubbles(pg);

  for (let food of hotpotFoods) {
    food.cookTime += min(deltaTime, 100) / 1000;
    hotpotDrawFood(pg, food);
  }

  hotpotDrawRim(pg);
}

function hotpotDividerX(y) {
  let t = constrain(
    (y - (hotpotY - hotpotR)) / (2 * hotpotR),
    0,
    1
  );

  return hotpotX - sin(TWO_PI * t) * hotpotR * 0.18;
}

function hotpotDrawPot(pg) {
  pg.noStroke();

  pg.fill(216, 192, 151);
  pg.circle(hotpotX, hotpotY, hotpotR * 2.14);

  pg.fill(168, 127, 78);
  pg.circle(hotpotX, hotpotY, hotpotR * 2.075);

  pg.fill(239, 220, 179);
  pg.circle(hotpotX, hotpotY, hotpotR * 2);

  // 左半边辣锅
  pg.fill(197, 47, 43);
  pg.beginShape();

  for (let step = 0; step <= 80; step++) {
    let y = hotpotY - hotpotR + step * (2 * hotpotR / 80);
    pg.vertex(hotpotDividerX(y), y);
  }

  for (let step = 0; step <= 80; step++) {
    let a = HALF_PI + step * PI / 80;

    pg.vertex(
      hotpotX + cos(a) * hotpotR,
      hotpotY + sin(a) * hotpotR
    );
  }

  pg.endShape(CLOSE);
}

function hotpotDrawBubbles(pg) {
  pg.noStroke();

  for (let i = 0; i < 18; i++) {
    let a = i * 2.399;
    let d = hotpotR * (0.26 + (i % 5) * 0.13);

    let bubbleSize = hotpotR * (
      0.012 +
      0.008 * (1 + sin(frameCount * 0.045 + i))
    );

    pg.fill(255, 246, 220, 110);

    pg.circle(
      hotpotX + cos(a) * d,
      hotpotY + sin(a) * d,
      bubbleSize
    );
  }
}

function hotpotDrawRim(pg) {
  pg.noFill();
  pg.stroke(135, 93, 60);
  pg.strokeWeight(hotpotR * 0.025);
  pg.strokeCap(ROUND);

  pg.beginShape();

  for (let step = 0; step <= 80; step++) {
    let y = hotpotY - hotpotR + step * (2 * hotpotR / 80);
    pg.vertex(hotpotDividerX(y), y);
  }

  pg.endShape();

  pg.stroke(241, 208, 151);
  pg.circle(hotpotX, hotpotY, hotpotR * 2.075);
  pg.noStroke();
}

function hotpotAddFood(x, y, type = random(hotpotTypes)) {
  hotpotFoods.push({
    type: type,
    u: (x - hotpotX) / hotpotR,
    v: (y - hotpotY) / hotpotR,

    side: x < hotpotDividerX(y) ? "spicy" : "bone",

    scale: random(0.28, 0.34),
    angle: random(-0.24, 0.24),
    phase: random(TWO_PI),
    cookTime: 0
  });
}

// 点击一次：随机选一种食材，并随机放进其中一边
function hotpotAddRandomFood() {
  let chosenSide = random(["spicy", "bone"]);

  for (let attempt = 0; attempt < 100; attempt++) {
    let u = random(-0.7, 0.7);
    let v = random(-0.7, 0.7);
    let distanceSquared = u * u + v * v;

    // 让食物落在锅内，并避开最中心
    if (distanceSquared > 0.48 || distanceSquared < 0.06) {
      continue;
    }

    let x = hotpotX + u * hotpotR;
    let y = hotpotY + v * hotpotR;

    let actualSide =
      x < hotpotDividerX(y) ? "spicy" : "bone";

    if (actualSide !== chosenSide) {
      continue;
    }

    // 避免食物无限增加
    if (hotpotFoods.length >= 18) {
      hotpotFoods.shift();
    }

    hotpotAddFood(x, y);
    return;
  }
}

function hotpotFoodPosition(food) {
  return {
    x: hotpotX + food.u * hotpotR
      + sin(frameCount * 0.015 + food.phase)
      * hotpotR * 0.006,

    y: hotpotY + food.v * hotpotR
      + cos(frameCount * 0.020 + food.phase)
      * hotpotR * 0.008
  };
}

function hotpotFoodColor(food, r, g, b) {
  let cooked = constrain(
    food.cookTime / hotpotCookSeconds,
    0,
    1
  );

  let target = food.side === "spicy"
    ? color(164, 48, 41)
    : color(105, 87, 68);

  let amount = food.side === "spicy" ? 0.24 : 0.14;

  return lerpColor(
    color(r, g, b),
    target,
    cooked * amount
  );
}

function hotpotDrawFood(pg, food) {
  let p = hotpotFoodPosition(food);
  let s = hotpotR * food.scale;

  // 缩写：下面每次给食物上色时都会计算煮熟程度
  let fc = (r, g, b) => hotpotFoodColor(food, r, g, b);

  pg.push();
  pg.translate(p.x, p.y);

  pg.rotate(
    food.angle +
    sin(frameCount * 0.012 + food.phase) * 0.025
  );

  pg.noStroke();

  if (food.type === "fishball") {
    pg.fill(fc(216, 188, 147));
    pg.circle(0, s * 0.04, s * 0.95);

    pg.fill(fc(251, 236, 204));
    pg.circle(0, 0, s * 0.88);

    pg.fill(fc(255, 250, 227));
    pg.ellipse(
      -s * 0.14, -s * 0.19,
      s * 0.33, s * 0.15
    );

  } else if (food.type === "mushroom") {
    pg.fill(fc(110, 68, 49));
    pg.ellipse(0, s * 0.025, s * 1.10, s * 1.02);

    pg.fill(fc(166, 101, 62));
    pg.ellipse(
      -s * 0.025, -s * 0.035,
      s * 0.99, s * 0.92
    );

    pg.fill(fc(193, 123, 76));
    pg.ellipse(
      -s * 0.13, -s * 0.19,
      s * 0.58, s * 0.40
    );

    // 香菇表面的 X 形花刀
    pg.fill(fc(250, 221, 173));

    pg.quad(
      -s * 0.35, -s * 0.27,
      -s * 0.27, -s * 0.35,
       s * 0.34,  s * 0.25,
       s * 0.26,  s * 0.33
    );

    pg.quad(
      -s * 0.35,  s * 0.25,
      -s * 0.27,  s * 0.33,
       s * 0.34, -s * 0.27,
       s * 0.26, -s * 0.35
    );

  } else if (food.type === "tomato") {
    pg.fill(fc(171, 45, 48));
    pg.ellipse(0, 0, s * 1.10, s * 1.02);

    pg.fill(fc(245, 113, 94));
    pg.ellipse(0, 0, s * 0.95, s * 0.89);

    pg.fill(fc(255, 163, 132));
    pg.ellipse(0, 0, s * 0.74, s * 0.70);

    for (let i = 0; i < 4; i++) {
      let a = TWO_PI * i / 4 + PI / 4;

      pg.fill(fc(195, 51, 53));
      pg.ellipse(
        cos(a) * s * 0.23,
        sin(a) * s * 0.22,
        s * 0.30,
        s * 0.23
      );

      pg.fill(fc(255, 218, 153));
      pg.ellipse(
        cos(a) * s * 0.27,
        sin(a) * s * 0.25,
        s * 0.075,
        s * 0.045
      );
    }

    pg.fill(fc(255, 197, 163));
    pg.beginShape();

    for (let i = 0; i < 8; i++) {
      let a = TWO_PI * i / 8 - HALF_PI;
      let radius = i % 2 === 0
        ? s * 0.23
        : s * 0.11;

      pg.vertex(
        cos(a) * radius,
        sin(a) * radius
      );
    }

    pg.endShape(CLOSE);

  } else if (food.type === "fishTofu") {
    hotpotDrawFishTofu(
      pg, food,
      -s * 0.22, -s * 0.14,
      s * 0.68
    );

    hotpotDrawFishTofu(
      pg, food,
      s * 0.19, s * 0.17,
      s * 0.72
    );

  } else if (food.type === "greens") {
    pg.push();
    pg.translate(-s * 0.13, s * 0.18);
    pg.rotate(-0.45);

    hotpotDrawLeaf(
      pg, food,
      s * 0.85, s * 0.26,
      68, 133, 77
    );

    pg.pop();

    pg.push();
    pg.translate(s * 0.13, s * 0.18);
    pg.rotate(0.43);

    hotpotDrawLeaf(
      pg, food,
      s * 0.88, s * 0.27,
      83, 151, 83
    );

    pg.pop();

    hotpotDrawLeaf(
      pg, food,
      s * 0.98, s * 0.24,
      115, 178, 91
    );

    pg.fill(fc(213, 223, 157));

    pg.beginShape();
    pg.vertex(-s * 0.24, s * 0.12);
    pg.vertex(-s * 0.13, s * 0.42);
    pg.vertex(0, s * 0.53);
    pg.vertex(s * 0.13, s * 0.42);
    pg.vertex(s * 0.24, s * 0.12);
    pg.vertex(s * 0.06, s * 0.18);
    pg.vertex(0, s * 0.47);
    pg.vertex(-s * 0.06, s * 0.18);
    pg.endShape(CLOSE);

  } else if (food.type === "lotus") {
    pg.fill(fc(186, 143, 103));
    pg.circle(0, s * 0.035, s * 1.10);

    pg.fill(fc(249, 231, 194));
    pg.circle(0, 0, s * 1.04);

    pg.fill(fc(255, 243, 211));
    pg.circle(
      -s * 0.07, -s * 0.08,
      s * 0.82
    );

    let soupColor = food.side === "spicy"
      ? color(197, 47, 43)
      : color(239, 220, 179);

    pg.fill(soupColor);

    for (let i = 0; i < 6; i++) {
      let a = TWO_PI * i / 6 - HALF_PI;

      pg.ellipse(
        cos(a) * s * 0.31,
        sin(a) * s * 0.31,
        s * 0.19,
        s * 0.23
      );
    }

    pg.circle(0, 0, s * 0.17);
  }

  pg.pop();
}

function hotpotDrawFishTofu(pg, food, x, y, size) {
  pg.push();
  pg.translate(x, y);
  pg.rotate(-0.13);
  pg.rectMode(CENTER);

  pg.fill(hotpotFoodColor(food, 198, 133, 65));
  pg.rect(
    0, size * 0.09,
    size, size,
    size * 0.13
  );

  pg.fill(hotpotFoodColor(food, 243, 188, 95));
  pg.rect(
    0, 0,
    size, size * 0.92,
    size * 0.13
  );

  pg.fill(hotpotFoodColor(food, 255, 218, 137));
  pg.rect(
    -size * 0.09,
    -size * 0.13,
    size * 0.59,
    size * 0.44,
    size * 0.12
  );

  pg.pop();
}

function hotpotDrawLeaf(
  pg, food, length, halfWidth, r, g, b
) {
  pg.fill(hotpotFoodColor(food, r, g, b));
  pg.beginShape();

  for (let i = 0; i <= 16; i++) {
    let t = i / 16;

    pg.vertex(
      hotpotCubic(
        0,
        -halfWidth * 1.25,
        -halfWidth * 1.2,
        0,
        t
      ),
      hotpotCubic(
        0,
        -length * 0.21,
        -length * 0.81,
        -length,
        t
      )
    );
  }

  for (let i = 0; i <= 16; i++) {
    let t = i / 16;

    pg.vertex(
      hotpotCubic(
        0,
        halfWidth * 1.2,
        halfWidth * 1.15,
        0,
        t
      ),
      hotpotCubic(
        -length,
        -length * 0.83,
        -length * 0.23,
        0,
        t
      )
    );
  }

  pg.endShape(CLOSE);

  pg.fill(hotpotFoodColor(food, 184, 211, 126));

  pg.triangle(
    0, -length * 0.07,
    -halfWidth * 0.05, -length * 0.67,
    0, -length * 0.94
  );
}

function hotpotCubic(a, b, c, d, t) {
  let inv = 1 - t;

  return inv * inv * inv * a
    + 3 * inv * inv * t * b
    + 3 * inv * t * t * c
    + t * t * t * d;
}