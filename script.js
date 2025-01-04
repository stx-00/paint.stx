let time = new Date();
let zoomSlider;
let sizeSlider;
let hyperSlider;
let shapeSlider;
let backgroundSlider;
let sliderActive = false; // Flag to indicate slider activity
let sliderClicked = false; // Flag to indicate if the slider was just clicked
let buttonClicked = false; // Flag to indicate if a button is clicked

// Eco-mode for rendering only if the window is focused
window.onblur = function () {
  noLoop();
};
window.onfocus = function () {
  loop();
};

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

function mouseReleased() {
  buttonClicked = false; // Reset the flag when the mouse is released
  sliderActive = false; // Reset slider activity if needed
}

// var credits = {
//   names: [
//     "Sarah.Choi", // feel free to link yourself <a href="URL" target="_blank">first.lastname</a>
//     "Yevheniia.Semenova",
//     "Siiri.Tännler",
//   ],
//   class: "IDCE HGK – MA – Digital Cultures",
//   description: "Hydra Brush Tool",
// };

/*	
	_hydra_multi // cc teddavis.org 2021	
	extends _hydra_scope for multiple instances
*/

let libs = ["https://unpkg.com/hydra-synth", "includes/libs/hydra-synth.js"];

let sel;
let pgSel = 0;
let synthCount = 8; // # of hydra instances
let cleverlayer; // layer on which we draw

// gen hydra instances
let pg = [synthCount],
  hc = [synthCount],
  synth = [synthCount];

for (let i = 0; i < synthCount; i++) {
  hc[i] = document.createElement("canvas"); // hydra canvas + custom size
  hc[i].width = 200; // set resolution width
  hc[i].height = 200; // set resolution height

  synth[i] = new Hydra({
    detectAudio: false, // no mic
    canvas: hc[i], // use hydra canvas
    makeGlobal: false, // scoped
  }).synth; // scoped hydra
}

// sandbox - start
// access each instance via synth[index]

synth[0]
  .osc(() => zoomSlider.value() / 5, 1, 0.3)
  .kaleid([3, 4, 5, 7, 8, 9, 10].fast(0.1))
  .color(0.5, 0.3)
  .colorama(0.4)
  .rotate(0.009, () => Math.sin(time) * -0.001)
  .modulateRotate(synth[0].src(synth[0].o0), () => Math.sin(time) * 0.003)
  .modulate(synth[0].src(synth[0].o0), 0.9)
  .mask(
    synth[0]
      .shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
      .scale(0.9)
      .modulate(synth[0].noise(0.6, () => hyperSlider.value()))
  )
  .out();
//

synth[1]
  .voronoi(() => zoomSlider.value(), 0, 1)
  .mult(
    synth[1]
      .osc(10, 0.1, () => hyperSlider.value() * 3)
      .saturate(3)
      .kaleid(200)
  )
  .mask(
    synth[1]
      .shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
      .modulate(synth[1].src(synth[1].o0), 0.5)
      .add(synth[1].src(synth[1].o0), 0.8)
      .scrollY(-0.01)
      .scale(0.99)
      .modulate(
        synth[1].voronoi(() => hyperSlider.value(), 1),
        0.008
      )
      .luma(0.3)
      .color(15, 25, 1)
  )
  .out();

synth[2]
  .osc(() => zoomSlider.value(), 0.28, 0.3)
  .rotate(0, 0.1)
  .mask(
    synth[2]
      .shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
      .mult(synth[2].osc(10, 0.1))
      .modulate(synth[2].osc(10).rotate(0, -0.1), 1)
  )
  .modulate(synth[2].noise(0.6, () => hyperSlider.value()))
  .color(2.83, 0.91, () => hyperSlider.value() * 50)
  .out();

synth[3]
  .osc(() => zoomSlider.value(), 1, 2)
  .kaleid()
  .mult(
    synth[3].osc(20, 0.001, 0).mask(
      synth[3].shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
    )
  )
  .modulateScale(synth[3].osc(10, 0), -0.03)
  .modulate(synth[3].noise(0.6, () => hyperSlider.value()))
  .scale(0.8, () => 1.05 + 0.1 * Math.sin(0.05 * time))
  // .luma(0.1)
  .out();

synth[4]
  .osc(() => zoomSlider.value(), 2, 3)
  .modulateScale(synth[4].osc(40, 0, 1).kaleid(8))
  .mask(
    synth[4]
      .shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
      .repeat(2, 4)
      .modulate(synth[4].noise(0.6, () => hyperSlider.value()))
  )
  .out();

synth[5]
  .osc(() => zoomSlider.value(), 0.25, 0.25)
  .mask(
    synth[5]
      .shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.1
      )
      .modulate(synth[5].noise(4.6, () => hyperSlider.value()))
      // .diff(synth[0].src(synth[0].o0))
      .scale(0.72)
      .color(0.5, 5, 1, 0, 1)
      // .scale(0.99)
      .luma(1)
      .saturate(5)
    // .color(1, 0, 3)
    // .invert()
  )
  .out();

synth[6].voronoi(2, 0.5, 0.3);
synth[6]
  .osc(() => zoomSlider.value(), 2, 1)
  .mask(
    synth[6]
      .shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
      .mult(
        synth[6]
          .osc(10, 0.1, () => Math.sin(time) * 3)
          .saturate(3)
          .kaleid(200)
      )
      .modulate(synth[6].src(synth[6].o0), 0.5)
      .modulate(synth[6].noise(0.6, () => hyperSlider.value()))
      .add(synth[6].src(synth[6].o0), 0.8)
      .scrollY(-0.01)
      .scale(0.99)
      .modulate(synth[6].voronoi(8, 1), 0.008)
      .luma(0.3)
  )
  .out();

//Ô	speed = 0.1

synth[7]
  .noise(() => zoomSlider.value(), 0.5, 1)
  .color(
    () => Math.sin(time * Math.random()) * 0.5 + 0.5,
    () => Math.cos(time * Math.random()) * 0.5 + 0.5,
    () => Math.sin(time * Math.random() * 1.5) * 0.5 + 0.5
  )
  .rotate(0.009, () => Math.sin(time) * 1)
  .saturate(10)
  .mask(
    synth[7]
      .shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
      .modulate(synth[7].src(synth[7].o0), 0.5)
      .modulate(synth[7].noise(0.6, () => hyperSlider.value()))
      .mult(
        synth[7]
          .voronoi(10, 0.1, () => Math.sin(time) * 3)
          .saturate(3)
          .shift(0.5)
        // .kaleid(200)
      )
      .modulateRotate(synth[7].src(synth[7].o0), () => Math.sin(time) * 2)
      .scrollX(10)
      .scrollY(2)
      .color(0.5, 0.8, 50)
      .luma()
      // .invert()

      .repeatX(1)
      .repeatY(1)
  )
  .out();

// synth[7]
//   .solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1)
//   .mask(
//     synth[7].shape(
//       () => shapeSlider.value(),
//       () => sizeSlider.value(),
//       0.01
//     )
//   )
//   .out();

// sandbox - stop

function setup() {
  createCanvas(windowWidth, windowHeight);

  buildGUI();

  background(0);
  noStroke();

  cleverlayer = createGraphics(width, height);

  imageMode(CENTER);
  cleverlayer.imageMode(CENTER);

  // Prevent text selection while drawing
  let canvasElement = document.querySelector("canvas");
  canvasElement.addEventListener("mousedown", (e) => e.preventDefault());
  canvasElement.addEventListener("mousemove", (e) => e.preventDefault());

  // prep synth layers
  for (let i = 0; i < synthCount; i++) {
    pg[i] = createGraphics(hc[i].width, hc[i].height);
  }
}

function draw() {
  // Do not draw if a slider is active
  if (sliderActive || buttonClicked) {
    // Draw the background
    background(backgroundSlider.value());

    // Redraw the persistent layer (cleverlayer) on top
    image(cleverlayer, width / 2, height / 2);
    return; // Skip the rest of the drawing logic
  }

  // grab + apply hydra textures

  background(backgroundSlider.value());

  pg[pgSel].clear();
  pg[pgSel].drawingContext.drawImage(
    hc[pgSel],
    0,
    0,
    pg[pgSel].width,
    pg[pgSel].height
  );

  // Brush logic when the mouse is pressed
  if (mouseIsPressed) {
    if (pgSel == 7) {
      console.log("hello pg 7");
    } else {
      cleverlayer.image(pg[pgSel], mouseX, mouseY);
    }
    cleverlayer.image(pg[pgSel], mouseX, mouseY);
  }
  image(cleverlayer, width / 2, height / 2);
  image(pg[pgSel], mouseX, mouseY);
}

function buildGUI() {
  let guiWrapper = createDiv("").class("guiWrapper");
  let guiContent = createDiv("").parent(guiWrapper).class("guiContent");

  let guiInfo = createDiv("").parent(guiContent).class("guiInfo");
  let title = createDiv("p5*hydra brushes").parent(guiInfo).class("title");

  let trashButton = createDiv("trash")
    .parent(guiInfo)
    .class("trashButton button");
  trashButton.mousePressed(() => {
    buttonClicked = true;
    clearCanvas();
  });

  let saveButton = createDiv("save").parent(guiInfo).class("saveButton button");
  saveButton.mousePressed(() => {
    buttonClicked = true;
    saveCanvas();
  });

  let addButton = createDiv("add").parent(guiInfo).class("addButton button");
  addButton.mousePressed(() => {
    buttonClicked = true;
    // Add button functionality here
  });

  let printButton = createDiv("print")
    .parent(guiInfo)
    .class("printButton button");
  printButton.mousePressed(() => {
    buttonClicked = true;
    // Print button functionality here
  });

  let infoButton = createDiv("?").parent(guiInfo).class("infoButton button");
  infoButton.mousePressed(() => {
    buttonClicked = true;
    // Info button functionality here
  });

  let column2 = createDiv("").parent(guiContent).class("column2");

  let selectBrush = createDiv("").parent(column2).class("selectWrapper"); //for select brush

  let column3 = createDiv("").parent(guiContent).class("column3");

  let sliderBackground = createDiv("").parent(column3).class("sliderWrapper"); //for backgroundSlider
  let sliderHydraZoom = createDiv("").parent(column3).class("sliderWrapper"); //for
  let sliderBrushSize = createDiv("").parent(column3).class("sliderWrapper");
  let sliderBrushShape = createDiv("").parent(column3).class("sliderWrapper");
  let sliderHyperActive = createDiv("").parent(column3).class("sliderWrapper");

  label("select your brush", selectBrush);
  sel = createSelect().parent(selectBrush).class("select");
  sel.option("brush 0", 0);
  sel.option("brush 1", 1);
  sel.option("brush 2", 2);
  sel.option("brush 3", 3);
  sel.option("brush 4", 4);
  sel.option("brush 5", 5);
  sel.option("brush 6", 6);
  sel.option("brush 7", 7);

  sel.changed(function () {
    pgSel = sel.value();
  });

  label("background", sliderBackground);
  backgroundSlider = createSlider(0, 255, 255, 1)
    .parent(sliderBackground)
    .class("slider")
    .input(() => {
      sliderActive = true;
      adjustTextColor(); // Call this function to adjust text color
    })
    .mousePressed(() => {
      sliderClicked = true;
      sliderActive = true;
    })
    .mouseReleased(() => {
      sliderActive = false;
      setTimeout(() => (sliderClicked = false), 100);
    });

  label("hydra zoom", sliderHydraZoom);
  zoomSlider = createSlider(10, 255, 10, 0)
    .parent(sliderHydraZoom)
    .class("slider")
    .input(() => (sliderActive = true))
    .mousePressed(() => {
      sliderClicked = true;
      sliderActive = true;
    })
    .mouseReleased(() => {
      sliderActive = false;
      setTimeout(() => (sliderClicked = false), 100);
    });

  label("brush size", sliderBrushSize);
  sizeSlider = createSlider(0.1, 1, 0.5, 0.001)
    .parent(sliderBrushSize)
    .class("slider")
    .input(() => (sliderActive = true))
    .mousePressed(() => {
      sliderClicked = true;
      sliderActive = true;
    })
    .mouseReleased(() => {
      sliderActive = false;
      setTimeout(() => (sliderClicked = false), 100);
    });

  label("brush shape", sliderBrushShape);
  shapeSlider = createSlider(3, 12, 50, 0.001)
    .parent(sliderBrushShape)
    .class("slider")
    .input(() => (sliderActive = true))
    .mousePressed(() => {
      sliderClicked = true;
      sliderActive = true;
    })
    .mouseReleased(() => {
      sliderActive = false;
      setTimeout(() => (sliderClicked = false), 100);
    });

  label("hyper active", sliderHyperActive);
  hyperSlider = createSlider(0.5, 10, 3, 0.05)
    .parent(sliderHyperActive)
    .class("slider")
    .input(() => (sliderActive = true))
    .mousePressed(() => {
      sliderClicked = true;
      sliderActive = true;
    })
    .mouseReleased(() => {
      sliderActive = false;
      setTimeout(() => (sliderClicked = false), 100);
    });

  // Set the selected option to "brush1".
  sel.selected("title of brush0", 0);

  function clearCanvas() {
    cleverlayer.clear();
    background(0);
  }

  function saveCanvas() {
    var filename = "qz-hydra-brush.png";
    cleverlayer.save(filename);
  }

  function label(txt, parent) {
    createDiv(txt).parent(parent).class("label");
  }

  function adjustTextColor() {
    const backgroundValue = backgroundSlider.value();
    if (backgroundValue <= 35) {
      guiWrapper.addClass("light-text");
    } else {
      guiWrapper.removeClass("light-text");
    }
  }
}
