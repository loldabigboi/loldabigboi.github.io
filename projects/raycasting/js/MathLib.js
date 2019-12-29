class MathLib {

    static raycast(lineStart, lineEnd, rayStart, rayDir, tolerance = 0.001) {

        let lineDir = Vector2.sub(lineEnd, lineStart);
        let length = lineDir.mag();
        lineDir.normalise();

        let scalars = MathLib.rayIntersection(lineStart, lineDir,
                                           rayStart , rayDir); 
        
        let raycastVertex;
        if (scalars === null) { // invalid raycast (parallel lines / invalid direction)
            return {

                lineScalar:   null,
                rayScalar:    null,
                intersection: null

            }; 
        } else {
            raycastVertex = {

                lineScalar: scalars[0],
                rayScalar:  scalars[1],
                intersection: null  // assume no intersection

            };
        }
        
        if ( raycastVertex.lineScalar <= length + tolerance && raycastVertex.lineScalar >= -tolerance && // within bounds of line
             raycastVertex.rayScalar >= 0 ) {  
            raycastVertex.intersection = Vector2.add( rayStart, Vector2.mult( rayDir, raycastVertex.rayScalar ) );
        }

        return raycastVertex;

    }

    static lineIntersection(start1, end1, start2, end2) {

        let dir1 = Vector2.normalise( Vector2.sub(end1, start1) ),
            dir2 = Vector2.normalise( Vector2.sub(end2, start2) );

        let coefficients = MathLib.rayIntersection(start1, dir1, start2, dir2);

        if (coefficients === null || coefficients[0] < 0 || coefficients[1] < 0) {
            return null;
        } else {

            let [t, s] = coefficients;

            let length1 = Vector2.sub(end1, start1).mag(),
                length2 = Vector2.sub(end2, start2).mag();

            if (t > length1 || s > length2) {
                return null
            } else {
                return Vector2.add( start1, Vector2.mult( dir1, t ) );
            }

        }

    }

    /* returns the scalars for the parametric equations of the passed rays
     * at the point where they intersect. null is returned if rays are parallel
     * or one ray has no direction
    */
    static rayIntersection(pos1, dir1, pos2, dir2, tolerance = 0.0001) {

        let x1  = pos1.x, y1  = pos1.y,
            dx1 = dir1.x, dy1 = dir1.y;
        
        let x2  = pos2.x, y2  = pos2.y,
            dx2 = dir2.x, dy2 = dir2.y;

        // parameterised eqs are:
        // x = x1 + t*dx1 = x2 + s*dx2
        // y = y1 + t*dy1 = y2 + s*dy2

        if (dx1 === 0 && dy1 === 0) {
            return null;  // ray has no direction
        } else if (dx2 === 0 && dy2 === 0) {
            return null;  // ^
        } else if ( (dx1 ===    0 && dx2 ===    0) ||
                    (dy1 ===    0 && dy2 ===    0) ||
                    (dx1 ===  dx2 && dy1 ===  dy2) ||
                    (dx1 === -dx2 && dy1 === -dy2) ) {
            return null;  // parallel
        }

        let t, s;

        // check for 0 to prevent divison by zero
        // tolerance necessary else computer precision error can cause
        // this to never be true, e.g. dx2 = 0.000001 when dx2 should be 0 given
        // the context
        if (Math.abs(dx2) < tolerance) {
            
            t = (x2-x1) / dx1;
            s = ( (y1 - y2) + t*dy1 ) / dy2;

        } else {

            t = ( (y2-y1) + (x1-x2) * dy2/dx2 ) / (dy1 - (dx1/dx2)*dy2 ),
            s = ( (x1-x2) + t*dx1 ) / dx2;

        }

        return [t, s];

    }

    static lineCircleIntersection(lineStart, lineEnd, circleOrigin, circleRadius, boundsCheck=true) {

        // if boundsCheck is true, we eliminate points of intersection which are not within the line

        // circle eqn: (x - a)^2 + (y - b)^2 = r^2
        // line eqn: y = mx + c
        
        let lineDir = Vector2.sub(lineEnd, lineStart);
        lineDir.normalise();

        let intercepts = [];

        let a, b, c, m, r, x, y;
        let determinant;

        a = circleOrigin.x;
        b = circleOrigin.y;
        m = lineDir.y / lineDir.x;  // Infinity if line is vertical
        c = lineStart.y - m*lineStart.x;
        r = circleRadius;

        if (m === Infinity) {  // vertical
            
            x = lineStart.x;
            determinant = 4*b*b - 4*x*x + 8*a*x - 4*a*a - 4*b*b + 4*r*r;
            if (determinant > 0) {  // two real solutions => two intersections

                y = ( 2*b + Math.sqrt(determinant) ) / 2;
                intercepts.push(new Vector2(x, y));

                y = ( 2*b - Math.sqrt(determinant) ) / 2;
                intercepts.push(new Vector2(x, y));

            }

        } else {

            determinant = 4*a*a + 8*a*b*m - 8*a*c*m - 8*b*c*m*m + 4*b*b*m*m + 
                          4*c*c*m*m - 4*(m*m + 1)*(a*a - 2*b*c + b*b + c*c - r*r);
            if (determinant > 0) {
                
                x = ( 2*a - 2*c*m + 2*b*m + Math.sqrt(determinant) ) / ( 2*m*m + 2 );
                y = m*x + c;
                intercepts.push(new Vector2(x, y));

                x = ( 2*a - 2*c*m + 2*b*m - Math.sqrt(determinant) ) / ( 2*m*m + 2 );
                y = m*x + c;
                intercepts.push(new Vector2(x, y));
                 
            }

        }

        if (boundsCheck && intercepts.length !== 0) {

                let startX, startY, endX, endY;

                if (lineEnd.x > lineStart.x) {
                    startX = lineStart.x;
                    endX = lineEnd.x;
                } else {
                    startX = lineEnd.x;
                    endX = lineStart.x;
                }

                if (lineEnd.y > lineStart.y) {
                    startY = lineStart.y;
                    endY = lineEnd.y;
                } else {
                    startY = lineEnd.y;
                    endY = lineStart.y;
                }

                let i1 = intercepts[0], i2 = intercepts[1];

                if ( i1.x < startX || i1.x > endX || i1.y < startY || i1.y > endY ) {
                    intercepts[0] = null;
                }
                if ( i2.x < startX || i2.x > endX || i2.y < startY || i2.y > endY ) {
                    intercepts.splice(1, 1);
                }

                if (intercepts[0] === null) {
                    intercepts.splice(0, 1);
                }

        }

        return intercepts;

    }

    static pointOfRayIntersection(pos1, dir1, pos2, dir2) {

        let ts = MathLib.scalarConstantsOfIntersectingRays(pos1, dir1, 
                                                           pos2, dir2),
            t = ts[0], s = ts[1];

        if (t >= 0 && s >= 0) {
            let x = pos1.x + dir1.x*t,
                y = pos1.y + dir1.y*t;

            return new Vector2(x, y);
        } else {
            return null;
        }

    }

    static differenceBetweenAngles(a1, a2, type="min") {

        // returns difference between two angles
        // if type = "min" we return the minimum difference going either clockwise or anti-clockwise
        // if type =  "cw" we return the minimum clockwise angle traversal required to reach a2 from a1
        // if type = "ccw" we do same as above but counter-clockwise
                
        // make both angles positive and between 0 and 2*PI (2*PI becomes 0)
        a1 = ( ( a1 % ( Math.PI*2 ) ) + Math.PI*2 ) % ( Math.PI*2 );
        a2 = ( ( a2 % ( Math.PI*2 ) ) + Math.PI*2 ) % ( Math.PI*2 );

        let ccwDiff = a2 - a1,
            cwDiff = a1 - a2;

        ccwDiff = ( ( ccwDiff % ( Math.PI*2 ) ) + Math.PI*2 ) % ( Math.PI*2 );
        cwDiff = ( ( cwDiff % ( Math.PI*2 ) ) + Math.PI*2 ) % ( Math.PI*2 );

        if (Math.abs(ccwDiff) < MathLib.TOLERANCE) {
            ccwDiff = 0;
        }
        if (Math.abs(cwDiff) < MathLib.TOLERANCE) {
            cwDiff = 0;
        }

        if (type === "ccw") {
            return ccwDiff;
        } else if (type === "cw") {
            return cwDiff;
        } else {
            return Math.min(ccwDiff, cwDiff);
        }

    }

}

MathLib.TOLERANCE = 0.00001;