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
