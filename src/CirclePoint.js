const L = window.L;

let renderer = L.canvas();

const distVincenty = (latlng1, latlng2) => {
	var rd = Math.PI / 180.0,
		p1 = { lon: rd * latlng1.lng, lat: rd * latlng1.lat },
		p2 = { lon: rd * latlng2.lng, lat: rd * latlng2.lat },
		a = 6378137,
		b = 6356752.3142,
		f = 1 / 298.257223563;  // WGS-84 ellipsiod

	var L1 = p2.lon - p1.lon,
		U1 = Math.atan((1 - f) * Math.tan(p1.lat)),
		U2 = Math.atan((1 - f) * Math.tan(p2.lat)),
		sinU1 = Math.sin(U1), cosU1 = Math.cos(U1),
		sinU2 = Math.sin(U2), cosU2 = Math.cos(U2),
		lambda = L1,
		lambdaP = 2 * Math.PI,
		iterLimit = 20;
	while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0) {
			var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda),
				sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) +
				(cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
			if (sinSigma === 0) { return 0; }
			var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda,
				sigma = Math.atan2(sinSigma, cosSigma),
				sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma,
				cosSqAlpha = 1 - sinAlpha * sinAlpha,
				cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
			if (isNaN(cos2SigmaM)) { cos2SigmaM = 0; }
			var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
			lambdaP = lambda;
			lambda = L1 + (1 - C) * f * sinAlpha *
				(sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
	}
	if (iterLimit === 0) { return NaN; }

	var uSq = cosSqAlpha * ((a * a) / (b * b) - 1),
		A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
		B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
		deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
			B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM))),
		s = b * A * (sigma - deltaSigma);

	//s = s.toFixed(3);
	return s;
};

const getScaleBarDistance = function(z, pos) {
	var merc = L.Projection.Mercator.project(pos),
		pos1 = L.Projection.Mercator.unproject(new L.Point(merc.x + 40, merc.y + 30)),
		metersPerPixel = Math.pow(2, -z) * 156543.033928041 * distVincenty(pos, pos1) / 50;
	return metersPerPixel;
}

const matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
const icon2path = (str, dx, dy, sc) => {
	sc = sc || (20 / 832);
	let p = new Path2D(str),
		p1 = new Path2D();

	p1.addPath(p, matrix.translate(dx, dy).rotate(180).scale(-sc, -sc));
	return p1;
};


const icons = {
	measures: icon2path('M 10.5 9 C 10.132813 9 9.578125 9.167969 9.1875 9.5 C 8.796875 9.832031 8.488281 10.273438 8.0625 10.96875 C 7.738281 11.496094 7.21875 12.621094 6.4375 14.28125 C 5.65625 15.941406 4.6875 18.015625 3.75 20.0625 C 1.875 24.152344 0.09375 28.09375 0.09375 28.09375 C -0.0820313 28.390625 -0.09375 28.753906 0.0625 29.0625 C 0.0703125 29.082031 0.0820313 29.105469 0.09375 29.125 C 0.148438 29.308594 0.210938 29.46875 0.3125 29.59375 C 0.496094 29.816406 0.695313 29.921875 0.84375 30 C 1.144531 30.160156 1.355469 30.226563 1.5 30.3125 C 1.789063 30.488281 2 30.527344 2 31.6875 C 2 34.023438 2.664063 36.609375 4.46875 38.625 C 6.273438 40.640625 9.199219 42 13.40625 42 C 16.816406 42 19.355469 40.886719 20.90625 38.875 C 22.457031 36.863281 23 34.121094 23 31 L 23 28.5625 C 23.351563 28.339844 23.972656 28 25 28 C 26.027344 28 26.648438 28.339844 27 28.5625 L 27 31 C 27 34.121094 27.542969 36.863281 29.09375 38.875 C 30.644531 40.886719 33.183594 42 36.59375 42 C 40.800781 42 43.726563 40.65625 45.53125 38.65625 C 47.335938 36.65625 48 34.101563 48 31.8125 C 48 30.59375 48.226563 30.53125 48.5 30.375 C 48.636719 30.296875 48.824219 30.242188 49.125 30.09375 C 49.277344 30.019531 49.460938 29.910156 49.65625 29.6875 C 49.804688 29.515625 49.917969 29.273438 49.96875 29.03125 C 50.105469 28.726563 50.082031 28.375 49.90625 28.09375 C 49.90625 28.09375 48.125 24.152344 46.25 20.0625 C 45.3125 18.015625 44.34375 15.941406 43.5625 14.28125 C 42.78125 12.621094 42.261719 11.496094 41.9375 10.96875 C 41.511719 10.273438 41.203125 9.832031 40.8125 9.5 C 40.421875 9.167969 39.867188 9 39.5 9 C 39.050781 9 38.546875 9.210938 38.1875 9.53125 C 37.828125 9.851563 37.53125 10.285156 37.15625 10.875 C 36.566406 11.859375 36.15625 12.4375 36.15625 12.4375 C 35.84375 12.902344 35.972656 13.53125 36.4375 13.84375 C 36.902344 14.15625 37.53125 14.027344 37.84375 13.5625 C 37.84375 13.5625 38.246094 12.929688 38.84375 11.9375 C 38.851563 11.921875 38.835938 11.921875 38.84375 11.90625 C 39.144531 11.433594 39.382813 11.175781 39.5 11.0625 C 39.613281 11.160156 39.882813 11.4375 40.25 12.03125 C 40.324219 12.152344 41.003906 13.476563 41.78125 15.125 C 42.558594 16.773438 43.5 18.863281 44.4375 20.90625 C 45.820313 23.917969 46.519531 25.488281 47.125 26.8125 C 46.839844 26.75 46.585938 26.683594 46.25 26.625 C 44.132813 26.257813 40.941406 26 36.40625 26 C 33.464844 26 30.472656 26.660156 28.1875 26.96875 C 27.71875 26.640625 26.699219 26 25 26 C 23.300781 26 22.28125 26.640625 21.8125 26.96875 C 19.527344 26.660156 16.535156 26 13.59375 26 C 9.058594 26 5.863281 26.242188 3.75 26.59375 C 3.414063 26.648438 3.15625 26.71875 2.875 26.78125 C 3.484375 25.449219 4.1875 23.90625 5.5625 20.90625 C 6.5 18.863281 7.441406 16.773438 8.21875 15.125 C 8.996094 13.476563 9.675781 12.152344 9.75 12.03125 L 9.75 12 C 10.105469 11.429688 10.390625 11.160156 10.5 11.0625 C 10.617188 11.175781 10.855469 11.433594 11.15625 11.90625 C 11.164063 11.921875 11.148438 11.921875 11.15625 11.9375 C 11.753906 12.929688 12.15625 13.5625 12.15625 13.5625 C 12.46875 14.027344 13.097656 14.15625 13.5625 13.84375 C 14.027344 13.53125 14.15625 12.902344 13.84375 12.4375 C 13.84375 12.4375 13.433594 11.859375 12.84375 10.875 C 12.46875 10.285156 12.171875 9.851563 11.8125 9.53125 C 11.453125 9.210938 10.949219 9 10.5 9 Z M 13.59375 28 C 16.042969 28 18.679688 28.570313 21 28.90625 L 21 31 C 21 33.878906 20.460938 36.136719 19.3125 37.625 C 18.164063 39.113281 16.398438 40 13.40625 40 C 9.613281 40 7.332031 38.839844 5.9375 37.28125 C 4.542969 35.722656 4 33.652344 4 31.6875 C 4 30.265625 3.398438 29.386719 2.78125 28.875 C 3.160156 28.769531 3.46875 28.667969 4.09375 28.5625 C 6.03125 28.238281 9.128906 28 13.59375 28 Z M 36.40625 28 C 40.871094 28 43.972656 28.261719 45.90625 28.59375 C 46.554688 28.707031 46.871094 28.820313 47.25 28.9375 C 46.613281 29.441406 46 30.34375 46 31.8125 C 46 33.722656 45.457031 35.765625 44.0625 37.3125 C 42.667969 38.859375 40.386719 40 36.59375 40 C 33.601563 40 31.835938 39.113281 30.6875 37.625 C 29.539063 36.136719 29 33.878906 29 31 L 29 28.90625 C 31.320313 28.570313 33.957031 28 36.40625 28 Z', -12, -13, 0.5),
	camera: icon2path('M864 260H728l-32.4-90.8a32.07 32.07 0 0 0-30.2-21.2H358.6c-13.5 0-25.6 8.5-30.1 21.2L296 260H160c-44.2 0-80 35.8-80 80v456c0 44.2 35.8 80 80 80h704c44.2 0 80-35.8 80-80V340c0-44.2-35.8-80-80-80zM512 716c-88.4 0-160-71.6-160-160s71.6-160 160-160 160 71.6 160 160-71.6 160-160 160zm-96-160a96 96 0 1 0 192 0 96 96 0 1 0-192 0z', -12, -13)
};

const myRenderer = L.canvas({padding: 0.5});
L.Canvas.include({
  _updateMarkerPoint: function (layer) {
    if (!this._drawing || layer._empty() || (layer.feature && layer.feature.properties._isHidden)) {
      return;
    }

    var p = layer._point,
      r = layer.options._radiusM,
      img = layer.options.image,
      map = layer._map,
      ctx = this._ctx,
      iconName = layer.options.iconName || 'border';


	if (map) {
		if (img) {
			let w = layer.options.w || 20,
				h = layer.options.h || 20;
			ctx.drawImage(img, p.x - w/2, p.y - h/2, w, h);
			return;
		}
		let z = map._zoom;
		if (r && !map._rpx && map._needRound) {
			// map._rpx = (r * Math.pow(2, z + 8)) / worldWidthFull;
			map._rpx = map._needRound * r / getScaleBarDistance(z, map.getCenter());
			// console.log('ddddd', z, map._rpx);
		}
		if (map._rpx > 20 && map._needRound) {
			ctx.save();
			ctx.beginPath();
			ctx.globalAlpha = 0.2;
			ctx.fillStyle = 'gray';
			ctx.arc(p.x, p.y, map._rpx, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		}
		if (z > 12) {
			ctx.save();
			ctx.beginPath();
			ctx.globalAlpha = 1;
			ctx.fillStyle = 'white';
			ctx.arc(p.x, p.y, 14, 0, 2 * Math.PI);
			ctx.fill();
			ctx.closePath();
			ctx.restore();
		}
		ctx.save();
		ctx.beginPath();
		ctx.translate(p.x - 0, p.y - 0);
		this._fillStroke(ctx, layer);
		ctx.stroke(iconPaths[iconName].path);
		ctx.globalAlpha = layer.options.fillOpacity;
		ctx.fill(iconPaths[iconName].path);
		ctx.closePath();
		ctx.restore();
	}
  },
  _updateCirclePoint: function (layer) {
    if (!this._drawing || layer._empty()) {
      return;
    }

    var p = layer._point,
		options = layer.options,
		// cr = options.cluster && options.cluster.radius || 500,
		r = options.radius || 14,
		r2 = 2 * r,
		map = layer._map,
		ctx = this._ctx;
/*
	if (
		// (options.props.id_stat && options.props.id_skpdi) &&
		// options.cluster.head === options.props.id_stat ||
		// options.cluster.head === options.props.id_skpdi ||
		options.cluster.head === options.props.id
	) {
		if (cr && !map._crpx) {
			map._crpx = cr / getScaleBarDistance(map._zoom, map.getCenter());
		}
		console.log('sddd', map._crpx, options);
		// if (map._crpx > 10) {
			ctx.save();
			ctx.beginPath();
			ctx.globalAlpha = 0.2;
			ctx.fillStyle = options.fillColor || 'gray';
			ctx.arc(p.x, p.y, map._crpx, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		// }
	}*/
	ctx.save();
	ctx.beginPath();
	ctx.globalAlpha = 1;
	ctx.fillStyle = options.fillColor || 'red';
	if (options.triangle) {
		ctx.moveTo(p.x, p.y + r);
		ctx.lineTo(p.x + r, p.y - r);
		ctx.lineTo(p.x - r, p.y - r);
		ctx.lineTo(p.x, p.y + r);
	} else if (options.rhomb) {
		ctx.moveTo(p.x + r, p.y);
		ctx.lineTo(p.x, p.y + r);
		ctx.lineTo(p.x - r, p.y);
		ctx.lineTo(p.x, p.y - r);
		ctx.lineTo(p.x + r, p.y);
	} else if (options.box) {
		ctx.fillRect(p.x - r, p.y - r, r2, r2);
	} else if (options.path) {
		// ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
		let icon = icons[options.path];
		ctx.translate(p.x, p.y);
		ctx.fill(icon);
		ctx.stroke(icon);
	} else {
		ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
	}
	ctx.fill();
	if (options.stroke) {
		ctx.stroke();
		if (options.triangle) {
			ctx.moveTo(p.x, p.y + r);
			ctx.lineTo(p.x + r, p.y - r);
			ctx.lineTo(p.x - r, p.y - r);
			ctx.lineTo(p.x, p.y + r);
		} else if (options.box) {
			ctx.strokeRect(p.x - r, p.y - r, r2, r2);
		} else {
			ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
		}
	}
	ctx.closePath();
	ctx.restore();
  }
});

export const MarkerPoint = L.CircleMarker.extend({
  _updatePath: function () {
    this._renderer._updateMarkerPoint(this);
  }
});
export const CirclePoint = L.CircleMarker.extend({
	options: {
		renderer: renderer
	},
  _updatePath: function () {
    this._renderer._updateCirclePoint(this);
  }
});
export const Bbox = L.Rectangle.extend({
	options: {
		renderer: renderer
	}
});
