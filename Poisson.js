/**
 * Andrew Barlow
 * https://github.com/dandrewbarlow
 * 
 * FILE:
 * Poisson.js
 * 
 * DESCRIPTION:
 * Poisson disc-sampling algorithm
 * 
 * inspired by: https://www.youtube.com/watch?v=flQgnCUxHlw
 * 
 * depends on p5.js
 */
class Poisson {
      /**
       * constructor(size, radius, k)
       * @param {p5.Vector} size - size of canvas
       * @param {number} radius - distance between points
       * @param {number} k - amount of times to try creating points
       */
      constructor(size, radius, k = 30) {
            this.size = size;
            this.radius = radius;

            this.cell_size = this.radius / sqrt(2);

            // Poisson grid technically different from pixel grid
            this.grid_size = createVector(
                  floor(this.size.x / this.cell_size), 
                  floor(this.size.y / this.cell_size)
            );

            this.k = k;

            this.grid = Array.from(Array(this.grid_size.x), () => new Array(this.grid_size.y));

            this.active = [];

            this.ordered = [];

            // ? turns on console logging, slows down runtime
            this.debug = false;

            this.init();
      }

      /**
       * init initializes the grid to null values
       */
      init() {

            // initialize grid to null
            for (let i=0; i<this.grid_size.x; i++) {
                  for (let j=0; j<this.grid_size.y; j++) {
                        this.grid[i][j] = null;
                  }
            }

      }

      /**
       * posToGrid translates a vector position to a grid index
       * @param {p5.Vector} pos - vector position of point
       * @returns list of length 2 containing x,y coordinates of the position in the grid
       */
      posToGrid(pos){
            let x = floor(pos.x / this.cell_size);
            let y = floor(pos.y / this.cell_size);
            return [x, y];
      }

      /**
       * addPoint takes a vector and adds it to the grid, active points list,
       * and ordered points list
       * @param {p5.Vector} pos - position of point
       */
      addPoint(pos) {

            let xy = this.posToGrid(pos);

            let x = xy[0];
            let y = xy[1];

            if (x < 0 || x >= this.grid_size.x || y < 0 || y >= this.grid_size.y) {
                  return;
            }

            // push to the grid, and active points list
            this.grid[x][y] = pos;

            this.active.push(pos);

            this.ordered.push(pos);
      }

      /**
       * generatePointsFromActive() takes a random element from the active list
       * and tries to find an available point to add. If that fails, the element
       * is removed from the active list
       * @returns nothing
       */
      generatePointsFromActive() {

            // random point in active list
            let activeIndex = floor(random(this.active.length))
            let activePoint = this.active[activeIndex];

            for (let n=0; n < this.k; n++) {

                  let sample = p5.Vector.random2D();
                  let m = random(this.radius, 2 * this.radius);
                  sample.setMag(m);
                  sample.add(activePoint);

                  // bounds check in real space
                  if (sample.x < 0 || sample.x > this.size.x || sample.y < 0 || sample.y > this.size.y) {
                        continue;
                  }

                  // check neighbors to see if there's room for a new point
                  let tooClose = false;

                  for (let i = floor(sample.x/this.cell_size)-1; i < floor(sample.x/this.cell_size)+1; i++) {
                        
                        // if it won't work, don't waste time checking
                        if (tooClose) {
                              break;
                        }

                        for (let j = floor(sample.y/this.cell_size)-1; j < floor(sample.y/this.cell_size)+1; j++) {

                              // conditions were getting long
                              let outOfBounds = i < 0 || i >= this.grid_size.x || j < 0 || j >= this.grid_size.y;
                              let centerTile = i == floor(sample.x) && j == floor(sample.y);

                              // bounds check in grid space & check if we're on the sample tile
                              if (outOfBounds || centerTile) {
                                    continue;
                              }

                              let neighbor = this.grid[i][j]

                              // check if there is a neighboring particle
                              if (neighbor) {

                                    // check if it's within distance < radius
                                    let d = p5.Vector.dist(sample, neighbor);

                                    if (d < this.radius) {

                                          // if it's too close, can't create point
                                          tooClose = true;

                                          // ? debug info
                                          if (this.debug) {
                                                console.log(`neighbor detected at distance ${d} < ${this.radius}`)
                                          }
                                    }
                              }
                        }
                  }

                  // if point was found, add it to list
                  if (!tooClose) {
                        if (this.debug) {
                              console.log(`point added at ${sample}`)
                        }
                        this.addPoint(sample);
                        return;
                  }
            }

            // if no point found, remove active point from active list
            if (this.debug) {
                  console.log(`no point found. removing ${activePoint}`)
            }

            this.active.splice(activeIndex, 1);
            return;
      }

      get_points() {
            return this.ordered;
      }

      get_active() {
            return this.active;
      }

      // begin the algorithm
      /**
       * start initiates the algorithm with its first point
       * @param {p5.Vector} x0 - optional initial point (default=random)
       */
      start(x0 = createVector(random(this.size.x), random(this.size.y))) {
            this.addPoint(x0);
      }

      /**
       * yield iterates the algorithm and returns a list of 
       * @param {boolean} returnList - return lsit of points? (default=true)
       * @returns list of vectors in order of creation
       */
      yield(returnList = true) {
            if (this.active.length > 0) {
                  this.generatePointsFromActive();
            }

            if (returnList) {
                  return this.ordered[this.ordered.length];
            }
      }

      run() {
            while (this.active.length > 0) {
                  this.generatePointsFromActive();
                  if (this.debug) {
                        console.log(`${this.active.length} points in active list`)
                  }
            }
      }
}