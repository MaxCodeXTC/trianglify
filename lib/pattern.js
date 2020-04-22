/*
 * Pattern.js
 * Contains rendering implementations for trianglify-generated geometry
 */

// conditionally load jsdom if we don't have a browser environment available.
var doc = (typeof document !== "undefined") ? document : require('jsdom').jsdom('<html/>');

export default function Pattern(points, polys, opts) {

  // SVG rendering method
  function render_svg(svgOpts) {
    var svg = doc.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svg.setAttribute('width', opts.width);
    svg.setAttribute('height', opts.height);
    const suppressNamespace = svgOpts && svgOpts.includeNamespace === false
    if (!suppressNamespace) {
      // needed for many graphics editing programs to support the file properly,
      // can be stripped out in most cases on the web.
      svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
    }

    polys.forEach(function(poly) {
      var path = doc.createElementNS("http://www.w3.org/2000/svg", 'path');
      path.setAttribute("d", "M" + poly[1].join("L") + "Z");
      path.setAttribute("fill", poly[0]);
      path.setAttribute("stroke", poly[0]);
      path.setAttribute("stroke-width", opts.stroke_width);
      svg.appendChild(path);
    });

    return svg;
  }

  function get_canvas() {
    if (typeof process === 'object' &&
        typeof process.versions === 'object' &&
        typeof process.versions.node !== 'undefined') {
      // In Node environment.
      var createCanvas = require('canvas').createCanvas;
      return createCanvas(opts.width, opts.height);
    } else {
      // assume browser-like environment
      var canvas = doc.createElement('canvas');
      canvas.setAttribute('width', opts.width);
      canvas.setAttribute('height', opts.height);
      return canvas;
    }
  }

  // Canvas rendering method
  function render_canvas(destCanvas) {

    var canvas = destCanvas ? destCanvas : get_canvas(opts.width, opts.height);

    var ctx = canvas.getContext("2d");
    ctx.canvas.width = opts.width;
    ctx.canvas.height = opts.height;

    polys.forEach(function(poly) {
      ctx.fillStyle = ctx.strokeStyle = poly[0];
      ctx.lineWidth = opts.stroke_width;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo.apply(ctx, poly[1][0]);
      ctx.lineTo.apply(ctx, poly[1][1]);
      ctx.lineTo.apply(ctx, poly[1][2]);
      ctx.lineTo.apply(ctx, poly[1][0]);
      ctx.fill();
      ctx.stroke();
    });

    return canvas;
  }

  // PNG rendering method
  // currently returns a data url as a string since toBlob support really isn't there yet...
  function render_png() {
    return render_canvas().toDataURL("image/png");
  }

  console.log('got to end of function')
  // Return an object with all the relevant functions/properties attached to it
  return {
    polys: polys,
    opts: opts,
    svg: render_svg,
    canvas: render_canvas,
    png: render_png
  };
}
