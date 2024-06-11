// eco-mode = only render if window focused
window.onblur = function () {
  noLoop();
};
window.onfocus = function () {
  loop();
};

// let time = new Date();
//QZ for real REAL_002

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

var credits = {
  names: [
    "Sarah.Choi", // feel free to link yourself <a href="URL" target="_blank">first.lastname</a>
    "Yevheniia.Semenova",
    "Siiri.Tännler",
  ],
  class: "IDCE HGK – MA – Digital Cultures",
  description: "Hydra Brush Tool",
};

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
  .osc(() => zoomSlider.value(), 2, 1)
  .mask(
    synth[0]
      .shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
      .modulate(synth[0].noise(0.6, () => hyperSlider.value()))
      .diff(synth[0].src(synth[0].o0))
      //	.modulateScrollY(synth[0].osc(2))
      //	.modulate(synth[0].osc().rotate(),.11)
      .scale(0.72)
      .color(188, 25, 50)
    //	.luma(15)
  )
  .out();

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
  )
  .out();

synth[2]
  .osc(() => zoomSlider.value(), 1, 2)
  .kaleid()
  .mult(
    synth[2].osc(20, 0.001, 0).mask(
      synth[2].shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
    )
  )
  // .rotate(1.58)
  // .blend(synth[2].src(synth[2].o0), 0.94)
  .modulateScale(synth[2].osc(10, 0), -0.03)
  .modulate(synth[2].noise(0.6, () => hyperSlider.value()))
  .scale(0.8, () => 1.05 + 0.1 * Math.sin(0.05 * time))
  .out();

synth[3]
  .osc(() => zoomSlider.value(), 0.28, 0.3)
  .rotate(0, 0.1)
  .mask(
    synth[3]
      .shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
      .mult(synth[3].osc(10, 0.1))
      .modulate(synth[3].osc(10).rotate(0, -0.1), 1)
  )
  .modulate(synth[3].noise(0.6, () => hyperSlider.value()))
  .color(2.83, 0.91, () => hyperSlider.value() * 50)
  .out();

synth[4]
  .osc(() => zoomSlider.value(), 0.28, 0.3)
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
  .osc(() => zoomSlider.value() / 5, 1, 0.3)
  .kaleid([3, 4, 5, 7, 8, 9, 10].fast(0.1))
  .color(0.5, 0.3)
  .colorama(0.4)
  .rotate(0.009, () => Math.sin(time) * -0.001)
  .modulateRotate(synth[1].src(synth[1].o0), () => Math.sin(time) * 0.003)
  .modulate(synth[1].src(synth[1].o0), 0.9)
  .mask(
    synth[5]
      .shape(
        () => shapeSlider.value(),
        () => sizeSlider.value(),
        0.01
      )
      .scale(0.9)
      .modulate(synth[5].noise(0.6, () => hyperSlider.value()))
  )
  .out();

synth[6].voronoi(8, 1);
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
  .solid(() => backgroundSlider.value) //sel.value also works??? but just black????
  //.solid(() => 0, 0, 0, 0)
  //.solid(0, 0, 0, 0) // Ensure full transparency
  .mask(
    synth[7].shape(
      () => shapeSlider.value(),
      () => sizeSlider.value(),
      0.01
    )
  )
  .out();

// sandbox - stop

function setup() {
  createCanvas(windowWidth, windowHeight);

  buildGUI();

  background(0);
  noStroke();

  cleverlayer = createGraphics(width, height);

  imageMode(CENTER);
  cleverlayer.imageMode(CENTER);

  // prep synth layers
  for (let i = 0; i < synthCount; i++) {
    pg[i] = createGraphics(hc[i].width, hc[i].height);
  }
}

function draw() {
  // grab + apply hydra textures

  //	pgSel = 1

  background(backgroundSlider.value());

  //	clear()

  pg[pgSel].clear();
  pg[pgSel].drawingContext.drawImage(
    hc[pgSel],
    0,
    0,
    pg[pgSel].width,
    pg[pgSel].height
  );

  if (mouseIsPressed) {
    if (pgSel == 7) {
      // Activate erase mode for synth[7]
      cleverlayer.erase();
      cleverlayer.image(pg[pgSel], mouseX, mouseY);
      cleverlayer.noErase();
    } else {
      cleverlayer.image(pg[pgSel], mouseX, mouseY);
    }
  }
  image(cleverlayer, width / 2, height / 2);
  image(pg[pgSel], mouseX, mouseY);
}

function buildGUI() {
  let guiWrapper = createDiv("").class("guiWrapper");
  let guiContent = createDiv("").parent(guiWrapper).class("guiContent");

  let guiInfo = createDiv("").parent(guiContent).class("guiInfo");
  createDiv("QZs p5*hydra brushes").parent(guiInfo).class("title");

  let trashButton = createDiv("trash")
    .parent(guiInfo)
    .class("trashButton button");
  trashButton.mousePressed(clearCanvas);

  let saveButton = createDiv("save").parent(guiInfo).class("saveButton button");
  saveButton.mousePressed(saveCanvas);

  createDiv("add").parent(guiInfo).class("addButton button");
  createDiv("print").parent(guiInfo).class("printButton button");
  createDiv("?").parent(guiInfo).class("infoButton button");

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
  sel.option("losing my religion", 0);
  sel.option("smells like teen spirit", 1);
  sel.option("poison paradise", 2);
  sel.option("whenever wherever", 3);
  sel.option("to the left, to the left", 4);
  sel.option("ground control to major tom", 5);
  sel.option("it is too late to apologize", 6);
  sel.option("she wants to erase me", 7);

  sel.changed(function () {
    pgSel = sel.value();
  });

  //	label('QZs HYDRA BRUSHES')
  //	label('––––––––––––––––––––')

  label("background", sliderBackground);
  backgroundSlider = createSlider(0, 255, 255, 1)
    .parent(sliderBackground)
    .class("slider");

  label("hydra zoom", sliderHydraZoom);
  zoomSlider = createSlider(10, 255, 10, 0)
    .parent(sliderHydraZoom)
    .class("slider");

  label("brush size", sliderBrushSize);
  sizeSlider = createSlider(0.1, 1, 0.5, 0.001)
    .parent(sliderBrushSize)
    .class("slider");

  label("brush shape", sliderBrushShape);
  shapeSlider = createSlider(3, 12, 50, 0.001)
    .parent(sliderBrushShape)
    .class("slider");

  label("hyper active", sliderHyperActive);
  hyperSlider = createSlider(0.5, 10, 3, 0.05)
    .parent(sliderHyperActive)
    .class("slider");

  // Set the selected option to "brush1".
  sel.selected("title of brush0", 0);

  // label("=======> <=======");
  // let clearButton = createButton("trash me").parent(guiContent).class("slider");
  // clearButton.mousePressed(clearCanvas);

  function clearCanvas() {
    cleverlayer.clear();
    background(0);
  }

  // label("SAVE");
  // let saveButton = createButton("save me").parent(guiContent).class("slider");
  // saveButton.mousePressed(saveCanvas);

  function saveCanvas() {
    var filename = "qz-hydra-brush.png";
    cleverlayer.save(filename);
  }

  function saveFrame(toolName) {
    // don't change:
    let timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);
    var filename = toolName + "_" + timestamp + ".png"; // with timestamp
    //var filename = toolName + '.png'; // without timestamp

    // adjust as needed, but leave 'filename':
    // save(filename);  // use to save entire canvas
    cleverlayer.save(filename); // use to save specific layer only
  }

  function label(txt, parent) {
    createDiv(txt).parent(parent).class("label");
  }
}
