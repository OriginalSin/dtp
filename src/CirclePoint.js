const L = window.L;

let renderer = L.canvas();

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
		r = options.radius || 14,
		r2 = 2 * r,
		ctx = this._ctx;

	ctx.save();
	ctx.beginPath();
	ctx.globalAlpha = 1;
	ctx.fillStyle = options.fillColor || 'red';
	if (options.box) {
		ctx.fillRect(p.x - r, p.y - r, r2, r2);
	} else {
		ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
	}
	ctx.fill();
	if (options.stroke) {
		ctx.stroke();
		if (options.box) { ctx.strokeRect(p.x - r, p.y - r, r2, r2); }
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
