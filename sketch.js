// Andrew Barlow
// sketch.js
// DESCRIPTION:
// A sketch demonstrating creative applications of my Poisson class, 
// inspired by: https://www.youtube.com/watch?v=flQgnCUxHlw


// poisson instance
let p;

let options = {
      loopSize : 20,                 // 0 to run all at once
      bgColor: 'black',
      setStart: true,
      clickContinue: false,
      poisson: {
            size: 1000,
            radius: 50,
            tries: 30,
      },
      dots: {
            drawDots : true,
            rainbowDots: true,
            startHue: 0,
            endHue: 100,
            dotColor: 'green',
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

      p = new Poisson(
           s,
           options['poisson']['radius'],
           options['poisson']['tries'],
      );
      
      if (!options['setStart']) {
            p.start(createVector(s.x/2, s.y/2));
      }

      frameRate(60)
      colorMode(HSB, 100)
}

function setDotSettings(c=null) {

      if (c != null) {
            stroke(c)
      }
      else {
            stroke(options['dots']['dotColor']);
      }

      strokeWeight(options['dots']['dotWeight']);
}

function setLineSettings() {

      stroke(options['lines']['lineColor']);

      strokeWeight(options['lines']['lineWeight']);
}

function draw()
{
      background('black')

      if (options['setStart'] == true) {
            stroke('white');
            fill('white')
            textSize(sqrt(options['poisson']['size']))
            text("click to set start location", 10, 50);
            noLoop();
            return;
      }

      if (options['loopSize'] == 0) {
            p.run();
      }
      else {
            for (let i = 0; i < options['loopSize']; i++) {
                  p.yield();
            }
      }

      let points = p.get_points();
      let active = p.get_active();

      for (let i = 0; i < points.length; i++) {
            if (i > 0 && options['lines']['drawLines']) {

                  setLineSettings();

                  // draw line from prev point to current point
                  line(
                        points[i-1].x, 
                        points[i-1].y, 
                        points[i].x,
                        points[i].y
                        )
            }

            if (options['dots']['drawDots']) {

                  // ? can define custom dot coloring based on order here
                  let c;
                  
                  if (options['dots']['rainbowDots']) {

                        let hue = lerp(options['dots']['startHue'], options['dots']['endHue'], i / points.length);

                        c = color(hue, 100, 100)
                  }

                  setDotSettings(c);

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

      if (options['clickContinue']) {
            noLoop()
      }
}

function mouseClicked() {
      if (options['setStart']) {
            p.start(
                  createVector(mouseX, mouseY)
            );
            options['setStart'] = false;
      }

      loop();
      
      draw();
}