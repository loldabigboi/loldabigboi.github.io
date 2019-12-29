
let vehicleList = [],
    foodList = [],
    poisonList = [];

let debug = false;

let lastEdibleSpawn = Date.now();
let originalEdibleSpawnInterval = 50;  // used as a reference when changing simulation speed
let edibleSpawnInterval = originalEdibleSpawnInterval; // ms

let iterationsPerLoop = 1;  // controlled by simulation speed slider
let remainingIterations = iterationsPerLoop;

// have spawn offset more than repulsion so vehicles are less likely to get trapped
// trying to get food on very edge of repulsion boundary
let spawnBoundaryOffset = 25,
    repulsionBoundaryOffset = 0;

function setup() {

    let canvas = createCanvas(800, 600);
    canvas.parent("canvas-container");
    initialiseEnvironment();

}

function initialiseEnvironment() {

    // generate initial vehicles
    vehicleList = [];
    for (let i = 0; i < 100; i++) {
        vehicleList.push(createEntity("vehicle"));

    }

    // generate initial food
    foodList = [];
    for (let i = 0; i < 250; i++) {
        foodList.push(createEntity("food"));

    }

    // generate initial poison
    poisonList = [];
    for (let i = 0; i < 100; i++) {
           poisonList.push(createEntity("poison"));
    }

}

function createEntity(type) {
    let x = spawnBoundaryOffset + Math.random() * (width - spawnBoundaryOffset * 2),
        y = spawnBoundaryOffset + Math.random() * (height - spawnBoundaryOffset * 2);
    if (type === "vehicle") {
        return new Vehicle(x, y);
    } else if (type === "food") {
        return new Food(x, y);
    } else if (type === "poison") {
        return new Poison(x, y);
    } else {
        throw new Error(`Invalid type '${type}' at createEntity()`);
    }

}

function draw() {

    background(255);

    while (remainingIterations >= 1) {

        let time = Date.now();
        if (time - lastEdibleSpawn > edibleSpawnInterval) {
    
            lastEdibleSpawn = time;
    
            if (Math.random() > 0.2) {
                foodList.push(createEntity("food"));
            } else {
                poisonList.push(createEntity("poison"));
            }
    
        }

        for (let i = foodList.length-1; i >= 0; i--) {
            let food = foodList[i];
            food.update(iterationsPerLoop);
            if (food.hasExpired()) {
                foodList.splice(foodList.indexOf(food), 1);
            }
        }
    
        for (let i = poisonList.length-1; i >= 0; i--) {
            let poison = poisonList[i];
            poison.update(iterationsPerLoop);
            if (poison.hasExpired()) {
                poisonList.splice(poisonList.indexOf(poison), 1);
            }
        }
    
        for (let i = vehicleList.length-1; i >= 0; i--) {
            
            let vehicle = vehicleList[i];
            let eatenObjects = vehicle.enactBehaviour(foodList, poisonList, vehicleList);
    
            // remove eaten objects from simulation
            for (let food of eatenObjects.foodEaten) {
                vehicle.changeHealth(Food.HEAL_AMOUNT);
                foodList.splice(foodList.indexOf(food), 1);
            }
            for (let poison of eatenObjects.poisonEaten) {
                vehicle.changeHealth(-Poison.DAMAGE_AMOUNT);
                poisonList.splice(poisonList.indexOf(poison), 1);
            }
    
            if (vehicle.isDead()) {
                vehicleList.splice(i, 1);
                continue;
            }
    
            vehicle.avoidBoundaries(repulsionBoundaryOffset);
            vehicle.update();
    
            let child = vehicle.attemptReproduction();
            if (child) {
                vehicleList.push(child);
            }
            
        }

        remainingIterations--;

    }

    remainingIterations += iterationsPerLoop;

    for (let food of foodList) {
        food.render();
    }

    for (let poison of poisonList) {
        poison.render();
    }

    for (let vehicle of vehicleList) {
        vehicle.render(debug);
    }

}

function toggleDebug() {
    debug = !debug;
}

function simulationSpeedChanged(event) {

    iterationsPerLoop = parseFloat(event.target.value);
    edibleSpawnInterval = originalEdibleSpawnInterval / iterationsPerLoop;

}
