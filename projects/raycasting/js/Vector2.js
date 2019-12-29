class Vector2 {

    constructor(x, y) {

        if (x instanceof Vector2) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }

    }

    add(x, y) {
        if (x instanceof Vector2) {
            this.x += x.x;
            this.y += x.y;
        } else {
            this.x += x;
            this.y += y;
        }
    }

    sub(x, y) {
        if (x instanceof Vector2) {
            this.x -= x.x;
            this.y -= x.y;
        } else {
            this.x -= x;
            this.y -= y;
        }
    }

    mult(factor) {
        this.x *= factor;
        this.y *= factor;
    }

    div(factor) {
        this.x /= factor;
        this.y /= factor;
    }

    heading() {

        return ( Math.atan2(this.y, this.x) + Math.PI*2 ) % ( Math.PI * 2 );

    }

    setRotation(rads) {

        let theta = rads - this.heading();
        this.rotate(theta);

    }

    rotate(rads) {
        
        // uses 2D rotation matrix formula

        let newX = this.x * Math.cos(rads) - this.y * Math.sin(rads);
        let newY = this.x * Math.sin(rads) + this.y * Math.cos(rads);

        this.x = newX;
        this.y = newY;

    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    sqrMag() {
        return this.x * this.x + this.y * this.y;
    }

    normalise() {
        let m = this.mag();
        this.x /= m;
        this.y /= m;
    }

    static add(v1, v2) {
        let v = new Vector2(v1);
        v.add(v2);
        return v;
    }

    static sub(v1, v2) {
        let v = new Vector2(v1);
        v.sub(v2);
        return v;
    }

    static mult(vec, factor) {

        let v = new Vector2(vec);
        v.mult(factor);
        return v;

    }

    static fromHeading(rads) {

        return new Vector2(Math.cos(rads), Math.sin(rads));
    }

    static normalise(vec) {
        let v = new Vector2(vec);
        v.normalise();
        return v;
    }

}