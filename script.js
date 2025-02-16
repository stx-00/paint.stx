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
      .repeat(2, 4)
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
    code: `voronoi(2, 0.5, 0.3);
osc(() => zoomSlider.value(), 2, 1)
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
// ()=>sizeSlider.value()
// ()=>shapeSlider.value()
// ()=>rotateSlider.value()
// ()=>zoomSlider.value()
// ()=>hyperSlider.value()

///////////////////////////////////////

osc(5)
.mask(shape((100))) 
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
  myCode: `// code hydra in here! 
// https://hydra.ojack.xyz/functions/

// use these to plug in sliders:
// ()=>sizeSlider.value()
// ()=>shapeSlider.value()
// ()=>rotateSlider.value()
// ()=>zoomSlider.value()
// ()=>hyperSlider.value()

///////////////////////////////////////

osc(5)
.mask(shape((100))) 
.out()`,
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
  background(darkMode ? 0 : 255);

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

  let title = createDiv("STX paint").parent(column1).class("title");
  title.style("cursor", "pointer");
  title.mousePressed(() => {
    sInteractingWithGUI = true;
    window.location.reload();
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  title.mouseOver(() => (isInteractingWithGUI = true));
  title.mouseOut(() => (isInteractingWithGUI = false));

  let infoButton = createDiv("?").parent(column1).class("button");
  let infoText;

  infoButton.mousePressed(() => {
    isInteractingWithGUI = true;
    if (!infoText) {
      infoText = createDiv(
        'STX paint lets you draw with brushes built using <a href="https://p5js.org/" target="_blank" style="color: #000000; text-decoration: underline;">p5.js</a> and <a href="https://hydra.ojack.xyz/" target="_blank" style="color: #000000; text-decoration: underline;">hydra</a>.<br><br>Hate your sketch? Trash it.<br>Love your sketch? Save it to download as an image.<br><br>Want to fill a sketchbook? Add your drawing to the print queue.<br>Keep drawing as many pages as you like, then hit print.<br><br>This tool was designed and built by <a href="https://www.siiritaennler.ch/" target="_blank" style="color: #000000; text-decoration: underline;">Siiri Tännler</a> and mentored by <a href="https://teddavis.org/" target="_blank" style="color: #000000; text-decoration: underline;">Ted Davis</a>.<br><br>A first version of this tool was created in collaboration with Sarah Choi and Yevheniia Semenova during a class taught by Ted Davis at IDCE HGK/FHNW.<br><br><a href="https://github.com/stx-00/p5-hydra-brush-tool" target="_blank" style="color: #000000; text-decoration: underline;">GitHub</a>'
      )
        .parent(guiContent)
        .class("infoText");

      const column2Position = column2.elt.getBoundingClientRect();
      infoText.style("left", column2Position.left + "px");
      infoText.style("display", "block");

      infoText.mouseOver(() => (isInteractingWithGUI = true));
      infoText.mouseOut(() => (isInteractingWithGUI = false));
    } else {
      infoText.style(
        "display",
        infoText.style("display") === "none" ? "block" : "none"
      );
    }
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  infoButton.mouseOver(() => (isInteractingWithGUI = true));
  infoButton.mouseOut(() => (isInteractingWithGUI = false));

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
    var filename = "STX-paint-sketch.png";
    cleverlayer.save(filename);
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
    if (printQueue.length === 0) {
      alert("add drawings to the print queue!");
      setTimeout(() => {
        isInteractingWithGUI = false;
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
          <title>p5*hydra paint print queue</title>
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
                height: 100vh; /* Full viewport height for centering */
                page-break-after: always; /* Ensure each drawing is on its own page */
              }
  
              img {
                max-width: 100%;
                max-height: 100%; /* Prevent images from overflowing the page */
              }
  
              @page {
                size: A4 ${
                  isPortrait ? "portrait" : "landscape"
                }; /* Dynamic page size */
                margin: 3mm; /* Remove margins for full-page centering */
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
          <img src="${item}" alt="p5*hydra painting">
        </div>
      `);
    });

    // Close the HTML structure
    printDocument.write(`
      </body>
      <script>
        window.addEventListener('afterprint', function() {
          window.close();
        });

        setTimeout(() => {
          if (!document.hidden) {
            window.close();
          }
        }, 500);
      </script>
    </html>
  `);
    printDocument.close();

    // Automatically trigger the print dialog
    printWindow.print();

    // Clear the print queue after printing
    printQueue = [];
    updatePrintCounter(printButton); // Update the counter after clearing
    setTimeout(() => {
      isInteractingWithGUI = false;
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

  let darkToggle = createDiv("dark").parent(column1).class("button");
  darkToggle.mousePressed(() => {
    isInteractingWithGUI = true;
    darkMode = !darkMode;
    document.body.classList.toggle("dark-mode");
    darkToggle.html(darkMode ? "light" : "dark");
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });
  darkToggle.mouseOver(() => (isInteractingWithGUI = true));
  darkToggle.mouseOut(() => (isInteractingWithGUI = false));

  ///////////////////////////////////////////// COLUMN 2 /////////////////////////////////////////////

  let column2 = createDiv("").parent(guiContent).class("column2");

  let selectWrapper = createDiv("").parent(column2).class("selectWrapper");

  label("brush", selectWrapper);
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
  let toggleButton = createDiv("+ show").parent(column3).class("toggleButton");

  toggleButton.mousePressed(() => {
    isInteractingWithGUI = true;
    let isHidden = editorWrapper.style("display") === "none";
    editorWrapper.style("display", isHidden ? "block" : "none");
    toggleButton.html(isHidden ? "- hide" : "+ show");
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

  let sliderToggle = createDiv("+ adjust").class("slider-toggle button");
  sliderToggle.parent(guiContent);
  sliderToggle.mousePressed(() => {
    isInteractingWithGUI = true;
    let isHidden = !column4.elt.classList.contains("show");
    column4.elt.classList.toggle("show");
    sliderToggle.html(isHidden ? "- adjust" : "+ adjust");
    setTimeout(() => {
      isInteractingWithGUI = false;
    }, 100);
  });

  sliderToggle.mouseOver(() => (isInteractingWithGUI = true));
  sliderToggle.mouseOut(() => (isInteractingWithGUI = false));

  let column4 = createDiv("").parent(guiContent).class("column4");

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

  // set all sliders from local storage
  mySelect.value(settings.index);
  updateEditor();
}
