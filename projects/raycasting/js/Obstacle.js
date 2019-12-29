class Obstacle {

    constructor(lines, closed) {

        this.lines = lines;

        this.vertices = [];
        for (let line of this.lines) {
            this.vertices.push(line.start);
        }

        this.closed = closed;
        if (!this.closed) {
            this.vertices.push(this.lines[this.lines.length-1].end);  // since not closed shape the last vertex != first vertex
        }

    }

    raycast(rayStart, rayDir) {

        let closest = {
            rayScalar: null,
            lineScalar: null,
            intersection: null
        };

        for (let line of this.lines) {

            let cast = line.raycast(rayStart, rayDir);
            if ( closest.intersection === null || ( cast.intersection !== null && cast.rayScalar < closest.rayScalar ) ) {
                closest = cast;
            }

        }

        return closest;

    }

    getLines() {

        return this.lines;

    }

    getVertices() {

        return this.vertices;

    }

    isClosed() {
        return this.closed;
    }

    render() {

        noStroke();
        fill(100);

        if (this.closed) {

            beginShape();
            for (let line of this.lines) {
                vertex(line.start.x, line.start.y);
            }
            endShape(CLOSE);

        } else {

            for (let line of this.lines) {
                line.render();
            }

        }

    }

    static createRectangle(position, width, height, rotation, centred=true) {

        let vertices = [

            new Vector2( -width/2, -height/2 ),  // TOP-LEFT
            new Vector2(  width/2, -height/2 ),  // TOP-RIGHT
            new Vector2(  width/2,  height/2 ),  // BOTTOM-RIGHT
            new Vector2( -width/2,  height/2 )   // BOTTOM-LEFT

        ]

        let xOffset = position.x,
            yOffset = position.y;

        if (!centred) {
            xOffset += width/2;
            yOffset += height/2;
        }

        for (let i = 0; i < vertices.length; i++) {
            vertices[i].rotate(rotation);
            vertices[i].add(xOffset, yOffset);
        }

        let lines = [ 

            new Line( vertices[0], vertices[1] ),
            new Line( vertices[1], vertices[2] ),
            new Line( vertices[2], vertices[3] ),
            new Line( vertices[3], vertices[0] )

        ];

        return new Obstacle( lines, true );

    }

    static createRandom(position, radius, numVertices, variance) {

        let vertices = [];
        for (let i = 0; i < numVertices; i++) {

            let angle = i * (Math.PI*2 / numVertices);
            let adjRadius = radius - variance / 2 + variance * Math.random();
            let relativeX = adjRadius * Math.cos(angle);
            let relativeY = adjRadius * Math.sin(angle);
            vertices.push( new Vector2( position.x + relativeX, position.y + relativeY ) );

        }

        let lines = [];
        for (let i = 0; i < numVertices; i++) {
            let start = vertices[i];
            let end = vertices[ (i+1) % numVertices ];
            lines.push( new Line(start, end) );
        }

        return new Obstacle( lines, true );

    }

}