let titleElement       = document.getElementById("project-title"),
                         informationElement = document.getElementById("project-information"),
                         descElement        = document.getElementById("project-description"),
                         githubLinkElement  = document.getElementById("project-github-link"),
                         pageLinkElement    = document.getElementById("project-page-link");

function map(value, rangeStart, rangeEnd, otherRangeStart, otherRangeEnd) {

    if (value < rangeStart) {
        return otherRangeStart;
    } else if (value > rangeEnd) {
        return otherRangeEnd;
    } else {
        let ratio = (value - rangeStart) / (rangeEnd - rangeStart);
        return otherRangeStart + ratio * (otherRangeEnd - otherRangeStart);
    }

}

class Carousel {

    constructor( element, dataArray, numitems, itemSeparation, axis,
                 minItemSize, maxItemSize, maxSpeed, frictionMag,
                 sensitivity, scrollSensitivity, baseTransparency, 
                 transparencyOffset) {

        this.element = element;

        this.numitems = numitems;
        this.itemSeparation = itemSeparation;
        this.minItemSize = minItemSize;
        this.maxItemSize = maxItemSize;
        
        this.axis = axis;  // either x or y, the axis of movement
        this.totalLength = numitems * (maxItemSize + itemSeparation) - itemSeparation;

        if (axis === 'x') {
            this.min = this.element.offsetWidth/2 - this.totalLength/2 - this.itemSeparation/2;
            this.max = this.element.offsetWidth/2 + this.totalLength/2 + this.itemSeparation/2;
        } else if (axis == 'y') {
            this.min = this.element.offsetHeight/2 - this.totalLength/2 - this.itemSeparation/2;
            this.max = this.element.offsetHeight/2 + this.totalLength/2 + this.itemSeparation/2;
        } else {
            throw new Error("invalid axis for Carousel");
        }

        this.baseTransparency = baseTransparency;
        this.transparencyOffset = transparencyOffset;  // determines how early the items start fading

        this.snapAcceleration = 0.15;
        this.snapSlowDistance = 175;
        this.snapToCenterDistance = 0.25;  // distance below which item will simply snap to center
        this.snapSpeedThreshold = 0.1;  // speed below which carousel will 'snap' to closest item
        this.itemSelectThreshold = 50;  // distance below which an item is considered 'selected'
        this.selectedItem = null;
        this.hasSnapped = false;
        this.userMoving = false;

        this.speed = 0;
        this.maxSpeed = maxSpeed;
        this.sensitivity = sensitivity;
        this.frictionMag = frictionMag;

        this.lastUpdate = Date.now();
    
        // used to store NavigatoritemData instances
        // which we then cycle through
        this.dataArray = dataArray;

        // create navigator items
        this.carouselItems = [];
        this.dataIndex = 0;
        let relativePos = this.min + this.itemSeparation/2;

        for (let i = 0; i < this.numitems; i++) {
            
            let data = this.dataArray[i % this.dataArray.length];
            
            // create element
            let carouselItem = document.createElement("div");
            carouselItem.className = "carousel-item rainbow-animated-bg";
            carouselItem.style.userSelect = "none";
            carouselItem.relativePos = relativePos;
            carouselItem.size = maxItemSize;
            carouselItem.data = data;

            if (axis === 'x') {
                carouselItem.style.left = carouselItem.relativePos + "px";
                carouselItem.style.top  = "50%";
                carouselItem.style.transform = "translateY(-50%)";
            } else {
                carouselItem.style.left = "50%";
                carouselItem.style.top  = carouselItem.relativePos + "px";
                carouselItem.style.transform = "translateX(-50%)";
            }
            carouselItem.style.width = this.maxItemSize + "px";
            carouselItem.style.height = this.maxItemSize + "px";
            
            let nestedImg = document.createElement("img");
            nestedImg.style.pointerEvents = 'none';
            nestedImg.src = data.image;
            nestedImg.style.width = "100%";
            nestedImg.style.height = "100%";
            carouselItem.appendChild(nestedImg)

            this.element.appendChild(carouselItem);
            this.carouselItems.push(carouselItem);

            relativePos += this.maxItemSize + this.itemSeparation;

        }

        /* event related code */

        this.stop = false;

        this.onMouseDownCallback  = (e) => { this.onMouseDown(e);  };
        this.onMouseMoveCallback  = (e) => { this.onMouseMove(e);  };
        this.onMouseUpCallback    = (e) => { this.onMouseUp(e);    };

        this.element.addEventListener("mousedown", this.onMouseDownCallback);
        
        this.onSelectedClickCallback = (e) => { 
            if (this.speed == 0) {
                document.getElementById("project-page-link").click() 
            }
        };

        this.update();

    }

    update() {

        let time = Date.now();
        let dt = time - this.lastUpdate;
        this.lastUpdate = time;
        
        let centrePos;
        if (this.axis == 'x') {
            centrePos = this.element.offsetWidth/2;
        } else {
            centrePos = this.element.offsetHeight/2;
        }
        
        let closestItem = null;
        let smallestDist = Infinity;
        let smallestAbsDist = Infinity;
        let endOfRange = this.carouselItems.length;
        for (let i = 0; i < endOfRange; i++) {

            let carouselItem = this.carouselItems[i];
            carouselItem.relativePos += this.speed * dt;

            let itemCentrePos = carouselItem.relativePos + carouselItem.size/2;
            
            if (itemCentrePos < this.min) {

                let remainder = this.min - itemCentrePos;
                carouselItem.relativePos = this.max - remainder - carouselItem.size/2;
                this.dataIndex = (this.dataIndex + 1) % this.dataArray.length;

                // move element to end of array
                this.carouselItems.shift();
                this.carouselItems.push(carouselItem)

                // prevent this element from being moved again
                endOfRange--;

                // prevent next element from being skipped
                i--;

            } else if (itemCentrePos > this.max) {

                let remainder = itemCentrePos - this.max;
                carouselItem.relativePos = this.min + remainder - carouselItem.size/2;
                this.dataIndex -= 1;
                if (this.dataIndex < 0) {
                    this.dataIndex = this.dataArray.length-1;
                }
                
                // move element to start of array
                this.carouselItems.pop();
                this.carouselItems.unshift(carouselItem);

            }

            let distance = centrePos - carouselItem.relativePos - carouselItem.size/2;
            let absDistance = Math.abs(distance);
            if (absDistance < smallestAbsDist) {
                closestItem = carouselItem;
                smallestAbsDist = absDistance;
                smallestDist = distance;
            }

            distance = absDistance;

            // resize carouselItem according to distance from centre

            // uncentre
            carouselItem.relativePos += carouselItem.size/2 - this.maxItemSize/2;
            
            carouselItem.size = map(distance, 0, this.totalLength/2 + this.itemSeparation,
                               this.maxItemSize, this.minItemSize);
            
            // recentre
            carouselItem.relativePos += this.maxItemSize/2 - carouselItem.size/2;

            carouselItem.style.width = carouselItem.size + "px";
            carouselItem.style.height = carouselItem.size + "px";

            if (this.axis === 'x') {
                carouselItem.style.left = carouselItem.relativePos + "px";
            } else {
                carouselItem.style.top = carouselItem.relativePos + "px";
            }

            // change opacity of carouselItem according to distance from centre

            let opacity = map(distance, 0, this.totalLength/2 + this.itemSeparation + this.transparencyOffset,
                              1 - this.baseTransparency, 0);
            carouselItem.style.opacity = ""+opacity;
            

        }

        for (let i = 0; i < this.carouselItems.length; i++) {

            let dataIndex = (this.dataIndex + i) % this.dataArray.length;
            this.carouselItems[i].href = this.dataArray[dataIndex].item;
            this.carouselItems[i].data = this.dataArray[dataIndex];
            
            // set image
            let nestedImg = this.carouselItems[i].querySelector("img");
            nestedImg.src = this.dataArray[dataIndex].image;

        }

        if (smallestAbsDist < this.itemSelectThreshold) {
            if (this.selectedItem !== closestItem) {
                this.changeSelectedItem(closestItem);
            }
        } else {
            this.changeSelectedItem(null);
        }

        if (this.hasSnapped) {
            this.speed = 0;
        } else if (!this.userMoving && Math.abs(this.speed) < this.snapSpeedThreshold) {

            if (smallestAbsDist < this.snapToCenterDistance) {
                this.hasSnapped = true;
                this.speed = smallestDist;
            } else {
                this.speed += Math.sign(smallestDist) * this.snapAcceleration;
                if (smallestAbsDist < this.snapSlowDistance) {
                    this.speed *= map(smallestAbsDist, 0, this.snapSlowDistance, 0.25, 1);
                }
            }

        } else {

            if (this.speed < 0) {
                this.speed += this.frictionMag * dt;
                if (this.speed > 0) {
                    this.speed = 0;
                }
            } else { 
                this.speed -= this.frictionMag * dt;
                if (this.speed < 0) {
                    this.speed = 0;
                }
            }

        }

    }

    changeSelectedItem(item) {

        if (item === null) {
            this.deselect();
        } else {

            this.selectedItem = item;
            this.selectedItem.classList.add("clickable");
            this.selectedItem.addEventListener("mouseup", this.onSelectedClickCallback);
            this.selectedItem.style.border = "2px solid transparent";

            titleElement.style.opacity = 1;
            informationElement.style.opacity = 1;

            titleElement.innerHTML = this.selectedItem.data.title;
            descElement.innerHTML = this.selectedItem.data.description;

            githubLinkElement.href = this.selectedItem.data.githubLink;
            pageLinkElement.href = this.selectedItem.data.pageLink;

        }

    }

    deselect() {

        if (this.selectedItem) {
            this.selectedItem.style.border = "2px solid white";
            this.selectedItem.classList.remove("clickable");
            this.selectedItem.removeEventListener("mouseup", this.onSelectedClickCallback);
        }
        this.selectedItem = null;

        let titleElement = document.getElementById("project-title"),
            informationElement  = document.getElementById("project-information");

        titleElement.style.opacity = 0;
        informationElement.style.opacity = 0;

    }

    unSnap() {

        this.hasSnapped = false;

    }

    onMouseDown(e) {

        // deselect all selected text on page
        // retrieved from https://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript, user ChaseMoskal
        (function deselect(){
            var selection = ('getSelection' in window)
              ? window.getSelection()
              : ('selection' in document)
                ? document.selection
                : null;
            if ('removeAllRanges' in selection) selection.removeAllRanges();
            else if ('empty' in selection) selection.empty();
        })();

        this.userMoving = true;
        document.addEventListener("mousemove", this.onMouseMoveCallback);
        document.addEventListener("mouseup"  , this.onMouseUpCallback  );

    }

    onMouseMove(e) {

        e = e || window.event;

        let dx = e.movementX,
            dy = e.movementY;
        this.speed += ( ( this.axis === 'x' ) ? dx : dy ) * this.sensitivity;

        if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed;
        } else if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }

        this.unSnap();

    }

    onMouseUp(e) {

        this.userMoving = false;
        document.removeEventListener("mousemove", this.onMouseMoveCallback);
        document.removeEventListener("mouseup", this.onMouseUpCallback);

    }

    scroll(dir) {
        this.unSnap();
        this.speed = 0.725 * (dir === 'right' ? -1 : 1);
    }

}

class ProjectData {

    constructor(title, description, image, pageLink, githubLink) {
        this.title = title;
        this.description = description;
        this.image = image;
        this.pageLink = pageLink;
        this.githubLink = githubLink;
    }

}

const raycastingDesc = `
An advanced raycasting algorithm which builds upon the idea of firing rays at and around
the vertices of the obstacles surrounding the raycaster, rather than at set intervals. This leads
to greatly improved performance and precision of the resulting polygon (no jittering).
`

const evolvingSteeringAgentsDesc = `
A simulation of Darwinian evolution utilising archetypal genetic algorithm techniques. In this simulation
"agents" (vehicles which have steering behaviours) must navigate the area around them to find food and avoid
poison. Food extends their lifespan, whereas poison decreases it. An agent's aversion / attraction (as well as 'view' radius) to food / poison / other agents
is generated randomly for the first generation, and then subsequent generations inherit from their parents with some chance
of mutation.
`

const digitRecognitionDesc = `
A convolutional neural network that tries to guess the digit that you draw. Created using a neural network
library that I programmed in javascript, using the p5js library for graphics rendering. Further details of the
neural network itself can be found by demoing the project :).
`

const superPewPewDesc = `
An arcade 2D shooter HTML5 game designed using a custom-built entity-component-system. Heavily inspired by the game Super Crate Box, but has numerous differences
(360 movement, completely different graphics, etc.).
`

const data = [ 
    new ProjectData( "Advanced Raycasting", raycastingDesc, "resources/advancedRaycasting.png", "projects/raycasting/index.html", "https://github.com/loldabigboi/optimised-raycasting" ),
    new ProjectData( "Evolving Steering Agents", evolvingSteeringAgentsDesc, "resources/evolvingSteeringAgents.png", "projects/evolvedSteeringAgents/index.html", "https://github.com/loldabigboi/evolving-steering-agents"),
    new ProjectData( "Digit Recognition", digitRecognitionDesc, "resources/digitRecognition.png", "projects/digitRecognition/index.html", "https://github.com/loldabigboi/ezml.js"),
    new ProjectData( "Super Pew Pew", superPewPewDesc, "resources/superPewPew.png", "projects/superPewPew/index.html", "https://github.com/loldabigboi/super-pew-pew")
]  
const carousel = new Carousel(document.getElementById("carousel"), data, 5, 75, 'x', 50, 225, 1.2, 0.001, 0.005, 0.05, 0, 0);
setInterval(() => { carousel.update() }, 16);