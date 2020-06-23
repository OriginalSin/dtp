
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var dtp = (function () {
  'use strict';

  const L$1 = window.L;

  L$1.Control.GmxIcon = L$1.Control.extend({
      includes: L$1.Evented ? L$1.Evented.prototype : L$1.Mixin.Events,
      options: {
          position: 'topleft',
          id: 'defaultIcon',
          isActive: false
      },

      setActive: function (active, skipEvent, originalEvent) {
          var options = this.options,
  			container = this._container,
              togglable = options.togglable || options.toggle;
          if (togglable) {
              var prev = options.isActive,
                  prefix = this._prefix,
                  className = prefix + '-' + options.id;

              options.isActive = active;

              if (this._img) {
                  if (active && options.activeImageUrl) { this._img.src = options.activeImageUrl; }
                  else if (!active && options.regularImageUrl) { this._img.src = options.regularImageUrl; }
              }
              if (active) {
                  L$1.DomUtil.addClass(container, prefix + '-active');
                  L$1.DomUtil.addClass(container, className + '-active');
                  if (container.children.length) {
                      L$1.DomUtil.addClass(container, prefix + '-externalImage-active');
                  }
                  if (options.styleActive) { this.setStyle(options.styleActive); }
              } else {
                  L$1.DomUtil.removeClass(container, prefix + '-active');
                  L$1.DomUtil.removeClass(container, className + '-active');
                  if (container.children.length) {
                      L$1.DomUtil.removeClass(container, prefix + '-externalImage-active');
                  }
                  if (options.style) { this.setStyle(options.style); }
              }
              if (!skipEvent && prev !== active) { this.fire('statechange', originalEvent); }
          }
  		if (L$1.gmxUtil && L$1.gmxUtil.isIEOrEdge) {
  			var uses = container.getElementsByTagName('use');
  			if (uses.length) {
  				var use = uses[0],
  					href = use.getAttribute('href') || use.getAttribute('xlink:href');
  				use.setAttribute('href', href);
  				//use.setAttribute('xlink:href', href);
  			}
  		}
      },

      onAdd: function (map) {
          var img = null,
              span = null,
              options = this.options,
  			svgSprite = options.svgSprite || map.options.svgSprite,
  			prefix = 'leaflet-gmx-icon' + (svgSprite && !options.regularImageUrl && !options.text ? 'Svg' : ''),
              className = prefix + '-' + options.id;

  		this._prefix = prefix;
          var container = L$1.DomUtil.create('div', prefix + ' ' + className);
          container._id = options.id;

          this._container = container;
          if (options.title) { container.title = options.title; }
          this.setStyle = function (style) {
              for (var key in style) {
                  container.style[key] = style[key];
              }
          };
          if (options.className) {
              L$1.DomUtil.addClass(container, options.className);
          }
          if (options.regularImageUrl) {
              img = L$1.DomUtil.create('img', '', container);
              img.src = options.regularImageUrl;
              this._img = img;
              L$1.DomUtil.addClass(container, prefix + '-img');
              L$1.DomUtil.addClass(container, prefix + '-externalImage');
          } else if (options.text) {
              L$1.DomUtil.addClass(container, prefix + '-text');
              span = L$1.DomUtil.create('span', '', container);
              span.innerHTML = options.text;
          } else if (svgSprite) {
            L$1.DomUtil.addClass(container, 'svgIcon');
            var useHref = '#' + options.id.toLowerCase();
            container.innerHTML = '<svg role="img" class="svgIcon"><use xlink:href="' + useHref + '" href="' + useHref + '"></use></svg>';
          } else {
              L$1.DomUtil.addClass(container, prefix + '-img ' +  prefix + '-sprite');
          }
          // if (container.children.length) {
              // L.DomUtil.addClass(container, prefix + '-externalImage');
          // }
          if (options.style) {
              this.setStyle(options.style);
          }

          this._iconClick = function (ev) {
              if (container.parentNode && container === ev.toElement) {
                  this.setActive(!this.options.isActive, false, ev);
                  this.fire('click', ev);
                  if (this.options.stateChange) { this.options.stateChange(this, ev); }
              }
          };
          var stop = L$1.DomEvent.stopPropagation;
          var prevent = L$1.DomEvent.preventDefault;
          L$1.DomEvent
              // .on(this._iconClick, 'click', prevent)
              .on(container, 'mousemove', stop)
              .on(container, 'touchstart', stop)
              .on(container, 'mousedown', stop)
              .on(container, 'dblclick', stop)
              .on(container, 'click', stop)
              .on(container, 'click', this._iconClick, this);
          if (options.onAdd) {
              options.onAdd(this);
          }
          this.fire('controladd');
          map.fire('controladd', this);

          if (options.notHide) {
              container._notHide = true;
          }
          if (map.gmxControlsManager) {
              map.gmxControlsManager.add(this);
          }
          return container;
      },

      onRemove: function (map) {
          if (map.gmxControlsManager) {
              map.gmxControlsManager.remove(this);
          }
          this.fire('controlremove');
          map.fire('controlremove', this);

          var container = this._container,
              stop = L$1.DomEvent.stopPropagation;

          L$1.DomEvent
              .off(container, 'mousemove', stop)
              .off(container, 'touchstart', stop)
              .off(container, 'mousedown', stop)
              .off(container, 'dblclick', stop)
              .off(container, 'click', stop)
              .off(container, 'click', this._iconClick, this);
      },

      addTo: function (map) {
          L$1.Control.prototype.addTo.call(this, map);
          if (this.options.addBefore) {
              this.addBefore(this.options.addBefore);
          }
          return this;
      },

      addBefore: function (id) {
          var parentNode = this._parent && this._parent._container;
          if (!parentNode) {
              parentNode = this._map && this._map._controlCorners[this.getPosition()];
          }
          if (!parentNode) {
              this.options.addBefore = id;
          } else {
              for (var i = 0, len = parentNode.childNodes.length; i < len; i++) {
                  var it = parentNode.childNodes[i];
                  if (id === it._id) {
                      parentNode.insertBefore(this._container, it);
                      break;
                  }
              }
          }

          return this;
      }
  });

  L$1.Control.gmxIcon = L$1.Control.GmxIcon;
  L$1.control.gmxIcon = function (options) {
    return new L$1.Control.GmxIcon(options);
  };

  const L$2 = window.L;

  L$2.Control.GmxCenter = L$2.Control.extend({
      options: {
          position: 'center',
          id: 'center',
          notHide: true,
          color: 'red'
      },

      onRemove: function (map) {
          if (map.gmxControlsManager) {
              map.gmxControlsManager.remove(this);
          }
          map.fire('controlremove', this);
      },

      onAdd: function (map) {
          var className = 'leaflet-gmx-center',
  			svgNS = 'http://www.w3.org/2000/svg',
              container = L$2.DomUtil.create('div', className),
              div = L$2.DomUtil.create('div', className),
              svg = document.createElementNS(svgNS, 'svg'),
              g = document.createElementNS(svgNS, 'g'),
              path = document.createElementNS(svgNS, 'path');

          this._container = container;
          container._id = this.options.id;
          if (this.options.notHide) { container._notHide = true; }

  		path.setAttribute('stroke-width', 2);
  		path.setAttribute('stroke-opacity', 2);
  		path.setAttribute('d', 'M9 0L9 18M0 9L18 9');
          this._path = path;
  		g.appendChild(path);
  		svg.appendChild(g);
          svg.setAttribute('width', 18);
          svg.setAttribute('height', 18);
          div.appendChild(svg);
          container.appendChild(div);

          this.setColor(this.options.color);
          map.fire('controladd', this);
          if (map.gmxControlsManager) {
              map.gmxControlsManager.add(this);
          }
          return container;
      },

      setColor: function (color) {
          this.options.color = color;
          if (this._map) { this._path.setAttribute('stroke', color); }
          return this;
      }
  });

  L$2.Control.gmxCenter = L$2.Control.GmxCenter;
  L$2.control.gmxCenter = function (options) {
    return new L$2.Control.GmxCenter(options);
  };

  const L$3 = window.L;


  L$3.Control.FitCenter = L$3.Control.extend({
      options: {
          position: 'topright',
          id: 'fitcenter',
          notHide: true,
          color: '#216b9c'
      },

      onRemove: function (map) {
          if (map.gmxControlsManager) {
              map.gmxControlsManager.remove(this);
          }
          map
  			.off('moveend', this._update, this)
  			.fire('controlremove', this);
      },

      onAdd: function (map) {
          var id = this.options.id,
  			// stop = L.DomEvent.stopPropagation,
  			className = 'leaflet-gmx-' + id,
              container = L$3.DomUtil.create('div', className),
              // span = L.DomUtil.create('div', '', container),
              input = L$3.DomUtil.create('input', '', container),
              button = L$3.DomUtil.create('button', '', container),
              results = L$3.DomUtil.create('div', 'results', container);

          button.title = 'Переместить центр карты';
          // input.title = 'Координаты центра карты';
          input.placeholder = 'Поиск по адресам, координатам';
  		// this._span = span;
  		this._input = input;
          this._container = container;
          this._results = results;
          container._id = id;

  		map.on('mousemove', ev => {
  			// console.log('mouseover map', ev);
  			this._results.style.display = 'none';
  		}, this);
  		L$3.DomEvent.on(input, 'input', this._getSuggestions, this);
  		L$3.DomEvent.on(input, 'contextmenu', L$3.DomEvent.stopPropagation, this);
  		// L.DomEvent.on(container, 'mousemove', L.DomEvent.stopPropagation);
  		L$3.DomEvent.on(container, 'mousemove', L$3.DomEvent.stop);
  		L$3.DomEvent.on(container, 'mouseover', ev => {
  			if (this._results.style.display !== 'block') {
  				// L.DomEvent.stop(ev);
  				// console.log('mouseover input', ev);
  				this._results.style.display = 'block';
  			}
  		}, this);
  		L$3.DomEvent.on(button, 'click', function () {
  			let arr = input.value.match(/[+-]?([0-9]*[.])?[0-9]+/g);
  			if (arr && arr.length > 1) { map.setView([Number(arr[0]), Number(arr[1])]); }
  		});
  		L$3.DomEvent.disableClickPropagation(container);


          map
  			.on('moveend', this._update, this)
  			.fire('controladd', this);
          if (map.gmxControlsManager) {
              map.gmxControlsManager.add(this);
          }
          return container;
      },

      _parseSearch: function (arr) {
  		arr = arr || [];
  			// console.log('json', arr);
  		if (arr.length) {
  			let results = this._results,
  				frag = document.createDocumentFragment();
  			arr.forEach(it => {
  				let str = it.display_name,
  					bbox = it.boundingbox,
  					node = L$3.DomUtil.create('div', '', frag);
  			    node.innerHTML = str;
  				L$3.DomEvent.on(node, 'click', ev => {
  					// console.log('click', it, arr, ev);
  					this._map.fitBounds([[bbox[0], bbox[2]], [bbox[1], bbox[3]]]);
  				}, this);
  			});
  			this._results.innerText = '';
  			this._results.appendChild(frag);
  			this._results.classList.add('active');
  		}
      },

      _getSuggestions: function (ev) {
  		// street=
  		
  		const val = ev.target.value || 'калужское шоссе',
  			opt = [
  				'format=json',
  				'limit=10',
  				'polygon_text=1',
  				// 'type=trunk',
  				// 'accept-language=ru',
  				// 'county=RU',
  				'bounded=1',
  				'viewbox=34,53,41,57'
  			].join('&'),
  			// q = '&q=' + val;
  			q = '&q=' + encodeURI(val);
  		fetch(`//nominatim.openstreetmap.org/search?${opt}${q}`, {
  		}).then(req => req.json()) 
  		  .then(this._parseSearch.bind(this));
      },

      _update: function (ev) {
  		if (this._map) {
  			this.setCoords(this._map.getCenter());
  		}
      },

      _trunc: function (x) {
          return ('' + (Math.round(10000000 * x) / 10000000 + 0.00000001)).substring(0, 9);
      },

      setCoords: function (latlng) {
          // var x = latlng.lng,
              // y = latlng.lat,
  			// txt = this._trunc(y) + ' ' + this._trunc(x);

  		// this._span.innerHTML = txt;
  		// this._input.value = txt;
          return this;
      }
  });

  L$3.control.fitCenter = function (options) {
    return new L$3.Control.FitCenter(options);
  };

  const yandex = '&copy; <a href="https://n.maps.yandex.ru/?oid=1900133#!/?z=18&ll=36.860478%2C55.429679&l=nk%23map">Yandex</a> contributors',
  	prefix = '//inv.mvs.group/mapcache/',
  	cd = new Date(),
  	m = cd.getMonth() + 1,
  	d = cd.getDate(),
  	dstr = cd.getFullYear() + '.' + (m < 10 ? '0' : '') + m + '.' + (d < 10 ? '0' : '') + d;

  const proxy = {
  	m1: {
  		title: 'Дороги',
  		prefix: prefix + 'm1/',
  		postfix: '?x={x}&y={y}&z={z}&l=mrcss',
  		// errorTileUrlPrefix: '//04.core-nmaps-renderer-nmaps.maps.yandex.net/',
  		errorTileUrlPrefix: '//core-nmaps-mrc-browser.maps.yandex.ru/tiles',
  		options: {
  			key: 'm1',
  			minZoom: 10,
  			maxZoom: 19,
  			attribution: yandex,
  		}
  	},
  	m2: {
  		title: 'Карта(Яндекс)',
  		prefix: prefix + 'm2/tiles',
  		postfix: '?l=map&v=18.01.10-2&x={x}&y={y}&z={z}&scale=1&lang=ru_RU',
  		errorTileUrlPrefix: '//vec01.maps.yandex.net/tiles',
  		options: {
  			key: 'm2',
  			maxNativeZoom: 19,
  			maxZoom: 21,
  			attribution: yandex,
  		}
  	},
  	m3: {
  		title: 'Снимки(Яндекс)',
  		prefix: prefix + 'm3/tiles',
  		postfix: '?l=sat&v=3.462.0&x={x}&y={y}&z={z}&lang=ru_RU',
  		errorTileUrlPrefix: '//sat04.maps.yandex.net/tiles',
  		options: {
  			key: 'm3',
  			maxNativeZoom: 19,
  			maxZoom: 21,
  			attribution: yandex,
  		}
  	},
  	m4: {
  		title: 'Скорость(Народная карта)',
  		prefix: prefix + 'm4/',
  		postfix: '?x={x}&y={y}&z={z}&l=mpskl&sl=104,301135,302526,302827,5300026,5400046,70300236,70300638',
  		errorTileUrlPrefix: '//04.core-nmaps-renderer-nmaps.maps.yandex.net/tile',
  		options: {
  			key: 'm4',
  			minZoom: 8,
  			maxZoom: 19,
  			attribution: yandex,
  		}
  	},
  	m5: {
  		title: 'Светофоры',
  		prefix: prefix + 'm5/',
  		postfix: '?x={x}&y={y}&z={z}&l=mpskl&sl=301750',
  		errorTileUrlPrefix: '//04.core-nmaps-renderer-nmaps.maps.yandex.net/tile',
  		// errorTileUrlPrefix: '//01.core-nmaps-renderer-nmaps.maps.yandex.net/',
  		options: {
  			key: 'm4',
  			minZoom: 12,
  			maxZoom: 19,
  			attribution: yandex,
  		}
  	},
  	m6: {
  		title: 'Дороги в стадии строительства',
  		// prefix: prefix + 'm6/',
  		prefix: '//03.core-nmaps-renderer-nmaps.maps.yandex.net/',
  		postfix: '?x={x}&y={y}&z={z}&l=mpskl&sl=70300289',
  		errorTileUrlPrefix: '//03.core-nmaps-renderer-nmaps.maps.yandex.net/',
  		options: {
  			key: 'm6',
  			minZoom: 10,
  			maxZoom: 19,
  			attribution: yandex,
  		}
  	// },
  	// m7: {
  		// title: 'Панорамы',
  		// prefix: '//03.core-stv-renderer.maps.yandex.net/2.x/tiles',
  		// postfix: '?x={x}&y={y}&z={z}&l=stv,sta&scale=1&v=2019.11.29.18.52-1&lang=ru_RU&format=png',
  		// errorTileUrlPrefix: '//03.core-stv-renderer.maps.yandex.net/2.x/tiles',
  		// options: {
  			// key: 'm7',
  			// minZoom: 8,
  			// maxZoom: 19,
  			// attribution: yandex,
  		// }
  	}
  };

  const hrefParams = {};
  if (window.URLSearchParams) {
  	new URLSearchParams(window.location.search).forEach((value, key) => { hrefParams[key] = value; });
  }

  const L$4 = window.L;

  let renderer = L$4.canvas();

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
  	var merc = L$4.Projection.Mercator.project(pos),
  		pos1 = L$4.Projection.Mercator.unproject(new L$4.Point(merc.x + 40, merc.y + 30)),
  		metersPerPixel = Math.pow(2, -z) * 156543.033928041 * distVincenty(pos, pos1) / 50;
  	return metersPerPixel;
  };

  const matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
  const icon2path = (str, dx, dy) => {
  	let sc = 20 / 832,
  		p = new Path2D(str),
  		p1 = new Path2D();

  	p1.addPath(p, matrix.translate(dx, dy).rotate(180).scale(-sc, -sc));
  	return p1;
  };


  const icons = {
  	camera: icon2path('M864 260H728l-32.4-90.8a32.07 32.07 0 0 0-30.2-21.2H358.6c-13.5 0-25.6 8.5-30.1 21.2L296 260H160c-44.2 0-80 35.8-80 80v456c0 44.2 35.8 80 80 80h704c44.2 0 80-35.8 80-80V340c0-44.2-35.8-80-80-80zM512 716c-88.4 0-160-71.6-160-160s71.6-160 160-160 160 71.6 160 160-71.6 160-160 160zm-96-160a96 96 0 1 0 192 0 96 96 0 1 0-192 0z', -12, -13)
  };

  const myRenderer = L$4.canvas({padding: 0.5});
  L$4.Canvas.include({
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

  const MarkerPoint = L$4.CircleMarker.extend({
    _updatePath: function () {
      this._renderer._updateMarkerPoint(this);
    }
  });
  const CirclePoint = L$4.CircleMarker.extend({
  	options: {
  		renderer: renderer
  	},
    _updatePath: function () {
      this._renderer._updateCirclePoint(this);
    }
  });
  const Bbox = L$4.Rectangle.extend({
  	options: {
  		renderer: renderer
  	}
  });

  function noop() { }
  function add_location(element, file, line, column, char) {
      element.__svelte_meta = {
          loc: { file, line, column, char }
      };
  }
  function run(fn) {
      return fn();
  }
  function blank_object() {
      return Object.create(null);
  }
  function run_all(fns) {
      fns.forEach(run);
  }
  function is_function(thing) {
      return typeof thing === 'function';
  }
  function safe_not_equal(a, b) {
      return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
  }
  function null_to_empty(value) {
      return value == null ? '' : value;
  }

  function append(target, node) {
      target.appendChild(node);
  }
  function insert(target, node, anchor) {
      target.insertBefore(node, anchor || null);
  }
  function detach(node) {
      node.parentNode.removeChild(node);
  }
  function destroy_each(iterations, detaching) {
      for (let i = 0; i < iterations.length; i += 1) {
          if (iterations[i])
              iterations[i].d(detaching);
      }
  }
  function element(name) {
      return document.createElement(name);
  }
  function text(data) {
      return document.createTextNode(data);
  }
  function space() {
      return text(' ');
  }
  function empty() {
      return text('');
  }
  function listen(node, event, handler, options) {
      node.addEventListener(event, handler, options);
      return () => node.removeEventListener(event, handler, options);
  }
  function prevent_default(fn) {
      return function (event) {
          event.preventDefault();
          // @ts-ignore
          return fn.call(this, event);
      };
  }
  function stop_propagation(fn) {
      return function (event) {
          event.stopPropagation();
          // @ts-ignore
          return fn.call(this, event);
      };
  }
  function attr(node, attribute, value) {
      if (value == null)
          node.removeAttribute(attribute);
      else if (node.getAttribute(attribute) !== value)
          node.setAttribute(attribute, value);
  }
  function to_number(value) {
      return value === '' ? undefined : +value;
  }
  function children(element) {
      return Array.from(element.childNodes);
  }
  function set_input_value(input, value) {
      if (value != null || input.value) {
          input.value = value;
      }
  }
  function set_style(node, key, value, important) {
      node.style.setProperty(key, value, important ? 'important' : '');
  }
  function select_option(select, value) {
      for (let i = 0; i < select.options.length; i += 1) {
          const option = select.options[i];
          if (option.__value === value) {
              option.selected = true;
              return;
          }
      }
  }
  function select_options(select, value) {
      for (let i = 0; i < select.options.length; i += 1) {
          const option = select.options[i];
          option.selected = ~value.indexOf(option.__value);
      }
  }
  function select_value(select) {
      const selected_option = select.querySelector(':checked') || select.options[0];
      return selected_option && selected_option.__value;
  }
  function select_multiple_value(select) {
      return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
  }
  function custom_event(type, detail) {
      const e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, false, false, detail);
      return e;
  }

  let current_component;
  function set_current_component(component) {
      current_component = component;
  }
  function get_current_component() {
      if (!current_component)
          throw new Error(`Function called outside component initialization`);
      return current_component;
  }
  function onMount(fn) {
      get_current_component().$$.on_mount.push(fn);
  }
  function afterUpdate(fn) {
      get_current_component().$$.after_update.push(fn);
  }
  function createEventDispatcher() {
      const component = get_current_component();
      return (type, detail) => {
          const callbacks = component.$$.callbacks[type];
          if (callbacks) {
              // TODO are there situations where events could be dispatched
              // in a server (non-DOM) environment?
              const event = custom_event(type, detail);
              callbacks.slice().forEach(fn => {
                  fn.call(component, event);
              });
          }
      };
  }

  const dirty_components = [];
  const binding_callbacks = [];
  const render_callbacks = [];
  const flush_callbacks = [];
  const resolved_promise = Promise.resolve();
  let update_scheduled = false;
  function schedule_update() {
      if (!update_scheduled) {
          update_scheduled = true;
          resolved_promise.then(flush);
      }
  }
  function add_render_callback(fn) {
      render_callbacks.push(fn);
  }
  let flushing = false;
  const seen_callbacks = new Set();
  function flush() {
      if (flushing)
          return;
      flushing = true;
      do {
          // first, call beforeUpdate functions
          // and update components
          for (let i = 0; i < dirty_components.length; i += 1) {
              const component = dirty_components[i];
              set_current_component(component);
              update(component.$$);
          }
          dirty_components.length = 0;
          while (binding_callbacks.length)
              binding_callbacks.pop()();
          // then, once components are updated, call
          // afterUpdate functions. This may cause
          // subsequent updates...
          for (let i = 0; i < render_callbacks.length; i += 1) {
              const callback = render_callbacks[i];
              if (!seen_callbacks.has(callback)) {
                  // ...so guard against infinite loops
                  seen_callbacks.add(callback);
                  callback();
              }
          }
          render_callbacks.length = 0;
      } while (dirty_components.length);
      while (flush_callbacks.length) {
          flush_callbacks.pop()();
      }
      update_scheduled = false;
      flushing = false;
      seen_callbacks.clear();
  }
  function update($$) {
      if ($$.fragment !== null) {
          $$.update();
          run_all($$.before_update);
          const dirty = $$.dirty;
          $$.dirty = [-1];
          $$.fragment && $$.fragment.p($$.ctx, dirty);
          $$.after_update.forEach(add_render_callback);
      }
  }
  const outroing = new Set();
  let outros;
  function group_outros() {
      outros = {
          r: 0,
          c: [],
          p: outros // parent group
      };
  }
  function check_outros() {
      if (!outros.r) {
          run_all(outros.c);
      }
      outros = outros.p;
  }
  function transition_in(block, local) {
      if (block && block.i) {
          outroing.delete(block);
          block.i(local);
      }
  }
  function transition_out(block, local, detach, callback) {
      if (block && block.o) {
          if (outroing.has(block))
              return;
          outroing.add(block);
          outros.c.push(() => {
              outroing.delete(block);
              if (callback) {
                  if (detach)
                      block.d(1);
                  callback();
              }
          });
          block.o(local);
      }
  }

  const globals = (typeof window !== 'undefined' ? window : global);
  function create_component(block) {
      block && block.c();
  }
  function mount_component(component, target, anchor) {
      const { fragment, on_mount, on_destroy, after_update } = component.$$;
      fragment && fragment.m(target, anchor);
      // onMount happens before the initial afterUpdate
      add_render_callback(() => {
          const new_on_destroy = on_mount.map(run).filter(is_function);
          if (on_destroy) {
              on_destroy.push(...new_on_destroy);
          }
          else {
              // Edge case - component was destroyed immediately,
              // most likely as a result of a binding initialising
              run_all(new_on_destroy);
          }
          component.$$.on_mount = [];
      });
      after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
      const $$ = component.$$;
      if ($$.fragment !== null) {
          run_all($$.on_destroy);
          $$.fragment && $$.fragment.d(detaching);
          // TODO null out other refs, including component.$$ (but need to
          // preserve final state?)
          $$.on_destroy = $$.fragment = null;
          $$.ctx = [];
      }
  }
  function make_dirty(component, i) {
      if (component.$$.dirty[0] === -1) {
          dirty_components.push(component);
          schedule_update();
          component.$$.dirty.fill(0);
      }
      component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
  }
  function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
      const parent_component = current_component;
      set_current_component(component);
      const prop_values = options.props || {};
      const $$ = component.$$ = {
          fragment: null,
          ctx: null,
          // state
          props,
          update: noop,
          not_equal,
          bound: blank_object(),
          // lifecycle
          on_mount: [],
          on_destroy: [],
          before_update: [],
          after_update: [],
          context: new Map(parent_component ? parent_component.$$.context : []),
          // everything else
          callbacks: blank_object(),
          dirty
      };
      let ready = false;
      $$.ctx = instance
          ? instance(component, prop_values, (i, ret, ...rest) => {
              const value = rest.length ? rest[0] : ret;
              if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                  if ($$.bound[i])
                      $$.bound[i](value);
                  if (ready)
                      make_dirty(component, i);
              }
              return ret;
          })
          : [];
      $$.update();
      ready = true;
      run_all($$.before_update);
      // `false` as a special case of no DOM component
      $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
      if (options.target) {
          if (options.hydrate) {
              const nodes = children(options.target);
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.l(nodes);
              nodes.forEach(detach);
          }
          else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.c();
          }
          if (options.intro)
              transition_in(component.$$.fragment);
          mount_component(component, options.target, options.anchor);
          flush();
      }
      set_current_component(parent_component);
  }
  class SvelteComponent {
      $destroy() {
          destroy_component(this, 1);
          this.$destroy = noop;
      }
      $on(type, callback) {
          const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
          callbacks.push(callback);
          return () => {
              const index = callbacks.indexOf(callback);
              if (index !== -1)
                  callbacks.splice(index, 1);
          };
      }
      $set() {
          // overridden by instance, if it has props
      }
  }

  function dispatch_dev(type, detail) {
      document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
  }
  function append_dev(target, node) {
      dispatch_dev("SvelteDOMInsert", { target, node });
      append(target, node);
  }
  function insert_dev(target, node, anchor) {
      dispatch_dev("SvelteDOMInsert", { target, node, anchor });
      insert(target, node, anchor);
  }
  function detach_dev(node) {
      dispatch_dev("SvelteDOMRemove", { node });
      detach(node);
  }
  function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
      const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
      if (has_prevent_default)
          modifiers.push('preventDefault');
      if (has_stop_propagation)
          modifiers.push('stopPropagation');
      dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
      const dispose = listen(node, event, handler, options);
      return () => {
          dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
          dispose();
      };
  }
  function attr_dev(node, attribute, value) {
      attr(node, attribute, value);
      if (value == null)
          dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
      else
          dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
  }
  function prop_dev(node, property, value) {
      node[property] = value;
      dispatch_dev("SvelteDOMSetProperty", { node, property, value });
  }
  function set_data_dev(text, data) {
      data = '' + data;
      if (text.data === data)
          return;
      dispatch_dev("SvelteDOMSetData", { node: text, data });
      text.data = data;
  }
  function validate_each_argument(arg) {
      if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
          let msg = '{#each} only iterates over array-like objects.';
          if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
              msg += ' You can use a spread to convert this iterable into an array.';
          }
          throw new Error(msg);
      }
  }
  function validate_slots(name, slot, keys) {
      for (const slot_key of Object.keys(slot)) {
          if (!~keys.indexOf(slot_key)) {
              console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
          }
      }
  }
  class SvelteComponentDev extends SvelteComponent {
      constructor(options) {
          if (!options || (!options.target && !options.$$inline)) {
              throw new Error(`'target' is a required option`);
          }
          super();
      }
      $destroy() {
          super.$destroy();
          this.$destroy = () => {
              console.warn(`Component was already destroyed`); // eslint-disable-line no-console
          };
      }
      $capture_state() { }
      $inject_state() { }
  }

  /* src\Modal.svelte generated by Svelte v3.20.1 */
  const file = "src\\Modal.svelte";

  function get_each_context(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[7] = list[i];
  	child_ctx[9] = i;
  	return child_ctx;
  }

  // (60:6) {#each data as pt, index}
  function create_each_block(ctx) {
  	let li;
  	let li_class_value;
  	let li_value_value;
  	let li_aria_label_value;
  	let dispose;

  	function click_handler(...args) {
  		return /*click_handler*/ ctx[6](/*index*/ ctx[9], ...args);
  	}

  	const block = {
  		c: function create() {
  			li = element("li");
  			attr_dev(li, "class", li_class_value = "dot" + (/*index*/ ctx[9] === /*cur*/ ctx[1] ? " selected" : "") + " svelte-jjp3es");
  			li.value = li_value_value = /*index*/ ctx[9];
  			attr_dev(li, "role", "button");
  			attr_dev(li, "tabindex", "0");
  			attr_dev(li, "aria-label", li_aria_label_value = "slide item " + /*index*/ ctx[9]);
  			add_location(li, file, 60, 6, 2601);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, li, anchor);
  			if (remount) dispose();
  			dispose = listen_dev(li, "click", stop_propagation(click_handler), false, false, true);
  		},
  		p: function update(new_ctx, dirty) {
  			ctx = new_ctx;

  			if (dirty & /*cur*/ 2 && li_class_value !== (li_class_value = "dot" + (/*index*/ ctx[9] === /*cur*/ ctx[1] ? " selected" : "") + " svelte-jjp3es")) {
  				attr_dev(li, "class", li_class_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block.name,
  		type: "each",
  		source: "(60:6) {#each data as pt, index}",
  		ctx
  	});

  	return block;
  }

  function create_fragment(ctx) {
  	let div0;
  	let t0;
  	let div9;
  	let div1;
  	let t1;
  	let div8;
  	let div3;
  	let div2;
  	let t2_value = (/*data*/ ctx[0][/*cur*/ ctx[1]].kindName || "Фото и схемы ДТП") + "";
  	let t2;
  	let t3;
  	let div7;
  	let div6;
  	let div5;
  	let button0;
  	let t4;
  	let div4;
  	let a;
  	let img;
  	let img_src_value;
  	let a_href_value;
  	let t5;
  	let button1;
  	let t6;
  	let ul;
  	let t7;
  	let p;
  	let t8_value = /*cur*/ ctx[1] + 1 + "";
  	let t8;
  	let t9;
  	let t10_value = /*data*/ ctx[0].length + "";
  	let t10;
  	let dispose;
  	let each_value = /*data*/ ctx[0];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = space();
  			div9 = element("div");
  			div1 = element("div");
  			t1 = space();
  			div8 = element("div");
  			div3 = element("div");
  			div2 = element("div");
  			t2 = text(t2_value);
  			t3 = space();
  			div7 = element("div");
  			div6 = element("div");
  			div5 = element("div");
  			button0 = element("button");
  			t4 = space();
  			div4 = element("div");
  			a = element("a");
  			img = element("img");
  			t5 = space();
  			button1 = element("button");
  			t6 = space();
  			ul = element("ul");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t7 = space();
  			p = element("p");
  			t8 = text(t8_value);
  			t9 = text(" из ");
  			t10 = text(t10_value);
  			attr_dev(div0, "class", "modal-background svelte-jjp3es");
  			add_location(div0, file, 42, 0, 1536);
  			attr_dev(div1, "title", "Закрыть");
  			attr_dev(div1, "class", "ant-modal-close svelte-jjp3es");
  			add_location(div1, file, 45, 1, 1694);
  			attr_dev(div2, "class", "ant-modal-title");
  			attr_dev(div2, "id", "rcDialogTitle1");
  			add_location(div2, file, 48, 3, 1848);
  			attr_dev(div3, "class", "ant-modal-header svelte-jjp3es");
  			add_location(div3, file, 47, 2, 1814);
  			attr_dev(button0, "type", "button");
  			attr_dev(button0, "aria-label", "previous slide / item");
  			attr_dev(button0, "class", "control-arrow control-prev svelte-jjp3es");
  			add_location(button0, file, 53, 5, 2064);
  			if (img.src !== (img_src_value = "" + (prefix$1 + /*data*/ ctx[0][/*cur*/ ctx[1]].guid))) attr_dev(img, "src", img_src_value);
  			attr_dev(img, "alt", "");
  			attr_dev(img, "class", "svelte-jjp3es");
  			add_location(img, file, 55, 87, 2335);
  			attr_dev(a, "target", "_blank");
  			attr_dev(a, "href", a_href_value = "" + (prefix$1 + /*data*/ ctx[0][/*cur*/ ctx[1]].guid));
  			attr_dev(a, "title", "Открыть на весь экран");
  			attr_dev(a, "class", "svelte-jjp3es");
  			add_location(a, file, 55, 6, 2254);
  			attr_dev(div4, "class", "slider-wrapper axis-horizontal svelte-jjp3es");
  			add_location(div4, file, 54, 5, 2203);
  			attr_dev(button1, "type", "button");
  			attr_dev(button1, "aria-label", "next slide / item");
  			attr_dev(button1, "class", "control-arrow control-next svelte-jjp3es");
  			add_location(button1, file, 57, 5, 2402);
  			attr_dev(ul, "class", "control-dots svelte-jjp3es");
  			add_location(ul, file, 58, 5, 2537);
  			attr_dev(p, "class", "carousel-status svelte-jjp3es");
  			add_location(p, file, 63, 5, 2808);
  			attr_dev(div5, "class", "carousel carousel-slider svelte-jjp3es");
  			set_style(div5, "width", "100%");
  			add_location(div5, file, 52, 4, 1999);
  			add_location(div6, file, 51, 3, 1989);
  			attr_dev(div7, "class", "ant-modal-body svelte-jjp3es");
  			add_location(div7, file, 50, 2, 1957);
  			attr_dev(div8, "class", "ant-modal-content svelte-jjp3es");
  			add_location(div8, file, 46, 1, 1780);
  			attr_dev(div9, "class", "modal svelte-jjp3es");
  			attr_dev(div9, "role", "dialog");
  			attr_dev(div9, "aria-modal", "true");
  			add_location(div9, file, 44, 0, 1607);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div9, anchor);
  			append_dev(div9, div1);
  			append_dev(div9, t1);
  			append_dev(div9, div8);
  			append_dev(div8, div3);
  			append_dev(div3, div2);
  			append_dev(div2, t2);
  			append_dev(div8, t3);
  			append_dev(div8, div7);
  			append_dev(div7, div6);
  			append_dev(div6, div5);
  			append_dev(div5, button0);
  			append_dev(div5, t4);
  			append_dev(div5, div4);
  			append_dev(div4, a);
  			append_dev(a, img);
  			append_dev(div5, t5);
  			append_dev(div5, button1);
  			append_dev(div5, t6);
  			append_dev(div5, ul);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul, null);
  			}

  			append_dev(div5, t7);
  			append_dev(div5, p);
  			append_dev(p, t8);
  			append_dev(p, t9);
  			append_dev(p, t10);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(div0, "click", stop_propagation(/*close*/ ctx[2]), false, false, true),
  				listen_dev(div1, "click", stop_propagation(/*close*/ ctx[2]), false, false, true),
  				listen_dev(button0, "click", stop_propagation(/*prev*/ ctx[3]), false, false, true),
  				listen_dev(button1, "click", stop_propagation(/*next*/ ctx[4]), false, false, true),
  				listen_dev(div9, "click", stop_propagation(click_handler_1), false, false, true)
  			];
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*data, cur*/ 3 && t2_value !== (t2_value = (/*data*/ ctx[0][/*cur*/ ctx[1]].kindName || "Фото и схемы ДТП") + "")) set_data_dev(t2, t2_value);

  			if (dirty & /*data, cur*/ 3 && img.src !== (img_src_value = "" + (prefix$1 + /*data*/ ctx[0][/*cur*/ ctx[1]].guid))) {
  				attr_dev(img, "src", img_src_value);
  			}

  			if (dirty & /*data, cur*/ 3 && a_href_value !== (a_href_value = "" + (prefix$1 + /*data*/ ctx[0][/*cur*/ ctx[1]].guid))) {
  				attr_dev(a, "href", a_href_value);
  			}

  			if (dirty & /*cur, data*/ 3) {
  				each_value = /*data*/ ctx[0];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ul, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}

  			if (dirty & /*cur*/ 2 && t8_value !== (t8_value = /*cur*/ ctx[1] + 1 + "")) set_data_dev(t8, t8_value);
  			if (dirty & /*data*/ 1 && t10_value !== (t10_value = /*data*/ ctx[0].length + "")) set_data_dev(t10, t10_value);
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div9);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  const prefix$1 = "//map.mvs.group/skpdi/proxy.php?guid=";

  const click_handler_1 = () => {
  	
  };

  function instance($$self, $$props, $$invalidate) {
  	const dispatch = createEventDispatcher();

  	const close = () => {
  		// console.log('modal close');
  		dispatch("close");
  	};

  	let { data } = $$props;
  	let cur = 0;

  	const prev = () => {
  		if (cur) {
  			$$invalidate(1, cur--, cur);
  		}
  	};

  	const next = () => {
  		if (cur < data.length - 1) {
  			$$invalidate(1, cur++, cur);
  		}
  	};

  	const writable_props = ["data"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("Modal", $$slots, []);

  	const click_handler = index => {
  		$$invalidate(1, cur = index);
  	};

  	$$self.$set = $$props => {
  		if ("data" in $$props) $$invalidate(0, data = $$props.data);
  	};

  	$$self.$capture_state = () => ({
  		createEventDispatcher,
  		dispatch,
  		close,
  		prefix: prefix$1,
  		data,
  		cur,
  		prev,
  		next
  	});

  	$$self.$inject_state = $$props => {
  		if ("data" in $$props) $$invalidate(0, data = $$props.data);
  		if ("cur" in $$props) $$invalidate(1, cur = $$props.cur);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [data, cur, close, prev, next, dispatch, click_handler];
  }

  class Modal extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance, create_fragment, safe_not_equal, { data: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "Modal",
  			options,
  			id: create_fragment.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
  			console.warn("<Modal> was created without expected prop 'data'");
  		}
  	}

  	get data() {
  		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set data(value) {
  		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  /* src\DtpPopupGibdd.svelte generated by Svelte v3.20.1 */

  const { console: console_1 } = globals;
  const file$1 = "src\\DtpPopupGibdd.svelte";

  function get_each_context_1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[9] = list[i];
  	return child_ctx;
  }

  function get_each_context$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[6] = list[i];
  	return child_ctx;
  }

  // (85:6) {#if pt.ts}
  function create_if_block_7(ctx) {
  	let li;
  	let t_value = /*pt*/ ctx[6].ts + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$1, 84, 17, 2089);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_7.name,
  		type: "if",
  		source: "(85:6) {#if pt.ts}",
  		ctx
  	});

  	return block;
  }

  // (87:7) {#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}
  function create_if_block_6(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[9].k_uch + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$1, 86, 52, 2191);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_6.name,
  		type: "if",
  		source: "(87:7) {#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}",
  		ctx
  	});

  	return block;
  }

  // (88:7) {#if pt1.npdd}
  function create_if_block_5(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[9].npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$1, 87, 21, 2238);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_5.name,
  		type: "if",
  		source: "(88:7) {#if pt1.npdd}",
  		ctx
  	});

  	return block;
  }

  // (89:7) {#if pt1.sop_npdd}
  function create_if_block_4(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[9].sop_npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$1, 88, 25, 2288);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_4.name,
  		type: "if",
  		source: "(89:7) {#if pt1.sop_npdd}",
  		ctx
  	});

  	return block;
  }

  // (86:6) {#each pt.arr as pt1}
  function create_each_block_1(ctx) {
  	let t0;
  	let t1;
  	let if_block2_anchor;
  	let if_block0 = /*pt1*/ ctx[9].k_uch && (/*pt1*/ ctx[9].npdd || /*pt1*/ ctx[9].sop_npdd) && create_if_block_6(ctx);
  	let if_block1 = /*pt1*/ ctx[9].npdd && create_if_block_5(ctx);
  	let if_block2 = /*pt1*/ ctx[9].sop_npdd && create_if_block_4(ctx);

  	const block = {
  		c: function create() {
  			if (if_block0) if_block0.c();
  			t0 = space();
  			if (if_block1) if_block1.c();
  			t1 = space();
  			if (if_block2) if_block2.c();
  			if_block2_anchor = empty();
  		},
  		m: function mount(target, anchor) {
  			if (if_block0) if_block0.m(target, anchor);
  			insert_dev(target, t0, anchor);
  			if (if_block1) if_block1.m(target, anchor);
  			insert_dev(target, t1, anchor);
  			if (if_block2) if_block2.m(target, anchor);
  			insert_dev(target, if_block2_anchor, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (/*pt1*/ ctx[9].k_uch && (/*pt1*/ ctx[9].npdd || /*pt1*/ ctx[9].sop_npdd)) if_block0.p(ctx, dirty);
  			if (/*pt1*/ ctx[9].npdd) if_block1.p(ctx, dirty);
  			if (/*pt1*/ ctx[9].sop_npdd) if_block2.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (if_block0) if_block0.d(detaching);
  			if (detaching) detach_dev(t0);
  			if (if_block1) if_block1.d(detaching);
  			if (detaching) detach_dev(t1);
  			if (if_block2) if_block2.d(detaching);
  			if (detaching) detach_dev(if_block2_anchor);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_1.name,
  		type: "each",
  		source: "(86:6) {#each pt.arr as pt1}",
  		ctx
  	});

  	return block;
  }

  // (84:5) {#each tsInfoArr as pt}
  function create_each_block$1(ctx) {
  	let t;
  	let each_1_anchor;
  	let if_block = /*pt*/ ctx[6].ts && create_if_block_7(ctx);
  	let each_value_1 = /*pt*/ ctx[6].arr;
  	validate_each_argument(each_value_1);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  	}

  	const block = {
  		c: function create() {
  			if (if_block) if_block.c();
  			t = space();

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			each_1_anchor = empty();
  		},
  		m: function mount(target, anchor) {
  			if (if_block) if_block.m(target, anchor);
  			insert_dev(target, t, anchor);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, each_1_anchor, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (/*pt*/ ctx[6].ts) if_block.p(ctx, dirty);

  			if (dirty & /*tsInfoArr*/ 4) {
  				each_value_1 = /*pt*/ ctx[6].arr;
  				validate_each_argument(each_value_1);
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1(ctx, each_value_1, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_1.length;
  			}
  		},
  		d: function destroy(detaching) {
  			if (if_block) if_block.d(detaching);
  			if (detaching) detach_dev(t);
  			destroy_each(each_blocks, detaching);
  			if (detaching) detach_dev(each_1_anchor);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$1.name,
  		type: "each",
  		source: "(84:5) {#each tsInfoArr as pt}",
  		ctx
  	});

  	return block;
  }

  // (98:4) {#if prp.spog}
  function create_if_block_3(ctx) {
  	let div2;
  	let div0;
  	let t1;
  	let div1;
  	let t2_value = /*prp*/ ctx[0].spog + "";
  	let t2;

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			div0.textContent = "Погода:";
  			t1 = space();
  			div1 = element("div");
  			t2 = text(t2_value);
  			attr_dev(div0, "class", "stitle");
  			add_location(div0, file$1, 99, 6, 2501);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$1, 99, 40, 2535);
  			add_location(div2, file$1, 98, 5, 2489);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div2, t1);
  			append_dev(div2, div1);
  			append_dev(div1, t2);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && t2_value !== (t2_value = /*prp*/ ctx[0].spog + "")) set_data_dev(t2, t2_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_3.name,
  		type: "if",
  		source: "(98:4) {#if prp.spog}",
  		ctx
  	});

  	return block;
  }

  // (103:4) {#if prp.s_pch}
  function create_if_block_2(ctx) {
  	let div2;
  	let div0;
  	let t1;
  	let div1;
  	let t2_value = /*prp*/ ctx[0].s_pch + "";
  	let t2;

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			div0.textContent = "Покрытие:";
  			t1 = space();
  			div1 = element("div");
  			t2 = text(t2_value);
  			attr_dev(div0, "class", "stitle");
  			add_location(div0, file$1, 104, 6, 2629);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$1, 104, 42, 2665);
  			add_location(div2, file$1, 103, 5, 2617);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div2, t1);
  			append_dev(div2, div1);
  			append_dev(div1, t2);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && t2_value !== (t2_value = /*prp*/ ctx[0].s_pch + "")) set_data_dev(t2, t2_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_2.name,
  		type: "if",
  		source: "(103:4) {#if prp.s_pch}",
  		ctx
  	});

  	return block;
  }

  // (108:4) {#if prp.osv}
  function create_if_block_1(ctx) {
  	let div2;
  	let div0;
  	let t1;
  	let div1;
  	let t2_value = /*prp*/ ctx[0].osv + "";
  	let t2;

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			div0.textContent = "Освещенность:";
  			t1 = space();
  			div1 = element("div");
  			t2 = text(t2_value);
  			attr_dev(div0, "class", "stitle");
  			add_location(div0, file$1, 109, 6, 2758);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$1, 109, 46, 2798);
  			add_location(div2, file$1, 108, 5, 2746);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div2, t1);
  			append_dev(div2, div1);
  			append_dev(div1, t2);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && t2_value !== (t2_value = /*prp*/ ctx[0].osv + "")) set_data_dev(t2, t2_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_1.name,
  		type: "if",
  		source: "(108:4) {#if prp.osv}",
  		ctx
  	});

  	return block;
  }

  // (113:4) {#if prp.ndu}
  function create_if_block(ctx) {
  	let div2;
  	let div0;
  	let t1;
  	let div1;
  	let t2_value = /*prp*/ ctx[0].ndu + "";
  	let t2;

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			div0.textContent = "Иные условия:";
  			t1 = space();
  			div1 = element("div");
  			t2 = text(t2_value);
  			attr_dev(div0, "class", "stitle");
  			add_location(div0, file$1, 114, 6, 2889);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$1, 114, 46, 2929);
  			add_location(div2, file$1, 113, 5, 2877);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div2, t1);
  			append_dev(div2, div1);
  			append_dev(div1, t2);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && t2_value !== (t2_value = /*prp*/ ctx[0].ndu + "")) set_data_dev(t2, t2_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block.name,
  		type: "if",
  		source: "(113:4) {#if prp.ndu}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$1(ctx) {
  	let div2;
  	let div0;
  	let b0;
  	let t0_value = (/*prp*/ ctx[0].name || /*prp*/ ctx[0].dtvp || "") + "";
  	let t0;
  	let t1;
  	let div1;
  	let table;
  	let tbody;
  	let tr0;
  	let td0;
  	let t3;
  	let td1;
  	let t4_value = (/*prp*/ ctx[0].sid || /*prp*/ ctx[0].id_stat || /*prp*/ ctx[0].id_skpdi || "") + "";
  	let t4;
  	let t5;
  	let tr1;
  	let td2;
  	let t7;
  	let td3;
  	let t8_value = (/*prp*/ ctx[0].district || "") + "";
  	let t8;
  	let t9;
  	let t10_value = (/*prp*/ ctx[0].dor || "") + "";
  	let t10;
  	let t11;
  	let tr2;
  	let td4;
  	let t13;
  	let td5;
  	let b1;
  	let t14_value = (/*prp*/ ctx[0].km || 0) + "";
  	let t14;
  	let t15;
  	let b2;
  	let t16_value = (/*prp*/ ctx[0].m || 0) + "";
  	let t16;
  	let t17;
  	let t18;
  	let tr3;
  	let td6;
  	let t20;
  	let td7;
  	let t21_value = /*prp*/ ctx[0].lat + "";
  	let t21;
  	let t22;
  	let t23_value = /*prp*/ ctx[0].lon + "";
  	let t23;
  	let t24;
  	let span;
  	let t25;
  	let tr4;
  	let td8;
  	let t27;
  	let td9;
  	let t28_value = (/*prp*/ ctx[0].collision_date || /*prp*/ ctx[0].dtp_date || "") + "";
  	let t28;
  	let t29;
  	let tr5;
  	let td10;
  	let t31;
  	let td11;
  	let t32_value = (/*prp*/ ctx[0].dtvp || "") + "";
  	let t32;
  	let t33;
  	let tr6;
  	let td12;
  	let t35;
  	let td13;
  	let ul;
  	let t36;
  	let tr7;
  	let td14;
  	let t38;
  	let td15;
  	let t39;
  	let t40;
  	let t41;
  	let t42;
  	let tr8;
  	let td16;
  	let t44;
  	let td17;
  	let b3;
  	let t45_value = /*prp*/ ctx[0].pog + "";
  	let t45;
  	let t46;
  	let t47_value = /*prp*/ ctx[0].ran + "";
  	let t47;
  	let dispose;
  	let each_value = /*tsInfoArr*/ ctx[2];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  	}

  	let if_block0 = /*prp*/ ctx[0].spog && create_if_block_3(ctx);
  	let if_block1 = /*prp*/ ctx[0].s_pch && create_if_block_2(ctx);
  	let if_block2 = /*prp*/ ctx[0].osv && create_if_block_1(ctx);
  	let if_block3 = /*prp*/ ctx[0].ndu && create_if_block(ctx);

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			b0 = element("b");
  			t0 = text(t0_value);
  			t1 = space();
  			div1 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "ID:";
  			t3 = space();
  			td1 = element("td");
  			t4 = text(t4_value);
  			t5 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Адрес:";
  			t7 = space();
  			td3 = element("td");
  			t8 = text(t8_value);
  			t9 = space();
  			t10 = text(t10_value);
  			t11 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Пикетаж:";
  			t13 = space();
  			td5 = element("td");
  			b1 = element("b");
  			t14 = text(t14_value);
  			t15 = text(" км. ");
  			b2 = element("b");
  			t16 = text(t16_value);
  			t17 = text(" м.");
  			t18 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Координаты:";
  			t20 = space();
  			td7 = element("td");
  			t21 = text(t21_value);
  			t22 = space();
  			t23 = text(t23_value);
  			t24 = space();
  			span = element("span");
  			t25 = space();
  			tr4 = element("tr");
  			td8 = element("td");
  			td8.textContent = "Дата/время:";
  			t27 = space();
  			td9 = element("td");
  			t28 = text(t28_value);
  			t29 = space();
  			tr5 = element("tr");
  			td10 = element("td");
  			td10.textContent = "Вид ДТП:";
  			t31 = space();
  			td11 = element("td");
  			t32 = text(t32_value);
  			t33 = space();
  			tr6 = element("tr");
  			td12 = element("td");
  			td12.textContent = "Нарушения:";
  			t35 = space();
  			td13 = element("td");
  			ul = element("ul");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t36 = space();
  			tr7 = element("tr");
  			td14 = element("td");
  			td14.textContent = "Условия:";
  			t38 = space();
  			td15 = element("td");
  			if (if_block0) if_block0.c();
  			t39 = space();
  			if (if_block1) if_block1.c();
  			t40 = space();
  			if (if_block2) if_block2.c();
  			t41 = space();
  			if (if_block3) if_block3.c();
  			t42 = space();
  			tr8 = element("tr");
  			td16 = element("td");
  			td16.textContent = "Количество погибших/раненых:";
  			t44 = space();
  			td17 = element("td");
  			b3 = element("b");
  			t45 = text(t45_value);
  			t46 = text("/");
  			t47 = text(t47_value);
  			add_location(b0, file$1, 50, 4, 1120);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$1, 49, 2, 1096);
  			attr_dev(td0, "class", "first svelte-ipyqnf");
  			add_location(td0, file$1, 56, 5, 1243);
  			add_location(td1, file$1, 57, 5, 1275);
  			add_location(tr0, file$1, 55, 3, 1233);
  			attr_dev(td2, "class", "first svelte-ipyqnf");
  			add_location(td2, file$1, 60, 5, 1353);
  			add_location(td3, file$1, 61, 5, 1388);
  			add_location(tr1, file$1, 59, 3, 1343);
  			attr_dev(td4, "class", "first svelte-ipyqnf");
  			add_location(td4, file$1, 64, 5, 1456);
  			add_location(b1, file$1, 65, 9, 1497);
  			add_location(b2, file$1, 65, 34, 1522);
  			add_location(td5, file$1, 65, 5, 1493);
  			add_location(tr2, file$1, 63, 3, 1446);
  			attr_dev(td6, "class", "first svelte-ipyqnf");
  			add_location(td6, file$1, 68, 5, 1572);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$1, 69, 29, 1636);
  			add_location(td7, file$1, 69, 5, 1612);
  			add_location(tr3, file$1, 67, 3, 1562);
  			attr_dev(td8, "class", "first svelte-ipyqnf");
  			add_location(td8, file$1, 72, 5, 1764);
  			add_location(td9, file$1, 73, 5, 1804);
  			add_location(tr4, file$1, 71, 3, 1754);
  			attr_dev(td10, "class", "first svelte-ipyqnf");
  			add_location(td10, file$1, 76, 5, 1878);
  			add_location(td11, file$1, 77, 5, 1915);
  			add_location(tr5, file$1, 75, 3, 1868);
  			attr_dev(td12, "class", "first svelte-ipyqnf");
  			add_location(td12, file$1, 80, 14, 1981);
  			add_location(ul, file$1, 82, 4, 2038);
  			add_location(td13, file$1, 81, 14, 2029);
  			add_location(tr6, file$1, 79, 12, 1962);
  			attr_dev(td14, "class", "first svelte-ipyqnf");
  			add_location(td14, file$1, 95, 14, 2414);
  			add_location(td15, file$1, 96, 14, 2460);
  			add_location(tr7, file$1, 94, 12, 2395);
  			attr_dev(td16, "class", "first svelte-ipyqnf");
  			add_location(td16, file$1, 120, 14, 3045);
  			add_location(b3, file$1, 121, 18, 3115);
  			add_location(td17, file$1, 121, 14, 3111);
  			add_location(tr8, file$1, 119, 12, 3026);
  			add_location(tbody, file$1, 54, 3, 1222);
  			attr_dev(table, "class", "table");
  			add_location(table, file$1, 53, 4, 1197);
  			attr_dev(div1, "class", "featureCont");
  			add_location(div1, file$1, 52, 2, 1167);
  			attr_dev(div2, "class", "mvsPopup svelte-ipyqnf");
  			add_location(div2, file$1, 48, 3, 1071);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div0, b0);
  			append_dev(b0, t0);
  			append_dev(div2, t1);
  			append_dev(div2, div1);
  			append_dev(div1, table);
  			append_dev(table, tbody);
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t3);
  			append_dev(tr0, td1);
  			append_dev(td1, t4);
  			append_dev(tbody, t5);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t7);
  			append_dev(tr1, td3);
  			append_dev(td3, t8);
  			append_dev(td3, t9);
  			append_dev(td3, t10);
  			append_dev(tbody, t11);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t13);
  			append_dev(tr2, td5);
  			append_dev(td5, b1);
  			append_dev(b1, t14);
  			append_dev(td5, t15);
  			append_dev(td5, b2);
  			append_dev(b2, t16);
  			append_dev(td5, t17);
  			append_dev(tbody, t18);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, t20);
  			append_dev(tr3, td7);
  			append_dev(td7, t21);
  			append_dev(td7, t22);
  			append_dev(td7, t23);
  			append_dev(td7, t24);
  			append_dev(td7, span);
  			append_dev(tbody, t25);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td8);
  			append_dev(tr4, t27);
  			append_dev(tr4, td9);
  			append_dev(td9, t28);
  			append_dev(tbody, t29);
  			append_dev(tbody, tr5);
  			append_dev(tr5, td10);
  			append_dev(tr5, t31);
  			append_dev(tr5, td11);
  			append_dev(td11, t32);
  			append_dev(tbody, t33);
  			append_dev(tbody, tr6);
  			append_dev(tr6, td12);
  			append_dev(tr6, t35);
  			append_dev(tr6, td13);
  			append_dev(td13, ul);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul, null);
  			}

  			append_dev(tbody, t36);
  			append_dev(tbody, tr7);
  			append_dev(tr7, td14);
  			append_dev(tr7, t38);
  			append_dev(tr7, td15);
  			if (if_block0) if_block0.m(td15, null);
  			append_dev(td15, t39);
  			if (if_block1) if_block1.m(td15, null);
  			append_dev(td15, t40);
  			if (if_block2) if_block2.m(td15, null);
  			append_dev(td15, t41);
  			if (if_block3) if_block3.m(td15, null);
  			append_dev(tbody, t42);
  			append_dev(tbody, tr8);
  			append_dev(tr8, td16);
  			append_dev(tr8, t44);
  			append_dev(tr8, td17);
  			append_dev(td17, b3);
  			append_dev(b3, t45);
  			append_dev(b3, t46);
  			append_dev(b3, t47);
  			if (remount) dispose();
  			dispose = listen_dev(span, "click", /*copyParent*/ ctx[1], false, false, false);
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 1 && t0_value !== (t0_value = (/*prp*/ ctx[0].name || /*prp*/ ctx[0].dtvp || "") + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 1 && t4_value !== (t4_value = (/*prp*/ ctx[0].sid || /*prp*/ ctx[0].id_stat || /*prp*/ ctx[0].id_skpdi || "") + "")) set_data_dev(t4, t4_value);
  			if (dirty & /*prp*/ 1 && t8_value !== (t8_value = (/*prp*/ ctx[0].district || "") + "")) set_data_dev(t8, t8_value);
  			if (dirty & /*prp*/ 1 && t10_value !== (t10_value = (/*prp*/ ctx[0].dor || "") + "")) set_data_dev(t10, t10_value);
  			if (dirty & /*prp*/ 1 && t14_value !== (t14_value = (/*prp*/ ctx[0].km || 0) + "")) set_data_dev(t14, t14_value);
  			if (dirty & /*prp*/ 1 && t16_value !== (t16_value = (/*prp*/ ctx[0].m || 0) + "")) set_data_dev(t16, t16_value);
  			if (dirty & /*prp*/ 1 && t21_value !== (t21_value = /*prp*/ ctx[0].lat + "")) set_data_dev(t21, t21_value);
  			if (dirty & /*prp*/ 1 && t23_value !== (t23_value = /*prp*/ ctx[0].lon + "")) set_data_dev(t23, t23_value);
  			if (dirty & /*prp*/ 1 && t28_value !== (t28_value = (/*prp*/ ctx[0].collision_date || /*prp*/ ctx[0].dtp_date || "") + "")) set_data_dev(t28, t28_value);
  			if (dirty & /*prp*/ 1 && t32_value !== (t32_value = (/*prp*/ ctx[0].dtvp || "") + "")) set_data_dev(t32, t32_value);

  			if (dirty & /*tsInfoArr*/ 4) {
  				each_value = /*tsInfoArr*/ ctx[2];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$1(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ul, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}

  			if (/*prp*/ ctx[0].spog) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_3(ctx);
  					if_block0.c();
  					if_block0.m(td15, t39);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*prp*/ ctx[0].s_pch) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_2(ctx);
  					if_block1.c();
  					if_block1.m(td15, t40);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if (/*prp*/ ctx[0].osv) {
  				if (if_block2) {
  					if_block2.p(ctx, dirty);
  				} else {
  					if_block2 = create_if_block_1(ctx);
  					if_block2.c();
  					if_block2.m(td15, t41);
  				}
  			} else if (if_block2) {
  				if_block2.d(1);
  				if_block2 = null;
  			}

  			if (/*prp*/ ctx[0].ndu) {
  				if (if_block3) {
  					if_block3.p(ctx, dirty);
  				} else {
  					if_block3 = create_if_block(ctx);
  					if_block3.c();
  					if_block3.m(td15, null);
  				}
  			} else if (if_block3) {
  				if_block3.d(1);
  				if_block3 = null;
  			}

  			if (dirty & /*prp*/ 1 && t45_value !== (t45_value = /*prp*/ ctx[0].pog + "")) set_data_dev(t45, t45_value);
  			if (dirty & /*prp*/ 1 && t47_value !== (t47_value = /*prp*/ ctx[0].ran + "")) set_data_dev(t47, t47_value);
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  			destroy_each(each_blocks, detaching);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			if (if_block2) if_block2.d();
  			if (if_block3) if_block3.d();
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$1.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$1($$self, $$props, $$invalidate) {
  	let { showModal = false } = $$props;
  	let { prp } = $$props;
  	let modal;
  	let disabled = prp.skpdiFiles ? "" : "disabled";

  	afterUpdate(() => {
  		// console.log('the component just updated', showModal, modal);
  		if (showModal) {
  			modal = new Modal({
  					target: document.body,
  					props: { data: prp.skpdiFiles }
  				});

  			modal.$on("close", ev => {
  				modal.$destroy();
  				$$invalidate(3, showModal = false);
  			});
  		}
  	});

  	const copyParent = ev => {
  		navigator.clipboard.writeText(ev.target.parentNode.textContent).catch(err => {
  			console.log("Something went wrong", err);
  		});
  	};

  	const tsInfoArr = (prp.tsInfo || []).map(it => {
  		let ts_uch = it.ts_uch || [];

  		return {
  			ts: it.ts !== "Осталось на месте ДТП" ? it.ts : "",
  			arr: ts_uch.map(pt => {
  				return {
  					k_uch: pt.k_uch || "",
  					npdd: pt.npdd !== "Нет нарушений" ? pt.npdd : "",
  					sop_npdd: pt.sop_npdd !== "Нет нарушений" ? pt.sop_npdd : ""
  				};
  			})
  		};
  	});

  	const writable_props = ["showModal", "prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<DtpPopupGibdd> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupGibdd", $$slots, []);

  	$$self.$set = $$props => {
  		if ("showModal" in $$props) $$invalidate(3, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({
  		afterUpdate,
  		Modal,
  		showModal,
  		prp,
  		modal,
  		disabled,
  		copyParent,
  		tsInfoArr
  	});

  	$$self.$inject_state = $$props => {
  		if ("showModal" in $$props) $$invalidate(3, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("modal" in $$props) modal = $$props.modal;
  		if ("disabled" in $$props) disabled = $$props.disabled;
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [prp, copyParent, tsInfoArr, showModal];
  }

  class DtpPopupGibdd extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$1, create_fragment$1, safe_not_equal, { showModal: 3, prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupGibdd",
  			options,
  			id: create_fragment$1.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1.warn("<DtpPopupGibdd> was created without expected prop 'prp'");
  		}
  	}

  	get showModal() {
  		throw new Error("<DtpPopupGibdd>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set showModal(value) {
  		throw new Error("<DtpPopupGibdd>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get prp() {
  		throw new Error("<DtpPopupGibdd>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupGibdd>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$5 = window.L;

  const popup = L$5.popup();
  let argFilters;
  const setPopup = function (id) {
  	let url = 'https://dtp.mvs.group/scripts/index.php?request=get_dtp_id&id=' + id + '&type=gibdd';
  	fetch(url, {})
  		.then(req => req.json())
  		.then(json => {
  // console.log('bindPopup', layer, json, DtpPopup);
  			let cont = L$5.DomUtil.create('div');
  			const app = new DtpPopupGibdd({
  				target: cont,
  				props: {
  					prp: json
  				}
  			});
  			popup._svObj = app;
  			popup.setContent(cont);
  		});
  	return '';
  };

  // let renderer = L.canvas();
  const DtpGibdd = L$5.featureGroup([]);
  DtpGibdd._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
  DtpGibdd.checkZoom = z => {
  	if (Object.keys(DtpGibdd._layers).length) {
  		if (z < 12) {
  			DtpGibdd.setFilter(argFilters);
  		}
  	} else if (z > 11) {
  		DtpGibdd.setFilter(argFilters);
  	}
  };
  DtpGibdd.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	if (!DtpGibdd._map) { return; }
  	DtpGibdd.clearLayers();
  	argFilters = arg || [];

  	let arr = [], heat = [];
  	if (DtpGibdd._group) {
  		DtpGibdd._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters.forEach(ft => {
  				if (ft.type === 'collision_type') {
  					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
  					// if (prp.collision_type === ft.zn) {
  						cnt++;
  					}
  				} else if (ft.type === 'date') {
  					if (prp.date >= ft.zn[0] && prp.date < ft.zn[1]) {
  						cnt++;
  					}
  				}
  			});
  			if (cnt === argFilters.length) {
  				arr.push(it);
  				heat.push(it._latlng);
  			}
  		});
  		if (DtpGibdd._needHeat) {
  			DtpGibdd._map.addLayer(DtpGibdd._heat);
  			DtpGibdd._heat.setLatLngs(heat);
  			DtpGibdd._heat.setOptions(DtpGibdd._needHeat);
  			if (DtpGibdd._map._zoom > 11) {
  				DtpGibdd.addLayer(L$5.layerGroup(arr));
  			}
  		} else {
  			DtpGibdd.addLayer(L$5.layerGroup(arr));
  			DtpGibdd._map.removeLayer(DtpGibdd._heat);
  		}

  	}
  };

  DtpGibdd.on('remove', (ev) => {
  	// DtpGibdd._needHeat = null;
  	DtpGibdd._map.removeLayer(DtpGibdd._heat);
  	DtpGibdd.clearLayers();
  }).on('add', ev => {
  	// console.log('/static/data/dtpskpdi.geojson', ev);
  	DtpGibdd._heat = L$5.heatLayer([], {
  		// blur: 50,
  		gradient: {0.1: 'blue', 0.4: 'lime', 1: 'red'}
  	});

  	fetch('https://dtp.mvs.group/scripts/index.php?request=get_stat_gipdd', {})
  		.then(req => req.json())
  		.then(json => {
  			let opt = {collision_type: {}, iconType: {}};
  			let heat = [];
  			let arr = json.map(prp => {
  				let iconType = prp.iconType || 0,
  					stroke = false,
  					fillColor = '#2F4F4F'; //   17-20
  				if (iconType) {
  					stroke = iconType % 2 === 0 ? true : false; //  - смертельные ДТП
  					if (iconType >= 1 && iconType <= 6) {
  						fillColor = '#8B4513'; //  1-6
  					} else if (iconType === 7 || iconType === 8) {
  						fillColor = '#228B22'; //  7-8
  					} else if (iconType >= 9 && iconType <= 14) {
  						fillColor = '#8B4513'; //  9-14
  					} else if (iconType === 15 || iconType === 16) {
  						fillColor = '#7B68EE'; //  15-16
  					} else if (iconType === 17 || iconType === 18) {
  						fillColor = '#2F4F4F'; //  17-18
  					}
  				}
  if (!prp.lat || !prp.lon) {
  console.log('_______', prp);
  	prp.lat = prp.lon = 0;
  }
  				let cTypeCount = opt.collision_type[prp.collision_type];
  				if (!cTypeCount) {
  					cTypeCount = 1;
  				} else {
  					cTypeCount++;
  				}
  				opt.collision_type[prp.collision_type] = cTypeCount;
  				opt.iconType[prp.collision_type] = iconType;

  				let latLng = L$5.latLng(prp.lat, prp.lon, stroke ? 1 : 0.5);
  				heat.push(latLng);

  				return new CirclePoint(latLng, {
  					props: prp,
  					radius: 6,
  					// box: true,
  					stroke: stroke,
  					fillColor: fillColor,
  					// renderer: renderer
  				}).bindPopup(popup).on('popupopen', (ev) => {
  						setPopup(ev.target.options.props.id);
  						// console.log('popupopen', ev);
  					}).on('popupclose', (ev) => {
  						// console.log('popupclose', ev);
  						// ev.popup.setContent('');
  						if (ev.popup._svObj) {
  							ev.popup._svObj.$destroy();
  							delete ev.popup._svObj;
  						}
  					});
  			});
  			// let out = {arr: arr, heat: heat, opt: opt};
  			// target._data = out;
  			// return out;
  			// if (target._heat) {
  				DtpGibdd.addLayer(DtpGibdd._heat);
  				DtpGibdd._heat.setLatLngs(heat);
  				DtpGibdd._heat.setOptions(DtpGibdd._needHeat);
  			// }

  			DtpGibdd._opt = opt;
  			DtpGibdd._group = L$5.layerGroup(arr);

  			if (argFilters) {
  				DtpGibdd.setFilter(argFilters);
  			} else if (DtpGibdd._map._zoom > 11) {
  				DtpGibdd.addLayer(DtpGibdd._group);
  			}
  			DtpGibdd._refreshFilters();
  		});
  });

  /* src\DtpPopupSkpdi.svelte generated by Svelte v3.20.1 */

  const { console: console_1$1 } = globals;
  const file$2 = "src\\DtpPopupSkpdi.svelte";

  function get_each_context$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[6] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[6] = list[i];
  	return child_ctx;
  }

  // (71:5) {#if prp.collisionTypes && prp.collisionTypes.length}
  function create_if_block_1$1(ctx) {
  	let each_1_anchor;
  	let each_value_1 = /*prp*/ ctx[1].collisionTypes;
  	validate_each_argument(each_value_1);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
  	}

  	const block = {
  		c: function create() {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			each_1_anchor = empty();
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, each_1_anchor, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 2) {
  				each_value_1 = /*prp*/ ctx[1].collisionTypes;
  				validate_each_argument(each_value_1);
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_1$1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_1.length;
  			}
  		},
  		d: function destroy(detaching) {
  			destroy_each(each_blocks, detaching);
  			if (detaching) detach_dev(each_1_anchor);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_1$1.name,
  		type: "if",
  		source: "(71:5) {#if prp.collisionTypes && prp.collisionTypes.length}",
  		ctx
  	});

  	return block;
  }

  // (72:5) {#each prp.collisionTypes as pt}
  function create_each_block_1$1(ctx) {
  	let li;
  	let t_value = (/*pt*/ ctx[6].collisionType || "") + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$2, 72, 5, 1846);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 2 && t_value !== (t_value = (/*pt*/ ctx[6].collisionType || "") + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_1$1.name,
  		type: "each",
  		source: "(72:5) {#each prp.collisionTypes as pt}",
  		ctx
  	});

  	return block;
  }

  // (83:5) {#if prp.uchs && prp.uchs.length}
  function create_if_block$1(ctx) {
  	let each_1_anchor;
  	let each_value = /*prp*/ ctx[1].uchs;
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  	}

  	const block = {
  		c: function create() {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			each_1_anchor = empty();
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, each_1_anchor, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 2) {
  				each_value = /*prp*/ ctx[1].uchs;
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$2(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$2(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		d: function destroy(detaching) {
  			destroy_each(each_blocks, detaching);
  			if (detaching) detach_dev(each_1_anchor);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block$1.name,
  		type: "if",
  		source: "(83:5) {#if prp.uchs && prp.uchs.length}",
  		ctx
  	});

  	return block;
  }

  // (84:5) {#each prp.uchs as pt}
  function create_each_block$2(ctx) {
  	let li;
  	let t0_value = (/*pt*/ ctx[6].collisionPartyCategory || "") + "";
  	let t0;
  	let t1;
  	let b;
  	let i;
  	let t2;
  	let t3_value = (/*pt*/ ctx[6].collisionPartyCond || "") + "";
  	let t3;
  	let t4;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t0 = text(t0_value);
  			t1 = space();
  			b = element("b");
  			i = element("i");
  			t2 = text("(");
  			t3 = text(t3_value);
  			t4 = text(")");
  			add_location(i, file$2, 84, 46, 2149);
  			add_location(b, file$2, 84, 43, 2146);
  			add_location(li, file$2, 84, 5, 2108);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t0);
  			append_dev(li, t1);
  			append_dev(li, b);
  			append_dev(b, i);
  			append_dev(i, t2);
  			append_dev(i, t3);
  			append_dev(i, t4);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 2 && t0_value !== (t0_value = (/*pt*/ ctx[6].collisionPartyCategory || "") + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 2 && t3_value !== (t3_value = (/*pt*/ ctx[6].collisionPartyCond || "") + "")) set_data_dev(t3, t3_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$2.name,
  		type: "each",
  		source: "(84:5) {#each prp.uchs as pt}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$2(ctx) {
  	let div4;
  	let div0;
  	let b0;
  	let t0_value = (/*prp*/ ctx[1].name || /*prp*/ ctx[1].dtvp || "") + "";
  	let t0;
  	let t1;
  	let div3;
  	let table;
  	let tbody;
  	let tr0;
  	let td0;
  	let t3;
  	let td1;
  	let t4_value = (/*prp*/ ctx[1].sid || /*prp*/ ctx[1].id_stat || /*prp*/ ctx[1].id_skpdi || "") + "";
  	let t4;
  	let t5;
  	let tr1;
  	let td2;
  	let t7;
  	let td3;
  	let b1;
  	let t8_value = (/*prp*/ ctx[1].km || 0) + "";
  	let t8;
  	let t9;
  	let b2;
  	let t10_value = (/*prp*/ ctx[1].m || 0) + "";
  	let t10;
  	let t11;
  	let t12;
  	let tr2;
  	let td4;
  	let t14;
  	let td5;
  	let t15_value = /*prp*/ ctx[1].lat + "";
  	let t15;
  	let t16;
  	let t17_value = /*prp*/ ctx[1].lon + "";
  	let t17;
  	let t18;
  	let span;
  	let t19;
  	let tr3;
  	let td6;
  	let t21;
  	let td7;
  	let t22_value = (/*prp*/ ctx[1].collision_date || /*prp*/ ctx[1].dtp_date || "") + "";
  	let t22;
  	let t23;
  	let tr4;
  	let td8;
  	let div1;
  	let t25;
  	let div2;
  	let t26_value = (/*prp*/ ctx[1].collision_context || /*prp*/ ctx[1].dtp_date || "") + "";
  	let t26;
  	let t27;
  	let tr5;
  	let td9;
  	let t29;
  	let td10;
  	let ul0;
  	let t30;
  	let tr6;
  	let td11;
  	let t32;
  	let td12;
  	let ul1;
  	let t33;
  	let tr7;
  	let td13;
  	let button;
  	let t34;
  	let dispose;
  	let if_block0 = /*prp*/ ctx[1].collisionTypes && /*prp*/ ctx[1].collisionTypes.length && create_if_block_1$1(ctx);
  	let if_block1 = /*prp*/ ctx[1].uchs && /*prp*/ ctx[1].uchs.length && create_if_block$1(ctx);

  	const block = {
  		c: function create() {
  			div4 = element("div");
  			div0 = element("div");
  			b0 = element("b");
  			t0 = text(t0_value);
  			t1 = space();
  			div3 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "ID:";
  			t3 = space();
  			td1 = element("td");
  			t4 = text(t4_value);
  			t5 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Пикетаж:";
  			t7 = space();
  			td3 = element("td");
  			b1 = element("b");
  			t8 = text(t8_value);
  			t9 = text(" км. ");
  			b2 = element("b");
  			t10 = text(t10_value);
  			t11 = text(" м.");
  			t12 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Координаты:";
  			t14 = space();
  			td5 = element("td");
  			t15 = text(t15_value);
  			t16 = space();
  			t17 = text(t17_value);
  			t18 = space();
  			span = element("span");
  			t19 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Дата/время:";
  			t21 = space();
  			td7 = element("td");
  			t22 = text(t22_value);
  			t23 = space();
  			tr4 = element("tr");
  			td8 = element("td");
  			div1 = element("div");
  			div1.textContent = "Условия ДТП:";
  			t25 = space();
  			div2 = element("div");
  			t26 = text(t26_value);
  			t27 = space();
  			tr5 = element("tr");
  			td9 = element("td");
  			td9.textContent = "Нарушения:";
  			t29 = space();
  			td10 = element("td");
  			ul0 = element("ul");
  			if (if_block0) if_block0.c();
  			t30 = space();
  			tr6 = element("tr");
  			td11 = element("td");
  			td11.textContent = "Участники:";
  			t32 = space();
  			td12 = element("td");
  			ul1 = element("ul");
  			if (if_block1) if_block1.c();
  			t33 = space();
  			tr7 = element("tr");
  			td13 = element("td");
  			button = element("button");
  			t34 = text("Фото и схемы");
  			add_location(b0, file$2, 38, 4, 855);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$2, 37, 2, 831);
  			attr_dev(td0, "class", "first");
  			add_location(td0, file$2, 44, 5, 978);
  			add_location(td1, file$2, 45, 5, 1010);
  			add_location(tr0, file$2, 43, 3, 968);
  			attr_dev(td2, "class", "first");
  			add_location(td2, file$2, 48, 5, 1088);
  			add_location(b1, file$2, 49, 9, 1129);
  			add_location(b2, file$2, 49, 34, 1154);
  			add_location(td3, file$2, 49, 5, 1125);
  			add_location(tr1, file$2, 47, 3, 1078);
  			attr_dev(td4, "class", "first");
  			add_location(td4, file$2, 53, 5, 1205);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$2, 54, 29, 1269);
  			add_location(td5, file$2, 54, 5, 1245);
  			add_location(tr2, file$2, 52, 3, 1195);
  			attr_dev(td6, "class", "first");
  			add_location(td6, file$2, 57, 5, 1397);
  			add_location(td7, file$2, 58, 5, 1437);
  			add_location(tr3, file$2, 56, 3, 1387);
  			attr_dev(div1, "class", "first");
  			add_location(div1, file$2, 62, 4, 1532);
  			add_location(div2, file$2, 63, 4, 1574);
  			attr_dev(td8, "colspan", "2");
  			add_location(td8, file$2, 61, 5, 1511);
  			add_location(tr4, file$2, 60, 3, 1501);
  			attr_dev(td9, "class", "first");
  			add_location(td9, file$2, 67, 14, 1682);
  			add_location(ul0, file$2, 69, 4, 1739);
  			add_location(td10, file$2, 68, 14, 1730);
  			add_location(tr5, file$2, 66, 12, 1663);
  			attr_dev(td11, "class", "first");
  			add_location(td11, file$2, 79, 14, 1974);
  			add_location(ul1, file$2, 81, 4, 2031);
  			add_location(td12, file$2, 80, 14, 2022);
  			add_location(tr6, file$2, 78, 12, 1955);
  			attr_dev(button, "class", "primary svelte-1aipaym");
  			button.disabled = /*disabled*/ ctx[2];
  			add_location(button, file$2, 93, 4, 2310);
  			attr_dev(td13, "class", "center");
  			attr_dev(td13, "colspan", "2");
  			add_location(td13, file$2, 92, 5, 2274);
  			add_location(tr7, file$2, 91, 3, 2264);
  			add_location(tbody, file$2, 42, 3, 957);
  			attr_dev(table, "class", "table");
  			add_location(table, file$2, 41, 4, 932);
  			attr_dev(div3, "class", "featureCont");
  			add_location(div3, file$2, 40, 2, 902);
  			attr_dev(div4, "class", "mvsPopup");
  			add_location(div4, file$2, 36, 3, 806);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div4, anchor);
  			append_dev(div4, div0);
  			append_dev(div0, b0);
  			append_dev(b0, t0);
  			append_dev(div4, t1);
  			append_dev(div4, div3);
  			append_dev(div3, table);
  			append_dev(table, tbody);
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t3);
  			append_dev(tr0, td1);
  			append_dev(td1, t4);
  			append_dev(tbody, t5);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t7);
  			append_dev(tr1, td3);
  			append_dev(td3, b1);
  			append_dev(b1, t8);
  			append_dev(td3, t9);
  			append_dev(td3, b2);
  			append_dev(b2, t10);
  			append_dev(td3, t11);
  			append_dev(tbody, t12);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t14);
  			append_dev(tr2, td5);
  			append_dev(td5, t15);
  			append_dev(td5, t16);
  			append_dev(td5, t17);
  			append_dev(td5, t18);
  			append_dev(td5, span);
  			append_dev(tbody, t19);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, t21);
  			append_dev(tr3, td7);
  			append_dev(td7, t22);
  			append_dev(tbody, t23);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td8);
  			append_dev(td8, div1);
  			append_dev(td8, t25);
  			append_dev(td8, div2);
  			append_dev(div2, t26);
  			append_dev(tbody, t27);
  			append_dev(tbody, tr5);
  			append_dev(tr5, td9);
  			append_dev(tr5, t29);
  			append_dev(tr5, td10);
  			append_dev(td10, ul0);
  			if (if_block0) if_block0.m(ul0, null);
  			append_dev(tbody, t30);
  			append_dev(tbody, tr6);
  			append_dev(tr6, td11);
  			append_dev(tr6, t32);
  			append_dev(tr6, td12);
  			append_dev(td12, ul1);
  			if (if_block1) if_block1.m(ul1, null);
  			append_dev(tbody, t33);
  			append_dev(tbody, tr7);
  			append_dev(tr7, td13);
  			append_dev(td13, button);
  			append_dev(button, t34);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(span, "click", /*copyParent*/ ctx[3], false, false, false),
  				listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false)
  			];
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 2 && t0_value !== (t0_value = (/*prp*/ ctx[1].name || /*prp*/ ctx[1].dtvp || "") + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 2 && t4_value !== (t4_value = (/*prp*/ ctx[1].sid || /*prp*/ ctx[1].id_stat || /*prp*/ ctx[1].id_skpdi || "") + "")) set_data_dev(t4, t4_value);
  			if (dirty & /*prp*/ 2 && t8_value !== (t8_value = (/*prp*/ ctx[1].km || 0) + "")) set_data_dev(t8, t8_value);
  			if (dirty & /*prp*/ 2 && t10_value !== (t10_value = (/*prp*/ ctx[1].m || 0) + "")) set_data_dev(t10, t10_value);
  			if (dirty & /*prp*/ 2 && t15_value !== (t15_value = /*prp*/ ctx[1].lat + "")) set_data_dev(t15, t15_value);
  			if (dirty & /*prp*/ 2 && t17_value !== (t17_value = /*prp*/ ctx[1].lon + "")) set_data_dev(t17, t17_value);
  			if (dirty & /*prp*/ 2 && t22_value !== (t22_value = (/*prp*/ ctx[1].collision_date || /*prp*/ ctx[1].dtp_date || "") + "")) set_data_dev(t22, t22_value);
  			if (dirty & /*prp*/ 2 && t26_value !== (t26_value = (/*prp*/ ctx[1].collision_context || /*prp*/ ctx[1].dtp_date || "") + "")) set_data_dev(t26, t26_value);

  			if (/*prp*/ ctx[1].collisionTypes && /*prp*/ ctx[1].collisionTypes.length) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_1$1(ctx);
  					if_block0.c();
  					if_block0.m(ul0, null);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*prp*/ ctx[1].uchs && /*prp*/ ctx[1].uchs.length) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block$1(ctx);
  					if_block1.c();
  					if_block1.m(ul1, null);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if (dirty & /*disabled*/ 4) {
  				prop_dev(button, "disabled", /*disabled*/ ctx[2]);
  			}
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div4);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$2.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$2($$self, $$props, $$invalidate) {
  	let { showModal = false } = $$props;
  	let { prp } = $$props;
  	let modal;
  	let disabled = prp.files && prp.files.length ? "" : "disabled";

  	afterUpdate(() => {
  		// console.log('the component just updated', showModal, modal);
  		$$invalidate(2, disabled = prp.files && prp.files.length ? "" : "disabled");

  		if (showModal) {
  			modal = new Modal({
  					target: document.body,
  					props: { data: prp.files }
  				});

  			modal.$on("close", ev => {
  				modal.$destroy();
  				$$invalidate(0, showModal = false);
  			});
  		}
  	});

  	const copyParent = ev => {
  		navigator.clipboard.writeText(ev.target.parentNode.textContent).catch(err => {
  			console.log("Something went wrong", err);
  		});
  	};

  	const writable_props = ["showModal", "prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<DtpPopupSkpdi> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupSkpdi", $$slots, []);
  	const click_handler = () => $$invalidate(0, showModal = true);

  	$$self.$set = $$props => {
  		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(1, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({
  		afterUpdate,
  		Modal,
  		showModal,
  		prp,
  		modal,
  		disabled,
  		copyParent
  	});

  	$$self.$inject_state = $$props => {
  		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(1, prp = $$props.prp);
  		if ("modal" in $$props) modal = $$props.modal;
  		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [showModal, prp, disabled, copyParent, modal, click_handler];
  }

  class DtpPopupSkpdi extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$2, create_fragment$2, safe_not_equal, { showModal: 0, prp: 1 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupSkpdi",
  			options,
  			id: create_fragment$2.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[1] === undefined && !("prp" in props)) {
  			console_1$1.warn("<DtpPopupSkpdi> was created without expected prop 'prp'");
  		}
  	}

  	get showModal() {
  		throw new Error("<DtpPopupSkpdi>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set showModal(value) {
  		throw new Error("<DtpPopupSkpdi>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get prp() {
  		throw new Error("<DtpPopupSkpdi>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupSkpdi>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$6 = window.L;

  const popup$1 = L$6.popup();
  let argFilters$1;

  const setPopup$1 = function (id) {
  	let url = 'https://dtp.mvs.group/scripts/index.php?request=get_dtp_id&id=' + id + '&type=skpdi';
  	fetch(url, {})
  	// fetch('/static/data/dtpexample.json', {})
  		.then(req => req.json())
  		.then(json => {
  // console.log('bindPopup', layer, json, DtpPopup);
  			let cont = L$6.DomUtil.create('div');
  			const app = new DtpPopupSkpdi({
  				target: cont,
  				props: {
  					prp: json
  				}
  			});
  			popup$1._svObj = app;
  			popup$1.setContent(cont);
  		});
  	return '';
  	// return layer.feature.properties.id || '';
  };

  const DtpSkpdi = L$6.featureGroup([]);
  DtpSkpdi._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
  DtpSkpdi.checkZoom = z => {
  	if (Object.keys(DtpSkpdi._layers).length) {
  		if (z < 12) {
  			DtpSkpdi.setFilter(argFilters$1);
  		}
  	} else if (z > 11) {
  		DtpSkpdi.setFilter(argFilters$1);
  	}
  };
  DtpSkpdi.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	if (!DtpSkpdi._map) { return; }
  	DtpSkpdi.clearLayers();
  	argFilters$1 = arg || [];

  	let arr = [], heat = [];
  	if (DtpSkpdi._group) {
  		DtpSkpdi._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$1.forEach(ft => {
  				if (ft.type === 'collision_type') {
  					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
  					// if (prp.collision_type === ft.zn) {
  						cnt++;
  					}
  				} else if (ft.type === 'date') {
  					if (prp.date >= ft.zn[0] && prp.date < ft.zn[1]) {
  						cnt++;
  					}
  				}
  			});
  			if (cnt === argFilters$1.length) {
  				arr.push(it);
  				heat.push(it._latlng);
  			}
  		});
  		if (DtpSkpdi._needHeat) {
  			DtpSkpdi._map.addLayer(DtpSkpdi._heat);
  			DtpSkpdi._heat.setLatLngs(heat);
  			DtpSkpdi._heat.setOptions(DtpSkpdi._needHeat);
  			if (DtpSkpdi._map._zoom > 11) {
  				DtpSkpdi.addLayer(L$6.layerGroup(arr));
  			}
  		} else {
  			DtpSkpdi.addLayer(L$6.layerGroup(arr));
  			DtpSkpdi._map.removeLayer(DtpSkpdi._heat);
  		}
  	}
  };

  DtpSkpdi.on('remove', () => {
  	// DtpSkpdi._needHeat = null;
  	DtpSkpdi._map.removeLayer(DtpSkpdi._heat);
  	DtpSkpdi.clearLayers();
  }).on('add', ev => {
  	// console.log('/static/data/dtpskpdi.geojson', ev);
  	DtpSkpdi._heat = L$6.heatLayer([]);
  	
  	fetch('https://dtp.mvs.group/scripts/index.php?request=get_skpdi', {})
  	// fetch('https://dtp.mvs.group/static/data/json_stat.json', {})
  		.then(req => req.json())
  		.then(json => {
  			let opt = {collision_type: {}, iconType: {}};
  			let heat = [];
  			let arr = json.map(prp => {
  				let iconType = prp.iconType || 0,
  					stroke = false,
  					fillColor = '#2F4F4F'; //   17-20
  				if (iconType) {
  					stroke = iconType % 2 === 0 ? true : false; //  - смертельные ДТП
  					if (iconType >= 1 && iconType <= 6) {
  						fillColor = '#8B4513'; //  1-6
  					} else if (iconType === 7 || iconType === 8) {
  						fillColor = '#228B22'; //  7-8
  					} else if (iconType >= 9 && iconType <= 14) {
  						fillColor = '#8B4513'; //  9-14
  					} else if (iconType === 15 || iconType === 16) {
  						fillColor = '#7B68EE'; //  15-16
  					} else if (iconType === 17 || iconType === 18) {
  						fillColor = '#2F4F4F'; //  17-18
  					}
  				}

  if (!prp.lat || !prp.lon) {
  console.log('_______', prp);
  	prp.lat = prp.lon = 0;
  }
  				let cTypeCount = opt.collision_type[prp.collision_type];
  				if (!cTypeCount) {
  					cTypeCount = 1;
  				} else {
  					cTypeCount++;
  				}
  				opt.collision_type[prp.collision_type] = cTypeCount;
  				opt.iconType[prp.collision_type] = iconType;

  				let latLng = L$6.latLng(prp.lat, prp.lon, stroke ? 1 : 0.5);
  				heat.push(latLng);

  				return new CirclePoint(latLng, {
  					props: prp,
  					radius: 6,
  					box: true,
  					stroke: stroke,
  					fillColor: fillColor
  					// ,
  					// renderer: renderer
  				}).bindPopup(popup$1).on('popupopen', (ev) => {
  						setPopup$1(ev.target.options.props.id);
  						// console.log('popupopen', ev);
  					}).on('popupclose', (ev) => {
  						console.log('popupclose', ev);
  						// ev.popup.setContent('');
  						if (ev.popup._svObj) {
  							ev.popup._svObj.$destroy();
  							delete ev.popup._svObj;
  						}
  					});
  			});
  			DtpSkpdi.addLayer(DtpSkpdi._heat);
  			DtpSkpdi._heat.setLatLngs(heat);
  			DtpSkpdi._heat.setOptions(DtpSkpdi._needHeat);

  			DtpSkpdi._opt = opt;
  			DtpSkpdi._group = L$6.layerGroup(arr);
  			// DtpSkpdi.addLayer(L.layerGroup(arr));
  			if (argFilters$1) {
  				DtpSkpdi.setFilter(argFilters$1);
  			} else {
  				DtpSkpdi.addLayer(DtpSkpdi._group);
  			}
  			DtpSkpdi.checkZoom(DtpSkpdi._map._zoom);
  			DtpSkpdi._refreshFilters();
  		});
  });

  /* src\DtpPopupVerifyed.svelte generated by Svelte v3.20.1 */
  const file$3 = "src\\DtpPopupVerifyed.svelte";

  function get_each_context$3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[6] = list[i];
  	child_ctx[8] = i;
  	return child_ctx;
  }

  // (46:3) {#each prp._cur as pt, i}
  function create_each_block$3(ctx) {
  	let button;
  	let t_value = (/*pt*/ ctx[6].type === "gibdd" ? "ГИБДД" : "СКПДИ") + "";
  	let t;
  	let button_class_value;
  	let button_value_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			button = element("button");
  			t = text(t_value);
  			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*curNum*/ ctx[2] === /*i*/ ctx[8] ? "current" : "") + " svelte-txaali"));
  			button.value = button_value_value = /*i*/ ctx[8];
  			add_location(button, file$3, 46, 3, 966);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, button, anchor);
  			append_dev(button, t);
  			if (remount) dispose();
  			dispose = listen_dev(button, "click", /*onclick*/ ctx[4], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && t_value !== (t_value = (/*pt*/ ctx[6].type === "gibdd" ? "ГИБДД" : "СКПДИ") + "")) set_data_dev(t, t_value);

  			if (dirty & /*curNum*/ 4 && button_class_value !== (button_class_value = "" + (null_to_empty(/*curNum*/ ctx[2] === /*i*/ ctx[8] ? "current" : "") + " svelte-txaali"))) {
  				attr_dev(button, "class", button_class_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(button);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$3.name,
  		type: "each",
  		source: "(46:3) {#each prp._cur as pt, i}",
  		ctx
  	});

  	return block;
  }

  // (52:2) {:else}
  function create_else_block(ctx) {
  	let current;

  	const dtppopupskpdi = new DtpPopupSkpdi({
  			props: { prp: /*data*/ ctx[3] },
  			$$inline: true
  		});

  	const block = {
  		c: function create() {
  			create_component(dtppopupskpdi.$$.fragment);
  		},
  		m: function mount(target, anchor) {
  			mount_component(dtppopupskpdi, target, anchor);
  			current = true;
  		},
  		p: function update(ctx, dirty) {
  			const dtppopupskpdi_changes = {};
  			if (dirty & /*data*/ 8) dtppopupskpdi_changes.prp = /*data*/ ctx[3];
  			dtppopupskpdi.$set(dtppopupskpdi_changes);
  		},
  		i: function intro(local) {
  			if (current) return;
  			transition_in(dtppopupskpdi.$$.fragment, local);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(dtppopupskpdi.$$.fragment, local);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			destroy_component(dtppopupskpdi, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_else_block.name,
  		type: "else",
  		source: "(52:2) {:else}",
  		ctx
  	});

  	return block;
  }

  // (50:2) {#if prp._cur[curNum].type === 'gibdd'}
  function create_if_block$2(ctx) {
  	let current;

  	const dtppopupgibdd = new DtpPopupGibdd({
  			props: { prp: /*data*/ ctx[3] },
  			$$inline: true
  		});

  	const block = {
  		c: function create() {
  			create_component(dtppopupgibdd.$$.fragment);
  		},
  		m: function mount(target, anchor) {
  			mount_component(dtppopupgibdd, target, anchor);
  			current = true;
  		},
  		p: function update(ctx, dirty) {
  			const dtppopupgibdd_changes = {};
  			if (dirty & /*data*/ 8) dtppopupgibdd_changes.prp = /*data*/ ctx[3];
  			dtppopupgibdd.$set(dtppopupgibdd_changes);
  		},
  		i: function intro(local) {
  			if (current) return;
  			transition_in(dtppopupgibdd.$$.fragment, local);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(dtppopupgibdd.$$.fragment, local);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			destroy_component(dtppopupgibdd, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block$2.name,
  		type: "if",
  		source: "(50:2) {#if prp._cur[curNum].type === 'gibdd'}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$3(ctx) {
  	let div2;
  	let div0;
  	let a;
  	let t1;
  	let div1;
  	let t2;
  	let current_block_type_index;
  	let if_block;
  	let current;
  	let dispose;
  	let each_value = /*prp*/ ctx[0]._cur;
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
  	}

  	const if_block_creators = [create_if_block$2, create_else_block];
  	const if_blocks = [];

  	function select_block_type(ctx, dirty) {
  		if (/*prp*/ ctx[0]._cur[/*curNum*/ ctx[2]].type === "gibdd") return 0;
  		return 1;
  	}

  	current_block_type_index = select_block_type(ctx);
  	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			a = element("a");
  			a.textContent = "×";
  			t1 = space();
  			div1 = element("div");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t2 = space();
  			if_block.c();
  			attr_dev(a, "class", "leaflet-popup-close-button");
  			attr_dev(a, "href", "#close");
  			add_location(a, file$3, 41, 3, 810);
  			attr_dev(div0, "class", "close");
  			add_location(div0, file$3, 40, 2, 787);
  			attr_dev(div1, "class", "pLine");
  			add_location(div1, file$3, 44, 2, 914);
  			attr_dev(div2, "class", "mvsPopup");
  			add_location(div2, file$3, 39, 1, 762);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div0, a);
  			append_dev(div2, t1);
  			append_dev(div2, div1);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(div1, null);
  			}

  			append_dev(div2, t2);
  			if_blocks[current_block_type_index].m(div2, null);
  			current = true;
  			if (remount) dispose();

  			dispose = listen_dev(
  				a,
  				"click",
  				prevent_default(function () {
  					if (is_function(/*closeMe*/ ctx[1])) /*closeMe*/ ctx[1].apply(this, arguments);
  				}),
  				false,
  				true,
  				false
  			);
  		},
  		p: function update(new_ctx, [dirty]) {
  			ctx = new_ctx;

  			if (dirty & /*curNum, onclick, prp*/ 21) {
  				each_value = /*prp*/ ctx[0]._cur;
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$3(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$3(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(div1, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}

  			let previous_block_index = current_block_type_index;
  			current_block_type_index = select_block_type(ctx);

  			if (current_block_type_index === previous_block_index) {
  				if_blocks[current_block_type_index].p(ctx, dirty);
  			} else {
  				group_outros();

  				transition_out(if_blocks[previous_block_index], 1, 1, () => {
  					if_blocks[previous_block_index] = null;
  				});

  				check_outros();
  				if_block = if_blocks[current_block_type_index];

  				if (!if_block) {
  					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  					if_block.c();
  				}

  				transition_in(if_block, 1);
  				if_block.m(div2, null);
  			}
  		},
  		i: function intro(local) {
  			if (current) return;
  			transition_in(if_block);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(if_block);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  			destroy_each(each_blocks, detaching);
  			if_blocks[current_block_type_index].d();
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$3.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$3($$self, $$props, $$invalidate) {
  	let { prp } = $$props;

  	let { closeMe = () => {
  		
  	} } = $$props;

  	let curNum = 0;
  	let data = {};

  	const onclick = ev => {
  		// console.log('onclick', ev)
  		let target = ev.target, nm = Number(target.value);

  		if (curNum !== nm) {
  			$$invalidate(2, curNum = nm);
  			setPage(curNum);
  		}
  	};

  	const setPage = nm => {
  		let pt = prp._cur[nm],
  			type = pt.type,
  			url = "https://dtp.mvs.group/scripts/index.php?request=get_dtp_id&id=" + pt.id + "&type=" + type;

  		fetch(url, {}).then(req => req.json()).then(json => {
  			$$invalidate(3, data = json);
  		});
  	};

  	setPage(curNum);
  	const writable_props = ["prp", "closeMe"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DtpPopupVerifyed> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupVerifyed", $$slots, []);

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("closeMe" in $$props) $$invalidate(1, closeMe = $$props.closeMe);
  	};

  	$$self.$capture_state = () => ({
  		DtpPopupGibdd,
  		DtpPopupSkpdi,
  		prp,
  		closeMe,
  		curNum,
  		data,
  		onclick,
  		setPage
  	});

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("closeMe" in $$props) $$invalidate(1, closeMe = $$props.closeMe);
  		if ("curNum" in $$props) $$invalidate(2, curNum = $$props.curNum);
  		if ("data" in $$props) $$invalidate(3, data = $$props.data);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [prp, closeMe, curNum, data, onclick];
  }

  class DtpPopupVerifyed extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$3, create_fragment$3, safe_not_equal, { prp: 0, closeMe: 1 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupVerifyed",
  			options,
  			id: create_fragment$3.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console.warn("<DtpPopupVerifyed> was created without expected prop 'prp'");
  		}
  	}

  	get prp() {
  		throw new Error("<DtpPopupVerifyed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupVerifyed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get closeMe() {
  		throw new Error("<DtpPopupVerifyed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set closeMe(value) {
  		throw new Error("<DtpPopupVerifyed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$7 = window.L;

  const popup$2 = L$7.popup();
  let argFilters$2;

  const setPopup$2 = function (props) {
  	let cont = L$7.DomUtil.create('div');
  	new DtpPopupVerifyed({
  		target: cont,
  		props: {
  			// popup: popup,
  			prp: props
  		}
  	});
  	popup$2.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const DtpVerifyed = L$7.featureGroup([]);
  DtpVerifyed._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
  DtpVerifyed.checkZoom = z => {
  	if (Object.keys(DtpVerifyed._layers).length) {
  		if (z < 12) {
  			DtpVerifyed.setFilter(argFilters$2);
  		}
  	} else if (z > 11) {
  		DtpVerifyed.setFilter(argFilters$2);
  	}
  };

  DtpVerifyed.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	if (!DtpVerifyed._map) { return; }
  	DtpVerifyed.clearLayers();
  	argFilters$2 = arg || [];

  	let arr = [], heat = [];
  	if (DtpVerifyed._group) {
  		DtpVerifyed._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$2.forEach(ft => {
  				if (ft.type === 'itemType') {
  					if (ft.zn === 0) {
  						cnt++;
  					} else if (ft.zn === 1 && prp.id_stat && prp.id_skpdi) {
  						cnt++;
  					} else if (ft.zn === 2 && (prp.id_skpdi && !prp.id_stat)) {
  						cnt++;
  					} else if (ft.zn === 3 && (prp.id_stat && !prp.id_skpdi)) {
  						cnt++;
  					}
  				} else if (ft.type === 'collision_type') {
  					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
  					// if (prp.collision_type === ft.zn) {
  						cnt++;
  					}
  				} else if (ft.type === 'date') {
  					if (prp.date >= ft.zn[0] && prp.date < ft.zn[1]) {
  						cnt++;
  					}
  				}
  			});
  			if (cnt === argFilters$2.length) {
  				arr.push(it);
  				heat.push(it._latlng);
  			}
  		});
  		// DtpVerifyed.addLayer(L.layerGroup(arr));
  		if (DtpVerifyed._needHeat) {
  			DtpVerifyed._map.addLayer(DtpVerifyed._heat);
  			DtpVerifyed._heat.setLatLngs(heat);
  			DtpVerifyed._heat.setOptions(DtpVerifyed._needHeat);
  			if (DtpVerifyed._map._zoom > 11) {
  				DtpVerifyed.addLayer(L$7.layerGroup(arr));
  			}
  		} else {
  			DtpVerifyed.addLayer(L$7.layerGroup(arr));
  			DtpVerifyed._map.removeLayer(DtpVerifyed._heat);
  		}
  	}
  };

  DtpVerifyed.on('remove', () => {
  	// DtpVerifyed._needHeat = null;
  	DtpVerifyed._map.removeLayer(DtpVerifyed._heat);
  	DtpVerifyed.clearLayers();
  }).on('add', ev => {
  	DtpVerifyed._heat = L$7.heatLayer([], {interactive: false});
  	fetch('https://dtp.mvs.group/scripts/index.php?request=get_collision', {})
  		.then(req => req.json())
  		.then(json => {
  			let opt = {collision_type: {}, iconType: {}};
  			// DtpVerifyed._heatData = [];
  			let heat = [];
  			let arr = json.map(prp => {
  				let iconType = prp.iconType || 0,
  					cur = [],
  					stroke = false,
  					fillColor = '#2F4F4F'; //   17-20
  				if (iconType) {
  					stroke = iconType % 2 === 0 ? true : false; //  - смертельные ДТП
  					if (iconType >= 1 && iconType <= 6) {
  						fillColor = '#8B4513'; //  1-6
  					} else if (iconType === 7 || iconType === 8) {
  						fillColor = '#228B22'; //  7-8
  					} else if (iconType >= 9 && iconType <= 14) {
  						fillColor = '#8B4513'; //  9-14
  					} else if (iconType === 15 || iconType === 16) {
  						fillColor = '#7B68EE'; //  15-16
  					} else if (iconType === 17 || iconType === 18) {
  						fillColor = '#2F4F4F'; //  17-18
  					}
  				}

  				if (prp.id_skpdi) { cur.push({type: 'skpdi', id: prp.id_skpdi}); }
  				if (prp.id_stat) { cur.push({type: 'gibdd', id: prp.id_stat}); }
  				prp._cur = cur;

  if (!prp.lat || !prp.lon) {
  console.log('_______', prp);
  	prp.lat = prp.lon = 0;
  }
  				// DtpVerifyed._heatData.push({lat: prp.lat, lng: prp.lon, count: iconType});
  // if (cur.length > 1) {
  // console.log('___prp.id_skpdi && prp.id_stat____', prp);
  // }
  				let cTypeCount = opt.collision_type[prp.collision_type];
  				if (!cTypeCount) {
  					cTypeCount = 1;
  				} else {
  					cTypeCount++;
  				}
  				opt.collision_type[prp.collision_type] = cTypeCount;
  				opt.iconType[prp.collision_type] = iconType;

  				let latLng = L$7.latLng(prp.lat, prp.lon, stroke ? 1 : 0.5);
  				heat.push(latLng);

  				return new CirclePoint(latLng, {
  					props: prp,
  					radius: 6,
  					triangle: cur.length > 1 ? true : false,
  					box: prp.id_skpdi ? true : false,
  					stroke: stroke,
  					fillColor: fillColor,
  					// renderer: renderer
  				}).bindPopup(popup$2)
  				.on('popupopen', (ev) => {

  					setPopup$2(ev.target.options.props);
  					// console.log('popupopen', ev);
  				}).on('popupclose', (ev) => {
  					// console.log('popupclose', ev);
  					// ev.popup.setContent('');
  					if (ev.popup._svObj) {
  						ev.popup._svObj.$destroy();
  						delete ev.popup._svObj;
  					}
  				});
  			});
  			DtpVerifyed.addLayer(DtpVerifyed._heat);
  			DtpVerifyed._heat.setLatLngs(heat);
  			DtpVerifyed._heat.setOptions(DtpVerifyed._needHeat);

  			DtpVerifyed._opt = opt;
  			DtpVerifyed._group = L$7.layerGroup(arr);
  			if (argFilters$2) {
  				DtpVerifyed.setFilter(argFilters$2);
  			} else {
  				DtpVerifyed.addLayer(DtpVerifyed._group);
  			}
  			DtpVerifyed.checkZoom(DtpVerifyed._map._zoom);
  			DtpVerifyed._refreshFilters();
  		});
  });

  /* src\DtpVerifyedFilters.svelte generated by Svelte v3.20.1 */

  const { Object: Object_1, console: console_1$2 } = globals;
  const file$4 = "src\\DtpVerifyedFilters.svelte";

  function get_each_context$4(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_4(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_6(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[171] = list[i];
  	return child_ctx;
  }

  function get_each_context_5(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_7(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_8(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_10(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[171] = list[i];
  	return child_ctx;
  }

  function get_each_context_9(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_11(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_12(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_14(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[171] = list[i];
  	return child_ctx;
  }

  function get_each_context_13(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_15(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_16(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_17(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_18(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_19(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  function get_each_context_20(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[158] = list[i];
  	return child_ctx;
  }

  // (669:2) {#if DtpHearthsPicket._map && DtpHearthsPicket._opt && DtpHearthsPicket._opt.years}
  function create_if_block_17(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div5;
  	let div1;
  	let t3;
  	let input0;
  	let t4;
  	let div2;
  	let t5;
  	let input1;
  	let t6;
  	let div3;
  	let input2;
  	let input2_checked_value;
  	let label0;
  	let t8;
  	let input3;
  	let input3_checked_value;
  	let label1;
  	let t10;
  	let div4;
  	let select;
  	let option;
  	let dispose;
  	let each_value_20 = /*optRoadTypes*/ ctx[71];
  	validate_each_argument(each_value_20);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_20.length; i += 1) {
  		each_blocks[i] = create_each_block_20(get_each_context_20(ctx, each_value_20, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги(Picket)";
  			t2 = space();
  			div5 = element("div");
  			div1 = element("div");
  			t3 = text("ID Очага: ");
  			input0 = element("input");
  			t4 = space();
  			div2 = element("div");
  			t5 = text("ID ДТП: ");
  			input1 = element("input");
  			t6 = space();
  			div3 = element("div");
  			input2 = element("input");
  			label0 = element("label");
  			label0.textContent = "одного типа";
  			t8 = space();
  			input3 = element("input");
  			label1 = element("label");
  			label1.textContent = "разного типа";
  			t10 = space();
  			div4 = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все дороги (${/*optRoadTypes*/ ctx[71].reduce(/*func*/ ctx[114], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			add_location(b, file$4, 669, 31, 21559);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 669, 2, 21530);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_hearth*/ ctx[15];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$4, 671, 32, 21650);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$4, 671, 3, 21621);
  			attr_dev(input1, "type", "text");
  			input1.value = /*id_dtp*/ ctx[16];
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$4, 672, 30, 21753);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$4, 672, 3, 21726);
  			attr_dev(input2, "type", "checkbox");
  			attr_dev(input2, "id", "ht_3");
  			input2.checked = input2_checked_value = /*ht*/ ctx[14].hearth3;
  			attr_dev(input2, "name", "hearth3");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$4, 674, 4, 21847);
  			attr_dev(label0, "for", "ht_3");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$4, 674, 95, 21938);
  			attr_dev(input3, "type", "checkbox");
  			attr_dev(input3, "id", "ht_5");
  			input3.checked = input3_checked_value = /*ht*/ ctx[14].hearth5;
  			attr_dev(input3, "name", "hearth5");
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$4, 675, 4, 21980);
  			attr_dev(label1, "for", "ht_5");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$4, 675, 95, 22071);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$4, 673, 3, 21823);
  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$4, 679, 5, 22256);
  			attr_dev(select, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select.multiple = true;
  			if (/*roads*/ ctx[13] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[115].call(select));
  			add_location(select, file$4, 678, 4, 22147);
  			attr_dev(div4, "class", "pLine svelte-1jsovbn");
  			add_location(div4, file$4, 677, 3, 22123);
  			attr_dev(div5, "class", "filtersCont svelte-1jsovbn");
  			add_location(div5, file$4, 670, 2, 21592);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div5, anchor);
  			append_dev(div5, div1);
  			append_dev(div1, t3);
  			append_dev(div1, input0);
  			append_dev(div5, t4);
  			append_dev(div5, div2);
  			append_dev(div2, t5);
  			append_dev(div2, input1);
  			append_dev(div5, t6);
  			append_dev(div5, div3);
  			append_dev(div3, input2);
  			append_dev(div3, label0);
  			append_dev(div3, t8);
  			append_dev(div3, input3);
  			append_dev(div3, label1);
  			append_dev(div5, t10);
  			append_dev(div5, div4);
  			append_dev(div4, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*roads*/ ctx[13]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdHearth*/ ctx[76], false, false, false),
  				listen_dev(input1, "input", /*oncheckIdDtp*/ ctx[75], false, false, false),
  				listen_dev(input2, "change", /*oncheckHt*/ ctx[77], false, false, false),
  				listen_dev(input3, "change", /*oncheckHt*/ ctx[77], false, false, false),
  				listen_dev(select, "change", /*select_change_handler*/ ctx[115]),
  				listen_dev(select, "change", /*setFilterHearthsPicket*/ ctx[74], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_hearth*/ 32768 && input0.value !== /*id_hearth*/ ctx[15]) {
  				prop_dev(input0, "value", /*id_hearth*/ ctx[15]);
  			}

  			if (dirty[0] & /*id_dtp*/ 65536 && input1.value !== /*id_dtp*/ ctx[16]) {
  				prop_dev(input1, "value", /*id_dtp*/ ctx[16]);
  			}

  			if (dirty[0] & /*ht*/ 16384 && input2_checked_value !== (input2_checked_value = /*ht*/ ctx[14].hearth3)) {
  				prop_dev(input2, "checked", input2_checked_value);
  			}

  			if (dirty[0] & /*ht*/ 16384 && input3_checked_value !== (input3_checked_value = /*ht*/ ctx[14].hearth5)) {
  				prop_dev(input3, "checked", input3_checked_value);
  			}

  			if (dirty[2] & /*optRoadTypes, optDataHearthsPicket*/ 768) {
  				each_value_20 = /*optRoadTypes*/ ctx[71];
  				validate_each_argument(each_value_20);
  				let i;

  				for (i = 0; i < each_value_20.length; i += 1) {
  					const child_ctx = get_each_context_20(ctx, each_value_20, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_20(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_20.length;
  			}

  			if (dirty[0] & /*roads*/ 8192) {
  				select_options(select, /*roads*/ ctx[13]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div5);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_17.name,
  		type: "if",
  		source: "(669:2) {#if DtpHearthsPicket._map && DtpHearthsPicket._opt && DtpHearthsPicket._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (683:5) {#each optRoadTypes as key}
  function create_each_block_20(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsPicket*/ ctx[70].road[/*key*/ ctx[158]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[158] + "";
  	let t3;
  	let t4;
  	let option_value_value;
  	let option_class_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(") - ");
  			t3 = text(t3_value);
  			t4 = space();
  			option.__value = option_value_value = /*key*/ ctx[158];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "road_" + /*key*/ ctx[158] + " svelte-1jsovbn");
  			add_location(option, file$4, 683, 6, 22432);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
  			append_dev(option, t4);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_20.name,
  		type: "each",
  		source: "(683:5) {#each optRoadTypes as key}",
  		ctx
  	});

  	return block;
  }

  // (693:2) {#if DtpHearths5._map && DtpHearths5._opt && DtpHearths5._opt.years}
  function create_if_block_16(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div6;
  	let div3;
  	let fieldset;
  	let legend;
  	let t4;
  	let div2;
  	let input;
  	let input_value_value;
  	let input_checked_value;
  	let label;
  	let t6;
  	let div1;
  	let t7;
  	let div4;
  	let select0;
  	let option0;
  	let t11;
  	let div5;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_19 = Object.keys(/*DtpHearths5*/ ctx[5]._opt.years).sort();
  	validate_each_argument(each_value_19);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_19.length; i += 1) {
  		each_blocks_1[i] = create_each_block_19(get_each_context_19(ctx, each_value_19, i));
  	}

  	let each_value_18 = /*optTypeHearths5Keys*/ ctx[69];
  	validate_each_argument(each_value_18);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_18.length; i += 1) {
  		each_blocks[i] = create_each_block_18(get_each_context_18(ctx, each_value_18, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги (5)";
  			t2 = space();
  			div6 = element("div");
  			div3 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t4 = space();
  			div2 = element("div");
  			input = element("input");
  			label = element("label");
  			label.textContent = "Фильтрация по годам";
  			t6 = space();
  			div1 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t7 = space();
  			div4 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все типы (${/*optTypeHearths5Keys*/ ctx[69].reduce(/*func_1*/ ctx[118], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t11 = space();
  			div5 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = "Очаги все";
  			option2 = element("option");
  			option2.textContent = "Только с погибшими";
  			option3 = element("option");
  			option3.textContent = "Только с пострадавшими";
  			option4 = element("option");
  			option4.textContent = "С пострадавшими или погибшими";
  			option5 = element("option");
  			option5.textContent = "С пострадавшими и погибшими";
  			add_location(b, file$4, 693, 31, 22697);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 693, 2, 22668);
  			add_location(legend, file$4, 697, 4, 22800);
  			attr_dev(input, "type", "radio");
  			input.__value = input_value_value = 1;
  			input.value = input.__value;
  			input.checked = input_checked_value = /*hearths_period_type_5*/ ctx[31] === 1;
  			attr_dev(input, "id", "hearths_period_type_51");
  			attr_dev(input, "name", "hearths_period_type_5");
  			attr_dev(input, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[117][4].push(input);
  			add_location(input, file$4, 699, 5, 22875);
  			attr_dev(label, "for", "hearths_period_type_51");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 699, 195, 23065);
  			attr_dev(div1, "class", "pLine margin svelte-1jsovbn");
  			add_location(div1, file$4, 700, 5, 23134);
  			attr_dev(div2, "class", "pLine type svelte-1jsovbn");
  			add_location(div2, file$4, 698, 4, 22845);
  			add_location(fieldset, file$4, 696, 3, 22785);
  			attr_dev(div3, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div3, file$4, 695, 3, 22755);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$4, 710, 5, 23628);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_type5*/ ctx[30] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[119].call(select0));
  			add_location(select0, file$4, 709, 4, 23515);
  			attr_dev(div4, "class", "pLine svelte-1jsovbn");
  			add_location(div4, file$4, 708, 3, 23491);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$4, 722, 5, 24102);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$4, 723, 5, 24143);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$4, 724, 5, 24192);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$4, 725, 5, 24245);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$4, 726, 5, 24305);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken5*/ ctx[29] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[120].call(select1));
  			add_location(select1, file$4, 721, 4, 24025);
  			attr_dev(div5, "class", "pLine svelte-1jsovbn");
  			add_location(div5, file$4, 720, 3, 24001);
  			attr_dev(div6, "class", "filtersCont svelte-1jsovbn");
  			add_location(div6, file$4, 694, 2, 22726);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div6, anchor);
  			append_dev(div6, div3);
  			append_dev(div3, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t4);
  			append_dev(fieldset, div2);
  			append_dev(div2, input);
  			input.checked = input.__value === /*hearths_period_type_5*/ ctx[31];
  			append_dev(div2, label);
  			append_dev(div2, t6);
  			append_dev(div2, div1);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div1, null);
  			}

  			append_dev(div6, t7);
  			append_dev(div6, div4);
  			append_dev(div4, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*str_icon_type5*/ ctx[30]);
  			append_dev(div6, t11);
  			append_dev(div6, div5);
  			append_dev(div5, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken5*/ ctx[29]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input, "change", /*setFilterHearths5*/ ctx[87], false, false, false),
  				listen_dev(input, "change", /*input_change_handler*/ ctx[116]),
  				listen_dev(select0, "change", /*select0_change_handler*/ ctx[119]),
  				listen_dev(select0, "change", /*setFilterHearths5*/ ctx[87], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler*/ ctx[120]),
  				listen_dev(select1, "change", /*setFilterHearths5*/ ctx[87], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*hearths_period_type_5*/ 1 && input_checked_value !== (input_checked_value = /*hearths_period_type_5*/ ctx[31] === 1)) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_5*/ 1) {
  				input.checked = input.__value === /*hearths_period_type_5*/ ctx[31];
  			}

  			if (dirty[0] & /*DtpHearths5*/ 32 | dirty[1] & /*hearths_year_5, hearths_period_type_5*/ 3 | dirty[2] & /*setFilterHearths5*/ 33554432) {
  				each_value_19 = Object.keys(/*DtpHearths5*/ ctx[5]._opt.years).sort();
  				validate_each_argument(each_value_19);
  				let i;

  				for (i = 0; i < each_value_19.length; i += 1) {
  					const child_ctx = get_each_context_19(ctx, each_value_19, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_19(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div1, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_19.length;
  			}

  			if (dirty[2] & /*optTypeHearths5Keys, optDataHearths5*/ 192) {
  				each_value_18 = /*optTypeHearths5Keys*/ ctx[69];
  				validate_each_argument(each_value_18);
  				let i;

  				for (i = 0; i < each_value_18.length; i += 1) {
  					const child_ctx = get_each_context_18(ctx, each_value_18, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_18(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_18.length;
  			}

  			if (dirty[0] & /*str_icon_type5*/ 1073741824) {
  				select_options(select0, /*str_icon_type5*/ ctx[30]);
  			}

  			if (dirty[0] & /*hearths_stricken5*/ 536870912) {
  				select_option(select1, /*hearths_stricken5*/ ctx[29]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div6);
  			/*$$binding_groups*/ ctx[117][4].splice(/*$$binding_groups*/ ctx[117][4].indexOf(input), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_16.name,
  		type: "if",
  		source: "(693:2) {#if DtpHearths5._map && DtpHearths5._opt && DtpHearths5._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (702:5) {#each Object.keys(DtpHearths5._opt.years).sort() as key}
  function create_each_block_19(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[158] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_5");
  			input.checked = input_checked_value = /*hearths_year_5*/ ctx[32][/*key*/ ctx[158]];
  			input.disabled = input_disabled_value = /*hearths_period_type_5*/ ctx[31] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[158]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$4, 702, 6, 23230);
  			attr_dev(label, "for", "hearths_year_5");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 702, 161, 23385);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths5*/ ctx[87], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths5*/ 32 | dirty[1] & /*hearths_year_5*/ 2 && input_checked_value !== (input_checked_value = /*hearths_year_5*/ ctx[32][/*key*/ ctx[158]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_5*/ 1 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_5*/ ctx[31] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths5*/ 32 && input_name_value !== (input_name_value = /*key*/ ctx[158])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths5*/ 32 && t_value !== (t_value = /*key*/ ctx[158] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_19.name,
  		type: "each",
  		source: "(702:5) {#each Object.keys(DtpHearths5._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (714:5) {#each optTypeHearths5Keys as key}
  function create_each_block_18(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearths5*/ ctx[68].str_icon_type[/*key*/ ctx[158]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[158] + "";
  	let t3;
  	let t4;
  	let option_value_value;
  	let option_class_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(") - ");
  			t3 = text(t3_value);
  			t4 = space();
  			option.__value = option_value_value = /*key*/ ctx[158];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearths5*/ ctx[68].iconType[/*key*/ ctx[158]] + " svelte-1jsovbn");
  			add_location(option, file$4, 714, 6, 23820);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
  			append_dev(option, t4);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_18.name,
  		type: "each",
  		source: "(714:5) {#each optTypeHearths5Keys as key}",
  		ctx
  	});

  	return block;
  }

  // (733:2) {#if DtpHearths3._map && DtpHearths3._opt && DtpHearths3._opt.years}
  function create_if_block_15(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div6;
  	let div3;
  	let fieldset;
  	let legend;
  	let t4;
  	let div2;
  	let input;
  	let input_value_value;
  	let input_checked_value;
  	let label;
  	let t6;
  	let div1;
  	let t7;
  	let div4;
  	let select0;
  	let option0;
  	let t11;
  	let div5;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_17 = Object.keys(/*DtpHearths3*/ ctx[6]._opt.years).sort();
  	validate_each_argument(each_value_17);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_17.length; i += 1) {
  		each_blocks_1[i] = create_each_block_17(get_each_context_17(ctx, each_value_17, i));
  	}

  	let each_value_16 = /*optTypeHearths3Keys*/ ctx[67];
  	validate_each_argument(each_value_16);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_16.length; i += 1) {
  		each_blocks[i] = create_each_block_16(get_each_context_16(ctx, each_value_16, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги (3)";
  			t2 = space();
  			div6 = element("div");
  			div3 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t4 = space();
  			div2 = element("div");
  			input = element("input");
  			label = element("label");
  			label.textContent = "Фильтрация по годам";
  			t6 = space();
  			div1 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t7 = space();
  			div4 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все типы (${/*optTypeHearths3Keys*/ ctx[67].reduce(/*func_2*/ ctx[122], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t11 = space();
  			div5 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = "Очаги все";
  			option2 = element("option");
  			option2.textContent = "Только с погибшими";
  			option3 = element("option");
  			option3.textContent = "Только с пострадавшими";
  			option4 = element("option");
  			option4.textContent = "С пострадавшими или погибшими";
  			option5 = element("option");
  			option5.textContent = "С пострадавшими и погибшими";
  			add_location(b, file$4, 733, 31, 24502);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 733, 2, 24473);
  			add_location(legend, file$4, 737, 4, 24605);
  			attr_dev(input, "type", "radio");
  			input.__value = input_value_value = 1;
  			input.value = input.__value;
  			input.checked = input_checked_value = /*hearths_period_type_3*/ ctx[35] === 1;
  			attr_dev(input, "id", "hearths_period_type_31");
  			attr_dev(input, "name", "hearths_period_type_3");
  			attr_dev(input, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[117][3].push(input);
  			add_location(input, file$4, 739, 5, 24680);
  			attr_dev(label, "for", "hearths_period_type_31");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 739, 195, 24870);
  			attr_dev(div1, "class", "pLine margin svelte-1jsovbn");
  			add_location(div1, file$4, 740, 5, 24939);
  			attr_dev(div2, "class", "pLine type svelte-1jsovbn");
  			add_location(div2, file$4, 738, 4, 24650);
  			add_location(fieldset, file$4, 736, 3, 24590);
  			attr_dev(div3, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div3, file$4, 735, 3, 24560);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$4, 750, 5, 25433);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_type3*/ ctx[34] === void 0) add_render_callback(() => /*select0_change_handler_1*/ ctx[123].call(select0));
  			add_location(select0, file$4, 749, 4, 25320);
  			attr_dev(div4, "class", "pLine svelte-1jsovbn");
  			add_location(div4, file$4, 748, 3, 25296);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$4, 762, 5, 25907);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$4, 763, 5, 25948);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$4, 764, 5, 25997);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$4, 765, 5, 26050);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$4, 766, 5, 26110);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken3*/ ctx[33] === void 0) add_render_callback(() => /*select1_change_handler_1*/ ctx[124].call(select1));
  			add_location(select1, file$4, 761, 4, 25830);
  			attr_dev(div5, "class", "pLine svelte-1jsovbn");
  			add_location(div5, file$4, 760, 3, 25806);
  			attr_dev(div6, "class", "filtersCont svelte-1jsovbn");
  			add_location(div6, file$4, 734, 2, 24531);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div6, anchor);
  			append_dev(div6, div3);
  			append_dev(div3, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t4);
  			append_dev(fieldset, div2);
  			append_dev(div2, input);
  			input.checked = input.__value === /*hearths_period_type_3*/ ctx[35];
  			append_dev(div2, label);
  			append_dev(div2, t6);
  			append_dev(div2, div1);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div1, null);
  			}

  			append_dev(div6, t7);
  			append_dev(div6, div4);
  			append_dev(div4, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*str_icon_type3*/ ctx[34]);
  			append_dev(div6, t11);
  			append_dev(div6, div5);
  			append_dev(div5, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken3*/ ctx[33]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input, "change", /*setFilterHearths3*/ ctx[88], false, false, false),
  				listen_dev(input, "change", /*input_change_handler_1*/ ctx[121]),
  				listen_dev(select0, "change", /*select0_change_handler_1*/ ctx[123]),
  				listen_dev(select0, "change", /*setFilterHearths3*/ ctx[88], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_1*/ ctx[124]),
  				listen_dev(select1, "change", /*setFilterHearths3*/ ctx[88], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*hearths_period_type_3*/ 16 && input_checked_value !== (input_checked_value = /*hearths_period_type_3*/ ctx[35] === 1)) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_3*/ 16) {
  				input.checked = input.__value === /*hearths_period_type_3*/ ctx[35];
  			}

  			if (dirty[0] & /*DtpHearths3*/ 64 | dirty[1] & /*hearths_year_3, hearths_period_type_3*/ 48 | dirty[2] & /*setFilterHearths3*/ 67108864) {
  				each_value_17 = Object.keys(/*DtpHearths3*/ ctx[6]._opt.years).sort();
  				validate_each_argument(each_value_17);
  				let i;

  				for (i = 0; i < each_value_17.length; i += 1) {
  					const child_ctx = get_each_context_17(ctx, each_value_17, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_17(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div1, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_17.length;
  			}

  			if (dirty[2] & /*optTypeHearths3Keys, optDataHearths3*/ 48) {
  				each_value_16 = /*optTypeHearths3Keys*/ ctx[67];
  				validate_each_argument(each_value_16);
  				let i;

  				for (i = 0; i < each_value_16.length; i += 1) {
  					const child_ctx = get_each_context_16(ctx, each_value_16, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_16(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_16.length;
  			}

  			if (dirty[1] & /*str_icon_type3*/ 8) {
  				select_options(select0, /*str_icon_type3*/ ctx[34]);
  			}

  			if (dirty[1] & /*hearths_stricken3*/ 4) {
  				select_option(select1, /*hearths_stricken3*/ ctx[33]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div6);
  			/*$$binding_groups*/ ctx[117][3].splice(/*$$binding_groups*/ ctx[117][3].indexOf(input), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_15.name,
  		type: "if",
  		source: "(733:2) {#if DtpHearths3._map && DtpHearths3._opt && DtpHearths3._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (742:5) {#each Object.keys(DtpHearths3._opt.years).sort() as key}
  function create_each_block_17(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[158] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_3");
  			input.checked = input_checked_value = /*hearths_year_3*/ ctx[36][/*key*/ ctx[158]];
  			input.disabled = input_disabled_value = /*hearths_period_type_3*/ ctx[35] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[158]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$4, 742, 6, 25035);
  			attr_dev(label, "for", "hearths_year_3");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 742, 161, 25190);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths3*/ ctx[88], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths3*/ 64 | dirty[1] & /*hearths_year_3*/ 32 && input_checked_value !== (input_checked_value = /*hearths_year_3*/ ctx[36][/*key*/ ctx[158]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_3*/ 16 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_3*/ ctx[35] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths3*/ 64 && input_name_value !== (input_name_value = /*key*/ ctx[158])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths3*/ 64 && t_value !== (t_value = /*key*/ ctx[158] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_17.name,
  		type: "each",
  		source: "(742:5) {#each Object.keys(DtpHearths3._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (754:5) {#each optTypeHearths3Keys as key}
  function create_each_block_16(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearths3*/ ctx[66].str_icon_type[/*key*/ ctx[158]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[158] + "";
  	let t3;
  	let t4;
  	let option_value_value;
  	let option_class_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(") - ");
  			t3 = text(t3_value);
  			t4 = space();
  			option.__value = option_value_value = /*key*/ ctx[158];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearths3*/ ctx[66].iconType[/*key*/ ctx[158]] + " svelte-1jsovbn");
  			add_location(option, file$4, 754, 6, 25625);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
  			append_dev(option, t4);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_16.name,
  		type: "each",
  		source: "(754:5) {#each optTypeHearths3Keys as key}",
  		ctx
  	});

  	return block;
  }

  // (773:2) {#if DtpHearthsStat._map && DtpHearthsStat._opt && DtpHearthsStat._opt.years}
  function create_if_block_14(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div8;
  	let div5;
  	let fieldset;
  	let legend;
  	let t4;
  	let div2;
  	let input0;
  	let input0_value_value;
  	let input0_checked_value;
  	let label0;
  	let t6;
  	let div1;
  	let t7;
  	let div4;
  	let input1;
  	let input1_value_value;
  	let label1;
  	let t9;
  	let div3;
  	let t10;
  	let div6;
  	let select0;
  	let option0;
  	let t14;
  	let div7;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_15 = Object.keys(/*DtpHearthsStat*/ ctx[7]._opt.years).sort();
  	validate_each_argument(each_value_15);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_15.length; i += 1) {
  		each_blocks_2[i] = create_each_block_15(get_each_context_15(ctx, each_value_15, i));
  	}

  	let each_value_13 = Object.keys(/*DtpHearthsStat*/ ctx[7]._opt.years).sort();
  	validate_each_argument(each_value_13);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_13.length; i += 1) {
  		each_blocks_1[i] = create_each_block_13(get_each_context_13(ctx, each_value_13, i));
  	}

  	let each_value_12 = /*optTypeHearthsStatKeys*/ ctx[65];
  	validate_each_argument(each_value_12);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_12.length; i += 1) {
  		each_blocks[i] = create_each_block_12(get_each_context_12(ctx, each_value_12, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги (Stat)";
  			t2 = space();
  			div8 = element("div");
  			div5 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t4 = space();
  			div2 = element("div");
  			input0 = element("input");
  			label0 = element("label");
  			label0.textContent = "Фильтрация по годам";
  			t6 = space();
  			div1 = element("div");

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].c();
  			}

  			t7 = space();
  			div4 = element("div");
  			input1 = element("input");
  			label1 = element("label");
  			label1.textContent = "Фильтрация по кварталам";
  			t9 = space();
  			div3 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t10 = space();
  			div6 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все типы (${/*optTypeHearthsStatKeys*/ ctx[65].reduce(/*func_3*/ ctx[127], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t14 = space();
  			div7 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = "Очаги все";
  			option2 = element("option");
  			option2.textContent = "Только с погибшими";
  			option3 = element("option");
  			option3.textContent = "Только с пострадавшими";
  			option4 = element("option");
  			option4.textContent = "С пострадавшими или погибшими";
  			option5 = element("option");
  			option5.textContent = "С пострадавшими и погибшими";
  			add_location(b, file$4, 773, 31, 26316);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 773, 2, 26287);
  			add_location(legend, file$4, 777, 4, 26422);
  			attr_dev(input0, "type", "radio");
  			input0.__value = input0_value_value = 1;
  			input0.value = input0.__value;
  			input0.checked = input0_checked_value = /*hearths_period_type_Stat*/ ctx[39] === 1;
  			attr_dev(input0, "id", "hearths_period_type_Stat1");
  			attr_dev(input0, "name", "hearths_period_type_Stat");
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[117][2].push(input0);
  			add_location(input0, file$4, 779, 5, 26497);
  			attr_dev(label0, "for", "hearths_period_type_Stat1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$4, 779, 210, 26702);
  			attr_dev(div1, "class", "pLine margin svelte-1jsovbn");
  			add_location(div1, file$4, 780, 5, 26774);
  			attr_dev(div2, "class", "pLine type svelte-1jsovbn");
  			add_location(div2, file$4, 778, 4, 26467);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 2;
  			input1.value = input1.__value;
  			attr_dev(input1, "id", "hearths_period_type_Stat2");
  			attr_dev(input1, "name", "hearths_period_type_Stat");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[117][2].push(input1);
  			add_location(input1, file$4, 787, 4, 27154);
  			attr_dev(label1, "for", "hearths_period_type_Stat2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$4, 787, 168, 27318);
  			attr_dev(div3, "class", "pLine margin svelte-1jsovbn");
  			add_location(div3, file$4, 788, 5, 27394);
  			attr_dev(div4, "class", "pLine type svelte-1jsovbn");
  			add_location(div4, file$4, 786, 4, 27125);
  			add_location(fieldset, file$4, 776, 3, 26407);
  			attr_dev(div5, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div5, file$4, 775, 3, 26377);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$4, 801, 5, 28088);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_typeStat*/ ctx[38] === void 0) add_render_callback(() => /*select0_change_handler_2*/ ctx[128].call(select0));
  			add_location(select0, file$4, 800, 4, 27969);
  			attr_dev(div6, "class", "pLine svelte-1jsovbn");
  			add_location(div6, file$4, 799, 3, 27945);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$4, 813, 5, 28583);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$4, 814, 5, 28624);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$4, 815, 5, 28673);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$4, 816, 5, 28726);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$4, 817, 5, 28786);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_strickenStat*/ ctx[37] === void 0) add_render_callback(() => /*select1_change_handler_2*/ ctx[129].call(select1));
  			add_location(select1, file$4, 812, 4, 28500);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$4, 811, 3, 28476);
  			attr_dev(div8, "class", "filtersCont svelte-1jsovbn");
  			add_location(div8, file$4, 774, 2, 26348);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div8, anchor);
  			append_dev(div8, div5);
  			append_dev(div5, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t4);
  			append_dev(fieldset, div2);
  			append_dev(div2, input0);
  			input0.checked = input0.__value === /*hearths_period_type_Stat*/ ctx[39];
  			append_dev(div2, label0);
  			append_dev(div2, t6);
  			append_dev(div2, div1);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(div1, null);
  			}

  			append_dev(fieldset, t7);
  			append_dev(fieldset, div4);
  			append_dev(div4, input1);
  			input1.checked = input1.__value === /*hearths_period_type_Stat*/ ctx[39];
  			append_dev(div4, label1);
  			append_dev(div4, t9);
  			append_dev(div4, div3);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div3, null);
  			}

  			append_dev(div8, t10);
  			append_dev(div8, div6);
  			append_dev(div6, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*str_icon_typeStat*/ ctx[38]);
  			append_dev(div8, t14);
  			append_dev(div8, div7);
  			append_dev(div7, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_strickenStat*/ ctx[37]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "change", /*setFilterHearthsStat*/ ctx[89], false, false, false),
  				listen_dev(input0, "change", /*input0_change_handler*/ ctx[125]),
  				listen_dev(input1, "change", /*setFilterHearthsStat*/ ctx[89], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler*/ ctx[126]),
  				listen_dev(select0, "change", /*select0_change_handler_2*/ ctx[128]),
  				listen_dev(select0, "change", /*setFilterHearthsStat*/ ctx[89], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_2*/ ctx[129]),
  				listen_dev(select1, "change", /*setFilterHearthsStat*/ ctx[89], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*hearths_period_type_Stat*/ 256 && input0_checked_value !== (input0_checked_value = /*hearths_period_type_Stat*/ ctx[39] === 1)) {
  				prop_dev(input0, "checked", input0_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 256) {
  				input0.checked = input0.__value === /*hearths_period_type_Stat*/ ctx[39];
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 128 | dirty[1] & /*hearths_year_Stat, hearths_period_type_Stat*/ 768 | dirty[2] & /*setFilterHearthsStat*/ 134217728) {
  				each_value_15 = Object.keys(/*DtpHearthsStat*/ ctx[7]._opt.years).sort();
  				validate_each_argument(each_value_15);
  				let i;

  				for (i = 0; i < each_value_15.length; i += 1) {
  					const child_ctx = get_each_context_15(ctx, each_value_15, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_2[i] = create_each_block_15(child_ctx);
  						each_blocks_2[i].c();
  						each_blocks_2[i].m(div1, null);
  					}
  				}

  				for (; i < each_blocks_2.length; i += 1) {
  					each_blocks_2[i].d(1);
  				}

  				each_blocks_2.length = each_value_15.length;
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 256) {
  				input1.checked = input1.__value === /*hearths_period_type_Stat*/ ctx[39];
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 128 | dirty[1] & /*hearths_quarter_Stat, hearths_period_type_Stat*/ 1280 | dirty[2] & /*setFilterHearthsStat*/ 134217728) {
  				each_value_13 = Object.keys(/*DtpHearthsStat*/ ctx[7]._opt.years).sort();
  				validate_each_argument(each_value_13);
  				let i;

  				for (i = 0; i < each_value_13.length; i += 1) {
  					const child_ctx = get_each_context_13(ctx, each_value_13, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_13(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div3, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_13.length;
  			}

  			if (dirty[2] & /*optTypeHearthsStatKeys, optDataHearthsStat*/ 12) {
  				each_value_12 = /*optTypeHearthsStatKeys*/ ctx[65];
  				validate_each_argument(each_value_12);
  				let i;

  				for (i = 0; i < each_value_12.length; i += 1) {
  					const child_ctx = get_each_context_12(ctx, each_value_12, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_12(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_12.length;
  			}

  			if (dirty[1] & /*str_icon_typeStat*/ 128) {
  				select_options(select0, /*str_icon_typeStat*/ ctx[38]);
  			}

  			if (dirty[1] & /*hearths_strickenStat*/ 64) {
  				select_option(select1, /*hearths_strickenStat*/ ctx[37]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div8);
  			/*$$binding_groups*/ ctx[117][2].splice(/*$$binding_groups*/ ctx[117][2].indexOf(input0), 1);
  			destroy_each(each_blocks_2, detaching);
  			/*$$binding_groups*/ ctx[117][2].splice(/*$$binding_groups*/ ctx[117][2].indexOf(input1), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_14.name,
  		type: "if",
  		source: "(773:2) {#if DtpHearthsStat._map && DtpHearthsStat._opt && DtpHearthsStat._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (782:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}
  function create_each_block_15(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[158] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_Stat");
  			input.checked = input_checked_value = /*hearths_year_Stat*/ ctx[40][/*key*/ ctx[158]];
  			input.disabled = input_disabled_value = /*hearths_period_type_Stat*/ ctx[39] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[158]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$4, 782, 6, 26873);
  			attr_dev(label, "for", "hearths_year_Stat");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 782, 173, 27040);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsStat*/ ctx[89], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsStat*/ 128 | dirty[1] & /*hearths_year_Stat*/ 512 && input_checked_value !== (input_checked_value = /*hearths_year_Stat*/ ctx[40][/*key*/ ctx[158]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 256 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_Stat*/ ctx[39] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 128 && input_name_value !== (input_name_value = /*key*/ ctx[158])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 128 && t_value !== (t_value = /*key*/ ctx[158] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_15.name,
  		type: "each",
  		source: "(782:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (791:6) {#each Object.keys(DtpHearthsStat._opt.years[key]).sort() as key1}
  function create_each_block_14(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t0_value = /*key1*/ ctx[171] + "";
  	let t0;
  	let t1;
  	let t2_value = /*key*/ ctx[158] + "";
  	let t2;
  	let label_for_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t0 = text(t0_value);
  			t1 = text(" кв. ");
  			t2 = text(t2_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_quarter_Stat");
  			input.checked = input_checked_value = /*hearths_quarter_Stat*/ ctx[41][/*key*/ ctx[158]] && /*hearths_quarter_Stat*/ ctx[41][/*key*/ ctx[158]][/*key1*/ ctx[171]];
  			input.disabled = input_disabled_value = /*hearths_period_type_Stat*/ ctx[39] === 1;
  			attr_dev(input, "name", input_name_value = "" + (/*key*/ ctx[158] + "_" + /*key1*/ ctx[171]));
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$4, 791, 7, 27567);
  			attr_dev(label, "for", label_for_value = "hearths_quarter_Stat_" + /*key*/ ctx[158] + "_" + /*key1*/ ctx[171]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 791, 222, 27782);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t0);
  			append_dev(label, t1);
  			append_dev(label, t2);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsStat*/ ctx[89], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsStat*/ 128 | dirty[1] & /*hearths_quarter_Stat*/ 1024 && input_checked_value !== (input_checked_value = /*hearths_quarter_Stat*/ ctx[41][/*key*/ ctx[158]] && /*hearths_quarter_Stat*/ ctx[41][/*key*/ ctx[158]][/*key1*/ ctx[171]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 256 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_Stat*/ ctx[39] === 1)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 128 && input_name_value !== (input_name_value = "" + (/*key*/ ctx[158] + "_" + /*key1*/ ctx[171]))) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 128 && t0_value !== (t0_value = /*key1*/ ctx[171] + "")) set_data_dev(t0, t0_value);
  			if (dirty[0] & /*DtpHearthsStat*/ 128 && t2_value !== (t2_value = /*key*/ ctx[158] + "")) set_data_dev(t2, t2_value);

  			if (dirty[0] & /*DtpHearthsStat*/ 128 && label_for_value !== (label_for_value = "hearths_quarter_Stat_" + /*key*/ ctx[158] + "_" + /*key1*/ ctx[171])) {
  				attr_dev(label, "for", label_for_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_14.name,
  		type: "each",
  		source: "(791:6) {#each Object.keys(DtpHearthsStat._opt.years[key]).sort() as key1}",
  		ctx
  	});

  	return block;
  }

  // (790:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}
  function create_each_block_13(ctx) {
  	let t;
  	let br;
  	let each_value_14 = Object.keys(/*DtpHearthsStat*/ ctx[7]._opt.years[/*key*/ ctx[158]]).sort();
  	validate_each_argument(each_value_14);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_14.length; i += 1) {
  		each_blocks[i] = create_each_block_14(get_each_context_14(ctx, each_value_14, i));
  	}

  	const block = {
  		c: function create() {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t = space();
  			br = element("br");
  			add_location(br, file$4, 793, 6, 27874);
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, t, anchor);
  			insert_dev(target, br, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsStat*/ 128 | dirty[1] & /*hearths_quarter_Stat, hearths_period_type_Stat*/ 1280 | dirty[2] & /*setFilterHearthsStat*/ 134217728) {
  				each_value_14 = Object.keys(/*DtpHearthsStat*/ ctx[7]._opt.years[/*key*/ ctx[158]]).sort();
  				validate_each_argument(each_value_14);
  				let i;

  				for (i = 0; i < each_value_14.length; i += 1) {
  					const child_ctx = get_each_context_14(ctx, each_value_14, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_14(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(t.parentNode, t);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_14.length;
  			}
  		},
  		d: function destroy(detaching) {
  			destroy_each(each_blocks, detaching);
  			if (detaching) detach_dev(t);
  			if (detaching) detach_dev(br);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_13.name,
  		type: "each",
  		source: "(790:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (805:5) {#each optTypeHearthsStatKeys as key}
  function create_each_block_12(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsStat*/ ctx[64].str_icon_type[/*key*/ ctx[158]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[158] + "";
  	let t3;
  	let t4;
  	let option_value_value;
  	let option_class_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(") - ");
  			t3 = text(t3_value);
  			t4 = space();
  			option.__value = option_value_value = /*key*/ ctx[158];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearthsStat*/ ctx[64].iconType[/*key*/ ctx[158]] + " svelte-1jsovbn");
  			add_location(option, file$4, 805, 6, 28289);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
  			append_dev(option, t4);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_12.name,
  		type: "each",
  		source: "(805:5) {#each optTypeHearthsStatKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (824:2) {#if DtpHearthsTmp._map && DtpHearthsTmp._opt && DtpHearthsTmp._opt.years}
  function create_if_block_13(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div8;
  	let div5;
  	let fieldset;
  	let legend;
  	let t4;
  	let div2;
  	let input0;
  	let input0_value_value;
  	let input0_checked_value;
  	let label0;
  	let t6;
  	let div1;
  	let t7;
  	let div4;
  	let input1;
  	let input1_value_value;
  	let label1;
  	let t9;
  	let div3;
  	let t10;
  	let div6;
  	let select0;
  	let option0;
  	let t14;
  	let div7;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_11 = Object.keys(/*DtpHearthsTmp*/ ctx[8]._opt.years).sort();
  	validate_each_argument(each_value_11);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_11.length; i += 1) {
  		each_blocks_2[i] = create_each_block_11(get_each_context_11(ctx, each_value_11, i));
  	}

  	let each_value_9 = Object.keys(/*DtpHearthsTmp*/ ctx[8]._opt.years).sort();
  	validate_each_argument(each_value_9);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_9.length; i += 1) {
  		each_blocks_1[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
  	}

  	let each_value_8 = /*optTypeHearthsTmpKeys*/ ctx[63];
  	validate_each_argument(each_value_8);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_8.length; i += 1) {
  		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги (TMP)";
  			t2 = space();
  			div8 = element("div");
  			div5 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t4 = space();
  			div2 = element("div");
  			input0 = element("input");
  			label0 = element("label");
  			label0.textContent = "Фильтрация по годам";
  			t6 = space();
  			div1 = element("div");

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].c();
  			}

  			t7 = space();
  			div4 = element("div");
  			input1 = element("input");
  			label1 = element("label");
  			label1.textContent = "Фильтрация по кварталам";
  			t9 = space();
  			div3 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t10 = space();
  			div6 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все типы (${/*optTypeHearthsTmpKeys*/ ctx[63].reduce(/*func_4*/ ctx[132], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t14 = space();
  			div7 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = "Очаги все";
  			option2 = element("option");
  			option2.textContent = "Только с погибшими";
  			option3 = element("option");
  			option3.textContent = "Только с пострадавшими";
  			option4 = element("option");
  			option4.textContent = "С пострадавшими или погибшими";
  			option5 = element("option");
  			option5.textContent = "С пострадавшими и погибшими";
  			add_location(b, file$4, 824, 31, 28989);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 824, 2, 28960);
  			add_location(legend, file$4, 828, 4, 29094);
  			attr_dev(input0, "type", "radio");
  			input0.__value = input0_value_value = 1;
  			input0.value = input0.__value;
  			input0.checked = input0_checked_value = /*hearths_period_type_tmp*/ ctx[44] === 1;
  			attr_dev(input0, "id", "hearths_period_type_tmp1");
  			attr_dev(input0, "name", "hearths_period_type_tmp");
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[117][1].push(input0);
  			add_location(input0, file$4, 830, 5, 29169);
  			attr_dev(label0, "for", "hearths_period_type_tmp1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$4, 830, 205, 29369);
  			attr_dev(div1, "class", "pLine margin svelte-1jsovbn");
  			add_location(div1, file$4, 831, 5, 29440);
  			attr_dev(div2, "class", "pLine type svelte-1jsovbn");
  			add_location(div2, file$4, 829, 4, 29139);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 2;
  			input1.value = input1.__value;
  			attr_dev(input1, "id", "hearths_period_type_tmp2");
  			attr_dev(input1, "name", "hearths_period_type_tmp");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[117][1].push(input1);
  			add_location(input1, file$4, 838, 4, 29814);
  			attr_dev(label1, "for", "hearths_period_type_tmp2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$4, 838, 164, 29974);
  			attr_dev(div3, "class", "pLine margin svelte-1jsovbn");
  			add_location(div3, file$4, 839, 5, 30049);
  			attr_dev(div4, "class", "pLine type svelte-1jsovbn");
  			add_location(div4, file$4, 837, 4, 29785);
  			add_location(fieldset, file$4, 827, 3, 29079);
  			attr_dev(div5, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div5, file$4, 826, 3, 29049);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$4, 866, 5, 31287);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_typeTmp*/ ctx[43] === void 0) add_render_callback(() => /*select0_change_handler_3*/ ctx[133].call(select0));
  			add_location(select0, file$4, 865, 4, 31170);
  			attr_dev(div6, "class", "pLine svelte-1jsovbn");
  			add_location(div6, file$4, 864, 3, 31146);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$4, 878, 5, 31775);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$4, 879, 5, 31816);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$4, 880, 5, 31865);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$4, 881, 5, 31918);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$4, 882, 5, 31978);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_strickenTmp*/ ctx[42] === void 0) add_render_callback(() => /*select1_change_handler_3*/ ctx[134].call(select1));
  			add_location(select1, file$4, 877, 4, 31694);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$4, 876, 3, 31670);
  			attr_dev(div8, "class", "filtersCont svelte-1jsovbn");
  			add_location(div8, file$4, 825, 2, 29020);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div8, anchor);
  			append_dev(div8, div5);
  			append_dev(div5, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t4);
  			append_dev(fieldset, div2);
  			append_dev(div2, input0);
  			input0.checked = input0.__value === /*hearths_period_type_tmp*/ ctx[44];
  			append_dev(div2, label0);
  			append_dev(div2, t6);
  			append_dev(div2, div1);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(div1, null);
  			}

  			append_dev(fieldset, t7);
  			append_dev(fieldset, div4);
  			append_dev(div4, input1);
  			input1.checked = input1.__value === /*hearths_period_type_tmp*/ ctx[44];
  			append_dev(div4, label1);
  			append_dev(div4, t9);
  			append_dev(div4, div3);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div3, null);
  			}

  			append_dev(div8, t10);
  			append_dev(div8, div6);
  			append_dev(div6, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*str_icon_typeTmp*/ ctx[43]);
  			append_dev(div8, t14);
  			append_dev(div8, div7);
  			append_dev(div7, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_strickenTmp*/ ctx[42]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "change", /*setFilterHearthsTmp*/ ctx[90], false, false, false),
  				listen_dev(input0, "change", /*input0_change_handler_1*/ ctx[130]),
  				listen_dev(input1, "change", /*setFilterHearthsTmp*/ ctx[90], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_1*/ ctx[131]),
  				listen_dev(select0, "change", /*select0_change_handler_3*/ ctx[133]),
  				listen_dev(select0, "change", /*setFilterHearthsTmp*/ ctx[90], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_3*/ ctx[134]),
  				listen_dev(select1, "change", /*setFilterHearthsTmp*/ ctx[90], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*hearths_period_type_tmp*/ 8192 && input0_checked_value !== (input0_checked_value = /*hearths_period_type_tmp*/ ctx[44] === 1)) {
  				prop_dev(input0, "checked", input0_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 8192) {
  				input0.checked = input0.__value === /*hearths_period_type_tmp*/ ctx[44];
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 256 | dirty[1] & /*hearths_year_tmp, hearths_period_type_tmp*/ 24576 | dirty[2] & /*setFilterHearthsTmp*/ 268435456) {
  				each_value_11 = Object.keys(/*DtpHearthsTmp*/ ctx[8]._opt.years).sort();
  				validate_each_argument(each_value_11);
  				let i;

  				for (i = 0; i < each_value_11.length; i += 1) {
  					const child_ctx = get_each_context_11(ctx, each_value_11, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_2[i] = create_each_block_11(child_ctx);
  						each_blocks_2[i].c();
  						each_blocks_2[i].m(div1, null);
  					}
  				}

  				for (; i < each_blocks_2.length; i += 1) {
  					each_blocks_2[i].d(1);
  				}

  				each_blocks_2.length = each_value_11.length;
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 8192) {
  				input1.checked = input1.__value === /*hearths_period_type_tmp*/ ctx[44];
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 256 | dirty[1] & /*hearths_quarter_tmp, hearths_period_type_tmp*/ 40960 | dirty[2] & /*setFilterHearthsTmp*/ 268435456) {
  				each_value_9 = Object.keys(/*DtpHearthsTmp*/ ctx[8]._opt.years).sort();
  				validate_each_argument(each_value_9);
  				let i;

  				for (i = 0; i < each_value_9.length; i += 1) {
  					const child_ctx = get_each_context_9(ctx, each_value_9, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_9(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div3, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_9.length;
  			}

  			if (dirty[2] & /*optTypeHearthsTmpKeys, optDataHearthsTmp*/ 3) {
  				each_value_8 = /*optTypeHearthsTmpKeys*/ ctx[63];
  				validate_each_argument(each_value_8);
  				let i;

  				for (i = 0; i < each_value_8.length; i += 1) {
  					const child_ctx = get_each_context_8(ctx, each_value_8, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_8(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_8.length;
  			}

  			if (dirty[1] & /*str_icon_typeTmp*/ 4096) {
  				select_options(select0, /*str_icon_typeTmp*/ ctx[43]);
  			}

  			if (dirty[1] & /*hearths_strickenTmp*/ 2048) {
  				select_option(select1, /*hearths_strickenTmp*/ ctx[42]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div8);
  			/*$$binding_groups*/ ctx[117][1].splice(/*$$binding_groups*/ ctx[117][1].indexOf(input0), 1);
  			destroy_each(each_blocks_2, detaching);
  			/*$$binding_groups*/ ctx[117][1].splice(/*$$binding_groups*/ ctx[117][1].indexOf(input1), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_13.name,
  		type: "if",
  		source: "(824:2) {#if DtpHearthsTmp._map && DtpHearthsTmp._opt && DtpHearthsTmp._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (833:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}
  function create_each_block_11(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[158] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_tmp");
  			input.checked = input_checked_value = /*hearths_year_tmp*/ ctx[45][/*key*/ ctx[158]];
  			input.disabled = input_disabled_value = /*hearths_period_type_tmp*/ ctx[44] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[158]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$4, 833, 6, 29538);
  			attr_dev(label, "for", "hearths_year_tmp");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 833, 169, 29701);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsTmp*/ ctx[90], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 256 | dirty[1] & /*hearths_year_tmp*/ 16384 && input_checked_value !== (input_checked_value = /*hearths_year_tmp*/ ctx[45][/*key*/ ctx[158]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 8192 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_tmp*/ ctx[44] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 256 && input_name_value !== (input_name_value = /*key*/ ctx[158])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 256 && t_value !== (t_value = /*key*/ ctx[158] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_11.name,
  		type: "each",
  		source: "(833:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (842:6) {#each Object.keys(DtpHearthsTmp._opt.years[key]).sort() as key1}
  function create_each_block_10(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t0_value = /*key1*/ ctx[171] + "";
  	let t0;
  	let t1;
  	let t2_value = /*key*/ ctx[158] + "";
  	let t2;
  	let label_for_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t0 = text(t0_value);
  			t1 = text(" кв. ");
  			t2 = text(t2_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_quarter_tmp");
  			input.checked = input_checked_value = /*hearths_quarter_tmp*/ ctx[46][/*key*/ ctx[158]] && /*hearths_quarter_tmp*/ ctx[46][/*key*/ ctx[158]][/*key1*/ ctx[171]];
  			input.disabled = input_disabled_value = /*hearths_period_type_tmp*/ ctx[44] === 1;
  			attr_dev(input, "name", input_name_value = "" + (/*key*/ ctx[158] + "_" + /*key1*/ ctx[171]));
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$4, 842, 7, 30220);
  			attr_dev(label, "for", label_for_value = "hearths_quarter_tmp_" + /*key*/ ctx[158] + "_" + /*key1*/ ctx[171]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 842, 217, 30430);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t0);
  			append_dev(label, t1);
  			append_dev(label, t2);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsTmp*/ ctx[90], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 256 | dirty[1] & /*hearths_quarter_tmp*/ 32768 && input_checked_value !== (input_checked_value = /*hearths_quarter_tmp*/ ctx[46][/*key*/ ctx[158]] && /*hearths_quarter_tmp*/ ctx[46][/*key*/ ctx[158]][/*key1*/ ctx[171]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 8192 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_tmp*/ ctx[44] === 1)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 256 && input_name_value !== (input_name_value = "" + (/*key*/ ctx[158] + "_" + /*key1*/ ctx[171]))) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 256 && t0_value !== (t0_value = /*key1*/ ctx[171] + "")) set_data_dev(t0, t0_value);
  			if (dirty[0] & /*DtpHearthsTmp*/ 256 && t2_value !== (t2_value = /*key*/ ctx[158] + "")) set_data_dev(t2, t2_value);

  			if (dirty[0] & /*DtpHearthsTmp*/ 256 && label_for_value !== (label_for_value = "hearths_quarter_tmp_" + /*key*/ ctx[158] + "_" + /*key1*/ ctx[171])) {
  				attr_dev(label, "for", label_for_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_10.name,
  		type: "each",
  		source: "(842:6) {#each Object.keys(DtpHearthsTmp._opt.years[key]).sort() as key1}",
  		ctx
  	});

  	return block;
  }

  // (841:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}
  function create_each_block_9(ctx) {
  	let t;
  	let br;
  	let each_value_10 = Object.keys(/*DtpHearthsTmp*/ ctx[8]._opt.years[/*key*/ ctx[158]]).sort();
  	validate_each_argument(each_value_10);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_10.length; i += 1) {
  		each_blocks[i] = create_each_block_10(get_each_context_10(ctx, each_value_10, i));
  	}

  	const block = {
  		c: function create() {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t = space();
  			br = element("br");
  			add_location(br, file$4, 844, 6, 30521);
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, t, anchor);
  			insert_dev(target, br, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 256 | dirty[1] & /*hearths_quarter_tmp, hearths_period_type_tmp*/ 40960 | dirty[2] & /*setFilterHearthsTmp*/ 268435456) {
  				each_value_10 = Object.keys(/*DtpHearthsTmp*/ ctx[8]._opt.years[/*key*/ ctx[158]]).sort();
  				validate_each_argument(each_value_10);
  				let i;

  				for (i = 0; i < each_value_10.length; i += 1) {
  					const child_ctx = get_each_context_10(ctx, each_value_10, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_10(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(t.parentNode, t);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_10.length;
  			}
  		},
  		d: function destroy(detaching) {
  			destroy_each(each_blocks, detaching);
  			if (detaching) detach_dev(t);
  			if (detaching) detach_dev(br);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_9.name,
  		type: "each",
  		source: "(841:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (870:5) {#each optTypeHearthsTmpKeys as key}
  function create_each_block_8(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsTmp*/ ctx[62].str_icon_type[/*key*/ ctx[158]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[158] + "";
  	let t3;
  	let t4;
  	let option_value_value;
  	let option_class_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(") - ");
  			t3 = text(t3_value);
  			t4 = space();
  			option.__value = option_value_value = /*key*/ ctx[158];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearthsTmp*/ ctx[62].iconType[/*key*/ ctx[158]] + " svelte-1jsovbn");
  			add_location(option, file$4, 870, 6, 31485);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
  			append_dev(option, t4);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_8.name,
  		type: "each",
  		source: "(870:5) {#each optTypeHearthsTmpKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (889:2) {#if DtpHearths._map && DtpHearths._opt && DtpHearths._opt.years}
  function create_if_block_12(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div9;
  	let div6;
  	let fieldset;
  	let legend;
  	let t5;
  	let div3;
  	let input0;
  	let input0_value_value;
  	let input0_checked_value;
  	let label0;
  	let t7;
  	let div2;
  	let t8;
  	let div5;
  	let input1;
  	let input1_value_value;
  	let label1;
  	let t10;
  	let div4;
  	let t11;
  	let div7;
  	let select0;
  	let option0;
  	let t15;
  	let div8;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_7 = Object.keys(/*DtpHearths*/ ctx[9]._opt.years).sort();
  	validate_each_argument(each_value_7);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_7.length; i += 1) {
  		each_blocks_2[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
  	}

  	let each_value_5 = Object.keys(/*DtpHearths*/ ctx[9]._opt.years).sort();
  	validate_each_argument(each_value_5);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_5.length; i += 1) {
  		each_blocks_1[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
  	}

  	let each_value_4 = /*optTypeHearthsKeys*/ ctx[61];
  	validate_each_argument(each_value_4);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_4.length; i += 1) {
  		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			hr = element("hr");
  			t0 = space();
  			div1 = element("div");
  			t1 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги";
  			t3 = space();
  			div9 = element("div");
  			div6 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t5 = space();
  			div3 = element("div");
  			input0 = element("input");
  			label0 = element("label");
  			label0.textContent = "Фильтрация по годам";
  			t7 = space();
  			div2 = element("div");

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].c();
  			}

  			t8 = space();
  			div5 = element("div");
  			input1 = element("input");
  			label1 = element("label");
  			label1.textContent = "Фильтрация по кварталам";
  			t10 = space();
  			div4 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t11 = space();
  			div7 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все типы (${/*optTypeHearthsKeys*/ ctx[61].reduce(/*func_5*/ ctx[137], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t15 = space();
  			div8 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = "Очаги все";
  			option2 = element("option");
  			option2.textContent = "Только с погибшими";
  			option3 = element("option");
  			option3.textContent = "Только с пострадавшими";
  			option4 = element("option");
  			option4.textContent = "С пострадавшими или погибшими";
  			option5 = element("option");
  			option5.textContent = "С пострадавшими и погибшими";
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$4, 889, 21, 32162);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 889, 2, 32143);
  			add_location(b, file$4, 890, 31, 32204);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$4, 890, 2, 32175);
  			add_location(legend, file$4, 894, 4, 32303);
  			attr_dev(input0, "type", "radio");
  			input0.__value = input0_value_value = 1;
  			input0.value = input0.__value;
  			input0.checked = input0_checked_value = /*hearths_period_type*/ ctx[49] === 1;
  			attr_dev(input0, "id", "hearths_period_type1");
  			attr_dev(input0, "name", "hearths_period_type");
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[117][0].push(input0);
  			add_location(input0, file$4, 896, 5, 32378);
  			attr_dev(label0, "for", "hearths_period_type1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$4, 896, 186, 32559);
  			attr_dev(div2, "class", "pLine margin svelte-1jsovbn");
  			add_location(div2, file$4, 897, 5, 32626);
  			attr_dev(div3, "class", "pLine type svelte-1jsovbn");
  			add_location(div3, file$4, 895, 4, 32348);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 2;
  			input1.value = input1.__value;
  			attr_dev(input1, "id", "hearths_period_type2");
  			attr_dev(input1, "name", "hearths_period_type");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[117][0].push(input1);
  			add_location(input1, file$4, 904, 4, 32983);
  			attr_dev(label1, "for", "hearths_period_type2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$4, 904, 149, 33128);
  			attr_dev(div4, "class", "pLine margin svelte-1jsovbn");
  			add_location(div4, file$4, 905, 5, 33199);
  			attr_dev(div5, "class", "pLine type svelte-1jsovbn");
  			add_location(div5, file$4, 903, 4, 32954);
  			add_location(fieldset, file$4, 893, 3, 32288);
  			attr_dev(div6, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div6, file$4, 892, 3, 32258);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$4, 918, 5, 33848);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_type*/ ctx[48] === void 0) add_render_callback(() => /*select0_change_handler_4*/ ctx[138].call(select0));
  			add_location(select0, file$4, 917, 4, 33737);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$4, 916, 3, 33713);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$4, 930, 5, 34315);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$4, 931, 5, 34356);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$4, 932, 5, 34405);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$4, 933, 5, 34458);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$4, 934, 5, 34518);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken*/ ctx[47] === void 0) add_render_callback(() => /*select1_change_handler_4*/ ctx[139].call(select1));
  			add_location(select1, file$4, 929, 4, 34240);
  			attr_dev(div8, "class", "pLine svelte-1jsovbn");
  			add_location(div8, file$4, 928, 3, 34216);
  			attr_dev(div9, "class", "filtersCont svelte-1jsovbn");
  			add_location(div9, file$4, 891, 2, 32229);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, t1);
  			append_dev(div1, b);
  			insert_dev(target, t3, anchor);
  			insert_dev(target, div9, anchor);
  			append_dev(div9, div6);
  			append_dev(div6, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t5);
  			append_dev(fieldset, div3);
  			append_dev(div3, input0);
  			input0.checked = input0.__value === /*hearths_period_type*/ ctx[49];
  			append_dev(div3, label0);
  			append_dev(div3, t7);
  			append_dev(div3, div2);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(div2, null);
  			}

  			append_dev(fieldset, t8);
  			append_dev(fieldset, div5);
  			append_dev(div5, input1);
  			input1.checked = input1.__value === /*hearths_period_type*/ ctx[49];
  			append_dev(div5, label1);
  			append_dev(div5, t10);
  			append_dev(div5, div4);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div4, null);
  			}

  			append_dev(div9, t11);
  			append_dev(div9, div7);
  			append_dev(div7, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*str_icon_type*/ ctx[48]);
  			append_dev(div9, t15);
  			append_dev(div9, div8);
  			append_dev(div8, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken*/ ctx[47]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "change", /*setFilterHearths*/ ctx[91], false, false, false),
  				listen_dev(input0, "change", /*input0_change_handler_2*/ ctx[135]),
  				listen_dev(input1, "change", /*setFilterHearths*/ ctx[91], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_2*/ ctx[136]),
  				listen_dev(select0, "change", /*select0_change_handler_4*/ ctx[138]),
  				listen_dev(select0, "change", /*setFilterHearths*/ ctx[91], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_4*/ ctx[139]),
  				listen_dev(select1, "change", /*setFilterHearths*/ ctx[91], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*hearths_period_type*/ 262144 && input0_checked_value !== (input0_checked_value = /*hearths_period_type*/ ctx[49] === 1)) {
  				prop_dev(input0, "checked", input0_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type*/ 262144) {
  				input0.checked = input0.__value === /*hearths_period_type*/ ctx[49];
  			}

  			if (dirty[0] & /*DtpHearths*/ 512 | dirty[1] & /*hearths_year, hearths_period_type*/ 786432 | dirty[2] & /*setFilterHearths*/ 536870912) {
  				each_value_7 = Object.keys(/*DtpHearths*/ ctx[9]._opt.years).sort();
  				validate_each_argument(each_value_7);
  				let i;

  				for (i = 0; i < each_value_7.length; i += 1) {
  					const child_ctx = get_each_context_7(ctx, each_value_7, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_2[i] = create_each_block_7(child_ctx);
  						each_blocks_2[i].c();
  						each_blocks_2[i].m(div2, null);
  					}
  				}

  				for (; i < each_blocks_2.length; i += 1) {
  					each_blocks_2[i].d(1);
  				}

  				each_blocks_2.length = each_value_7.length;
  			}

  			if (dirty[1] & /*hearths_period_type*/ 262144) {
  				input1.checked = input1.__value === /*hearths_period_type*/ ctx[49];
  			}

  			if (dirty[0] & /*DtpHearths*/ 512 | dirty[1] & /*hearths_quarter, hearths_period_type*/ 1310720 | dirty[2] & /*setFilterHearths*/ 536870912) {
  				each_value_5 = Object.keys(/*DtpHearths*/ ctx[9]._opt.years).sort();
  				validate_each_argument(each_value_5);
  				let i;

  				for (i = 0; i < each_value_5.length; i += 1) {
  					const child_ctx = get_each_context_5(ctx, each_value_5, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_5(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div4, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_5.length;
  			}

  			if (dirty[1] & /*optTypeHearthsKeys, optDataHearths*/ 1610612736) {
  				each_value_4 = /*optTypeHearthsKeys*/ ctx[61];
  				validate_each_argument(each_value_4);
  				let i;

  				for (i = 0; i < each_value_4.length; i += 1) {
  					const child_ctx = get_each_context_4(ctx, each_value_4, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_4(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_4.length;
  			}

  			if (dirty[1] & /*str_icon_type*/ 131072) {
  				select_options(select0, /*str_icon_type*/ ctx[48]);
  			}

  			if (dirty[1] & /*hearths_stricken*/ 65536) {
  				select_option(select1, /*hearths_stricken*/ ctx[47]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div9);
  			/*$$binding_groups*/ ctx[117][0].splice(/*$$binding_groups*/ ctx[117][0].indexOf(input0), 1);
  			destroy_each(each_blocks_2, detaching);
  			/*$$binding_groups*/ ctx[117][0].splice(/*$$binding_groups*/ ctx[117][0].indexOf(input1), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_12.name,
  		type: "if",
  		source: "(889:2) {#if DtpHearths._map && DtpHearths._opt && DtpHearths._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (899:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}
  function create_each_block_7(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[158] + "";
  	let t;
  	let label_for_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year");
  			input.checked = input_checked_value = /*hearths_year*/ ctx[50][/*key*/ ctx[158]];
  			input.disabled = input_disabled_value = /*hearths_period_type*/ ctx[49] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[158]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$4, 899, 6, 32721);
  			attr_dev(label, "for", label_for_value = "hearths_year" + /*key*/ ctx[158]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 899, 154, 32869);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths*/ ctx[91], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 512 | dirty[1] & /*hearths_year*/ 524288 && input_checked_value !== (input_checked_value = /*hearths_year*/ ctx[50][/*key*/ ctx[158]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type*/ 262144 && input_disabled_value !== (input_disabled_value = /*hearths_period_type*/ ctx[49] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 512 && input_name_value !== (input_name_value = /*key*/ ctx[158])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 512 && t_value !== (t_value = /*key*/ ctx[158] + "")) set_data_dev(t, t_value);

  			if (dirty[0] & /*DtpHearths*/ 512 && label_for_value !== (label_for_value = "hearths_year" + /*key*/ ctx[158])) {
  				attr_dev(label, "for", label_for_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_7.name,
  		type: "each",
  		source: "(899:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (908:6) {#each Object.keys(DtpHearths._opt.years[key]).sort() as key1}
  function create_each_block_6(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t0_value = /*key1*/ ctx[171] + "";
  	let t0;
  	let t1;
  	let t2_value = /*key*/ ctx[158] + "";
  	let t2;
  	let label_for_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t0 = text(t0_value);
  			t1 = text(" кв. ");
  			t2 = text(t2_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_quarter");
  			input.checked = input_checked_value = /*hearths_quarter*/ ctx[51][/*key*/ ctx[158]] && /*hearths_quarter*/ ctx[51][/*key*/ ctx[158]][/*key1*/ ctx[171]];
  			input.disabled = input_disabled_value = /*hearths_period_type*/ ctx[49] === 1;
  			attr_dev(input, "name", input_name_value = "" + (/*key*/ ctx[158] + "_" + /*key1*/ ctx[171]));
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$4, 908, 7, 33364);
  			attr_dev(label, "for", label_for_value = "hearths_quarter_" + /*key*/ ctx[158] + "_" + /*key1*/ ctx[171]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 908, 198, 33555);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t0);
  			append_dev(label, t1);
  			append_dev(label, t2);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths*/ ctx[91], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 512 | dirty[1] & /*hearths_quarter*/ 1048576 && input_checked_value !== (input_checked_value = /*hearths_quarter*/ ctx[51][/*key*/ ctx[158]] && /*hearths_quarter*/ ctx[51][/*key*/ ctx[158]][/*key1*/ ctx[171]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type*/ 262144 && input_disabled_value !== (input_disabled_value = /*hearths_period_type*/ ctx[49] === 1)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 512 && input_name_value !== (input_name_value = "" + (/*key*/ ctx[158] + "_" + /*key1*/ ctx[171]))) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 512 && t0_value !== (t0_value = /*key1*/ ctx[171] + "")) set_data_dev(t0, t0_value);
  			if (dirty[0] & /*DtpHearths*/ 512 && t2_value !== (t2_value = /*key*/ ctx[158] + "")) set_data_dev(t2, t2_value);

  			if (dirty[0] & /*DtpHearths*/ 512 && label_for_value !== (label_for_value = "hearths_quarter_" + /*key*/ ctx[158] + "_" + /*key1*/ ctx[171])) {
  				attr_dev(label, "for", label_for_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_6.name,
  		type: "each",
  		source: "(908:6) {#each Object.keys(DtpHearths._opt.years[key]).sort() as key1}",
  		ctx
  	});

  	return block;
  }

  // (907:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}
  function create_each_block_5(ctx) {
  	let t;
  	let br;
  	let each_value_6 = Object.keys(/*DtpHearths*/ ctx[9]._opt.years[/*key*/ ctx[158]]).sort();
  	validate_each_argument(each_value_6);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_6.length; i += 1) {
  		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
  	}

  	const block = {
  		c: function create() {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t = space();
  			br = element("br");
  			add_location(br, file$4, 910, 6, 33642);
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, t, anchor);
  			insert_dev(target, br, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 512 | dirty[1] & /*hearths_quarter, hearths_period_type*/ 1310720 | dirty[2] & /*setFilterHearths*/ 536870912) {
  				each_value_6 = Object.keys(/*DtpHearths*/ ctx[9]._opt.years[/*key*/ ctx[158]]).sort();
  				validate_each_argument(each_value_6);
  				let i;

  				for (i = 0; i < each_value_6.length; i += 1) {
  					const child_ctx = get_each_context_6(ctx, each_value_6, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_6(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(t.parentNode, t);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_6.length;
  			}
  		},
  		d: function destroy(detaching) {
  			destroy_each(each_blocks, detaching);
  			if (detaching) detach_dev(t);
  			if (detaching) detach_dev(br);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_5.name,
  		type: "each",
  		source: "(907:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (922:5) {#each optTypeHearthsKeys as key}
  function create_each_block_4(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearths*/ ctx[60].str_icon_type[/*key*/ ctx[158]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[158] + "";
  	let t3;
  	let t4;
  	let option_value_value;
  	let option_class_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(") - ");
  			t3 = text(t3_value);
  			t4 = space();
  			option.__value = option_value_value = /*key*/ ctx[158];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearths*/ ctx[60].iconType[/*key*/ ctx[158]] + " svelte-1jsovbn");
  			add_location(option, file$4, 922, 6, 34037);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
  			append_dev(option, t4);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_4.name,
  		type: "each",
  		source: "(922:5) {#each optTypeHearthsKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (966:91) 
  function create_if_block_11(ctx) {
  	let div;

  	const block = {
  		c: function create() {
  			div = element("div");
  			div.textContent = "Нет включенных слоев";
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$4, 966, 3, 35855);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div, anchor);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_11.name,
  		type: "if",
  		source: "(966:91) ",
  		ctx
  	});

  	return block;
  }

  // (941:2) {#if DtpVerifyed._map || DtpSkpdi._map || DtpGibdd._map || DtpGibddRub._map}
  function create_if_block_10(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let button0;
  	let t1;
  	let input0;
  	let t2;
  	let input1;
  	let t3;
  	let button1;
  	let t4;
  	let div2;
  	let br0;
  	let t5;
  	let label0;
  	let input2;
  	let input2_disabled_value;
  	let span0;
  	let t6;
  	let t7;
  	let t8;
  	let t9;
  	let br1;
  	let t10;
  	let label1;
  	let input3;
  	let input3_disabled_value;
  	let span1;
  	let t11;
  	let t12;
  	let t13;
  	let t14;
  	let br2;
  	let t15;
  	let label2;
  	let input4;
  	let input4_disabled_value;
  	let span2;
  	let t16;
  	let t17;
  	let t18;
  	let t19;
  	let div3;
  	let input5;
  	let label3;
  	let dispose;

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			hr = element("hr");
  			t0 = space();
  			div1 = element("div");
  			button0 = element("button");
  			t1 = space();
  			input0 = element("input");
  			t2 = space();
  			input1 = element("input");
  			t3 = space();
  			button1 = element("button");
  			t4 = space();
  			div2 = element("div");
  			br0 = element("br");
  			t5 = space();
  			label0 = element("label");
  			input2 = element("input");
  			span0 = element("span");
  			t6 = text("Мин.яркость (");
  			t7 = text(/*minOpacity*/ ctx[23]);
  			t8 = text(")");
  			t9 = space();
  			br1 = element("br");
  			t10 = space();
  			label1 = element("label");
  			input3 = element("input");
  			span1 = element("span");
  			t11 = text("Радиус (");
  			t12 = text(/*radius*/ ctx[21]);
  			t13 = text(")");
  			t14 = space();
  			br2 = element("br");
  			t15 = space();
  			label2 = element("label");
  			input4 = element("input");
  			span2 = element("span");
  			t16 = text("Размытие (");
  			t17 = text(/*blur*/ ctx[22]);
  			t18 = text(")");
  			t19 = space();
  			div3 = element("div");
  			input5 = element("input");
  			label3 = element("label");
  			label3.textContent = "- тепловая карта";
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$4, 941, 21, 34713);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 941, 2, 34694);
  			attr_dev(button0, "class", "pika-prev");
  			add_location(button0, file$4, 943, 3, 34757);
  			attr_dev(input0, "type", "text");
  			attr_dev(input0, "class", "begDate svelte-1jsovbn");
  			add_location(input0, file$4, 944, 3, 34814);
  			attr_dev(input1, "type", "text");
  			attr_dev(input1, "class", "endDate svelte-1jsovbn");
  			add_location(input1, file$4, 945, 3, 34875);
  			attr_dev(button1, "class", "pika-next");
  			add_location(button1, file$4, 946, 3, 34936);
  			attr_dev(div1, "class", "pikaday pLine svelte-1jsovbn");
  			add_location(div1, file$4, 942, 2, 34726);
  			add_location(br0, file$4, 949, 4, 35026);
  			attr_dev(input2, "type", "range");
  			attr_dev(input2, "min", "0.05");
  			attr_dev(input2, "max", "1");
  			attr_dev(input2, "step", "0.01");
  			input2.disabled = input2_disabled_value = !/*heat*/ ctx[72];
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$4, 951, 5, 35050);
  			add_location(span0, file$4, 951, 122, 35167);
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$4, 950, 4, 35037);
  			add_location(br1, file$4, 953, 4, 35224);
  			attr_dev(input3, "type", "range");
  			attr_dev(input3, "min", "0");
  			attr_dev(input3, "max", "100");
  			attr_dev(input3, "step", "1");
  			input3.disabled = input3_disabled_value = !/*heat*/ ctx[72];
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$4, 955, 5, 35248);
  			add_location(span1, file$4, 955, 114, 35357);
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$4, 954, 4, 35235);
  			add_location(br2, file$4, 957, 4, 35405);
  			attr_dev(input4, "type", "range");
  			attr_dev(input4, "min", "0");
  			attr_dev(input4, "max", "15");
  			attr_dev(input4, "step", "0.01");
  			input4.disabled = input4_disabled_value = !/*heat*/ ctx[72];
  			attr_dev(input4, "class", "svelte-1jsovbn");
  			add_location(input4, file$4, 959, 5, 35429);
  			add_location(span2, file$4, 959, 114, 35538);
  			attr_dev(label2, "class", "svelte-1jsovbn");
  			add_location(label2, file$4, 958, 4, 35416);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$4, 948, 3, 35002);
  			attr_dev(input5, "type", "checkbox");
  			input5.checked = true;
  			attr_dev(input5, "name", "heat");
  			attr_dev(input5, "class", "svelte-1jsovbn");
  			add_location(input5, file$4, 963, 4, 35619);
  			attr_dev(label3, "for", "heat");
  			attr_dev(label3, "class", "svelte-1jsovbn");
  			add_location(label3, file$4, 963, 91, 35706);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$4, 962, 3, 35595);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, button0);
  			append_dev(div1, t1);
  			append_dev(div1, input0);
  			/*input0_binding*/ ctx[140](input0);
  			append_dev(div1, t2);
  			append_dev(div1, input1);
  			/*input1_binding*/ ctx[141](input1);
  			append_dev(div1, t3);
  			append_dev(div1, button1);
  			insert_dev(target, t4, anchor);
  			insert_dev(target, div2, anchor);
  			append_dev(div2, br0);
  			append_dev(div2, t5);
  			append_dev(div2, label0);
  			append_dev(label0, input2);
  			set_input_value(input2, /*minOpacity*/ ctx[23]);
  			append_dev(label0, span0);
  			append_dev(span0, t6);
  			append_dev(span0, t7);
  			append_dev(span0, t8);
  			append_dev(div2, t9);
  			append_dev(div2, br1);
  			append_dev(div2, t10);
  			append_dev(div2, label1);
  			append_dev(label1, input3);
  			set_input_value(input3, /*radius*/ ctx[21]);
  			append_dev(label1, span1);
  			append_dev(span1, t11);
  			append_dev(span1, t12);
  			append_dev(span1, t13);
  			append_dev(div2, t14);
  			append_dev(div2, br2);
  			append_dev(div2, t15);
  			append_dev(div2, label2);
  			append_dev(label2, input4);
  			set_input_value(input4, /*blur*/ ctx[22]);
  			append_dev(label2, span2);
  			append_dev(span2, t16);
  			append_dev(span2, t17);
  			append_dev(span2, t18);
  			insert_dev(target, t19, anchor);
  			insert_dev(target, div3, anchor);
  			append_dev(div3, input5);
  			/*input5_binding*/ ctx[145](input5);
  			append_dev(div3, label3);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(button0, "click", /*onPrev*/ ctx[85], false, false, false),
  				listen_dev(button1, "click", /*onNext*/ ctx[86], false, false, false),
  				listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[142]),
  				listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[142]),
  				listen_dev(input2, "input", /*setMinOpacity*/ ctx[79], false, false, false),
  				listen_dev(input3, "change", /*input3_change_input_handler*/ ctx[143]),
  				listen_dev(input3, "input", /*input3_change_input_handler*/ ctx[143]),
  				listen_dev(input3, "input", /*setMinOpacity*/ ctx[79], false, false, false),
  				listen_dev(input4, "change", /*input4_change_input_handler*/ ctx[144]),
  				listen_dev(input4, "input", /*input4_change_input_handler*/ ctx[144]),
  				listen_dev(input4, "input", /*setMinOpacity*/ ctx[79], false, false, false),
  				listen_dev(input5, "change", /*setHeat*/ ctx[78], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*minOpacity*/ 8388608) {
  				set_input_value(input2, /*minOpacity*/ ctx[23]);
  			}

  			if (dirty[0] & /*minOpacity*/ 8388608) set_data_dev(t7, /*minOpacity*/ ctx[23]);

  			if (dirty[0] & /*radius*/ 2097152) {
  				set_input_value(input3, /*radius*/ ctx[21]);
  			}

  			if (dirty[0] & /*radius*/ 2097152) set_data_dev(t12, /*radius*/ ctx[21]);

  			if (dirty[0] & /*blur*/ 4194304) {
  				set_input_value(input4, /*blur*/ ctx[22]);
  			}

  			if (dirty[0] & /*blur*/ 4194304) set_data_dev(t17, /*blur*/ ctx[22]);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			/*input0_binding*/ ctx[140](null);
  			/*input1_binding*/ ctx[141](null);
  			if (detaching) detach_dev(t4);
  			if (detaching) detach_dev(div2);
  			if (detaching) detach_dev(t19);
  			if (detaching) detach_dev(div3);
  			/*input5_binding*/ ctx[145](null);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_10.name,
  		type: "if",
  		source: "(941:2) {#if DtpVerifyed._map || DtpSkpdi._map || DtpGibdd._map || DtpGibddRub._map}",
  		ctx
  	});

  	return block;
  }

  // (970:2) {#if DtpVerifyed._map}
  function create_if_block_7$1(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div4;
  	let div2;
  	let input0;
  	let label0;
  	let t5;
  	let t6;
  	let div3;
  	let input1;
  	let label1;
  	let t8;
  	let dispose;

  	function select_block_type_1(ctx, dirty) {
  		if (/*DtpVerifyed*/ ctx[0]._arm) return create_if_block_9;
  		return create_else_block$1;
  	}

  	let current_block_type = select_block_type_1(ctx);
  	let if_block0 = current_block_type(ctx);
  	let if_block1 = /*optData*/ ctx[52].collision_type && create_if_block_8(ctx);

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			hr = element("hr");
  			t0 = space();
  			div1 = element("div");
  			t1 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Сводный";
  			t3 = space();
  			div4 = element("div");
  			div2 = element("div");
  			input0 = element("input");
  			label0 = element("label");
  			label0.textContent = "Все";
  			t5 = space();
  			if_block0.c();
  			t6 = space();
  			div3 = element("div");
  			input1 = element("input");
  			label1 = element("label");
  			label1.textContent = "Только ГИБДД";
  			t8 = space();
  			if (if_block1) if_block1.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$4, 970, 21, 35956);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 970, 2, 35937);
  			add_location(b, file$4, 971, 31, 35998);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$4, 971, 2, 35969);
  			attr_dev(input0, "type", "radio");
  			attr_dev(input0, "id", "d0");
  			attr_dev(input0, "name", "drone");
  			input0.value = "0";
  			input0.checked = true;
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$4, 973, 22, 36073);
  			attr_dev(label0, "for", "d0");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$4, 973, 98, 36149);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$4, 973, 3, 36054);
  			attr_dev(input1, "type", "radio");
  			attr_dev(input1, "id", "d3");
  			attr_dev(input1, "name", "drone");
  			input1.value = "3";
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$4, 980, 22, 36678);
  			attr_dev(label1, "for", "d3");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$4, 980, 92, 36748);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$4, 980, 3, 36659);
  			attr_dev(div4, "class", "filtersCont svelte-1jsovbn");
  			add_location(div4, file$4, 972, 2, 36025);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, t1);
  			append_dev(div1, b);
  			insert_dev(target, t3, anchor);
  			insert_dev(target, div4, anchor);
  			append_dev(div4, div2);
  			append_dev(div2, input0);
  			append_dev(div2, label0);
  			append_dev(div4, t5);
  			if_block0.m(div4, null);
  			append_dev(div4, t6);
  			append_dev(div4, div3);
  			append_dev(div3, input1);
  			append_dev(div3, label1);
  			append_dev(div4, t8);
  			if (if_block1) if_block1.m(div4, null);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "click", /*oncheck*/ ctx[84], false, false, false),
  				listen_dev(input1, "click", /*oncheck*/ ctx[84], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
  				if_block0.p(ctx, dirty);
  			} else {
  				if_block0.d(1);
  				if_block0 = current_block_type(ctx);

  				if (if_block0) {
  					if_block0.c();
  					if_block0.m(div4, t6);
  				}
  			}

  			if (/*optData*/ ctx[52].collision_type) if_block1.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div4);
  			if_block0.d();
  			if (if_block1) if_block1.d();
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_7$1.name,
  		type: "if",
  		source: "(970:2) {#if DtpVerifyed._map}",
  		ctx
  	});

  	return block;
  }

  // (977:3) {:else}
  function create_else_block$1(ctx) {
  	let div0;
  	let input0;
  	let label0;
  	let t1;
  	let div1;
  	let input1;
  	let label1;
  	let dispose;

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			input0 = element("input");
  			label0 = element("label");
  			label0.textContent = "Только Пересечения";
  			t1 = space();
  			div1 = element("div");
  			input1 = element("input");
  			label1 = element("label");
  			label1.textContent = "Только СКПДИ";
  			attr_dev(input0, "type", "radio");
  			attr_dev(input0, "id", "d1");
  			attr_dev(input0, "name", "drone");
  			input0.value = "1";
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$4, 977, 22, 36395);
  			attr_dev(label0, "for", "d1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$4, 977, 90, 36463);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 977, 3, 36376);
  			attr_dev(input1, "type", "radio");
  			attr_dev(input1, "id", "d2");
  			attr_dev(input1, "name", "drone");
  			input1.value = "2";
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$4, 978, 22, 36534);
  			attr_dev(label1, "for", "d2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$4, 978, 92, 36604);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$4, 978, 3, 36515);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, input0);
  			append_dev(div0, label0);
  			insert_dev(target, t1, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, input1);
  			append_dev(div1, label1);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "click", /*oncheck*/ ctx[84], false, false, false),
  				listen_dev(input1, "click", /*oncheck*/ ctx[84], false, false, false)
  			];
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t1);
  			if (detaching) detach_dev(div1);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_else_block$1.name,
  		type: "else",
  		source: "(977:3) {:else}",
  		ctx
  	});

  	return block;
  }

  // (975:3) {#if DtpVerifyed._arm}
  function create_if_block_9(ctx) {
  	let div;
  	let input;
  	let label;
  	let dispose;

  	const block = {
  		c: function create() {
  			div = element("div");
  			input = element("input");
  			label = element("label");
  			label.textContent = "Только Пересечения ГИБДД и СКПДИ";
  			attr_dev(input, "type", "radio");
  			attr_dev(input, "id", "d1");
  			attr_dev(input, "name", "drone");
  			input.value = "1";
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$4, 975, 22, 36231);
  			attr_dev(label, "for", "d1");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$4, 975, 90, 36299);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$4, 975, 3, 36212);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, input);
  			append_dev(div, label);
  			if (remount) dispose();
  			dispose = listen_dev(input, "click", /*oncheck*/ ctx[84], false, false, false);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_9.name,
  		type: "if",
  		source: "(975:3) {#if DtpVerifyed._arm}",
  		ctx
  	});

  	return block;
  }

  // (982:3) {#if optData.collision_type}
  function create_if_block_8(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_3 = /*optCollisionKeys*/ ctx[53];
  	validate_each_argument(each_value_3);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_3.length; i += 1) {
  		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
  	}

  	const block = {
  		c: function create() {
  			div = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все типы (${/*optCollisionKeys*/ ctx[53].reduce(/*func_6*/ ctx[146], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$4, 984, 5, 36952);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type*/ ctx[17] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[147].call(select));
  			add_location(select, file$4, 983, 4, 36850);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$4, 982, 3, 36826);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type*/ ctx[17]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_1*/ ctx[147]),
  				listen_dev(select, "change", /*setFilter*/ ctx[80], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*optCollisionKeys, optData*/ 6291456) {
  				each_value_3 = /*optCollisionKeys*/ ctx[53];
  				validate_each_argument(each_value_3);
  				let i;

  				for (i = 0; i < each_value_3.length; i += 1) {
  					const child_ctx = get_each_context_3(ctx, each_value_3, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_3(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_3.length;
  			}

  			if (dirty[0] & /*collision_type*/ 131072) {
  				select_options(select, /*collision_type*/ ctx[17]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_8.name,
  		type: "if",
  		source: "(982:3) {#if optData.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (988:5) {#each optCollisionKeys as key}
  function create_each_block_3(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optData*/ ctx[52].collision_type[/*key*/ ctx[158]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[158] + "";
  	let t3;
  	let t4;
  	let option_value_value;
  	let option_class_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(") - ");
  			t3 = text(t3_value);
  			t4 = space();
  			option.__value = option_value_value = /*key*/ ctx[158];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optData*/ ctx[52].iconType[/*key*/ ctx[158]] + " svelte-1jsovbn");
  			add_location(option, file$4, 988, 6, 37131);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
  			append_dev(option, t4);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_3.name,
  		type: "each",
  		source: "(988:5) {#each optCollisionKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (999:2) {#if DtpSkpdi._map}
  function create_if_block_5$1(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div2;
  	let if_block = /*optDataSkpdi*/ ctx[54].collision_type && create_if_block_6$1(ctx);

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			hr = element("hr");
  			t0 = space();
  			div1 = element("div");
  			t1 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП СКПДИ";
  			t3 = space();
  			div2 = element("div");
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$4, 999, 21, 37364);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 999, 2, 37345);
  			add_location(b, file$4, 1000, 31, 37406);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$4, 1000, 2, 37377);
  			attr_dev(div2, "class", "filtersCont svelte-1jsovbn");
  			add_location(div2, file$4, 1001, 2, 37431);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, t1);
  			append_dev(div1, b);
  			insert_dev(target, t3, anchor);
  			insert_dev(target, div2, anchor);
  			if (if_block) if_block.m(div2, null);
  		},
  		p: function update(ctx, dirty) {
  			if (/*optDataSkpdi*/ ctx[54].collision_type) if_block.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div2);
  			if (if_block) if_block.d();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_5$1.name,
  		type: "if",
  		source: "(999:2) {#if DtpSkpdi._map}",
  		ctx
  	});

  	return block;
  }

  // (1003:3) {#if optDataSkpdi.collision_type}
  function create_if_block_6$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_2 = /*optCollisionSkpdiKeys*/ ctx[55];
  	validate_each_argument(each_value_2);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_2.length; i += 1) {
  		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  	}

  	const block = {
  		c: function create() {
  			div = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все типы (${/*optCollisionSkpdiKeys*/ ctx[55].reduce(/*func_7*/ ctx[148], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$4, 1005, 5, 37634);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_skpdi*/ ctx[18] === void 0) add_render_callback(() => /*select_change_handler_2*/ ctx[149].call(select));
  			add_location(select, file$4, 1004, 4, 37521);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$4, 1003, 3, 37497);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_skpdi*/ ctx[18]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_2*/ ctx[149]),
  				listen_dev(select, "change", /*setFilterSkpdi*/ ctx[83], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*optCollisionSkpdiKeys, optDataSkpdi*/ 25165824) {
  				each_value_2 = /*optCollisionSkpdiKeys*/ ctx[55];
  				validate_each_argument(each_value_2);
  				let i;

  				for (i = 0; i < each_value_2.length; i += 1) {
  					const child_ctx = get_each_context_2(ctx, each_value_2, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_2(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_2.length;
  			}

  			if (dirty[0] & /*collision_type_skpdi*/ 262144) {
  				select_options(select, /*collision_type_skpdi*/ ctx[18]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_6$1.name,
  		type: "if",
  		source: "(1003:3) {#if optDataSkpdi.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1009:5) {#each optCollisionSkpdiKeys as key}
  function create_each_block_2(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataSkpdi*/ ctx[54].collision_type[/*key*/ ctx[158]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[158] + "";
  	let t3;
  	let t4;
  	let option_value_value;
  	let option_class_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(") - ");
  			t3 = text(t3_value);
  			t4 = space();
  			option.__value = option_value_value = /*key*/ ctx[158];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataSkpdi*/ ctx[54].iconType[/*key*/ ctx[158]] + " svelte-1jsovbn");
  			add_location(option, file$4, 1009, 6, 37828);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
  			append_dev(option, t4);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_2.name,
  		type: "each",
  		source: "(1009:5) {#each optCollisionSkpdiKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1020:2) {#if DtpGibdd._map}
  function create_if_block_3$1(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div2;
  	let if_block = /*optDataGibdd*/ ctx[56].collision_type && create_if_block_4$1(ctx);

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			hr = element("hr");
  			t0 = space();
  			div1 = element("div");
  			t1 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП ГИБДД";
  			t3 = space();
  			div2 = element("div");
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$4, 1020, 21, 38071);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 1020, 2, 38052);
  			add_location(b, file$4, 1021, 31, 38113);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$4, 1021, 2, 38084);
  			attr_dev(div2, "class", "filtersCont svelte-1jsovbn");
  			add_location(div2, file$4, 1022, 2, 38138);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, t1);
  			append_dev(div1, b);
  			insert_dev(target, t3, anchor);
  			insert_dev(target, div2, anchor);
  			if (if_block) if_block.m(div2, null);
  		},
  		p: function update(ctx, dirty) {
  			if (/*optDataGibdd*/ ctx[56].collision_type) if_block.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div2);
  			if (if_block) if_block.d();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_3$1.name,
  		type: "if",
  		source: "(1020:2) {#if DtpGibdd._map}",
  		ctx
  	});

  	return block;
  }

  // (1024:3) {#if optDataGibdd.collision_type}
  function create_if_block_4$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_1 = /*optCollisionGibddKeys*/ ctx[57];
  	validate_each_argument(each_value_1);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
  	}

  	const block = {
  		c: function create() {
  			div = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все типы (${/*optCollisionGibddKeys*/ ctx[57].reduce(/*func_8*/ ctx[150], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$4, 1026, 5, 38341);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_gibdd*/ ctx[19] === void 0) add_render_callback(() => /*select_change_handler_3*/ ctx[151].call(select));
  			add_location(select, file$4, 1025, 4, 38228);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$4, 1024, 3, 38204);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_gibdd*/ ctx[19]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_3*/ ctx[151]),
  				listen_dev(select, "change", /*setFilterGibdd*/ ctx[82], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*optCollisionGibddKeys, optDataGibdd*/ 100663296) {
  				each_value_1 = /*optCollisionGibddKeys*/ ctx[57];
  				validate_each_argument(each_value_1);
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_1$2(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_1.length;
  			}

  			if (dirty[0] & /*collision_type_gibdd*/ 524288) {
  				select_options(select, /*collision_type_gibdd*/ ctx[19]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_4$1.name,
  		type: "if",
  		source: "(1024:3) {#if optDataGibdd.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1030:5) {#each optCollisionGibddKeys as key}
  function create_each_block_1$2(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataGibdd*/ ctx[56].collision_type[/*key*/ ctx[158]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[158] + "";
  	let t3;
  	let t4;
  	let option_value_value;
  	let option_class_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(") - ");
  			t3 = text(t3_value);
  			t4 = space();
  			option.__value = option_value_value = /*key*/ ctx[158];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataGibdd*/ ctx[56].iconType[/*key*/ ctx[158]] + " svelte-1jsovbn");
  			add_location(option, file$4, 1030, 6, 38535);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
  			append_dev(option, t4);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_1$2.name,
  		type: "each",
  		source: "(1030:5) {#each optCollisionGibddKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1041:2) {#if DtpGibddRub._map}
  function create_if_block_1$2(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div2;
  	let input0;
  	let label0;
  	let t5;
  	let input1;
  	let label1;
  	let t7;
  	let div3;
  	let dispose;
  	let if_block = /*optDataGibddRub*/ ctx[58].collision_type && create_if_block_2$1(ctx);

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			hr = element("hr");
  			t0 = space();
  			div1 = element("div");
  			t1 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП ГИБДД + Рубежи";
  			t3 = space();
  			div2 = element("div");
  			input0 = element("input");
  			label0 = element("label");
  			label0.textContent = "- с рубежами";
  			t5 = space();
  			input1 = element("input");
  			label1 = element("label");
  			label1.textContent = "- без рубежей";
  			t7 = text("\n\t\tlist_rub\n\t\t");
  			div3 = element("div");
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$4, 1041, 21, 38781);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 1041, 2, 38762);
  			add_location(b, file$4, 1042, 31, 38823);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$4, 1042, 2, 38794);
  			attr_dev(input0, "type", "checkbox");
  			attr_dev(input0, "name", "list_rubOn");
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$4, 1044, 3, 38880);
  			attr_dev(label0, "for", "list_rubOn");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$4, 1044, 100, 38977);
  			attr_dev(input1, "type", "checkbox");
  			attr_dev(input1, "name", "list_rubOff");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$4, 1045, 3, 39026);
  			attr_dev(label1, "for", "list_rubOff");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$4, 1045, 102, 39125);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$4, 1043, 2, 38857);
  			attr_dev(div3, "class", "filtersCont svelte-1jsovbn");
  			add_location(div3, file$4, 1048, 2, 39195);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, t1);
  			append_dev(div1, b);
  			insert_dev(target, t3, anchor);
  			insert_dev(target, div2, anchor);
  			append_dev(div2, input0);
  			input0.checked = /*list_rubOn*/ ctx[27];
  			append_dev(div2, label0);
  			append_dev(div2, t5);
  			append_dev(div2, input1);
  			input1.checked = /*list_rubOff*/ ctx[28];
  			append_dev(div2, label1);
  			insert_dev(target, t7, anchor);
  			insert_dev(target, div3, anchor);
  			if (if_block) if_block.m(div3, null);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "change", /*input0_change_handler_3*/ ctx[152]),
  				listen_dev(input0, "change", /*setFilterGibddRub*/ ctx[81], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_3*/ ctx[153]),
  				listen_dev(input1, "change", /*setFilterGibddRub*/ ctx[81], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*list_rubOn*/ 134217728) {
  				input0.checked = /*list_rubOn*/ ctx[27];
  			}

  			if (dirty[0] & /*list_rubOff*/ 268435456) {
  				input1.checked = /*list_rubOff*/ ctx[28];
  			}

  			if (/*optDataGibddRub*/ ctx[58].collision_type) if_block.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div2);
  			if (detaching) detach_dev(t7);
  			if (detaching) detach_dev(div3);
  			if (if_block) if_block.d();
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_1$2.name,
  		type: "if",
  		source: "(1041:2) {#if DtpGibddRub._map}",
  		ctx
  	});

  	return block;
  }

  // (1050:3) {#if optDataGibddRub.collision_type}
  function create_if_block_2$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value = /*optCollisionGibddRubKeys*/ ctx[59];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
  	}

  	const block = {
  		c: function create() {
  			div = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все типы (${/*optCollisionGibddRubKeys*/ ctx[59].reduce(/*func_9*/ ctx[154], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$4, 1052, 5, 39407);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_gibddRub*/ ctx[20] === void 0) add_render_callback(() => /*select_change_handler_4*/ ctx[155].call(select));
  			add_location(select, file$4, 1051, 4, 39288);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$4, 1050, 3, 39264);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_gibddRub*/ ctx[20]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_4*/ ctx[155]),
  				listen_dev(select, "change", /*setFilterGibddRub*/ ctx[81], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*optCollisionGibddRubKeys, optDataGibddRub*/ 402653184) {
  				each_value = /*optCollisionGibddRubKeys*/ ctx[59];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$4(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$4(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}

  			if (dirty[0] & /*collision_type_gibddRub*/ 1048576) {
  				select_options(select, /*collision_type_gibddRub*/ ctx[20]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_2$1.name,
  		type: "if",
  		source: "(1050:3) {#if optDataGibddRub.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1056:5) {#each optCollisionGibddRubKeys as key}
  function create_each_block$4(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataGibddRub*/ ctx[58].collision_type[/*key*/ ctx[158]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[158] + "";
  	let t3;
  	let t4;
  	let option_value_value;
  	let option_class_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text("(");
  			t1 = text(t1_value);
  			t2 = text(") - ");
  			t3 = text(t3_value);
  			t4 = space();
  			option.__value = option_value_value = /*key*/ ctx[158];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataGibddRub*/ ctx[58].iconType[/*key*/ ctx[158]] + " svelte-1jsovbn");
  			add_location(option, file$4, 1056, 6, 39610);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
  			append_dev(option, t4);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$4.name,
  		type: "each",
  		source: "(1056:5) {#each optCollisionGibddRubKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1067:2) {#if Rub._map}
  function create_if_block$3(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div3;
  	let div2;
  	let input0;
  	let label0;
  	let t5;
  	let input1;
  	let label1;
  	let dispose;

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			hr = element("hr");
  			t0 = space();
  			div1 = element("div");
  			t1 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "Рубежей";
  			t3 = space();
  			div3 = element("div");
  			div2 = element("div");
  			input0 = element("input");
  			label0 = element("label");
  			label0.textContent = "- есть комплексы";
  			t5 = space();
  			input1 = element("input");
  			label1 = element("label");
  			label1.textContent = "-  нет комплексов";
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$4, 1067, 21, 39854);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$4, 1067, 2, 39835);
  			add_location(b, file$4, 1068, 31, 39896);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$4, 1068, 2, 39867);
  			attr_dev(input0, "type", "checkbox");
  			attr_dev(input0, "name", "comp1");
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$4, 1071, 4, 39972);
  			attr_dev(label0, "for", "comp1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$4, 1071, 82, 40050);
  			attr_dev(input1, "type", "checkbox");
  			attr_dev(input1, "name", "comp");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$4, 1072, 4, 40099);
  			attr_dev(label1, "for", "comp");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$4, 1072, 82, 40177);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$4, 1070, 3, 39948);
  			attr_dev(div3, "class", "filtersCont");
  			add_location(div3, file$4, 1069, 2, 39919);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, t1);
  			append_dev(div1, b);
  			insert_dev(target, t3, anchor);
  			insert_dev(target, div3, anchor);
  			append_dev(div3, div2);
  			append_dev(div2, input0);
  			input0.checked = /*compOn*/ ctx[25];
  			append_dev(div2, label0);
  			append_dev(div2, t5);
  			append_dev(div2, input1);
  			input1.checked = /*comp1On*/ ctx[26];
  			append_dev(div2, label1);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "change", /*input0_change_handler_4*/ ctx[156]),
  				listen_dev(input0, "change", /*setComp*/ ctx[73], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_4*/ ctx[157]),
  				listen_dev(input1, "change", /*setComp*/ ctx[73], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*compOn*/ 33554432) {
  				input0.checked = /*compOn*/ ctx[25];
  			}

  			if (dirty[0] & /*comp1On*/ 67108864) {
  				input1.checked = /*comp1On*/ ctx[26];
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div3);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block$3.name,
  		type: "if",
  		source: "(1067:2) {#if Rub._map}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$4(ctx) {
  	let div;
  	let t0;
  	let t1;
  	let t2;
  	let t3;
  	let t4;
  	let t5;
  	let t6;
  	let t7;
  	let t8;
  	let t9;
  	let t10;
  	let if_block0 = /*DtpHearthsPicket*/ ctx[4]._map && /*DtpHearthsPicket*/ ctx[4]._opt && /*DtpHearthsPicket*/ ctx[4]._opt.years && create_if_block_17(ctx);
  	let if_block1 = /*DtpHearths5*/ ctx[5]._map && /*DtpHearths5*/ ctx[5]._opt && /*DtpHearths5*/ ctx[5]._opt.years && create_if_block_16(ctx);
  	let if_block2 = /*DtpHearths3*/ ctx[6]._map && /*DtpHearths3*/ ctx[6]._opt && /*DtpHearths3*/ ctx[6]._opt.years && create_if_block_15(ctx);
  	let if_block3 = /*DtpHearthsStat*/ ctx[7]._map && /*DtpHearthsStat*/ ctx[7]._opt && /*DtpHearthsStat*/ ctx[7]._opt.years && create_if_block_14(ctx);
  	let if_block4 = /*DtpHearthsTmp*/ ctx[8]._map && /*DtpHearthsTmp*/ ctx[8]._opt && /*DtpHearthsTmp*/ ctx[8]._opt.years && create_if_block_13(ctx);
  	let if_block5 = /*DtpHearths*/ ctx[9]._map && /*DtpHearths*/ ctx[9]._opt && /*DtpHearths*/ ctx[9]._opt.years && create_if_block_12(ctx);

  	function select_block_type(ctx, dirty) {
  		if (/*DtpVerifyed*/ ctx[0]._map || /*DtpSkpdi*/ ctx[1]._map || /*DtpGibdd*/ ctx[2]._map || /*DtpGibddRub*/ ctx[3]._map) return create_if_block_10;
  		if (!/*DtpHearths*/ ctx[9]._map && !/*DtpHearthsTmp*/ ctx[8]._map && !/*DtpHearthsPicket*/ ctx[4]._map && !/*Rub*/ ctx[10]._map) return create_if_block_11;
  	}

  	let current_block_type = select_block_type(ctx);
  	let if_block6 = current_block_type && current_block_type(ctx);
  	let if_block7 = /*DtpVerifyed*/ ctx[0]._map && create_if_block_7$1(ctx);
  	let if_block8 = /*DtpSkpdi*/ ctx[1]._map && create_if_block_5$1(ctx);
  	let if_block9 = /*DtpGibdd*/ ctx[2]._map && create_if_block_3$1(ctx);
  	let if_block10 = /*DtpGibddRub*/ ctx[3]._map && create_if_block_1$2(ctx);
  	let if_block11 = /*Rub*/ ctx[10]._map && create_if_block$3(ctx);

  	const block = {
  		c: function create() {
  			div = element("div");
  			if (if_block0) if_block0.c();
  			t0 = space();
  			if (if_block1) if_block1.c();
  			t1 = space();
  			if (if_block2) if_block2.c();
  			t2 = space();
  			if (if_block3) if_block3.c();
  			t3 = space();
  			if (if_block4) if_block4.c();
  			t4 = space();
  			if (if_block5) if_block5.c();
  			t5 = space();
  			if (if_block6) if_block6.c();
  			t6 = space();
  			if (if_block7) if_block7.c();
  			t7 = space();
  			if (if_block8) if_block8.c();
  			t8 = space();
  			if (if_block9) if_block9.c();
  			t9 = space();
  			if (if_block10) if_block10.c();
  			t10 = space();
  			if (if_block11) if_block11.c();
  			attr_dev(div, "class", "mvsFilters");
  			add_location(div, file$4, 666, 3, 21416);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div, anchor);
  			if (if_block0) if_block0.m(div, null);
  			append_dev(div, t0);
  			if (if_block1) if_block1.m(div, null);
  			append_dev(div, t1);
  			if (if_block2) if_block2.m(div, null);
  			append_dev(div, t2);
  			if (if_block3) if_block3.m(div, null);
  			append_dev(div, t3);
  			if (if_block4) if_block4.m(div, null);
  			append_dev(div, t4);
  			if (if_block5) if_block5.m(div, null);
  			append_dev(div, t5);
  			if (if_block6) if_block6.m(div, null);
  			append_dev(div, t6);
  			if (if_block7) if_block7.m(div, null);
  			append_dev(div, t7);
  			if (if_block8) if_block8.m(div, null);
  			append_dev(div, t8);
  			if (if_block9) if_block9.m(div, null);
  			append_dev(div, t9);
  			if (if_block10) if_block10.m(div, null);
  			append_dev(div, t10);
  			if (if_block11) if_block11.m(div, null);
  		},
  		p: function update(ctx, dirty) {
  			if (/*DtpHearthsPicket*/ ctx[4]._map && /*DtpHearthsPicket*/ ctx[4]._opt && /*DtpHearthsPicket*/ ctx[4]._opt.years) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_17(ctx);
  					if_block0.c();
  					if_block0.m(div, t0);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*DtpHearths5*/ ctx[5]._map && /*DtpHearths5*/ ctx[5]._opt && /*DtpHearths5*/ ctx[5]._opt.years) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_16(ctx);
  					if_block1.c();
  					if_block1.m(div, t1);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if (/*DtpHearths3*/ ctx[6]._map && /*DtpHearths3*/ ctx[6]._opt && /*DtpHearths3*/ ctx[6]._opt.years) {
  				if (if_block2) {
  					if_block2.p(ctx, dirty);
  				} else {
  					if_block2 = create_if_block_15(ctx);
  					if_block2.c();
  					if_block2.m(div, t2);
  				}
  			} else if (if_block2) {
  				if_block2.d(1);
  				if_block2 = null;
  			}

  			if (/*DtpHearthsStat*/ ctx[7]._map && /*DtpHearthsStat*/ ctx[7]._opt && /*DtpHearthsStat*/ ctx[7]._opt.years) {
  				if (if_block3) {
  					if_block3.p(ctx, dirty);
  				} else {
  					if_block3 = create_if_block_14(ctx);
  					if_block3.c();
  					if_block3.m(div, t3);
  				}
  			} else if (if_block3) {
  				if_block3.d(1);
  				if_block3 = null;
  			}

  			if (/*DtpHearthsTmp*/ ctx[8]._map && /*DtpHearthsTmp*/ ctx[8]._opt && /*DtpHearthsTmp*/ ctx[8]._opt.years) {
  				if (if_block4) {
  					if_block4.p(ctx, dirty);
  				} else {
  					if_block4 = create_if_block_13(ctx);
  					if_block4.c();
  					if_block4.m(div, t4);
  				}
  			} else if (if_block4) {
  				if_block4.d(1);
  				if_block4 = null;
  			}

  			if (/*DtpHearths*/ ctx[9]._map && /*DtpHearths*/ ctx[9]._opt && /*DtpHearths*/ ctx[9]._opt.years) {
  				if (if_block5) {
  					if_block5.p(ctx, dirty);
  				} else {
  					if_block5 = create_if_block_12(ctx);
  					if_block5.c();
  					if_block5.m(div, t5);
  				}
  			} else if (if_block5) {
  				if_block5.d(1);
  				if_block5 = null;
  			}

  			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block6) {
  				if_block6.p(ctx, dirty);
  			} else {
  				if (if_block6) if_block6.d(1);
  				if_block6 = current_block_type && current_block_type(ctx);

  				if (if_block6) {
  					if_block6.c();
  					if_block6.m(div, t6);
  				}
  			}

  			if (/*DtpVerifyed*/ ctx[0]._map) {
  				if (if_block7) {
  					if_block7.p(ctx, dirty);
  				} else {
  					if_block7 = create_if_block_7$1(ctx);
  					if_block7.c();
  					if_block7.m(div, t7);
  				}
  			} else if (if_block7) {
  				if_block7.d(1);
  				if_block7 = null;
  			}

  			if (/*DtpSkpdi*/ ctx[1]._map) {
  				if (if_block8) {
  					if_block8.p(ctx, dirty);
  				} else {
  					if_block8 = create_if_block_5$1(ctx);
  					if_block8.c();
  					if_block8.m(div, t8);
  				}
  			} else if (if_block8) {
  				if_block8.d(1);
  				if_block8 = null;
  			}

  			if (/*DtpGibdd*/ ctx[2]._map) {
  				if (if_block9) {
  					if_block9.p(ctx, dirty);
  				} else {
  					if_block9 = create_if_block_3$1(ctx);
  					if_block9.c();
  					if_block9.m(div, t9);
  				}
  			} else if (if_block9) {
  				if_block9.d(1);
  				if_block9 = null;
  			}

  			if (/*DtpGibddRub*/ ctx[3]._map) {
  				if (if_block10) {
  					if_block10.p(ctx, dirty);
  				} else {
  					if_block10 = create_if_block_1$2(ctx);
  					if_block10.c();
  					if_block10.m(div, t10);
  				}
  			} else if (if_block10) {
  				if_block10.d(1);
  				if_block10 = null;
  			}

  			if (/*Rub*/ ctx[10]._map) {
  				if (if_block11) {
  					if_block11.p(ctx, dirty);
  				} else {
  					if_block11 = create_if_block$3(ctx);
  					if_block11.c();
  					if_block11.m(div, null);
  				}
  			} else if (if_block11) {
  				if_block11.d(1);
  				if_block11 = null;
  			}
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			if (if_block2) if_block2.d();
  			if (if_block3) if_block3.d();
  			if (if_block4) if_block4.d();
  			if (if_block5) if_block5.d();

  			if (if_block6) {
  				if_block6.d();
  			}

  			if (if_block7) if_block7.d();
  			if (if_block8) if_block8.d();
  			if (if_block9) if_block9.d();
  			if (if_block10) if_block10.d();
  			if (if_block11) if_block11.d();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$4.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$4($$self, $$props, $$invalidate) {
  	let { DtpHearthsPicket } = $$props;
  	let { DtpHearths5 } = $$props;
  	let { DtpHearths3 } = $$props;
  	let { DtpHearthsStat } = $$props;
  	let { DtpHearthsTmp } = $$props;
  	let { DtpHearths } = $$props;
  	let { DtpVerifyed } = $$props;
  	let { DtpSkpdi } = $$props;
  	let { DtpGibdd } = $$props;
  	let { DtpGibddRub } = $$props;
  	let { Rub } = $$props;
  	let currentFilter = 0;
  	let currentFilterDtpHearths = 0;
  	let begDate;
  	let endDate;

  	// let years = DtpHearths._opt && DtpHearths._opt.years;
  	const td = new Date();

  	const tdd = new Date(new Date(td.getFullYear(), td.getMonth(), td.getDate()).getTime());

  	// const ed = new Date(tdd.getTime() + 24*60*60*1000);
  	const ed = td;

  	// const bd = new Date(tdd.getTime() - 30*24*60*60*1000);
  	const bd = new Date(2018, 0, 1);

  	let dateInterval = [bd.getTime() / 1000, ed.getTime() / 1000];
  	let optData = DtpVerifyed._opt || {};

  	let optCollisionKeys = optData.collision_type
  	? Object.keys(optData.collision_type).sort((a, b) => optData.collision_type[b] - optData.collision_type[a])
  	: [];

  	// console.log('optData', optData)
  	let optDataSkpdi = DtpSkpdi._opt || {};

  	let optCollisionSkpdiKeys = optDataSkpdi.collision_type
  	? Object.keys(optDataSkpdi.collision_type).sort((a, b) => optDataSkpdi.collision_type[b] - optDataSkpdi.collision_type[a])
  	: [];

  	let optDataGibdd = DtpGibdd._opt || {};

  	let optCollisionGibddKeys = optDataGibdd.collision_type
  	? Object.keys(optDataGibdd.collision_type).sort((a, b) => optDataGibdd.collision_type[b] - optDataGibdd.collision_type[a])
  	: [];

  	let optDataGibddRub = DtpGibddRub._opt || {};

  	let optCollisionGibddRubKeys = optDataGibddRub.collision_type
  	? Object.keys(optDataGibddRub.collision_type).sort((a, b) => optDataGibddRub.collision_type[b] - optDataGibddRub.collision_type[a])
  	: [];

  	let optDataHearths = DtpHearths._opt || {};

  	let optTypeHearthsKeys = optDataHearths.str_icon_type
  	? Object.keys(optDataHearths.str_icon_type).sort((a, b) => optDataHearths.str_icon_type[b] - optDataHearths.str_icon_type[a])
  	: [];

  	let optDataHearthsTmp = DtpHearthsTmp._opt || {};

  	let optTypeHearthsTmpKeys = optDataHearthsTmp.str_icon_type
  	? Object.keys(optDataHearthsTmp.str_icon_type).sort((a, b) => optDataHearthsTmp.str_icon_type[b] - optDataHearthsTmp.str_icon_type[a])
  	: [];

  	let optDataHearthsStat = DtpHearthsStat._opt || {};

  	let optTypeHearthsStatKeys = optDataHearthsStat.str_icon_type
  	? Object.keys(optDataHearthsStat.str_icon_type).sort((a, b) => optDataHearthsStat.str_icon_type[b] - optDataHearthsStat.str_icon_type[a])
  	: [];

  	let optDataHearths3 = DtpHearths3._opt || {};

  	let optTypeHearths3Keys = optDataHearths3.str_icon_type
  	? Object.keys(optDataHearths3.str_icon_type).sort((a, b) => optDataHearths3.str_icon_type[b] - optDataHearths3.str_icon_type[a])
  	: [];

  	let optDataHearths5 = DtpHearths5._opt || {};

  	let optTypeHearths5Keys = optDataHearths5.str_icon_type
  	? Object.keys(optDataHearths5.str_icon_type).sort((a, b) => optDataHearths5.str_icon_type[b] - optDataHearths5.str_icon_type[a])
  	: [];

  	let optDataHearthsPicket = DtpHearthsPicket._opt || {};

  	let optRoadTypes = optDataHearthsPicket.road
  	? Object.keys(optDataHearthsPicket.road).sort((a, b) => optDataHearthsPicket.road[b] - optDataHearthsPicket.road[a])
  	: [];

  	let roads = [""];
  	let ht = { "hearth3": true, "hearth5": true };
  	let id_hearth = null;
  	let id_dtp = null;
  	let collision_type = [""];
  	let collision_type_skpdi = [""];
  	let collision_type_gibdd = [""];
  	let collision_type_gibddRub = [""];
  	let beg;
  	let end;

  	let heat = {
  		radius: 19,
  		blur: 11.26,
  		minOpacity: 0.34
  	};

  	let heatName;
  	let radius = heat.radius; // 25;
  	let blur = 11.26; // 15;
  	let minOpacity = 0.34; // 0.05;
  	let heatElement;
  	let heatElementDtpGibdd;
  	let heatElementDtpSkpdi;
  	let heatElementDtpVerifyed;

  	let _comps = Rub._argFilters
  	? Rub._argFilters[0]
  	: {
  			type: "comp",
  			zn: { on: true, off: true }
  		};

  	let compOn = _comps.zn.on;
  	let comp1On = _comps.zn.off;

  	// console.log('optDataHearthsPicket', optRoadTypes, optDataHearthsPicket);
  	// const setListRub = (ev) => {
  	// let opt = [{type: 'comp', zn: {on: compOn, off: comp1On}}];
  	// Rub.setFilter(opt);
  	// };
  	const setComp = ev => {
  		let opt = [
  			{
  				type: "comp",
  				zn: { on: compOn, off: comp1On }
  			}
  		];

  		Rub.setFilter(opt);
  	};

  	const setFilterHearthsPicket = () => {
  		let opt = [];

  		if (id_dtp) {
  			opt.push({ type: "id_dtp", zn: id_dtp });
  		}

  		if (id_hearth) {
  			opt.push({ type: "id_hearth", zn: id_hearth });
  		}

  		if (roads) {
  			opt.push({ type: "roads", zn: roads });
  		}

  		opt.push({ type: "ht", zn: ht });

  		// console.log('opt', opt);
  		DtpHearthsPicket.setFilter(opt);
  	};

  	const oncheckIdDtp = ev => {
  		let target = ev.target, value = target.value;
  		$$invalidate(16, id_dtp = value ? value : null);
  		setFilterHearthsPicket();
  	};

  	const oncheckIdHearth = ev => {
  		let target = ev.target, value = target.value;
  		$$invalidate(15, id_hearth = value ? value : null);
  		setFilterHearthsPicket();
  	};

  	const oncheckHt = ev => {
  		let target = ev.target;
  		$$invalidate(14, ht[target.name] = target.checked, ht);
  		setFilterHearthsPicket();
  	};

  	const setHeat = ev => {
  		let target = ev.target;
  		$$invalidate(3, DtpGibddRub._needHeat = $$invalidate(2, DtpGibdd._needHeat = $$invalidate(1, DtpSkpdi._needHeat = $$invalidate(0, DtpVerifyed._needHeat = target.checked ? heat : false, DtpVerifyed), DtpSkpdi), DtpGibdd), DtpGibddRub);
  		setFilterGibddRub();
  		setFilterGibdd();

  		// DtpSkpdi._needHeat = _needHeat;
  		setFilterSkpdi();

  		// DtpVerifyed._needHeat = _needHeat;
  		setFilter();
  	};

  	const setMinOpacity = () => {
  		let opt = { radius, blur, minOpacity };

  		if (DtpGibdd._heat) {
  			DtpGibdd._heat.setOptions(opt);
  		}

  		if (DtpSkpdi._heat) {
  			DtpSkpdi._heat.setOptions(opt);
  		}

  		if (DtpVerifyed._heat) {
  			DtpVerifyed._heat.setOptions(opt);
  		}
  	};

  	const setFilter = () => {
  		let opt = [{ type: "itemType", zn: currentFilter }];

  		if (dateInterval) {
  			opt.push({ type: "date", zn: dateInterval });
  		}

  		if (collision_type) {
  			opt.push({
  				type: "collision_type",
  				zn: collision_type
  			});
  		}

  		// console.log('opt', collision_type, opt);
  		DtpVerifyed.setFilter(opt);
  	};

  	let _list_rub = DtpGibddRub._argFilters
  	? DtpGibddRub._argFilters[0]
  	: {
  			type: "list_rub",
  			zn: { on: true, off: true }
  		};

  	let list_rubOn = _list_rub.zn.on;
  	let list_rubOff = _list_rub.zn.off;

  	const setFilterGibddRub = () => {
  		let opt = [
  			{
  				type: "list_rub",
  				zn: { on: list_rubOn, off: list_rubOff }
  			}
  		];

  		if (dateInterval) {
  			opt.push({ type: "date", zn: dateInterval });
  		}

  		if (collision_type_gibddRub) {
  			opt.push({
  				type: "collision_type",
  				zn: collision_type_gibddRub
  			});
  		}

  		// console.log('opt', collision_type, opt);
  		DtpGibddRub.setFilter(opt);
  	};

  	const setFilterGibdd = () => {
  		let opt = [];

  		if (dateInterval) {
  			opt.push({ type: "date", zn: dateInterval });
  		}

  		if (collision_type_gibdd) {
  			opt.push({
  				type: "collision_type",
  				zn: collision_type_gibdd
  			});
  		}

  		// console.log('opt', collision_type, opt);
  		DtpGibdd.setFilter(opt);
  	};

  	const setFilterSkpdi = () => {
  		let opt = [];

  		if (dateInterval) {
  			opt.push({ type: "date", zn: dateInterval });
  		}

  		if (collision_type_skpdi) {
  			opt.push({
  				type: "collision_type",
  				zn: collision_type_skpdi
  			});
  		}

  		// console.log('opt', collision_type, opt);
  		DtpSkpdi.setFilter(opt);
  	};

  	// date filter
  	const oncheck = ev => {
  		let target = ev.target;
  		currentFilter = Number(target.value);

  		// console.log('oncheck', currentFilter, DtpVerifyed._opt);
  		setFilter();
  	}; // DtpVerifyed.setFilter({type: 'itemType', zn: currentFilter});

  	// beforeUpdate(() => {
  	// console.log('the component is about to update', DtpHearths._opt);
  	// });
  	onMount(() => {
  		// years = DtpHearths._opt && DtpHearths._opt.years;
  		let i18n = {
  			previousMonth: "Предыдущий месяц",
  			nextMonth: "Следующий месяц",
  			months: [
  				"Январь",
  				"Февраль",
  				"Март",
  				"Апрель",
  				"Май",
  				"Июнь",
  				"Июль",
  				"Август",
  				"Сентябрь",
  				"Октябрь",
  				"Ноябрь",
  				"Декабрь"
  			],
  			weekdays: [
  				"Воскресенье",
  				"Понедельник",
  				"Вторник",
  				"Среда",
  				"Четверг",
  				"Пятница",
  				"Суббота"
  			],
  			weekdaysShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
  		};

  		let opt = {
  			onSelect(date) {
  				// console.log('ssssss', date)
  				this._o.field.value = this.toString();

  				// dateInterval[this._o._dint] = this.getDate().getTime()/1000;
  				dateInterval[this._o._dint] = this.getDate().getTime() / 1000 + this._o._dint * 24 * 60 * 60;

  				setFilter();
  				setFilterSkpdi();
  				setFilterGibdd();
  			},
  			toString(date, format) {
  				// you should do formatting based on the passed format,
  				// but we will just return 'D/M/YYYY' for simplicity
  				let day = date.getDate();

  				if (day < 10) {
  					day = "0" + day;
  				}

  				let month = date.getMonth() + 1;

  				if (month < 10) {
  					month = "0" + month;
  				}

  				const year = date.getFullYear();
  				return `${day}.${month}.${year}`;
  			},
  			parse(dateString, format) {
  				// dateString is the result of `toString` method
  				const parts = dateString.split(".");

  				const day = parseInt(parts[0], 10);
  				const month = parseInt(parts[1], 10) - 1;
  				const year = parseInt(parts[2], 10);
  				return new Date(year, month, day);
  			},
  			// firstDay: 1,
  			// enableSelectionDaysInNextAndPreviousMonths: true,
  			i18n,
  			format: "DD.MM.YYYY",
  			// minDate: new Date(2018, 1, 1),
  			// maxDate: new Date(2020, 1, 1),
  			setDefaultDate: true,
  			yearRange: 20,
  			// keyboardInput: false,
  			blurFieldOnSelect: false
  		}; // ,
  		// yearRange: [2000,2020]

  		beg = new Pikaday(L.extend({}, opt, {
  				_dint: 0,
  				field: begDate,
  				defaultDate: new Date(1000 * dateInterval[0])
  			}));

  		// console.log('dddd', beg)
  		end = new Pikaday(L.extend({}, opt, {
  				_dint: 1,
  				field: endDate,
  				defaultDate: new Date(1000 * dateInterval[1])
  			}));
  	});

  	const onPrev = () => {
  		let e = end.getDate(), b = beg.getDate(), ms = e - b;

  		// if (ms === 0) { b = new Date(b.getTime() - 24*60*60*1000); ms = e - b; }
  		if (ms === 0) {
  			ms = 24 * 60 * 60 * 1000;
  		}

  		// end.setDate(b);
  		beg.setDate(new Date(b.getTime() - ms));

  		end.setDate(new Date(e.getTime() - ms));

  		dateInterval = [
  			beg.getDate().getTime() / 1000,
  			24 * 60 * 60 + end.getDate().getTime() / 1000
  		];

  		setFilter();
  	}; // console.log('ssssss', dateInterval, beg.getDate(), end.getDate())

  	const onNext = () => {
  		let e = end.getDate(), b = beg.getDate(), ms = e - b;

  		// if (ms === 0) { e = new Date(b.getTime() + 24*60*60*1000); ms = e - b; }
  		if (ms === 0) {
  			ms = 24 * 60 * 60 * 1000;
  		}

  		beg.setDate(new Date(b.getTime() + ms));
  		end.setDate(new Date(e.getTime() + ms));

  		// beg.setDate(e);
  		// end.setDate(new Date(beg.getDate().getTime() + ms));
  		dateInterval = [
  			beg.getDate().getTime() / 1000,
  			24 * 60 * 60 + end.getDate().getTime() / 1000
  		];

  		setFilter();
  	}; // console.log('ss1ssss', dateInterval, beg.getDate(), end.getDate())

  	// ДТП Очаги (5)
  	let hearths_stricken5;

  	let str_icon_type5 = [""];
  	let hearths_period_type_5 = 1;
  	let hearths_year_5 = {};
  	let hearths_quarter_5 = {};
  	let last_quarter_5;

  	Object.keys(optDataHearths5.years || {}).sort().forEach(key => {
  		$$invalidate(32, hearths_year_5[key] = true, hearths_year_5);

  		Object.keys(optDataHearths5.years[key]).sort().forEach(key1 => {
  			last_quarter_5 = {};
  			last_quarter_5[key] = {};
  			last_quarter_5[key][key1] = true;
  		});
  	});

  	hearths_quarter_5 = last_quarter_5 || {};

  	// const setFilterHearthsTmpPeriodType = (ev) => {
  	// console.log('setFilterHearthsTmpPeriodType', hearths_period_type_tmp, ev)
  	// };
  	const setFilterHearths5 = ev => {
  		let arg = [],
  			target = ev.target || {},
  			checked = target.checked,
  			id = target.id,
  			name = target.name;

  		// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);
  		if (id === "hearths_period_type_52") {
  			$$invalidate(31, hearths_period_type_5 = 2);
  		} else if (id === "hearths_period_type_51") {
  			$$invalidate(31, hearths_period_type_5 = 1);
  		} else if (id === "hearths_year_5") {
  			if (checked) {
  				$$invalidate(32, hearths_year_5[name] = true, hearths_year_5);
  			} else {
  				delete hearths_year_5[name];
  			}
  		} else if (id === "hearths_quarter_5") {
  			let arr = name.split("_");

  			if (checked) {
  				if (!hearths_quarter_5[arr[0]]) {
  					hearths_quarter_5[arr[0]] = {};
  				}

  				hearths_quarter_5[arr[0]][arr[1]] = true;
  			} else {
  				if (hearths_quarter_5[arr[0]]) {
  					delete hearths_quarter_5[arr[0]][arr[1]];
  				}

  				if (Object.keys(hearths_quarter_5[arr[0]]).length === 0) {
  					delete hearths_quarter_5[arr[0]];
  				}
  			}
  		}

  		if (hearths_period_type_5 === 1) {
  			// if (Object.keys(hearths_year_5).length) {
  			arg.push({ type: "year", zn: hearths_year_5 });
  		} else if (hearths_period_type_5 === 2) {
  			// } else if (Object.keys(hearths_quarter_5).length) {
  			arg.push({
  				type: "quarter", // }
  				zn: hearths_quarter_5
  			});
  		}

  		if (hearths_stricken5) {
  			arg.push({
  				type: "stricken",
  				zn: Number(hearths_stricken5)
  			});
  		}

  		if (str_icon_type5.length > 0 && str_icon_type5[0]) {
  			arg.push({
  				type: "str_icon_type",
  				zn: str_icon_type5
  			});
  		}

  		DtpHearths5.setFilter(arg);
  	};

  	// ДТП Очаги (3)
  	let hearths_stricken3;

  	let str_icon_type3 = [""];
  	let hearths_period_type_3 = 1;
  	let hearths_year_3 = {};
  	let hearths_quarter_3 = {};
  	let last_quarter_3;

  	Object.keys(optDataHearths3.years || {}).sort().forEach(key => {
  		$$invalidate(36, hearths_year_3[key] = true, hearths_year_3);

  		Object.keys(optDataHearths3.years[key]).sort().forEach(key1 => {
  			last_quarter_3 = {};
  			last_quarter_3[key] = {};
  			last_quarter_3[key][key1] = true;
  		});
  	});

  	hearths_quarter_3 = last_quarter_3 || {};

  	// const setFilterHearthsTmpPeriodType = (ev) => {
  	// console.log('setFilterHearthsTmpPeriodType', hearths_period_type_tmp, ev)
  	// };
  	const setFilterHearths3 = ev => {
  		let arg = [],
  			target = ev.target || {},
  			checked = target.checked,
  			id = target.id,
  			name = target.name;

  		// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);
  		if (id === "hearths_period_type_32") {
  			$$invalidate(35, hearths_period_type_3 = 2);
  		} else if (id === "hearths_period_type_31") {
  			$$invalidate(35, hearths_period_type_3 = 1);
  		} else if (id === "hearths_year_3") {
  			if (checked) {
  				$$invalidate(36, hearths_year_3[name] = true, hearths_year_3);
  			} else {
  				delete hearths_year_3[name];
  			}
  		} else if (id === "hearths_quarter_3") {
  			let arr = name.split("_");

  			if (checked) {
  				if (!hearths_quarter_3[arr[0]]) {
  					hearths_quarter_3[arr[0]] = {};
  				}

  				hearths_quarter_3[arr[0]][arr[1]] = true;
  			} else {
  				if (hearths_quarter_3[arr[0]]) {
  					delete hearths_quarter_3[arr[0]][arr[1]];
  				}

  				if (Object.keys(hearths_quarter_3[arr[0]]).length === 0) {
  					delete hearths_quarter_3[arr[0]];
  				}
  			}
  		}

  		if (hearths_period_type_3 === 1) {
  			// if (Object.keys(hearths_year_3).length) {
  			arg.push({ type: "year", zn: hearths_year_3 });
  		} else if (hearths_period_type_3 === 2) {
  			// } else if (Object.keys(hearths_quarter_3).length) {
  			arg.push({
  				type: "quarter", // }
  				zn: hearths_quarter_3
  			});
  		}

  		if (hearths_stricken3) {
  			arg.push({
  				type: "stricken",
  				zn: Number(hearths_stricken3)
  			});
  		}

  		if (str_icon_type3.length > 0 && str_icon_type3[0]) {
  			arg.push({
  				type: "str_icon_type",
  				zn: str_icon_type3
  			});
  		}

  		DtpHearths3.setFilter(arg);
  	};

  	// ДТП Очаги (Stat)
  	let hearths_strickenStat;

  	let str_icon_typeStat = [""];
  	let hearths_period_type_Stat = 1;
  	let hearths_year_Stat = {};
  	let hearths_quarter_Stat = {};
  	let last_quarter_Stat;

  	Object.keys(optDataHearthsStat.years || {}).sort().forEach(key => {
  		$$invalidate(40, hearths_year_Stat[key] = true, hearths_year_Stat);

  		Object.keys(optDataHearthsStat.years[key]).sort().forEach(key1 => {
  			last_quarter_Stat = {};
  			last_quarter_Stat[key] = {};
  			last_quarter_Stat[key][key1] = true;
  		});
  	});

  	hearths_quarter_Stat = last_quarter_Stat || {};

  	// const setFilterHearthsTmpPeriodType = (ev) => {
  	// console.log('setFilterHearthsTmpPeriodType', hearths_period_type_tmp, ev)
  	// };
  	const setFilterHearthsStat = ev => {
  		let arg = [],
  			target = ev.target || {},
  			checked = target.checked,
  			id = target.id,
  			name = target.name;

  		// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);
  		if (id === "hearths_period_type_Stat2") {
  			$$invalidate(39, hearths_period_type_Stat = 2);
  		} else if (id === "hearths_period_type_Stat1") {
  			$$invalidate(39, hearths_period_type_Stat = 1);
  		} else if (id === "hearths_year_Stat") {
  			if (checked) {
  				$$invalidate(40, hearths_year_Stat[name] = true, hearths_year_Stat);
  			} else {
  				delete hearths_year_Stat[name];
  			}
  		} else if (id === "hearths_quarter_Stat") {
  			let arr = name.split("_");

  			if (checked) {
  				if (!hearths_quarter_Stat[arr[0]]) {
  					$$invalidate(41, hearths_quarter_Stat[arr[0]] = {}, hearths_quarter_Stat);
  				}

  				$$invalidate(41, hearths_quarter_Stat[arr[0]][arr[1]] = true, hearths_quarter_Stat);
  			} else {
  				if (hearths_quarter_Stat[arr[0]]) {
  					delete hearths_quarter_Stat[arr[0]][arr[1]];
  				}

  				if (Object.keys(hearths_quarter_Stat[arr[0]]).length === 0) {
  					delete hearths_quarter_Stat[arr[0]];
  				}
  			}
  		}

  		if (hearths_period_type_Stat === 1) {
  			// if (Object.keys(hearths_year_Stat).length) {
  			arg.push({ type: "year", zn: hearths_year_Stat });
  		} else if (hearths_period_type_Stat === 2) {
  			// } else if (Object.keys(hearths_quarter_Stat).length) {
  			arg.push({
  				type: "quarter", // }
  				zn: hearths_quarter_Stat
  			});
  		}

  		if (hearths_strickenStat) {
  			arg.push({
  				type: "stricken",
  				zn: Number(hearths_strickenStat)
  			});
  		}

  		if (str_icon_typeStat.length > 0 && str_icon_typeStat[0]) {
  			arg.push({
  				type: "str_icon_type",
  				zn: str_icon_typeStat
  			});
  		}

  		DtpHearthsStat.setFilter(arg);
  	};

  	// ДТП Очаги (TMP)
  	let hearths_strickenTmp;

  	let str_icon_typeTmp = [""];
  	let hearths_period_type_tmp = 1;
  	let hearths_year_tmp = {};
  	let hearths_quarter_tmp = {};
  	let last_quarter_tmp;

  	Object.keys(optDataHearthsTmp.years || {}).sort().forEach(key => {
  		$$invalidate(45, hearths_year_tmp[key] = true, hearths_year_tmp);

  		Object.keys(optDataHearthsTmp.years[key]).sort().forEach(key1 => {
  			last_quarter_tmp = {};
  			last_quarter_tmp[key] = {};
  			last_quarter_tmp[key][key1] = true;
  		});
  	});

  	hearths_quarter_tmp = last_quarter_tmp || {};

  	// const setFilterHearthsTmpPeriodType = (ev) => {
  	// console.log('setFilterHearthsTmpPeriodType', hearths_period_type_tmp, ev)
  	// };
  	const setFilterHearthsTmp = ev => {
  		let arg = [],
  			target = ev.target || {},
  			checked = target.checked,
  			id = target.id,
  			name = target.name;

  		// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);
  		if (id === "hearths_period_type_tmp2") {
  			$$invalidate(44, hearths_period_type_tmp = 2);
  		} else if (id === "hearths_period_type_tmp1") {
  			$$invalidate(44, hearths_period_type_tmp = 1);
  		} else if (id === "hearths_year_tmp") {
  			if (checked) {
  				$$invalidate(45, hearths_year_tmp[name] = true, hearths_year_tmp);
  			} else {
  				delete hearths_year_tmp[name];
  			}
  		} else if (id === "hearths_quarter_tmp") {
  			let arr = name.split("_");

  			if (checked) {
  				if (!hearths_quarter_tmp[arr[0]]) {
  					$$invalidate(46, hearths_quarter_tmp[arr[0]] = {}, hearths_quarter_tmp);
  				}

  				$$invalidate(46, hearths_quarter_tmp[arr[0]][arr[1]] = true, hearths_quarter_tmp);
  			} else {
  				if (hearths_quarter_tmp[arr[0]]) {
  					delete hearths_quarter_tmp[arr[0]][arr[1]];
  				}

  				if (Object.keys(hearths_quarter_tmp[arr[0]]).length === 0) {
  					delete hearths_quarter_tmp[arr[0]];
  				}
  			}
  		}

  		if (hearths_period_type_tmp === 1) {
  			// if (Object.keys(hearths_year_tmp).length) {
  			arg.push({ type: "year", zn: hearths_year_tmp });
  		} else if (hearths_period_type_tmp === 2) {
  			// } else if (Object.keys(hearths_quarter_tmp).length) {
  			arg.push({
  				type: "quarter", // }
  				zn: hearths_quarter_tmp
  			});
  		}

  		if (hearths_strickenTmp) {
  			arg.push({
  				type: "stricken",
  				zn: Number(hearths_strickenTmp)
  			});
  		}

  		if (str_icon_typeTmp.length > 0 && str_icon_typeTmp[0]) {
  			arg.push({
  				type: "str_icon_type",
  				zn: str_icon_typeTmp
  			});
  		}

  		DtpHearthsTmp.setFilter(arg);
  	};

  	// ДТП Очаги
  	let hearths_stricken;

  	let str_icon_type = [""];
  	let hearths_period_type = 1;
  	let hearths_year = {};
  	let hearths_quarter = {};
  	let last_quarter;

  	Object.keys(optDataHearths.years || {}).sort().forEach(key => {
  		$$invalidate(50, hearths_year[key] = true, hearths_year);

  		Object.keys(optDataHearths.years[key]).sort().forEach(key1 => {
  			last_quarter = {};
  			last_quarter[key] = {};
  			last_quarter[key][key1] = true;
  		});
  	});

  	hearths_quarter = last_quarter || {};

  	const setFilterHearths = ev => {
  		let arg = [],
  			target = ev.target || {},
  			checked = target.checked,
  			id = target.id,
  			name = target.name;

  		console.log("setFilterHearths", checked, id, name, ev);

  		if (id === "hearths_period_type2") {
  			$$invalidate(49, hearths_period_type = 2);
  		} else if (id === "hearths_period_type1") {
  			$$invalidate(49, hearths_period_type = 1);
  		} else if (id === "hearths_year") {
  			if (checked) {
  				$$invalidate(50, hearths_year[name] = true, hearths_year);
  			} else {
  				delete hearths_year[name];
  			}
  		} else if (id === "hearths_quarter") {
  			let arr = name.split("_");

  			if (checked) {
  				if (!hearths_quarter[arr[0]]) {
  					$$invalidate(51, hearths_quarter[arr[0]] = {}, hearths_quarter);
  				}

  				$$invalidate(51, hearths_quarter[arr[0]][arr[1]] = true, hearths_quarter);
  			} else {
  				if (hearths_quarter[arr[0]]) {
  					delete hearths_quarter[arr[0]][arr[1]];
  				}

  				if (Object.keys(hearths_quarter[arr[0]]).length === 0) {
  					delete hearths_quarter[arr[0]];
  				}
  			}
  		}

  		if (hearths_period_type === 1) {
  			arg.push({ type: "year", zn: hearths_year });
  		} else if (hearths_period_type === 2) {
  			// } else if (Object.keys(hearths_quarter).length) {
  			arg.push({ type: "quarter", zn: hearths_quarter });
  		}

  		if (hearths_stricken) {
  			arg.push({
  				type: "stricken",
  				zn: Number(hearths_stricken)
  			});
  		}

  		if (str_icon_type.length > 0 && str_icon_type[0]) {
  			arg.push({ type: "str_icon_type", zn: str_icon_type });
  		}

  		DtpHearths.setFilter(arg);
  	};

  	const writable_props = [
  		"DtpHearthsPicket",
  		"DtpHearths5",
  		"DtpHearths3",
  		"DtpHearthsStat",
  		"DtpHearthsTmp",
  		"DtpHearths",
  		"DtpVerifyed",
  		"DtpSkpdi",
  		"DtpGibdd",
  		"DtpGibddRub",
  		"Rub"
  	];

  	Object_1.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<DtpVerifyedFilters> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpVerifyedFilters", $$slots, []);
  	const $$binding_groups = [[], [], [], [], []];

  	const func = (p, c) => {
  		p += optDataHearthsPicket.road[c];
  		return p;
  	};

  	function select_change_handler() {
  		roads = select_multiple_value(this);
  		$$invalidate(13, roads);
  		$$invalidate(71, optRoadTypes);
  	}

  	function input_change_handler() {
  		hearths_period_type_5 = this.__value;
  		$$invalidate(31, hearths_period_type_5);
  	}

  	const func_1 = (p, c) => {
  		p += optDataHearths5.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler() {
  		str_icon_type5 = select_multiple_value(this);
  		$$invalidate(30, str_icon_type5);
  		$$invalidate(69, optTypeHearths5Keys);
  	}

  	function select1_change_handler() {
  		hearths_stricken5 = select_value(this);
  		$$invalidate(29, hearths_stricken5);
  	}

  	function input_change_handler_1() {
  		hearths_period_type_3 = this.__value;
  		$$invalidate(35, hearths_period_type_3);
  	}

  	const func_2 = (p, c) => {
  		p += optDataHearths3.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_1() {
  		str_icon_type3 = select_multiple_value(this);
  		$$invalidate(34, str_icon_type3);
  		$$invalidate(67, optTypeHearths3Keys);
  	}

  	function select1_change_handler_1() {
  		hearths_stricken3 = select_value(this);
  		$$invalidate(33, hearths_stricken3);
  	}

  	function input0_change_handler() {
  		hearths_period_type_Stat = this.__value;
  		$$invalidate(39, hearths_period_type_Stat);
  	}

  	function input1_change_handler() {
  		hearths_period_type_Stat = this.__value;
  		$$invalidate(39, hearths_period_type_Stat);
  	}

  	const func_3 = (p, c) => {
  		p += optDataHearthsStat.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_2() {
  		str_icon_typeStat = select_multiple_value(this);
  		$$invalidate(38, str_icon_typeStat);
  		$$invalidate(65, optTypeHearthsStatKeys);
  	}

  	function select1_change_handler_2() {
  		hearths_strickenStat = select_value(this);
  		$$invalidate(37, hearths_strickenStat);
  	}

  	function input0_change_handler_1() {
  		hearths_period_type_tmp = this.__value;
  		$$invalidate(44, hearths_period_type_tmp);
  	}

  	function input1_change_handler_1() {
  		hearths_period_type_tmp = this.__value;
  		$$invalidate(44, hearths_period_type_tmp);
  	}

  	const func_4 = (p, c) => {
  		p += optDataHearthsTmp.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_3() {
  		str_icon_typeTmp = select_multiple_value(this);
  		$$invalidate(43, str_icon_typeTmp);
  		$$invalidate(63, optTypeHearthsTmpKeys);
  	}

  	function select1_change_handler_3() {
  		hearths_strickenTmp = select_value(this);
  		$$invalidate(42, hearths_strickenTmp);
  	}

  	function input0_change_handler_2() {
  		hearths_period_type = this.__value;
  		$$invalidate(49, hearths_period_type);
  	}

  	function input1_change_handler_2() {
  		hearths_period_type = this.__value;
  		$$invalidate(49, hearths_period_type);
  	}

  	const func_5 = (p, c) => {
  		p += optDataHearths.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_4() {
  		str_icon_type = select_multiple_value(this);
  		$$invalidate(48, str_icon_type);
  		$$invalidate(61, optTypeHearthsKeys);
  	}

  	function select1_change_handler_4() {
  		hearths_stricken = select_value(this);
  		$$invalidate(47, hearths_stricken);
  	}

  	function input0_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(11, begDate = $$value);
  		});
  	}

  	function input1_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(12, endDate = $$value);
  		});
  	}

  	function input2_change_input_handler() {
  		minOpacity = to_number(this.value);
  		$$invalidate(23, minOpacity);
  	}

  	function input3_change_input_handler() {
  		radius = to_number(this.value);
  		$$invalidate(21, radius);
  	}

  	function input4_change_input_handler() {
  		blur = to_number(this.value);
  		$$invalidate(22, blur);
  	}

  	function input5_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(24, heatElement = $$value);
  		});
  	}

  	const func_6 = (p, c) => {
  		p += optData.collision_type[c];
  		return p;
  	};

  	function select_change_handler_1() {
  		collision_type = select_multiple_value(this);
  		$$invalidate(17, collision_type);
  		$$invalidate(53, optCollisionKeys);
  	}

  	const func_7 = (p, c) => {
  		p += optDataSkpdi.collision_type[c];
  		return p;
  	};

  	function select_change_handler_2() {
  		collision_type_skpdi = select_multiple_value(this);
  		$$invalidate(18, collision_type_skpdi);
  		$$invalidate(55, optCollisionSkpdiKeys);
  	}

  	const func_8 = (p, c) => {
  		p += optDataGibdd.collision_type[c];
  		return p;
  	};

  	function select_change_handler_3() {
  		collision_type_gibdd = select_multiple_value(this);
  		$$invalidate(19, collision_type_gibdd);
  		$$invalidate(57, optCollisionGibddKeys);
  	}

  	function input0_change_handler_3() {
  		list_rubOn = this.checked;
  		$$invalidate(27, list_rubOn);
  	}

  	function input1_change_handler_3() {
  		list_rubOff = this.checked;
  		$$invalidate(28, list_rubOff);
  	}

  	const func_9 = (p, c) => {
  		p += optDataGibddRub.collision_type[c];
  		return p;
  	};

  	function select_change_handler_4() {
  		collision_type_gibddRub = select_multiple_value(this);
  		$$invalidate(20, collision_type_gibddRub);
  		$$invalidate(59, optCollisionGibddRubKeys);
  	}

  	function input0_change_handler_4() {
  		compOn = this.checked;
  		$$invalidate(25, compOn);
  	}

  	function input1_change_handler_4() {
  		comp1On = this.checked;
  		$$invalidate(26, comp1On);
  	}

  	$$self.$set = $$props => {
  		if ("DtpHearthsPicket" in $$props) $$invalidate(4, DtpHearthsPicket = $$props.DtpHearthsPicket);
  		if ("DtpHearths5" in $$props) $$invalidate(5, DtpHearths5 = $$props.DtpHearths5);
  		if ("DtpHearths3" in $$props) $$invalidate(6, DtpHearths3 = $$props.DtpHearths3);
  		if ("DtpHearthsStat" in $$props) $$invalidate(7, DtpHearthsStat = $$props.DtpHearthsStat);
  		if ("DtpHearthsTmp" in $$props) $$invalidate(8, DtpHearthsTmp = $$props.DtpHearthsTmp);
  		if ("DtpHearths" in $$props) $$invalidate(9, DtpHearths = $$props.DtpHearths);
  		if ("DtpVerifyed" in $$props) $$invalidate(0, DtpVerifyed = $$props.DtpVerifyed);
  		if ("DtpSkpdi" in $$props) $$invalidate(1, DtpSkpdi = $$props.DtpSkpdi);
  		if ("DtpGibdd" in $$props) $$invalidate(2, DtpGibdd = $$props.DtpGibdd);
  		if ("DtpGibddRub" in $$props) $$invalidate(3, DtpGibddRub = $$props.DtpGibddRub);
  		if ("Rub" in $$props) $$invalidate(10, Rub = $$props.Rub);
  	};

  	$$self.$capture_state = () => ({
  		onMount,
  		DtpHearthsPicket,
  		DtpHearths5,
  		DtpHearths3,
  		DtpHearthsStat,
  		DtpHearthsTmp,
  		DtpHearths,
  		DtpVerifyed,
  		DtpSkpdi,
  		DtpGibdd,
  		DtpGibddRub,
  		Rub,
  		currentFilter,
  		currentFilterDtpHearths,
  		begDate,
  		endDate,
  		td,
  		tdd,
  		ed,
  		bd,
  		dateInterval,
  		optData,
  		optCollisionKeys,
  		optDataSkpdi,
  		optCollisionSkpdiKeys,
  		optDataGibdd,
  		optCollisionGibddKeys,
  		optDataGibddRub,
  		optCollisionGibddRubKeys,
  		optDataHearths,
  		optTypeHearthsKeys,
  		optDataHearthsTmp,
  		optTypeHearthsTmpKeys,
  		optDataHearthsStat,
  		optTypeHearthsStatKeys,
  		optDataHearths3,
  		optTypeHearths3Keys,
  		optDataHearths5,
  		optTypeHearths5Keys,
  		optDataHearthsPicket,
  		optRoadTypes,
  		roads,
  		ht,
  		id_hearth,
  		id_dtp,
  		collision_type,
  		collision_type_skpdi,
  		collision_type_gibdd,
  		collision_type_gibddRub,
  		beg,
  		end,
  		heat,
  		heatName,
  		radius,
  		blur,
  		minOpacity,
  		heatElement,
  		heatElementDtpGibdd,
  		heatElementDtpSkpdi,
  		heatElementDtpVerifyed,
  		_comps,
  		compOn,
  		comp1On,
  		setComp,
  		setFilterHearthsPicket,
  		oncheckIdDtp,
  		oncheckIdHearth,
  		oncheckHt,
  		setHeat,
  		setMinOpacity,
  		setFilter,
  		_list_rub,
  		list_rubOn,
  		list_rubOff,
  		setFilterGibddRub,
  		setFilterGibdd,
  		setFilterSkpdi,
  		oncheck,
  		onPrev,
  		onNext,
  		hearths_stricken5,
  		str_icon_type5,
  		hearths_period_type_5,
  		hearths_year_5,
  		hearths_quarter_5,
  		last_quarter_5,
  		setFilterHearths5,
  		hearths_stricken3,
  		str_icon_type3,
  		hearths_period_type_3,
  		hearths_year_3,
  		hearths_quarter_3,
  		last_quarter_3,
  		setFilterHearths3,
  		hearths_strickenStat,
  		str_icon_typeStat,
  		hearths_period_type_Stat,
  		hearths_year_Stat,
  		hearths_quarter_Stat,
  		last_quarter_Stat,
  		setFilterHearthsStat,
  		hearths_strickenTmp,
  		str_icon_typeTmp,
  		hearths_period_type_tmp,
  		hearths_year_tmp,
  		hearths_quarter_tmp,
  		last_quarter_tmp,
  		setFilterHearthsTmp,
  		hearths_stricken,
  		str_icon_type,
  		hearths_period_type,
  		hearths_year,
  		hearths_quarter,
  		last_quarter,
  		setFilterHearths
  	});

  	$$self.$inject_state = $$props => {
  		if ("DtpHearthsPicket" in $$props) $$invalidate(4, DtpHearthsPicket = $$props.DtpHearthsPicket);
  		if ("DtpHearths5" in $$props) $$invalidate(5, DtpHearths5 = $$props.DtpHearths5);
  		if ("DtpHearths3" in $$props) $$invalidate(6, DtpHearths3 = $$props.DtpHearths3);
  		if ("DtpHearthsStat" in $$props) $$invalidate(7, DtpHearthsStat = $$props.DtpHearthsStat);
  		if ("DtpHearthsTmp" in $$props) $$invalidate(8, DtpHearthsTmp = $$props.DtpHearthsTmp);
  		if ("DtpHearths" in $$props) $$invalidate(9, DtpHearths = $$props.DtpHearths);
  		if ("DtpVerifyed" in $$props) $$invalidate(0, DtpVerifyed = $$props.DtpVerifyed);
  		if ("DtpSkpdi" in $$props) $$invalidate(1, DtpSkpdi = $$props.DtpSkpdi);
  		if ("DtpGibdd" in $$props) $$invalidate(2, DtpGibdd = $$props.DtpGibdd);
  		if ("DtpGibddRub" in $$props) $$invalidate(3, DtpGibddRub = $$props.DtpGibddRub);
  		if ("Rub" in $$props) $$invalidate(10, Rub = $$props.Rub);
  		if ("currentFilter" in $$props) currentFilter = $$props.currentFilter;
  		if ("currentFilterDtpHearths" in $$props) currentFilterDtpHearths = $$props.currentFilterDtpHearths;
  		if ("begDate" in $$props) $$invalidate(11, begDate = $$props.begDate);
  		if ("endDate" in $$props) $$invalidate(12, endDate = $$props.endDate);
  		if ("dateInterval" in $$props) dateInterval = $$props.dateInterval;
  		if ("optData" in $$props) $$invalidate(52, optData = $$props.optData);
  		if ("optCollisionKeys" in $$props) $$invalidate(53, optCollisionKeys = $$props.optCollisionKeys);
  		if ("optDataSkpdi" in $$props) $$invalidate(54, optDataSkpdi = $$props.optDataSkpdi);
  		if ("optCollisionSkpdiKeys" in $$props) $$invalidate(55, optCollisionSkpdiKeys = $$props.optCollisionSkpdiKeys);
  		if ("optDataGibdd" in $$props) $$invalidate(56, optDataGibdd = $$props.optDataGibdd);
  		if ("optCollisionGibddKeys" in $$props) $$invalidate(57, optCollisionGibddKeys = $$props.optCollisionGibddKeys);
  		if ("optDataGibddRub" in $$props) $$invalidate(58, optDataGibddRub = $$props.optDataGibddRub);
  		if ("optCollisionGibddRubKeys" in $$props) $$invalidate(59, optCollisionGibddRubKeys = $$props.optCollisionGibddRubKeys);
  		if ("optDataHearths" in $$props) $$invalidate(60, optDataHearths = $$props.optDataHearths);
  		if ("optTypeHearthsKeys" in $$props) $$invalidate(61, optTypeHearthsKeys = $$props.optTypeHearthsKeys);
  		if ("optDataHearthsTmp" in $$props) $$invalidate(62, optDataHearthsTmp = $$props.optDataHearthsTmp);
  		if ("optTypeHearthsTmpKeys" in $$props) $$invalidate(63, optTypeHearthsTmpKeys = $$props.optTypeHearthsTmpKeys);
  		if ("optDataHearthsStat" in $$props) $$invalidate(64, optDataHearthsStat = $$props.optDataHearthsStat);
  		if ("optTypeHearthsStatKeys" in $$props) $$invalidate(65, optTypeHearthsStatKeys = $$props.optTypeHearthsStatKeys);
  		if ("optDataHearths3" in $$props) $$invalidate(66, optDataHearths3 = $$props.optDataHearths3);
  		if ("optTypeHearths3Keys" in $$props) $$invalidate(67, optTypeHearths3Keys = $$props.optTypeHearths3Keys);
  		if ("optDataHearths5" in $$props) $$invalidate(68, optDataHearths5 = $$props.optDataHearths5);
  		if ("optTypeHearths5Keys" in $$props) $$invalidate(69, optTypeHearths5Keys = $$props.optTypeHearths5Keys);
  		if ("optDataHearthsPicket" in $$props) $$invalidate(70, optDataHearthsPicket = $$props.optDataHearthsPicket);
  		if ("optRoadTypes" in $$props) $$invalidate(71, optRoadTypes = $$props.optRoadTypes);
  		if ("roads" in $$props) $$invalidate(13, roads = $$props.roads);
  		if ("ht" in $$props) $$invalidate(14, ht = $$props.ht);
  		if ("id_hearth" in $$props) $$invalidate(15, id_hearth = $$props.id_hearth);
  		if ("id_dtp" in $$props) $$invalidate(16, id_dtp = $$props.id_dtp);
  		if ("collision_type" in $$props) $$invalidate(17, collision_type = $$props.collision_type);
  		if ("collision_type_skpdi" in $$props) $$invalidate(18, collision_type_skpdi = $$props.collision_type_skpdi);
  		if ("collision_type_gibdd" in $$props) $$invalidate(19, collision_type_gibdd = $$props.collision_type_gibdd);
  		if ("collision_type_gibddRub" in $$props) $$invalidate(20, collision_type_gibddRub = $$props.collision_type_gibddRub);
  		if ("beg" in $$props) beg = $$props.beg;
  		if ("end" in $$props) end = $$props.end;
  		if ("heat" in $$props) $$invalidate(72, heat = $$props.heat);
  		if ("heatName" in $$props) heatName = $$props.heatName;
  		if ("radius" in $$props) $$invalidate(21, radius = $$props.radius);
  		if ("blur" in $$props) $$invalidate(22, blur = $$props.blur);
  		if ("minOpacity" in $$props) $$invalidate(23, minOpacity = $$props.minOpacity);
  		if ("heatElement" in $$props) $$invalidate(24, heatElement = $$props.heatElement);
  		if ("heatElementDtpGibdd" in $$props) heatElementDtpGibdd = $$props.heatElementDtpGibdd;
  		if ("heatElementDtpSkpdi" in $$props) heatElementDtpSkpdi = $$props.heatElementDtpSkpdi;
  		if ("heatElementDtpVerifyed" in $$props) heatElementDtpVerifyed = $$props.heatElementDtpVerifyed;
  		if ("_comps" in $$props) _comps = $$props._comps;
  		if ("compOn" in $$props) $$invalidate(25, compOn = $$props.compOn);
  		if ("comp1On" in $$props) $$invalidate(26, comp1On = $$props.comp1On);
  		if ("_list_rub" in $$props) _list_rub = $$props._list_rub;
  		if ("list_rubOn" in $$props) $$invalidate(27, list_rubOn = $$props.list_rubOn);
  		if ("list_rubOff" in $$props) $$invalidate(28, list_rubOff = $$props.list_rubOff);
  		if ("hearths_stricken5" in $$props) $$invalidate(29, hearths_stricken5 = $$props.hearths_stricken5);
  		if ("str_icon_type5" in $$props) $$invalidate(30, str_icon_type5 = $$props.str_icon_type5);
  		if ("hearths_period_type_5" in $$props) $$invalidate(31, hearths_period_type_5 = $$props.hearths_period_type_5);
  		if ("hearths_year_5" in $$props) $$invalidate(32, hearths_year_5 = $$props.hearths_year_5);
  		if ("hearths_quarter_5" in $$props) hearths_quarter_5 = $$props.hearths_quarter_5;
  		if ("last_quarter_5" in $$props) last_quarter_5 = $$props.last_quarter_5;
  		if ("hearths_stricken3" in $$props) $$invalidate(33, hearths_stricken3 = $$props.hearths_stricken3);
  		if ("str_icon_type3" in $$props) $$invalidate(34, str_icon_type3 = $$props.str_icon_type3);
  		if ("hearths_period_type_3" in $$props) $$invalidate(35, hearths_period_type_3 = $$props.hearths_period_type_3);
  		if ("hearths_year_3" in $$props) $$invalidate(36, hearths_year_3 = $$props.hearths_year_3);
  		if ("hearths_quarter_3" in $$props) hearths_quarter_3 = $$props.hearths_quarter_3;
  		if ("last_quarter_3" in $$props) last_quarter_3 = $$props.last_quarter_3;
  		if ("hearths_strickenStat" in $$props) $$invalidate(37, hearths_strickenStat = $$props.hearths_strickenStat);
  		if ("str_icon_typeStat" in $$props) $$invalidate(38, str_icon_typeStat = $$props.str_icon_typeStat);
  		if ("hearths_period_type_Stat" in $$props) $$invalidate(39, hearths_period_type_Stat = $$props.hearths_period_type_Stat);
  		if ("hearths_year_Stat" in $$props) $$invalidate(40, hearths_year_Stat = $$props.hearths_year_Stat);
  		if ("hearths_quarter_Stat" in $$props) $$invalidate(41, hearths_quarter_Stat = $$props.hearths_quarter_Stat);
  		if ("last_quarter_Stat" in $$props) last_quarter_Stat = $$props.last_quarter_Stat;
  		if ("hearths_strickenTmp" in $$props) $$invalidate(42, hearths_strickenTmp = $$props.hearths_strickenTmp);
  		if ("str_icon_typeTmp" in $$props) $$invalidate(43, str_icon_typeTmp = $$props.str_icon_typeTmp);
  		if ("hearths_period_type_tmp" in $$props) $$invalidate(44, hearths_period_type_tmp = $$props.hearths_period_type_tmp);
  		if ("hearths_year_tmp" in $$props) $$invalidate(45, hearths_year_tmp = $$props.hearths_year_tmp);
  		if ("hearths_quarter_tmp" in $$props) $$invalidate(46, hearths_quarter_tmp = $$props.hearths_quarter_tmp);
  		if ("last_quarter_tmp" in $$props) last_quarter_tmp = $$props.last_quarter_tmp;
  		if ("hearths_stricken" in $$props) $$invalidate(47, hearths_stricken = $$props.hearths_stricken);
  		if ("str_icon_type" in $$props) $$invalidate(48, str_icon_type = $$props.str_icon_type);
  		if ("hearths_period_type" in $$props) $$invalidate(49, hearths_period_type = $$props.hearths_period_type);
  		if ("hearths_year" in $$props) $$invalidate(50, hearths_year = $$props.hearths_year);
  		if ("hearths_quarter" in $$props) $$invalidate(51, hearths_quarter = $$props.hearths_quarter);
  		if ("last_quarter" in $$props) last_quarter = $$props.last_quarter;
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [
  		DtpVerifyed,
  		DtpSkpdi,
  		DtpGibdd,
  		DtpGibddRub,
  		DtpHearthsPicket,
  		DtpHearths5,
  		DtpHearths3,
  		DtpHearthsStat,
  		DtpHearthsTmp,
  		DtpHearths,
  		Rub,
  		begDate,
  		endDate,
  		roads,
  		ht,
  		id_hearth,
  		id_dtp,
  		collision_type,
  		collision_type_skpdi,
  		collision_type_gibdd,
  		collision_type_gibddRub,
  		radius,
  		blur,
  		minOpacity,
  		heatElement,
  		compOn,
  		comp1On,
  		list_rubOn,
  		list_rubOff,
  		hearths_stricken5,
  		str_icon_type5,
  		hearths_period_type_5,
  		hearths_year_5,
  		hearths_stricken3,
  		str_icon_type3,
  		hearths_period_type_3,
  		hearths_year_3,
  		hearths_strickenStat,
  		str_icon_typeStat,
  		hearths_period_type_Stat,
  		hearths_year_Stat,
  		hearths_quarter_Stat,
  		hearths_strickenTmp,
  		str_icon_typeTmp,
  		hearths_period_type_tmp,
  		hearths_year_tmp,
  		hearths_quarter_tmp,
  		hearths_stricken,
  		str_icon_type,
  		hearths_period_type,
  		hearths_year,
  		hearths_quarter,
  		optData,
  		optCollisionKeys,
  		optDataSkpdi,
  		optCollisionSkpdiKeys,
  		optDataGibdd,
  		optCollisionGibddKeys,
  		optDataGibddRub,
  		optCollisionGibddRubKeys,
  		optDataHearths,
  		optTypeHearthsKeys,
  		optDataHearthsTmp,
  		optTypeHearthsTmpKeys,
  		optDataHearthsStat,
  		optTypeHearthsStatKeys,
  		optDataHearths3,
  		optTypeHearths3Keys,
  		optDataHearths5,
  		optTypeHearths5Keys,
  		optDataHearthsPicket,
  		optRoadTypes,
  		heat,
  		setComp,
  		setFilterHearthsPicket,
  		oncheckIdDtp,
  		oncheckIdHearth,
  		oncheckHt,
  		setHeat,
  		setMinOpacity,
  		setFilter,
  		setFilterGibddRub,
  		setFilterGibdd,
  		setFilterSkpdi,
  		oncheck,
  		onPrev,
  		onNext,
  		setFilterHearths5,
  		setFilterHearths3,
  		setFilterHearthsStat,
  		setFilterHearthsTmp,
  		setFilterHearths,
  		currentFilter,
  		dateInterval,
  		beg,
  		end,
  		hearths_quarter_5,
  		last_quarter_5,
  		hearths_quarter_3,
  		last_quarter_3,
  		last_quarter_Stat,
  		last_quarter_tmp,
  		last_quarter,
  		currentFilterDtpHearths,
  		td,
  		tdd,
  		ed,
  		bd,
  		heatName,
  		heatElementDtpGibdd,
  		heatElementDtpSkpdi,
  		heatElementDtpVerifyed,
  		_comps,
  		_list_rub,
  		func,
  		select_change_handler,
  		input_change_handler,
  		$$binding_groups,
  		func_1,
  		select0_change_handler,
  		select1_change_handler,
  		input_change_handler_1,
  		func_2,
  		select0_change_handler_1,
  		select1_change_handler_1,
  		input0_change_handler,
  		input1_change_handler,
  		func_3,
  		select0_change_handler_2,
  		select1_change_handler_2,
  		input0_change_handler_1,
  		input1_change_handler_1,
  		func_4,
  		select0_change_handler_3,
  		select1_change_handler_3,
  		input0_change_handler_2,
  		input1_change_handler_2,
  		func_5,
  		select0_change_handler_4,
  		select1_change_handler_4,
  		input0_binding,
  		input1_binding,
  		input2_change_input_handler,
  		input3_change_input_handler,
  		input4_change_input_handler,
  		input5_binding,
  		func_6,
  		select_change_handler_1,
  		func_7,
  		select_change_handler_2,
  		func_8,
  		select_change_handler_3,
  		input0_change_handler_3,
  		input1_change_handler_3,
  		func_9,
  		select_change_handler_4,
  		input0_change_handler_4,
  		input1_change_handler_4
  	];
  }

  class DtpVerifyedFilters extends SvelteComponentDev {
  	constructor(options) {
  		super(options);

  		init(
  			this,
  			options,
  			instance$4,
  			create_fragment$4,
  			safe_not_equal,
  			{
  				DtpHearthsPicket: 4,
  				DtpHearths5: 5,
  				DtpHearths3: 6,
  				DtpHearthsStat: 7,
  				DtpHearthsTmp: 8,
  				DtpHearths: 9,
  				DtpVerifyed: 0,
  				DtpSkpdi: 1,
  				DtpGibdd: 2,
  				DtpGibddRub: 3,
  				Rub: 10
  			},
  			[-1, -1, -1, -1, -1, -1, -1]
  		);

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpVerifyedFilters",
  			options,
  			id: create_fragment$4.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*DtpHearthsPicket*/ ctx[4] === undefined && !("DtpHearthsPicket" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsPicket'");
  		}

  		if (/*DtpHearths5*/ ctx[5] === undefined && !("DtpHearths5" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearths5'");
  		}

  		if (/*DtpHearths3*/ ctx[6] === undefined && !("DtpHearths3" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearths3'");
  		}

  		if (/*DtpHearthsStat*/ ctx[7] === undefined && !("DtpHearthsStat" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsStat'");
  		}

  		if (/*DtpHearthsTmp*/ ctx[8] === undefined && !("DtpHearthsTmp" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsTmp'");
  		}

  		if (/*DtpHearths*/ ctx[9] === undefined && !("DtpHearths" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearths'");
  		}

  		if (/*DtpVerifyed*/ ctx[0] === undefined && !("DtpVerifyed" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpVerifyed'");
  		}

  		if (/*DtpSkpdi*/ ctx[1] === undefined && !("DtpSkpdi" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpSkpdi'");
  		}

  		if (/*DtpGibdd*/ ctx[2] === undefined && !("DtpGibdd" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpGibdd'");
  		}

  		if (/*DtpGibddRub*/ ctx[3] === undefined && !("DtpGibddRub" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpGibddRub'");
  		}

  		if (/*Rub*/ ctx[10] === undefined && !("Rub" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'Rub'");
  		}
  	}

  	get DtpHearthsPicket() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpHearthsPicket(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpHearths5() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpHearths5(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpHearths3() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpHearths3(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpHearthsStat() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpHearthsStat(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpHearthsTmp() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpHearthsTmp(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpHearths() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpHearths(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpVerifyed() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpVerifyed(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpSkpdi() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpSkpdi(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpGibdd() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpGibdd(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpGibddRub() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpGibddRub(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get Rub() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set Rub(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  /* src\DtpPopupHearths.svelte generated by Svelte v3.20.1 */

  const { console: console_1$3 } = globals;
  const file$5 = "src\\DtpPopupHearths.svelte";

  function get_each_context$5(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[7] = list[i];
  	child_ctx[9] = i;
  	return child_ctx;
  }

  // (24:4) {#if prp.piketaj_start_km}
  function create_if_block_1$3(ctx) {
  	let tr;
  	let td0;
  	let t1;
  	let td1;
  	let t2;
  	let b0;
  	let t3_value = (/*prp*/ ctx[0].piketaj_start_km || 0) + "";
  	let t3;
  	let t4;
  	let b1;
  	let t5_value = (/*prp*/ ctx[0].piketaj_finish_km || 0) + "";
  	let t5;
  	let t6;

  	const block = {
  		c: function create() {
  			tr = element("tr");
  			td0 = element("td");
  			td0.textContent = "Пикетаж:";
  			t1 = space();
  			td1 = element("td");
  			t2 = text("От: ");
  			b0 = element("b");
  			t3 = text(t3_value);
  			t4 = text(" км. до: ");
  			b1 = element("b");
  			t5 = text(t5_value);
  			t6 = text(" км.");
  			attr_dev(td0, "class", "first svelte-mnr9l0");
  			add_location(td0, file$5, 25, 5, 594);
  			add_location(b0, file$5, 26, 13, 639);
  			add_location(b1, file$5, 26, 56, 682);
  			add_location(td1, file$5, 26, 5, 631);
  			add_location(tr, file$5, 24, 3, 584);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, tr, anchor);
  			append_dev(tr, td0);
  			append_dev(tr, t1);
  			append_dev(tr, td1);
  			append_dev(td1, t2);
  			append_dev(td1, b0);
  			append_dev(b0, t3);
  			append_dev(td1, t4);
  			append_dev(td1, b1);
  			append_dev(b1, t5);
  			append_dev(td1, t6);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && t3_value !== (t3_value = (/*prp*/ ctx[0].piketaj_start_km || 0) + "")) set_data_dev(t3, t3_value);
  			if (dirty & /*prp*/ 1 && t5_value !== (t5_value = (/*prp*/ ctx[0].piketaj_finish_km || 0) + "")) set_data_dev(t5, t5_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(tr);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_1$3.name,
  		type: "if",
  		source: "(24:4) {#if prp.piketaj_start_km}",
  		ctx
  	});

  	return block;
  }

  // (59:4) {#if current === index}
  function create_if_block$4(ctx) {
  	let div;
  	let current;

  	const dtppopup = new DtpPopupVerifyed({
  			props: {
  				prp: /*pt1*/ ctx[7],
  				closeMe: /*func*/ ctx[6]
  			},
  			$$inline: true
  		});

  	const block = {
  		c: function create() {
  			div = element("div");
  			create_component(dtppopup.$$.fragment);
  			attr_dev(div, "class", "win leaflet-popup-content-wrapper  svelte-mnr9l0");
  			add_location(div, file$5, 59, 4, 1661);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div, anchor);
  			mount_component(dtppopup, div, null);
  			current = true;
  		},
  		p: function update(ctx, dirty) {
  			const dtppopup_changes = {};
  			if (dirty & /*prp*/ 1) dtppopup_changes.prp = /*pt1*/ ctx[7];
  			if (dirty & /*current*/ 2) dtppopup_changes.closeMe = /*func*/ ctx[6];
  			dtppopup.$set(dtppopup_changes);
  		},
  		i: function intro(local) {
  			if (current) return;
  			transition_in(dtppopup.$$.fragment, local);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(dtppopup.$$.fragment, local);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			destroy_component(dtppopup);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block$4.name,
  		type: "if",
  		source: "(59:4) {#if current === index}",
  		ctx
  	});

  	return block;
  }

  // (46:4) {#each prp.list_dtp as pt1, index}
  function create_each_block$5(ctx) {
  	let tr0;
  	let td0;
  	let ul;
  	let li0;
  	let t0;
  	let t1_value = Math.floor(/*pt1*/ ctx[7].piketaj_m / 1000) + "";
  	let t1;
  	let t2;
  	let t3_value = /*pt1*/ ctx[7].piketaj_m % 1000 + "";
  	let t3;
  	let t4;
  	let t5;
  	let li1;
  	let t6_value = new Date(1000 * /*pt1*/ ctx[7].date).toLocaleDateString() + "";
  	let t6;
  	let t7;
  	let t8_value = /*pt1*/ ctx[7].lost + "";
  	let t8;
  	let t9;
  	let t10_value = /*pt1*/ ctx[7].stricken + "";
  	let t10;
  	let li1_title_value;
  	let t11;
  	let tr1;
  	let td1;
  	let t13;
  	let td2;
  	let t14_value = /*pt1*/ ctx[7].address + "";
  	let t14;
  	let br;
  	let span;
  	let t16;
  	let t17;
  	let current;
  	let dispose;

  	function click_handler(...args) {
  		return /*click_handler*/ ctx[4](/*index*/ ctx[9], ...args);
  	}

  	function click_handler_1(...args) {
  		return /*click_handler_1*/ ctx[5](/*index*/ ctx[9], ...args);
  	}

  	let if_block = /*current*/ ctx[1] === /*index*/ ctx[9] && create_if_block$4(ctx);

  	const block = {
  		c: function create() {
  			tr0 = element("tr");
  			td0 = element("td");
  			ul = element("ul");
  			li0 = element("li");
  			t0 = text("Пикетаж: ");
  			t1 = text(t1_value);
  			t2 = text(" км. ");
  			t3 = text(t3_value);
  			t4 = text(" м.");
  			t5 = space();
  			li1 = element("li");
  			t6 = text(t6_value);
  			t7 = text(" погибших ");
  			t8 = text(t8_value);
  			t9 = text(", раненых ");
  			t10 = text(t10_value);
  			t11 = space();
  			tr1 = element("tr");
  			td1 = element("td");
  			td1.textContent = "Адрес:";
  			t13 = space();
  			td2 = element("td");
  			t14 = text(t14_value);
  			br = element("br");
  			span = element("span");
  			span.textContent = "подробнее";
  			t16 = space();
  			if (if_block) if_block.c();
  			t17 = space();
  			attr_dev(li0, "class", "svelte-mnr9l0");
  			add_location(li0, file$5, 49, 5, 1202);
  			attr_dev(li1, "title", li1_title_value = "id: " + /*pt1*/ ctx[7].id);
  			attr_dev(li1, "class", "svelte-mnr9l0");
  			add_location(li1, file$5, 50, 5, 1290);
  			add_location(ul, file$5, 48, 4, 1192);
  			attr_dev(td0, "class", "first svelte-mnr9l0");
  			attr_dev(td0, "colspan", "2");
  			add_location(td0, file$5, 47, 5, 1159);
  			add_location(tr0, file$5, 46, 3, 1149);
  			attr_dev(td1, "class", "first svelte-mnr9l0");
  			add_location(td1, file$5, 56, 5, 1499);
  			add_location(br, file$5, 57, 22, 1551);
  			attr_dev(span, "class", "link svelte-mnr9l0");
  			add_location(span, file$5, 57, 28, 1557);
  			add_location(td2, file$5, 57, 5, 1534);
  			add_location(tr1, file$5, 55, 3, 1489);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, tr0, anchor);
  			append_dev(tr0, td0);
  			append_dev(td0, ul);
  			append_dev(ul, li0);
  			append_dev(li0, t0);
  			append_dev(li0, t1);
  			append_dev(li0, t2);
  			append_dev(li0, t3);
  			append_dev(li0, t4);
  			append_dev(ul, t5);
  			append_dev(ul, li1);
  			append_dev(li1, t6);
  			append_dev(li1, t7);
  			append_dev(li1, t8);
  			append_dev(li1, t9);
  			append_dev(li1, t10);
  			insert_dev(target, t11, anchor);
  			insert_dev(target, tr1, anchor);
  			append_dev(tr1, td1);
  			append_dev(tr1, t13);
  			append_dev(tr1, td2);
  			append_dev(td2, t14);
  			append_dev(td2, br);
  			append_dev(td2, span);
  			append_dev(td2, t16);
  			if (if_block) if_block.m(td2, null);
  			append_dev(tr1, t17);
  			current = true;
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(li1, "click", click_handler, false, false, false),
  				listen_dev(span, "click", click_handler_1, false, false, false)
  			];
  		},
  		p: function update(new_ctx, dirty) {
  			ctx = new_ctx;
  			if ((!current || dirty & /*prp*/ 1) && t1_value !== (t1_value = Math.floor(/*pt1*/ ctx[7].piketaj_m / 1000) + "")) set_data_dev(t1, t1_value);
  			if ((!current || dirty & /*prp*/ 1) && t3_value !== (t3_value = /*pt1*/ ctx[7].piketaj_m % 1000 + "")) set_data_dev(t3, t3_value);
  			if ((!current || dirty & /*prp*/ 1) && t6_value !== (t6_value = new Date(1000 * /*pt1*/ ctx[7].date).toLocaleDateString() + "")) set_data_dev(t6, t6_value);
  			if ((!current || dirty & /*prp*/ 1) && t8_value !== (t8_value = /*pt1*/ ctx[7].lost + "")) set_data_dev(t8, t8_value);
  			if ((!current || dirty & /*prp*/ 1) && t10_value !== (t10_value = /*pt1*/ ctx[7].stricken + "")) set_data_dev(t10, t10_value);

  			if (!current || dirty & /*prp*/ 1 && li1_title_value !== (li1_title_value = "id: " + /*pt1*/ ctx[7].id)) {
  				attr_dev(li1, "title", li1_title_value);
  			}

  			if ((!current || dirty & /*prp*/ 1) && t14_value !== (t14_value = /*pt1*/ ctx[7].address + "")) set_data_dev(t14, t14_value);

  			if (/*current*/ ctx[1] === /*index*/ ctx[9]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  					transition_in(if_block, 1);
  				} else {
  					if_block = create_if_block$4(ctx);
  					if_block.c();
  					transition_in(if_block, 1);
  					if_block.m(td2, null);
  				}
  			} else if (if_block) {
  				group_outros();

  				transition_out(if_block, 1, 1, () => {
  					if_block = null;
  				});

  				check_outros();
  			}
  		},
  		i: function intro(local) {
  			if (current) return;
  			transition_in(if_block);
  			current = true;
  		},
  		o: function outro(local) {
  			transition_out(if_block);
  			current = false;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(tr0);
  			if (detaching) detach_dev(t11);
  			if (detaching) detach_dev(tr1);
  			if (if_block) if_block.d();
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$5.name,
  		type: "each",
  		source: "(46:4) {#each prp.list_dtp as pt1, index}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$5(ctx) {
  	let div3;
  	let div0;
  	let t0;
  	let t1_value = (/*prp*/ ctx[0].id || /*prp*/ ctx[0].id_hearth) + "";
  	let t1;
  	let t2;
  	let t3;
  	let div1;

  	let t4_value = (/*prp*/ ctx[0].quarter
  	? /*prp*/ ctx[0].quarter + " кв."
  	: "") + "";

  	let t4;
  	let t5;
  	let t6_value = /*prp*/ ctx[0].year + "";
  	let t6;
  	let t7;
  	let t8;
  	let div2;
  	let table;
  	let tbody;
  	let t9;
  	let tr0;
  	let td0;
  	let t11;
  	let td1;
  	let t12_value = (/*prp*/ ctx[0].str_icon_type || "") + "";
  	let t12;
  	let t13;
  	let tr1;
  	let td2;
  	let t15;
  	let td3;
  	let t16_value = /*prp*/ ctx[0].list_dtp.length + "";
  	let t16;
  	let t17;
  	let tr2;
  	let td4;
  	let t19;
  	let td5;
  	let t20_value = /*prp*/ ctx[0].count_lost + "";
  	let t20;
  	let t21;
  	let tr3;
  	let td6;
  	let t23;
  	let td7;
  	let t24_value = /*prp*/ ctx[0].count_stricken + "";
  	let t24;
  	let t25;
  	let current;
  	let if_block = /*prp*/ ctx[0].piketaj_start_km && create_if_block_1$3(ctx);
  	let each_value = /*prp*/ ctx[0].list_dtp;
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
  	}

  	const out = i => transition_out(each_blocks[i], 1, 1, () => {
  		each_blocks[i] = null;
  	});

  	const block = {
  		c: function create() {
  			div3 = element("div");
  			div0 = element("div");
  			t0 = text("Очаг ДТП (id: ");
  			t1 = text(t1_value);
  			t2 = text(")");
  			t3 = space();
  			div1 = element("div");
  			t4 = text(t4_value);
  			t5 = space();
  			t6 = text(t6_value);
  			t7 = text("г.");
  			t8 = space();
  			div2 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			if (if_block) if_block.c();
  			t9 = space();
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Тип ДТП:";
  			t11 = space();
  			td1 = element("td");
  			t12 = text(t12_value);
  			t13 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Всего ДТП:";
  			t15 = space();
  			td3 = element("td");
  			t16 = text(t16_value);
  			t17 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Погибших:";
  			t19 = space();
  			td5 = element("td");
  			t20 = text(t20_value);
  			t21 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Раненых:";
  			t23 = space();
  			td7 = element("td");
  			t24 = text(t24_value);
  			t25 = space();

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$5, 18, 2, 338);
  			attr_dev(div1, "class", "pLine");
  			add_location(div1, file$5, 19, 2, 406);
  			attr_dev(td0, "class", "first svelte-mnr9l0");
  			add_location(td0, file$5, 30, 5, 759);
  			add_location(td1, file$5, 31, 5, 796);
  			add_location(tr0, file$5, 29, 3, 749);
  			attr_dev(td2, "class", "first svelte-mnr9l0");
  			add_location(td2, file$5, 34, 5, 853);
  			add_location(td3, file$5, 35, 5, 892);
  			add_location(tr1, file$5, 33, 3, 843);
  			attr_dev(td4, "class", "first svelte-mnr9l0");
  			add_location(td4, file$5, 38, 5, 945);
  			add_location(td5, file$5, 39, 5, 983);
  			add_location(tr2, file$5, 37, 3, 935);
  			attr_dev(td6, "class", "first svelte-mnr9l0");
  			add_location(td6, file$5, 42, 5, 1031);
  			add_location(td7, file$5, 43, 5, 1068);
  			add_location(tr3, file$5, 41, 3, 1021);
  			add_location(tbody, file$5, 22, 3, 542);
  			attr_dev(table, "class", "table svelte-mnr9l0");
  			add_location(table, file$5, 21, 4, 517);
  			attr_dev(div2, "class", "featureCont");
  			add_location(div2, file$5, 20, 2, 487);
  			attr_dev(div3, "class", "mvsPopup svelte-mnr9l0");
  			add_location(div3, file$5, 17, 1, 313);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div3, anchor);
  			append_dev(div3, div0);
  			append_dev(div0, t0);
  			append_dev(div0, t1);
  			append_dev(div0, t2);
  			append_dev(div3, t3);
  			append_dev(div3, div1);
  			append_dev(div1, t4);
  			append_dev(div1, t5);
  			append_dev(div1, t6);
  			append_dev(div1, t7);
  			append_dev(div3, t8);
  			append_dev(div3, div2);
  			append_dev(div2, table);
  			append_dev(table, tbody);
  			if (if_block) if_block.m(tbody, null);
  			append_dev(tbody, t9);
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t11);
  			append_dev(tr0, td1);
  			append_dev(td1, t12);
  			append_dev(tbody, t13);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t15);
  			append_dev(tr1, td3);
  			append_dev(td3, t16);
  			append_dev(tbody, t17);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t19);
  			append_dev(tr2, td5);
  			append_dev(td5, t20);
  			append_dev(tbody, t21);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, t23);
  			append_dev(tr3, td7);
  			append_dev(td7, t24);
  			append_dev(tbody, t25);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(tbody, null);
  			}

  			current = true;
  		},
  		p: function update(ctx, [dirty]) {
  			if ((!current || dirty & /*prp*/ 1) && t1_value !== (t1_value = (/*prp*/ ctx[0].id || /*prp*/ ctx[0].id_hearth) + "")) set_data_dev(t1, t1_value);

  			if ((!current || dirty & /*prp*/ 1) && t4_value !== (t4_value = (/*prp*/ ctx[0].quarter
  			? /*prp*/ ctx[0].quarter + " кв."
  			: "") + "")) set_data_dev(t4, t4_value);

  			if ((!current || dirty & /*prp*/ 1) && t6_value !== (t6_value = /*prp*/ ctx[0].year + "")) set_data_dev(t6, t6_value);

  			if (/*prp*/ ctx[0].piketaj_start_km) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block_1$3(ctx);
  					if_block.c();
  					if_block.m(tbody, t9);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}

  			if ((!current || dirty & /*prp*/ 1) && t12_value !== (t12_value = (/*prp*/ ctx[0].str_icon_type || "") + "")) set_data_dev(t12, t12_value);
  			if ((!current || dirty & /*prp*/ 1) && t16_value !== (t16_value = /*prp*/ ctx[0].list_dtp.length + "")) set_data_dev(t16, t16_value);
  			if ((!current || dirty & /*prp*/ 1) && t20_value !== (t20_value = /*prp*/ ctx[0].count_lost + "")) set_data_dev(t20, t20_value);
  			if ((!current || dirty & /*prp*/ 1) && t24_value !== (t24_value = /*prp*/ ctx[0].count_stricken + "")) set_data_dev(t24, t24_value);

  			if (dirty & /*prp, current, moveTo, Date, Math*/ 7) {
  				each_value = /*prp*/ ctx[0].list_dtp;
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$5(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block$5(child_ctx);
  						each_blocks[i].c();
  						transition_in(each_blocks[i], 1);
  						each_blocks[i].m(tbody, null);
  					}
  				}

  				group_outros();

  				for (i = each_value.length; i < each_blocks.length; i += 1) {
  					out(i);
  				}

  				check_outros();
  			}
  		},
  		i: function intro(local) {
  			if (current) return;

  			for (let i = 0; i < each_value.length; i += 1) {
  				transition_in(each_blocks[i]);
  			}

  			current = true;
  		},
  		o: function outro(local) {
  			each_blocks = each_blocks.filter(Boolean);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				transition_out(each_blocks[i]);
  			}

  			current = false;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div3);
  			if (if_block) if_block.d();
  			destroy_each(each_blocks, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$5.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$5($$self, $$props, $$invalidate) {
  	let { prp } = $$props;
  	let current;

  	const moveTo = nm => {
  		let obj = prp._bounds.options.items[nm];

  		if (obj && obj._map) {
  			obj._map.panTo(obj._latlng);
  		}
  	};

  	const showDtpInfo = ev => {
  		console.log("showDtpInfo ", ev);
  	};

  	const writable_props = ["prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<DtpPopupHearths> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupHearths", $$slots, []);

  	const click_handler = index => {
  		moveTo(index);
  	};

  	const click_handler_1 = index => {
  		$$invalidate(1, current = index);
  	};

  	const func = () => {
  		$$invalidate(1, current = null);
  	};

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({
  		DtpPopup: DtpPopupVerifyed,
  		prp,
  		current,
  		moveTo,
  		showDtpInfo
  	});

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("current" in $$props) $$invalidate(1, current = $$props.current);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [prp, current, moveTo, showDtpInfo, click_handler, click_handler_1, func];
  }

  class DtpPopupHearths extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$5, create_fragment$5, safe_not_equal, { prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupHearths",
  			options,
  			id: create_fragment$5.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$3.warn("<DtpPopupHearths> was created without expected prop 'prp'");
  		}
  	}

  	get prp() {
  		throw new Error("<DtpPopupHearths>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupHearths>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$8 = window.L;

  const popup$3 = L$8.popup();
  const popup1 = L$8.popup({minWidth: 200});
  let argFilters$3;

  const setPopup$3 = function (props) {
  	let cont = L$8.DomUtil.create('div');
  	new DtpPopupVerifyed({
  		target: cont,
  		props: {
  			// popup: popup,
  			prp: props
  		}
  	});
  	popup$3.setContent(cont);
  	return cont;
  };

  const setPopup1 = function (props) {
  	let cont = L$8.DomUtil.create('div');
  	new DtpPopupHearths({
  		target: cont,
  		props: {
  			prp: props
  		}
  	});
  	popup1.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const DtpHearths = L$8.featureGroup([]);
  DtpHearths.setFilter = arg => {
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	DtpHearths.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$3 = arg;

  	let arr = [];
  	if (DtpHearths._group) {
  		DtpHearths._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				cnt = 0;
  			argFilters$3.forEach(ft => {
  				if (ft.type === 'quarter') {
  					if (ft.zn[prp.year] && ft.zn[prp.year][prp.quarter]) {
  						cnt++;
  					}
  				} else if (ft.type === 'year') {
  					if (ft.zn[prp.year]) {
  						cnt++;
  					}
  				} else if (ft.type === 'str_icon_type') {
  					if (ft.zn.filter(pt => pt === prp.str_icon_type).length) {
  						cnt++;
  					}
  				} else if (ft.type === 'stricken') {
  					let zn = ft.zn;
  					if (!zn) {
  						cnt++;
  					} else if (zn === 1 && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 3 && prp.count_stricken && prp.count_lost) {
  						cnt++;								// С пострадавшими и погибшими
  					}
  				}
  			});
  			if (cnt === argFilters$3.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		DtpHearths.addLayer(L$8.layerGroup(arr));
  		// DtpHearths._heat.setData({
  			// max: 8,
  			// data: DtpHearths._heatData
  		// });
  	}
  };

  DtpHearths.on('remove', () => {
  	DtpHearths.clearLayers();
  }).on('add', ev => {
  	let opt = {str_icon_type: {}, iconType: {}, years: {}, dtps: {}},
  		arr = [],
  		prefix = 'https://dtp.mvs.group/scripts/hearths/';

  	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				json.forEach(it => {
  					let iconType = it.icon_type || 1,
  						list_bounds = L$8.latLngBounds(),
  						list_dtp = it.list_dtp,
  						stroke = false,
  						fillColor = '#FF0000'; //   19-20
  					if (list_dtp.length) {

  						let cy = Number(it.year),
  							cq = Number(it.quarter),
  							year = opt.years[it.year];
  						if (!year) {
  							year = opt.years[it.year] = {};
  						}
  						opt.years[it.year] = year;
  						let quarter = year[it.quarter];
  						if (it.quarter in year) {
  							quarter++;
  						} else {
  							quarter = year[it.quarter] = 1;
  						}
  						year[it.quarter] = quarter;
  						
  						let cTypeCount = opt.str_icon_type[it.str_icon_type];
  						if (!cTypeCount) {
  							cTypeCount = 1;
  						} else {
  							cTypeCount++;
  						}
  						opt.str_icon_type[it.str_icon_type] = cTypeCount;
  						opt.iconType[it.str_icon_type] = iconType;

  						if (iconType) {
  							stroke = iconType % 2 === 0 ? true : false; //  - смертельные ДТП
  							if (iconType === 1 || iconType === 2) {
  								fillColor = '#FFA500';
  							} else if (iconType === 3 || iconType === 4) {
  								fillColor = '#B8860B';
  							} else if (iconType === 5 || iconType === 6) {
  								fillColor = '#CD853F';
  							} else if (iconType === 7 || iconType === 8) {
  								fillColor = '#228B22';
  							} else if (iconType === 9 || iconType === 10) {
  								fillColor = '#FF8C00';
  							} else if (iconType === 11 || iconType === 12) {
  								fillColor = '#D2691E';
  							} else if (iconType === 13 || iconType === 14) {
  								fillColor = '#DEB887';
  							} else if (iconType === 15 || iconType === 16) {
  								fillColor = '#7B68EE';
  							} else if (iconType === 17 || iconType === 18) {
  								fillColor = '#2F4F4F';
  							}
  						}
  						let arr1 = list_dtp.map(prp => {
  							let iconType = prp.iconType || 0,
  								coords = prp.coords || {lat: 0, lon: 0},
  								latlng = L$8.latLng(coords.lat, coords.lon),
  								cur = [];

  							list_bounds.extend(latlng);

  							if (prp.id_skpdi) { cur.push({type: 'skpdi', id: prp.id_skpdi}); }
  							if (prp.id_stat) { cur.push({type: 'gibdd', id: prp.id_stat}); }
  							prp._cur = cur;

  							let dtps = opt.dtps[prp.id];
  							if (!dtps) {
  								dtps = {};
  								dtps[it.id] = 1;
  							} else if (!dtps[it.id]) {
  								dtps[it.id] = 1;
  							} else {
  								dtps[it.id]++;
  							}
  							opt.dtps[prp.id] = dtps;
  							return new CirclePoint(L$8.latLng(coords.lat, coords.lon), {
  									cluster: it,
  									props: prp,
  									radius: 6,
  									zIndexOffset: 50000,
  									rhomb: true,
  									stroke: stroke,
  									fillColor: fillColor,
  									// renderer: renderer
  								}).bindPopup(popup$3)
  								.on('popupopen', (ev) => {

  									setPopup$3(ev.target.options.props);
  									// console.log('popupopen', ev);
  								}).on('popupclose', (ev) => {
  									if (ev.popup._svObj) {
  										ev.popup._svObj.$destroy();
  										delete ev.popup._svObj;
  									}
  								});
  						});
  						it._bounds = L$8.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'})
  							.on('mouseover', (ev) => {
  								let target = ev.target;
  								target._color = target.options.color;
  								target.options.color = 'red';
  								target._renderer._updateStyle(target);
  							})
  							.on('mouseout', (ev) => {
  								let target = ev.target;
  								target.options.color = target._color;
  								target._renderer._updateStyle(target);
  							})
  							.on('click', (ev) => {
  								L$8.DomEvent.stopPropagation(ev);
  								let dist = 1000,
  									target = ev.target,
  									latlng = ev.latlng,
  									ctrlKey = ev.originalEvent.ctrlKey,
  									dtp;
  								if (ctrlKey) { target.bringToBack(); }
  								target.options.items.forEach(pt => {
  									let cd = pt._latlng.distanceTo(latlng);
  									if (cd < dist) {
  										dist = cd;
  										dtp = pt;
  									}
  								});
  								if (dist < 10) {
  									setPopup$3(dtp.options.props);
  									popup$3.setLatLng(dtp._latlng).openOn(DtpHearths._map);
  								} else {
  									setPopup1(it);
  									popup1.setLatLng(latlng).openOn(DtpHearths._map);
  								}
  								
  								// console.log('popu666popen', dist, dtp);
  							});
  						arr.push(it._bounds);
  						arr = arr.concat(arr1);
  					}
  				});
  				
  				// let y = Math.floor(max_quarter),
  					// q = 1 + 4 * (max_quarter - y);
  				// argFilters = [{type: 'quarter', year: y, zn: q}];
  // console.log('opt', opt);
  				DtpHearths._opt = opt;
  				DtpHearths._group = L$8.layerGroup(arr);
  				if (argFilters$3) {
  					DtpHearths.setFilter(argFilters$3);
  				} else {
  					DtpHearths.addLayer(DtpHearths._group);
  				}
  				DtpHearths._refreshFilters();
  			});
  console.log('__allJson_____', allJson, DtpHearths._opt);
  		});
  });

  const L$9 = window.L;

  const popup$4 = L$9.popup();
  const popup1$1 = L$9.popup({minWidth: 200});
  let argFilters$4;

  const setPopup$4 = function (props) {
  	let cont = L$9.DomUtil.create('div');
  	new DtpPopupVerifyed({
  		target: cont,
  		props: {
  			// popup: popup,
  			prp: props
  		}
  	});
  	popup$4.setContent(cont);
  	return cont;
  };

  const setPopup1$1 = function (props) {
  	let cont = L$9.DomUtil.create('div');
  	new DtpPopupHearths({
  		target: cont,
  		props: {
  			prp: props
  		}
  	});
  	popup1$1.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const DtpHearthsTmp = L$9.featureGroup([]);
  DtpHearthsTmp.setFilter = arg => {
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	DtpHearthsTmp.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$4 = arg;

  	let arr = [];
  	if (DtpHearthsTmp._group) {
  		DtpHearthsTmp._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				cnt = 0;
  			argFilters$4.forEach(ft => {
  				if (ft.type === 'quarter') {
  					if (ft.zn[prp.year] && ft.zn[prp.year][prp.quarter]) {
  						cnt++;
  					}
  				} else if (ft.type === 'year') {
  					if (ft.zn[prp.year]) {
  						cnt++;
  					}
  				} else if (ft.type === 'str_icon_type') {
  					if (ft.zn.filter(pt => pt === prp.str_icon_type).length) {
  						cnt++;
  					}
  				} else if (ft.type === 'stricken') {
  					let zn = ft.zn;
  					if (!zn) {
  						cnt++;
  					} else if (zn === 1 && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 3 && prp.count_stricken && prp.count_lost) {
  						cnt++;								// С пострадавшими и погибшими
  					}
  				}
  			});
  			if (cnt === argFilters$4.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		DtpHearthsTmp.addLayer(L$9.layerGroup(arr));
  		// DtpHearths._heat.setData({
  			// max: 8,
  			// data: DtpHearths._heatData
  		// });
  	}
  };

  DtpHearthsTmp.on('remove', () => {
  	DtpHearthsTmp.clearLayers();
  }).on('add', ev => {
  	let opt = {str_icon_type: {}, iconType: {}, years: {}, dtps: {}},
  		arr = [],
  		prefix = 'https://dtp.mvs.group/scripts/hearthstmp/';

  	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				json.forEach(it => {
  					let iconType = it.icon_type || 1,
  						list_bounds = L$9.latLngBounds(),
  						list_dtp = it.list_dtp,
  						stroke = false,
  						fillColor = '#FF0000'; //   19-20
  					if (list_dtp.length) {

  						let cy = Number(it.year),
  							cq = Number(it.quarter),
  							year = opt.years[it.year];
  						if (!year) {
  							year = opt.years[it.year] = {};
  						}
  						opt.years[it.year] = year;
  						let quarter = year[it.quarter];
  						if (it.quarter in year) {
  							quarter++;
  						} else {
  							quarter = year[it.quarter] = 1;
  						}
  						year[it.quarter] = quarter;
  						
  						let cTypeCount = opt.str_icon_type[it.str_icon_type];
  						if (!cTypeCount) {
  							cTypeCount = 1;
  						} else {
  							cTypeCount++;
  						}
  						opt.str_icon_type[it.str_icon_type] = cTypeCount;
  						opt.iconType[it.str_icon_type] = iconType;

  						if (iconType) {
  							stroke = iconType % 2 === 0 ? true : false; //  - смертельные ДТП
  							if (iconType === 1 || iconType === 2) {
  								fillColor = '#FFA500';
  							} else if (iconType === 3 || iconType === 4) {
  								fillColor = '#B8860B';
  							} else if (iconType === 5 || iconType === 6) {
  								fillColor = '#CD853F';
  							} else if (iconType === 7 || iconType === 8) {
  								fillColor = '#228B22';
  							} else if (iconType === 9 || iconType === 10) {
  								fillColor = '#FF8C00';
  							} else if (iconType === 11 || iconType === 12) {
  								fillColor = '#D2691E';
  							} else if (iconType === 13 || iconType === 14) {
  								fillColor = '#DEB887';
  							} else if (iconType === 15 || iconType === 16) {
  								fillColor = '#7B68EE';
  							} else if (iconType === 17 || iconType === 18) {
  								fillColor = '#2F4F4F';
  							}
  						}
  						let arr1 = list_dtp.map(prp => {
  							let iconType = prp.iconType || 0,
  								coords = prp.coords || {lat: 0, lon: 0},
  								latlng = L$9.latLng(coords.lat, coords.lon),
  								cur = [];

  							list_bounds.extend(latlng);

  							if (prp.id_skpdi) { cur.push({type: 'skpdi', id: prp.id_skpdi}); }
  							if (prp.id_stat) { cur.push({type: 'gibdd', id: prp.id_stat}); }
  							prp._cur = cur;

  							let dtps = opt.dtps[prp.id];
  							if (!dtps) {
  								dtps = {};
  								dtps[it.id] = 1;
  							} else if (!dtps[it.id]) {
  								dtps[it.id] = 1;
  							} else {
  								dtps[it.id]++;
  							}
  							opt.dtps[prp.id] = dtps;
  							return new CirclePoint(L$9.latLng(coords.lat, coords.lon), {
  									cluster: it,
  									props: prp,
  									radius: 6,
  									zIndexOffset: 50000,
  									rhomb: true,
  									stroke: stroke,
  									fillColor: fillColor,
  									// renderer: renderer
  								}).bindPopup(popup$4)
  								.on('popupopen', (ev) => {

  									setPopup$4(ev.target.options.props);
  									// console.log('popupopen', ev);
  								}).on('popupclose', (ev) => {
  									if (ev.popup._svObj) {
  										ev.popup._svObj.$destroy();
  										delete ev.popup._svObj;
  									}
  								});
  						});
  						it._bounds = L$9.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'})
  							.on('mouseover', (ev) => {
  								let target = ev.target;
  								target._color = target.options.color;
  								target.options.color = 'red';
  								target._renderer._updateStyle(target);
  							})
  							.on('mouseout', (ev) => {
  								let target = ev.target;
  								target.options.color = target._color;
  								target._renderer._updateStyle(target);
  							})
  							.on('click', (ev) => {
  								L$9.DomEvent.stopPropagation(ev);
  								let dist = 1000,
  									target = ev.target,
  									latlng = ev.latlng,
  									ctrlKey = ev.originalEvent.ctrlKey,
  									dtp;
  								if (ctrlKey) { target.bringToBack(); }
  								target.options.items.forEach(pt => {
  									let cd = pt._latlng.distanceTo(latlng);
  									if (cd < dist) {
  										dist = cd;
  										dtp = pt;
  									}
  								});
  								if (dist < 10) {
  									setPopup$4(dtp.options.props);
  									popup$4.setLatLng(dtp._latlng).openOn(DtpHearthsTmp._map);
  								} else {
  									setPopup1$1(it);
  									popup1$1.setLatLng(latlng).openOn(DtpHearthsTmp._map);
  								}
  								
  								// console.log('popu666popen', dist, dtp);
  							});
  						arr.push(it._bounds);
  						arr = arr.concat(arr1);
  					}
  				});
  				
  				// let y = Math.floor(max_quarter),
  					// q = 1 + 4 * (max_quarter - y);
  				// argFilters = [{type: 'quarter', year: y, zn: q}];
  // console.log('opt', opt);
  				DtpHearthsTmp._opt = opt;
  				DtpHearthsTmp._group = L$9.layerGroup(arr);
  				if (argFilters$4) {
  					DtpHearthsTmp.setFilter(argFilters$4);
  				} else {
  					DtpHearthsTmp.addLayer(DtpHearthsTmp._group);
  				}
  				DtpHearthsTmp._refreshFilters();
  			});
  console.log('__allJson_____', allJson, DtpHearthsTmp._opt);
  		});
  });

  const L$a = window.L;

  const popup$5 = L$a.popup();
  const popup1$2 = L$a.popup({minWidth: 200});
  let argFilters$5;

  const setPopup$5 = function (props) {
  	let cont = L$a.DomUtil.create('div');
  	new DtpPopupVerifyed({
  		target: cont,
  		props: {
  			// popup: popup,
  			prp: props
  		}
  	});
  	popup$5.setContent(cont);
  	return cont;
  };

  const setPopup1$2 = function (props) {
  	let cont = L$a.DomUtil.create('div');
  	new DtpPopupHearths({
  		target: cont,
  		props: {
  			prp: props
  		}
  	});
  	popup1$2.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const DtpHearthsStat = L$a.featureGroup([]);
  DtpHearthsStat.setFilter = arg => {
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	DtpHearthsStat.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$5 = arg;

  	let arr = [];
  	if (DtpHearthsStat._group) {
  		DtpHearthsStat._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				cnt = 0;
  			argFilters$5.forEach(ft => {
  				if (ft.type === 'quarter') {
  					if (ft.zn[prp.year] && ft.zn[prp.year][prp.quarter]) {
  						cnt++;
  					}
  				} else if (ft.type === 'year') {
  					if (ft.zn[prp.year]) {
  						cnt++;
  					}
  				} else if (ft.type === 'str_icon_type') {
  					if (ft.zn.filter(pt => pt === prp.str_icon_type).length) {
  						cnt++;
  					}
  				} else if (ft.type === 'stricken') {
  					let zn = ft.zn;
  					if (!zn) {
  						cnt++;
  					} else if (zn === 1 && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 3 && prp.count_stricken && prp.count_lost) {
  						cnt++;								// С пострадавшими и погибшими
  					}
  				}
  			});
  			if (cnt === argFilters$5.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		DtpHearthsStat.addLayer(L$a.layerGroup(arr));
  		// DtpHearths._heat.setData({
  			// max: 8,
  			// data: DtpHearths._heatData
  		// });
  	}
  };

  DtpHearthsStat.on('remove', () => {
  	DtpHearthsStat.clearLayers();
  }).on('add', ev => {
  	let opt = {str_icon_type: {}, iconType: {}, years: {}, dtps: {}},
  		arr = [],
  		prefix = 'https://dtp.mvs.group/scripts/hearthsstat/';

  	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				json.forEach(it => {
  					let iconType = it.icon_type || 1,
  						list_bounds = L$a.latLngBounds(),
  						list_dtp = it.list_dtp,
  						stroke = false,
  						fillColor = '#FF0000'; //   19-20
  					if (list_dtp.length) {

  						let cy = Number(it.year),
  							cq = Number(it.quarter),
  							year = opt.years[it.year];
  						if (!year) {
  							year = opt.years[it.year] = {};
  						}
  						opt.years[it.year] = year;
  						let quarter = year[it.quarter];
  						if (it.quarter in year) {
  							quarter++;
  						} else {
  							quarter = year[it.quarter] = 1;
  						}
  						year[it.quarter] = quarter;
  						
  						let cTypeCount = opt.str_icon_type[it.str_icon_type];
  						if (!cTypeCount) {
  							cTypeCount = 1;
  						} else {
  							cTypeCount++;
  						}
  						opt.str_icon_type[it.str_icon_type] = cTypeCount;
  						opt.iconType[it.str_icon_type] = iconType;

  						if (iconType) {
  							stroke = iconType % 2 === 0 ? true : false; //  - смертельные ДТП
  							if (iconType === 1 || iconType === 2) {
  								fillColor = '#FFA500';
  							} else if (iconType === 3 || iconType === 4) {
  								fillColor = '#B8860B';
  							} else if (iconType === 5 || iconType === 6) {
  								fillColor = '#CD853F';
  							} else if (iconType === 7 || iconType === 8) {
  								fillColor = '#228B22';
  							} else if (iconType === 9 || iconType === 10) {
  								fillColor = '#FF8C00';
  							} else if (iconType === 11 || iconType === 12) {
  								fillColor = '#D2691E';
  							} else if (iconType === 13 || iconType === 14) {
  								fillColor = '#DEB887';
  							} else if (iconType === 15 || iconType === 16) {
  								fillColor = '#7B68EE';
  							} else if (iconType === 17 || iconType === 18) {
  								fillColor = '#2F4F4F';
  							}
  						}
  						let arr1 = list_dtp.map(prp => {
  							let iconType = prp.iconType || 0,
  								coords = prp.coords || {lat: 0, lon: 0},
  								latlng = L$a.latLng(coords.lat, coords.lon),
  								cur = [];

  							list_bounds.extend(latlng);

  							if (prp.id_skpdi) { cur.push({type: 'skpdi', id: prp.id_skpdi}); }
  							if (prp.id_stat) { cur.push({type: 'gibdd', id: prp.id_stat}); }
  							prp._cur = cur;

  							let dtps = opt.dtps[prp.id];
  							if (!dtps) {
  								dtps = {};
  								dtps[it.id] = 1;
  							} else if (!dtps[it.id]) {
  								dtps[it.id] = 1;
  							} else {
  								dtps[it.id]++;
  							}
  							opt.dtps[prp.id] = dtps;
  							return new CirclePoint(L$a.latLng(coords.lat, coords.lon), {
  									cluster: it,
  									props: prp,
  									radius: 6,
  									zIndexOffset: 50000,
  									rhomb: true,
  									stroke: stroke,
  									fillColor: fillColor,
  									// renderer: renderer
  								}).bindPopup(popup$5)
  								.on('popupopen', (ev) => {

  									setPopup$5(ev.target.options.props);
  									// console.log('popupopen', ev);
  								}).on('popupclose', (ev) => {
  									if (ev.popup._svObj) {
  										ev.popup._svObj.$destroy();
  										delete ev.popup._svObj;
  									}
  								});
  						});
  						it._bounds = L$a.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'})
  							.on('mouseover', (ev) => {
  								let target = ev.target;
  								target._color = target.options.color;
  								target.options.color = 'red';
  								target._renderer._updateStyle(target);
  							})
  							.on('mouseout', (ev) => {
  								let target = ev.target;
  								target.options.color = target._color;
  								target._renderer._updateStyle(target);
  							})
  							.on('click', (ev) => {
  								L$a.DomEvent.stopPropagation(ev);
  								let dist = 1000,
  									target = ev.target,
  									latlng = ev.latlng,
  									layerPoint = ev.layerPoint,
  									ctrlKey = ev.originalEvent.ctrlKey,
  									dtp;
  								if (ctrlKey) { target.bringToBack(); }
  								target.options.items.forEach(pt => {
  									let cd = pt._point.distanceTo(layerPoint);
  									if (cd < dist) {
  										dist = cd;
  										dtp = pt;
  									}
  								});
  								if (dist < 10) {
  									setPopup$5(dtp.options.props);
  									popup$5.setLatLng(dtp._latlng).openOn(DtpHearthsStat._map);
  								} else {
  									setPopup1$2(it);
  									popup1$2.setLatLng(latlng).openOn(DtpHearthsStat._map);
  								}
  								
  								// console.log('popu666popen', dist, dtp);
  							});
  						arr.push(it._bounds);
  						arr = arr.concat(arr1);
  					}
  				});
  				
  				// let y = Math.floor(max_quarter),
  					// q = 1 + 4 * (max_quarter - y);
  				// argFilters = [{type: 'quarter', year: y, zn: q}];
  // console.log('opt', opt);
  				DtpHearthsStat._opt = opt;
  				DtpHearthsStat._group = L$a.layerGroup(arr);
  				if (argFilters$5) {
  					DtpHearthsStat.setFilter(argFilters$5);
  				} else {
  					DtpHearthsStat.addLayer(DtpHearthsStat._group);
  				}
  				DtpHearthsStat._refreshFilters();
  			});
  console.log('__allJson_____', allJson, DtpHearthsStat._opt);
  		});
  });

  const L$b = window.L;

  const popup$6 = L$b.popup();
  let argFilters$6;

  // let renderer = L.canvas();
  const TestGraphQl = L$b.featureGroup([]);
  TestGraphQl._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
  TestGraphQl.checkZoom = z => {
  	if (Object.keys(TestGraphQl._layers).length) {
  		if (z < 12) {
  			TestGraphQl.setFilter(argFilters$6);
  		}
  	} else if (z > 11) {
  		TestGraphQl.setFilter(argFilters$6);
  	}
  };
  TestGraphQl.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	if (!TestGraphQl._map) { return; }
  	TestGraphQl.clearLayers();
  	argFilters$6 = arg || [];
  	TestGraphQl._argFilters = argFilters$6;

  	let arr = [], heat = [];
  	if (TestGraphQl._group) {
  		TestGraphQl._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$6.forEach(ft => {
  				if (ft.type === 'collision_type') {
  					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
  					// if (prp.collision_type === ft.zn) {
  						cnt++;
  					}
  				} else if (ft.type === 'list_rub') {
  					if (prp.list_rub.length) {
  						if (ft.zn.on) { cnt++; }
  					} else {
  						if (ft.zn.off) { cnt++; }
  					}
  				} else if (ft.type === 'date') {
  					if (prp.date >= ft.zn[0] && prp.date < ft.zn[1]) {
  						cnt++;
  					}
  				}
  			});
  			if (cnt === argFilters$6.length) {
  				arr.push(it);
  				heat.push(it._latlng);
  			}
  		});
  		// if (false &&  TestGraphQl._needHeat) {
  			// TestGraphQl._map.addLayer(TestGraphQl._heat);
  			// TestGraphQl._heat.setLatLngs(heat);
  			// TestGraphQl._heat.setOptions(TestGraphQl._needHeat);
  			// if (TestGraphQl._map._zoom > 11) {
  				// TestGraphQl.addLayer(L.layerGroup(arr));
  			// }
  		// } else {
  			TestGraphQl.addLayer(L$b.layerGroup(arr));
  			// TestGraphQl._map.removeLayer(TestGraphQl._heat);
  		// }

  	}
  };
  TestGraphQl.on('remove', (ev) => {
  	// TestGraphQl._needHeat = null;
  	// TestGraphQl._map.removeLayer(TestGraphQl._heat);
  	TestGraphQl.clearLayers();
  }).on('add', ev => {
  	// console.log('/static/data/dtpskpdi.geojson', ev);
  	// TestGraphQl._heat = L.heatLayer([], {
  		// gradient: {0.1: 'blue', 0.4: 'lime', 1: 'red'}
  	// });
  	fetch("https://dtp.mvs.group/static/proxy.php?url=https://graphql.dev.mvs.group/graphql", {
  	  // "headers": {
  		// "accept": "*/*",
  		// "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  		// "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2FsZWtzZWV2IiwiZXhwIjoxNTkyODkxNTQwLCJ1c2VyX2lkIjoyOTAwLCJsb2dpbiI6InNhbGVrc2VldiIsImNuIjoi0JDQu9C10LrRgdC10LXQsiDQodC10YDQs9C10LkiLCJkYl9yaWdodHMiOltdLCJpYXQiOjE1OTI4MDUxNDAsImF1ZCI6InBvc3RncmFwaGlsZSIsImlzcyI6InBvc3RncmFwaGlsZSJ9.6aEl6xSJUCYxokUawioJS5sMkNSwiVzJiBr2w8Yvvfo",
  		// "cache-control": "no-cache",
  		// "content-type": "application/json",
  		// "pragma": "no-cache",
  		// "sec-fetch-dest": "empty",
  		// "sec-fetch-mode": "cors",
  		// "sec-fetch-site": "same-site"
  	  // },
  	  // "referrer": "https://inv.dev.mvs.group/map/main-map",
  	  // "referrerPolicy": "no-referrer-when-downgrade",
  	  "body": "{\"operationName\":null,\"variables\":{},\"query\":\"{\\n  allVMapLineInfos(filter: {lon: {isNull: false}, lat: {isNull: false}}) {\\n    totalCount\\n    nodes {\\n      lineSid: sid\\n      lineName: name\\n      lineAddress: address\\n      roadName\\n      stage\\n      lat\\n      lon\\n      yield\\n      complexes\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
  	  "method": "POST",
  	  "mode": "cors"
  	  // ,
  	  // "credentials": "include"
  	})

  	// fetch('https://dtp.mvs.group/scripts/dtprubez/get_stat_gipdd_with_rub.txt', {})
  		.then(req => req.json())
  		.then(json => {
  console.log('json', json);
  return;
  			// TestGraphQl._refreshFilters();
  		});
  });

  const L$c = window.L;

  const popup$7 = L$c.popup({maxWidth: 740});
  let argFilters$7;
  let curCam = 0;
  const setPopup$6 = function (prp) {
  	let cams = prp.cams || [];
  	let cont = L$c.DomUtil.create('div', 'contVideo');
  	let list = L$c.DomUtil.create('div', 'list', cont);
  	let videoCont = L$c.DomUtil.create('div', 'videoCont', cont);
  	let setVideo = (ind) => {
  		videoCont.innerHTML = '';
  		curCam = ind;
  		let curCamPrp = cams.length > curCam ? cams[curCam] : {};
  		let video = L$c.DomUtil.create('video', 'video', videoCont);
  		// video.setAttribute('controls', true);
  			// <video id="videoPlayer" controls></video>
  		// var url = 'https://dtp.mvs.group/static/proxy.php?url=http:' + curCamPrp.video;
  		var url = curCamPrp.video; // "//172.16.74.29/aps017_c1/index.mpd";
  		var player = dashjs.MediaPlayer().create();
  		player.initialize(video, url, true);
  	};
  	let prev;
  	cams.forEach((it, ind) => {
  		let button = L$c.DomUtil.create('button', '', list);
  		if (!ind) {
  			button.classList.add('active');
  			prev = button;
  		}
  		button.textContent = it.name || 'Камера';
  		L$c.DomEvent.on(button, 'click', () => {
  			setVideo(ind);
  			prev.classList.remove('active');
  			button.classList.add('active');
  			prev = button;
  		});
  		
  		
  	});
  	if (cams.length > curCam) {
  		setVideo(0);
  	} else {
  		cont.innerHTML = 'Камеры отсутствуют!';
  	}
  	popup$7.setContent(cont);
  /*
  	fetch(url, {})
  		.then(req => req.json())
  		.then(json => {
  // console.log('bindPopup', layer, json, DtpPopup);
  			let cont = L.DomUtil.create('div');
  			const app = new DtpPopup({
  				target: cont,
  				props: {
  					prp: json
  				}
  			});
  			popup._svObj = app;
  			popup.setContent(cont);
  		});
  	return '';
  	*/
  };

  // let renderer = L.canvas();
  const Itc = L$c.featureGroup([]);
  Itc._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
  Itc.checkZoom = z => {
  	if (Object.keys(Itc._layers).length) {
  		if (z < 12) {
  			Itc.setFilter(argFilters$7);
  		}
  	} else if (z > 11) {
  		Itc.setFilter(argFilters$7);
  	}
  };
  Itc.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	if (!Itc._map) { return; }
  	Itc.clearLayers();
  	argFilters$7 = arg || [];
  	Itc._argFilters = argFilters$7;

  	let arr = [], heat = [];
  	if (Itc._group) {
  		Itc._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$7.forEach(ft => {
  				if (ft.type === 'collision_type') {
  					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
  					// if (prp.collision_type === ft.zn) {
  						cnt++;
  					}
  				} else if (ft.type === 'list_rub') {
  					if (prp.list_rub.length) {
  						if (ft.zn.on) { cnt++; }
  					} else {
  						if (ft.zn.off) { cnt++; }
  					}
  				} else if (ft.type === 'date') {
  					if (prp.date >= ft.zn[0] && prp.date < ft.zn[1]) {
  						cnt++;
  					}
  				}
  			});
  			if (cnt === argFilters$7.length) {
  				arr.push(it);
  				heat.push(it._latlng);
  			}
  		});
  		// if (false &&  Itc._needHeat) {
  			// Itc._map.addLayer(Itc._heat);
  			// Itc._heat.setLatLngs(heat);
  			// Itc._heat.setOptions(Itc._needHeat);
  			// if (Itc._map._zoom > 11) {
  				// Itc.addLayer(L.layerGroup(arr));
  			// }
  		// } else {
  			Itc.addLayer(L$c.layerGroup(arr));
  			// Itc._map.removeLayer(Itc._heat);
  		// }

  	}
  };
  Itc.on('remove', (ev) => {
  	// Itc._needHeat = null;
  	// Itc._map.removeLayer(Itc._heat);
  	Itc.clearLayers();
  }).on('add', ev => {
  	// console.log('/static/data/dtpskpdi.geojson', ev);
  	fetch('./static/itc.geojson', {})
  		.then(req => req.json())
  		.then(json => {
  console.log('json', json);
  // return;
  			let arr = json.map(prp => {
  				let iconType = prp.iconType || 0,
  					stroke = false,
  					fillColor = '#2F4F4F'; //   17-20

  if (!prp.lat || !prp.lon) {
  console.log('_______', prp);
  	prp.lat = prp.lon = 0;
  }
  				let latLng = L$c.latLng(prp.lat, prp.lon,  0.5);

  				return new CirclePoint(latLng, {
  					props: prp,
  					radius: 6,
  					// box: true,
  					stroke: stroke,
  					fillColor: fillColor,
  					// renderer: renderer
  				}).bindPopup(popup$7).on('popupopen', (ev) => {
  						setPopup$6(ev.target.options.props);
  						// console.log('popupopen', ev);
  					}).on('popupclose', (ev) => {
  						// console.log('popupclose', ev);
  						// ev.popup.setContent('');
  						if (ev.popup._svObj) {
  							ev.popup._svObj.$destroy();
  							delete ev.popup._svObj;
  						}
  					});
  			});
  			Itc._group = L$c.layerGroup(arr);

  			if (argFilters$7) {
  				Itc.setFilter(argFilters$7);
  			} else {
  				Itc.addLayer(Itc._group);
  			}
  			// Itc._refreshFilters();
  		});
  });

  const L$d = window.L;
  const map = L$d.map(document.body, {
  	center: [55.758031, 37.611694],
  	minZoom: 1,
  	zoom: 8,
  	maxZoom: 21,
  	// zoomControl: false,
  	attributionControl: false,
  	trackResize: true,
  	fadeAnimation: true,
  	zoomAnimation: true,
  	distanceUnit: 'auto',
  	squareUnit: 'auto',
  });

  var corners = map._controlCorners,
  	parent = map._controlContainer,
  	tb = 'leaflet-top leaflet-bottom',
  	lr = 'leaflet-left leaflet-right',
  	classNames = {
  		bottom: 'leaflet-bottom ' + lr,
  		gmxbottomleft: 'leaflet-bottom leaflet-left',
  		gmxbottomcenter: 'leaflet-bottom ' + lr,
  		gmxbottomright: 'leaflet-bottom leaflet-right',
  		center: tb + ' ' + lr,
  		right:  'leaflet-right ' + tb,
  		left:   'leaflet-left ' + tb,
  		top:    'leaflet-top ' + lr
  	};

  for (var key in classNames) {
  	if (!corners[key]) {
  		corners[key] = L$d.DomUtil.create('div', classNames[key], parent);
  	}
  }

  map.addControl(L$d.control.gmxCenter())
  	.addControl(L$d.control.fitCenter());
  /*
  var cfg = {
  	// radius should be small ONLY if scaleRadius is true (or small radius is intended)
  	// "radius": 2,
  	"radius": 15,
  	// "radius": 5,
  	"maxOpacity": .8, 
  	// scales the radius based on map zoom
  	// "scaleRadius": true, 
  	// if set to false the heatmap uses the global maximum for colorization
  	// if activated: uses the data maximum within the current map boundaries 
  	//   (there will always be a red spot with useLocalExtremas true)
  	"useLocalExtrema": true,
  	// which field name in your data represents the latitude - default "lat"
  	latField: 'lat',
  	// which field name in your data represents the longitude - default "lng"
  	lngField: 'lng',
  	// which field name in your data represents the data value - default "value"
  	valueField: 'count'
  };

  var heatmapLayer = new HeatmapOverlay(cfg);
  // heatmapLayer.setData(testData);
  // map.addLayer(heatmapLayer);
  DtpVerifyed._heat = heatmapLayer;
  */
  var Mercator = L$d.TileLayer.extend({
  	options: {
  		tilesCRS: L$d.CRS.EPSG3395
  	},
  	_getTiledPixelBounds: function (center) {
  		var pixelBounds = L$d.TileLayer.prototype._getTiledPixelBounds.call(this, center);
  		this._shiftY = this._getShiftY(this._tileZoom);
  		pixelBounds.min.y += this._shiftY;
  		pixelBounds.max.y += this._shiftY;
  		return pixelBounds;
  	},
  	_tileOnError: function (done, tile, e) {
  		var file = tile.getAttribute('src'),
  			pos = file.indexOf('/mapcache/');

  		if (pos > -1) {
  			var searchParams = new URL('http:' + file).searchParams,
  				arr = file.substr(pos + 1).split('/'),
  				pItem  = proxy[arr[1]];

  			tile.src = L$d.Util.template(pItem.errorTileUrlPrefix + pItem.postfix, {
  				z: searchParams.get('z'),
  				x: searchParams.get('x'),
  				y: searchParams.get('y')
  			});
  		}
  		done(e, tile);
  	},
  	_getTilePos: function (coords) {
  		var tilePos = L$d.TileLayer.prototype._getTilePos.call(this, coords);
  		return tilePos.subtract([0, this._shiftY]);
  	},

  	_getShiftY: function(zoom) {
  		var map = this._map,
  			pos = map.getCenter(),
  			shift = (map.options.crs.project(pos).y - this.options.tilesCRS.project(pos).y);

  		return Math.floor(L$d.CRS.scale(zoom) * shift / 40075016.685578496);
  	}
  });
  L$d.TileLayer.Mercator = Mercator;
  L$d.tileLayer.Mercator = function (url, options) {
  	return new Mercator(url, options);
  };

  let baseLayers = {};
  if (!hrefParams.b) { hrefParams.b = 'm2'; }
  ['m2', 'm3'].forEach(key => {
  	let it = proxy[key],
  		lit = L$d.tileLayer.Mercator(it.prefix + it.postfix, it.options);
  	baseLayers[it.title] = lit;
  	if (hrefParams.b === it.options.key) { lit.addTo(map); }
  });
  baseLayers.OpenStreetMap = L$d.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  	maxZoom: 21,
  	maxNativeZoom: 18
  });

  DtpVerifyed._arm = {};
  let overlays = {
  	'Камеры ИТС': Itc,
  	'TestGraphQl': TestGraphQl,
  	'Очаги ГИБДД': DtpHearthsStat, //.addTo(map),
  	// 'ДТП Очаги(tmp)': DtpHearthsTmp,
  	// 'ДТП Очаги': DtpHearths,
  	'ДТП Сводный': DtpVerifyed,
  	// 'ДТП СКПДИ': DtpSkpdi,
  	'ДТП ГИБДД': DtpGibdd,
  	// polygon: L.polygon([[55.05, 37],[55.03, 41],[52.05, 41],[52.04, 37]], {color: 'red'})
  };
  let ovHash = hrefParams.o ? hrefParams.o.split(',').reduce((p, c) => {p[c] = true; return p;}, {}) : {};
  ['m1', 'm4', 'm5'].forEach(key => {
  	let it = proxy[key],
  		lit = L$d.tileLayer.Mercator(it.prefix + it.postfix, it.options);
  	overlays[it.title] = lit;
  	if (ovHash[it.options.key]) { lit.addTo(map); }
  });
  L$d.control.layers(baseLayers, overlays).addTo(map);

  let filtersControl = L$d.control.gmxIcon({
    id: 'filters',
    className: 'leaflet-bar',
    togglable: true,
    title: 'Фильтры'
  })
  .on('statechange', function (ev) {
  	console.log({filtersIcon: ev.target.options.isActive});
  	let target = ev.target,
  		cont = target._container,
  		cont1 = target._win,
  		isActive = target.options.isActive;
  		
  	if (isActive) {
  		if (!cont1) {
  			cont1 = target._win = L$d.DomUtil.create('div', 'win leaflet-control-layers', cont);
  			// cont1.innerHTML = 'Слой "ДТП Сводный"';
  			L$d.DomEvent.disableScrollPropagation(cont1);
  			cont1._Filters = new DtpVerifyedFilters({
  				target: cont1,
  				props: {
  					DtpGibdd: DtpGibdd,
  					DtpSkpdi: DtpSkpdi,
  					DtpHearthsStat: DtpHearthsStat,
  					DtpHearthsTmp: DtpHearthsTmp,
  					DtpHearths: DtpHearths,
  					DtpVerifyed: DtpVerifyed
  				}
  			});
  		}

  		// target._win.classList.remove('hidden');
  	} else {
  		target._win.parentNode.removeChild(target._win);
  		// target._win.classList.add('hidden');
  		target._win = null;
  	}

  }).addTo(map);

  const refreshFilters = () => {
  	setTimeout(() => {
  		if (filtersControl.options.isActive) {
  			filtersControl.setActive(false);
  			filtersControl._win = null;
  			filtersControl.setActive(true);
  		}
  	});
  };
  DtpGibdd._refreshFilters =
  DtpSkpdi._refreshFilters =
  DtpVerifyed._refreshFilters =
  DtpHearths._refreshFilters =
  DtpHearthsStat._refreshFilters =
  DtpHearthsTmp._refreshFilters = refreshFilters;

  const eventsStr = 'remove';
  DtpGibdd.on(eventsStr, refreshFilters);
  DtpSkpdi.on(eventsStr, refreshFilters);
  DtpVerifyed.on(eventsStr, refreshFilters);
  DtpHearths.on(eventsStr, refreshFilters);
  DtpHearthsTmp.on(eventsStr, refreshFilters);
  DtpHearthsStat.on(eventsStr, refreshFilters);

  return map;

}());
//# sourceMappingURL=arm.js.map
