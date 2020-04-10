let nnJson = loadFile("nn.json");

let neuralNetwork = NeuralNetwork.fromJSON(nnJson);

let firstGuessP;
let secondGuessP;
let thirdGuessP;

let mouseOverCanvas = false;

function setup() {

    let canvas = createCanvas(600, 600);
    canvas.mouseReleased(guess);
    canvas.mouseOver(function() {mouseOverCanvas = true});
    canvas.mouseOut(function() {mouseOverCanvas = false});
    canvas.parent("canvas-container");

    background(0);

    firstGuessP = document.getElementById("first-guess");
    secondGuessP = document.getElementById("second-guess");
    thirdGuessP = document.getElementById("third-guess");

}

function draw() {

    if (mouseIsPressed && mouseOverCanvas) {
        stroke(255);
        strokeWeight(28);
        line(pmouseX, pmouseY, mouseX, mouseY);

        resetGuessDisplay()
    }

}

function resetGuessDisplay() {

    // reset guess displays
    firstGuessP.innerText = `? - ??.??% probability`
    secondGuessP.innerText = `? - ??.??% probability`
    thirdGuessP.innerText = `? - ??.??% probability`

}

function keyReleased() {
    if (keyCode == 67) { // "C"
        clearCanvas();
    }
}

function clearCanvas() {
    background(0);
    resetGuessDisplay()
}

function guess() {
    
    // get pixels from canvas
    let img = get();
    img.resize(28, 28);
    img.filter(BLUR, 0.1);
    img.loadPixels();

    // convert to inputs (grayscale)
    let inputs = new Matrix(28, 28);

    for (let i = 0; i < img.pixels.length; i+= 4) {
        let grayscaleIndex = i/4,
            row = Math.floor(grayscaleIndex / 28),
            col = grayscaleIndex % 28;
        inputs.set(row, col, map(img.pixels[i], 0, 255, -0.5, 0.5));
    }

    // get bounds of digit
    let leftMost = Infinity, rightMost   = -Infinity,
        topMost  = Infinity, bottomMost  = -Infinity;
    for (let col = 0; col < inputs.cols; col++) {
        for (let row = 0; row < inputs.rows; row++) {
            if (inputs.get(row, col) > 0) {  // not completely black
                leftMost   = Math.min(col, leftMost);
                rightMost  = Math.max(col, rightMost);
                topMost    = Math.min(row, topMost);
                bottomMost = Math.max(row, bottomMost);
            }
        }
    }
    
    if (leftMost != Infinity) {  // if leftMost is still Infinity then the canvas is blank
        
        // move pixels to center digit
        let horizOffset = Math.trunc(-(leftMost - (27 - rightMost))/2),
            vertOffset  = Math.trunc(-(topMost  - (27 - bottomMost))/2);
        let newInputs = new Matrix(28, 28);
        for (let col = 0; col < inputs.cols; col++) {
            for (let row = 0; row < inputs.rows; row++) {
                
                let newCol = col - horizOffset,
                    newRow = row - vertOffset;

                if (newCol < 0 || newCol > 27 || newRow < 0 || newRow > 27) {
                    newInputs.set(row, col, 0)
                } else {
                    newInputs.set(row, col, inputs.get(newRow, newCol));
                }

            }
        }

        let size = Math.max(rightMost - leftMost, bottomMost - topMost);
        let desiredSize = 20;
        let scaleRatio = desiredSize / size;
        let scaledWidth  = 28 * scaleRatio,
            scaledHeight = 28 * scaleRatio;

        let centeredImage = createImage(28, 28);
        newInputs.forEach((val, row, col) => {
            centeredImage.set(row, col, color(val));
        });

        centeredImage.resize(scaledWidth, scaledHeight);
        let scaledImage = centeredImage.get(Math.floor(scaledWidth/2  - 14),
                                            Math.floor(scaledHeight/2 - 14));



        inputs = newInputs;

    }       
    
    // for (let i = 0; i < img.pixels.length; i+= 4) {
    //     let grayscaleIndex = i/4,
    //         row = Math.floor(grayscaleIndex / 28),
    //         col = grayscaleIndex % 28;
    //     inputs.set(row, col, map(img.pixels[i], 0, 255, -0.5, 0.5));
    // }

    let outputs = neuralNetwork.predict([inputs]).map((val, index) => {
        return {
            guess: index,
            probability: val
        }
    });

    let sortedOutputs = outputs.sort((a, b) => {
        return b.probability - a.probability;
    });

    // diplay guesses by updating corresponding paragraph elements
    firstGuessP.innerText = `${sortedOutputs[0].guess} - ${(sortedOutputs[0].probability*100).toFixed(2)}% probability`
    secondGuessP.innerText = `${sortedOutputs[1].guess} - ${(sortedOutputs[1].probability*100).toFixed(2)}% probability`
    thirdGuessP.innerText = `${sortedOutputs[2].guess} - ${(sortedOutputs[2].probability*100).toFixed(2)}% probability`


}
