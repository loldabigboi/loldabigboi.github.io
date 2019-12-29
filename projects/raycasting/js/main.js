
let obstacles, lightSource, pause;
let lastFrame = Date.now(), lastFPSCheck = 0, fps = 0;

// sliders
let fovSlider, radiusSlider;
function setup() {

    /** DOM CODE */

    let cnvWidth = 800,
        cnvHeight = 600;

    let cnv = createCanvas(cnvWidth, cnvHeight);
    cnv.parent(document.getElementById("canvas-container"));

    /** END DOM CODE */

    obstacles = [ 
        
        Obstacle.createRectangle(new Vector2(width/1.2, height/2), 100, 100, 1, true),
        Obstacle.createRectangle(new Vector2(width/4, height/3), 100, 50, Math.PI/6, true),
        Obstacle.createRectangle(new Vector2(400, 50), 100, 100, Math.PI/4, false),
        Obstacle.createRandom(new Vector2(450, 300), 80, 6, 20)
    
    ];

    for (let i = 0; i < 4; i++) {

        let line = new Line(new Vector2( Math.random() * width, Math.random() * height ),
                            new Vector2( Math.random() * width, Math.random() * height ) );

        obstacles.push( new Obstacle( [line], false ));

    }

    lightSource = new LightSource(new Vector2(width/2, height/2), 100, 200, 1500, 0, Math.PI / 4, Math.PI/2, 0.25, "rgba(0,255,100,0.5)");

    pause = false;

}

function draw() {

    if (pause) {
        noStroke();
        fill(255);
        rect(width-100, 0, 100, 75);
    }

    if (!pause) {

        background(255);

        // MOVEMENT //

        if (keyIsDown(87)) {  // W
            lightSource.move(new Vector2(0, -2));
        } else if (keyIsDown(83)) {  // S
            lightSource.move(new Vector2(0, 2));
        }

        if (keyIsDown(65)) {  // A
            lightSource.move(new Vector2(-2, 0));
        } else if (keyIsDown(68)) {  // D
            lightSource.move(new Vector2(2, 0));
        }

        // FOV AND FOV RADiUS //

        if (keyIsDown(69)) {  // E
            lightSource.changeFovBy(0.05);
        } else if (keyIsDown(81)) {  // Q
            lightSource.changeFovBy(-0.05);
        }

        if (keyIsDown(38)) {  // ARROW UP
            lightSource.changeRadiusBy(2);
        } else if (keyIsDown(40)) {  // ARROW DOWN
            lightSource.changeRadiusBy(-2);
        }

        let mousePos = new Vector2(mouseX, mouseY);
        lightSource.faceTowards(mousePos);
        
        for (let obstacle of obstacles) {
            obstacle.render();
        }

        lightSource.update(obstacles);
        lightSource.render();

    }

    // draw mouse coords for debugging
    noStroke();
    fill(0);
    text("x: " + mouseX + ", y: " + mouseY, width-100, 50);

    // draw FPS
    let time = Date.now();
    if (time - lastFPSCheck > 250) {
        fps = 1000 / (time - lastFrame);
        lastFPSCheck = time;
    }
    lastFrame = time;

    text(Math.round(fps), width-100, 65);

}

function keyPressed() {
    
    if (keyCode === 90) {  // Z
        lightSource.toggleDebug();
    } else if (keyCode === 88) {  // X
        pause = !pause;  // toggle pause
    }

}

// let user change view radius using scroll wheel
function mouseWheel(event) {

    lightSource.changeRadiusBy(-event.delta / 5);

}

