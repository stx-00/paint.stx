// Eco-mode: only render if window is focused
window.onblur = function () {
  noLoop();
};
window.onfocus = function () {
  loop();
};

/* CUSTOM FUNCTIONS FOR P5LIVE */
// Keep fullscreen if window resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Custom ease function
function ease(iVal, oVal, eVal) {
  return (oVal += (iVal - oVal) * eVal);
}

// Processing compatibility
function println(msg) {
  print(msg);
}

/*
_hydra_texture // cc ojack.xyz + teddavis.org 2021
cheatsheets: https://ojack.xyz/hydra-functions/ + https://hydrabook.naotohieda.com/
*/

let libs = ["https://unpkg.com/hydra-synth", "includes/libs/hydra-synth.js"];

// Hydra canvas + init
let hc = document.createElement("canvas"); // Hydra canvas
hc.width = 200; // Tiny for brush
hc.height = 200; // Tiny for brush
document.body.appendChild(hc);
hc.style.display = "none"; // Hide Hydra canvas from view

let hydra = new Hydra({
  detectAudio: false,
  canvas: hc,
});
noize = noise; // Use noize() since noise() is taken by p5js

let pg; // Store Hydra texture
let cleverlayer; // Layer on which we draw

let myBrushes = [
  {
    name: "brush 1",
    code: `osc(15, 5, 1, 0.3)
  .kaleid([3, 4, 5, 7, 8, 9, 10].fast(0.1))
  .color(0.5, 0.3)
  .colorama(0.4)
  .rotate(0.009, () => Math.sin(time) * -0.001)
  .modulateRotate(src(o0), () => Math.sin(time) * 0.003)
  .modulate(src(o0), 0.9)
  .mask(
    shape(
        30,
        () => 0.5,
        0.01
      )
      .scale(0.9)
      .modulate(noize(0.6, 3))
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

  pg = createGraphics(hc.width, hc.height);
  cleverlayer = createGraphics(width, height); // Initialize cleverlayer
  imageMode(CENTER);
  cleverlayer.imageMode(CENTER);

  background(0);
  noStroke();
  noSmooth();

  buildGUI();
}

function draw() {
  // clear();
  background(255);

  // Update Hydra texture
  pg.clear();
  pg.drawingContext.drawImage(hc, 0, 0, pg.width, pg.height);

  // Draw Hydra texture as brush when the mouse is pressed
  if (mouseIsPressed) {
    cleverlayer.image(pg, mouseX, mouseY);
  }

  // Display layers
  image(cleverlayer, width / 2, height / 2);
  image(pg, mouseX, mouseY);
}

function buildGUI() {
  // Create GUI Wrapper
  let guiWrapper = createDiv("").class("guiWrapper");
  guiWrapper.style("z-index", "10"); // Ensure higher z-index programmatically

  // Create GUI Content
  let guiContent = createDiv("").parent(guiWrapper).class("guiContent");

  // Column 1: Title
  let column1 = createDiv("").parent(guiContent).class("column1");
  createDiv("p5*hydra paint").parent(column1).class("title");

  // Column 2: Brush selection and editor
  let column2 = createDiv("").parent(guiContent).class("column2");

  // Brush selection dropdown
  let select = createSelect().parent(column2).class("select");
  for (let i = 0; i < myBrushes.length; i++) {
    select.option(myBrushes[i].name, i);
  }

  select.changed(() => {
    let index = select.value();
    editor.value(myBrushes[index].code);
    eval(editor.value());
  });

  // Text editor
  let editor = createElement("textarea")
    .parent(column2)
    .class("editor")
    .size(300, 300);
  editor.value(myBrushes[0].code);
  editor.input(updateEditor);

  eval(editor.value()); // Run initial code

  // Append GUI to the body (after the canvas)
  guiWrapper.parent(document.body);
}

function updateEditor() {
  eval(editor.value());
}
