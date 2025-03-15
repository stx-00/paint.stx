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
let isInteractingWithGUI = false; // to disable drawing while using GUI
let printQueue = []; // for adding to print queue
let queueCounter;
let darkMode = false;

const customBrush = "↓ make your own";

////////////////////////////////// MY BRUSHES ///////////////////////////////////////////////

let myBrushes = [
  {
    name: "↓ prismatic pulse",
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
        0.5,
        0.01
      )
      .scale(0.9)
      .modulate(noize(0.6, () => hyperSlider.value()))
      .rotate(() => rotateSlider.value(), () => rotateSlider.value() / 5)
  ).out()`,
  },
  {
    name: "↓ acid loop",
    code: `voronoi(() => zoomSlider.value(), 0, 1)
    .mult(
    osc(10, 0.1, () => hyperSlider.value() * 3)
    .saturate(3)
    .kaleid(200)
    )
    .mask(
    shape(() => shapeSlider.value(), 0.5, 0.01)
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
    name: "↓ cotton candy cascade",
    code: `osc(() => zoomSlider.value(), 0.28, 0.3)
  .mask(
    shape(
        () => shapeSlider.value(),
        0.5,
        0.01
      )
      .modulate(osc(10).rotate(0, -0.1), 1)
      .rotate(
        () => rotateSlider.value(),
        () => rotateSlider.value() / 15
      )
  )
  .modulate(noize(0.6, () => hyperSlider.value()))
  .color(2.83, 0.91, () => hyperSlider.value() * 50)
  .out()`,
  },
  {
    name: "↓ spectrum serpent",
    code: `osc(() => zoomSlider.value(), 1, 2)
  .kaleid()
  .mult(
    osc(5, 0.001, 0)
      .mask(
        shape(
          () => shapeSlider.value(),
          0.5,
          0.01
        )
      )
      .rotate(
        () => rotateSlider.value(),
        () => rotateSlider.value()
      )
  )
  .modulateScale(osc(10, 0), -0.03)
  .modulate(noize(0.6, () => hyperSlider.value()))
  .scale(0.8, () => 1.05 + 0.1 * Math.sin(0.05 * time))
  .out()`,
  },
  {
    name: "↓ electric fern",
    code: `osc(() => zoomSlider.value(), 2, 3)
  .modulateScale(osc(40, 0, 1).kaleid(8))
  .mask(
    shape(
        () => shapeSlider.value(),
        0.5,
        0.01
      )
      .repeat(2, 2)
      .modulate(noize(0.6, () => hyperSlider.value()))
      .rotate(
        () => rotateSlider.value() / 50,
        () => rotateSlider.value() / 50
      )
  )
  .out()`,
  },
  {
    name: "↓ canyon breeze",
    code: `osc(() => zoomSlider.value(), 0.25, 0.25)
  .rotate(0, 0.1)
  .rotate(() => rotateSlider.value())
.saturate( 4 )
.layer(gradient().r())
  .mask(
    shape(
        () => shapeSlider.value(),
        0.5,
        0.1
      )
      .modulate(noize(4.6, () => hyperSlider.value()))
      .scale(0.72)
      .luma(1)
      .saturate(5)
      .rotate(
        () => rotateSlider.value(),
        () => rotateSlider.value()
      )
  )
  .out()`,
  },
  {
    name: "↓ ocean flame",
    code: `osc(() => zoomSlider.value(), 2, 1)
  .mask(
    shape(
        () => shapeSlider.value(),
        0.5,
        0.01
      )
      .mult(
        osc(10, 0.1, () => Math.sin(time) * 3)
          .saturate(3)
          .kaleid(200)
      )
      .modulate(src(o0), 0.5)
      .modulate(noize(0.6, () => hyperSlider.value()))
      .add(src(o0), 0.8)
      .scrollY(-0.01)
      .scale(0.99)
      .modulate(voronoi(8, 1), 0.008)
      .luma(0.3)
      .rotate(
        () => rotateSlider.value(),
        () => rotateSlider.value() / 2
      )
  )
  .out()`,
  },
  {
    name: "↓ technicolor bloom",
    code: `noize(() => zoomSlider.value(), 0.5, 1)
  .color(
    () => Math.sin(time * Math.random()) * 0.5 + 0.5,
    () => Math.cos(time * Math.random()) * 0.5 + 0.5,
    () => Math.sin(time * Math.random() * 1.5) * 0.5 + 0.5
  )
  .rotate(0.009, () => Math.sin(time) * 1)
  .saturate(10)
  .mask(
    shape(
        () => shapeSlider.value(),
        0.5,
        0.01
      )
      .modulate(src(o0), 0.5)
      .modulate(noize(0.6, () => hyperSlider.value()))
      .mult(
        voronoi(10, 0.1, () => Math.sin(time) * 3)
          .saturate(3)
          .shift(0.5)
      )
      .modulateRotate(src(o0), () => Math.sin(time) * 2)
      .scrollX(10)
      .scrollY(2)
      .color(0.5, 0.8, 50)
      .luma()
      .repeatX(1)
      .repeatY(1)
      .rotate(
        () => rotateSlider.value(),
        () => rotateSlider.value()
      )
  )
  .out()`,
  },
  {
    name: customBrush,
    code: `// code hydra in here! 
// https://hydra.ojack.xyz/functions/
// use noize() instead of noise() 

// use these to plug in sliders:
// ()=>shapeSlider.value()
// ()=>rotateSlider.value()
// ()=>zoomSlider.value()
// ()=>hyperSlider.value()

///////////////////////////////////////

osc(5)
.mask(shape(100)) 
.out()`,
  },
];

let defaultSettings = {
  index: 0,
  sizeSlider: 0.4,
  shapeSlider: 30,
  rotateSlider: 0,
  zoomSlider: 15,
  hyperSlider: 3,
  darkMode: false,
  myCode: `// code hydra in here! 
// https://hydra.ojack.xyz/functions/
// use noize() instead of noise() 

// use these to plug in sliders:
// ()=>shapeSlider.value()
// ()=>rotateSlider.value()
// ()=>zoomSlider.value()
// ()=>hyperSlider.value()

///////////////////////////////////////

osc(5)
.mask(shape(100)) 
.out()`,
};

//////////////////////////////// LOCAL STORAGE /////////////////////////////////////////////////

let settings = JSON.parse(JSON.stringify(defaultSettings)); // this is clone JS object

if (localStorage.hasOwnProperty("paintSettings")) {
  tempSettings = JSON.parse(localStorage.getItem("paintSettings"));
  for (const [key, value] of Object.entries(tempSettings)) {
    settings[key] = value;
  }
  darkMode = settings.darkMode;
  if (darkMode) {
    document.body.classList.add("dark-mode");
    const themeColorMeta = document.querySelector("#theme-color");
    themeColorMeta.setAttribute("content", "#000000");
  }
} else {
  localStorage.setItem("paintSettings", JSON.stringify(defaultSettings));
}

function saveSettings() {
  localStorage.setItem("paintSettings", JSON.stringify(settings));
}

/////////////////////////////////// SETUP //////////////////////////////////////////////

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

  resetIdleTimer(); // for screensaver mode
}

/////////////////////////////////// DRAW //////////////////////////////////////////////

function draw() {
  clear();
  background(darkMode ? 0 : 255);

  scl = sizeSlider.value();

  // Display layers
  image(cleverlayer, width / 2, height / 2);

  if (!idle) {
    image(pg, mouseX, mouseY, pg.width * scl, pg.height * scl);
  }

  // Update Hydra texture
  pg.clear();
  pg.drawingContext.drawImage(hc, 0, 0, pg.width, pg.height);

  // Draw Hydra texture as brush when the mouse is pressed
  if (mouseIsPressed && !isInteractingWithGUI) {
    cleverlayer.image(pg, mouseX, mouseY, pg.width * scl, pg.height * scl);
  }
}

/////////////////////////////////////////////////////////////////////////////////
// for not drawing on mobile while interacting with GUI

function addTouchListeners(element) {
  element.touchStarted(() => {
    isInteractingWithGUI = true;
  });

  element.touchEnded(() => {
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });

  element.elt.addEventListener("touchcancel", () => {
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
}

/////////////////////////////////////////////////////////////////////////////////
// for detecting safari on desktop (and its issues)

function isDesktopSafari() {
  const ua = navigator.userAgent;
  return (
    !ua.match(/iPhone|iPad|iPod|Android/i) && // Not mobile
    ua.indexOf("Safari") !== -1 &&
    ua.indexOf("Chrome") === -1
  ); // Safari but not Chrome
}

function buildGUI() {
  let guiWrapper = createDiv("").class("guiWrapper");
  let guiContent = createDiv("").parent(guiWrapper).class("guiContent");

  function label(txt, parent) {
    createDiv(txt).parent(parent).class("label");
  }

  /////////////////////////////////////////// TOGGLE STATES ///////////////////////////////////////////

  let toggleStates = {
    info: false,
    code: false,
    sliders: false,
  };

  function closeOtherToggles(exceptToggle) {
    if (exceptToggle !== "info" && toggleStates.info && infoText) {
      infoText.style("display", "none");
      toggleStates.info = false;
    }

    if (exceptToggle !== "code" && toggleStates.code) {
      editorWrapper.style("display", "none");
      if (window.innerWidth <= 850) {
        toggleButton.html("+ show code");
      } else {
        toggleButton.html("+ show");
      }
      toggleStates.code = false;
    }

    if (exceptToggle !== "sliders" && toggleStates.sliders) {
      column4.elt.classList.remove("show");
      sliderToggle.html("+ adjust");
      toggleStates.sliders = false;
    }
  }

  ///////////////////////////////////////////// COLUMN 1 /////////////////////////////////////////////

  let column1 = createDiv("").parent(guiContent).class("column1");

  let title = createDiv("paint.stx").parent(column1).class("title");

  let darkToggle = createDiv("dark").parent(column1).class("button");
  darkToggle.html(darkMode ? "light" : "dark");
  darkToggle.mousePressed(() => {
    isInteractingWithGUI = true;
    darkMode = !darkMode;
    settings.darkMode = darkMode;
    saveSettings();
    document.body.classList.toggle("dark-mode");
    darkToggle.html(darkMode ? "light" : "dark");
    const themeColorMeta = document.querySelector("#theme-color");
    themeColorMeta.setAttribute("content", darkMode ? "#000000" : "#FFFFFF");
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  darkToggle.mouseOver(() => (isInteractingWithGUI = true));
  darkToggle.mouseOut(() => (isInteractingWithGUI = false));

  let infoButton = createDiv("?").parent(column1).class("button");
  let infoText;

  infoButton.mousePressed(() => {
    isInteractingWithGUI = true;
    if (!infoText) {
      infoText = createDiv(
        'paint.stx is a drawing tool combining <a href="https://hydra.ojack.xyz/" target="_blank" style="color: #000000; text-decoration: underline;">hydra</a> and <a href="https://p5js.org/" target="_blank" style="color: #000000; text-decoration: underline;">p5.js</a> to create custom brushes<br><br>select a brush and adjust its appearance with the sliders<br>or live code the brush in the editor (+ show)<br><br>love your drawing? → save (to download as png)<br>want to share it with us? → submit<br>hate it? → trash<br><br>want to fill a sketchbook? → add your drawing to the print queue<br>ready to print? → print<br><br>this tool was designed and developed by <a href="https://www.siiritaennler.ch/" target="_blank" style="color: #000000; text-decoration: underline;">Siiri Tännler</a> and mentored by <a href="https://teddavis.org/" target="_blank" style="color: #000000; text-decoration: underline;">Ted Davis</a><br><br>a first version of this tool was created in collaboration with Sarah Choi and Yevheniia Semenova during a class on making tools with p5.js and hydra, taught by Ted Davis at <a href="https://www.fhnw.ch/en/degree-programmes/art-and-design/master-of-arts/master-of-arts-fhnw-in-design-digital-communication-environments" target="_blank" style="color: #000000; text-decoration: underline;">IDCE MA HGK/FHNW</a><br><br><a href="https://github.com/stx-00/paint.stx" target="_blank" style="color: #000000; text-decoration: underline;">GitHub</a>'
      )
        .parent(guiContent)
        .class("infoText");

      const column2Position = column2.elt.getBoundingClientRect();
      infoText.style("left", column2Position.left + "px");
      infoText.style("display", "block");
      toggleStates.info = true;
      closeOtherToggles("info");

      infoText.mouseOver(() => (isInteractingWithGUI = true));
      infoText.mouseOut(() => (isInteractingWithGUI = false));

      // adding touch handling for all links inside the info text
      let links = infoText.elt.getElementsByTagName("a");
      for (let link of links) {
        link.addEventListener("touchstart", () => {
          isInteractingWithGUI = true;
        });
        link.addEventListener("touchend", () => {
          setTimeout(() => {
            isInteractingWithGUI = false;
          }, 100);
        });
        link.addEventListener("touchcancel", () => {
          setTimeout(() => {
            isInteractingWithGUI = false;
          }, 100);
        });
      }
    } else {
      const willBeVisible = infoText.style("display") === "none";
      if (willBeVisible) {
        closeOtherToggles("info");
      }
      infoText.style("display", willBeVisible ? "block" : "none");
      toggleStates.info = willBeVisible;
    }
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  infoButton.mouseOver(() => (isInteractingWithGUI = true));
  infoButton.mouseOut(() => (isInteractingWithGUI = false));

  let saveButton = createDiv("save").parent(column1).class("button");
  saveButton.mousePressed(() => {
    isInteractingWithGUI = true;
    saveCanvas();
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  saveButton.mouseOver(() => (isInteractingWithGUI = true));
  saveButton.mouseOut(() => (isInteractingWithGUI = false));

  function saveCanvas() {
    var filename = "paint.stx_" + timeStamp() + ".png";
    cleverlayer.save(filename);
  }

  let submitButton = createDiv("submit").parent(column1).class("button");
  submitButton.mousePressed(() => {
    isInteractingWithGUI = true;
    layerShare(cleverlayer);
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  submitButton.mouseOver(() => (isInteractingWithGUI = true));
  submitButton.mouseOut(() => (isInteractingWithGUI = false));

  let trashButton = createDiv("trash").parent(column1).class("button");
  trashButton.mousePressed(() => {
    isInteractingWithGUI = true;
    clearCanvas();
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  trashButton.mouseOver(() => (isInteractingWithGUI = true));
  trashButton.mouseOut(() => (isInteractingWithGUI = false));

  function clearCanvas() {
    cleverlayer.clear();
  }

  let addButton = createDiv("add").parent(column1).class("button");
  addButton.mousePressed(() => {
    isInteractingWithGUI = true;
    const canvasData = cleverlayer.canvas.toDataURL(); // Convert canvas to image data
    printQueue.push(canvasData); // Add the image to the print queue
    updatePrintCounter(printButton); // Update the counter
    clearCanvas(); // Clear the canvas after adding
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  addButton.mouseOver(() => (isInteractingWithGUI = true));
  addButton.mouseOut(() => (isInteractingWithGUI = false));

  let printButton = createDiv("print").parent(column1).class("button");
  printButton.mousePressed(() => {
    isInteractingWithGUI = true;
    mouseIsPressed = false;

    if (printQueue.length === 0) {
      alert("add drawings to the print queue!");
      setTimeout(() => {
        isInteractingWithGUI = false;
        mouseIsPressed = false;
      }, 100);
      return;
    }

    // Detect device orientation
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;

    // Open a new window for printing
    const printWindow = window.open("", "_blank", "width=800,height=600");
    const printDocument = printWindow.document;

    // Write the basic HTML structure into the print window
    printDocument.write(`
      <html>
        <head>
          <title>paint.stx print queue</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
  
              .page {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh; 
                page-break-after: always; 
              }
  
              img {
                max-width: 100%;
                max-height: 100%; 
              }
  
              @page {
                size: A4 ${isPortrait ? "portrait" : "landscape"}; 
                margin: 3mm; 
              }
            }
          </style>
        </head>
        <body>
    `);

    // Add each drawing wrapped in a centered container
    printQueue.forEach((item) => {
      printDocument.write(`
        <div class="page">
          <img src="${item}" alt="paint.stx">
        </div>
      `);
    });

    // Close the HTML structure
    printDocument.write(`
      </body>
      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
            if (!document.hidden) {
              window.close();
            }
          }, 500);
        };
      </script>
    </html>
  `);
    printDocument.close();

    setTimeout(() => {
      isInteractingWithGUI = false;
      mouseIsPressed = false;
    }, 100);
  });
  printButton.mouseOver(() => (isInteractingWithGUI = true));
  printButton.mouseOut(() => (isInteractingWithGUI = false));

  function updatePrintCounter(printButton) {
    if (printQueue.length > 0) {
      printButton.html(`print (${printQueue.length})`); // Show the counter if there are drawings
    } else {
      printButton.html("print"); // Remove the counter when the queue is empty
    }
  }

  let clearQueueButton = createDiv("clear").parent(column1).class("button");
  clearQueueButton.mousePressed(() => {
    isInteractingWithGUI = true;
    if (printQueue.length === 0) {
      alert("print queue is already empty!");
      setTimeout(() => {
        isInteractingWithGUI = false;
      }, 100);
      return;
    }

    // Clear the queue
    printQueue = [];
    updatePrintCounter(printButton);

    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  clearQueueButton.mouseOver(() => (isInteractingWithGUI = true));
  clearQueueButton.mouseOut(() => (isInteractingWithGUI = false));

  ///////////////////////////////////////////// COLUMN 2 /////////////////////////////////////////////

  let column2 = createDiv("").parent(guiContent).class("column2");

  let selectWrapper = createDiv("").parent(column2).class("selectWrapper");

  label("brush", selectWrapper);
  mySelect = createSelect().parent(selectWrapper).class("select");
  for (let i = 0; i < myBrushes.length; i++) {
    mySelect.option(myBrushes[i].name, i);
  }

  mySelect.elt.addEventListener("mousedown", () => {
    if (isDesktopSafari()) {
      mouseIsPressed = false;
    }
    isInteractingWithGUI = true;
  });

  mySelect.changed(() => {
    if (isDesktopSafari()) {
      mouseIsPressed = false;
    }

    settings.index = mySelect.value();
    saveSettings();
    updateEditor();

    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 300);
  });

  function updateEditor() {
    if (myBrushes[settings.index].name === customBrush) {
      // *** grab local storage
      myEditor.value(settings.myCode);
      editorWrapper.style("display", "block");
      toggleButton.html("- hide");
    } else {
      myEditor.value(myBrushes[settings.index].code);
    }
    updateBrush();
  }

  ///////////////////////////////////////////// COLUMN 3 /////////////////////////////////////////////

  let column3 = createDiv("").parent(guiContent).class("column3");

  let codeWrapper = createDiv("").parent(column3).class("codeWrapper");

  label("code", codeWrapper);
  let toggleText = window.innerWidth <= 850 ? "+ show code" : "+ show";
  let toggleButton = createDiv(toggleText)
    .parent(column3)
    .class("toggleButton");

  toggleButton.mousePressed(() => {
    isInteractingWithGUI = true;
    const willBeVisible = editorWrapper.style("display") === "none";

    if (willBeVisible) {
      closeOtherToggles("code");
    }

    editorWrapper.style("display", willBeVisible ? "block" : "none");
    if (window.innerWidth <= 850) {
      toggleButton.html(willBeVisible ? "- hide code" : "+ show code");
    } else {
      toggleButton.html(willBeVisible ? "- hide" : "+ show");
    }
    toggleStates.code = willBeVisible;

    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  toggleButton.mouseOver(() => (isInteractingWithGUI = true));
  toggleButton.mouseOut(() => (isInteractingWithGUI = false));

  let editorWrapper = createDiv("").parent(column3).class("editorWrapper");
  editorWrapper.style("display", "none"); // Initially hidden

  // Text editor for custom brush code
  myEditor = createElement("textarea").parent(editorWrapper).class("editor");
  myEditor.value(myBrushes[0].code);
  myEditor.input(() => {
    isInteractingWithGUI = true;
    if (myBrushes[settings.index].name === customBrush) {
      settings.myCode = myEditor.value();
      saveSettings();
    }
    updateBrush();
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });

  myEditor.mouseOver(() => (isInteractingWithGUI = true));
  myEditor.mouseOut(() => (isInteractingWithGUI = false));
  myEditor.mousePressed(() => {
    isInteractingWithGUI = true;
  });
  myEditor.mouseReleased(() => {
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });

  updateBrush();
  // update brush as a function

  function updateBrush() {
    eval(myEditor.value()); // Run text in editor as JS
  }

  ///////////////////////////////////////////// COLUMN 4 /////////////////////////////////////////////

  let column4 = createDiv("").parent(guiContent).class("column4");

  let sliderToggle = createDiv("+ adjust").class("slider-toggle button");
  sliderToggle.parent(column4);
  sliderToggle.mousePressed(() => {
    isInteractingWithGUI = true;
    const willBeVisible = !column4.elt.classList.contains("show");

    if (willBeVisible) {
      closeOtherToggles("sliders");
    }

    column4.elt.classList.toggle("show");
    sliderToggle.html(willBeVisible ? "- adjust" : "+ adjust");
    toggleStates.sliders = willBeVisible;

    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });

  sliderToggle.mouseOver(() => (isInteractingWithGUI = true));
  sliderToggle.mouseOut(() => (isInteractingWithGUI = false));

  let sizeHolder = createDiv("").parent(column4).class("sliderWrapper");
  let shapeHolder = createDiv("").parent(column4).class("sliderWrapper");
  let rotateHolder = createDiv("").parent(column4).class("sliderWrapper");
  let zoomHolder = createDiv("").parent(column4).class("sliderWrapper");
  let hyperHolder = createDiv("").parent(column4).class("sliderWrapper");

  label("size", sizeHolder);
  sizeSlider = createSlider(0.1, 1, 0.4, 0.001)
    .parent(sizeHolder)
    .class("slider");

  label("shape", shapeHolder);
  shapeSlider = createSlider(5, 40, settings.shapeSlider, 0)
    .parent(shapeHolder)
    .class("slider");
  shapeSlider.input(() => {
    isInteractingWithGUI = true;
    settings.shapeSlider = shapeSlider.value();
    saveSettings();
  });

  label("rotate", rotateHolder);
  rotateSlider = createSlider(0, 10, settings.rotateSlider, 0)
    .parent(rotateHolder)
    .class("slider");
  rotateSlider.input(() => {
    isInteractingWithGUI = true;
    settings.rotateSlider = rotateSlider.value();
    saveSettings();
  });

  label("zoom", zoomHolder);
  zoomSlider = createSlider(5, 70, settings.zoomSlider, 0)
    .parent(zoomHolder)
    .class("slider");
  zoomSlider.input(() => {
    isInteractingWithGUI = true;
    settings.zoomSlider = zoomSlider.value();
  });

  label("hyper", hyperHolder);
  hyperSlider = createSlider(0.5, 10, settings.hyperSlider, 0.05)
    .parent(hyperHolder)
    .class("slider");
  hyperSlider.input(() => {
    isInteractingWithGUI = true;
    settings.hyperSlider = hyperSlider.value();
  });

  // to not draw while using sliders

  function addSliderListeners(slider) {
    slider.mouseOver(() => (isInteractingWithGUI = true));
    slider.mouseOut(() => (isInteractingWithGUI = false));
    slider.mousePressed(() => {
      isInteractingWithGUI = true;
    });
    slider.mouseReleased(() => {
      // Add timeout when releasing the slider
      setTimeout(() => {
        isInteractingWithGUI = false;
      }, 100);
    });

    // Add touchend event for mobile
    slider.elt.addEventListener("touchend", () => {
      setTimeout(() => {
        isInteractingWithGUI = false;
      }, 100);
    });
  }

  addSliderListeners(sizeSlider);
  addSliderListeners(shapeSlider);
  addSliderListeners(rotateSlider);
  addSliderListeners(zoomSlider);
  addSliderListeners(hyperSlider);

  let buttons = selectAll(".button");
  buttons.forEach((button) => addTouchListeners(button));

  addTouchListeners(mySelect);
  addTouchListeners(toggleButton);
  addTouchListeners(myEditor);
  addTouchListeners(title);
  addTouchListeners(sliderToggle);
  addTouchListeners(infoButton);
  addTouchListeners(submitButton);
  addTouchListeners(printButton);
  addTouchListeners(clearQueueButton);

  [sizeSlider, shapeSlider, rotateSlider, zoomSlider, hyperSlider].forEach(
    (slider) => {
      addTouchListeners(slider);
    }
  );

  // set all sliders from local storage
  mySelect.value(settings.index);
  updateEditor();
}

//////////////////////////////////////// IMAGE SUBMIT ///////////////////////////////////////////

function layerShare(cleverlayer) {
  isInteractingWithGUI = true;
  mouseIsPressed = false;

  setTimeout(() => {
    // let consent = confirm("are you sure you want to submit this drawing?");
    let submitName = prompt("give your drawing a name", timeStamp());

    if (submitName) {
      let imgUrl = `https://api.imgbb.com/1/upload`;
      const body = new FormData();
      body.append("image", cleverlayer.elt.toDataURL().split(",").pop());
      body.append("name", "paint.stx_" + sanitize(submitName));
      body.append("key", "67651298af19d3695022df79faf0dead");

      fetch(imgUrl, {
        method: "POST",
        body: body,
      })
        .then((res) => res.json())
        .then((jsonObj) => {
          if (jsonObj.success) {
            mouseIsPressed = false;
            isInteractingWithGUI = false;

            setTimeout(() => {
              alert("thanks for submitting!");
              mouseIsPressed = false;
              isInteractingWithGUI = false;
            }, 100);
          } else {
            alert("upload failed :( please try again");
          }
        })
        .catch((err) => {
          alert("error uploading image :( please try again");
          mouseIsPressed = false;
          isInteractingWithGUI = false;
        });
    } else {
      mouseIsPressed = false;
      isInteractingWithGUI = false;
    }
  }, 50); // short delay before showing confirm dialog

  setTimeout(() => {
    mouseIsPressed = false;
    isInteractingWithGUI = false;
  }, 200);
}

function sanitize(str) {
  return str.toLowerCase().replace(/[^a-z0-9_\-üäïöë]/gi, "_");
}

function timeStamp(timeInput) {
  let d = new Date();
  d.setTime(d.getTime() - new Date().getTimezoneOffset() * 60 * 1000);
  if (timeInput != undefined) {
    d = new Date(timeInput * 1);
  }
  return d
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3);
}

//////////////////////////////////////////// SCREEN SAVER MODE //////////////////////////////////

let idleTimer;
let idleDrawingTimer;
let idle = false;
let idlePos = { x: 0, y: 0 };
let idleVelocity = { x: 0, y: 0 };
let angle = 0;

const IDLE_TIMEOUT = 60000; // Time before screensaver starts (60 seconds)
const IDLE_DURATION = 40000; // How long screensaver runs (40 seconds)
const MOVEMENT_SPEED = 3; // Base movement speed
const CURVE_INTENSITY = 0.1; // How curved the motion is
const RANDOM_FACTOR = 0.05; // Amount of randomness in motion
const ANGLE_CHANGE = 0.03; // Speed of direction change
const DRAW_INTERVAL = 50; // Delay between draws (ms)

function startIdleDrawing() {
  idle = true;
  noCursor();

  // Initialize position at current mouse location or random position
  idlePos.x = mouseX || random(width);
  idlePos.y = mouseY || random(height);

  // Set random initial velocity
  idleVelocity.x = random(-MOVEMENT_SPEED, MOVEMENT_SPEED);
  idleVelocity.y = random(-MOVEMENT_SPEED, MOVEMENT_SPEED);

  // Set timer to stop drawing
  idleDrawingTimer = setTimeout(stopIdleDrawing, IDLE_DURATION);
  drawCurvedPath();
}

function stopIdleDrawing() {
  idle = false;
  cursor();
  clearTimeout(idleDrawingTimer);
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (idle) {
    stopIdleDrawing();
  }
  idleTimer = setTimeout(startIdleDrawing, IDLE_TIMEOUT);
}

function drawCurvedPath() {
  if (!idle) return;

  // Update position
  idlePos.x += idleVelocity.x;
  idlePos.y += idleVelocity.y;

  // Add curved motion with randomness
  idleVelocity.x +=
    CURVE_INTENSITY * cos(angle) + random(-RANDOM_FACTOR, RANDOM_FACTOR);
  idleVelocity.y +=
    CURVE_INTENSITY * sin(angle) + random(-RANDOM_FACTOR, RANDOM_FACTOR);
  angle += random(ANGLE_CHANGE * 0.5, ANGLE_CHANGE * 1.5);

  // Bounce off canvas boundaries
  if (idlePos.x <= 0 || idlePos.x >= width) {
    idleVelocity.x *= -1;
    angle += PI / 2;
  }
  if (idlePos.y <= 0 || idlePos.y >= height) {
    idleVelocity.y *= -1;
    angle += PI / 2;
  }

  // Draw using current brush
  cleverlayer.image(pg, idlePos.x, idlePos.y, pg.width * scl, pg.height * scl);

  // Continue drawing loop
  setTimeout(drawCurvedPath, DRAW_INTERVAL);
}

// Event listeners for user activity
const resetEvents = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "touchmove",
];
resetEvents.forEach((event) => window.addEventListener(event, resetIdleTimer));
