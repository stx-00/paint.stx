// eco-mode = only render if window focused
window.onblur = function () {
  noLoop();
};
window.onfocus = function () {
  loop();
};

/////////////////////////////////////////////////////////////////////////////////

/* CUSTOM FUNCTIONS FOR P5LIVE */
// keep fullscreen if window resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// custom ease function
function ease(iVal, oVal, eVal) {
  return (oVal += (iVal - oVal) * eVal);
}

// processing compatibility
function println(msg) {
  print(msg);
}

/////////////////////////////////////////////////////////////////////////////////

/*
_hydra_texture // cc ojack.xyz + teddavis.org 2021

cheatsheets: https://ojack.xyz/hydra-functions/ + https://hydrabook.naotohieda.com/
*/

let libs = ["https://unpkg.com/hydra-synth", "includes/libs/hydra-synth.js"];

// Hydra canvas + init
let hc = document.createElement("canvas"); // Hydra canvas
hc.width = 500; // Tiny for brush
hc.height = 500; // Tiny for brush
document.body.appendChild(hc);
hc.style.display = "none"; // Hide Hydra canvas from view

let hydra = new Hydra({
  detectAudio: false,
  canvas: hc,
});
noize = noise; // Use noize() since noise() is taken by p5js

let pg; // Store Hydra texture
let cleverlayer; // Layer on which we draw
let size;

let myBrushes = [
  {
    name: "brush 1",
    code: `osc(() => zoom.value() / 5, 1, 0.3)
  .kaleid([3, 4, 5, 7, 8, 9, 10].fast(0.1))
  .color(0.5, 0.3)
  .colorama(0.4)
  .rotate(0.009, () => Math.sin(time) * -0.001)
  .modulateRotate(src(o0), () => Math.sin(time) * 0.003)
  .modulate(src(o0), 0.9)
  .mask(
    shape(
        () => shape.value(),
        () => 0.5,
        0.01
      )
      .scale(0.9)
      .modulate(noize(0.6, () => hyper.value()))
      .rotate(() => rotate.value(), () => rotate.value() / 5)
  ).out()`,
  },
  {
    name: "brush 2",
    code: `noize().out()`,
  },
  {
    name: "brush 3",
    code: `gradient().out()`,
  },
  {
    name: "blank",
    code: `// make your own!
// ()=>shape.value() // 0 - 2`,
  },
];

function setup() {
  createCanvas(windowWidth, windowHeight);

  buildGUI();

  pg = createGraphics(hc.width, hc.height);
  cleverlayer = createGraphics(width, height); // Initialize cleverlayer

  imageMode(CENTER);
  cleverlayer.imageMode(CENTER);

  background(0);
  noStroke();
  noSmooth();

  // cursor position in the center of the canvas
  mouseX = width / 2;
  mouseY = height / 2;
}

function draw() {
  clear();
  background(255);

  scl = size.value();

  // Display layers
  image(cleverlayer, width / 2, height / 2);
  image(pg, mouseX, mouseY, pg.width * scl, pg.height * scl);

  // Update Hydra texture
  pg.clear();
  pg.drawingContext.drawImage(hc, 0, 0, pg.width, pg.height);

  // Draw Hydra texture as brush when the mouse is pressed
  if (mouseIsPressed) {
    cleverlayer.image(pg, mouseX, mouseY, pg.width * scl, pg.height * scl);
  }
}

function buildGUI() {
  let guiWrapper = createDiv("").class("guiWrapper");
  let guiContent = createDiv("").parent(guiWrapper).class("guiContent");

  function label(txt, parent) {
    createDiv(txt).parent(parent).class("label");
  }

  ///////////////////////////////////////////// COLUMN 1 /////////////////////////////////////////////

  let column1 = createDiv("").parent(guiContent).class("column1");
  let title = createDiv("p5*hydra paint").parent(column1).class("title");

  let trash = createDiv("trash").parent(column1).class("trash button");
  trash.mousePressed(() => {
    clearCanvas();
  });

  function clearCanvas() {
    cleverlayer.clear();
  }

  let save = createDiv("save").parent(column1).class("save button");
  save.mousePressed(() => {
    saveCanvas();
  });

  function saveCanvas() {
    var filename = "p5-hydra-paint-sketch.png";
    cleverlayer.save(filename);
  }

  ///////////////////////////////////////////// COLUMN 2 /////////////////////////////////////////////

  let column2 = createDiv("").parent(guiContent).class("column2");

  let brushControls = createDiv("").parent(column2).class("brushControls");

  let selectWrapper = createDiv("")
    .parent(brushControls)
    .class("selectWrapper");

  label("select your brush", selectWrapper);
  mySelect = createSelect().parent(selectWrapper).class("select");
  for (let i = 0; i < myBrushes.length; i++) {
    mySelect.option(myBrushes[i].name, i);
  }

  mySelect.changed(() => {
    let index = mySelect.value();
    myEditor.value(myBrushes[index].code);
    eval(myEditor.value());
  });

  let editorWrapper = createDiv("")
    .parent(brushControls)
    .class("editorWrapper");

  // Text editor for custom brush code
  myEditor = createElement("textarea").parent(editorWrapper).class("editor");
  myEditor.value(myBrushes[0].code);
  myEditor.input(updateEditor);

  eval(myEditor.value()); // Run text in editor as JS

  ///////////////////////////////////////////// COLUMN 3 /////////////////////////////////////////////

  let column3 = createDiv("").parent(guiContent).class("column3");

  let sizeSlider = createDiv("").parent(column3).class("sliderWrapper");
  let shapeSlider = createDiv("").parent(column3).class("sliderWrapper");
  let rotateSlider = createDiv("").parent(column3).class("sliderWrapper");
  let zoomSlider = createDiv("").parent(column3).class("sliderWrapper");
  let hyperSlider = createDiv("").parent(column3).class("sliderWrapper");

  label("size", sizeSlider);
  size = createSlider(0.1, 1, 0.4, 0.001).parent(sizeSlider).class("slider");

  label("shape", shapeSlider);
  shape = createSlider(5, 40, 30, 0).parent(shapeSlider).class("slider");

  label("rotate", rotateSlider);
  rotate = createSlider(0, 10, 0, 0).parent(rotateSlider).class("slider");

  label("zoom", zoomSlider);
  zoom = createSlider(5, 70, 15, 0).parent(zoomSlider).class("slider");

  label("hyper", hyperSlider);
  hyper = createSlider(0.5, 10, 3, 0.05).parent(hyperSlider).class("slider");
}

function updateEditor() {
  eval(myEditor.value());
}
