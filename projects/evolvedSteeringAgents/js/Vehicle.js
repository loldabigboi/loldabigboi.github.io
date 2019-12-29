class Vehicle {

    constructor(x, y, parent) {

        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D();
        this.vel.setMag(Vehicle.MAX_VELOCITY_MAGNITUDE);
        this.acc = createVector(0, 0);
        this.health = 1;

        this.dna = new VehicleDNA((parent) ? parent.dna : undefined);

        // used to shade debug detection radius circles if food / poison in radius
        this.foodDetected = false;
        this.poisonDetected = false;

    }

    update() {

        this.health -= 0.003;

        this.pos.add(this.vel);

        this.vel.add(this.acc);
        this.vel.limit(Vehicle.MAX_VELOCITY_MAGNITUDE);  // limit velocity magnitude
        
        // reset acceleration
        this.acc.x = 0;
        this.acc.y = 0;

    }
    

    applyForce(force) {

        this.acc.add(force);

    }

    // type is either "food", "poison" or "vehicle" (case sensitive")
    seekEntity(type, list) {

        if (type !== "food" && type !== "poison" && type !== "vehicle") {
            throw new Error("type must be 'food', 'poison' or 'vehicle' (case sensitive)");
        }

        let collisionRadius = 7; // fairly arbitrary, just tweaked to look natural
            
        let closest = null;
        let closestDist = Infinity;
        let collidedWith = [];

        for (let i = list.length-1; i >= 0; i--) {

            if (list[i] === this) {
                continue;
            }

            let dist = this.pos.dist(list[i].pos);
            if (dist < closestDist) {
                if (dist < collisionRadius) {  
                    collidedWith.push(list[i]);
                }
                closestDist = dist;
                closest     = list[i];
            }

        }

        if (closest && closestDist < this.dna[type + "DetectionRadius"]) {
            this[type + "Detected"] = true;
            this.seek(closest.pos, this.dna[type + "Attraction"]);
        } else {
            this[type + "Detected"] = false;
        }

        return collidedWith;

    }

    enactBehaviour(foodList, poisonList, vehicleList) {

        let foodEaten   = this.seekEntity("food", foodList);
        let poisonEaten = this.seekEntity("poison", poisonList);
        this.seekEntity("vehicle", vehicleList);
        

        return {
            foodEaten: foodEaten,
            poisonEaten: poisonEaten
        };

    }

    seek(target, multiplier) {

        // calculate steering force
        let desiredVelocity = p5.Vector.sub(target, this.pos);
        let steeringForce = p5.Vector.sub(desiredVelocity, this.vel);
        steeringForce.mult(multiplier);
        steeringForce.limit(Vehicle.MAX_STEERING_MAGNITUDE);

        if (target.dist(this.pos) < Vehicle.APPROACH_RADIUS) {
            steeringForce.mult(2);
        }

        // apply steering force
        this.applyForce(steeringForce);
    }

    attemptReproduction() {

        if (Math.random() < 0.001) {
            return new Vehicle(this.pos.x, this.pos.y, this);
        }

    }

    avoidBoundaries(boundaryOffset) {

        let multiplier = 0.05;

        if (this.pos.x > width - boundaryOffset) {
            this.seek(createVector(this.pos.x - 5, this.pos.y), multiplier);
        } else if (this.pos.x < boundaryOffset) {
            this.seek(createVector(this.pos.x + 5, this.pos.y), multiplier);
        }

        if (this.pos.y > height - boundaryOffset) {
            this.seek(createVector(this.pos.y - 5, this.pos.x), multiplier);
        } else if (this.pos.y < boundaryOffset) {
            this.seek(createVector(this.pos.y + 5, this.pos.x), multiplier);
        }

    }

    changeHealth(amt) {
        this.health += amt;
    }

    isDead() {
        return this.health <= 0;
    }

    render(debug) {

        // small opcaity offset so vehicles are visible when they 'die'
        let opacity = Math.max(Math.min(0.1 + this.health, 1), 0);

        noStroke();
        fill("rgba(0,128,255," + opacity + ")");
        
        // get vertices of triangle to be rendered

        let front = p5.Vector.fromAngle(this.vel.heading(), Vehicle.HEIGHT);

        let left = p5.Vector.fromAngle(front.heading() + 2*Math.PI / 3, Vehicle.WIDTH);
        let right = p5.Vector.fromAngle(front.heading() - 2*Math.PI / 3, Vehicle.WIDTH);

        // make vectors absolute
        front.add(this.pos);
        left.add(this.pos);
        right.add(this.pos);

        // render triangle
        beginShape();

        vertex(front.x, front.y);
        vertex(left.x, left.y);
        vertex(right.x, right.y);

        endShape(CLOSE);

        // render debugging information

        if (debug) {

            this.renderDebug("food", "rgb(0, 255, 0)", "rgba(0, 255, 0, 0.1)");
            this.renderDebug("poison", "rgb(255, 0, 0)", "rgba(255, 0, 0, 0.1)");                    
            this.renderDebug("vehicle", "rgb(0, 0, 255)", "rgba(0, 0, 255, 0.1)");                    
        }

    }

    renderDebug(type, strokeColour, fillColour) {

        let vector = this.vel.copy();
        vector.setMag(40 * this.dna[type + "Attraction"]);
        vector.add(this.pos);

        stroke(strokeColour);
        if (this[type + "Detected"]) {
            fill(fillColour);
        } else {
            noFill();
        }
        circle(this.pos.x, this.pos.y, this.dna[type + "DetectionRadius"]*2);
        line(this.pos.x, this.pos.y, vector.x, vector.y);

    }
    
}

Vehicle.MAX_VELOCITY_MAGNITUDE = 2.5;
Vehicle.MAX_STEERING_MAGNITUDE = 0.5;

Vehicle.WIDTH = 5;
Vehicle.HEIGHT = 10;

// if distance to edible is lower than this number, we increase steering force down to prevent
// endless circling of an edible
Vehicle.APPROACH_RADIUS = 25;
