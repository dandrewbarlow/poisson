/**
 * Andrew Barlow
 * https://github.com/dandrewbarlow
 * 
 * FILE:
 * sketch.js
 * 
 * DESCRIPTION:
 * A sketch demonstrating creative applications of my Poisson class,
 * inspired by: https://www.youtube.com/watch?v=flQgnCUxHlw
 */


// Poisson class instance
let p;

/**
 * options allows quickly changing key visual elements in the sketch w/o messing
 * with the sketch itself
 */
let options = {
      // 0 to run all at once, int > 0 to set amount of points in each batch.
      // Mostly useful in combination w/ clickContinue
      loopSize : 20,                 
      bgColor: 'black',
      // use mouse to set initial point
      setStart: true,                
      // ties mouse click to draw loop, e.g. click to draw next batch (if using batches)
      clickContinue: false,
      // controls vars related to Poisson class as well as sketch size.
      poisson: {
            size: 1000,
            radius: 50,
            tries: 30,
      },
      dots: {
            drawDots : true,
            // use HSB color to cycle through color values based on placement order
            rainbowDots: true,
            // customize the hue bandwidth
            startHue: 0,
            endHue: 100,
            // ignored if rainbowDots == true
            dotColor: 'green',
            // use different color for active points
            drawActive: false,
            activeColor: 'white',
            dotWeight : 6,
      },
      lines: {
            drawLines : true,
            lineColor: '#00ff0022',
            lineWeight: 1,
      },
}

function setup() 
{
      let s = createVector(options['poisson']['size'], options['poisson']['size']);

	createCanvas(s.x, s.y);

      // initialize poisson
      p = new Poisson(
           s,
           options['poisson']['radius'],
           options['poisson']['tries'],
      );
      
      // set initial point to center if user doesn't set it themselves
      if (!options['setStart']) {
            p.start(createVector(s.x/2, s.y/2));
      }

      // TODO add options variables to mess w/ these
      frameRate(60)
      colorMode(HSB, 100)
}

/**
 * setDotSettings(c) sets the stroke & weight to the dot preferences
 * @param {p5.Color} c is an optional p5 color to set the dots to. useful mainly
 * in procedural context
 */
function setDotSettings(c=null) {

      if (c != null) {
            stroke(c)
      }
      else {
            stroke(options['dots']['dotColor']);
      }

      strokeWeight(options['dots']['dotWeight']);
}

/**
 * setLineSettings() sets stroke & weight settings to the line preferences
 */
function setLineSettings() {

      stroke(options['lines']['lineColor']);

      strokeWeight(options['lines']['lineWeight']);
}

// main loop
function draw()
{
      background(options['bgColor']);

      // provide prompt if the user needs to click initial point location
      if (options['setStart'] == true) {
            stroke('white');
            fill('white')
            textSize(sqrt(options['poisson']['size']))
            text("click to set start location", 10, 50);
            noLoop();
            return;
      }

      // generate all points at once
      if (options['loopSize'] == 0) {
            p.run();
      }
      else {
            // generate points in batches
            for (let i = 0; i < options['loopSize']; i++) {
                  p.yield();
            }
      }

      // get ordered points list
      let points = p.get_points();

      // get points in active list
      let active = p.get_active();

      // draw all points in order w/ connecting lines
      for (let i = 0; i < points.length; i++) {
            if (i > 0 && options['lines']['drawLines']) {

                  setLineSettings();

                  // draw line from prev point to current point
                  line(
                        points[i-1].x, 
                        points[i-1].y, 
                        points[i].x,
                        points[i].y
                  );
            }

            if (options['dots']['drawDots']) {

                  // ? can define custom dot coloring based on order here
                  let c;
                  
                  if (options['dots']['rainbowDots']) {

                        // use linear interpolation to find hue based on dot's
                        // position in ordered list
                        let hue = lerp(
                              options['dots']['startHue'],
                              options['dots']['endHue'], 
                              i / points.length
                        );

                        c = color(hue, 100, 100);
                  }

                  setDotSettings(c);

                  // draw point
                  point(points[i].x, points[i].y)
            }
      }

      // highlight active dots
      if (options['loopSize'] > 0 && options['dots']['drawActive']) {
            for (let i=0; i < active.length; i++) {
                  stroke('red')
                  point(active[i]);
            }
      }

      // pause looping if mouse click used to trigger batches
      if (options['clickContinue']) {
            noLoop()
      }
}

function mouseClicked() {

      // set initial point on mouse click
      if (options['setStart']) {
            p.start(
                  createVector(mouseX, mouseY)
            );

            options['setStart'] = false;
      }

      // hacky but will be turned off in draw loop if clickContinue is true so I
      // think this is actually the simplest solution
      loop();
      
      draw();
}