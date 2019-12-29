class Line {

    constructor(start, end) {
        
        this.start = start;
        this.end   = end;

        this.dir = Vector2.sub(this.end, this.start);
        this.length = this.dir.mag();
        this.dir.div(this.length);  // normalise

    }

    hasVertex(v) {
        return this.start === v || this.end === v;
    }

    intersects(line) {

        return MathLib.lineIntersection(this.start, this.end, line.start, line.end);

    }

    render() {

        strokeWeight(1);
        stroke(0);
        line(this.start.x, this.start.y, this.end.x, this.end.y);

    }

    raycast(rayStart, rayDir) {

        let cast = MathLib.raycast(this.start, this.end, rayStart, rayDir);
        cast.line = this;  // let caller know which line was intersected
        return cast;
    }

}