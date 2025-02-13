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
let isInteractingWithGUI = false;

let myBrushes = [
  {
    name: "→ prismatic pulse",
    code: `osc(() => zoomSlider.value() / 5, 1, 0.3)
  .kaleid([3, 4, 5, 7, 8, 9, 10].fast(0.1))
  .color(0.5, 0.3)
  .colorama(0.4)
  .rotate(0.009, () => Math.sin(time) * -0.001)
  .modulateRotate(src(o0), () => Math.sin(time) * 0.003)
  .modulate(src(o0), 0.9)
  .mask(
    shape(
        () => shapeSlider.value(),
        () => 0.5,
        0.01
      )
      .scale(0.9)
      .modulate(noize(0.6, () => hyperSlider.value()))
      .rotate(() => rotateSlider.value(), () => rotateSlider.value() / 5)
  ).out()`,
  },
  {
    name: "→ acid loop",
    code: `voronoi(() => zoomSlider.value(), 0, 1)
    .mult(
    osc(10, 0.1, () => hyperSlider.value() * 3)
    .saturate(3)
    .kaleid(200)
    )
    .mask(
    shape(() => shapeSlider.value(), () => 0.5, 0.01)
    .modulate(src(o0), 0.8)
    .scrollY(-0.01)
    .scale(0.99)
    .modulate(
    voronoi(() => hyperSlider.value(), 1), 0.008)
    .luma(0.3)
    .color(15, 25, 1)
    .rotate( () => rotateSlider.value(), () => rotateSlider.value() / 5)
    )
    .out()`,
  },
  {
    name: "→ brush 3",
    code: `gradient().out()`,
  },
  {
    name: "→ make your own",
    code: `// make your own!
// ()=>shapeSlider.value() // 0 - 2`,
  },
];

let defaultSettings = {
  index: 0,
  shapeSlider: 30,
  myCode: `// make your own!
// ()=>shapeSlider.value() // 0 - 2`,
};

let settings = JSON.parse(JSON.stringify(defaultSettings)); // this is clone JS object

if (localStorage.hasOwnProperty("paintSettings")) {
  tempSettings = JSON.parse(localStorage.getItem("paintSettings"));
  for (const [key, value] of Object.entries(tempSettings)) {
    settings[key] = value;
  }
} else {
  localStorage.setItem("paintSettings", JSON.stringify(defaultSettings));
}

function saveSettings() {
  localStorage.setItem("paintSettings", JSON.stringify(settings));
}

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

  scl = sizeSlider.value();

  // Display layers
  image(cleverlayer, width / 2, height / 2);
  image(pg, mouseX, mouseY, pg.width * scl, pg.height * scl);

  // Update Hydra texture
  pg.clear();
  pg.drawingContext.drawImage(hc, 0, 0, pg.width, pg.height);

  // Draw Hydra texture as brush when the mouse is pressed
  if (mouseIsPressed && !isInteractingWithGUI) {
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
  title.style("cursor", "pointer");
  title.mousePressed(() => {
    window.location.reload();
  });

  let trash = createDiv("trash").parent(column1).class("trash button");
  trash.mousePressed(() => {
    clearCanvas();
  });
  trash.mouseOver(() => (isInteractingWithGUI = true));
  trash.mouseOut(() => (isInteractingWithGUI = false));

  function clearCanvas() {
    cleverlayer.clear();
  }

  let save = createDiv("save").parent(column1).class("save button");
  save.mousePressed(() => {
    saveCanvas();
  });
  save.mouseOver(() => (isInteractingWithGUI = true));
  save.mouseOut(() => (isInteractingWithGUI = false));

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
    settings.index = mySelect.value();
    saveSettings();

    updateEditor();
  });

  function updateEditor() {
    if (myBrushes[settings.index].name === "→ make your own") {
      // *** grab local storage
      myEditor.value(settings.myCode);
      editorWrapper.style("display", "block");
      toggleButton.html("\u00A0\u00A0- hide code");
    } else {
      myEditor.value(myBrushes[settings.index].code);
    }
    updateBrush();
  }

  let toggleButton = createDiv("\u00A0\u00A0+ modify code")
    .parent(selectWrapper)
    .class("toggleButton");

  toggleButton.mousePressed(() => {
    let isHidden = editorWrapper.style("display") === "none";
    editorWrapper.style("display", isHidden ? "block" : "none");
    toggleButton.html(
      isHidden ? "\u00A0\u00A0- hide code" : "\u00A0\u00A0+ modify code"
    );
  });
  toggleButton.mouseOver(() => (isInteractingWithGUI = true));
  toggleButton.mouseOut(() => (isInteractingWithGUI = false));

  let editorWrapper = createDiv("")
    .parent(brushControls)
    .class("editorWrapper");
  editorWrapper.style("display", "none"); // Initially hidden

  // Text editor for custom brush code
  myEditor = createElement("textarea").parent(editorWrapper).class("editor");
  myEditor.value(myBrushes[0].code);
  myEditor.input(() => {
    if (myBrushes[settings.index].name === "→ make your own") {
      settings.myCode = myEditor.value();
      saveSettings();
    }
    updateBrush();
  });

  myEditor.mouseOver(() => (isInteractingWithGUI = true));
  myEditor.mouseOut(() => (isInteractingWithGUI = false));
  myEditor.mousePressed(() => (isInteractingWithGUI = true));
  myEditor.mouseReleased(() => (isInteractingWithGUI = false));

  updateBrush();
  // update brush as a function

  function updateBrush() {
    eval(myEditor.value()); // Run text in editor as JS
  }

  ///////////////////////////////////////////// COLUMN 3 /////////////////////////////////////////////

  let column3 = createDiv("").parent(guiContent).class("column3");

  let sizeHolder = createDiv("").parent(column3).class("sliderWrapper");
  let shapeHolder = createDiv("").parent(column3).class("sliderWrapper");
  let rotateHolder = createDiv("").parent(column3).class("sliderWrapper");
  let zoomHolder = createDiv("").parent(column3).class("sliderWrapper");
  let hyperHolder = createDiv("").parent(column3).class("sliderWrapper");

  label("size", sizeHolder);
  sizeSlider = createSlider(0.1, 1, 0.4, 0.001)
    .parent(sizeHolder)
    .class("slider");

  label("shape", shapeHolder);
  shapeSlider = createSlider(5, 40, settings.shapeSlider, 0)
    .parent(shapeHolder)
    .class("slider");
  shapeSlider.input(() => {
    settings.shapeSlider = shapeSlider.value();
    saveSettings();
  });

  label("rotate", rotateHolder);
  rotateSlider = createSlider(0, 10, 0, 0).parent(rotateHolder).class("slider");

  label("zoom", zoomHolder);
  zoomSlider = createSlider(5, 70, 15, 0).parent(zoomHolder).class("slider");

  label("hyper", hyperHolder);
  hyperSlider = createSlider(0.5, 10, 3, 0.05)
    .parent(hyperHolder)
    .class("slider");

  // to not draw while using sliders

  function addSliderListeners(slider) {
    slider.mouseOver(() => (isInteractingWithGUI = true));
    slider.mouseOut(() => (isInteractingWithGUI = false));
    slider.mousePressed(() => (isInteractingWithGUI = true));
    slider.mouseReleased(() => (isInteractingWithGUI = false));
  }

  addSliderListeners(sizeSlider);
  addSliderListeners(shapeSlider);
  addSliderListeners(rotateSlider);
  addSliderListeners(zoomSlider);
  addSliderListeners(hyperSlider);

  // set all sliders from local storage
  mySelect.value(settings.index);
  updateEditor();
}
