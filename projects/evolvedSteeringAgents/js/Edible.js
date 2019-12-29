class Edible {

    constructor(x, y) {

        this.pos = createVector(x, y);

        // add randomness to life span so edibles spawned at beginning of simulation
        // dont all despawn at exactly the same time
        this.lifeSpan = 20000 + Math.random() * 30000;
        this.lastUpdate = Date.now();

    }

    update(simulationSpeed) {
        let time = Date.now();
        this.lifeSpan -= (time - this.lastUpdate) * simulationSpeed;
        this.lastUpdate = time;
    }

    hasExpired() {
        return this.lifeSpan <= 0;
    }

    render() {
        throw new Error("must be overridden");
    }

}