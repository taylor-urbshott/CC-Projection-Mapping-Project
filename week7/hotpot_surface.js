function drawHotpot(pg) {
  pg.background(245);
  pg.noStroke();

  pg.fill(210, 175, 105);
  pg.circle(pg.width / 2, pg.height / 2, 340);

  pg.fill(190, 45, 40);
  pg.arc(pg.width / 2, pg.height / 2, 310, 310, HALF_PI, PI + HALF_PI);

  pg.fill(235, 215, 175);
  pg.arc(pg.width / 2, pg.height / 2, 310, 310, -HALF_PI, HALF_PI);
}