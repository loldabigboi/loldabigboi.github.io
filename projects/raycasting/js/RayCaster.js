class RayCaster {

    constructor(position, radius, heading, fov, radiusResolution) {

        this.position = position;
        this.radius = radius;
        this.heading = heading;
        this.fov = fov;
        this.radiusResolution = radiusResolution;
        
        // if debug is true we draw some extra graphics to help with debugging
        this.debug = false;

    }

    /**
     * Returns an array of the endpoints of rays cast out from the raycaster's position, the
     * endpoints being determined by intersections with the passed obstacles and the size of our view radius. 
     * A pre-generated set of vertices can be provided for the rays to be cast towards, but note that
     * these will be filtered to be within range of the raycaster's 'beam' even if not necessary.
     * 
     * @param {Obstacle[]} obstacles An array of obstacles for our rays to intersect
     * @param {Vector2[]} generatedVertices An array of pre-generated positions to cast our rays towards
     * @return {Vector2[]} An array of the positions where our rays end
     */
    raycast(obstacles, generatedVertices=null) {

        // generatedVertices must be an array of arrays, namely an array containing
        // [ obstacleVerties, lineIntersectionVertices, perimeterVertices ].
        // if the passed array is not null, we will use these pre-generated vertices for our rays.
        // this feature is provided to save on resources in the event we have two raycasters
        // who are casting with the same set of obstacles

        if (this.debug) {

            let vec  = Vector2.mult( Vector2.fromHeading(this.heading - this.fov/2), this.radius );
            let vec2 = Vector2.mult( Vector2.fromHeading(this.heading + this.fov/2), this.radius );
            vec.add(this.position);
            vec2.add(this.position);
            
            noFill();
            stroke(0);
            strokeWeight(1);
            line(this.position.x, this.position.y, vec.x, vec.y);
            line(this.position.x, this.position.y, vec2.x, vec2.y);
            
            circle(this.position.x, this.position.y, this.radius*2);

        }

        // generate vertices if necessary
        let obstacleVertices, lineIntersectionVertices, perimeterVertices;
        if (generatedVertices === null) {
            [ obstacleVertices, lineIntersectionVertices, perimeterVertices ] = this.generateVertices(obstacles);
        } else {
            [ obstacleVertices, lineIntersectionVertices, perimeterVertices ] = generatedVertices;
        }
        [ obstacleVertices, lineIntersectionVertices, perimeterVertices ] = this.filterVertices(obstacleVertices, 
                                                                                                lineIntersectionVertices, 
                                                                                                perimeterVertices);

        let rayDirections = this.generateRays(obstacleVertices, lineIntersectionVertices, perimeterVertices);

        // sort ray directions by heading so we can cast intermediate rays properly
        this.sortRays(rayDirections);

        // cast the rays
        let castVertices = this.castRays(rayDirections, obstacles);

        // remove no longer relevant information from our cast vertices
        // i.e. only keep point of intersection
        for (let i = 0; i < castVertices.length; i++) {
            
            if (castVertices[i].intersection === null) {  // set vertex at perimeter
                let rayDir = Vector2.fromHeading(castVertices[i].heading);
                castVertices[i] = Vector2.add( this.position, Vector2.mult( rayDir, this.radius ) );
            } else {
                castVertices[i] = castVertices[i].intersection;
            }

        }

        return castVertices;

    }

    sortRays(rayDirs) {

        let startOfFov = this.heading - this.fov/2;

        rayDirs.sort((v1, v2) => {

            let h1 = v1.heading(),
                h2 = v2.heading();

            let d1 = MathLib.differenceBetweenAngles(startOfFov, h1, "ccw"),
                d2 = MathLib.differenceBetweenAngles(startOfFov, h2, "ccw");

            return d1 - d2;

        })

    }

    generateRays(obstacleVertices, lineIntersectionVertices, perimeterVertices) {

        let rayDirections = [];

        // create a ray at the start and end of our fov
        let startDir = Vector2.fromHeading(this.heading - this.fov/2 + 0.0000001);
        startDir.type = "regular";
        rayDirections.push(startDir);

        let endDir;
        if (this.fov < Math.PI*2) {
            endDir = Vector2.fromHeading(this.heading + this.fov/2);
        } else {
            endDir = Vector2.fromHeading(this.heading);
        }
        endDir.type = "regular";
        rayDirections.push(endDir);

        // generate three rays for each vertex; two offset slightly and one pointed at the vertex
        for (let v of obstacleVertices) {

            let relativeVector = Vector2.sub(v, this.position);
            let angle = relativeVector.heading();

            for (let heading  = angle - RayCaster.ANGLE_OFFSET; 
                        heading <= angle + RayCaster.ANGLE_OFFSET;
                        heading += RayCaster.ANGLE_OFFSET) {

                    let rayDir = Vector2.fromHeading(heading);
                    rayDir.type = "regular";
                    rayDirections.push(rayDir);

            }

        }

        // generate a single ray for each line intersection vertex
        for (let v of lineIntersectionVertices) {

            let rayDir = Vector2.sub(v, this.position);
            rayDir.normalise();
            rayDir.type = "lineIntersection";
            rayDirections.push(rayDir);

        }

        // generate a single ray for each perimeter intersection vertex
        for (let v of perimeterVertices) {

            let rayDir = Vector2.sub(v, this.position);
            rayDir.normalise();
            rayDir.type = "perimeterIntersection";
            rayDirections.push(rayDir);

        }

        return rayDirections;

    }

    generateVertices(obstacles) {

        // create vertices for the intersections between obstacles lines, intersections between obstacle lines
        // and our view perimeter, and finally for vertices of each obstacle

        let lines = [];

        let obstacleVertices = [];
        let lineIntersectionVertices = [];
        let perimeterVertices = [];

        for (let obstacle of obstacles) {

            obstacleVertices = obstacleVertices.concat(obstacle.getVertices());
            
            let obsLines = obstacle.getLines();
            obsLines.forEach((line) => {
                line.parent = obstacle;
            })
            lines = lines.concat(obsLines);

        }

        for (let i = 0; i < lines.length; i++) {

            let line1 = lines[i];
            perimeterVertices = perimeterVertices.concat(MathLib.lineCircleIntersection(line1.start, line1.end, 
                                                                                        this.position, this.radius, true));

            for (let j = i+1; j < lines.length; j++) {

                let line2 = lines[j];
                if (line1.parent === line2.parent) {
                    continue;  // skip
                }
                let intersection = line1.intersects(line2);
                if (intersection !== null) {
                    lineIntersectionVertices.push(intersection);
                }

            }

        }

        return [ obstacleVertices, lineIntersectionVertices, perimeterVertices ];

    }
    /** Filters the passed vertices such that they line within our field of view and are not outside
     *  of our view radius.
     * 
     * @returns {Vector2[][]} An array of array of vertices (obs, line, perimeter)
     */
    filterVertices(obstacleVertices, lineIntersectionVertices, perimeterVertices) {

        // filter vertices so they lie within fov and are within view radius

        obstacleVertices = obstacleVertices.filter((v) => {
            let relativeVector = Vector2.sub(v, this.position);
            let heading = relativeVector.heading();
            let distance = relativeVector.mag();
            return distance <= this.radius && MathLib.differenceBetweenAngles(this.heading, heading) <= this.fov/2;
        });

        lineIntersectionVertices = lineIntersectionVertices.filter((v) => {
            let relativeVector = Vector2.sub(v, this.position);
            let heading = relativeVector.heading();
            let distance = relativeVector.mag();
            return distance <= this.radius && MathLib.differenceBetweenAngles(this.heading, heading) <= this.fov/2;
        });

        perimeterVertices = perimeterVertices.filter((v) => {
            let relativeVector = Vector2.sub(v, this.position);
            let heading = relativeVector.heading();
            return MathLib.differenceBetweenAngles(this.heading, heading) <= this.fov/2;
        });

        if (this.debug) {

            for (let v of obstacleVertices) {
                fill("rgb(0,0,255)");
                circle(v.x, v.y, 10);
            }

            for (let v of lineIntersectionVertices) {
                fill("rgb(0,255,0)");
                circle(v.x, v.y, 10);
            }

            for (let v of perimeterVertices) {
                fill("rgb(0,255,255)");
                circle(v.x, v.y, 10);
            }

        }

        return [ obstacleVertices, lineIntersectionVertices, perimeterVertices ];

    }

    castRays(rayDirections, obstacles) {

        let castVertices = [];
    
        let cast;
        let lastCast = this.castRay(rayDirections[0], obstacles);  // cast 1st ray at start of fov
        castVertices.push(lastCast);

        let count = 0,
            max = ( this.fov < Math.PI*2 ) ? rayDirections.length : rayDirections.length + 1;
        for (let i = 1; i < max; i++) {

            let rayDir = rayDirections[i % rayDirections.length];

            count++;

            cast = this.castRay(rayDir, obstacles);

            // band-aid solution to a problem where rays cast to intersections at perimeter
            // are sometimes calculated to have no intersection
            if (rayDir.type === "perimeterIntersection" && cast.intersection === null) {
                cast.intersection = Vector2.add( this.position, Vector2.mult(rayDir, this.radius) );
            }

            // when there are two adjacent rays with type === perimeter, the space inbetween is never
            // filled with perimeter vertices. this causes a problem when these rays intersect
            // different line segments, as there will be an empty void between them (line drawn straight
            // between them when rendering, rather than to all the perimeter vertices which should be between
            // them). to solve this we will query which line each ray intersected, and if they don't match
            // we fill the perimeter between them. (1)

            // we also do this when either the current cast or previous cast intersected nothing, as this guarantees
            // there will be nowhere for rays to intersect between these two points (else a ray would have been cast
            // to such a position), so we fill the perimeter of our fov with vertices between these two points. (2)

            if ( ( cast.type === "perimeterIntersection" && lastCast.type === "perimeterIntersection"  && 
                   cast.line !== lastCast.line ) ||  // (1)
                   lastCast.intersection === null || cast.intersection === null ) {  // (2)
                castVertices = castVertices.concat(this.fillPerimeter(lastCast.heading, cast.heading));
            }

            castVertices.push(cast);
            lastCast = cast;

            if (this.debug) {

                if (cast.intersection !== null) {
                    line(this.position.x, this.position.y, cast.intersection.x, cast.intersection.y);
                } else {
                    let vec = Vector2.add( this.position, Vector2.mult( rayDir, this.radius ) );
                    line(this.position.x, this.position.y, vec.x, vec.y);
                }

            }

        }

        noStroke();
        fill(0);
        text(count, 50, 50);

        return castVertices;

    }

    castRay(rayDir, obstacles) {

        let closest = {
            rayScalar: null,
            lineScalar: null,
            intersection: null,
        };

        for (let obstacle of obstacles) {

            let cast = obstacle.raycast(this.position, rayDir);
            if ( closest.intersection === null || ( cast.intersection !== null && cast.rayScalar < closest.rayScalar ) ) {
                closest = cast;
            }

        }

        if (closest.intersection !== null && closest.rayScalar > this.radius) {
            closest.intersection = null;
        }

        closest.type = rayDir.type;
        closest.heading = rayDir.heading();
        
        return closest;

    }

    fillPerimeter(startAngle, endAngle) {

        // fill perimeter with vertices

        let vertices = [];

        let dr = ( 1 / this.radiusResolution ) / this.radius;  // change in radians

        let angleDiff = MathLib.differenceBetweenAngles(startAngle, endAngle, "ccw");

        for (let theta = startAngle; theta < startAngle + angleDiff; theta += dr) {

            if (theta + dr > startAngle + angleDiff) {
                theta = startAngle + angleDiff;
            }
            
            // create vertex at view radius (around circumference)
            vertices.push({

                rayScalar: this.radius,
                lineScalar: null,  // irrelevant
                intersection: Vector2.add( this.position, Vector2.mult( Vector2.fromHeading(theta), this.radius ) ),
                heading: theta

            });

        }

        return vertices;

    }
    

}

RayCaster.ANGLE_OFFSET = 0.0001;  // amount of rads to offset the adjacent arrays