let nnJson = loadFile("nn.json");
console.log(JSON.parse(nnJson));

let neuralNetwork = NeuralNetwork.fromJSON(nnJson);

let trainingImageBytes, trainingLabelBytes,
    testingImageBytes , testingLabelBytes;
let data;

function preload() {

    trainingImageBytes = loadBytes("train-images.idx3-ubyte");
    trainingLabelBytes = loadBytes("train-labels.idx1-ubyte");

    testingImageBytes = loadBytes("t10k-images.idx3-ubyte");
    testingLabelBytes = loadBytes("t10k-labels.idx1-ubyte");
    
}

function setup() {

    let canvas = createCanvas(600, 600);
    canvas.parent("canvas-container");
    background(0);

}

function draw() {


}

function resetGuessDisplay() {

    // reset guess displays
    const firstGuessP = document.getElementById("first-guess");
    const secondGuessP = document.getElementById("second-guess");
    const thirdGuessP = document.getElementById("third-guess");

    firstGuessP.innerText = `? - ??.??% probability`
    secondGuessP.innerText = `? - ??.??% probability`
    thirdGuessP.innerText = `? - ??.??% probability`

}

function mouseDragged() {

    stroke(255);
    strokeWeight(28);
    line(pmouseX, pmouseY, mouseX, mouseY);

    resetGuessDisplay()

}

function clearCanvas() {
    background(0);
    resetGuessDisplay()
}

function guess() {
    
    // get pixels from canvas
    let img = get();
    img.resize(28, 28);
    img.filter(BLUR, 0.2);
    img.loadPixels();

    // convert to inputs (grayscale)
    let inputs = new Matrix(28, 28);

    for (let i = 0; i < img.pixels.length; i+= 4) {
        let grayscaleIndex = i/4,
            row = Math.floor(grayscaleIndex / 28),
            col = grayscaleIndex % 28;
        inputs.set(row, col, map(img.pixels[i], 0, 255, -0.5, 0.5));
    }

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
    const firstGuessP = document.getElementById("first-guess");
    const secondGuessP = document.getElementById("second-guess");
    const thirdGuessP = document.getElementById("third-guess");

    firstGuessP.innerText = `${sortedOutputs[0].guess} - ${(sortedOutputs[0].probability*100).toFixed(2)}% probability`
    secondGuessP.innerText = `${sortedOutputs[1].guess} - ${(sortedOutputs[1].probability*100).toFixed(2)}% probability`
    thirdGuessP.innerText = `${sortedOutputs[2].guess} - ${(sortedOutputs[2].probability*100).toFixed(2)}% probability`


}
