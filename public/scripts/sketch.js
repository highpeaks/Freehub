var c, times, slowest, fastest, q1, q3, median, segmentName, segmentDistance, entryCount, slowestConverted, fastestConverted, q1Converted, q3Converted, medianConverted, y1, y2, y3, justL, justR, leading, q1x, medx, q3x, q1r, medr, q3r, map_in, map_out, bigText, smallText;
var boxon = true;
var gradon = false;
var moveon = false;
var map_in_on = false;
var map_out_on = false;

function preload(){
  refresh();
}

function refresh(){
  loadJSON('json/leaderBoards.json', gotData);
}

function gotData(data) {
  slowest = data.slowest;
  fastest = data.fastest;
  q1 = data.q1;
  q3 = data.q3;
  median = data.median;
  slowestConverted = timeConvert(slowest);
  q1Converted = timeConvert(q1);
  medianConverted = timeConvert(median);
  q3Converted = timeConvert(q3);
  fastestConverted = timeConvert(fastest);

  segmentName = select("#name");
  segmentName.html(data.name + ", " + data.loc);

  segmentDistance = data.distance;

  entryCount = data.entries.moving_time.length;
  entryCount = entryCount + " entries"

  times = data.entries.moving_time;

  let segment_map = "&path=color:0xFF0099|weight:4|enc:" + data.map[0].polyline;

  map_in = loadImage("https://maps.googleapis.com/maps/api/staticmap?size=500x500" + segment_map +
    "&style=feature:all|element:labels|visibility:off" +
    "&style=feature:road|element:labels|visibility:on" +
    "&style=feature:road|element:labels.text.fill|color:0x323232" +
    "&style=feature:road|element:labels.text.stroke|color:0xffffff|weight:5" +
    "&style=feature:road|element:labels.icon|visibility:off" +
    "&style=feature:road|element:geometry.fill|color:0xafafaf" +
    "&style=feature:road|element:geometry.stroke|visibility:off" +
    "&style=feature:transit.line|element:geometry.fill|color:0x0xafafaf" +
    "&style=feature:water|element:geometry.fill|color:0xe1e1e1" +
    "&style=feature:landscape|element:geometry.fill|color:0xffffff" +
    "&style=feature:poi|visibility:off" +
    "&key=AIzaSyB6eWPl9HKRoaVnpFy_Yk50HxgE2bwQdo0");

  map_out = loadImage("https://maps.googleapis.com/maps/api/staticmap?size=500x500" + segment_map +
    "&zoom=11" +
    "&style=feature:all|element:labels|visibility:off" +
    // "&style=feature:road|element:labels|visibility:on" +
    // "&style=feature:road|element:labels.text.fill|color:0x323232" +
    // "&style=feature:road|element:labels.text.stroke|color:0xffffff|weight:5" +
    // "&style=feature:road|element:labels.icon|visibility:off" +
    "&style=feature:road|element:geometry.fill|color:0xafafaf" +
    "&style=feature:road|element:geometry.stroke|visibility:off" +
    "&style=feature:transit.line|element:geometry.fill|color:0x0xafafaf" +
    "&style=feature:water|element:geometry.fill|color:0xe1e1e1" +
    "&style=feature:landscape|element:geometry.fill|color:0xffffff" +
    "&style=feature:poi|visibility:off" +
    "&key=AIzaSyB6eWPl9HKRoaVnpFy_Yk50HxgE2bwQdo0");
}

function setup(){

  if (windowWidth >= 800){
    c = createCanvas(windowWidth * 0.5, 550);
    c.parent("#canvas");
    bigText = 24;
    smallText = 16;
  } else {
    var c = createCanvas(windowWidth, windowWidth);
    c.parent("#canvas");
    bigText = 18;
    smallText = 12;
  }

  y1 = height * 0.125;
  y2 = height * 0.375;
  y3 = height * 0.75;
  justL = 50;
  justR = width - justL;
  leading = 20;
  q1x = justL;
  medx = justL;
  q3x = justL;
  q1r = segmentDistance / q1 * 0.25;
  medr = segmentDistance / median * 0.25;
  q3r = segmentDistance / q3 * 0.25;
  segmentDistance = (segmentDistance * 0.000621371).toFixed(2) + " mi";

  let box_button = select("#boxplot");
  box_button.mousePressed(toggleBoxplot);

  let gradient_button = select("#gradientplot");
  gradient_button.mousePressed(toggleGradientplot);

  let animated_button = select("#animatedplot");
  animated_button.mousePressed(toggleAnimatedplot);

  let local_map = select("#localMap");
  local_map.mousePressed(toggleLocalMap);

  let regional_map = select("#regionalMap");
  regional_map.mousePressed(toggleRegionalMap);
}

function draw(){

  background(255);

  if (boxon){
    boxPlot();
  }
  if (gradon){
    gradientPlot();
  }
  if (moveon){
    animatePlot();
  }
  if (map_in_on){
    push();
    imageMode(CENTER);
    image(map_in, width * 0.5, height * 0.5);
    pop();
  }
  if (map_out_on){
    push();
    imageMode(CENTER);
    image(map_out, width * 0.5, height * 0.5);
    pop();
  }
  // // canvas grid and border, delete later
  // noFill();
  // stroke(255,0,0);
  // strokeWeight(0.5);
  // for (let i = 0; i <= height; i = i + (height * 0.25)){
  //   line(0, i, width, i);
  // }
  // rect(0,0,width,height);
  //
  // line(justL, 0, justL, height);
  // line(justR, 0, justR, height);
  // line(width*0.5, 0, width*0.5, height);
}

function boxPlot(){

  stroke(175);
  strokeWeight(3);

  //main line
  line(justL, y2, justR, y2);

  //start and end lines
  line(justL, y2-15, justL, y2+15);
  line(justR, y2-15, justR, y2+15);

  //interquartile box
  noStroke();
  fill(175);
  q1x = map(q1, slowest, fastest, justL, justR);
  q3x = map(q3, slowest, fastest, justL, justR);
  beginShape();
  vertex(q1x, y2-15);
  vertex(q1x, y2+15);
  vertex(q3x, y2+15);
  vertex(q3x, y2-15);
  endShape(CLOSE);

  //median
  stroke(255);
  strokeWeight(3);
  medianx = map(median, slowest, fastest, justL, justR)
  line(medianx, y2-15, medianx, y2+15);

  //text
  textFont("Fira Sans");
  textAlign(CENTER, CENTER);
  textSize(bigText);
  text("Reported Athlete Data", width * 0.5, y1 - leading);

  textSize(smallText);
  text(dateConvert(), width * 0.5, y1 + leading);

  text("Slowest", justL, y3 - (leading * 3));
  text("Q1", (((width * 0.5) + (justL)) / 2), y3 - (leading * 3));
  text("Median", width * 0.5, y3 - (leading * 3));
  text("Q3", (((width * 0.5) + (justR)) / 2), y3 - (leading * 3));
  text("Fastest", justR, y3 - (leading * 3));
  text("Distance", (((width * 0.5) + (justL)) / 2), y3 + (leading * 1.75));
  text("Sample Size", (((width * 0.5) + (justR)) / 2), y3 + (leading * 1.75));

  fill(255,0,153,175);
  text(slowestConverted, justL, y3 - (leading * 1.75));
  text(q1Converted, (((width * 0.5) + (justL)) / 2), y3 - (leading * 1.75));
  text(medianConverted, width * 0.5, y3 - (leading * 1.75));
  text(q3Converted, (((width * 0.5) + (justR)) / 2), y3 - (leading * 1.75));
  text(fastestConverted, justR, y3 - (leading * 1.75));
  text(segmentDistance, (((width * 0.5) + (justL)) / 2), y3 + (leading * 3));
  text(entryCount, (((width * 0.5) + (justR)) / 2), y3 + (leading * 3));
}

function gradientPlot(){

  for (let i = 0; i < times.length; i++){
    if(times[i] <= median){
      let r = map(median - times[i], 0, median - fastest, 0, 1);
      let c1 = color(255,0,153);
      let c2 = color(255,51,0);
      stroke(lerpColor(c1,c2,r))
    } else {
      let r = map(times[i] - median, 0, slowest - median, 0, 1);
      let c1 = color(255,0,153);
      let c2 = color(0,0,51);
      stroke(lerpColor(c1,c2,r))
    }
    let x = map(times[i], slowest, fastest, justL, justR)
    strokeWeight(2);
    line(x, y2-15, x, y2+15);
  }

  //text
  fill(175);
  noStroke();
  textFont("Fira Sans");
  textAlign(CENTER, CENTER);
  textSize(bigText);
  text("Reported Athlete Data", width * 0.5, y1 - leading);

  textSize(smallText);
  text(dateConvert(), width * 0.5, y1 + leading);

  text("Slowest", justL, y3 - (leading * 3));
  text("Q1", (((width * 0.5) + (justL)) / 2), y3 - (leading * 3));
  text("Median", width * 0.5, y3 - (leading * 3));
  text("Q3", (((width * 0.5) + (justR)) / 2), y3 - (leading * 3));
  text("Fastest", justR, y3 - (leading * 3));
  text("Distance", (((width * 0.5) + (justL)) / 2), y3 + (leading * 1.75));
  text("Sample Size", (((width * 0.5) + (justR)) / 2), y3 + (leading * 1.75));

  fill(255,0,153,175);
  text(slowestConverted, justL, y3 - (leading * 1.75));
  text(q1Converted, (((width * 0.5) + (justL)) / 2), y3 - (leading * 1.75));
  text(medianConverted, width * 0.5, y3 - (leading * 1.75));
  text(q3Converted, (((width * 0.5) + (justR)) / 2), y3 - (leading * 1.75));
  text(fastestConverted, justR, y3 - (leading * 1.75));
  text(segmentDistance, (((width * 0.5) + (justL)) / 2), y3 + (leading * 3));
  text(entryCount, (((width * 0.5) + (justR)) / 2), y3 + (leading * 3));
}

function animatePlot(){

  noStroke();
  let q1col = color(0,0,51);
  let medcol = color(255,0,153);
  let q3col = color(255,51,0);

  fill(q1col);
  ellipse(q1x, y2 - 15, 10);

  fill(medcol);
  ellipse(medx, y2, 10);

  fill(q3col);
  ellipse(q3x, y2 + 15, 10);

  q1x = q1x + q1r;
  medx = medx + medr;
  q3x = q3x + q3r;

  if (q1x > justR){
    q1r = q1r * -1;
  }
  if (medx > justR){
    medr = medr * -1;
  }
  if (q3x > justR){
    q3r = q3r * -1;
  }
  if (q1x < justL){
    q1r = q1r * -1;
  }
  if (medx < justL){
    medr = medr * -1;
  }
  if (q3x < justL){
    q3r = q3r * -1;
  }

  //text
  fill(175);
  noStroke();
  textFont("Fira Sans");
  textAlign(CENTER, CENTER);
  textSize(bigText);
  text("Reported Athlete Data", width * 0.5, y1 - leading);

  textSize(smallText);
  text(dateConvert(), width * 0.5, y1 + leading);

  text("Slowest", justL, y3 - (leading * 3));
  text("Q1", (((width * 0.5) + (justL)) / 2), y3 - (leading * 3));
  text("Median", width * 0.5, y3 - (leading * 3));
  text("Q3", (((width * 0.5) + (justR)) / 2), y3 - (leading * 3));
  text("Fastest", justR, y3 - (leading * 3));
  text("Distance", (((width * 0.5) + (justL)) / 2), y3 + (leading * 1.75));
  text("Sample Size", (((width * 0.5) + (justR)) / 2), y3 + (leading * 1.75));
  text(slowestConverted, justL, y3 - (leading * 1.75));
  text(fastestConverted, justR, y3 - (leading * 1.75));
  text(segmentDistance, (((width * 0.5) + (justL)) / 2), y3 + (leading * 3));
  text(entryCount, (((width * 0.5) + (justR)) / 2), y3 + (leading * 3));
  fill(q1col);
  text(q1Converted, (((width * 0.5) + (justL)) / 2), y3 - (leading * 1.75));
  fill(medcol);
  text(medianConverted, width * 0.5, y3 - (leading * 1.75));
  fill(q3col);
  text(q3Converted, (((width * 0.5) + (justR)) / 2), y3 - (leading * 1.75));
}

function timeConvert(time) {
  if (time >= 60){
    let minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;
    return(minutes + "m " + seconds + "s");
  } else{
    return(time + "s");
  }
}

function dateConvert(){
  var d = new Date();
  var month = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];
  return(month[d.getMonth()] + ", " + d.getFullYear());
}

function toggleBoxplot(){
  boxon = true;
  gradon = false;
  moveon = false;
  map_in_on = false;
  map_out_on = false;
  abouton = false;
}

function toggleGradientplot(){
  boxon = false;
  gradon = true;
  moveon = false;
  map_in_on = false;
  map_out_on = false;
  abouton = false;
}

function toggleAnimatedplot(){
  boxon = false;
  gradon = false;
  moveon = true;
  map_in_on = false;
  map_out_on = false;
  abouton = false;
}

function toggleLocalMap(){
  boxon = false;
  gradon = false;
  moveon = false;
  map_in_on = true;
  map_out_on = false;
  abouton = false;
}

function toggleRegionalMap(){
  boxon = false;
  gradon = false;
  moveon = false;
  map_in_on = false;
  map_out_on = true;
  abouton = false;
}

function windowResized() {
  // console.log("reeee");
  if (windowWidth >= 800) {
    resizeCanvas(windowWidth * 0.5, 550);
    bigText = 24;
    smallText = 16;
  } else{
    resizeCanvas(windowWidth,windowWidth);
    bigText = 22;
    smallText = 14;
  }
  y1 = height * 0.125;
  y2 = height * 0.375;
  y3 = height * 0.75;
  justL = 50;
  justR = width - justL;
  leading = 20;
  q1x = justL;
  medx = justL;
  q3x = justL;
}
