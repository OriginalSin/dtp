
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
  		options: {
  			key: 'm4',
  			minZoom: 12,
  			maxZoom: 19,
  			attribution: yandex,
  		}
  	},
  	m6: {
  		title: 'Дороги в стадии строительства',
  		prefix: prefix + 'm6/',
  		postfix: '?x={x}&y={y}&z={z}&l=mpskl&sl=301142,301135,70300289',
  		errorTileUrlPrefix: '//03.core-nmaps-renderer-nmaps.maps.yandex.net/tile',
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

  const chkStricken = (it, opt) => {
  	let lost = it.count_lost,
  		stricken = it.count_stricken;
  	if (!stricken && lost) {			// Только с погибшими
  		opt.stricken[1] = 1 + (opt.stricken[1] || 0);
  	}
  	if (stricken && !lost) {			// Только с пострадавшими
  		opt.stricken[2] = 1 + (opt.stricken[2] || 0);
  	}

  	if (stricken || lost) {				// С пострадавшими или погибшими
  		opt.stricken[3] = 1 + (opt.stricken[3] || 0);
  	}
  	if (stricken && lost) {				// С пострадавшими и погибшими
  		opt.stricken[4] = 1 + (opt.stricken[4] || 0);
  	}
  };

  const distVincenty$1 = (latlng1, latlng2) => {
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

  const getLatLngsLength = (latlngs) => {
  	latlngs = latlngs || [];
  	let	dist = 0,
  		latlng = latlngs[0];
  	latlngs.forEach( it => {
  		dist += distVincenty$1(it, latlng);
  		latlng = it;
  	});
  	return dist;
  };

  const myRenderer = L.canvas();

  const L$4 = window.L;

  let renderer = L$4.canvas();

  const distVincenty$2 = (latlng1, latlng2) => {
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
  		metersPerPixel = Math.pow(2, -z) * 156543.033928041 * distVincenty$2(pos, pos1) / 50;
  	return metersPerPixel;
  };

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

  // const myRenderer = L.canvas({padding: 0.5});
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

  const MarkerPoint = L$4.CircleMarker.extend({
    _updatePath: function () {
      this._renderer._updateMarkerPoint(this);
    }
  });
  const CirclePoint = L$4.CircleMarker.extend({
  	options: {
  		renderer: myRenderer
  	},
    _updatePath: function () {
      this._renderer._updateCirclePoint(this);
    }
  });
  const Bbox = L$4.Rectangle.extend({
  	options: {
  		renderer: myRenderer
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

  /* src\DtpPopupDps.svelte generated by Svelte v3.20.1 */

  const { console: console_1 } = globals;
  const file$1 = "src\\DtpPopupDps.svelte";

  function create_fragment$1(ctx) {
  	let div2;
  	let div0;
  	let t0_value = /*prp*/ ctx[0].title + "";
  	let t0;
  	let br0;
  	let t1;
  	let div1;
  	let t2_value = /*prp*/ ctx[0].address + "";
  	let t2;
  	let br1;
  	let t3_value = /*prp*/ ctx[0].contact + "";
  	let t3;

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			t0 = text(t0_value);
  			br0 = element("br");
  			t1 = space();
  			div1 = element("div");
  			t2 = text(t2_value);
  			br1 = element("br");
  			t3 = text(t3_value);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$1, 33, 2, 909);
  			add_location(br0, file$1, 33, 38, 945);
  			add_location(br1, file$1, 34, 36, 986);
  			attr_dev(div1, "class", "address svelte-1ve8gqw");
  			add_location(div1, file$1, 34, 2, 952);
  			attr_dev(div2, "class", "mvsPopup svelte-1ve8gqw");
  			add_location(div2, file$1, 32, 1, 884);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div0, t0);
  			append_dev(div2, br0);
  			append_dev(div2, t1);
  			append_dev(div2, div1);
  			append_dev(div1, t2);
  			append_dev(div1, br1);
  			append_dev(div1, t3);
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 1 && t0_value !== (t0_value = /*prp*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 1 && t2_value !== (t2_value = /*prp*/ ctx[0].address + "")) set_data_dev(t2, t2_value);
  			if (dirty & /*prp*/ 1 && t3_value !== (t3_value = /*prp*/ ctx[0].contact + "")) set_data_dev(t3, t3_value);
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
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
  	let { prp = {} } = $$props;
  	let current = 0;

  	const copyParent = ev => {
  		navigator.clipboard.writeText(ev.target.parentNode.textContent).catch(err => {
  			console.log("Something went wrong", err);
  		});
  	};

  	const onClick = ev => {
  		let target = ev.target,
  			arr = (/tab (\d)/).exec(target.className),
  			nm = arr && arr.length === 2 ? arr[1] : 0,
  			prn = target.parentNode;

  		for (let i = 0, len = prn.childNodes.length; i < len; i++) {
  			let node = prn.childNodes[i];

  			if (node.classList) {
  				let active = node.classList.contains(nm);

  				if (node.tagName === "BUTTON") {
  					node.classList[active ? "add" : "remove"]("active");
  				} else if (node.tagName === "TABLE") {
  					node.classList[active ? "remove" : "add"]("hidden");
  				}
  			}
  		}
  	}; // let target = ev.target.classList.remove
  	// console.log('setComplex ', prn.childNodes);

  	const writable_props = ["prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<DtpPopupDps> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupDps", $$slots, []);

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({ prp, current, copyParent, onClick });

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("current" in $$props) current = $$props.current;
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [prp];
  }

  class DtpPopupDps extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$1, create_fragment$1, safe_not_equal, { prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupDps",
  			options,
  			id: create_fragment$1.name
  		});
  	}

  	get prp() {
  		throw new Error("<DtpPopupDps>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupDps>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  /* src\DtpPopupEvnt.svelte generated by Svelte v3.20.1 */

  const { console: console_1$1 } = globals;
  const file$2 = "src\\DtpPopupEvnt.svelte";

  function create_fragment$2(ctx) {
  	let div2;
  	let div0;
  	let t0;
  	let br;
  	let t1;
  	let t2_value = (/*prp*/ ctx[0].kind || "") + "";
  	let t2;
  	let t3;
  	let t4;
  	let div1;
  	let table;
  	let tbody;
  	let tr0;
  	let td0;
  	let t6;
  	let td1;
  	let t7_value = (/*prp*/ ctx[0].type || "") + "";
  	let t7;
  	let t8;
  	let tr1;
  	let td2;
  	let t10;
  	let td3;
  	let t11_value = (/*prp*/ ctx[0].id || "") + "";
  	let t11;
  	let t12;
  	let tr2;
  	let td4;
  	let t14;
  	let td5;
  	let t15_value = (/*prp*/ ctx[0].status || "") + "";
  	let t15;
  	let t16;
  	let tr3;
  	let td6;
  	let t18;
  	let td7;
  	let t19_value = /*getDate*/ ctx[3](/*prp*/ ctx[0].date_created) + "";
  	let t19;
  	let t20;
  	let tr4;
  	let td8;
  	let t22;
  	let td9;
  	let t23_value = /*getDate*/ ctx[3](/*prp*/ ctx[0].date_finish_fact) + "";
  	let t23;
  	let t24;
  	let tr5;
  	let td10;
  	let t26;
  	let td11;
  	let t27_value = /*coords*/ ctx[2].lat + "";
  	let t27;
  	let t28;
  	let t29_value = /*coords*/ ctx[2].lon + "";
  	let t29;
  	let t30;
  	let span;
  	let t31;
  	let tr6;
  	let td12;
  	let t33;
  	let td13;
  	let t34_value = (/*prp*/ ctx[0].id_dtp || "") + "";
  	let t34;
  	let t35;
  	let tr7;
  	let td14;
  	let t37;
  	let td15;
  	let t38_value = (/*prp*/ ctx[0].description || "") + "";
  	let t38;
  	let dispose;

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			t0 = text("Мероприятие");
  			br = element("br");
  			t1 = text("(");
  			t2 = text(t2_value);
  			t3 = text(")");
  			t4 = space();
  			div1 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Тип мероприятия:";
  			t6 = space();
  			td1 = element("td");
  			t7 = text(t7_value);
  			t8 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "ID:";
  			t10 = space();
  			td3 = element("td");
  			t11 = text(t11_value);
  			t12 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Статус:";
  			t14 = space();
  			td5 = element("td");
  			t15 = text(t15_value);
  			t16 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Дата добавления:";
  			t18 = space();
  			td7 = element("td");
  			t19 = text(t19_value);
  			t20 = space();
  			tr4 = element("tr");
  			td8 = element("td");
  			td8.textContent = "Дата завершения:";
  			t22 = space();
  			td9 = element("td");
  			t23 = text(t23_value);
  			t24 = space();
  			tr5 = element("tr");
  			td10 = element("td");
  			td10.textContent = "Координаты:";
  			t26 = space();
  			td11 = element("td");
  			t27 = text(t27_value);
  			t28 = space();
  			t29 = text(t29_value);
  			t30 = space();
  			span = element("span");
  			t31 = space();
  			tr6 = element("tr");
  			td12 = element("td");
  			td12.textContent = "ID ДТП СКПДИ:";
  			t33 = space();
  			td13 = element("td");
  			t34 = text(t34_value);
  			t35 = space();
  			tr7 = element("tr");
  			td14 = element("td");
  			td14.textContent = "Описание:";
  			t37 = space();
  			td15 = element("td");
  			t38 = text(t38_value);
  			add_location(br, file$2, 17, 32, 485);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$2, 17, 2, 455);
  			attr_dev(td0, "class", "first svelte-1ve8gqw");
  			add_location(td0, file$2, 22, 5, 594);
  			add_location(td1, file$2, 23, 5, 639);
  			add_location(tr0, file$2, 21, 3, 584);
  			attr_dev(td2, "class", "first svelte-1ve8gqw");
  			add_location(td2, file$2, 26, 5, 687);
  			add_location(td3, file$2, 27, 5, 719);
  			add_location(tr1, file$2, 25, 3, 677);
  			attr_dev(td4, "class", "first svelte-1ve8gqw");
  			add_location(td4, file$2, 30, 5, 765);
  			add_location(td5, file$2, 31, 5, 801);
  			add_location(tr2, file$2, 29, 3, 755);
  			attr_dev(td6, "class", "first svelte-1ve8gqw");
  			add_location(td6, file$2, 34, 5, 851);
  			add_location(td7, file$2, 35, 5, 896);
  			add_location(tr3, file$2, 33, 3, 841);
  			attr_dev(td8, "class", "first svelte-1ve8gqw");
  			add_location(td8, file$2, 38, 5, 955);
  			add_location(td9, file$2, 39, 5, 1000);
  			add_location(tr4, file$2, 37, 3, 945);
  			attr_dev(td10, "class", "first svelte-1ve8gqw");
  			add_location(td10, file$2, 42, 5, 1063);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$2, 43, 35, 1133);
  			add_location(td11, file$2, 43, 5, 1103);
  			add_location(tr5, file$2, 41, 3, 1053);
  			attr_dev(td12, "class", "first svelte-1ve8gqw");
  			add_location(td12, file$2, 46, 5, 1261);
  			add_location(td13, file$2, 47, 5, 1303);
  			add_location(tr6, file$2, 45, 3, 1251);
  			attr_dev(td14, "class", "first svelte-1ve8gqw");
  			add_location(td14, file$2, 50, 5, 1353);
  			add_location(td15, file$2, 51, 5, 1391);
  			add_location(tr7, file$2, 49, 3, 1343);
  			add_location(tbody, file$2, 20, 3, 573);
  			attr_dev(table, "class", "table svelte-1ve8gqw");
  			add_location(table, file$2, 19, 4, 548);
  			attr_dev(div1, "class", "featureCont");
  			add_location(div1, file$2, 18, 2, 518);
  			attr_dev(div2, "class", "mvsPopup svelte-1ve8gqw");
  			add_location(div2, file$2, 16, 1, 430);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div0, t0);
  			append_dev(div0, br);
  			append_dev(div0, t1);
  			append_dev(div0, t2);
  			append_dev(div0, t3);
  			append_dev(div2, t4);
  			append_dev(div2, div1);
  			append_dev(div1, table);
  			append_dev(table, tbody);
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t6);
  			append_dev(tr0, td1);
  			append_dev(td1, t7);
  			append_dev(tbody, t8);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t10);
  			append_dev(tr1, td3);
  			append_dev(td3, t11);
  			append_dev(tbody, t12);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t14);
  			append_dev(tr2, td5);
  			append_dev(td5, t15);
  			append_dev(tbody, t16);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, t18);
  			append_dev(tr3, td7);
  			append_dev(td7, t19);
  			append_dev(tbody, t20);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td8);
  			append_dev(tr4, t22);
  			append_dev(tr4, td9);
  			append_dev(td9, t23);
  			append_dev(tbody, t24);
  			append_dev(tbody, tr5);
  			append_dev(tr5, td10);
  			append_dev(tr5, t26);
  			append_dev(tr5, td11);
  			append_dev(td11, t27);
  			append_dev(td11, t28);
  			append_dev(td11, t29);
  			append_dev(td11, t30);
  			append_dev(td11, span);
  			append_dev(tbody, t31);
  			append_dev(tbody, tr6);
  			append_dev(tr6, td12);
  			append_dev(tr6, t33);
  			append_dev(tr6, td13);
  			append_dev(td13, t34);
  			append_dev(tbody, t35);
  			append_dev(tbody, tr7);
  			append_dev(tr7, td14);
  			append_dev(tr7, t37);
  			append_dev(tr7, td15);
  			append_dev(td15, t38);
  			if (remount) dispose();
  			dispose = listen_dev(span, "click", /*copyParent*/ ctx[1], false, false, false);
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 1 && t2_value !== (t2_value = (/*prp*/ ctx[0].kind || "") + "")) set_data_dev(t2, t2_value);
  			if (dirty & /*prp*/ 1 && t7_value !== (t7_value = (/*prp*/ ctx[0].type || "") + "")) set_data_dev(t7, t7_value);
  			if (dirty & /*prp*/ 1 && t11_value !== (t11_value = (/*prp*/ ctx[0].id || "") + "")) set_data_dev(t11, t11_value);
  			if (dirty & /*prp*/ 1 && t15_value !== (t15_value = (/*prp*/ ctx[0].status || "") + "")) set_data_dev(t15, t15_value);
  			if (dirty & /*prp*/ 1 && t19_value !== (t19_value = /*getDate*/ ctx[3](/*prp*/ ctx[0].date_created) + "")) set_data_dev(t19, t19_value);
  			if (dirty & /*prp*/ 1 && t23_value !== (t23_value = /*getDate*/ ctx[3](/*prp*/ ctx[0].date_finish_fact) + "")) set_data_dev(t23, t23_value);
  			if (dirty & /*prp*/ 1 && t34_value !== (t34_value = (/*prp*/ ctx[0].id_dtp || "") + "")) set_data_dev(t34, t34_value);
  			if (dirty & /*prp*/ 1 && t38_value !== (t38_value = (/*prp*/ ctx[0].description || "") + "")) set_data_dev(t38, t38_value);
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  			dispose();
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
  	let { prp } = $$props;

  	const copyParent = ev => {
  		navigator.clipboard.writeText(ev.target.parentNode.textContent).catch(err => {
  			console.log("Something went wrong", err);
  		});
  	};

  	let coords = prp.coords[0] || { lat: prp.lat, lon: prp.lon };

  	const getDate = time => {
  		if (!time) {
  			return "";
  		}

  		let d = new Date(time * 1000);
  		return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  	};

  	const writable_props = ["prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<DtpPopupEvnt> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupEvnt", $$slots, []);

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({ prp, copyParent, coords, getDate });

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("coords" in $$props) $$invalidate(2, coords = $$props.coords);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [prp, copyParent, coords, getDate];
  }

  class DtpPopupEvnt extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$2, create_fragment$2, safe_not_equal, { prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupEvnt",
  			options,
  			id: create_fragment$2.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$1.warn("<DtpPopupEvnt> was created without expected prop 'prp'");
  		}
  	}

  	get prp() {
  		throw new Error("<DtpPopupEvnt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupEvnt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  /* src\DtpPopupGibdd.svelte generated by Svelte v3.20.1 */

  const { console: console_1$2 } = globals;
  const file$3 = "src\\DtpPopupGibdd.svelte";

  function get_each_context$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[12] = list[i];
  	return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[12] = list[i];
  	return child_ctx;
  }

  function get_each_context_3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[12] = list[i];
  	return child_ctx;
  }

  function get_each_context_2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[17] = list[i];
  	return child_ctx;
  }

  // (136:6) {#if pt.ts}
  function create_if_block_7(ctx) {
  	let li;
  	let t_value = /*pt*/ ctx[17].ts + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$3, 135, 17, 3283);
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
  		source: "(136:6) {#if pt.ts}",
  		ctx
  	});

  	return block;
  }

  // (138:7) {#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}
  function create_if_block_6(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[12].k_uch + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$3, 137, 52, 3385);
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
  		source: "(138:7) {#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}",
  		ctx
  	});

  	return block;
  }

  // (139:7) {#if pt1.npdd}
  function create_if_block_5(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[12].npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$3, 138, 21, 3432);
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
  		source: "(139:7) {#if pt1.npdd}",
  		ctx
  	});

  	return block;
  }

  // (140:7) {#if pt1.sop_npdd}
  function create_if_block_4(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[12].sop_npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$3, 139, 25, 3482);
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
  		source: "(140:7) {#if pt1.sop_npdd}",
  		ctx
  	});

  	return block;
  }

  // (137:6) {#each pt.arr as pt1}
  function create_each_block_3(ctx) {
  	let t0;
  	let t1;
  	let if_block2_anchor;
  	let if_block0 = /*pt1*/ ctx[12].k_uch && (/*pt1*/ ctx[12].npdd || /*pt1*/ ctx[12].sop_npdd) && create_if_block_6(ctx);
  	let if_block1 = /*pt1*/ ctx[12].npdd && create_if_block_5(ctx);
  	let if_block2 = /*pt1*/ ctx[12].sop_npdd && create_if_block_4(ctx);

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
  			if (/*pt1*/ ctx[12].k_uch && (/*pt1*/ ctx[12].npdd || /*pt1*/ ctx[12].sop_npdd)) if_block0.p(ctx, dirty);
  			if (/*pt1*/ ctx[12].npdd) if_block1.p(ctx, dirty);
  			if (/*pt1*/ ctx[12].sop_npdd) if_block2.p(ctx, dirty);
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
  		id: create_each_block_3.name,
  		type: "each",
  		source: "(137:6) {#each pt.arr as pt1}",
  		ctx
  	});

  	return block;
  }

  // (135:5) {#each tsInfoArr as pt}
  function create_each_block_2(ctx) {
  	let t;
  	let each_1_anchor;
  	let if_block = /*pt*/ ctx[17].ts && create_if_block_7(ctx);
  	let each_value_3 = /*pt*/ ctx[17].arr;
  	validate_each_argument(each_value_3);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_3.length; i += 1) {
  		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
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
  			if (/*pt*/ ctx[17].ts) if_block.p(ctx, dirty);

  			if (dirty & /*tsInfoArr*/ 64) {
  				each_value_3 = /*pt*/ ctx[17].arr;
  				validate_each_argument(each_value_3);
  				let i;

  				for (i = 0; i < each_value_3.length; i += 1) {
  					const child_ctx = get_each_context_3(ctx, each_value_3, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_3(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_3.length;
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
  		id: create_each_block_2.name,
  		type: "each",
  		source: "(135:5) {#each tsInfoArr as pt}",
  		ctx
  	});

  	return block;
  }

  // (149:4) {#if prp.spog}
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
  			add_location(div0, file$3, 150, 6, 3695);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$3, 150, 40, 3729);
  			add_location(div2, file$3, 149, 5, 3683);
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
  		source: "(149:4) {#if prp.spog}",
  		ctx
  	});

  	return block;
  }

  // (154:4) {#if prp.s_pch}
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
  			add_location(div0, file$3, 155, 6, 3823);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$3, 155, 42, 3859);
  			add_location(div2, file$3, 154, 5, 3811);
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
  		source: "(154:4) {#if prp.s_pch}",
  		ctx
  	});

  	return block;
  }

  // (159:4) {#if prp.osv}
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
  			add_location(div0, file$3, 160, 6, 3952);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$3, 160, 46, 3992);
  			add_location(div2, file$3, 159, 5, 3940);
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
  		source: "(159:4) {#if prp.osv}",
  		ctx
  	});

  	return block;
  }

  // (164:4) {#if prp.ndu}
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
  			add_location(div0, file$3, 165, 6, 4083);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$3, 165, 46, 4123);
  			add_location(div2, file$3, 164, 5, 4071);
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
  		source: "(164:4) {#if prp.ndu}",
  		ctx
  	});

  	return block;
  }

  // (179:3) {#each (prp.dps_plk || []) as pt1}
  function create_each_block_1(ctx) {
  	let li;
  	let t;
  	let li_value_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text("батальон ДПС");
  			attr_dev(li, "class", "link svelte-23a49a");
  			li.value = li_value_value = /*pt1*/ ctx[12];
  			add_location(li, file$3, 179, 4, 4553);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  			if (remount) dispose();
  			dispose = listen_dev(li, "click", /*showBat*/ ctx[4], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && li_value_value !== (li_value_value = /*pt1*/ ctx[12])) {
  				prop_dev(li, "value", li_value_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_1.name,
  		type: "each",
  		source: "(179:3) {#each (prp.dps_plk || []) as pt1}",
  		ctx
  	});

  	return block;
  }

  // (189:3) {#each (prp.event_list || []) as pt1}
  function create_each_block$1(ctx) {
  	let li;
  	let t;
  	let li_value_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text("Мероприятие");
  			attr_dev(li, "class", "link svelte-23a49a");
  			li.value = li_value_value = /*pt1*/ ctx[12];
  			add_location(li, file$3, 189, 4, 4866);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  			if (remount) dispose();
  			dispose = listen_dev(li, "click", /*showEvn*/ ctx[3], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && li_value_value !== (li_value_value = /*pt1*/ ctx[12])) {
  				prop_dev(li, "value", li_value_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$1.name,
  		type: "each",
  		source: "(189:3) {#each (prp.event_list || []) as pt1}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$3(ctx) {
  	let div4;
  	let div0;
  	let b0;
  	let t0_value = (/*prp*/ ctx[0].name || /*prp*/ ctx[0].dtvp || "") + "";
  	let t0;
  	let t1;
  	let div3;
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
  	let tr2;
  	let td4;
  	let t11;
  	let td5;
  	let t12_value = (/*prp*/ ctx[0].dor || "") + "";
  	let t12;
  	let t13;
  	let tr3;
  	let td6;
  	let t15;
  	let td7;
  	let t16_value = (/*prp*/ ctx[0].name_city || "вне населенного пункта") + "";
  	let t16;
  	let t17;
  	let tr4;
  	let td8;
  	let t19;
  	let td9;
  	let b1;
  	let t20_value = (/*prp*/ ctx[0].km || 0) + "";
  	let t20;
  	let t21;
  	let b2;
  	let t22_value = (/*prp*/ ctx[0].m || 0) + "";
  	let t22;
  	let t23;
  	let t24;
  	let tr5;
  	let td10;
  	let t26;
  	let td11;
  	let t27_value = /*prp*/ ctx[0].lat + "";
  	let t27;
  	let t28;
  	let t29_value = /*prp*/ ctx[0].lon + "";
  	let t29;
  	let t30;
  	let span;
  	let t31;
  	let tr6;
  	let td12;
  	let t33;
  	let td13;
  	let t34_value = (/*prp*/ ctx[0].collision_date || /*prp*/ ctx[0].dtp_date || "") + "";
  	let t34;
  	let t35;
  	let tr7;
  	let td14;
  	let t37;
  	let td15;
  	let t38_value = (/*prp*/ ctx[0].dtvp || "") + "";
  	let t38;
  	let t39;
  	let tr8;
  	let td16;
  	let t41;
  	let td17;
  	let ul0;
  	let t42;
  	let tr9;
  	let td18;
  	let t44;
  	let td19;
  	let t45;
  	let t46;
  	let t47;
  	let t48;
  	let tr10;
  	let td20;
  	let t50;
  	let td21;
  	let b3;
  	let t51_value = /*prp*/ ctx[0].pog + "";
  	let t51;
  	let t52;
  	let t53_value = /*prp*/ ctx[0].ran + "";
  	let t53;
  	let t54;
  	let tr11;
  	let td22;
  	let div1;
  	let t55;
  	let ul1;
  	let t56;
  	let tr12;
  	let td23;
  	let div2;
  	let t57;
  	let ul2;
  	let dispose;
  	let each_value_2 = /*tsInfoArr*/ ctx[6];
  	validate_each_argument(each_value_2);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_2.length; i += 1) {
  		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  	}

  	let if_block0 = /*prp*/ ctx[0].spog && create_if_block_3(ctx);
  	let if_block1 = /*prp*/ ctx[0].s_pch && create_if_block_2(ctx);
  	let if_block2 = /*prp*/ ctx[0].osv && create_if_block_1(ctx);
  	let if_block3 = /*prp*/ ctx[0].ndu && create_if_block(ctx);
  	let each_value_1 = /*prp*/ ctx[0].dps_plk || [];
  	validate_each_argument(each_value_1);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  	}

  	let each_value = /*prp*/ ctx[0].event_list || [];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  	}

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
  			td2.textContent = "Адрес:";
  			t7 = space();
  			td3 = element("td");
  			t8 = text(t8_value);
  			t9 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Дорога:";
  			t11 = space();
  			td5 = element("td");
  			t12 = text(t12_value);
  			t13 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Населенный пункт:";
  			t15 = space();
  			td7 = element("td");
  			t16 = text(t16_value);
  			t17 = space();
  			tr4 = element("tr");
  			td8 = element("td");
  			td8.textContent = "Пикетаж:";
  			t19 = space();
  			td9 = element("td");
  			b1 = element("b");
  			t20 = text(t20_value);
  			t21 = text(" км. ");
  			b2 = element("b");
  			t22 = text(t22_value);
  			t23 = text(" м.");
  			t24 = space();
  			tr5 = element("tr");
  			td10 = element("td");
  			td10.textContent = "Координаты:";
  			t26 = space();
  			td11 = element("td");
  			t27 = text(t27_value);
  			t28 = space();
  			t29 = text(t29_value);
  			t30 = space();
  			span = element("span");
  			t31 = space();
  			tr6 = element("tr");
  			td12 = element("td");
  			td12.textContent = "Дата/время:";
  			t33 = space();
  			td13 = element("td");
  			t34 = text(t34_value);
  			t35 = space();
  			tr7 = element("tr");
  			td14 = element("td");
  			td14.textContent = "Вид ДТП:";
  			t37 = space();
  			td15 = element("td");
  			t38 = text(t38_value);
  			t39 = space();
  			tr8 = element("tr");
  			td16 = element("td");
  			td16.textContent = "Нарушения:";
  			t41 = space();
  			td17 = element("td");
  			ul0 = element("ul");

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].c();
  			}

  			t42 = space();
  			tr9 = element("tr");
  			td18 = element("td");
  			td18.textContent = "Условия:";
  			t44 = space();
  			td19 = element("td");
  			if (if_block0) if_block0.c();
  			t45 = space();
  			if (if_block1) if_block1.c();
  			t46 = space();
  			if (if_block2) if_block2.c();
  			t47 = space();
  			if (if_block3) if_block3.c();
  			t48 = space();
  			tr10 = element("tr");
  			td20 = element("td");
  			td20.textContent = "Количество погибших/раненых:";
  			t50 = space();
  			td21 = element("td");
  			b3 = element("b");
  			t51 = text(t51_value);
  			t52 = text("/");
  			t53 = text(t53_value);
  			t54 = space();
  			tr11 = element("tr");
  			td22 = element("td");
  			div1 = element("div");
  			t55 = space();
  			ul1 = element("ul");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t56 = space();
  			tr12 = element("tr");
  			td23 = element("td");
  			div2 = element("div");
  			t57 = space();
  			ul2 = element("ul");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			add_location(b0, file$3, 93, 4, 2126);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$3, 92, 2, 2102);
  			attr_dev(td0, "class", "first svelte-23a49a");
  			add_location(td0, file$3, 99, 5, 2249);
  			add_location(td1, file$3, 100, 5, 2281);
  			add_location(tr0, file$3, 98, 3, 2239);
  			attr_dev(td2, "class", "first svelte-23a49a");
  			add_location(td2, file$3, 103, 5, 2359);
  			add_location(td3, file$3, 104, 5, 2394);
  			add_location(tr1, file$3, 102, 3, 2349);
  			attr_dev(td4, "class", "first svelte-23a49a");
  			add_location(td4, file$3, 107, 5, 2446);
  			add_location(td5, file$3, 108, 5, 2482);
  			add_location(tr2, file$3, 106, 3, 2436);
  			attr_dev(td6, "class", "first svelte-23a49a");
  			add_location(td6, file$3, 111, 5, 2529);
  			add_location(td7, file$3, 112, 5, 2575);
  			add_location(tr3, file$3, 110, 3, 2519);
  			attr_dev(td8, "class", "first svelte-23a49a");
  			add_location(td8, file$3, 115, 5, 2650);
  			add_location(b1, file$3, 116, 9, 2691);
  			add_location(b2, file$3, 116, 34, 2716);
  			add_location(td9, file$3, 116, 5, 2687);
  			add_location(tr4, file$3, 114, 3, 2640);
  			attr_dev(td10, "class", "first svelte-23a49a");
  			add_location(td10, file$3, 119, 5, 2766);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$3, 120, 29, 2830);
  			add_location(td11, file$3, 120, 5, 2806);
  			add_location(tr5, file$3, 118, 3, 2756);
  			attr_dev(td12, "class", "first svelte-23a49a");
  			add_location(td12, file$3, 123, 5, 2958);
  			add_location(td13, file$3, 124, 5, 2998);
  			add_location(tr6, file$3, 122, 3, 2948);
  			attr_dev(td14, "class", "first svelte-23a49a");
  			add_location(td14, file$3, 127, 5, 3072);
  			add_location(td15, file$3, 128, 5, 3109);
  			add_location(tr7, file$3, 126, 3, 3062);
  			attr_dev(td16, "class", "first svelte-23a49a");
  			add_location(td16, file$3, 131, 14, 3175);
  			add_location(ul0, file$3, 133, 4, 3232);
  			add_location(td17, file$3, 132, 14, 3223);
  			add_location(tr8, file$3, 130, 12, 3156);
  			attr_dev(td18, "class", "first svelte-23a49a");
  			add_location(td18, file$3, 146, 14, 3608);
  			add_location(td19, file$3, 147, 14, 3654);
  			add_location(tr9, file$3, 145, 12, 3589);
  			attr_dev(td20, "class", "first svelte-23a49a");
  			add_location(td20, file$3, 171, 14, 4239);
  			add_location(b3, file$3, 172, 18, 4309);
  			add_location(td21, file$3, 172, 14, 4305);
  			add_location(tr10, file$3, 170, 12, 4220);
  			attr_dev(div1, "class", "win leaflet-popup-content-wrapper hidden svelte-23a49a");
  			add_location(div1, file$3, 176, 2, 4421);
  			add_location(ul1, file$3, 177, 4, 4506);
  			attr_dev(td22, "class", "first svelte-23a49a");
  			attr_dev(td22, "colspan", "2");
  			add_location(td22, file$3, 175, 14, 4390);
  			add_location(tr11, file$3, 174, 12, 4371);
  			attr_dev(div2, "class", "win leaflet-popup-content-wrapper hidden svelte-23a49a");
  			add_location(div2, file$3, 186, 2, 4731);
  			add_location(ul2, file$3, 187, 4, 4816);
  			attr_dev(td23, "class", "first svelte-23a49a");
  			attr_dev(td23, "colspan", "2");
  			add_location(td23, file$3, 185, 14, 4700);
  			add_location(tr12, file$3, 184, 12, 4681);
  			add_location(tbody, file$3, 97, 3, 2228);
  			attr_dev(table, "class", "table");
  			add_location(table, file$3, 96, 4, 2203);
  			attr_dev(div3, "class", "featureCont");
  			add_location(div3, file$3, 95, 2, 2173);
  			attr_dev(div4, "class", "mvsPopup svelte-23a49a");
  			add_location(div4, file$3, 91, 3, 2077);
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
  			append_dev(td3, t8);
  			append_dev(tbody, t9);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t11);
  			append_dev(tr2, td5);
  			append_dev(td5, t12);
  			append_dev(tbody, t13);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, t15);
  			append_dev(tr3, td7);
  			append_dev(td7, t16);
  			append_dev(tbody, t17);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td8);
  			append_dev(tr4, t19);
  			append_dev(tr4, td9);
  			append_dev(td9, b1);
  			append_dev(b1, t20);
  			append_dev(td9, t21);
  			append_dev(td9, b2);
  			append_dev(b2, t22);
  			append_dev(td9, t23);
  			append_dev(tbody, t24);
  			append_dev(tbody, tr5);
  			append_dev(tr5, td10);
  			append_dev(tr5, t26);
  			append_dev(tr5, td11);
  			append_dev(td11, t27);
  			append_dev(td11, t28);
  			append_dev(td11, t29);
  			append_dev(td11, t30);
  			append_dev(td11, span);
  			append_dev(tbody, t31);
  			append_dev(tbody, tr6);
  			append_dev(tr6, td12);
  			append_dev(tr6, t33);
  			append_dev(tr6, td13);
  			append_dev(td13, t34);
  			append_dev(tbody, t35);
  			append_dev(tbody, tr7);
  			append_dev(tr7, td14);
  			append_dev(tr7, t37);
  			append_dev(tr7, td15);
  			append_dev(td15, t38);
  			append_dev(tbody, t39);
  			append_dev(tbody, tr8);
  			append_dev(tr8, td16);
  			append_dev(tr8, t41);
  			append_dev(tr8, td17);
  			append_dev(td17, ul0);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(ul0, null);
  			}

  			append_dev(tbody, t42);
  			append_dev(tbody, tr9);
  			append_dev(tr9, td18);
  			append_dev(tr9, t44);
  			append_dev(tr9, td19);
  			if (if_block0) if_block0.m(td19, null);
  			append_dev(td19, t45);
  			if (if_block1) if_block1.m(td19, null);
  			append_dev(td19, t46);
  			if (if_block2) if_block2.m(td19, null);
  			append_dev(td19, t47);
  			if (if_block3) if_block3.m(td19, null);
  			append_dev(tbody, t48);
  			append_dev(tbody, tr10);
  			append_dev(tr10, td20);
  			append_dev(tr10, t50);
  			append_dev(tr10, td21);
  			append_dev(td21, b3);
  			append_dev(b3, t51);
  			append_dev(b3, t52);
  			append_dev(b3, t53);
  			append_dev(tbody, t54);
  			append_dev(tbody, tr11);
  			append_dev(tr11, td22);
  			append_dev(td22, div1);
  			/*div1_binding*/ ctx[10](div1);
  			append_dev(td22, t55);
  			append_dev(td22, ul1);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(ul1, null);
  			}

  			append_dev(tbody, t56);
  			append_dev(tbody, tr12);
  			append_dev(tr12, td23);
  			append_dev(td23, div2);
  			/*div2_binding*/ ctx[11](div2);
  			append_dev(td23, t57);
  			append_dev(td23, ul2);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul2, null);
  			}

  			if (remount) dispose();
  			dispose = listen_dev(span, "click", /*copyParent*/ ctx[5], false, false, false);
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 1 && t0_value !== (t0_value = (/*prp*/ ctx[0].name || /*prp*/ ctx[0].dtvp || "") + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 1 && t4_value !== (t4_value = (/*prp*/ ctx[0].sid || /*prp*/ ctx[0].id_stat || /*prp*/ ctx[0].id_skpdi || "") + "")) set_data_dev(t4, t4_value);
  			if (dirty & /*prp*/ 1 && t8_value !== (t8_value = (/*prp*/ ctx[0].district || "") + "")) set_data_dev(t8, t8_value);
  			if (dirty & /*prp*/ 1 && t12_value !== (t12_value = (/*prp*/ ctx[0].dor || "") + "")) set_data_dev(t12, t12_value);
  			if (dirty & /*prp*/ 1 && t16_value !== (t16_value = (/*prp*/ ctx[0].name_city || "вне населенного пункта") + "")) set_data_dev(t16, t16_value);
  			if (dirty & /*prp*/ 1 && t20_value !== (t20_value = (/*prp*/ ctx[0].km || 0) + "")) set_data_dev(t20, t20_value);
  			if (dirty & /*prp*/ 1 && t22_value !== (t22_value = (/*prp*/ ctx[0].m || 0) + "")) set_data_dev(t22, t22_value);
  			if (dirty & /*prp*/ 1 && t27_value !== (t27_value = /*prp*/ ctx[0].lat + "")) set_data_dev(t27, t27_value);
  			if (dirty & /*prp*/ 1 && t29_value !== (t29_value = /*prp*/ ctx[0].lon + "")) set_data_dev(t29, t29_value);
  			if (dirty & /*prp*/ 1 && t34_value !== (t34_value = (/*prp*/ ctx[0].collision_date || /*prp*/ ctx[0].dtp_date || "") + "")) set_data_dev(t34, t34_value);
  			if (dirty & /*prp*/ 1 && t38_value !== (t38_value = (/*prp*/ ctx[0].dtvp || "") + "")) set_data_dev(t38, t38_value);

  			if (dirty & /*tsInfoArr*/ 64) {
  				each_value_2 = /*tsInfoArr*/ ctx[6];
  				validate_each_argument(each_value_2);
  				let i;

  				for (i = 0; i < each_value_2.length; i += 1) {
  					const child_ctx = get_each_context_2(ctx, each_value_2, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_2[i] = create_each_block_2(child_ctx);
  						each_blocks_2[i].c();
  						each_blocks_2[i].m(ul0, null);
  					}
  				}

  				for (; i < each_blocks_2.length; i += 1) {
  					each_blocks_2[i].d(1);
  				}

  				each_blocks_2.length = each_value_2.length;
  			}

  			if (/*prp*/ ctx[0].spog) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_3(ctx);
  					if_block0.c();
  					if_block0.m(td19, t45);
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
  					if_block1.m(td19, t46);
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
  					if_block2.m(td19, t47);
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
  					if_block3.m(td19, null);
  				}
  			} else if (if_block3) {
  				if_block3.d(1);
  				if_block3 = null;
  			}

  			if (dirty & /*prp*/ 1 && t51_value !== (t51_value = /*prp*/ ctx[0].pog + "")) set_data_dev(t51, t51_value);
  			if (dirty & /*prp*/ 1 && t53_value !== (t53_value = /*prp*/ ctx[0].ran + "")) set_data_dev(t53, t53_value);

  			if (dirty & /*prp, showBat*/ 17) {
  				each_value_1 = /*prp*/ ctx[0].dps_plk || [];
  				validate_each_argument(each_value_1);
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_1(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(ul1, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_1.length;
  			}

  			if (dirty & /*prp, showEvn*/ 9) {
  				each_value = /*prp*/ ctx[0].event_list || [];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$1(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ul2, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div4);
  			destroy_each(each_blocks_2, detaching);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			if (if_block2) if_block2.d();
  			if (if_block3) if_block3.d();
  			/*div1_binding*/ ctx[10](null);
  			destroy_each(each_blocks_1, detaching);
  			/*div2_binding*/ ctx[11](null);
  			destroy_each(each_blocks, detaching);
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
  	let { showModal = false } = $$props;
  	let { prp } = $$props;
  	let modal;
  	let disabled = prp.skpdiFiles ? "" : "disabled";
  	let gpsCont;
  	let evnCont;

  	const showEvn = ev => {
  		let id = ev.target.value;
  		$$invalidate(2, evnCont.innerHTML = "", evnCont);
  		let url = "https://dtp.mvs.group/scripts/events_dev/get_event_id_" + id + ".txt";

  		fetch(url, {}).then(req => req.json()).then(json => {
  			const app = new DtpPopupEvnt({ target: evnCont, props: { prp: json[0] } });
  		});
  	};

  	afterUpdate(() => {
  		// console.log('the component just updated', showModal, modal);
  		if (showModal) {
  			modal = new Modal({
  					target: document.body,
  					props: { data: prp.skpdiFiles }
  				});

  			modal.$on("close", ev => {
  				modal.$destroy();
  				$$invalidate(7, showModal = false);
  			});
  		}
  	});

  	const showBat = ev => {
  		let id = ev.target.value;
  		console.log("showBat", ev.target.value);
  		$$invalidate(1, gpsCont.innerHTML = "", gpsCont);
  		let url = "https://dtp.mvs.group/scripts/regiments_dev/get_plk_id" + id + ".txt";

  		// let url = 'https://dtp.mvs.group/scripts/rubez_dev/rubez-complex-' + id + '.txt';
  		fetch(url, {}).then(req => req.json()).then(json => {
  			// console.log('bindPopup', layer, json, DtpPopup);
  			const app = new DtpPopupDps({ target: gpsCont, props: { prp: json[0] } });
  		});
  	}; /*
  */

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
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<DtpPopupGibdd> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupGibdd", $$slots, []);

  	function div1_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(1, gpsCont = $$value);
  		});
  	}

  	function div2_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(2, evnCont = $$value);
  		});
  	}

  	$$self.$set = $$props => {
  		if ("showModal" in $$props) $$invalidate(7, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({
  		afterUpdate,
  		Modal,
  		DtpPopup: DtpPopupDps,
  		DtpPopupEvnt,
  		showModal,
  		prp,
  		modal,
  		disabled,
  		gpsCont,
  		evnCont,
  		showEvn,
  		showBat,
  		copyParent,
  		tsInfoArr
  	});

  	$$self.$inject_state = $$props => {
  		if ("showModal" in $$props) $$invalidate(7, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("modal" in $$props) modal = $$props.modal;
  		if ("disabled" in $$props) disabled = $$props.disabled;
  		if ("gpsCont" in $$props) $$invalidate(1, gpsCont = $$props.gpsCont);
  		if ("evnCont" in $$props) $$invalidate(2, evnCont = $$props.evnCont);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [
  		prp,
  		gpsCont,
  		evnCont,
  		showEvn,
  		showBat,
  		copyParent,
  		tsInfoArr,
  		showModal,
  		modal,
  		disabled,
  		div1_binding,
  		div2_binding
  	];
  }

  class DtpPopupGibdd extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$3, create_fragment$3, safe_not_equal, { showModal: 7, prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupGibdd",
  			options,
  			id: create_fragment$3.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$2.warn("<DtpPopupGibdd> was created without expected prop 'prp'");
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
  	let url = 'https://dtp.mvs.group/scripts/dtp_dev/get_stat_gipdd_' + id + '.txt';
  	// let url = 'https://dtp.mvs.group/scripts/index_dev.php?request=get_dtp_id&id=' + id + '&type=gibdd';
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
  	if (DtpGibdd._group && DtpGibdd._map) {
  		DtpGibdd._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters.forEach(ft => {
  				if (ft.type === 'collision_type') {
  					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
  					// if (prp.collision_type === ft.zn) {
  						cnt++;
  					}
  				} else if (ft.type === 'evnt') {
  					if (prp.event) {
  						if (ft.zn.ev1) { cnt++; }
  					} else {
  						if (ft.zn.ev0) { cnt++; }
  					}
  				} else if (ft.type === 'dps') {
  					if (prp.dps) {
  						if (ft.zn.Dps1) { cnt++; }
  					} else {
  						if (ft.zn.Dps0) { cnt++; }
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (prp.id == ft.zn) {
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
  	argFilters = [];

  	fetch('https://dtp.mvs.group/scripts/index_dev.php?request=get_stat_gipdd', {})
  		.then(req => req.json())
  		.then(json => {
  			let opt = {collision_type: {}, iconType: {}, event: {}};
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
  				
  if (prp.id == 220457693) {
  	prp.dps = 1;
  }
  if (!prp.lat || !prp.lon) {
  console.log('_______', prp);
  	prp.lat = prp.lon = 0;
  }
  				let cnt = opt.event[prp.event];
  				if (!cnt) {
  					cnt = 1;
  				} else {
  					cnt++;
  				}
  				opt.event[prp.event] = cnt;

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
  						ev.target.bringToBack();
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

  const { console: console_1$3 } = globals;
  const file$4 = "src\\DtpPopupSkpdi.svelte";

  function get_each_context$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[9] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[12] = list[i];
  	return child_ctx;
  }

  function get_each_context_2$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[12] = list[i];
  	return child_ctx;
  }

  // (93:5) {#if prp.collisionTypes && prp.collisionTypes.length}
  function create_if_block_1$1(ctx) {
  	let each_1_anchor;
  	let each_value_2 = /*prp*/ ctx[1].collisionTypes;
  	validate_each_argument(each_value_2);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_2.length; i += 1) {
  		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
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
  				each_value_2 = /*prp*/ ctx[1].collisionTypes;
  				validate_each_argument(each_value_2);
  				let i;

  				for (i = 0; i < each_value_2.length; i += 1) {
  					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_2$1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_2.length;
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
  		source: "(93:5) {#if prp.collisionTypes && prp.collisionTypes.length}",
  		ctx
  	});

  	return block;
  }

  // (94:5) {#each prp.collisionTypes as pt}
  function create_each_block_2$1(ctx) {
  	let li;
  	let t_value = (/*pt*/ ctx[12].collisionType || "") + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$4, 94, 5, 2322);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 2 && t_value !== (t_value = (/*pt*/ ctx[12].collisionType || "") + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_2$1.name,
  		type: "each",
  		source: "(94:5) {#each prp.collisionTypes as pt}",
  		ctx
  	});

  	return block;
  }

  // (105:5) {#if prp.uchs && prp.uchs.length}
  function create_if_block$1(ctx) {
  	let each_1_anchor;
  	let each_value_1 = /*prp*/ ctx[1].uchs;
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
  				each_value_1 = /*prp*/ ctx[1].uchs;
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
  		id: create_if_block$1.name,
  		type: "if",
  		source: "(105:5) {#if prp.uchs && prp.uchs.length}",
  		ctx
  	});

  	return block;
  }

  // (106:5) {#each prp.uchs as pt}
  function create_each_block_1$1(ctx) {
  	let li;
  	let t0_value = (/*pt*/ ctx[12].collisionPartyCategory || "") + "";
  	let t0;
  	let t1;
  	let b;
  	let i;
  	let t2;
  	let t3_value = (/*pt*/ ctx[12].collisionPartyCond || "") + "";
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
  			add_location(i, file$4, 106, 46, 2625);
  			add_location(b, file$4, 106, 43, 2622);
  			add_location(li, file$4, 106, 5, 2584);
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
  			if (dirty & /*prp*/ 2 && t0_value !== (t0_value = (/*pt*/ ctx[12].collisionPartyCategory || "") + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 2 && t3_value !== (t3_value = (/*pt*/ ctx[12].collisionPartyCond || "") + "")) set_data_dev(t3, t3_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_1$1.name,
  		type: "each",
  		source: "(106:5) {#each prp.uchs as pt}",
  		ctx
  	});

  	return block;
  }

  // (117:3) {#each (prp.event_list || []) as pt1}
  function create_each_block$2(ctx) {
  	let li;
  	let t;
  	let li_value_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text("Мероприятие");
  			attr_dev(li, "class", "link svelte-vdxfpj");
  			li.value = li_value_value = /*pt1*/ ctx[9];
  			add_location(li, file$4, 117, 4, 2927);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  			if (remount) dispose();
  			dispose = listen_dev(li, "click", /*showEvn*/ ctx[4], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 2 && li_value_value !== (li_value_value = /*pt1*/ ctx[9])) {
  				prop_dev(li, "value", li_value_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$2.name,
  		type: "each",
  		source: "(117:3) {#each (prp.event_list || []) as pt1}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$4(ctx) {
  	let div5;
  	let div0;
  	let b0;
  	let t0_value = (/*prp*/ ctx[1].name || /*prp*/ ctx[1].dtvp || "") + "";
  	let t0;
  	let t1;
  	let div4;
  	let table;
  	let tbody;
  	let tr0;
  	let td0;
  	let t3;
  	let td1;
  	let t4_value = (/*prp*/ ctx[1].id || /*prp*/ ctx[1].id_stat || /*prp*/ ctx[1].id_skpdi || "") + "";
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
  	let t15_value = (/*prp*/ ctx[1].name_city || "вне населенного пункта") + "";
  	let t15;
  	let t16;
  	let tr3;
  	let td6;
  	let t18;
  	let td7;
  	let t19_value = /*prp*/ ctx[1].lat + "";
  	let t19;
  	let t20;
  	let t21_value = /*prp*/ ctx[1].lon + "";
  	let t21;
  	let t22;
  	let span;
  	let t23;
  	let tr4;
  	let td8;
  	let t25;
  	let td9;
  	let t26_value = (/*prp*/ ctx[1].collision_date || /*prp*/ ctx[1].dtp_date || "") + "";
  	let t26;
  	let t27;
  	let tr5;
  	let td10;
  	let div1;
  	let t29;
  	let div2;
  	let t30_value = (/*prp*/ ctx[1].collision_context || /*prp*/ ctx[1].dtp_date || "") + "";
  	let t30;
  	let t31;
  	let tr6;
  	let td11;
  	let t33;
  	let td12;
  	let ul0;
  	let t34;
  	let tr7;
  	let td13;
  	let t36;
  	let td14;
  	let ul1;
  	let t37;
  	let tr8;
  	let td15;
  	let div3;
  	let t38;
  	let ul2;
  	let t39;
  	let tr9;
  	let td16;
  	let button;
  	let t40;
  	let dispose;
  	let if_block0 = /*prp*/ ctx[1].collisionTypes && /*prp*/ ctx[1].collisionTypes.length && create_if_block_1$1(ctx);
  	let if_block1 = /*prp*/ ctx[1].uchs && /*prp*/ ctx[1].uchs.length && create_if_block$1(ctx);
  	let each_value = /*prp*/ ctx[1].event_list || [];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  	}

  	const block = {
  		c: function create() {
  			div5 = element("div");
  			div0 = element("div");
  			b0 = element("b");
  			t0 = text(t0_value);
  			t1 = space();
  			div4 = element("div");
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
  			td4.textContent = "Населенный пункт:";
  			t14 = space();
  			td5 = element("td");
  			t15 = text(t15_value);
  			t16 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Координаты:";
  			t18 = space();
  			td7 = element("td");
  			t19 = text(t19_value);
  			t20 = space();
  			t21 = text(t21_value);
  			t22 = space();
  			span = element("span");
  			t23 = space();
  			tr4 = element("tr");
  			td8 = element("td");
  			td8.textContent = "Дата/время:";
  			t25 = space();
  			td9 = element("td");
  			t26 = text(t26_value);
  			t27 = space();
  			tr5 = element("tr");
  			td10 = element("td");
  			div1 = element("div");
  			div1.textContent = "Условия ДТП:";
  			t29 = space();
  			div2 = element("div");
  			t30 = text(t30_value);
  			t31 = space();
  			tr6 = element("tr");
  			td11 = element("td");
  			td11.textContent = "Нарушения:";
  			t33 = space();
  			td12 = element("td");
  			ul0 = element("ul");
  			if (if_block0) if_block0.c();
  			t34 = space();
  			tr7 = element("tr");
  			td13 = element("td");
  			td13.textContent = "Участники:";
  			t36 = space();
  			td14 = element("td");
  			ul1 = element("ul");
  			if (if_block1) if_block1.c();
  			t37 = space();
  			tr8 = element("tr");
  			td15 = element("td");
  			div3 = element("div");
  			t38 = space();
  			ul2 = element("ul");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t39 = space();
  			tr9 = element("tr");
  			td16 = element("td");
  			button = element("button");
  			t40 = text("Фото и схемы");
  			add_location(b0, file$4, 56, 4, 1211);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$4, 55, 2, 1187);
  			attr_dev(td0, "class", "first");
  			add_location(td0, file$4, 62, 5, 1334);
  			add_location(td1, file$4, 63, 5, 1366);
  			add_location(tr0, file$4, 61, 3, 1324);
  			attr_dev(td2, "class", "first");
  			add_location(td2, file$4, 66, 5, 1443);
  			add_location(b1, file$4, 67, 9, 1484);
  			add_location(b2, file$4, 67, 34, 1509);
  			add_location(td3, file$4, 67, 5, 1480);
  			add_location(tr1, file$4, 65, 3, 1433);
  			attr_dev(td4, "class", "first");
  			add_location(td4, file$4, 70, 5, 1559);
  			add_location(td5, file$4, 71, 5, 1605);
  			add_location(tr2, file$4, 69, 3, 1549);
  			attr_dev(td6, "class", "first");
  			add_location(td6, file$4, 75, 5, 1681);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$4, 76, 29, 1745);
  			add_location(td7, file$4, 76, 5, 1721);
  			add_location(tr3, file$4, 74, 3, 1671);
  			attr_dev(td8, "class", "first");
  			add_location(td8, file$4, 79, 5, 1873);
  			add_location(td9, file$4, 80, 5, 1913);
  			add_location(tr4, file$4, 78, 3, 1863);
  			attr_dev(div1, "class", "first");
  			add_location(div1, file$4, 84, 4, 2008);
  			add_location(div2, file$4, 85, 4, 2050);
  			attr_dev(td10, "colspan", "2");
  			add_location(td10, file$4, 83, 5, 1987);
  			add_location(tr5, file$4, 82, 3, 1977);
  			attr_dev(td11, "class", "first");
  			add_location(td11, file$4, 89, 14, 2158);
  			add_location(ul0, file$4, 91, 4, 2215);
  			add_location(td12, file$4, 90, 14, 2206);
  			add_location(tr6, file$4, 88, 12, 2139);
  			attr_dev(td13, "class", "first");
  			add_location(td13, file$4, 101, 14, 2450);
  			add_location(ul1, file$4, 103, 4, 2507);
  			add_location(td14, file$4, 102, 14, 2498);
  			add_location(tr7, file$4, 100, 12, 2431);
  			attr_dev(div3, "class", "win leaflet-popup-content-wrapper  svelte-vdxfpj");
  			add_location(div3, file$4, 114, 2, 2798);
  			add_location(ul2, file$4, 115, 4, 2877);
  			attr_dev(td15, "class", "first");
  			attr_dev(td15, "colspan", "2");
  			add_location(td15, file$4, 113, 14, 2767);
  			add_location(tr8, file$4, 112, 12, 2748);
  			attr_dev(button, "class", "primary svelte-vdxfpj");
  			button.disabled = /*disabled*/ ctx[2];
  			add_location(button, file$4, 125, 4, 3092);
  			attr_dev(td16, "class", "center");
  			attr_dev(td16, "colspan", "2");
  			add_location(td16, file$4, 124, 5, 3056);
  			add_location(tr9, file$4, 123, 3, 3046);
  			add_location(tbody, file$4, 60, 3, 1313);
  			attr_dev(table, "class", "table");
  			add_location(table, file$4, 59, 4, 1288);
  			attr_dev(div4, "class", "featureCont");
  			add_location(div4, file$4, 58, 2, 1258);
  			attr_dev(div5, "class", "mvsPopup");
  			add_location(div5, file$4, 54, 3, 1162);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div5, anchor);
  			append_dev(div5, div0);
  			append_dev(div0, b0);
  			append_dev(b0, t0);
  			append_dev(div5, t1);
  			append_dev(div5, div4);
  			append_dev(div4, table);
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
  			append_dev(tbody, t16);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, t18);
  			append_dev(tr3, td7);
  			append_dev(td7, t19);
  			append_dev(td7, t20);
  			append_dev(td7, t21);
  			append_dev(td7, t22);
  			append_dev(td7, span);
  			append_dev(tbody, t23);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td8);
  			append_dev(tr4, t25);
  			append_dev(tr4, td9);
  			append_dev(td9, t26);
  			append_dev(tbody, t27);
  			append_dev(tbody, tr5);
  			append_dev(tr5, td10);
  			append_dev(td10, div1);
  			append_dev(td10, t29);
  			append_dev(td10, div2);
  			append_dev(div2, t30);
  			append_dev(tbody, t31);
  			append_dev(tbody, tr6);
  			append_dev(tr6, td11);
  			append_dev(tr6, t33);
  			append_dev(tr6, td12);
  			append_dev(td12, ul0);
  			if (if_block0) if_block0.m(ul0, null);
  			append_dev(tbody, t34);
  			append_dev(tbody, tr7);
  			append_dev(tr7, td13);
  			append_dev(tr7, t36);
  			append_dev(tr7, td14);
  			append_dev(td14, ul1);
  			if (if_block1) if_block1.m(ul1, null);
  			append_dev(tbody, t37);
  			append_dev(tbody, tr8);
  			append_dev(tr8, td15);
  			append_dev(td15, div3);
  			/*div3_binding*/ ctx[7](div3);
  			append_dev(td15, t38);
  			append_dev(td15, ul2);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul2, null);
  			}

  			append_dev(tbody, t39);
  			append_dev(tbody, tr9);
  			append_dev(tr9, td16);
  			append_dev(td16, button);
  			append_dev(button, t40);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(span, "click", /*copyParent*/ ctx[5], false, false, false),
  				listen_dev(button, "click", /*click_handler*/ ctx[8], false, false, false)
  			];
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 2 && t0_value !== (t0_value = (/*prp*/ ctx[1].name || /*prp*/ ctx[1].dtvp || "") + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 2 && t4_value !== (t4_value = (/*prp*/ ctx[1].id || /*prp*/ ctx[1].id_stat || /*prp*/ ctx[1].id_skpdi || "") + "")) set_data_dev(t4, t4_value);
  			if (dirty & /*prp*/ 2 && t8_value !== (t8_value = (/*prp*/ ctx[1].km || 0) + "")) set_data_dev(t8, t8_value);
  			if (dirty & /*prp*/ 2 && t10_value !== (t10_value = (/*prp*/ ctx[1].m || 0) + "")) set_data_dev(t10, t10_value);
  			if (dirty & /*prp*/ 2 && t15_value !== (t15_value = (/*prp*/ ctx[1].name_city || "вне населенного пункта") + "")) set_data_dev(t15, t15_value);
  			if (dirty & /*prp*/ 2 && t19_value !== (t19_value = /*prp*/ ctx[1].lat + "")) set_data_dev(t19, t19_value);
  			if (dirty & /*prp*/ 2 && t21_value !== (t21_value = /*prp*/ ctx[1].lon + "")) set_data_dev(t21, t21_value);
  			if (dirty & /*prp*/ 2 && t26_value !== (t26_value = (/*prp*/ ctx[1].collision_date || /*prp*/ ctx[1].dtp_date || "") + "")) set_data_dev(t26, t26_value);
  			if (dirty & /*prp*/ 2 && t30_value !== (t30_value = (/*prp*/ ctx[1].collision_context || /*prp*/ ctx[1].dtp_date || "") + "")) set_data_dev(t30, t30_value);

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

  			if (dirty & /*prp, showEvn*/ 18) {
  				each_value = /*prp*/ ctx[1].event_list || [];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$2(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$2(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ul2, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}

  			if (dirty & /*disabled*/ 4) {
  				prop_dev(button, "disabled", /*disabled*/ ctx[2]);
  			}
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div5);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			/*div3_binding*/ ctx[7](null);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
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
  	let { showModal = false } = $$props;
  	let { prp } = $$props;
  	let modal;
  	let disabled = prp.files && prp.files.length ? "" : "disabled";
  	let evnCont;

  	const showEvn = ev => {
  		let id = ev.target.value;
  		$$invalidate(3, evnCont.innerHTML = "", evnCont);
  		let url = "https://dtp.mvs.group/scripts/events_dev/get_event_id_" + id + ".txt";

  		fetch(url, {}).then(req => req.json()).then(json => {
  			const app = new DtpPopupEvnt({ target: evnCont, props: { prp: json[0] } });
  		});
  	};

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
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<DtpPopupSkpdi> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupSkpdi", $$slots, []);

  	function div3_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(3, evnCont = $$value);
  		});
  	}

  	const click_handler = () => $$invalidate(0, showModal = true);

  	$$self.$set = $$props => {
  		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(1, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({
  		afterUpdate,
  		Modal,
  		DtpPopup: DtpPopupEvnt,
  		showModal,
  		prp,
  		modal,
  		disabled,
  		evnCont,
  		showEvn,
  		copyParent
  	});

  	$$self.$inject_state = $$props => {
  		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(1, prp = $$props.prp);
  		if ("modal" in $$props) modal = $$props.modal;
  		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
  		if ("evnCont" in $$props) $$invalidate(3, evnCont = $$props.evnCont);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [
  		showModal,
  		prp,
  		disabled,
  		evnCont,
  		showEvn,
  		copyParent,
  		modal,
  		div3_binding,
  		click_handler
  	];
  }

  class DtpPopupSkpdi extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$4, create_fragment$4, safe_not_equal, { showModal: 0, prp: 1 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupSkpdi",
  			options,
  			id: create_fragment$4.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[1] === undefined && !("prp" in props)) {
  			console_1$3.warn("<DtpPopupSkpdi> was created without expected prop 'prp'");
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
  	let url = 'https://dtp.mvs.group/scripts/index_dev.php?request=get_dtp_id&id=' + id + '&type=skpdi';
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
  	if (DtpSkpdi._group && DtpSkpdi._map) {
  		DtpSkpdi._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$1.forEach(ft => {
  				if (ft.type === 'collision_type') {
  					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
  					// if (prp.collision_type === ft.zn) {
  						cnt++;
  					}
  				} else if (ft.type === 'evnt') {
  					if (prp.event) {
  						if (ft.zn.ev1) { cnt++; }
  					} else {
  						if (ft.zn.ev0) { cnt++; }
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (prp.id == ft.zn) {
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
  	argFilters$1 = [];

  	fetch('https://dtp.mvs.group/scripts/index_dev.php?request=get_skpdi', {})
  		.then(req => req.json())
  		.then(json => {
  			let opt = {collision_type: {}, iconType: {}, event: {}};
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
  				let cnt = opt.event[prp.event];
  				if (!cnt) {
  					cnt = 1;
  				} else {
  					cnt++;
  				}
  				opt.event[prp.event] = cnt;

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
  						ev.target.bringToBack();
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
  const file$5 = "src\\DtpPopupVerifyed.svelte";

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
  			add_location(button, file$5, 46, 3, 970);
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

  function create_fragment$5(ctx) {
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
  			add_location(a, file$5, 41, 3, 814);
  			attr_dev(div0, "class", "close");
  			add_location(div0, file$5, 40, 2, 791);
  			attr_dev(div1, "class", "pLine");
  			add_location(div1, file$5, 44, 2, 918);
  			attr_dev(div2, "class", "mvsPopup");
  			add_location(div2, file$5, 39, 1, 766);
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
  		id: create_fragment$5.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$5($$self, $$props, $$invalidate) {
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
  			url = "https://dtp.mvs.group/scripts/index_dev.php?request=get_dtp_id&id=" + pt.id + "&type=" + type;

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
  		init(this, options, instance$5, create_fragment$5, safe_not_equal, { prp: 0, closeMe: 1 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupVerifyed",
  			options,
  			id: create_fragment$5.name
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
  	if (DtpVerifyed._group && DtpVerifyed._map) {
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
  				} else if (ft.type === 'evnt') {
  					if (prp.event) {
  						if (ft.zn.ev1) { cnt++; }
  					} else {
  						if (ft.zn.ev0) { cnt++; }
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (prp.id_skpdi == ft.zn || prp.id_stat == ft.zn) {
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
  	argFilters$2 = [];
  	DtpVerifyed._heat = L$7.heatLayer([], {interactive: false});
  	fetch('https://dtp.mvs.group/scripts/index_dev.php?request=get_collision', {})
  		.then(req => req.json())
  		.then(json => {
  			let opt = {collision_type: {}, iconType: {}, event: {}};
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
  				let cnt = opt.event[prp.event];
  				if (!cnt) {
  					cnt = 1;
  				} else {
  					cnt++;
  				}
  				opt.event[prp.event] = cnt;

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
  					ev.target.bringToBack();
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

  const { Object: Object_1 } = globals;
  const file$6 = "src\\DtpVerifyedFilters.svelte";

  function get_each_context$4(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_2$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_3$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_4(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_5(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_6(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_7(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_9(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[232] = list[i];
  	return child_ctx;
  }

  function get_each_context_8(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_10(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_11(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_13(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[232] = list[i];
  	return child_ctx;
  }

  function get_each_context_12(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_14(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_15(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_17(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[232] = list[i];
  	return child_ctx;
  }

  function get_each_context_16(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_18(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_19(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_20(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_21(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_22(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_23(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_24(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_25(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_26(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_27(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_28(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_29(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  function get_each_context_30(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[213] = list[i];
  	return child_ctx;
  }

  // (1022:2) {#if DtpHearthsLo._map && DtpHearthsLo._opt && DtpHearthsLo._opt.years}
  function create_if_block_27(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div8;
  	let div1;
  	let t3;
  	let input0;
  	let t4;
  	let div2;
  	let t5;
  	let input1;
  	let t6;
  	let div5;
  	let fieldset;
  	let legend;
  	let t8;
  	let div4;
  	let div3;
  	let t9;
  	let div6;
  	let input2;
  	let input2_checked_value;
  	let label0;
  	let t11;
  	let input3;
  	let input3_checked_value;
  	let label1;
  	let t13;
  	let div7;
  	let select;
  	let option;
  	let dispose;
  	let each_value_30 = Object.keys(/*DtpHearthsLo*/ ctx[11]._opt.years).sort();
  	validate_each_argument(each_value_30);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_30.length; i += 1) {
  		each_blocks_1[i] = create_each_block_30(get_each_context_30(ctx, each_value_30, i));
  	}

  	let each_value_29 = /*optRoadTypesLo*/ ctx[78];
  	validate_each_argument(each_value_29);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_29.length; i += 1) {
  		each_blocks[i] = create_each_block_29(get_each_context_29(ctx, each_value_29, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "Очаги по пикетажу Ленинградская область";
  			t2 = space();
  			div8 = element("div");
  			div1 = element("div");
  			t3 = text("ID Очага: ");
  			input0 = element("input");
  			t4 = space();
  			div2 = element("div");
  			t5 = text("ID ДТП: ");
  			input1 = element("input");
  			t6 = space();
  			div5 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по годам:";
  			t8 = space();
  			div4 = element("div");
  			div3 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t9 = space();
  			div6 = element("div");
  			input2 = element("input");
  			label0 = element("label");
  			label0.textContent = "одного типа";
  			t11 = space();
  			input3 = element("input");
  			label1 = element("label");
  			label1.textContent = "разного типа";
  			t13 = space();
  			div7 = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все дороги (${/*optRoadTypesLo*/ ctx[78].reduce(/*func*/ ctx[155], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			add_location(b, file$6, 1022, 31, 31284);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1022, 2, 31255);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_hearth*/ ctx[24];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1024, 32, 31397);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1024, 3, 31368);
  			attr_dev(input1, "type", "text");
  			input1.value = /*id_dtp*/ ctx[19];
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1025, 30, 31500);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1025, 3, 31473);
  			add_location(legend, file$6, 1028, 5, 31617);
  			attr_dev(div3, "class", "pLine margin svelte-1jsovbn");
  			add_location(div3, file$6, 1030, 6, 31691);
  			attr_dev(div4, "class", "pLine type svelte-1jsovbn");
  			add_location(div4, file$6, 1029, 5, 31660);
  			add_location(fieldset, file$6, 1027, 4, 31601);
  			attr_dev(div5, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div5, file$6, 1026, 3, 31570);
  			attr_dev(input2, "type", "checkbox");
  			attr_dev(input2, "id", "ht_3");
  			input2.checked = input2_checked_value = /*ht*/ ctx[23].hearth3;
  			attr_dev(input2, "name", "hearth3");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$6, 1039, 4, 32044);
  			attr_dev(label0, "for", "ht_3");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1039, 95, 32135);
  			attr_dev(input3, "type", "checkbox");
  			attr_dev(input3, "id", "ht_5");
  			input3.checked = input3_checked_value = /*ht*/ ctx[23].hearth5;
  			attr_dev(input3, "name", "hearth5");
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$6, 1040, 4, 32177);
  			attr_dev(label1, "for", "ht_5");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1040, 95, 32268);
  			attr_dev(div6, "class", "pLine svelte-1jsovbn");
  			add_location(div6, file$6, 1038, 3, 32020);
  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$6, 1044, 5, 32449);
  			attr_dev(select, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select.multiple = true;
  			if (/*roads*/ ctx[22] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[156].call(select));
  			add_location(select, file$6, 1043, 4, 32344);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$6, 1042, 3, 32320);
  			attr_dev(div8, "class", "filtersCont svelte-1jsovbn");
  			add_location(div8, file$6, 1023, 2, 31339);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div8, anchor);
  			append_dev(div8, div1);
  			append_dev(div1, t3);
  			append_dev(div1, input0);
  			append_dev(div8, t4);
  			append_dev(div8, div2);
  			append_dev(div2, t5);
  			append_dev(div2, input1);
  			append_dev(div8, t6);
  			append_dev(div8, div5);
  			append_dev(div5, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t8);
  			append_dev(fieldset, div4);
  			append_dev(div4, div3);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div3, null);
  			}

  			append_dev(div8, t9);
  			append_dev(div8, div6);
  			append_dev(div6, input2);
  			append_dev(div6, label0);
  			append_dev(div6, t11);
  			append_dev(div6, input3);
  			append_dev(div6, label1);
  			append_dev(div8, t13);
  			append_dev(div8, div7);
  			append_dev(div7, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*roads*/ ctx[22]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdHearth*/ ctx[109], false, false, false),
  				listen_dev(input1, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input2, "change", /*oncheckHt*/ ctx[110], false, false, false),
  				listen_dev(input3, "change", /*oncheckHt*/ ctx[110], false, false, false),
  				listen_dev(select, "change", /*select_change_handler*/ ctx[156]),
  				listen_dev(select, "change", /*setFilterHearthsLo*/ ctx[104], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_hearth*/ 16777216 && input0.value !== /*id_hearth*/ ctx[24]) {
  				prop_dev(input0, "value", /*id_hearth*/ ctx[24]);
  			}

  			if (dirty[0] & /*id_dtp*/ 524288 && input1.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input1, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[0] & /*DtpHearthsLo*/ 2048 | dirty[1] & /*hearths_year_Lo*/ 128 | dirty[3] & /*setFilterHearthsLo*/ 2048) {
  				each_value_30 = Object.keys(/*DtpHearthsLo*/ ctx[11]._opt.years).sort();
  				validate_each_argument(each_value_30);
  				let i;

  				for (i = 0; i < each_value_30.length; i += 1) {
  					const child_ctx = get_each_context_30(ctx, each_value_30, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_30(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div3, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_30.length;
  			}

  			if (dirty[0] & /*ht*/ 8388608 && input2_checked_value !== (input2_checked_value = /*ht*/ ctx[23].hearth3)) {
  				prop_dev(input2, "checked", input2_checked_value);
  			}

  			if (dirty[0] & /*ht*/ 8388608 && input3_checked_value !== (input3_checked_value = /*ht*/ ctx[23].hearth5)) {
  				prop_dev(input3, "checked", input3_checked_value);
  			}

  			if (dirty[2] & /*optRoadTypesLo, optDataHearthsLo*/ 98304) {
  				each_value_29 = /*optRoadTypesLo*/ ctx[78];
  				validate_each_argument(each_value_29);
  				let i;

  				for (i = 0; i < each_value_29.length; i += 1) {
  					const child_ctx = get_each_context_29(ctx, each_value_29, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_29(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_29.length;
  			}

  			if (dirty[0] & /*roads*/ 4194304) {
  				select_options(select, /*roads*/ ctx[22]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div8);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_27.name,
  		type: "if",
  		source: "(1022:2) {#if DtpHearthsLo._map && DtpHearthsLo._opt && DtpHearthsLo._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1032:6) {#each Object.keys(DtpHearthsLo._opt.years).sort() as key}
  function create_each_block_30(ctx) {
  	let input;
  	let input_checked_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[213] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_Lo");
  			input.checked = input_checked_value = /*hearths_year_Lo*/ ctx[38][/*key*/ ctx[213]];
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[213]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1032, 7, 31790);
  			attr_dev(label, "for", "hearths_year_Lo");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1032, 126, 31909);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsLo*/ ctx[104], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsLo*/ 2048 | dirty[1] & /*hearths_year_Lo*/ 128 && input_checked_value !== (input_checked_value = /*hearths_year_Lo*/ ctx[38][/*key*/ ctx[213]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[0] & /*DtpHearthsLo*/ 2048 && input_name_value !== (input_name_value = /*key*/ ctx[213])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsLo*/ 2048 && t_value !== (t_value = /*key*/ ctx[213] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_30.name,
  		type: "each",
  		source: "(1032:6) {#each Object.keys(DtpHearthsLo._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1048:5) {#each optRoadTypesLo as key}
  function create_each_block_29(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsLo*/ ctx[77].road[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "road_" + /*key*/ ctx[213] + " svelte-1jsovbn");
  			add_location(option, file$6, 1048, 6, 32625);
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
  		id: create_each_block_29.name,
  		type: "each",
  		source: "(1048:5) {#each optRoadTypesLo as key}",
  		ctx
  	});

  	return block;
  }

  // (1058:2) {#if DtpHearthsPicket4._map && DtpHearthsPicket4._opt && DtpHearthsPicket4._opt.years}
  function create_if_block_26(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div9;
  	let div1;
  	let t3;
  	let input0;
  	let t4;
  	let div2;
  	let t5;
  	let input1;
  	let t6;
  	let div5;
  	let fieldset;
  	let legend;
  	let t8;
  	let div4;
  	let input2;
  	let input2_value_value;
  	let input2_checked_value;
  	let label0;
  	let t10;
  	let div3;
  	let t11;
  	let div6;
  	let input3;
  	let input3_checked_value;
  	let label1;
  	let t13;
  	let input4;
  	let input4_checked_value;
  	let label2;
  	let t15;
  	let div7;
  	let select0;
  	let option0;
  	let t19;
  	let div8;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_28 = Object.keys(/*DtpHearthsPicket4*/ ctx[0]._opt.years).sort();
  	validate_each_argument(each_value_28);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_28.length; i += 1) {
  		each_blocks_1[i] = create_each_block_28(get_each_context_28(ctx, each_value_28, i));
  	}

  	let each_value_27 = /*optRoadTypes4*/ ctx[96];
  	validate_each_argument(each_value_27);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_27.length; i += 1) {
  		each_blocks[i] = create_each_block_27(get_each_context_27(ctx, each_value_27, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "Предочаги по пикетажу";
  			t2 = space();
  			div9 = element("div");
  			div1 = element("div");
  			t3 = text("ID Очага: ");
  			input0 = element("input");
  			t4 = space();
  			div2 = element("div");
  			t5 = text("ID ДТП: ");
  			input1 = element("input");
  			t6 = space();
  			div5 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t8 = space();
  			div4 = element("div");
  			input2 = element("input");
  			label0 = element("label");
  			label0.textContent = "Фильтрация по годам";
  			t10 = space();
  			div3 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t11 = space();
  			div6 = element("div");
  			input3 = element("input");
  			label1 = element("label");
  			label1.textContent = "одного типа";
  			t13 = space();
  			input4 = element("input");
  			label2 = element("label");
  			label2.textContent = "разного типа";
  			t15 = space();
  			div7 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все дороги (${/*optRoadTypes4*/ ctx[96].reduce(/*func_1*/ ctx[159], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t19 = space();
  			div8 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearthsPicket4*/ ctx[95].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearthsPicket4*/ ctx[95].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearthsPicket4*/ ctx[95].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearthsPicket4*/ ctx[95].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearthsPicket4*/ ctx[95].stricken[4] || 0}) С пострадавшими и погибшими`;
  			add_location(b, file$6, 1058, 31, 32902);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1058, 2, 32873);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_hearth*/ ctx[24];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1060, 32, 32997);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1060, 3, 32968);
  			attr_dev(input1, "type", "text");
  			input1.value = /*id_dtp*/ ctx[19];
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1061, 30, 33100);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1061, 3, 33073);
  			add_location(legend, file$6, 1064, 5, 33217);
  			attr_dev(input2, "type", "radio");
  			input2.__value = input2_value_value = 1;
  			input2.value = input2.__value;
  			input2.checked = input2_checked_value = /*hearths_period_type_Stat*/ ctx[54] === 1;
  			attr_dev(input2, "id", "hearths_period_type_Stat1");
  			attr_dev(input2, "name", "hearths_period_type_Stat");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[158][2].push(input2);
  			add_location(input2, file$6, 1066, 6, 33294);
  			attr_dev(label0, "for", "hearths_period_type_Stat1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1066, 214, 33502);
  			attr_dev(div3, "class", "pLine margin svelte-1jsovbn");
  			add_location(div3, file$6, 1067, 6, 33575);
  			attr_dev(div4, "class", "pLine type svelte-1jsovbn");
  			add_location(div4, file$6, 1065, 5, 33263);
  			add_location(fieldset, file$6, 1063, 4, 33201);
  			attr_dev(div5, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div5, file$6, 1062, 3, 33170);
  			attr_dev(input3, "type", "checkbox");
  			attr_dev(input3, "id", "ht_3");
  			input3.checked = input3_checked_value = /*ht*/ ctx[23].hearth3;
  			attr_dev(input3, "name", "hearth3");
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$6, 1076, 4, 33995);
  			attr_dev(label1, "for", "ht_3");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1076, 95, 34086);
  			attr_dev(input4, "type", "checkbox");
  			attr_dev(input4, "id", "ht_5");
  			input4.checked = input4_checked_value = /*ht*/ ctx[23].hearth5;
  			attr_dev(input4, "name", "hearth5");
  			attr_dev(input4, "class", "svelte-1jsovbn");
  			add_location(input4, file$6, 1077, 4, 34128);
  			attr_dev(label2, "for", "ht_5");
  			attr_dev(label2, "class", "svelte-1jsovbn");
  			add_location(label2, file$6, 1077, 95, 34219);
  			attr_dev(div6, "class", "pLine svelte-1jsovbn");
  			add_location(div6, file$6, 1075, 3, 33971);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$6, 1081, 5, 34405);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*roads*/ ctx[22] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[160].call(select0));
  			add_location(select0, file$6, 1080, 4, 34295);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$6, 1079, 3, 34271);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$6, 1093, 5, 34854);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$6, 1094, 5, 34938);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$6, 1095, 5, 35030);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$6, 1096, 5, 35126);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$6, 1097, 5, 35229);
  			attr_dev(select1, "name", "stricken");
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken4*/ ctx[40] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[161].call(select1));
  			add_location(select1, file$6, 1092, 4, 34755);
  			attr_dev(div8, "class", "pLine svelte-1jsovbn");
  			add_location(div8, file$6, 1091, 3, 34731);
  			attr_dev(div9, "class", "filtersCont svelte-1jsovbn");
  			add_location(div9, file$6, 1059, 2, 32939);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div9, anchor);
  			append_dev(div9, div1);
  			append_dev(div1, t3);
  			append_dev(div1, input0);
  			append_dev(div9, t4);
  			append_dev(div9, div2);
  			append_dev(div2, t5);
  			append_dev(div2, input1);
  			append_dev(div9, t6);
  			append_dev(div9, div5);
  			append_dev(div5, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t8);
  			append_dev(fieldset, div4);
  			append_dev(div4, input2);
  			input2.checked = input2.__value === /*hearths_period_type_Stat*/ ctx[54];
  			append_dev(div4, label0);
  			append_dev(div4, t10);
  			append_dev(div4, div3);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div3, null);
  			}

  			append_dev(div9, t11);
  			append_dev(div9, div6);
  			append_dev(div6, input3);
  			append_dev(div6, label1);
  			append_dev(div6, t13);
  			append_dev(div6, input4);
  			append_dev(div6, label2);
  			append_dev(div9, t15);
  			append_dev(div9, div7);
  			append_dev(div7, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*roads*/ ctx[22]);
  			append_dev(div9, t19);
  			append_dev(div9, div8);
  			append_dev(div8, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken4*/ ctx[40]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdHearth*/ ctx[109], false, false, false),
  				listen_dev(input1, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input2, "change", /*setFilterHearthsPicket4*/ ctx[106], false, false, false),
  				listen_dev(input2, "change", /*input2_change_handler*/ ctx[157]),
  				listen_dev(input3, "change", /*oncheckHt*/ ctx[110], false, false, false),
  				listen_dev(input4, "change", /*oncheckHt*/ ctx[110], false, false, false),
  				listen_dev(select0, "change", /*select0_change_handler*/ ctx[160]),
  				listen_dev(select0, "change", /*setFilterHearthsPicket4*/ ctx[106], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler*/ ctx[161]),
  				listen_dev(select1, "change", /*setFilterHearthsPicket4*/ ctx[106], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_hearth*/ 16777216 && input0.value !== /*id_hearth*/ ctx[24]) {
  				prop_dev(input0, "value", /*id_hearth*/ ctx[24]);
  			}

  			if (dirty[0] & /*id_dtp*/ 524288 && input1.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input1, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 8388608 && input2_checked_value !== (input2_checked_value = /*hearths_period_type_Stat*/ ctx[54] === 1)) {
  				prop_dev(input2, "checked", input2_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 8388608) {
  				input2.checked = input2.__value === /*hearths_period_type_Stat*/ ctx[54];
  			}

  			if (dirty[0] & /*DtpHearthsPicket4*/ 1 | dirty[1] & /*hearths_year_Picket4, hearths_period_type_Stat*/ 8389632 | dirty[3] & /*setFilterHearthsPicket4*/ 8192) {
  				each_value_28 = Object.keys(/*DtpHearthsPicket4*/ ctx[0]._opt.years).sort();
  				validate_each_argument(each_value_28);
  				let i;

  				for (i = 0; i < each_value_28.length; i += 1) {
  					const child_ctx = get_each_context_28(ctx, each_value_28, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_28(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div3, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_28.length;
  			}

  			if (dirty[0] & /*ht*/ 8388608 && input3_checked_value !== (input3_checked_value = /*ht*/ ctx[23].hearth3)) {
  				prop_dev(input3, "checked", input3_checked_value);
  			}

  			if (dirty[0] & /*ht*/ 8388608 && input4_checked_value !== (input4_checked_value = /*ht*/ ctx[23].hearth5)) {
  				prop_dev(input4, "checked", input4_checked_value);
  			}

  			if (dirty[3] & /*optRoadTypes4, optDataHearthsPicket4*/ 12) {
  				each_value_27 = /*optRoadTypes4*/ ctx[96];
  				validate_each_argument(each_value_27);
  				let i;

  				for (i = 0; i < each_value_27.length; i += 1) {
  					const child_ctx = get_each_context_27(ctx, each_value_27, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_27(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_27.length;
  			}

  			if (dirty[0] & /*roads*/ 4194304) {
  				select_options(select0, /*roads*/ ctx[22]);
  			}

  			if (dirty[1] & /*hearths_stricken4*/ 512) {
  				select_option(select1, /*hearths_stricken4*/ ctx[40]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div9);
  			/*$$binding_groups*/ ctx[158][2].splice(/*$$binding_groups*/ ctx[158][2].indexOf(input2), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_26.name,
  		type: "if",
  		source: "(1058:2) {#if DtpHearthsPicket4._map && DtpHearthsPicket4._opt && DtpHearthsPicket4._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1069:6) {#each Object.keys(DtpHearthsPicket4._opt.years).sort() as key}
  function create_each_block_28(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[213] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_Picket4");
  			input.checked = input_checked_value = /*hearths_year_Picket4*/ ctx[41][/*key*/ ctx[213]];
  			input.disabled = input_disabled_value = /*hearths_period_type_Stat*/ ctx[54] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[213]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1069, 7, 33679);
  			attr_dev(label, "for", "hearths_year_Picket4");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1069, 183, 33855);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsPicket4*/ ctx[106], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsPicket4*/ 1 | dirty[1] & /*hearths_year_Picket4*/ 1024 && input_checked_value !== (input_checked_value = /*hearths_year_Picket4*/ ctx[41][/*key*/ ctx[213]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 8388608 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_Stat*/ ctx[54] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsPicket4*/ 1 && input_name_value !== (input_name_value = /*key*/ ctx[213])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsPicket4*/ 1 && t_value !== (t_value = /*key*/ ctx[213] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_28.name,
  		type: "each",
  		source: "(1069:6) {#each Object.keys(DtpHearthsPicket4._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1085:5) {#each optRoadTypes4 as key}
  function create_each_block_27(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsPicket4*/ ctx[95].road[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "road_" + /*key*/ ctx[213] + " svelte-1jsovbn");
  			add_location(option, file$6, 1085, 6, 34584);
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
  		id: create_each_block_27.name,
  		type: "each",
  		source: "(1085:5) {#each optRoadTypes4 as key}",
  		ctx
  	});

  	return block;
  }

  // (1104:2) {#if DtpHearthsSettlements._map && DtpHearthsSettlements._opt && DtpHearthsSettlements._opt.years}
  function create_if_block_25(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div11;
  	let div1;
  	let t3;
  	let input0;
  	let t4;
  	let div2;
  	let t5;
  	let input1;
  	let t6;
  	let div5;
  	let fieldset0;
  	let legend0;
  	let t8;
  	let div4;
  	let div3;
  	let input2;
  	let input2_checked_value;
  	let label0;
  	let t10;
  	let input3;
  	let input3_checked_value;
  	let label1;
  	let br;
  	let t12;
  	let input4;
  	let input4_checked_value;
  	let label2;
  	let t14;
  	let div8;
  	let fieldset1;
  	let legend1;
  	let t16;
  	let div7;
  	let div6;
  	let t17;
  	let div9;
  	let input5;
  	let input5_checked_value;
  	let label3;
  	let t19;
  	let input6;
  	let input6_checked_value;
  	let label4;
  	let t21;
  	let div10;
  	let select;
  	let option;
  	let dispose;
  	let each_value_26 = Object.keys(/*DtpHearthsSettlements*/ ctx[1]._opt.years).sort();
  	validate_each_argument(each_value_26);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_26.length; i += 1) {
  		each_blocks_1[i] = create_each_block_26(get_each_context_26(ctx, each_value_26, i));
  	}

  	let each_value_25 = /*optRoadTypes5*/ ctx[92];
  	validate_each_argument(each_value_25);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_25.length; i += 1) {
  		each_blocks[i] = create_each_block_25(get_each_context_25(ctx, each_value_25, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "Очаги с привязкой к городам";
  			t2 = space();
  			div11 = element("div");
  			div1 = element("div");
  			t3 = text("ID Очага: ");
  			input0 = element("input");
  			t4 = space();
  			div2 = element("div");
  			t5 = text("ID ДТП: ");
  			input1 = element("input");
  			t6 = space();
  			div5 = element("div");
  			fieldset0 = element("fieldset");
  			legend0 = element("legend");
  			legend0.textContent = "Расположение очага:";
  			t8 = space();
  			div4 = element("div");
  			div3 = element("div");
  			input2 = element("input");
  			label0 = element("label");
  			label0.textContent = "в населенном пункте";
  			t10 = space();
  			input3 = element("input");
  			label1 = element("label");
  			label1.textContent = "вне населенного пункта";
  			br = element("br");
  			t12 = space();
  			input4 = element("input");
  			label2 = element("label");
  			label2.textContent = "на границе населенного пункта";
  			t14 = space();
  			div8 = element("div");
  			fieldset1 = element("fieldset");
  			legend1 = element("legend");
  			legend1.textContent = "Фильтрация по годам:";
  			t16 = space();
  			div7 = element("div");
  			div6 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t17 = space();
  			div9 = element("div");
  			input5 = element("input");
  			label3 = element("label");
  			label3.textContent = "одного типа";
  			t19 = space();
  			input6 = element("input");
  			label4 = element("label");
  			label4.textContent = "разного типа";
  			t21 = space();
  			div10 = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все дороги (${/*optRoadTypes5*/ ctx[92].reduce(/*func_2*/ ctx[162], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			add_location(b, file$6, 1104, 31, 35499);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1104, 2, 35470);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_hearth*/ ctx[24];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1106, 32, 35600);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1106, 3, 35571);
  			attr_dev(input1, "type", "text");
  			input1.value = /*id_dtp*/ ctx[19];
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1107, 30, 35703);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1107, 3, 35676);
  			add_location(legend0, file$6, 1110, 5, 35813);
  			attr_dev(input2, "type", "checkbox");
  			attr_dev(input2, "id", "city_1");
  			input2.checked = input2_checked_value = /*city*/ ctx[37][1];
  			attr_dev(input2, "name", "1");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$6, 1113, 7, 35920);
  			attr_dev(label0, "for", "city_1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1113, 95, 36008);
  			attr_dev(input3, "type", "checkbox");
  			attr_dev(input3, "id", "city_0");
  			input3.checked = input3_checked_value = /*city*/ ctx[37][0];
  			attr_dev(input3, "name", "0");
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$6, 1114, 7, 36063);
  			attr_dev(label1, "for", "city_0");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1114, 95, 36151);
  			add_location(br, file$6, 1114, 145, 36201);
  			attr_dev(input4, "type", "checkbox");
  			attr_dev(input4, "id", "city_2");
  			input4.checked = input4_checked_value = /*city*/ ctx[37][2];
  			attr_dev(input4, "name", "2");
  			attr_dev(input4, "class", "svelte-1jsovbn");
  			add_location(input4, file$6, 1115, 7, 36214);
  			attr_dev(label2, "for", "city_2");
  			attr_dev(label2, "class", "svelte-1jsovbn");
  			add_location(label2, file$6, 1115, 95, 36302);
  			attr_dev(div3, "class", "pLine margin svelte-1jsovbn");
  			add_location(div3, file$6, 1112, 6, 35886);
  			attr_dev(div4, "class", "pLine type svelte-1jsovbn");
  			add_location(div4, file$6, 1111, 5, 35855);
  			add_location(fieldset0, file$6, 1109, 4, 35797);
  			attr_dev(div5, "class", "pLine svelte-1jsovbn");
  			add_location(div5, file$6, 1108, 3, 35773);
  			add_location(legend1, file$6, 1123, 5, 36465);
  			attr_dev(div6, "class", "pLine margin svelte-1jsovbn");
  			add_location(div6, file$6, 1125, 6, 36539);
  			attr_dev(div7, "class", "pLine type svelte-1jsovbn");
  			add_location(div7, file$6, 1124, 5, 36508);
  			add_location(fieldset1, file$6, 1122, 4, 36449);
  			attr_dev(div8, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div8, file$6, 1121, 3, 36418);
  			attr_dev(input5, "type", "checkbox");
  			attr_dev(input5, "id", "ht_3");
  			input5.checked = input5_checked_value = /*ht*/ ctx[23].hearth3;
  			attr_dev(input5, "name", "hearth3");
  			attr_dev(input5, "class", "svelte-1jsovbn");
  			add_location(input5, file$6, 1134, 4, 36937);
  			attr_dev(label3, "for", "ht_3");
  			attr_dev(label3, "class", "svelte-1jsovbn");
  			add_location(label3, file$6, 1134, 95, 37028);
  			attr_dev(input6, "type", "checkbox");
  			attr_dev(input6, "id", "ht_5");
  			input6.checked = input6_checked_value = /*ht*/ ctx[23].hearth5;
  			attr_dev(input6, "name", "hearth5");
  			attr_dev(input6, "class", "svelte-1jsovbn");
  			add_location(input6, file$6, 1135, 4, 37070);
  			attr_dev(label4, "for", "ht_5");
  			attr_dev(label4, "class", "svelte-1jsovbn");
  			add_location(label4, file$6, 1135, 95, 37161);
  			attr_dev(div9, "class", "pLine svelte-1jsovbn");
  			add_location(div9, file$6, 1133, 3, 36913);
  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$6, 1139, 5, 37351);
  			attr_dev(select, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select.multiple = true;
  			if (/*roads*/ ctx[22] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[163].call(select));
  			add_location(select, file$6, 1138, 4, 37237);
  			attr_dev(div10, "class", "pLine svelte-1jsovbn");
  			add_location(div10, file$6, 1137, 3, 37213);
  			attr_dev(div11, "class", "filtersCont svelte-1jsovbn");
  			add_location(div11, file$6, 1105, 2, 35542);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div11, anchor);
  			append_dev(div11, div1);
  			append_dev(div1, t3);
  			append_dev(div1, input0);
  			append_dev(div11, t4);
  			append_dev(div11, div2);
  			append_dev(div2, t5);
  			append_dev(div2, input1);
  			append_dev(div11, t6);
  			append_dev(div11, div5);
  			append_dev(div5, fieldset0);
  			append_dev(fieldset0, legend0);
  			append_dev(fieldset0, t8);
  			append_dev(fieldset0, div4);
  			append_dev(div4, div3);
  			append_dev(div3, input2);
  			append_dev(div3, label0);
  			append_dev(div3, t10);
  			append_dev(div3, input3);
  			append_dev(div3, label1);
  			append_dev(div3, br);
  			append_dev(div3, t12);
  			append_dev(div3, input4);
  			append_dev(div3, label2);
  			append_dev(div11, t14);
  			append_dev(div11, div8);
  			append_dev(div8, fieldset1);
  			append_dev(fieldset1, legend1);
  			append_dev(fieldset1, t16);
  			append_dev(fieldset1, div7);
  			append_dev(div7, div6);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div6, null);
  			}

  			append_dev(div11, t17);
  			append_dev(div11, div9);
  			append_dev(div9, input5);
  			append_dev(div9, label3);
  			append_dev(div9, t19);
  			append_dev(div9, input6);
  			append_dev(div9, label4);
  			append_dev(div11, t21);
  			append_dev(div11, div10);
  			append_dev(div10, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*roads*/ ctx[22]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdHearth*/ ctx[109], false, false, false),
  				listen_dev(input1, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input2, "change", /*oncheckIdCity*/ ctx[107], false, false, false),
  				listen_dev(input3, "change", /*oncheckIdCity*/ ctx[107], false, false, false),
  				listen_dev(input4, "change", /*oncheckIdCity*/ ctx[107], false, false, false),
  				listen_dev(input5, "change", /*oncheckHt*/ ctx[110], false, false, false),
  				listen_dev(input6, "change", /*oncheckHt*/ ctx[110], false, false, false),
  				listen_dev(select, "change", /*select_change_handler_1*/ ctx[163]),
  				listen_dev(select, "change", /*setFilterHearthsSettlements*/ ctx[103], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_hearth*/ 16777216 && input0.value !== /*id_hearth*/ ctx[24]) {
  				prop_dev(input0, "value", /*id_hearth*/ ctx[24]);
  			}

  			if (dirty[0] & /*id_dtp*/ 524288 && input1.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input1, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[1] & /*city*/ 64 && input2_checked_value !== (input2_checked_value = /*city*/ ctx[37][1])) {
  				prop_dev(input2, "checked", input2_checked_value);
  			}

  			if (dirty[1] & /*city*/ 64 && input3_checked_value !== (input3_checked_value = /*city*/ ctx[37][0])) {
  				prop_dev(input3, "checked", input3_checked_value);
  			}

  			if (dirty[1] & /*city*/ 64 && input4_checked_value !== (input4_checked_value = /*city*/ ctx[37][2])) {
  				prop_dev(input4, "checked", input4_checked_value);
  			}

  			if (dirty[0] & /*DtpHearthsSettlements*/ 2 | dirty[1] & /*hearths_year_Settlements*/ 32 | dirty[3] & /*setFilterHearthsSettlements*/ 1024) {
  				each_value_26 = Object.keys(/*DtpHearthsSettlements*/ ctx[1]._opt.years).sort();
  				validate_each_argument(each_value_26);
  				let i;

  				for (i = 0; i < each_value_26.length; i += 1) {
  					const child_ctx = get_each_context_26(ctx, each_value_26, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_26(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div6, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_26.length;
  			}

  			if (dirty[0] & /*ht*/ 8388608 && input5_checked_value !== (input5_checked_value = /*ht*/ ctx[23].hearth3)) {
  				prop_dev(input5, "checked", input5_checked_value);
  			}

  			if (dirty[0] & /*ht*/ 8388608 && input6_checked_value !== (input6_checked_value = /*ht*/ ctx[23].hearth5)) {
  				prop_dev(input6, "checked", input6_checked_value);
  			}

  			if (dirty[2] & /*optRoadTypes5, optDataHearthsSettlements*/ 1610612736) {
  				each_value_25 = /*optRoadTypes5*/ ctx[92];
  				validate_each_argument(each_value_25);
  				let i;

  				for (i = 0; i < each_value_25.length; i += 1) {
  					const child_ctx = get_each_context_25(ctx, each_value_25, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_25(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_25.length;
  			}

  			if (dirty[0] & /*roads*/ 4194304) {
  				select_options(select, /*roads*/ ctx[22]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div11);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_25.name,
  		type: "if",
  		source: "(1104:2) {#if DtpHearthsSettlements._map && DtpHearthsSettlements._opt && DtpHearthsSettlements._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1127:6) {#each Object.keys(DtpHearthsSettlements._opt.years).sort() as key}
  function create_each_block_26(ctx) {
  	let input;
  	let input_checked_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[213] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_Settlements");
  			input.checked = input_checked_value = /*hearths_year_Settlements*/ ctx[36][/*key*/ ctx[213]];
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[213]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1127, 7, 36647);
  			attr_dev(label, "for", "hearths_year_Settlements");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1127, 153, 36793);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsSettlements*/ ctx[103], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsSettlements*/ 2 | dirty[1] & /*hearths_year_Settlements*/ 32 && input_checked_value !== (input_checked_value = /*hearths_year_Settlements*/ ctx[36][/*key*/ ctx[213]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[0] & /*DtpHearthsSettlements*/ 2 && input_name_value !== (input_name_value = /*key*/ ctx[213])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsSettlements*/ 2 && t_value !== (t_value = /*key*/ ctx[213] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_26.name,
  		type: "each",
  		source: "(1127:6) {#each Object.keys(DtpHearthsSettlements._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1143:5) {#each optRoadTypes5 as key}
  function create_each_block_25(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsSettlements*/ ctx[91].road[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "road_" + /*key*/ ctx[213] + " svelte-1jsovbn");
  			add_location(option, file$6, 1143, 6, 37534);
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
  		id: create_each_block_25.name,
  		type: "each",
  		source: "(1143:5) {#each optRoadTypes5 as key}",
  		ctx
  	});

  	return block;
  }

  // (1153:2) {#if DtpHearthsPicket._map && DtpHearthsPicket._opt && DtpHearthsPicket._opt.years}
  function create_if_block_24(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div8;
  	let div1;
  	let t3;
  	let input0;
  	let t4;
  	let div2;
  	let t5;
  	let input1;
  	let t6;
  	let div5;
  	let fieldset;
  	let legend;
  	let t8;
  	let div4;
  	let div3;
  	let t9;
  	let div6;
  	let input2;
  	let input2_checked_value;
  	let label0;
  	let t11;
  	let input3;
  	let input3_checked_value;
  	let label1;
  	let t13;
  	let div7;
  	let select;
  	let option;
  	let dispose;
  	let each_value_24 = Object.keys(/*DtpHearthsPicket*/ ctx[2]._opt.years).sort();
  	validate_each_argument(each_value_24);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_24.length; i += 1) {
  		each_blocks_1[i] = create_each_block_24(get_each_context_24(ctx, each_value_24, i));
  	}

  	let each_value_23 = /*optRoadTypes*/ ctx[94];
  	validate_each_argument(each_value_23);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_23.length; i += 1) {
  		each_blocks[i] = create_each_block_23(get_each_context_23(ctx, each_value_23, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги(Picket)";
  			t2 = space();
  			div8 = element("div");
  			div1 = element("div");
  			t3 = text("ID Очага: ");
  			input0 = element("input");
  			t4 = space();
  			div2 = element("div");
  			t5 = text("ID ДТП: ");
  			input1 = element("input");
  			t6 = space();
  			div5 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по годам:";
  			t8 = space();
  			div4 = element("div");
  			div3 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t9 = space();
  			div6 = element("div");
  			input2 = element("input");
  			label0 = element("label");
  			label0.textContent = "одного типа";
  			t11 = space();
  			input3 = element("input");
  			label1 = element("label");
  			label1.textContent = "разного типа";
  			t13 = space();
  			div7 = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все дороги (${/*optRoadTypes*/ ctx[94].reduce(/*func_3*/ ctx[164], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			add_location(b, file$6, 1153, 31, 37817);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1153, 2, 37788);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_hearth*/ ctx[24];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1155, 32, 37908);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1155, 3, 37879);
  			attr_dev(input1, "type", "text");
  			input1.value = /*id_dtp*/ ctx[19];
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1156, 30, 38011);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1156, 3, 37984);
  			add_location(legend, file$6, 1159, 5, 38128);
  			attr_dev(div3, "class", "pLine margin svelte-1jsovbn");
  			add_location(div3, file$6, 1161, 6, 38202);
  			attr_dev(div4, "class", "pLine type svelte-1jsovbn");
  			add_location(div4, file$6, 1160, 5, 38171);
  			add_location(fieldset, file$6, 1158, 4, 38112);
  			attr_dev(div5, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div5, file$6, 1157, 3, 38081);
  			attr_dev(input2, "type", "checkbox");
  			attr_dev(input2, "id", "ht_3");
  			input2.checked = input2_checked_value = /*ht*/ ctx[23].hearth3;
  			attr_dev(input2, "name", "hearth3");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$6, 1170, 4, 38575);
  			attr_dev(label0, "for", "ht_3");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1170, 95, 38666);
  			attr_dev(input3, "type", "checkbox");
  			attr_dev(input3, "id", "ht_5");
  			input3.checked = input3_checked_value = /*ht*/ ctx[23].hearth5;
  			attr_dev(input3, "name", "hearth5");
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$6, 1171, 4, 38708);
  			attr_dev(label1, "for", "ht_5");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1171, 95, 38799);
  			attr_dev(div6, "class", "pLine svelte-1jsovbn");
  			add_location(div6, file$6, 1169, 3, 38551);
  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$6, 1175, 5, 38984);
  			attr_dev(select, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select.multiple = true;
  			if (/*roads*/ ctx[22] === void 0) add_render_callback(() => /*select_change_handler_2*/ ctx[165].call(select));
  			add_location(select, file$6, 1174, 4, 38875);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$6, 1173, 3, 38851);
  			attr_dev(div8, "class", "filtersCont svelte-1jsovbn");
  			add_location(div8, file$6, 1154, 2, 37850);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div8, anchor);
  			append_dev(div8, div1);
  			append_dev(div1, t3);
  			append_dev(div1, input0);
  			append_dev(div8, t4);
  			append_dev(div8, div2);
  			append_dev(div2, t5);
  			append_dev(div2, input1);
  			append_dev(div8, t6);
  			append_dev(div8, div5);
  			append_dev(div5, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t8);
  			append_dev(fieldset, div4);
  			append_dev(div4, div3);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div3, null);
  			}

  			append_dev(div8, t9);
  			append_dev(div8, div6);
  			append_dev(div6, input2);
  			append_dev(div6, label0);
  			append_dev(div6, t11);
  			append_dev(div6, input3);
  			append_dev(div6, label1);
  			append_dev(div8, t13);
  			append_dev(div8, div7);
  			append_dev(div7, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*roads*/ ctx[22]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdHearth*/ ctx[109], false, false, false),
  				listen_dev(input1, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input2, "change", /*oncheckHt*/ ctx[110], false, false, false),
  				listen_dev(input3, "change", /*oncheckHt*/ ctx[110], false, false, false),
  				listen_dev(select, "change", /*select_change_handler_2*/ ctx[165]),
  				listen_dev(select, "change", /*setFilterHearthsPicket*/ ctx[105], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_hearth*/ 16777216 && input0.value !== /*id_hearth*/ ctx[24]) {
  				prop_dev(input0, "value", /*id_hearth*/ ctx[24]);
  			}

  			if (dirty[0] & /*id_dtp*/ 524288 && input1.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input1, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[0] & /*DtpHearthsPicket*/ 4 | dirty[1] & /*hearths_year_Picket*/ 256 | dirty[3] & /*setFilterHearthsPicket*/ 4096) {
  				each_value_24 = Object.keys(/*DtpHearthsPicket*/ ctx[2]._opt.years).sort();
  				validate_each_argument(each_value_24);
  				let i;

  				for (i = 0; i < each_value_24.length; i += 1) {
  					const child_ctx = get_each_context_24(ctx, each_value_24, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_24(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div3, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_24.length;
  			}

  			if (dirty[0] & /*ht*/ 8388608 && input2_checked_value !== (input2_checked_value = /*ht*/ ctx[23].hearth3)) {
  				prop_dev(input2, "checked", input2_checked_value);
  			}

  			if (dirty[0] & /*ht*/ 8388608 && input3_checked_value !== (input3_checked_value = /*ht*/ ctx[23].hearth5)) {
  				prop_dev(input3, "checked", input3_checked_value);
  			}

  			if (dirty[3] & /*optRoadTypes, optDataHearthsPicket*/ 3) {
  				each_value_23 = /*optRoadTypes*/ ctx[94];
  				validate_each_argument(each_value_23);
  				let i;

  				for (i = 0; i < each_value_23.length; i += 1) {
  					const child_ctx = get_each_context_23(ctx, each_value_23, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_23(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_23.length;
  			}

  			if (dirty[0] & /*roads*/ 4194304) {
  				select_options(select, /*roads*/ ctx[22]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div8);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_24.name,
  		type: "if",
  		source: "(1153:2) {#if DtpHearthsPicket._map && DtpHearthsPicket._opt && DtpHearthsPicket._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1163:6) {#each Object.keys(DtpHearthsPicket._opt.years).sort() as key}
  function create_each_block_24(ctx) {
  	let input;
  	let input_checked_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[213] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_Picket");
  			input.checked = input_checked_value = /*hearths_year_Picket*/ ctx[39][/*key*/ ctx[213]];
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[213]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1163, 7, 38305);
  			attr_dev(label, "for", "hearths_year_Picket");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1163, 138, 38436);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsPicket*/ ctx[105], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsPicket*/ 4 | dirty[1] & /*hearths_year_Picket*/ 256 && input_checked_value !== (input_checked_value = /*hearths_year_Picket*/ ctx[39][/*key*/ ctx[213]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[0] & /*DtpHearthsPicket*/ 4 && input_name_value !== (input_name_value = /*key*/ ctx[213])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsPicket*/ 4 && t_value !== (t_value = /*key*/ ctx[213] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_24.name,
  		type: "each",
  		source: "(1163:6) {#each Object.keys(DtpHearthsPicket._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1179:5) {#each optRoadTypes as key}
  function create_each_block_23(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsPicket*/ ctx[93].road[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "road_" + /*key*/ ctx[213] + " svelte-1jsovbn");
  			add_location(option, file$6, 1179, 6, 39160);
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
  		id: create_each_block_23.name,
  		type: "each",
  		source: "(1179:5) {#each optRoadTypes as key}",
  		ctx
  	});

  	return block;
  }

  // (1189:2) {#if DtpHearths5._map && DtpHearths5._opt && DtpHearths5._opt.years}
  function create_if_block_23(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div7;
  	let div1;
  	let t3;
  	let input0;
  	let t4;
  	let div4;
  	let fieldset;
  	let legend;
  	let t6;
  	let div3;
  	let input1;
  	let input1_value_value;
  	let input1_checked_value;
  	let label;
  	let t8;
  	let div2;
  	let t9;
  	let div5;
  	let select0;
  	let option0;
  	let t13;
  	let div6;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_22 = Object.keys(/*DtpHearths5*/ ctx[3]._opt.years).sort();
  	validate_each_argument(each_value_22);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_22.length; i += 1) {
  		each_blocks_1[i] = create_each_block_22(get_each_context_22(ctx, each_value_22, i));
  	}

  	let each_value_21 = /*optTypeHearths5Keys*/ ctx[90];
  	validate_each_argument(each_value_21);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_21.length; i += 1) {
  		each_blocks[i] = create_each_block_21(get_each_context_21(ctx, each_value_21, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги (5)";
  			t2 = space();
  			div7 = element("div");
  			div1 = element("div");
  			t3 = text("ID ДТП: ");
  			input0 = element("input");
  			t4 = space();
  			div4 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t6 = space();
  			div3 = element("div");
  			input1 = element("input");
  			label = element("label");
  			label.textContent = "Фильтрация по годам";
  			t8 = space();
  			div2 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t9 = space();
  			div5 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все типы (${/*optTypeHearths5Keys*/ ctx[90].reduce(/*func_4*/ ctx[167], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t13 = space();
  			div6 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearths5*/ ctx[89].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearths5*/ ctx[89].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearths5*/ ctx[89].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearths5*/ ctx[89].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearths5*/ ctx[89].stricken[4] || 0}) С пострадавшими и погибшими`;
  			add_location(b, file$6, 1189, 31, 39423);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1189, 2, 39394);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[19];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1191, 30, 39508);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1191, 3, 39481);
  			add_location(legend, file$6, 1194, 4, 39623);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 1;
  			input1.value = input1.__value;
  			input1.checked = input1_checked_value = /*hearths_period_type_5*/ ctx[46] === 1;
  			attr_dev(input1, "id", "hearths_period_type_51");
  			attr_dev(input1, "name", "hearths_period_type_5");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[158][4].push(input1);
  			add_location(input1, file$6, 1196, 5, 39698);
  			attr_dev(label, "for", "hearths_period_type_51");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1196, 195, 39888);
  			attr_dev(div2, "class", "pLine margin svelte-1jsovbn");
  			add_location(div2, file$6, 1197, 5, 39957);
  			attr_dev(div3, "class", "pLine type svelte-1jsovbn");
  			add_location(div3, file$6, 1195, 4, 39668);
  			add_location(fieldset, file$6, 1193, 3, 39608);
  			attr_dev(div4, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div4, file$6, 1192, 3, 39578);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$6, 1207, 5, 40451);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_type5*/ ctx[45] === void 0) add_render_callback(() => /*select0_change_handler_1*/ ctx[168].call(select0));
  			add_location(select0, file$6, 1206, 4, 40338);
  			attr_dev(div5, "class", "pLine svelte-1jsovbn");
  			add_location(div5, file$6, 1205, 3, 40314);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$6, 1219, 5, 40925);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$6, 1220, 5, 41003);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$6, 1221, 5, 41089);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$6, 1222, 5, 41179);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$6, 1223, 5, 41276);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken5*/ ctx[44] === void 0) add_render_callback(() => /*select1_change_handler_1*/ ctx[169].call(select1));
  			add_location(select1, file$6, 1218, 4, 40848);
  			attr_dev(div6, "class", "pLine svelte-1jsovbn");
  			add_location(div6, file$6, 1217, 3, 40824);
  			attr_dev(div7, "class", "filtersCont svelte-1jsovbn");
  			add_location(div7, file$6, 1190, 2, 39452);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div7, anchor);
  			append_dev(div7, div1);
  			append_dev(div1, t3);
  			append_dev(div1, input0);
  			append_dev(div7, t4);
  			append_dev(div7, div4);
  			append_dev(div4, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t6);
  			append_dev(fieldset, div3);
  			append_dev(div3, input1);
  			input1.checked = input1.__value === /*hearths_period_type_5*/ ctx[46];
  			append_dev(div3, label);
  			append_dev(div3, t8);
  			append_dev(div3, div2);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div2, null);
  			}

  			append_dev(div7, t9);
  			append_dev(div7, div5);
  			append_dev(div5, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*str_icon_type5*/ ctx[45]);
  			append_dev(div7, t13);
  			append_dev(div7, div6);
  			append_dev(div6, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken5*/ ctx[44]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input1, "change", /*setFilterHearths5*/ ctx[124], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler*/ ctx[166]),
  				listen_dev(select0, "change", /*select0_change_handler_1*/ ctx[168]),
  				listen_dev(select0, "change", /*setFilterHearths5*/ ctx[124], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_1*/ ctx[169]),
  				listen_dev(select1, "change", /*setFilterHearths5*/ ctx[124], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input0.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[1] & /*hearths_period_type_5*/ 32768 && input1_checked_value !== (input1_checked_value = /*hearths_period_type_5*/ ctx[46] === 1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_5*/ 32768) {
  				input1.checked = input1.__value === /*hearths_period_type_5*/ ctx[46];
  			}

  			if (dirty[0] & /*DtpHearths5*/ 8 | dirty[1] & /*hearths_year_5, hearths_period_type_5*/ 98304 | dirty[4] & /*setFilterHearths5*/ 1) {
  				each_value_22 = Object.keys(/*DtpHearths5*/ ctx[3]._opt.years).sort();
  				validate_each_argument(each_value_22);
  				let i;

  				for (i = 0; i < each_value_22.length; i += 1) {
  					const child_ctx = get_each_context_22(ctx, each_value_22, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_22(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div2, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_22.length;
  			}

  			if (dirty[2] & /*optTypeHearths5Keys, optDataHearths5*/ 402653184) {
  				each_value_21 = /*optTypeHearths5Keys*/ ctx[90];
  				validate_each_argument(each_value_21);
  				let i;

  				for (i = 0; i < each_value_21.length; i += 1) {
  					const child_ctx = get_each_context_21(ctx, each_value_21, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_21(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_21.length;
  			}

  			if (dirty[1] & /*str_icon_type5*/ 16384) {
  				select_options(select0, /*str_icon_type5*/ ctx[45]);
  			}

  			if (dirty[1] & /*hearths_stricken5*/ 8192) {
  				select_option(select1, /*hearths_stricken5*/ ctx[44]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div7);
  			/*$$binding_groups*/ ctx[158][4].splice(/*$$binding_groups*/ ctx[158][4].indexOf(input1), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_23.name,
  		type: "if",
  		source: "(1189:2) {#if DtpHearths5._map && DtpHearths5._opt && DtpHearths5._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1199:5) {#each Object.keys(DtpHearths5._opt.years).sort() as key}
  function create_each_block_22(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[213] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_5");
  			input.checked = input_checked_value = /*hearths_year_5*/ ctx[47][/*key*/ ctx[213]];
  			input.disabled = input_disabled_value = /*hearths_period_type_5*/ ctx[46] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[213]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1199, 6, 40053);
  			attr_dev(label, "for", "hearths_year_5");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1199, 161, 40208);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths5*/ ctx[124], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths5*/ 8 | dirty[1] & /*hearths_year_5*/ 65536 && input_checked_value !== (input_checked_value = /*hearths_year_5*/ ctx[47][/*key*/ ctx[213]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_5*/ 32768 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_5*/ ctx[46] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths5*/ 8 && input_name_value !== (input_name_value = /*key*/ ctx[213])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths5*/ 8 && t_value !== (t_value = /*key*/ ctx[213] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_22.name,
  		type: "each",
  		source: "(1199:5) {#each Object.keys(DtpHearths5._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1211:5) {#each optTypeHearths5Keys as key}
  function create_each_block_21(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearths5*/ ctx[89].str_icon_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearths5*/ ctx[89].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1211, 6, 40643);
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
  		id: create_each_block_21.name,
  		type: "each",
  		source: "(1211:5) {#each optTypeHearths5Keys as key}",
  		ctx
  	});

  	return block;
  }

  // (1230:2) {#if DtpHearths3._map && DtpHearths3._opt && DtpHearths3._opt.years}
  function create_if_block_22(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div7;
  	let div1;
  	let t3;
  	let input0;
  	let t4;
  	let div4;
  	let fieldset;
  	let legend;
  	let t6;
  	let div3;
  	let input1;
  	let input1_value_value;
  	let input1_checked_value;
  	let label;
  	let t8;
  	let div2;
  	let t9;
  	let div5;
  	let select0;
  	let option0;
  	let t13;
  	let div6;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_20 = Object.keys(/*DtpHearths3*/ ctx[4]._opt.years).sort();
  	validate_each_argument(each_value_20);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_20.length; i += 1) {
  		each_blocks_1[i] = create_each_block_20(get_each_context_20(ctx, each_value_20, i));
  	}

  	let each_value_19 = /*optTypeHearths3Keys*/ ctx[88];
  	validate_each_argument(each_value_19);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_19.length; i += 1) {
  		each_blocks[i] = create_each_block_19(get_each_context_19(ctx, each_value_19, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги (3)";
  			t2 = space();
  			div7 = element("div");
  			div1 = element("div");
  			t3 = text("ID ДТП: ");
  			input0 = element("input");
  			t4 = space();
  			div4 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t6 = space();
  			div3 = element("div");
  			input1 = element("input");
  			label = element("label");
  			label.textContent = "Фильтрация по годам";
  			t8 = space();
  			div2 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t9 = space();
  			div5 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все типы (${/*optTypeHearths3Keys*/ ctx[88].reduce(/*func_5*/ ctx[171], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t13 = space();
  			div6 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearths3*/ ctx[87].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearths3*/ ctx[87].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearths3*/ ctx[87].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearths3*/ ctx[87].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearths3*/ ctx[87].stricken[4] || 0}) С пострадавшими и погибшими`;
  			add_location(b, file$6, 1230, 31, 41510);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1230, 2, 41481);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[19];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1232, 30, 41595);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1232, 3, 41568);
  			add_location(legend, file$6, 1235, 4, 41710);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 1;
  			input1.value = input1.__value;
  			input1.checked = input1_checked_value = /*hearths_period_type_3*/ ctx[50] === 1;
  			attr_dev(input1, "id", "hearths_period_type_31");
  			attr_dev(input1, "name", "hearths_period_type_3");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[158][3].push(input1);
  			add_location(input1, file$6, 1237, 5, 41785);
  			attr_dev(label, "for", "hearths_period_type_31");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1237, 195, 41975);
  			attr_dev(div2, "class", "pLine margin svelte-1jsovbn");
  			add_location(div2, file$6, 1238, 5, 42044);
  			attr_dev(div3, "class", "pLine type svelte-1jsovbn");
  			add_location(div3, file$6, 1236, 4, 41755);
  			add_location(fieldset, file$6, 1234, 3, 41695);
  			attr_dev(div4, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div4, file$6, 1233, 3, 41665);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$6, 1248, 5, 42538);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_type3*/ ctx[49] === void 0) add_render_callback(() => /*select0_change_handler_2*/ ctx[172].call(select0));
  			add_location(select0, file$6, 1247, 4, 42425);
  			attr_dev(div5, "class", "pLine svelte-1jsovbn");
  			add_location(div5, file$6, 1246, 3, 42401);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$6, 1260, 5, 43012);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$6, 1261, 5, 43090);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$6, 1262, 5, 43176);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$6, 1263, 5, 43266);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$6, 1264, 5, 43363);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken3*/ ctx[48] === void 0) add_render_callback(() => /*select1_change_handler_2*/ ctx[173].call(select1));
  			add_location(select1, file$6, 1259, 4, 42935);
  			attr_dev(div6, "class", "pLine svelte-1jsovbn");
  			add_location(div6, file$6, 1258, 3, 42911);
  			attr_dev(div7, "class", "filtersCont svelte-1jsovbn");
  			add_location(div7, file$6, 1231, 2, 41539);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div7, anchor);
  			append_dev(div7, div1);
  			append_dev(div1, t3);
  			append_dev(div1, input0);
  			append_dev(div7, t4);
  			append_dev(div7, div4);
  			append_dev(div4, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t6);
  			append_dev(fieldset, div3);
  			append_dev(div3, input1);
  			input1.checked = input1.__value === /*hearths_period_type_3*/ ctx[50];
  			append_dev(div3, label);
  			append_dev(div3, t8);
  			append_dev(div3, div2);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div2, null);
  			}

  			append_dev(div7, t9);
  			append_dev(div7, div5);
  			append_dev(div5, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*str_icon_type3*/ ctx[49]);
  			append_dev(div7, t13);
  			append_dev(div7, div6);
  			append_dev(div6, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken3*/ ctx[48]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input1, "change", /*setFilterHearths3*/ ctx[125], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_1*/ ctx[170]),
  				listen_dev(select0, "change", /*select0_change_handler_2*/ ctx[172]),
  				listen_dev(select0, "change", /*setFilterHearths3*/ ctx[125], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_2*/ ctx[173]),
  				listen_dev(select1, "change", /*setFilterHearths3*/ ctx[125], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input0.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[1] & /*hearths_period_type_3*/ 524288 && input1_checked_value !== (input1_checked_value = /*hearths_period_type_3*/ ctx[50] === 1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_3*/ 524288) {
  				input1.checked = input1.__value === /*hearths_period_type_3*/ ctx[50];
  			}

  			if (dirty[0] & /*DtpHearths3*/ 16 | dirty[1] & /*hearths_year_3, hearths_period_type_3*/ 1572864 | dirty[4] & /*setFilterHearths3*/ 2) {
  				each_value_20 = Object.keys(/*DtpHearths3*/ ctx[4]._opt.years).sort();
  				validate_each_argument(each_value_20);
  				let i;

  				for (i = 0; i < each_value_20.length; i += 1) {
  					const child_ctx = get_each_context_20(ctx, each_value_20, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_20(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div2, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_20.length;
  			}

  			if (dirty[2] & /*optTypeHearths3Keys, optDataHearths3*/ 100663296) {
  				each_value_19 = /*optTypeHearths3Keys*/ ctx[88];
  				validate_each_argument(each_value_19);
  				let i;

  				for (i = 0; i < each_value_19.length; i += 1) {
  					const child_ctx = get_each_context_19(ctx, each_value_19, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_19(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_19.length;
  			}

  			if (dirty[1] & /*str_icon_type3*/ 262144) {
  				select_options(select0, /*str_icon_type3*/ ctx[49]);
  			}

  			if (dirty[1] & /*hearths_stricken3*/ 131072) {
  				select_option(select1, /*hearths_stricken3*/ ctx[48]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div7);
  			/*$$binding_groups*/ ctx[158][3].splice(/*$$binding_groups*/ ctx[158][3].indexOf(input1), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_22.name,
  		type: "if",
  		source: "(1230:2) {#if DtpHearths3._map && DtpHearths3._opt && DtpHearths3._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1240:5) {#each Object.keys(DtpHearths3._opt.years).sort() as key}
  function create_each_block_20(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[213] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_3");
  			input.checked = input_checked_value = /*hearths_year_3*/ ctx[51][/*key*/ ctx[213]];
  			input.disabled = input_disabled_value = /*hearths_period_type_3*/ ctx[50] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[213]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1240, 6, 42140);
  			attr_dev(label, "for", "hearths_year_3");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1240, 161, 42295);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths3*/ ctx[125], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths3*/ 16 | dirty[1] & /*hearths_year_3*/ 1048576 && input_checked_value !== (input_checked_value = /*hearths_year_3*/ ctx[51][/*key*/ ctx[213]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_3*/ 524288 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_3*/ ctx[50] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths3*/ 16 && input_name_value !== (input_name_value = /*key*/ ctx[213])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths3*/ 16 && t_value !== (t_value = /*key*/ ctx[213] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_20.name,
  		type: "each",
  		source: "(1240:5) {#each Object.keys(DtpHearths3._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1252:5) {#each optTypeHearths3Keys as key}
  function create_each_block_19(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearths3*/ ctx[87].str_icon_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearths3*/ ctx[87].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1252, 6, 42730);
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
  		id: create_each_block_19.name,
  		type: "each",
  		source: "(1252:5) {#each optTypeHearths3Keys as key}",
  		ctx
  	});

  	return block;
  }

  // (1271:2) {#if DtpHearthsStat._map && DtpHearthsStat._opt && DtpHearthsStat._opt.years}
  function create_if_block_21(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div9;
  	let div1;
  	let t3;
  	let input0;
  	let t4;
  	let div6;
  	let fieldset;
  	let legend;
  	let t6;
  	let div3;
  	let input1;
  	let input1_value_value;
  	let input1_checked_value;
  	let label0;
  	let t8;
  	let div2;
  	let t9;
  	let div5;
  	let input2;
  	let input2_value_value;
  	let label1;
  	let t11;
  	let div4;
  	let t12;
  	let div7;
  	let select0;
  	let option0;
  	let t16;
  	let div8;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_18 = Object.keys(/*DtpHearthsStat*/ ctx[14]._opt.years).sort();
  	validate_each_argument(each_value_18);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_18.length; i += 1) {
  		each_blocks_2[i] = create_each_block_18(get_each_context_18(ctx, each_value_18, i));
  	}

  	let each_value_16 = Object.keys(/*DtpHearthsStat*/ ctx[14]._opt.years).sort();
  	validate_each_argument(each_value_16);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_16.length; i += 1) {
  		each_blocks_1[i] = create_each_block_16(get_each_context_16(ctx, each_value_16, i));
  	}

  	let each_value_15 = /*optTypeHearthsStatKeys*/ ctx[86];
  	validate_each_argument(each_value_15);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_15.length; i += 1) {
  		each_blocks[i] = create_each_block_15(get_each_context_15(ctx, each_value_15, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги (Stat)";
  			t2 = space();
  			div9 = element("div");
  			div1 = element("div");
  			t3 = text("ID ДТП: ");
  			input0 = element("input");
  			t4 = space();
  			div6 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t6 = space();
  			div3 = element("div");
  			input1 = element("input");
  			label0 = element("label");
  			label0.textContent = "Фильтрация по годам";
  			t8 = space();
  			div2 = element("div");

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].c();
  			}

  			t9 = space();
  			div5 = element("div");
  			input2 = element("input");
  			label1 = element("label");
  			label1.textContent = "Фильтрация по кварталам";
  			t11 = space();
  			div4 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t12 = space();
  			div7 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все типы (${/*optTypeHearthsStatKeys*/ ctx[86].reduce(/*func_6*/ ctx[176], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t16 = space();
  			div8 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearthsStat*/ ctx[85].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearthsStat*/ ctx[85].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearthsStat*/ ctx[85].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearthsStat*/ ctx[85].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearthsStat*/ ctx[85].stricken[4] || 0}) С пострадавшими и погибшими`;
  			add_location(b, file$6, 1271, 31, 43606);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1271, 2, 43577);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[19];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1273, 30, 43694);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1273, 3, 43667);
  			add_location(legend, file$6, 1276, 4, 43809);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 1;
  			input1.value = input1.__value;
  			input1.checked = input1_checked_value = /*hearths_period_type_Stat*/ ctx[54] === 1;
  			attr_dev(input1, "id", "hearths_period_type_Stat1");
  			attr_dev(input1, "name", "hearths_period_type_Stat");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[158][2].push(input1);
  			add_location(input1, file$6, 1278, 5, 43884);
  			attr_dev(label0, "for", "hearths_period_type_Stat1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1278, 210, 44089);
  			attr_dev(div2, "class", "pLine margin svelte-1jsovbn");
  			add_location(div2, file$6, 1279, 5, 44161);
  			attr_dev(div3, "class", "pLine type svelte-1jsovbn");
  			add_location(div3, file$6, 1277, 4, 43854);
  			attr_dev(input2, "type", "radio");
  			input2.__value = input2_value_value = 2;
  			input2.value = input2.__value;
  			attr_dev(input2, "id", "hearths_period_type_Stat2");
  			attr_dev(input2, "name", "hearths_period_type_Stat");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[158][2].push(input2);
  			add_location(input2, file$6, 1286, 4, 44541);
  			attr_dev(label1, "for", "hearths_period_type_Stat2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1286, 168, 44705);
  			attr_dev(div4, "class", "pLine margin svelte-1jsovbn");
  			add_location(div4, file$6, 1287, 5, 44781);
  			attr_dev(div5, "class", "pLine type svelte-1jsovbn");
  			add_location(div5, file$6, 1285, 4, 44512);
  			add_location(fieldset, file$6, 1275, 3, 43794);
  			attr_dev(div6, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div6, file$6, 1274, 3, 43764);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$6, 1300, 5, 45475);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_typeStat*/ ctx[53] === void 0) add_render_callback(() => /*select0_change_handler_3*/ ctx[177].call(select0));
  			add_location(select0, file$6, 1299, 4, 45356);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$6, 1298, 3, 45332);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$6, 1312, 5, 45970);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$6, 1313, 5, 46051);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$6, 1314, 5, 46140);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$6, 1315, 5, 46233);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$6, 1316, 5, 46333);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_strickenStat*/ ctx[52] === void 0) add_render_callback(() => /*select1_change_handler_3*/ ctx[178].call(select1));
  			add_location(select1, file$6, 1311, 4, 45887);
  			attr_dev(div8, "class", "pLine svelte-1jsovbn");
  			add_location(div8, file$6, 1310, 3, 45863);
  			attr_dev(div9, "class", "filtersCont svelte-1jsovbn");
  			add_location(div9, file$6, 1272, 2, 43638);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div9, anchor);
  			append_dev(div9, div1);
  			append_dev(div1, t3);
  			append_dev(div1, input0);
  			append_dev(div9, t4);
  			append_dev(div9, div6);
  			append_dev(div6, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t6);
  			append_dev(fieldset, div3);
  			append_dev(div3, input1);
  			input1.checked = input1.__value === /*hearths_period_type_Stat*/ ctx[54];
  			append_dev(div3, label0);
  			append_dev(div3, t8);
  			append_dev(div3, div2);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(div2, null);
  			}

  			append_dev(fieldset, t9);
  			append_dev(fieldset, div5);
  			append_dev(div5, input2);
  			input2.checked = input2.__value === /*hearths_period_type_Stat*/ ctx[54];
  			append_dev(div5, label1);
  			append_dev(div5, t11);
  			append_dev(div5, div4);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div4, null);
  			}

  			append_dev(div9, t12);
  			append_dev(div9, div7);
  			append_dev(div7, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*str_icon_typeStat*/ ctx[53]);
  			append_dev(div9, t16);
  			append_dev(div9, div8);
  			append_dev(div8, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_strickenStat*/ ctx[52]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input1, "change", /*setFilterHearthsStat*/ ctx[126], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_2*/ ctx[174]),
  				listen_dev(input2, "change", /*setFilterHearthsStat*/ ctx[126], false, false, false),
  				listen_dev(input2, "change", /*input2_change_handler_1*/ ctx[175]),
  				listen_dev(select0, "change", /*select0_change_handler_3*/ ctx[177]),
  				listen_dev(select0, "change", /*setFilterHearthsStat*/ ctx[126], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_3*/ ctx[178]),
  				listen_dev(select1, "change", /*setFilterHearthsStat*/ ctx[126], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input0.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 8388608 && input1_checked_value !== (input1_checked_value = /*hearths_period_type_Stat*/ ctx[54] === 1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 8388608) {
  				input1.checked = input1.__value === /*hearths_period_type_Stat*/ ctx[54];
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 16384 | dirty[1] & /*hearths_year_Stat, hearths_period_type_Stat*/ 25165824 | dirty[4] & /*setFilterHearthsStat*/ 4) {
  				each_value_18 = Object.keys(/*DtpHearthsStat*/ ctx[14]._opt.years).sort();
  				validate_each_argument(each_value_18);
  				let i;

  				for (i = 0; i < each_value_18.length; i += 1) {
  					const child_ctx = get_each_context_18(ctx, each_value_18, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_2[i] = create_each_block_18(child_ctx);
  						each_blocks_2[i].c();
  						each_blocks_2[i].m(div2, null);
  					}
  				}

  				for (; i < each_blocks_2.length; i += 1) {
  					each_blocks_2[i].d(1);
  				}

  				each_blocks_2.length = each_value_18.length;
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 8388608) {
  				input2.checked = input2.__value === /*hearths_period_type_Stat*/ ctx[54];
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 16384 | dirty[1] & /*hearths_quarter_Stat, hearths_period_type_Stat*/ 41943040 | dirty[4] & /*setFilterHearthsStat*/ 4) {
  				each_value_16 = Object.keys(/*DtpHearthsStat*/ ctx[14]._opt.years).sort();
  				validate_each_argument(each_value_16);
  				let i;

  				for (i = 0; i < each_value_16.length; i += 1) {
  					const child_ctx = get_each_context_16(ctx, each_value_16, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_16(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div4, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_16.length;
  			}

  			if (dirty[2] & /*optTypeHearthsStatKeys, optDataHearthsStat*/ 25165824) {
  				each_value_15 = /*optTypeHearthsStatKeys*/ ctx[86];
  				validate_each_argument(each_value_15);
  				let i;

  				for (i = 0; i < each_value_15.length; i += 1) {
  					const child_ctx = get_each_context_15(ctx, each_value_15, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_15(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_15.length;
  			}

  			if (dirty[1] & /*str_icon_typeStat*/ 4194304) {
  				select_options(select0, /*str_icon_typeStat*/ ctx[53]);
  			}

  			if (dirty[1] & /*hearths_strickenStat*/ 2097152) {
  				select_option(select1, /*hearths_strickenStat*/ ctx[52]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div9);
  			/*$$binding_groups*/ ctx[158][2].splice(/*$$binding_groups*/ ctx[158][2].indexOf(input1), 1);
  			destroy_each(each_blocks_2, detaching);
  			/*$$binding_groups*/ ctx[158][2].splice(/*$$binding_groups*/ ctx[158][2].indexOf(input2), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_21.name,
  		type: "if",
  		source: "(1271:2) {#if DtpHearthsStat._map && DtpHearthsStat._opt && DtpHearthsStat._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1281:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}
  function create_each_block_18(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[213] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_Stat");
  			input.checked = input_checked_value = /*hearths_year_Stat*/ ctx[55][/*key*/ ctx[213]];
  			input.disabled = input_disabled_value = /*hearths_period_type_Stat*/ ctx[54] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[213]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1281, 6, 44260);
  			attr_dev(label, "for", "hearths_year_Stat");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1281, 173, 44427);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsStat*/ ctx[126], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsStat*/ 16384 | dirty[1] & /*hearths_year_Stat*/ 16777216 && input_checked_value !== (input_checked_value = /*hearths_year_Stat*/ ctx[55][/*key*/ ctx[213]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 8388608 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_Stat*/ ctx[54] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 16384 && input_name_value !== (input_name_value = /*key*/ ctx[213])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 16384 && t_value !== (t_value = /*key*/ ctx[213] + "")) set_data_dev(t, t_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(input);
  			if (detaching) detach_dev(label);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_18.name,
  		type: "each",
  		source: "(1281:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1290:6) {#each Object.keys(DtpHearthsStat._opt.years[key]).sort() as key1}
  function create_each_block_17(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t0_value = /*key1*/ ctx[232] + "";
  	let t0;
  	let t1;
  	let t2_value = /*key*/ ctx[213] + "";
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
  			input.checked = input_checked_value = /*hearths_quarter_Stat*/ ctx[56][/*key*/ ctx[213]] && /*hearths_quarter_Stat*/ ctx[56][/*key*/ ctx[213]][/*key1*/ ctx[232]];
  			input.disabled = input_disabled_value = /*hearths_period_type_Stat*/ ctx[54] === 1;
  			attr_dev(input, "name", input_name_value = "" + (/*key*/ ctx[213] + "_" + /*key1*/ ctx[232]));
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1290, 7, 44954);
  			attr_dev(label, "for", label_for_value = "hearths_quarter_Stat_" + /*key*/ ctx[213] + "_" + /*key1*/ ctx[232]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1290, 222, 45169);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t0);
  			append_dev(label, t1);
  			append_dev(label, t2);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsStat*/ ctx[126], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsStat*/ 16384 | dirty[1] & /*hearths_quarter_Stat*/ 33554432 && input_checked_value !== (input_checked_value = /*hearths_quarter_Stat*/ ctx[56][/*key*/ ctx[213]] && /*hearths_quarter_Stat*/ ctx[56][/*key*/ ctx[213]][/*key1*/ ctx[232]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 8388608 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_Stat*/ ctx[54] === 1)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 16384 && input_name_value !== (input_name_value = "" + (/*key*/ ctx[213] + "_" + /*key1*/ ctx[232]))) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 16384 && t0_value !== (t0_value = /*key1*/ ctx[232] + "")) set_data_dev(t0, t0_value);
  			if (dirty[0] & /*DtpHearthsStat*/ 16384 && t2_value !== (t2_value = /*key*/ ctx[213] + "")) set_data_dev(t2, t2_value);

  			if (dirty[0] & /*DtpHearthsStat*/ 16384 && label_for_value !== (label_for_value = "hearths_quarter_Stat_" + /*key*/ ctx[213] + "_" + /*key1*/ ctx[232])) {
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
  		id: create_each_block_17.name,
  		type: "each",
  		source: "(1290:6) {#each Object.keys(DtpHearthsStat._opt.years[key]).sort() as key1}",
  		ctx
  	});

  	return block;
  }

  // (1289:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}
  function create_each_block_16(ctx) {
  	let t;
  	let br;
  	let each_value_17 = Object.keys(/*DtpHearthsStat*/ ctx[14]._opt.years[/*key*/ ctx[213]]).sort();
  	validate_each_argument(each_value_17);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_17.length; i += 1) {
  		each_blocks[i] = create_each_block_17(get_each_context_17(ctx, each_value_17, i));
  	}

  	const block = {
  		c: function create() {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t = space();
  			br = element("br");
  			add_location(br, file$6, 1292, 6, 45261);
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, t, anchor);
  			insert_dev(target, br, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsStat*/ 16384 | dirty[1] & /*hearths_quarter_Stat, hearths_period_type_Stat*/ 41943040 | dirty[4] & /*setFilterHearthsStat*/ 4) {
  				each_value_17 = Object.keys(/*DtpHearthsStat*/ ctx[14]._opt.years[/*key*/ ctx[213]]).sort();
  				validate_each_argument(each_value_17);
  				let i;

  				for (i = 0; i < each_value_17.length; i += 1) {
  					const child_ctx = get_each_context_17(ctx, each_value_17, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_17(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(t.parentNode, t);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_17.length;
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
  		id: create_each_block_16.name,
  		type: "each",
  		source: "(1289:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1304:5) {#each optTypeHearthsStatKeys as key}
  function create_each_block_15(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsStat*/ ctx[85].str_icon_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearthsStat*/ ctx[85].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1304, 6, 45676);
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
  		id: create_each_block_15.name,
  		type: "each",
  		source: "(1304:5) {#each optTypeHearthsStatKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1323:2) {#if DtpHearthsTmp._map && DtpHearthsTmp._opt && DtpHearthsTmp._opt.years}
  function create_if_block_20(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div9;
  	let div1;
  	let t3;
  	let input0;
  	let t4;
  	let div6;
  	let fieldset;
  	let legend;
  	let t6;
  	let div3;
  	let input1;
  	let input1_value_value;
  	let input1_checked_value;
  	let label0;
  	let t8;
  	let div2;
  	let t9;
  	let div5;
  	let input2;
  	let input2_value_value;
  	let label1;
  	let t11;
  	let div4;
  	let t12;
  	let div7;
  	let select0;
  	let option0;
  	let t16;
  	let div8;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_14 = Object.keys(/*DtpHearthsTmp*/ ctx[15]._opt.years).sort();
  	validate_each_argument(each_value_14);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_14.length; i += 1) {
  		each_blocks_2[i] = create_each_block_14(get_each_context_14(ctx, each_value_14, i));
  	}

  	let each_value_12 = Object.keys(/*DtpHearthsTmp*/ ctx[15]._opt.years).sort();
  	validate_each_argument(each_value_12);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_12.length; i += 1) {
  		each_blocks_1[i] = create_each_block_12(get_each_context_12(ctx, each_value_12, i));
  	}

  	let each_value_11 = /*optTypeHearthsTmpKeys*/ ctx[84];
  	validate_each_argument(each_value_11);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_11.length; i += 1) {
  		each_blocks[i] = create_each_block_11(get_each_context_11(ctx, each_value_11, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги (TMP)";
  			t2 = space();
  			div9 = element("div");
  			div1 = element("div");
  			t3 = text("ID ДТП: ");
  			input0 = element("input");
  			t4 = space();
  			div6 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t6 = space();
  			div3 = element("div");
  			input1 = element("input");
  			label0 = element("label");
  			label0.textContent = "Фильтрация по годам";
  			t8 = space();
  			div2 = element("div");

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].c();
  			}

  			t9 = space();
  			div5 = element("div");
  			input2 = element("input");
  			label1 = element("label");
  			label1.textContent = "Фильтрация по кварталам";
  			t11 = space();
  			div4 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t12 = space();
  			div7 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все типы (${/*optTypeHearthsTmpKeys*/ ctx[84].reduce(/*func_7*/ ctx[181], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t16 = space();
  			div8 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearthsTmp*/ ctx[83].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearthsTmp*/ ctx[83].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearthsTmp*/ ctx[83].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearthsTmp*/ ctx[83].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearthsTmp*/ ctx[83].stricken[4] || 0}) С пострадавшими и погибшими`;
  			add_location(b, file$6, 1323, 31, 46576);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1323, 2, 46547);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[19];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1325, 30, 46663);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1325, 3, 46636);
  			add_location(legend, file$6, 1328, 4, 46778);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 1;
  			input1.value = input1.__value;
  			input1.checked = input1_checked_value = /*hearths_period_type_tmp*/ ctx[59] === 1;
  			attr_dev(input1, "id", "hearths_period_type_tmp1");
  			attr_dev(input1, "name", "hearths_period_type_tmp");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[158][1].push(input1);
  			add_location(input1, file$6, 1330, 5, 46853);
  			attr_dev(label0, "for", "hearths_period_type_tmp1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1330, 205, 47053);
  			attr_dev(div2, "class", "pLine margin svelte-1jsovbn");
  			add_location(div2, file$6, 1331, 5, 47124);
  			attr_dev(div3, "class", "pLine type svelte-1jsovbn");
  			add_location(div3, file$6, 1329, 4, 46823);
  			attr_dev(input2, "type", "radio");
  			input2.__value = input2_value_value = 2;
  			input2.value = input2.__value;
  			attr_dev(input2, "id", "hearths_period_type_tmp2");
  			attr_dev(input2, "name", "hearths_period_type_tmp");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[158][1].push(input2);
  			add_location(input2, file$6, 1338, 4, 47498);
  			attr_dev(label1, "for", "hearths_period_type_tmp2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1338, 164, 47658);
  			attr_dev(div4, "class", "pLine margin svelte-1jsovbn");
  			add_location(div4, file$6, 1339, 5, 47733);
  			attr_dev(div5, "class", "pLine type svelte-1jsovbn");
  			add_location(div5, file$6, 1337, 4, 47469);
  			add_location(fieldset, file$6, 1327, 3, 46763);
  			attr_dev(div6, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div6, file$6, 1326, 3, 46733);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$6, 1366, 5, 48971);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_typeTmp*/ ctx[58] === void 0) add_render_callback(() => /*select0_change_handler_4*/ ctx[182].call(select0));
  			add_location(select0, file$6, 1365, 4, 48854);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$6, 1364, 3, 48830);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$6, 1378, 5, 49459);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$6, 1379, 5, 49539);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$6, 1380, 5, 49627);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$6, 1381, 5, 49719);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$6, 1382, 5, 49818);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_strickenTmp*/ ctx[57] === void 0) add_render_callback(() => /*select1_change_handler_4*/ ctx[183].call(select1));
  			add_location(select1, file$6, 1377, 4, 49378);
  			attr_dev(div8, "class", "pLine svelte-1jsovbn");
  			add_location(div8, file$6, 1376, 3, 49354);
  			attr_dev(div9, "class", "filtersCont svelte-1jsovbn");
  			add_location(div9, file$6, 1324, 2, 46607);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div9, anchor);
  			append_dev(div9, div1);
  			append_dev(div1, t3);
  			append_dev(div1, input0);
  			append_dev(div9, t4);
  			append_dev(div9, div6);
  			append_dev(div6, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t6);
  			append_dev(fieldset, div3);
  			append_dev(div3, input1);
  			input1.checked = input1.__value === /*hearths_period_type_tmp*/ ctx[59];
  			append_dev(div3, label0);
  			append_dev(div3, t8);
  			append_dev(div3, div2);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(div2, null);
  			}

  			append_dev(fieldset, t9);
  			append_dev(fieldset, div5);
  			append_dev(div5, input2);
  			input2.checked = input2.__value === /*hearths_period_type_tmp*/ ctx[59];
  			append_dev(div5, label1);
  			append_dev(div5, t11);
  			append_dev(div5, div4);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div4, null);
  			}

  			append_dev(div9, t12);
  			append_dev(div9, div7);
  			append_dev(div7, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*str_icon_typeTmp*/ ctx[58]);
  			append_dev(div9, t16);
  			append_dev(div9, div8);
  			append_dev(div8, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_strickenTmp*/ ctx[57]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input1, "change", /*setFilterHearthsTmp*/ ctx[127], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_3*/ ctx[179]),
  				listen_dev(input2, "change", /*setFilterHearthsTmp*/ ctx[127], false, false, false),
  				listen_dev(input2, "change", /*input2_change_handler_2*/ ctx[180]),
  				listen_dev(select0, "change", /*select0_change_handler_4*/ ctx[182]),
  				listen_dev(select0, "change", /*setFilterHearthsTmp*/ ctx[127], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_4*/ ctx[183]),
  				listen_dev(select1, "change", /*setFilterHearthsTmp*/ ctx[127], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input0.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 268435456 && input1_checked_value !== (input1_checked_value = /*hearths_period_type_tmp*/ ctx[59] === 1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 268435456) {
  				input1.checked = input1.__value === /*hearths_period_type_tmp*/ ctx[59];
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 | dirty[1] & /*hearths_year_tmp, hearths_period_type_tmp*/ 805306368 | dirty[4] & /*setFilterHearthsTmp*/ 8) {
  				each_value_14 = Object.keys(/*DtpHearthsTmp*/ ctx[15]._opt.years).sort();
  				validate_each_argument(each_value_14);
  				let i;

  				for (i = 0; i < each_value_14.length; i += 1) {
  					const child_ctx = get_each_context_14(ctx, each_value_14, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_2[i] = create_each_block_14(child_ctx);
  						each_blocks_2[i].c();
  						each_blocks_2[i].m(div2, null);
  					}
  				}

  				for (; i < each_blocks_2.length; i += 1) {
  					each_blocks_2[i].d(1);
  				}

  				each_blocks_2.length = each_value_14.length;
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 268435456) {
  				input2.checked = input2.__value === /*hearths_period_type_tmp*/ ctx[59];
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 | dirty[1] & /*hearths_quarter_tmp, hearths_period_type_tmp*/ 1342177280 | dirty[4] & /*setFilterHearthsTmp*/ 8) {
  				each_value_12 = Object.keys(/*DtpHearthsTmp*/ ctx[15]._opt.years).sort();
  				validate_each_argument(each_value_12);
  				let i;

  				for (i = 0; i < each_value_12.length; i += 1) {
  					const child_ctx = get_each_context_12(ctx, each_value_12, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_12(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div4, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_12.length;
  			}

  			if (dirty[2] & /*optTypeHearthsTmpKeys, optDataHearthsTmp*/ 6291456) {
  				each_value_11 = /*optTypeHearthsTmpKeys*/ ctx[84];
  				validate_each_argument(each_value_11);
  				let i;

  				for (i = 0; i < each_value_11.length; i += 1) {
  					const child_ctx = get_each_context_11(ctx, each_value_11, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_11(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_11.length;
  			}

  			if (dirty[1] & /*str_icon_typeTmp*/ 134217728) {
  				select_options(select0, /*str_icon_typeTmp*/ ctx[58]);
  			}

  			if (dirty[1] & /*hearths_strickenTmp*/ 67108864) {
  				select_option(select1, /*hearths_strickenTmp*/ ctx[57]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div9);
  			/*$$binding_groups*/ ctx[158][1].splice(/*$$binding_groups*/ ctx[158][1].indexOf(input1), 1);
  			destroy_each(each_blocks_2, detaching);
  			/*$$binding_groups*/ ctx[158][1].splice(/*$$binding_groups*/ ctx[158][1].indexOf(input2), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_20.name,
  		type: "if",
  		source: "(1323:2) {#if DtpHearthsTmp._map && DtpHearthsTmp._opt && DtpHearthsTmp._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1333:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}
  function create_each_block_14(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[213] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_tmp");
  			input.checked = input_checked_value = /*hearths_year_tmp*/ ctx[60][/*key*/ ctx[213]];
  			input.disabled = input_disabled_value = /*hearths_period_type_tmp*/ ctx[59] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[213]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1333, 6, 47222);
  			attr_dev(label, "for", "hearths_year_tmp");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1333, 169, 47385);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsTmp*/ ctx[127], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 | dirty[1] & /*hearths_year_tmp*/ 536870912 && input_checked_value !== (input_checked_value = /*hearths_year_tmp*/ ctx[60][/*key*/ ctx[213]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 268435456 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_tmp*/ ctx[59] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 && input_name_value !== (input_name_value = /*key*/ ctx[213])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 && t_value !== (t_value = /*key*/ ctx[213] + "")) set_data_dev(t, t_value);
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
  		source: "(1333:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1342:6) {#each Object.keys(DtpHearthsTmp._opt.years[key]).sort() as key1}
  function create_each_block_13(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t0_value = /*key1*/ ctx[232] + "";
  	let t0;
  	let t1;
  	let t2_value = /*key*/ ctx[213] + "";
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
  			input.checked = input_checked_value = /*hearths_quarter_tmp*/ ctx[61][/*key*/ ctx[213]] && /*hearths_quarter_tmp*/ ctx[61][/*key*/ ctx[213]][/*key1*/ ctx[232]];
  			input.disabled = input_disabled_value = /*hearths_period_type_tmp*/ ctx[59] === 1;
  			attr_dev(input, "name", input_name_value = "" + (/*key*/ ctx[213] + "_" + /*key1*/ ctx[232]));
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1342, 7, 47904);
  			attr_dev(label, "for", label_for_value = "hearths_quarter_tmp_" + /*key*/ ctx[213] + "_" + /*key1*/ ctx[232]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1342, 217, 48114);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t0);
  			append_dev(label, t1);
  			append_dev(label, t2);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsTmp*/ ctx[127], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 | dirty[1] & /*hearths_quarter_tmp*/ 1073741824 && input_checked_value !== (input_checked_value = /*hearths_quarter_tmp*/ ctx[61][/*key*/ ctx[213]] && /*hearths_quarter_tmp*/ ctx[61][/*key*/ ctx[213]][/*key1*/ ctx[232]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 268435456 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_tmp*/ ctx[59] === 1)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 && input_name_value !== (input_name_value = "" + (/*key*/ ctx[213] + "_" + /*key1*/ ctx[232]))) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 && t0_value !== (t0_value = /*key1*/ ctx[232] + "")) set_data_dev(t0, t0_value);
  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 && t2_value !== (t2_value = /*key*/ ctx[213] + "")) set_data_dev(t2, t2_value);

  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 && label_for_value !== (label_for_value = "hearths_quarter_tmp_" + /*key*/ ctx[213] + "_" + /*key1*/ ctx[232])) {
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
  		id: create_each_block_13.name,
  		type: "each",
  		source: "(1342:6) {#each Object.keys(DtpHearthsTmp._opt.years[key]).sort() as key1}",
  		ctx
  	});

  	return block;
  }

  // (1341:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}
  function create_each_block_12(ctx) {
  	let t;
  	let br;
  	let each_value_13 = Object.keys(/*DtpHearthsTmp*/ ctx[15]._opt.years[/*key*/ ctx[213]]).sort();
  	validate_each_argument(each_value_13);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_13.length; i += 1) {
  		each_blocks[i] = create_each_block_13(get_each_context_13(ctx, each_value_13, i));
  	}

  	const block = {
  		c: function create() {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t = space();
  			br = element("br");
  			add_location(br, file$6, 1344, 6, 48205);
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, t, anchor);
  			insert_dev(target, br, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 32768 | dirty[1] & /*hearths_quarter_tmp, hearths_period_type_tmp*/ 1342177280 | dirty[4] & /*setFilterHearthsTmp*/ 8) {
  				each_value_13 = Object.keys(/*DtpHearthsTmp*/ ctx[15]._opt.years[/*key*/ ctx[213]]).sort();
  				validate_each_argument(each_value_13);
  				let i;

  				for (i = 0; i < each_value_13.length; i += 1) {
  					const child_ctx = get_each_context_13(ctx, each_value_13, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_13(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(t.parentNode, t);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_13.length;
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
  		id: create_each_block_12.name,
  		type: "each",
  		source: "(1341:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1370:5) {#each optTypeHearthsTmpKeys as key}
  function create_each_block_11(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsTmp*/ ctx[83].str_icon_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearthsTmp*/ ctx[83].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1370, 6, 49169);
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
  		id: create_each_block_11.name,
  		type: "each",
  		source: "(1370:5) {#each optTypeHearthsTmpKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1389:2) {#if DtpHearths._map && DtpHearths._opt && DtpHearths._opt.years}
  function create_if_block_19(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div10;
  	let div2;
  	let t4;
  	let input0;
  	let t5;
  	let div7;
  	let fieldset;
  	let legend;
  	let t7;
  	let div4;
  	let input1;
  	let input1_value_value;
  	let input1_checked_value;
  	let label0;
  	let t9;
  	let div3;
  	let t10;
  	let div6;
  	let input2;
  	let input2_value_value;
  	let label1;
  	let t12;
  	let div5;
  	let t13;
  	let div8;
  	let select0;
  	let option0;
  	let t17;
  	let div9;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let dispose;
  	let each_value_10 = Object.keys(/*DtpHearths*/ ctx[16]._opt.years).sort();
  	validate_each_argument(each_value_10);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_10.length; i += 1) {
  		each_blocks_2[i] = create_each_block_10(get_each_context_10(ctx, each_value_10, i));
  	}

  	let each_value_8 = Object.keys(/*DtpHearths*/ ctx[16]._opt.years).sort();
  	validate_each_argument(each_value_8);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_8.length; i += 1) {
  		each_blocks_1[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
  	}

  	let each_value_7 = /*optTypeHearthsKeys*/ ctx[82];
  	validate_each_argument(each_value_7);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_7.length; i += 1) {
  		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
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
  			div10 = element("div");
  			div2 = element("div");
  			t4 = text("ID ДТП: ");
  			input0 = element("input");
  			t5 = space();
  			div7 = element("div");
  			fieldset = element("fieldset");
  			legend = element("legend");
  			legend.textContent = "Фильтрация по периодам:";
  			t7 = space();
  			div4 = element("div");
  			input1 = element("input");
  			label0 = element("label");
  			label0.textContent = "Фильтрация по годам";
  			t9 = space();
  			div3 = element("div");

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].c();
  			}

  			t10 = space();
  			div6 = element("div");
  			input2 = element("input");
  			label1 = element("label");
  			label1.textContent = "Фильтрация по кварталам";
  			t12 = space();
  			div5 = element("div");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t13 = space();
  			div8 = element("div");
  			select0 = element("select");
  			option0 = element("option");

  			option0.textContent = `
						Все типы (${/*optTypeHearthsKeys*/ ctx[82].reduce(/*func_8*/ ctx[186], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t17 = space();
  			div9 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearths*/ ctx[81].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearths*/ ctx[81].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearths*/ ctx[81].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearths*/ ctx[81].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearths*/ ctx[81].stricken[4] || 0}) С пострадавшими и погибшими`;
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$6, 1389, 21, 50041);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1389, 2, 50022);
  			add_location(b, file$6, 1390, 31, 50083);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1390, 2, 50054);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[19];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1392, 30, 50164);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1392, 3, 50137);
  			add_location(legend, file$6, 1395, 4, 50279);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 1;
  			input1.value = input1.__value;
  			input1.checked = input1_checked_value = /*hearths_period_type*/ ctx[64] === 1;
  			attr_dev(input1, "id", "hearths_period_type1");
  			attr_dev(input1, "name", "hearths_period_type");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[158][0].push(input1);
  			add_location(input1, file$6, 1397, 5, 50354);
  			attr_dev(label0, "for", "hearths_period_type1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1397, 186, 50535);
  			attr_dev(div3, "class", "pLine margin svelte-1jsovbn");
  			add_location(div3, file$6, 1398, 5, 50602);
  			attr_dev(div4, "class", "pLine type svelte-1jsovbn");
  			add_location(div4, file$6, 1396, 4, 50324);
  			attr_dev(input2, "type", "radio");
  			input2.__value = input2_value_value = 2;
  			input2.value = input2.__value;
  			attr_dev(input2, "id", "hearths_period_type2");
  			attr_dev(input2, "name", "hearths_period_type");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[158][0].push(input2);
  			add_location(input2, file$6, 1405, 4, 50959);
  			attr_dev(label1, "for", "hearths_period_type2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1405, 149, 51104);
  			attr_dev(div5, "class", "pLine margin svelte-1jsovbn");
  			add_location(div5, file$6, 1406, 5, 51175);
  			attr_dev(div6, "class", "pLine type svelte-1jsovbn");
  			add_location(div6, file$6, 1404, 4, 50930);
  			add_location(fieldset, file$6, 1394, 3, 50264);
  			attr_dev(div7, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div7, file$6, 1393, 3, 50234);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$6, 1419, 5, 51824);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_type*/ ctx[63] === void 0) add_render_callback(() => /*select0_change_handler_5*/ ctx[187].call(select0));
  			add_location(select0, file$6, 1418, 4, 51713);
  			attr_dev(div8, "class", "pLine svelte-1jsovbn");
  			add_location(div8, file$6, 1417, 3, 51689);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$6, 1431, 5, 52291);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$6, 1432, 5, 52368);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$6, 1433, 5, 52453);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$6, 1434, 5, 52542);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$6, 1435, 5, 52638);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken*/ ctx[62] === void 0) add_render_callback(() => /*select1_change_handler_5*/ ctx[188].call(select1));
  			add_location(select1, file$6, 1430, 4, 52216);
  			attr_dev(div9, "class", "pLine svelte-1jsovbn");
  			add_location(div9, file$6, 1429, 3, 52192);
  			attr_dev(div10, "class", "filtersCont svelte-1jsovbn");
  			add_location(div10, file$6, 1391, 2, 50108);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, t1);
  			append_dev(div1, b);
  			insert_dev(target, t3, anchor);
  			insert_dev(target, div10, anchor);
  			append_dev(div10, div2);
  			append_dev(div2, t4);
  			append_dev(div2, input0);
  			append_dev(div10, t5);
  			append_dev(div10, div7);
  			append_dev(div7, fieldset);
  			append_dev(fieldset, legend);
  			append_dev(fieldset, t7);
  			append_dev(fieldset, div4);
  			append_dev(div4, input1);
  			input1.checked = input1.__value === /*hearths_period_type*/ ctx[64];
  			append_dev(div4, label0);
  			append_dev(div4, t9);
  			append_dev(div4, div3);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(div3, null);
  			}

  			append_dev(fieldset, t10);
  			append_dev(fieldset, div6);
  			append_dev(div6, input2);
  			input2.checked = input2.__value === /*hearths_period_type*/ ctx[64];
  			append_dev(div6, label1);
  			append_dev(div6, t12);
  			append_dev(div6, div5);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div5, null);
  			}

  			append_dev(div10, t13);
  			append_dev(div10, div8);
  			append_dev(div8, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select0, null);
  			}

  			select_options(select0, /*str_icon_type*/ ctx[63]);
  			append_dev(div10, t17);
  			append_dev(div10, div9);
  			append_dev(div9, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken*/ ctx[62]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input1, "change", /*setFilterHearths*/ ctx[128], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_4*/ ctx[184]),
  				listen_dev(input2, "change", /*setFilterHearths*/ ctx[128], false, false, false),
  				listen_dev(input2, "change", /*input2_change_handler_3*/ ctx[185]),
  				listen_dev(select0, "change", /*select0_change_handler_5*/ ctx[187]),
  				listen_dev(select0, "change", /*setFilterHearths*/ ctx[128], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_5*/ ctx[188]),
  				listen_dev(select1, "change", /*setFilterHearths*/ ctx[128], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input0.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[2] & /*hearths_period_type*/ 4 && input1_checked_value !== (input1_checked_value = /*hearths_period_type*/ ctx[64] === 1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[2] & /*hearths_period_type*/ 4) {
  				input1.checked = input1.__value === /*hearths_period_type*/ ctx[64];
  			}

  			if (dirty[0] & /*DtpHearths*/ 65536 | dirty[2] & /*hearths_year, hearths_period_type*/ 12 | dirty[4] & /*setFilterHearths*/ 16) {
  				each_value_10 = Object.keys(/*DtpHearths*/ ctx[16]._opt.years).sort();
  				validate_each_argument(each_value_10);
  				let i;

  				for (i = 0; i < each_value_10.length; i += 1) {
  					const child_ctx = get_each_context_10(ctx, each_value_10, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_2[i] = create_each_block_10(child_ctx);
  						each_blocks_2[i].c();
  						each_blocks_2[i].m(div3, null);
  					}
  				}

  				for (; i < each_blocks_2.length; i += 1) {
  					each_blocks_2[i].d(1);
  				}

  				each_blocks_2.length = each_value_10.length;
  			}

  			if (dirty[2] & /*hearths_period_type*/ 4) {
  				input2.checked = input2.__value === /*hearths_period_type*/ ctx[64];
  			}

  			if (dirty[0] & /*DtpHearths*/ 65536 | dirty[2] & /*hearths_quarter, hearths_period_type*/ 20 | dirty[4] & /*setFilterHearths*/ 16) {
  				each_value_8 = Object.keys(/*DtpHearths*/ ctx[16]._opt.years).sort();
  				validate_each_argument(each_value_8);
  				let i;

  				for (i = 0; i < each_value_8.length; i += 1) {
  					const child_ctx = get_each_context_8(ctx, each_value_8, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_8(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div5, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_8.length;
  			}

  			if (dirty[2] & /*optTypeHearthsKeys, optDataHearths*/ 1572864) {
  				each_value_7 = /*optTypeHearthsKeys*/ ctx[82];
  				validate_each_argument(each_value_7);
  				let i;

  				for (i = 0; i < each_value_7.length; i += 1) {
  					const child_ctx = get_each_context_7(ctx, each_value_7, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_7(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_7.length;
  			}

  			if (dirty[2] & /*str_icon_type*/ 2) {
  				select_options(select0, /*str_icon_type*/ ctx[63]);
  			}

  			if (dirty[2] & /*hearths_stricken*/ 1) {
  				select_option(select1, /*hearths_stricken*/ ctx[62]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div10);
  			/*$$binding_groups*/ ctx[158][0].splice(/*$$binding_groups*/ ctx[158][0].indexOf(input1), 1);
  			destroy_each(each_blocks_2, detaching);
  			/*$$binding_groups*/ ctx[158][0].splice(/*$$binding_groups*/ ctx[158][0].indexOf(input2), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_19.name,
  		type: "if",
  		source: "(1389:2) {#if DtpHearths._map && DtpHearths._opt && DtpHearths._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1400:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}
  function create_each_block_10(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[213] + "";
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
  			input.checked = input_checked_value = /*hearths_year*/ ctx[65][/*key*/ ctx[213]];
  			input.disabled = input_disabled_value = /*hearths_period_type*/ ctx[64] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[213]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1400, 6, 50697);
  			attr_dev(label, "for", label_for_value = "hearths_year" + /*key*/ ctx[213]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1400, 154, 50845);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths*/ ctx[128], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 65536 | dirty[2] & /*hearths_year*/ 8 && input_checked_value !== (input_checked_value = /*hearths_year*/ ctx[65][/*key*/ ctx[213]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[2] & /*hearths_period_type*/ 4 && input_disabled_value !== (input_disabled_value = /*hearths_period_type*/ ctx[64] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 65536 && input_name_value !== (input_name_value = /*key*/ ctx[213])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 65536 && t_value !== (t_value = /*key*/ ctx[213] + "")) set_data_dev(t, t_value);

  			if (dirty[0] & /*DtpHearths*/ 65536 && label_for_value !== (label_for_value = "hearths_year" + /*key*/ ctx[213])) {
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
  		source: "(1400:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1409:6) {#each Object.keys(DtpHearths._opt.years[key]).sort() as key1}
  function create_each_block_9(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t0_value = /*key1*/ ctx[232] + "";
  	let t0;
  	let t1;
  	let t2_value = /*key*/ ctx[213] + "";
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
  			input.checked = input_checked_value = /*hearths_quarter*/ ctx[66][/*key*/ ctx[213]] && /*hearths_quarter*/ ctx[66][/*key*/ ctx[213]][/*key1*/ ctx[232]];
  			input.disabled = input_disabled_value = /*hearths_period_type*/ ctx[64] === 1;
  			attr_dev(input, "name", input_name_value = "" + (/*key*/ ctx[213] + "_" + /*key1*/ ctx[232]));
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1409, 7, 51340);
  			attr_dev(label, "for", label_for_value = "hearths_quarter_" + /*key*/ ctx[213] + "_" + /*key1*/ ctx[232]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1409, 198, 51531);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t0);
  			append_dev(label, t1);
  			append_dev(label, t2);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths*/ ctx[128], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 65536 | dirty[2] & /*hearths_quarter*/ 16 && input_checked_value !== (input_checked_value = /*hearths_quarter*/ ctx[66][/*key*/ ctx[213]] && /*hearths_quarter*/ ctx[66][/*key*/ ctx[213]][/*key1*/ ctx[232]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[2] & /*hearths_period_type*/ 4 && input_disabled_value !== (input_disabled_value = /*hearths_period_type*/ ctx[64] === 1)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 65536 && input_name_value !== (input_name_value = "" + (/*key*/ ctx[213] + "_" + /*key1*/ ctx[232]))) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 65536 && t0_value !== (t0_value = /*key1*/ ctx[232] + "")) set_data_dev(t0, t0_value);
  			if (dirty[0] & /*DtpHearths*/ 65536 && t2_value !== (t2_value = /*key*/ ctx[213] + "")) set_data_dev(t2, t2_value);

  			if (dirty[0] & /*DtpHearths*/ 65536 && label_for_value !== (label_for_value = "hearths_quarter_" + /*key*/ ctx[213] + "_" + /*key1*/ ctx[232])) {
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
  		id: create_each_block_9.name,
  		type: "each",
  		source: "(1409:6) {#each Object.keys(DtpHearths._opt.years[key]).sort() as key1}",
  		ctx
  	});

  	return block;
  }

  // (1408:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}
  function create_each_block_8(ctx) {
  	let t;
  	let br;
  	let each_value_9 = Object.keys(/*DtpHearths*/ ctx[16]._opt.years[/*key*/ ctx[213]]).sort();
  	validate_each_argument(each_value_9);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_9.length; i += 1) {
  		each_blocks[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
  	}

  	const block = {
  		c: function create() {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t = space();
  			br = element("br");
  			add_location(br, file$6, 1411, 6, 51618);
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, t, anchor);
  			insert_dev(target, br, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 65536 | dirty[2] & /*hearths_quarter, hearths_period_type*/ 20 | dirty[4] & /*setFilterHearths*/ 16) {
  				each_value_9 = Object.keys(/*DtpHearths*/ ctx[16]._opt.years[/*key*/ ctx[213]]).sort();
  				validate_each_argument(each_value_9);
  				let i;

  				for (i = 0; i < each_value_9.length; i += 1) {
  					const child_ctx = get_each_context_9(ctx, each_value_9, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_9(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(t.parentNode, t);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_9.length;
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
  		id: create_each_block_8.name,
  		type: "each",
  		source: "(1408:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1423:5) {#each optTypeHearthsKeys as key}
  function create_each_block_7(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearths*/ ctx[81].str_icon_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearths*/ ctx[81].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1423, 6, 52013);
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
  		id: create_each_block_7.name,
  		type: "each",
  		source: "(1423:5) {#each optTypeHearthsKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1469:233) 
  function create_if_block_18(ctx) {
  	let div;

  	const block = {
  		c: function create() {
  			div = element("div");
  			div.textContent = "Нет включенных слоев";
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$6, 1469, 3, 54351);
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
  		id: create_if_block_18.name,
  		type: "if",
  		source: "(1469:233) ",
  		ctx
  	});

  	return block;
  }

  // (1442:2) {#if DtpVerifyed._map || DtpSkpdi._map || DtpGibddLo._map || DtpGibddSpt._map || DtpGibdd._map || DtpGibddRub._map || Measures._map}
  function create_if_block_16(ctx) {
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
  	let if_block_anchor;
  	let dispose;
  	let if_block = (/*DtpVerifyed*/ ctx[5]._map || /*DtpSkpdi*/ ctx[6]._map || /*DtpGibdd*/ ctx[7]._map || /*DtpGibddLo*/ ctx[10]._map || /*DtpGibddSpt*/ ctx[9]._map || /*DtpGibddRub*/ ctx[8]._map) && create_if_block_17(ctx);

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
  			if (if_block) if_block.c();
  			if_block_anchor = empty();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$6, 1442, 21, 52925);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1442, 2, 52906);
  			attr_dev(button0, "class", "pika-prev");
  			add_location(button0, file$6, 1444, 3, 52969);
  			attr_dev(input0, "type", "text");
  			attr_dev(input0, "class", "begDate svelte-1jsovbn");
  			add_location(input0, file$6, 1445, 3, 53026);
  			attr_dev(input1, "type", "text");
  			attr_dev(input1, "class", "endDate svelte-1jsovbn");
  			add_location(input1, file$6, 1446, 3, 53087);
  			attr_dev(button1, "class", "pika-next");
  			add_location(button1, file$6, 1447, 3, 53148);
  			attr_dev(div1, "class", "pikaday pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1443, 2, 52938);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, button0);
  			append_dev(div1, t1);
  			append_dev(div1, input0);
  			/*input0_binding*/ ctx[189](input0);
  			append_dev(div1, t2);
  			append_dev(div1, input1);
  			/*input1_binding*/ ctx[190](input1);
  			append_dev(div1, t3);
  			append_dev(div1, button1);
  			insert_dev(target, t4, anchor);
  			if (if_block) if_block.m(target, anchor);
  			insert_dev(target, if_block_anchor, anchor);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(button0, "click", /*onPrev*/ ctx[122], false, false, false),
  				listen_dev(button1, "click", /*onNext*/ ctx[123], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (/*DtpVerifyed*/ ctx[5]._map || /*DtpSkpdi*/ ctx[6]._map || /*DtpGibdd*/ ctx[7]._map || /*DtpGibddLo*/ ctx[10]._map || /*DtpGibddSpt*/ ctx[9]._map || /*DtpGibddRub*/ ctx[8]._map) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block_17(ctx);
  					if_block.c();
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			/*input0_binding*/ ctx[189](null);
  			/*input1_binding*/ ctx[190](null);
  			if (detaching) detach_dev(t4);
  			if (if_block) if_block.d(detaching);
  			if (detaching) detach_dev(if_block_anchor);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_16.name,
  		type: "if",
  		source: "(1442:2) {#if DtpVerifyed._map || DtpSkpdi._map || DtpGibddLo._map || DtpGibddSpt._map || DtpGibdd._map || DtpGibddRub._map || Measures._map}",
  		ctx
  	});

  	return block;
  }

  // (1450:2) {#if DtpVerifyed._map || DtpSkpdi._map || DtpGibdd._map || DtpGibddLo._map || DtpGibddSpt._map || DtpGibddRub._map}
  function create_if_block_17(ctx) {
  	let div0;
  	let br0;
  	let t0;
  	let label0;
  	let input0;
  	let input0_disabled_value;
  	let span0;
  	let t1;
  	let t2;
  	let t3;
  	let t4;
  	let br1;
  	let t5;
  	let label1;
  	let input1;
  	let input1_disabled_value;
  	let span1;
  	let t6;
  	let t7;
  	let t8;
  	let t9;
  	let br2;
  	let t10;
  	let label2;
  	let input2;
  	let input2_disabled_value;
  	let span2;
  	let t11;
  	let t12;
  	let t13;
  	let t14;
  	let div1;
  	let input3;
  	let label3;
  	let dispose;

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			br0 = element("br");
  			t0 = space();
  			label0 = element("label");
  			input0 = element("input");
  			span0 = element("span");
  			t1 = text("Мин.яркость (");
  			t2 = text(/*minOpacity*/ ctx[31]);
  			t3 = text(")");
  			t4 = space();
  			br1 = element("br");
  			t5 = space();
  			label1 = element("label");
  			input1 = element("input");
  			span1 = element("span");
  			t6 = text("Радиус (");
  			t7 = text(/*radius*/ ctx[29]);
  			t8 = text(")");
  			t9 = space();
  			br2 = element("br");
  			t10 = space();
  			label2 = element("label");
  			input2 = element("input");
  			span2 = element("span");
  			t11 = text("Размытие (");
  			t12 = text(/*blur*/ ctx[30]);
  			t13 = text(")");
  			t14 = space();
  			div1 = element("div");
  			input3 = element("input");
  			label3 = element("label");
  			label3.textContent = "- тепловая карта";
  			add_location(br0, file$6, 1451, 4, 53356);
  			attr_dev(input0, "type", "range");
  			attr_dev(input0, "min", "0.05");
  			attr_dev(input0, "max", "1");
  			attr_dev(input0, "step", "0.01");
  			input0.disabled = input0_disabled_value = !/*heat*/ ctx[99];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1453, 5, 53380);
  			add_location(span0, file$6, 1453, 122, 53497);
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1452, 4, 53367);
  			add_location(br1, file$6, 1455, 4, 53554);
  			attr_dev(input1, "type", "range");
  			attr_dev(input1, "min", "0");
  			attr_dev(input1, "max", "100");
  			attr_dev(input1, "step", "1");
  			input1.disabled = input1_disabled_value = !/*heat*/ ctx[99];
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1457, 5, 53578);
  			add_location(span1, file$6, 1457, 114, 53687);
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1456, 4, 53565);
  			add_location(br2, file$6, 1459, 4, 53735);
  			attr_dev(input2, "type", "range");
  			attr_dev(input2, "min", "0");
  			attr_dev(input2, "max", "15");
  			attr_dev(input2, "step", "0.01");
  			input2.disabled = input2_disabled_value = !/*heat*/ ctx[99];
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$6, 1461, 5, 53759);
  			add_location(span2, file$6, 1461, 114, 53868);
  			attr_dev(label2, "class", "svelte-1jsovbn");
  			add_location(label2, file$6, 1460, 4, 53746);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1450, 3, 53332);
  			attr_dev(input3, "type", "checkbox");
  			input3.checked = /*isHeatChecked*/ ctx[100];
  			attr_dev(input3, "name", "heat");
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$6, 1465, 4, 53949);
  			attr_dev(label3, "for", "heat");
  			attr_dev(label3, "class", "svelte-1jsovbn");
  			add_location(label3, file$6, 1465, 107, 54052);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1464, 3, 53925);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, br0);
  			append_dev(div0, t0);
  			append_dev(div0, label0);
  			append_dev(label0, input0);
  			set_input_value(input0, /*minOpacity*/ ctx[31]);
  			append_dev(label0, span0);
  			append_dev(span0, t1);
  			append_dev(span0, t2);
  			append_dev(span0, t3);
  			append_dev(div0, t4);
  			append_dev(div0, br1);
  			append_dev(div0, t5);
  			append_dev(div0, label1);
  			append_dev(label1, input1);
  			set_input_value(input1, /*radius*/ ctx[29]);
  			append_dev(label1, span1);
  			append_dev(span1, t6);
  			append_dev(span1, t7);
  			append_dev(span1, t8);
  			append_dev(div0, t9);
  			append_dev(div0, br2);
  			append_dev(div0, t10);
  			append_dev(div0, label2);
  			append_dev(label2, input2);
  			set_input_value(input2, /*blur*/ ctx[30]);
  			append_dev(label2, span2);
  			append_dev(span2, t11);
  			append_dev(span2, t12);
  			append_dev(span2, t13);
  			insert_dev(target, t14, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, input3);
  			/*input3_binding*/ ctx[194](input3);
  			append_dev(div1, label3);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[191]),
  				listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[191]),
  				listen_dev(input0, "input", /*setMinOpacity*/ ctx[114], false, false, false),
  				listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[192]),
  				listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[192]),
  				listen_dev(input1, "input", /*setMinOpacity*/ ctx[114], false, false, false),
  				listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[193]),
  				listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[193]),
  				listen_dev(input2, "input", /*setMinOpacity*/ ctx[114], false, false, false),
  				listen_dev(input3, "change", /*setHeat*/ ctx[113], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*minOpacity*/ 1) {
  				set_input_value(input0, /*minOpacity*/ ctx[31]);
  			}

  			if (dirty[1] & /*minOpacity*/ 1) set_data_dev(t2, /*minOpacity*/ ctx[31]);

  			if (dirty[0] & /*radius*/ 536870912) {
  				set_input_value(input1, /*radius*/ ctx[29]);
  			}

  			if (dirty[0] & /*radius*/ 536870912) set_data_dev(t7, /*radius*/ ctx[29]);

  			if (dirty[0] & /*blur*/ 1073741824) {
  				set_input_value(input2, /*blur*/ ctx[30]);
  			}

  			if (dirty[0] & /*blur*/ 1073741824) set_data_dev(t12, /*blur*/ ctx[30]);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t14);
  			if (detaching) detach_dev(div1);
  			/*input3_binding*/ ctx[194](null);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_17.name,
  		type: "if",
  		source: "(1450:2) {#if DtpVerifyed._map || DtpSkpdi._map || DtpGibdd._map || DtpGibddLo._map || DtpGibddSpt._map || DtpGibddRub._map}",
  		ctx
  	});

  	return block;
  }

  // (1473:2) {#if Measures._map}
  function create_if_block_14(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div2;
  	let if_block = /*optMeasures*/ ctx[97].type && create_if_block_15(ctx);

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			hr = element("hr");
  			t0 = space();
  			div1 = element("div");
  			t1 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "Мероприятий";
  			t3 = space();
  			div2 = element("div");
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$6, 1473, 21, 54449);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1473, 2, 54430);
  			add_location(b, file$6, 1474, 31, 54491);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1474, 2, 54462);
  			attr_dev(div2, "class", "filtersCont svelte-1jsovbn");
  			add_location(div2, file$6, 1475, 2, 54518);
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
  			if (/*optMeasures*/ ctx[97].type) if_block.p(ctx, dirty);
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
  		id: create_if_block_14.name,
  		type: "if",
  		source: "(1473:2) {#if Measures._map}",
  		ctx
  	});

  	return block;
  }

  // (1477:3) {#if optMeasures.type}
  function create_if_block_15(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_6 = /*optMeasuresKeys*/ ctx[98];
  	validate_each_argument(each_value_6);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_6.length; i += 1) {
  		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
  	}

  	const block = {
  		c: function create() {
  			div = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все типы (${/*optMeasuresKeys*/ ctx[98].reduce(/*func_9*/ ctx[195], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			add_location(option, file$6, 1479, 5, 54701);
  			attr_dev(select, "class", "multiple_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*measures_type*/ ctx[35] === void 0) add_render_callback(() => /*select_change_handler_3*/ ctx[196].call(select));
  			add_location(select, file$6, 1478, 4, 54597);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$6, 1477, 3, 54573);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*measures_type*/ ctx[35]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_3*/ ctx[196]),
  				listen_dev(select, "change", /*setFilterMeasures*/ ctx[101], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[3] & /*optMeasuresKeys, optMeasures*/ 48) {
  				each_value_6 = /*optMeasuresKeys*/ ctx[98];
  				validate_each_argument(each_value_6);
  				let i;

  				for (i = 0; i < each_value_6.length; i += 1) {
  					const child_ctx = get_each_context_6(ctx, each_value_6, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_6(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_6.length;
  			}

  			if (dirty[1] & /*measures_type*/ 16) {
  				select_options(select, /*measures_type*/ ctx[35]);
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
  		id: create_if_block_15.name,
  		type: "if",
  		source: "(1477:3) {#if optMeasures.type}",
  		ctx
  	});

  	return block;
  }

  // (1483:5) {#each optMeasuresKeys as key}
  function create_each_block_6(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optMeasures*/ ctx[97].type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "type_" + /*optMeasures*/ ctx[97].type[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1483, 6, 54872);
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
  		id: create_each_block_6.name,
  		type: "each",
  		source: "(1483:5) {#each optMeasuresKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1494:2) {#if DtpVerifyed._map}
  function create_if_block_11(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div6;
  	let div2;
  	let t4;
  	let input0;
  	let t5;
  	let div3;
  	let input1;
  	let label0;
  	let t7;
  	let t8;
  	let div4;
  	let input2;
  	let label1;
  	let t10;
  	let div5;
  	let input3;
  	let input3_checked_value;
  	let label2;
  	let t12;
  	let input4;
  	let input4_checked_value;
  	let label3;
  	let t14;
  	let dispose;

  	function select_block_type_1(ctx, dirty) {
  		if (/*DtpVerifyed*/ ctx[5]._arm) return create_if_block_13;
  		return create_else_block$1;
  	}

  	let current_block_type = select_block_type_1(ctx);
  	let if_block0 = current_block_type(ctx);
  	let if_block1 = /*optData*/ ctx[67].collision_type && create_if_block_12(ctx);

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
  			div6 = element("div");
  			div2 = element("div");
  			t4 = text("ID ДТП: ");
  			input0 = element("input");
  			t5 = space();
  			div3 = element("div");
  			input1 = element("input");
  			label0 = element("label");
  			label0.textContent = "Все";
  			t7 = space();
  			if_block0.c();
  			t8 = space();
  			div4 = element("div");
  			input2 = element("input");
  			label1 = element("label");
  			label1.textContent = "Только ГИБДД";
  			t10 = space();
  			div5 = element("div");
  			input3 = element("input");
  			label2 = element("label");
  			label2.textContent = "- с мероприятиями";
  			t12 = space();
  			input4 = element("input");
  			label3 = element("label");
  			label3.textContent = "- без мероприятий";
  			t14 = space();
  			if (if_block1) if_block1.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$6, 1494, 21, 55097);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1494, 2, 55078);
  			add_location(b, file$6, 1495, 31, 55139);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1495, 2, 55110);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[19];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1497, 30, 55222);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1497, 3, 55195);
  			attr_dev(input1, "type", "radio");
  			attr_dev(input1, "id", "d0");
  			attr_dev(input1, "name", "drone");
  			input1.value = "0";
  			input1.checked = true;
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1498, 22, 55311);
  			attr_dev(label0, "for", "d0");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1498, 98, 55387);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$6, 1498, 3, 55292);
  			attr_dev(input2, "type", "radio");
  			attr_dev(input2, "id", "d3");
  			attr_dev(input2, "name", "drone");
  			input2.value = "3";
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$6, 1505, 22, 55916);
  			attr_dev(label1, "for", "d3");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1505, 92, 55986);
  			attr_dev(div4, "class", "pLine svelte-1jsovbn");
  			add_location(div4, file$6, 1505, 3, 55897);
  			attr_dev(input3, "type", "checkbox");
  			attr_dev(input3, "id", "ev1");
  			input3.checked = input3_checked_value = /*evnt*/ ctx[21].ev1;
  			attr_dev(input3, "name", "ev1");
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$6, 1507, 4, 56056);
  			attr_dev(label2, "for", "ev1");
  			attr_dev(label2, "class", "svelte-1jsovbn");
  			add_location(label2, file$6, 1507, 92, 56144);
  			attr_dev(input4, "type", "checkbox");
  			attr_dev(input4, "id", "ev0");
  			input4.checked = input4_checked_value = /*evnt*/ ctx[21].ev0;
  			attr_dev(input4, "name", "ev0");
  			attr_dev(input4, "class", "svelte-1jsovbn");
  			add_location(input4, file$6, 1508, 4, 56192);
  			attr_dev(label3, "for", "ev0");
  			attr_dev(label3, "class", "svelte-1jsovbn");
  			add_location(label3, file$6, 1508, 92, 56280);
  			attr_dev(div5, "class", "pLine svelte-1jsovbn");
  			add_location(div5, file$6, 1506, 3, 56032);
  			attr_dev(div6, "class", "filtersCont svelte-1jsovbn");
  			add_location(div6, file$6, 1496, 2, 55166);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, t1);
  			append_dev(div1, b);
  			insert_dev(target, t3, anchor);
  			insert_dev(target, div6, anchor);
  			append_dev(div6, div2);
  			append_dev(div2, t4);
  			append_dev(div2, input0);
  			append_dev(div6, t5);
  			append_dev(div6, div3);
  			append_dev(div3, input1);
  			append_dev(div3, label0);
  			append_dev(div6, t7);
  			if_block0.m(div6, null);
  			append_dev(div6, t8);
  			append_dev(div6, div4);
  			append_dev(div4, input2);
  			append_dev(div4, label1);
  			append_dev(div6, t10);
  			append_dev(div6, div5);
  			append_dev(div5, input3);
  			append_dev(div5, label2);
  			append_dev(div5, t12);
  			append_dev(div5, input4);
  			append_dev(div5, label3);
  			append_dev(div6, t14);
  			if (if_block1) if_block1.m(div6, null);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input1, "click", /*oncheck*/ ctx[121], false, false, false),
  				listen_dev(input2, "click", /*oncheck*/ ctx[121], false, false, false),
  				listen_dev(input3, "change", /*oncheckEvents*/ ctx[112], false, false, false),
  				listen_dev(input4, "change", /*oncheckEvents*/ ctx[112], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input0.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
  				if_block0.p(ctx, dirty);
  			} else {
  				if_block0.d(1);
  				if_block0 = current_block_type(ctx);

  				if (if_block0) {
  					if_block0.c();
  					if_block0.m(div6, t8);
  				}
  			}

  			if (dirty[0] & /*evnt*/ 2097152 && input3_checked_value !== (input3_checked_value = /*evnt*/ ctx[21].ev1)) {
  				prop_dev(input3, "checked", input3_checked_value);
  			}

  			if (dirty[0] & /*evnt*/ 2097152 && input4_checked_value !== (input4_checked_value = /*evnt*/ ctx[21].ev0)) {
  				prop_dev(input4, "checked", input4_checked_value);
  			}

  			if (/*optData*/ ctx[67].collision_type) if_block1.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div6);
  			if_block0.d();
  			if (if_block1) if_block1.d();
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_11.name,
  		type: "if",
  		source: "(1494:2) {#if DtpVerifyed._map}",
  		ctx
  	});

  	return block;
  }

  // (1502:3) {:else}
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
  			add_location(input0, file$6, 1502, 22, 55633);
  			attr_dev(label0, "for", "d1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1502, 90, 55701);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1502, 3, 55614);
  			attr_dev(input1, "type", "radio");
  			attr_dev(input1, "id", "d2");
  			attr_dev(input1, "name", "drone");
  			input1.value = "2";
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1503, 22, 55772);
  			attr_dev(label1, "for", "d2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1503, 92, 55842);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1503, 3, 55753);
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
  				listen_dev(input0, "click", /*oncheck*/ ctx[121], false, false, false),
  				listen_dev(input1, "click", /*oncheck*/ ctx[121], false, false, false)
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
  		source: "(1502:3) {:else}",
  		ctx
  	});

  	return block;
  }

  // (1500:3) {#if DtpVerifyed._arm}
  function create_if_block_13(ctx) {
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
  			add_location(input, file$6, 1500, 22, 55469);
  			attr_dev(label, "for", "d1");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$6, 1500, 90, 55537);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$6, 1500, 3, 55450);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, input);
  			append_dev(div, label);
  			if (remount) dispose();
  			dispose = listen_dev(input, "click", /*oncheck*/ ctx[121], false, false, false);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_13.name,
  		type: "if",
  		source: "(1500:3) {#if DtpVerifyed._arm}",
  		ctx
  	});

  	return block;
  }

  // (1511:3) {#if optData.collision_type}
  function create_if_block_12(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_5 = /*optCollisionKeys*/ ctx[68];
  	validate_each_argument(each_value_5);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_5.length; i += 1) {
  		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
  	}

  	const block = {
  		c: function create() {
  			div = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все типы (${/*optCollisionKeys*/ ctx[68].reduce(/*func_10*/ ctx[197], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$6, 1513, 5, 56495);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type*/ ctx[25] === void 0) add_render_callback(() => /*select_change_handler_4*/ ctx[198].call(select));
  			add_location(select, file$6, 1512, 4, 56393);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$6, 1511, 3, 56369);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type*/ ctx[25]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_4*/ ctx[198]),
  				listen_dev(select, "change", /*setFilter*/ ctx[115], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[2] & /*optCollisionKeys, optData*/ 96) {
  				each_value_5 = /*optCollisionKeys*/ ctx[68];
  				validate_each_argument(each_value_5);
  				let i;

  				for (i = 0; i < each_value_5.length; i += 1) {
  					const child_ctx = get_each_context_5(ctx, each_value_5, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_5(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_5.length;
  			}

  			if (dirty[0] & /*collision_type*/ 33554432) {
  				select_options(select, /*collision_type*/ ctx[25]);
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
  		id: create_if_block_12.name,
  		type: "if",
  		source: "(1511:3) {#if optData.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1517:5) {#each optCollisionKeys as key}
  function create_each_block_5(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optData*/ ctx[67].collision_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optData*/ ctx[67].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1517, 6, 56674);
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
  		id: create_each_block_5.name,
  		type: "each",
  		source: "(1517:5) {#each optCollisionKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1528:2) {#if DtpSkpdi._map}
  function create_if_block_9(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div4;
  	let div2;
  	let t4;
  	let input0;
  	let t5;
  	let div3;
  	let input1;
  	let input1_checked_value;
  	let label0;
  	let t7;
  	let input2;
  	let input2_checked_value;
  	let label1;
  	let t9;
  	let dispose;
  	let if_block = /*optDataSkpdi*/ ctx[69].collision_type && create_if_block_10(ctx);

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
  			div4 = element("div");
  			div2 = element("div");
  			t4 = text("ID ДТП: ");
  			input0 = element("input");
  			t5 = space();
  			div3 = element("div");
  			input1 = element("input");
  			label0 = element("label");
  			label0.textContent = "- с мероприятиями";
  			t7 = space();
  			input2 = element("input");
  			label1 = element("label");
  			label1.textContent = "- без мероприятий";
  			t9 = space();
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$6, 1528, 21, 56907);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1528, 2, 56888);
  			add_location(b, file$6, 1529, 31, 56949);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1529, 2, 56920);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[19];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1531, 30, 57030);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1531, 3, 57003);
  			attr_dev(input1, "type", "checkbox");
  			attr_dev(input1, "id", "ev1");
  			input1.checked = input1_checked_value = /*evnt*/ ctx[21].ev1;
  			attr_dev(input1, "name", "ev1");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1533, 4, 57124);
  			attr_dev(label0, "for", "ev1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1533, 92, 57212);
  			attr_dev(input2, "type", "checkbox");
  			attr_dev(input2, "id", "ev0");
  			input2.checked = input2_checked_value = /*evnt*/ ctx[21].ev0;
  			attr_dev(input2, "name", "ev0");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$6, 1534, 4, 57260);
  			attr_dev(label1, "for", "ev0");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1534, 92, 57348);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$6, 1532, 3, 57100);
  			attr_dev(div4, "class", "filtersCont svelte-1jsovbn");
  			add_location(div4, file$6, 1530, 2, 56974);
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
  			append_dev(div2, t4);
  			append_dev(div2, input0);
  			append_dev(div4, t5);
  			append_dev(div4, div3);
  			append_dev(div3, input1);
  			append_dev(div3, label0);
  			append_dev(div3, t7);
  			append_dev(div3, input2);
  			append_dev(div3, label1);
  			append_dev(div4, t9);
  			if (if_block) if_block.m(div4, null);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input1, "change", /*oncheckEvents*/ ctx[112], false, false, false),
  				listen_dev(input2, "change", /*oncheckEvents*/ ctx[112], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input0.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[0] & /*evnt*/ 2097152 && input1_checked_value !== (input1_checked_value = /*evnt*/ ctx[21].ev1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[0] & /*evnt*/ 2097152 && input2_checked_value !== (input2_checked_value = /*evnt*/ ctx[21].ev0)) {
  				prop_dev(input2, "checked", input2_checked_value);
  			}

  			if (/*optDataSkpdi*/ ctx[69].collision_type) if_block.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div4);
  			if (if_block) if_block.d();
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_9.name,
  		type: "if",
  		source: "(1528:2) {#if DtpSkpdi._map}",
  		ctx
  	});

  	return block;
  }

  // (1537:3) {#if optDataSkpdi.collision_type}
  function create_if_block_10(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_4 = /*optCollisionSkpdiKeys*/ ctx[70];
  	validate_each_argument(each_value_4);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_4.length; i += 1) {
  		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
  	}

  	const block = {
  		c: function create() {
  			div = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все типы (${/*optCollisionSkpdiKeys*/ ctx[70].reduce(/*func_11*/ ctx[199], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$6, 1539, 5, 57579);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_skpdi*/ ctx[26] === void 0) add_render_callback(() => /*select_change_handler_5*/ ctx[200].call(select));
  			add_location(select, file$6, 1538, 4, 57466);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$6, 1537, 3, 57442);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_skpdi*/ ctx[26]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_5*/ ctx[200]),
  				listen_dev(select, "change", /*setFilterSkpdi*/ ctx[120], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[2] & /*optCollisionSkpdiKeys, optDataSkpdi*/ 384) {
  				each_value_4 = /*optCollisionSkpdiKeys*/ ctx[70];
  				validate_each_argument(each_value_4);
  				let i;

  				for (i = 0; i < each_value_4.length; i += 1) {
  					const child_ctx = get_each_context_4(ctx, each_value_4, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_4(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_4.length;
  			}

  			if (dirty[0] & /*collision_type_skpdi*/ 67108864) {
  				select_options(select, /*collision_type_skpdi*/ ctx[26]);
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
  		id: create_if_block_10.name,
  		type: "if",
  		source: "(1537:3) {#if optDataSkpdi.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1543:5) {#each optCollisionSkpdiKeys as key}
  function create_each_block_4(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataSkpdi*/ ctx[69].collision_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataSkpdi*/ ctx[69].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1543, 6, 57773);
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
  		source: "(1543:5) {#each optCollisionSkpdiKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1554:2) {#if DtpGibdd._map}
  function create_if_block_7$1(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div5;
  	let div2;
  	let t4;
  	let input0;
  	let t5;
  	let div3;
  	let input1;
  	let input1_checked_value;
  	let label0;
  	let t7;
  	let input2;
  	let input2_checked_value;
  	let label1;
  	let t9;
  	let div4;
  	let input3;
  	let input3_checked_value;
  	let label2;
  	let t11;
  	let input4;
  	let input4_checked_value;
  	let label3;
  	let t13;
  	let dispose;
  	let if_block = /*optDataGibdd*/ ctx[71].collision_type && create_if_block_8(ctx);

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
  			div5 = element("div");
  			div2 = element("div");
  			t4 = text("ID ДТП: ");
  			input0 = element("input");
  			t5 = space();
  			div3 = element("div");
  			input1 = element("input");
  			label0 = element("label");
  			label0.textContent = "- с батальонами ДПС";
  			t7 = space();
  			input2 = element("input");
  			label1 = element("label");
  			label1.textContent = "- без батальонов ДПС";
  			t9 = space();
  			div4 = element("div");
  			input3 = element("input");
  			label2 = element("label");
  			label2.textContent = "- с мероприятиями";
  			t11 = space();
  			input4 = element("input");
  			label3 = element("label");
  			label3.textContent = "- без мероприятий";
  			t13 = space();
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$6, 1554, 21, 58016);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1554, 2, 57997);
  			add_location(b, file$6, 1555, 31, 58058);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1555, 2, 58029);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[19];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1557, 30, 58139);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1557, 3, 58112);
  			attr_dev(input1, "type", "checkbox");
  			attr_dev(input1, "id", "Dps1");
  			input1.checked = input1_checked_value = /*dps*/ ctx[20].Dps1;
  			attr_dev(input1, "name", "Dps1");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1559, 4, 58233);
  			attr_dev(label0, "for", "Dps1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1559, 91, 58320);
  			attr_dev(input2, "type", "checkbox");
  			attr_dev(input2, "id", "Dps0");
  			input2.checked = input2_checked_value = /*dps*/ ctx[20].Dps0;
  			attr_dev(input2, "name", "Dps0");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$6, 1560, 4, 58371);
  			attr_dev(label1, "for", "Dps0");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1560, 91, 58458);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$6, 1558, 3, 58209);
  			attr_dev(input3, "type", "checkbox");
  			attr_dev(input3, "id", "ev1");
  			input3.checked = input3_checked_value = /*evnt*/ ctx[21].ev1;
  			attr_dev(input3, "name", "ev1");
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$6, 1563, 4, 58543);
  			attr_dev(label2, "for", "ev1");
  			attr_dev(label2, "class", "svelte-1jsovbn");
  			add_location(label2, file$6, 1563, 92, 58631);
  			attr_dev(input4, "type", "checkbox");
  			attr_dev(input4, "id", "ev0");
  			input4.checked = input4_checked_value = /*evnt*/ ctx[21].ev0;
  			attr_dev(input4, "name", "ev0");
  			attr_dev(input4, "class", "svelte-1jsovbn");
  			add_location(input4, file$6, 1564, 4, 58679);
  			attr_dev(label3, "for", "ev0");
  			attr_dev(label3, "class", "svelte-1jsovbn");
  			add_location(label3, file$6, 1564, 92, 58767);
  			attr_dev(div4, "class", "pLine svelte-1jsovbn");
  			add_location(div4, file$6, 1562, 3, 58519);
  			attr_dev(div5, "class", "filtersCont svelte-1jsovbn");
  			add_location(div5, file$6, 1556, 2, 58083);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, t1);
  			append_dev(div1, b);
  			insert_dev(target, t3, anchor);
  			insert_dev(target, div5, anchor);
  			append_dev(div5, div2);
  			append_dev(div2, t4);
  			append_dev(div2, input0);
  			append_dev(div5, t5);
  			append_dev(div5, div3);
  			append_dev(div3, input1);
  			append_dev(div3, label0);
  			append_dev(div3, t7);
  			append_dev(div3, input2);
  			append_dev(div3, label1);
  			append_dev(div5, t9);
  			append_dev(div5, div4);
  			append_dev(div4, input3);
  			append_dev(div4, label2);
  			append_dev(div4, t11);
  			append_dev(div4, input4);
  			append_dev(div4, label3);
  			append_dev(div5, t13);
  			if (if_block) if_block.m(div5, null);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input1, "change", /*oncheckDps*/ ctx[111], false, false, false),
  				listen_dev(input2, "change", /*oncheckDps*/ ctx[111], false, false, false),
  				listen_dev(input3, "change", /*oncheckEvents*/ ctx[112], false, false, false),
  				listen_dev(input4, "change", /*oncheckEvents*/ ctx[112], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input0.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[0] & /*dps*/ 1048576 && input1_checked_value !== (input1_checked_value = /*dps*/ ctx[20].Dps1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[0] & /*dps*/ 1048576 && input2_checked_value !== (input2_checked_value = /*dps*/ ctx[20].Dps0)) {
  				prop_dev(input2, "checked", input2_checked_value);
  			}

  			if (dirty[0] & /*evnt*/ 2097152 && input3_checked_value !== (input3_checked_value = /*evnt*/ ctx[21].ev1)) {
  				prop_dev(input3, "checked", input3_checked_value);
  			}

  			if (dirty[0] & /*evnt*/ 2097152 && input4_checked_value !== (input4_checked_value = /*evnt*/ ctx[21].ev0)) {
  				prop_dev(input4, "checked", input4_checked_value);
  			}

  			if (/*optDataGibdd*/ ctx[71].collision_type) if_block.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div5);
  			if (if_block) if_block.d();
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_7$1.name,
  		type: "if",
  		source: "(1554:2) {#if DtpGibdd._map}",
  		ctx
  	});

  	return block;
  }

  // (1567:3) {#if optDataGibdd.collision_type}
  function create_if_block_8(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_3 = /*optCollisionGibddKeys*/ ctx[72];
  	validate_each_argument(each_value_3);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_3.length; i += 1) {
  		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
  	}

  	const block = {
  		c: function create() {
  			div = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все типы (${/*optCollisionGibddKeys*/ ctx[72].reduce(/*func_12*/ ctx[201], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$6, 1569, 5, 58998);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_gibdd*/ ctx[27] === void 0) add_render_callback(() => /*select_change_handler_6*/ ctx[202].call(select));
  			add_location(select, file$6, 1568, 4, 58885);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$6, 1567, 3, 58861);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_gibdd*/ ctx[27]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_6*/ ctx[202]),
  				listen_dev(select, "change", /*setFilterGibdd*/ ctx[117], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[2] & /*optCollisionGibddKeys, optDataGibdd*/ 1536) {
  				each_value_3 = /*optCollisionGibddKeys*/ ctx[72];
  				validate_each_argument(each_value_3);
  				let i;

  				for (i = 0; i < each_value_3.length; i += 1) {
  					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_3$1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_3.length;
  			}

  			if (dirty[0] & /*collision_type_gibdd*/ 134217728) {
  				select_options(select, /*collision_type_gibdd*/ ctx[27]);
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
  		source: "(1567:3) {#if optDataGibdd.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1573:5) {#each optCollisionGibddKeys as key}
  function create_each_block_3$1(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataGibdd*/ ctx[71].collision_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataGibdd*/ ctx[71].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1573, 6, 59192);
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
  		id: create_each_block_3$1.name,
  		type: "each",
  		source: "(1573:5) {#each optCollisionGibddKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1584:2) {#if DtpGibddLo._map}
  function create_if_block_5$1(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div3;
  	let div2;
  	let t4;
  	let input;
  	let t5;
  	let dispose;
  	let if_block = /*optDataGibddLo*/ ctx[75].collision_type && create_if_block_6$1(ctx);

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			hr = element("hr");
  			t0 = space();
  			div1 = element("div");
  			t1 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП ГИБДД (Ленинградская область)";
  			t3 = space();
  			div3 = element("div");
  			div2 = element("div");
  			t4 = text("ID ДТП: ");
  			input = element("input");
  			t5 = space();
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$6, 1584, 21, 59437);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1584, 2, 59418);
  			add_location(b, file$6, 1585, 31, 59479);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1585, 2, 59450);
  			attr_dev(input, "type", "text");
  			input.value = /*id_dtp*/ ctx[19];
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1587, 30, 59584);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1587, 3, 59557);
  			attr_dev(div3, "class", "filtersCont svelte-1jsovbn");
  			add_location(div3, file$6, 1586, 2, 59528);
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
  			append_dev(div2, t4);
  			append_dev(div2, input);
  			append_dev(div3, t5);
  			if (if_block) if_block.m(div3, null);
  			if (remount) dispose();
  			dispose = listen_dev(input, "input", /*oncheckIdDtp*/ ctx[108], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (/*optDataGibddLo*/ ctx[75].collision_type) if_block.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div3);
  			if (if_block) if_block.d();
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_5$1.name,
  		type: "if",
  		source: "(1584:2) {#if DtpGibddLo._map}",
  		ctx
  	});

  	return block;
  }

  // (1597:3) {#if optDataGibddLo.collision_type}
  function create_if_block_6$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_2 = /*optCollisionGibddLoKeys*/ ctx[76];
  	validate_each_argument(each_value_2);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_2.length; i += 1) {
  		each_blocks[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
  	}

  	const block = {
  		c: function create() {
  			div = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все типы (${/*optCollisionGibddLoKeys*/ ctx[76].reduce(/*func_13*/ ctx[203], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$6, 1599, 5, 60454);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_gibdd*/ ctx[27] === void 0) add_render_callback(() => /*select_change_handler_7*/ ctx[204].call(select));
  			add_location(select, file$6, 1598, 4, 60339);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$6, 1597, 3, 60315);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_gibdd*/ ctx[27]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_7*/ ctx[204]),
  				listen_dev(select, "change", /*setFilterGibddLo*/ ctx[118], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[2] & /*optCollisionGibddLoKeys, optDataGibddLo*/ 24576) {
  				each_value_2 = /*optCollisionGibddLoKeys*/ ctx[76];
  				validate_each_argument(each_value_2);
  				let i;

  				for (i = 0; i < each_value_2.length; i += 1) {
  					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_2$2(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_2.length;
  			}

  			if (dirty[0] & /*collision_type_gibdd*/ 134217728) {
  				select_options(select, /*collision_type_gibdd*/ ctx[27]);
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
  		source: "(1597:3) {#if optDataGibddLo.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1603:5) {#each optCollisionGibddLoKeys as key}
  function create_each_block_2$2(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataGibddLo*/ ctx[75].collision_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataGibddLo*/ ctx[75].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1603, 6, 60654);
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
  		id: create_each_block_2$2.name,
  		type: "each",
  		source: "(1603:5) {#each optCollisionGibddLoKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1614:2) {#if DtpGibddSpt._map}
  function create_if_block_3$1(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div3;
  	let div2;
  	let t4;
  	let input;
  	let t5;
  	let dispose;
  	let if_block = /*optDataGibddSpt*/ ctx[73].collision_type && create_if_block_4$1(ctx);

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			hr = element("hr");
  			t0 = space();
  			div1 = element("div");
  			t1 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП ГИБДД (Санкт-Петербург)";
  			t3 = space();
  			div3 = element("div");
  			div2 = element("div");
  			t4 = text("ID ДТП: ");
  			input = element("input");
  			t5 = space();
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$6, 1614, 21, 60904);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1614, 2, 60885);
  			add_location(b, file$6, 1615, 31, 60946);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1615, 2, 60917);
  			attr_dev(input, "type", "text");
  			input.value = /*id_dtp*/ ctx[19];
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$6, 1617, 30, 61045);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1617, 3, 61018);
  			attr_dev(div3, "class", "filtersCont svelte-1jsovbn");
  			add_location(div3, file$6, 1616, 2, 60989);
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
  			append_dev(div2, t4);
  			append_dev(div2, input);
  			append_dev(div3, t5);
  			if (if_block) if_block.m(div3, null);
  			if (remount) dispose();
  			dispose = listen_dev(input, "input", /*oncheckIdDtp*/ ctx[108], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (/*optDataGibddSpt*/ ctx[73].collision_type) if_block.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div3);
  			if (if_block) if_block.d();
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_3$1.name,
  		type: "if",
  		source: "(1614:2) {#if DtpGibddSpt._map}",
  		ctx
  	});

  	return block;
  }

  // (1627:3) {#if optDataGibddSpt.collision_type}
  function create_if_block_4$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_1 = /*optCollisionGibddSptKeys*/ ctx[74];
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
						Все типы (${/*optCollisionGibddSptKeys*/ ctx[74].reduce(/*func_14*/ ctx[205], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$6, 1629, 5, 61917);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_gibdd*/ ctx[27] === void 0) add_render_callback(() => /*select_change_handler_8*/ ctx[206].call(select));
  			add_location(select, file$6, 1628, 4, 61801);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$6, 1627, 3, 61777);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_gibdd*/ ctx[27]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_8*/ ctx[206]),
  				listen_dev(select, "change", /*setFilterGibddSpt*/ ctx[119], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[2] & /*optCollisionGibddSptKeys, optDataGibddSpt*/ 6144) {
  				each_value_1 = /*optCollisionGibddSptKeys*/ ctx[74];
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

  			if (dirty[0] & /*collision_type_gibdd*/ 134217728) {
  				select_options(select, /*collision_type_gibdd*/ ctx[27]);
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
  		source: "(1627:3) {#if optDataGibddSpt.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1633:5) {#each optCollisionGibddSptKeys as key}
  function create_each_block_1$2(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataGibddSpt*/ ctx[73].collision_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataGibddSpt*/ ctx[73].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1633, 6, 62120);
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
  		source: "(1633:5) {#each optCollisionGibddSptKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1644:2) {#if DtpGibddRub._map}
  function create_if_block_1$2(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div2;
  	let t4;
  	let input0;
  	let t5;
  	let div3;
  	let input1;
  	let label0;
  	let t7;
  	let input2;
  	let label1;
  	let t9;
  	let div4;
  	let dispose;
  	let if_block = /*optDataGibddRub*/ ctx[79].collision_type && create_if_block_2$1(ctx);

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
  			t4 = text("ID ДТП: ");
  			input0 = element("input");
  			t5 = space();
  			div3 = element("div");
  			input1 = element("input");
  			label0 = element("label");
  			label0.textContent = "- с рубежами";
  			t7 = space();
  			input2 = element("input");
  			label1 = element("label");
  			label1.textContent = "- без рубежей";
  			t9 = space();
  			div4 = element("div");
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$6, 1644, 21, 62372);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1644, 2, 62353);
  			add_location(b, file$6, 1645, 31, 62414);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1645, 2, 62385);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[19];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1646, 30, 62476);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1646, 3, 62449);
  			attr_dev(input1, "type", "checkbox");
  			attr_dev(input1, "name", "list_rubOn");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1648, 3, 62568);
  			attr_dev(label0, "for", "list_rubOn");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1648, 100, 62665);
  			attr_dev(input2, "type", "checkbox");
  			attr_dev(input2, "name", "list_rubOff");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$6, 1649, 3, 62714);
  			attr_dev(label1, "for", "list_rubOff");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1649, 102, 62813);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$6, 1647, 2, 62545);
  			attr_dev(div4, "class", "filtersCont svelte-1jsovbn");
  			add_location(div4, file$6, 1651, 2, 62872);
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
  			append_dev(div2, t4);
  			append_dev(div2, input0);
  			insert_dev(target, t5, anchor);
  			insert_dev(target, div3, anchor);
  			append_dev(div3, input1);
  			input1.checked = /*list_rubOn*/ ctx[42];
  			append_dev(div3, label0);
  			append_dev(div3, t7);
  			append_dev(div3, input2);
  			input2.checked = /*list_rubOff*/ ctx[43];
  			append_dev(div3, label1);
  			insert_dev(target, t9, anchor);
  			insert_dev(target, div4, anchor);
  			if (if_block) if_block.m(div4, null);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[108], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_5*/ ctx[207]),
  				listen_dev(input1, "change", /*setFilterGibddRub*/ ctx[116], false, false, false),
  				listen_dev(input2, "change", /*input2_change_handler_4*/ ctx[208]),
  				listen_dev(input2, "change", /*setFilterGibddRub*/ ctx[116], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 524288 && input0.value !== /*id_dtp*/ ctx[19]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[19]);
  			}

  			if (dirty[1] & /*list_rubOn*/ 2048) {
  				input1.checked = /*list_rubOn*/ ctx[42];
  			}

  			if (dirty[1] & /*list_rubOff*/ 4096) {
  				input2.checked = /*list_rubOff*/ ctx[43];
  			}

  			if (/*optDataGibddRub*/ ctx[79].collision_type) if_block.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div2);
  			if (detaching) detach_dev(t5);
  			if (detaching) detach_dev(div3);
  			if (detaching) detach_dev(t9);
  			if (detaching) detach_dev(div4);
  			if (if_block) if_block.d();
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_1$2.name,
  		type: "if",
  		source: "(1644:2) {#if DtpGibddRub._map}",
  		ctx
  	});

  	return block;
  }

  // (1653:3) {#if optDataGibddRub.collision_type}
  function create_if_block_2$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value = /*optCollisionGibddRubKeys*/ ctx[80];
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
						Все типы (${/*optCollisionGibddRubKeys*/ ctx[80].reduce(/*func_15*/ ctx[209], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$6, 1655, 5, 63084);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_gibddRub*/ ctx[28] === void 0) add_render_callback(() => /*select_change_handler_9*/ ctx[210].call(select));
  			add_location(select, file$6, 1654, 4, 62965);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$6, 1653, 3, 62941);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_gibddRub*/ ctx[28]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_9*/ ctx[210]),
  				listen_dev(select, "change", /*setFilterGibddRub*/ ctx[116], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[2] & /*optCollisionGibddRubKeys, optDataGibddRub*/ 393216) {
  				each_value = /*optCollisionGibddRubKeys*/ ctx[80];
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

  			if (dirty[0] & /*collision_type_gibddRub*/ 268435456) {
  				select_options(select, /*collision_type_gibddRub*/ ctx[28]);
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
  		source: "(1653:3) {#if optDataGibddRub.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1659:5) {#each optCollisionGibddRubKeys as key}
  function create_each_block$4(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataGibddRub*/ ctx[79].collision_type[/*key*/ ctx[213]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[213] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[213];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataGibddRub*/ ctx[79].iconType[/*key*/ ctx[213]] + " svelte-1jsovbn");
  			add_location(option, file$6, 1659, 6, 63287);
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
  		source: "(1659:5) {#each optCollisionGibddRubKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1670:2) {#if Rub._map}
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
  			add_location(hr, file$6, 1670, 21, 63531);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$6, 1670, 2, 63512);
  			add_location(b, file$6, 1671, 31, 63573);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$6, 1671, 2, 63544);
  			attr_dev(input0, "type", "checkbox");
  			attr_dev(input0, "name", "comp1");
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$6, 1674, 4, 63649);
  			attr_dev(label0, "for", "comp1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$6, 1674, 82, 63727);
  			attr_dev(input1, "type", "checkbox");
  			attr_dev(input1, "name", "comp");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$6, 1675, 4, 63776);
  			attr_dev(label1, "for", "comp");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$6, 1675, 82, 63854);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$6, 1673, 3, 63625);
  			attr_dev(div3, "class", "filtersCont");
  			add_location(div3, file$6, 1672, 2, 63596);
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
  			input0.checked = /*compOn*/ ctx[33];
  			append_dev(div2, label0);
  			append_dev(div2, t5);
  			append_dev(div2, input1);
  			input1.checked = /*comp1On*/ ctx[34];
  			append_dev(div2, label1);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "change", /*input0_change_handler*/ ctx[211]),
  				listen_dev(input0, "change", /*setComp*/ ctx[102], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_6*/ ctx[212]),
  				listen_dev(input1, "change", /*setComp*/ ctx[102], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*compOn*/ 4) {
  				input0.checked = /*compOn*/ ctx[33];
  			}

  			if (dirty[1] & /*comp1On*/ 8) {
  				input1.checked = /*comp1On*/ ctx[34];
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
  		source: "(1670:2) {#if Rub._map}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$6(ctx) {
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
  	let t11;
  	let t12;
  	let t13;
  	let t14;
  	let t15;
  	let t16;
  	let if_block0 = /*DtpHearthsLo*/ ctx[11]._map && /*DtpHearthsLo*/ ctx[11]._opt && /*DtpHearthsLo*/ ctx[11]._opt.years && create_if_block_27(ctx);
  	let if_block1 = /*DtpHearthsPicket4*/ ctx[0]._map && /*DtpHearthsPicket4*/ ctx[0]._opt && /*DtpHearthsPicket4*/ ctx[0]._opt.years && create_if_block_26(ctx);
  	let if_block2 = /*DtpHearthsSettlements*/ ctx[1]._map && /*DtpHearthsSettlements*/ ctx[1]._opt && /*DtpHearthsSettlements*/ ctx[1]._opt.years && create_if_block_25(ctx);
  	let if_block3 = /*DtpHearthsPicket*/ ctx[2]._map && /*DtpHearthsPicket*/ ctx[2]._opt && /*DtpHearthsPicket*/ ctx[2]._opt.years && create_if_block_24(ctx);
  	let if_block4 = /*DtpHearths5*/ ctx[3]._map && /*DtpHearths5*/ ctx[3]._opt && /*DtpHearths5*/ ctx[3]._opt.years && create_if_block_23(ctx);
  	let if_block5 = /*DtpHearths3*/ ctx[4]._map && /*DtpHearths3*/ ctx[4]._opt && /*DtpHearths3*/ ctx[4]._opt.years && create_if_block_22(ctx);
  	let if_block6 = /*DtpHearthsStat*/ ctx[14]._map && /*DtpHearthsStat*/ ctx[14]._opt && /*DtpHearthsStat*/ ctx[14]._opt.years && create_if_block_21(ctx);
  	let if_block7 = /*DtpHearthsTmp*/ ctx[15]._map && /*DtpHearthsTmp*/ ctx[15]._opt && /*DtpHearthsTmp*/ ctx[15]._opt.years && create_if_block_20(ctx);
  	let if_block8 = /*DtpHearths*/ ctx[16]._map && /*DtpHearths*/ ctx[16]._opt && /*DtpHearths*/ ctx[16]._opt.years && create_if_block_19(ctx);

  	function select_block_type(ctx, dirty) {
  		if (/*DtpVerifyed*/ ctx[5]._map || /*DtpSkpdi*/ ctx[6]._map || /*DtpGibddLo*/ ctx[10]._map || /*DtpGibddSpt*/ ctx[9]._map || /*DtpGibdd*/ ctx[7]._map || /*DtpGibddRub*/ ctx[8]._map || /*Measures*/ ctx[13]._map) return create_if_block_16;
  		if (!/*Measures*/ ctx[13]._map && !/*DtpHearthsSettlements*/ ctx[1]._map && !/*DtpHearths*/ ctx[16]._map && !/*DtpHearthsStat*/ ctx[14]._map && !/*DtpHearthsTmp*/ ctx[15]._map && !/*DtpHearthsPicket4*/ ctx[0]._map && !/*DtpHearthsPicket*/ ctx[2]._map && !/*DtpHearths3*/ ctx[4]._map && !/*DtpHearths5*/ ctx[3]._map && !/*Rub*/ ctx[12]._map) return create_if_block_18;
  	}

  	let current_block_type = select_block_type(ctx);
  	let if_block9 = current_block_type && current_block_type(ctx);
  	let if_block10 = /*Measures*/ ctx[13]._map && create_if_block_14(ctx);
  	let if_block11 = /*DtpVerifyed*/ ctx[5]._map && create_if_block_11(ctx);
  	let if_block12 = /*DtpSkpdi*/ ctx[6]._map && create_if_block_9(ctx);
  	let if_block13 = /*DtpGibdd*/ ctx[7]._map && create_if_block_7$1(ctx);
  	let if_block14 = /*DtpGibddLo*/ ctx[10]._map && create_if_block_5$1(ctx);
  	let if_block15 = /*DtpGibddSpt*/ ctx[9]._map && create_if_block_3$1(ctx);
  	let if_block16 = /*DtpGibddRub*/ ctx[8]._map && create_if_block_1$2(ctx);
  	let if_block17 = /*Rub*/ ctx[12]._map && create_if_block$3(ctx);

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
  			t11 = space();
  			if (if_block12) if_block12.c();
  			t12 = space();
  			if (if_block13) if_block13.c();
  			t13 = space();
  			if (if_block14) if_block14.c();
  			t14 = space();
  			if (if_block15) if_block15.c();
  			t15 = space();
  			if (if_block16) if_block16.c();
  			t16 = space();
  			if (if_block17) if_block17.c();
  			attr_dev(div, "class", "mvsFilters");
  			add_location(div, file$6, 1019, 3, 31153);
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
  			append_dev(div, t11);
  			if (if_block12) if_block12.m(div, null);
  			append_dev(div, t12);
  			if (if_block13) if_block13.m(div, null);
  			append_dev(div, t13);
  			if (if_block14) if_block14.m(div, null);
  			append_dev(div, t14);
  			if (if_block15) if_block15.m(div, null);
  			append_dev(div, t15);
  			if (if_block16) if_block16.m(div, null);
  			append_dev(div, t16);
  			if (if_block17) if_block17.m(div, null);
  		},
  		p: function update(ctx, dirty) {
  			if (/*DtpHearthsLo*/ ctx[11]._map && /*DtpHearthsLo*/ ctx[11]._opt && /*DtpHearthsLo*/ ctx[11]._opt.years) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_27(ctx);
  					if_block0.c();
  					if_block0.m(div, t0);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*DtpHearthsPicket4*/ ctx[0]._map && /*DtpHearthsPicket4*/ ctx[0]._opt && /*DtpHearthsPicket4*/ ctx[0]._opt.years) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_26(ctx);
  					if_block1.c();
  					if_block1.m(div, t1);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if (/*DtpHearthsSettlements*/ ctx[1]._map && /*DtpHearthsSettlements*/ ctx[1]._opt && /*DtpHearthsSettlements*/ ctx[1]._opt.years) {
  				if (if_block2) {
  					if_block2.p(ctx, dirty);
  				} else {
  					if_block2 = create_if_block_25(ctx);
  					if_block2.c();
  					if_block2.m(div, t2);
  				}
  			} else if (if_block2) {
  				if_block2.d(1);
  				if_block2 = null;
  			}

  			if (/*DtpHearthsPicket*/ ctx[2]._map && /*DtpHearthsPicket*/ ctx[2]._opt && /*DtpHearthsPicket*/ ctx[2]._opt.years) {
  				if (if_block3) {
  					if_block3.p(ctx, dirty);
  				} else {
  					if_block3 = create_if_block_24(ctx);
  					if_block3.c();
  					if_block3.m(div, t3);
  				}
  			} else if (if_block3) {
  				if_block3.d(1);
  				if_block3 = null;
  			}

  			if (/*DtpHearths5*/ ctx[3]._map && /*DtpHearths5*/ ctx[3]._opt && /*DtpHearths5*/ ctx[3]._opt.years) {
  				if (if_block4) {
  					if_block4.p(ctx, dirty);
  				} else {
  					if_block4 = create_if_block_23(ctx);
  					if_block4.c();
  					if_block4.m(div, t4);
  				}
  			} else if (if_block4) {
  				if_block4.d(1);
  				if_block4 = null;
  			}

  			if (/*DtpHearths3*/ ctx[4]._map && /*DtpHearths3*/ ctx[4]._opt && /*DtpHearths3*/ ctx[4]._opt.years) {
  				if (if_block5) {
  					if_block5.p(ctx, dirty);
  				} else {
  					if_block5 = create_if_block_22(ctx);
  					if_block5.c();
  					if_block5.m(div, t5);
  				}
  			} else if (if_block5) {
  				if_block5.d(1);
  				if_block5 = null;
  			}

  			if (/*DtpHearthsStat*/ ctx[14]._map && /*DtpHearthsStat*/ ctx[14]._opt && /*DtpHearthsStat*/ ctx[14]._opt.years) {
  				if (if_block6) {
  					if_block6.p(ctx, dirty);
  				} else {
  					if_block6 = create_if_block_21(ctx);
  					if_block6.c();
  					if_block6.m(div, t6);
  				}
  			} else if (if_block6) {
  				if_block6.d(1);
  				if_block6 = null;
  			}

  			if (/*DtpHearthsTmp*/ ctx[15]._map && /*DtpHearthsTmp*/ ctx[15]._opt && /*DtpHearthsTmp*/ ctx[15]._opt.years) {
  				if (if_block7) {
  					if_block7.p(ctx, dirty);
  				} else {
  					if_block7 = create_if_block_20(ctx);
  					if_block7.c();
  					if_block7.m(div, t7);
  				}
  			} else if (if_block7) {
  				if_block7.d(1);
  				if_block7 = null;
  			}

  			if (/*DtpHearths*/ ctx[16]._map && /*DtpHearths*/ ctx[16]._opt && /*DtpHearths*/ ctx[16]._opt.years) {
  				if (if_block8) {
  					if_block8.p(ctx, dirty);
  				} else {
  					if_block8 = create_if_block_19(ctx);
  					if_block8.c();
  					if_block8.m(div, t8);
  				}
  			} else if (if_block8) {
  				if_block8.d(1);
  				if_block8 = null;
  			}

  			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block9) {
  				if_block9.p(ctx, dirty);
  			} else {
  				if (if_block9) if_block9.d(1);
  				if_block9 = current_block_type && current_block_type(ctx);

  				if (if_block9) {
  					if_block9.c();
  					if_block9.m(div, t9);
  				}
  			}

  			if (/*Measures*/ ctx[13]._map) {
  				if (if_block10) {
  					if_block10.p(ctx, dirty);
  				} else {
  					if_block10 = create_if_block_14(ctx);
  					if_block10.c();
  					if_block10.m(div, t10);
  				}
  			} else if (if_block10) {
  				if_block10.d(1);
  				if_block10 = null;
  			}

  			if (/*DtpVerifyed*/ ctx[5]._map) {
  				if (if_block11) {
  					if_block11.p(ctx, dirty);
  				} else {
  					if_block11 = create_if_block_11(ctx);
  					if_block11.c();
  					if_block11.m(div, t11);
  				}
  			} else if (if_block11) {
  				if_block11.d(1);
  				if_block11 = null;
  			}

  			if (/*DtpSkpdi*/ ctx[6]._map) {
  				if (if_block12) {
  					if_block12.p(ctx, dirty);
  				} else {
  					if_block12 = create_if_block_9(ctx);
  					if_block12.c();
  					if_block12.m(div, t12);
  				}
  			} else if (if_block12) {
  				if_block12.d(1);
  				if_block12 = null;
  			}

  			if (/*DtpGibdd*/ ctx[7]._map) {
  				if (if_block13) {
  					if_block13.p(ctx, dirty);
  				} else {
  					if_block13 = create_if_block_7$1(ctx);
  					if_block13.c();
  					if_block13.m(div, t13);
  				}
  			} else if (if_block13) {
  				if_block13.d(1);
  				if_block13 = null;
  			}

  			if (/*DtpGibddLo*/ ctx[10]._map) {
  				if (if_block14) {
  					if_block14.p(ctx, dirty);
  				} else {
  					if_block14 = create_if_block_5$1(ctx);
  					if_block14.c();
  					if_block14.m(div, t14);
  				}
  			} else if (if_block14) {
  				if_block14.d(1);
  				if_block14 = null;
  			}

  			if (/*DtpGibddSpt*/ ctx[9]._map) {
  				if (if_block15) {
  					if_block15.p(ctx, dirty);
  				} else {
  					if_block15 = create_if_block_3$1(ctx);
  					if_block15.c();
  					if_block15.m(div, t15);
  				}
  			} else if (if_block15) {
  				if_block15.d(1);
  				if_block15 = null;
  			}

  			if (/*DtpGibddRub*/ ctx[8]._map) {
  				if (if_block16) {
  					if_block16.p(ctx, dirty);
  				} else {
  					if_block16 = create_if_block_1$2(ctx);
  					if_block16.c();
  					if_block16.m(div, t16);
  				}
  			} else if (if_block16) {
  				if_block16.d(1);
  				if_block16 = null;
  			}

  			if (/*Rub*/ ctx[12]._map) {
  				if (if_block17) {
  					if_block17.p(ctx, dirty);
  				} else {
  					if_block17 = create_if_block$3(ctx);
  					if_block17.c();
  					if_block17.m(div, null);
  				}
  			} else if (if_block17) {
  				if_block17.d(1);
  				if_block17 = null;
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
  			if (if_block6) if_block6.d();
  			if (if_block7) if_block7.d();
  			if (if_block8) if_block8.d();

  			if (if_block9) {
  				if_block9.d();
  			}

  			if (if_block10) if_block10.d();
  			if (if_block11) if_block11.d();
  			if (if_block12) if_block12.d();
  			if (if_block13) if_block13.d();
  			if (if_block14) if_block14.d();
  			if (if_block15) if_block15.d();
  			if (if_block16) if_block16.d();
  			if (if_block17) if_block17.d();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$6.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$6($$self, $$props, $$invalidate) {
  	let { DtpHearthsPicket4 } = $$props;
  	let { DtpHearthsSettlements } = $$props;
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
  	let { DtpGibddSpt } = $$props;
  	let { DtpGibddLo } = $$props;
  	let { DtpHearthsLo } = $$props;
  	let { Rub } = $$props;
  	let { Measures } = $$props;
  	let { control } = $$props;

  	if (!Measures) {
  		Measures = {};
  	}

  	

  	if (!Rub) {
  		Rub = {};
  	}

  	

  	if (!DtpGibddRub) {
  		DtpGibddRub = {};
  	}

  	

  	if (!DtpHearthsPicket4) {
  		DtpHearthsPicket4 = {};
  	}

  	

  	if (!DtpHearthsPicket) {
  		DtpHearthsPicket = {};
  	}

  	

  	if (!DtpHearthsSettlements) {
  		DtpHearthsSettlements = {};
  	}

  	

  	if (!DtpHearths5) {
  		DtpHearths5 = {};
  	}

  	

  	if (!DtpHearths3) {
  		DtpHearths3 = {};
  	}

  	

  	if (!DtpHearthsLo) {
  		DtpHearthsLo = {};
  	}

  	

  	if (!DtpGibddLo) {
  		DtpGibddLo = {};
  	}

  	

  	if (!DtpGibddSpt) {
  		DtpGibddSpt = {};
  	}

  	
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
  	const bd = new Date(2019, 0, 1);

  	let id_dtp = control._id_dtp || null;
  	let dateInterval = control._dateInterval || [bd.getTime() / 1000, ed.getTime() / 1000];
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

  	let optDataGibddSpt = DtpGibddSpt._opt || {};

  	let optCollisionGibddSptKeys = optDataGibddSpt.collision_type
  	? Object.keys(optDataGibddSpt.collision_type).sort((a, b) => optDataGibddSpt.collision_type[b] - optDataGibddSpt.collision_type[a])
  	: [];

  	let optDataGibddLo = DtpGibddLo._opt || {};

  	let optCollisionGibddLoKeys = optDataGibddLo.collision_type
  	? Object.keys(optDataGibddLo.collision_type).sort((a, b) => optDataGibddLo.collision_type[b] - optDataGibddLo.collision_type[a])
  	: [];

  	let optDataHearthsLo = (DtpHearthsLo || {})._opt || {};

  	let optRoadTypesLo = optDataHearthsLo.road
  	? Object.keys(optDataHearthsLo.road).sort((a, b) => optDataHearthsLo.road[b] - optDataHearthsLo.road[a])
  	: [];

  	let dps = { "Dps1": true, "Dps0": true };
  	let evnt = { "ev1": true, "ev0": true };
  	let optDataGibddRub = (DtpGibddRub || {})._opt || {};

  	let optCollisionGibddRubKeys = optDataGibddRub.collision_type
  	? Object.keys(optDataGibddRub.collision_type).sort((a, b) => optDataGibddRub.collision_type[b] - optDataGibddRub.collision_type[a])
  	: [];

  	let optDataHearths = (DtpHearths || {})._opt || {};

  	let optTypeHearthsKeys = optDataHearths.str_icon_type
  	? Object.keys(optDataHearths.str_icon_type).sort((a, b) => optDataHearths.str_icon_type[b] - optDataHearths.str_icon_type[a])
  	: [];

  	let optDataHearthsTmp = (DtpHearthsTmp || {})._opt || {};

  	let optTypeHearthsTmpKeys = optDataHearthsTmp.str_icon_type
  	? Object.keys(optDataHearthsTmp.str_icon_type).sort((a, b) => optDataHearthsTmp.str_icon_type[b] - optDataHearthsTmp.str_icon_type[a])
  	: [];

  	let optDataHearthsStat = (DtpHearthsStat || {})._opt || {};

  	let optTypeHearthsStatKeys = optDataHearthsStat.str_icon_type
  	? Object.keys(optDataHearthsStat.str_icon_type).sort((a, b) => optDataHearthsStat.str_icon_type[b] - optDataHearthsStat.str_icon_type[a])
  	: [];

  	let optDataHearths3 = (DtpHearths3 || {})._opt || {};

  	let optTypeHearths3Keys = optDataHearths3.str_icon_type
  	? Object.keys(optDataHearths3.str_icon_type).sort((a, b) => optDataHearths3.str_icon_type[b] - optDataHearths3.str_icon_type[a])
  	: [];

  	let optDataHearths5 = (DtpHearths5 || {})._opt || {};

  	let optTypeHearths5Keys = optDataHearths5.str_icon_type
  	? Object.keys(optDataHearths5.str_icon_type).sort((a, b) => optDataHearths5.str_icon_type[b] - optDataHearths5.str_icon_type[a])
  	: [];

  	let optDataHearthsSettlements = (DtpHearthsSettlements || {})._opt || {};

  	let optRoadTypes5 = optDataHearthsSettlements.road
  	? Object.keys(optDataHearthsSettlements.road).sort((a, b) => optDataHearthsSettlements.road[b] - optDataHearthsSettlements.road[a])
  	: [];

  	let optDataHearthsPicket = (DtpHearthsPicket || {})._opt || {};

  	let optRoadTypes = optDataHearthsPicket.road
  	? Object.keys(optDataHearthsPicket.road).sort((a, b) => optDataHearthsPicket.road[b] - optDataHearthsPicket.road[a])
  	: [];

  	let optDataHearthsPicket4 = (DtpHearthsPicket4 || {})._opt || {};

  	let optRoadTypes4 = optDataHearthsPicket4.road
  	? Object.keys(optDataHearthsPicket4.road).sort((a, b) => optDataHearthsPicket4.road[b] - optDataHearthsPicket4.road[a])
  	: [];

  	let optMeasures = Measures._opt || {};

  	let optMeasuresKeys = optMeasures.type
  	? Object.keys(optMeasures.type).sort((a, b) => optMeasures.type[b] - optMeasures.type[a])
  	: [];

  	let roads = [""];
  	let ht = { "hearth3": true, "hearth5": true };
  	let id_hearth = null;
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
  	let heatElementDtpGibddLo;
  	let heatElementDtpGibddSpt;
  	let heatElementDtpGibdd;
  	let heatElementDtpSkpdi;
  	let heatElementDtpVerifyed;
  	let isHeatChecked = DtpGibddRub._map && DtpGibddRub._needHeat || DtpVerifyed._map && DtpVerifyed._needHeat || DtpSkpdi._map && DtpSkpdi._needHeat || DtpGibdd._map && DtpGibdd._needHeat || DtpGibddSpt && DtpGibddSpt._map && DtpGibddSpt._needHeat || DtpGibddLo && DtpGibddLo._map && DtpGibddLo._needHeat;

  	let _comps = Rub && Rub._argFilters
  	? Rub._argFilters[0]
  	: {
  			type: "comp",
  			zn: { on: true, off: true }
  		};

  	let compOn = _comps.zn.on;
  	let comp1On = _comps.zn.off;
  	let measures_type = [];

  	const setFilterMeasures = () => {
  		if (Measures._map) {
  			let opt = [];

  			if (measures_type.length) {
  				opt.push({ type: "measures_type", zn: measures_type });
  			}

  			// if (id_dtp) {
  			// opt.push({type: 'id_dtp', zn: id_dtp});
  			// }
  			if (dateInterval) {
  				opt.push({ type: "date", zn: dateInterval });
  			}

  			Measures.setFilter(opt);
  		}
  	};

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

  	let hearths_year_Settlements = {};

  	Object.keys(optDataHearthsSettlements.years || {}).sort().forEach(key => {
  		$$invalidate(36, hearths_year_Settlements[key] = true, hearths_year_Settlements);
  	});

  	let city = { 0: true, 1: true, 2: true };

  	const setFilterHearthsSettlements = ev => {
  		if (DtpHearthsSettlements._map) {
  			if (ev) {
  				let target = ev.target || {},
  					checked = target.checked,
  					id = target.id,
  					name = target.name;

  				if (id !== "stricken") {
  					$$invalidate(36, hearths_year_Settlements[name] = checked, hearths_year_Settlements);
  				}
  			}

  			let opt = [
  				{
  					type: "year",
  					zn: hearths_year_Settlements
  				}
  			];

  			if (city) {
  				opt.push({ type: "city", zn: city });
  			}

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
  			DtpHearthsSettlements.setFilter(opt);
  		}
  	};

  	let hearths_year_Lo = {};

  	Object.keys(optDataHearthsLo.years || {}).sort().forEach(key => {
  		$$invalidate(38, hearths_year_Lo[key] = true, hearths_year_Lo);
  	});

  	const setFilterHearthsLo = ev => {
  		if (DtpHearthsLo._map) {
  			if (ev) {
  				let target = ev.target || {},
  					checked = target.checked,
  					id = target.id,
  					name = target.name;

  				if (id !== "stricken") {
  					$$invalidate(38, hearths_year_Lo[name] = checked, hearths_year_Lo);
  				}
  			}

  			let opt = [{ type: "year", zn: hearths_year_Lo }];

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
  			DtpHearthsLo.setFilter(opt);
  		}
  	};

  	let hearths_year_Picket = {};

  	Object.keys(optDataHearthsPicket.years || {}).sort().forEach(key => {
  		$$invalidate(39, hearths_year_Picket[key] = true, hearths_year_Picket);
  	});

  	const setFilterHearthsPicket = ev => {
  		if (DtpHearthsPicket._map) {
  			if (ev) {
  				let target = ev.target || {},
  					checked = target.checked,
  					id = target.id,
  					name = target.name;

  				if (id !== "stricken") {
  					$$invalidate(39, hearths_year_Picket[name] = checked, hearths_year_Picket);
  				}
  			}

  			let opt = [{ type: "year", zn: hearths_year_Picket }];

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
  		}
  	};

  	let hearths_stricken4;
  	let hearths_year_Picket4 = {};

  	Object.keys(optDataHearthsPicket4.years || {}).sort().forEach(key => {
  		$$invalidate(41, hearths_year_Picket4[key] = true, hearths_year_Picket4);
  	});

  	const setFilterHearthsPicket4 = ev => {
  		if (DtpHearthsPicket4._map) {
  			if (ev) {
  				let target = ev.target || {},
  					checked = target.checked,
  					id = target.id,
  					name = target.name;

  				if (id !== "stricken") {
  					// hearths_stricken4 = 
  					// } else {
  					$$invalidate(41, hearths_year_Picket4[name] = checked, hearths_year_Picket4);
  				}
  			}

  			let opt = [];

  			if (id_dtp) {
  				opt.push({ type: "id_dtp", zn: id_dtp });
  			}

  			if (hearths_stricken4) {
  				opt.push({
  					type: "stricken",
  					zn: Number(hearths_stricken4)
  				});
  			}

  			if (hearths_period_type_Stat === 1) {
  				opt.push({ type: "year", zn: hearths_year_Picket4 });
  			}

  			if (id_hearth) {
  				opt.push({ type: "id_hearth", zn: id_hearth });
  			}

  			if (roads) {
  				opt.push({ type: "roads", zn: roads });
  			}

  			opt.push({ type: "ht", zn: ht });

  			// console.log('opt', opt);
  			DtpHearthsPicket4.setFilter(opt);
  		}
  	};

  	const refresh = () => {
  		setFilterHearthsLo();
  		setFilterHearthsPicket4();
  		setFilterHearthsSettlements();
  		setFilterHearthsPicket();
  		setFilterHearths5({});
  		setFilterHearths3({});
  		setFilterHearths({});
  		setFilterHearthsTmp({});
  		setFilterHearthsStat({});
  		setFilterSkpdi();
  		setFilterGibdd();
  		setFilterGibddSpt();
  		setFilterGibddLo();
  		setFilterGibddRub();
  		setFilterMeasures();
  		setFilter();
  	};

  	const oncheckIdCity = ev => {
  		let target = ev.target, name = target.name;
  		$$invalidate(37, city[name] = target.checked, city);
  		$$invalidate(129, control.city = city, control);
  		refresh();
  	};

  	const oncheckIdDtp = ev => {
  		let target = ev.target, value = target.value;
  		$$invalidate(19, id_dtp = value ? value : null);
  		$$invalidate(129, control._id_dtp = id_dtp, control);
  		refresh();
  	};

  	const oncheckIdHearth = ev => {
  		let target = ev.target, value = target.value;
  		$$invalidate(24, id_hearth = value ? value : null);
  		setFilterHearthsLo();
  		setFilterHearthsSettlements();
  		setFilterHearthsPicket();
  		setFilterHearthsPicket4();
  	};

  	const oncheckHt = ev => {
  		let target = ev.target;
  		$$invalidate(23, ht[target.name] = target.checked, ht);
  		setFilterHearthsLo();
  		setFilterHearthsSettlements();
  		setFilterHearthsPicket();
  		setFilterHearthsPicket4();
  	};

  	const oncheckDps = ev => {
  		let target = ev.target;
  		$$invalidate(20, dps[target.name] = target.checked, dps);
  		setFilterGibdd();
  	}; // setFilterGibddSpt();

  	const oncheckEvents = ev => {
  		let target = ev.target;
  		$$invalidate(21, evnt[target.name] = target.checked, evnt);
  		setFilterGibdd();
  		setFilterSkpdi();

  		// setFilterGibddSpt();
  		setFilter();
  	};

  	const setHeat = ev => {
  		let target = ev.target;
  		$$invalidate(8, DtpGibddRub._needHeat = $$invalidate(10, DtpGibddLo._needHeat = $$invalidate(9, DtpGibddSpt._needHeat = $$invalidate(7, DtpGibdd._needHeat = $$invalidate(6, DtpSkpdi._needHeat = $$invalidate(5, DtpVerifyed._needHeat = target.checked ? heat : false, DtpVerifyed), DtpSkpdi), DtpGibdd), DtpGibddSpt), DtpGibddLo), DtpGibddRub);
  		setFilterGibddRub();
  		setFilterGibdd();

  		// DtpSkpdi._needHeat = _needHeat;
  		setFilterSkpdi();

  		// DtpVerifyed._needHeat = _needHeat;
  		setFilterGibddSpt();

  		setFilterGibddLo();
  		setFilter();
  	};

  	const setMinOpacity = () => {
  		let opt = { radius, blur, minOpacity };

  		if (DtpGibddLo._heat) {
  			DtpGibddLo._heat.setOptions(opt);
  		}

  		if (DtpGibddSpt._heat) {
  			DtpGibddSpt._heat.setOptions(opt);
  		}

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
  		if (DtpVerifyed._map) {
  			let opt = [{ type: "evnt", zn: evnt }, { type: "itemType", zn: currentFilter }];

  			if (id_dtp) {
  				opt.push({ type: "id_dtp", zn: id_dtp });
  			}

  			if (dateInterval) {
  				$$invalidate(129, control._dateInterval = dateInterval, control);
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
  		}
  	};

  	let _list_rub = DtpGibddRub._argFilters && DtpGibddRub._argFilters.length
  	? DtpGibddRub._argFilters[0]
  	: {
  			type: "list_rub",
  			zn: { on: true, off: true }
  		};

  	let list_rubOn = _list_rub.zn.on;
  	let list_rubOff = _list_rub.zn.off;

  	const setFilterGibddRub = () => {
  		if (DtpGibddRub._map) {
  			let opt = [
  				{
  					type: "list_rub",
  					zn: { on: list_rubOn, off: list_rubOff }
  				}
  			];

  			if (id_dtp) {
  				opt.push({ type: "id_dtp", zn: id_dtp });
  			}

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
  		}
  	};

  	const setFilterGibdd = () => {
  		if (DtpGibdd._map) {
  			let opt = [{ type: "dps", zn: dps }, { type: "evnt", zn: evnt }];

  			if (id_dtp) {
  				opt.push({ type: "id_dtp", zn: id_dtp });
  			}

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
  		}
  	};

  	const setFilterGibddLo = () => {
  		if (DtpGibddLo._map) {
  			let opt = []; // {type: 'dps', zn: dps},
  			// {type: 'evnt', zn: evnt}

  			if (id_dtp) {
  				opt.push({ type: "id_dtp", zn: id_dtp });
  			}

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
  			DtpGibddLo.setFilter(opt);
  		}
  	};

  	const setFilterGibddSpt = () => {
  		if (DtpGibddSpt._map) {
  			let opt = []; // {type: 'dps', zn: dps},
  			// {type: 'evnt', zn: evnt}

  			if (id_dtp) {
  				opt.push({ type: "id_dtp", zn: id_dtp });
  			}

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
  			DtpGibddSpt.setFilter(opt);
  		}
  	};

  	const setFilterSkpdi = () => {
  		if (DtpSkpdi._map) {
  			let opt = [{ type: "evnt", zn: evnt }];

  			if (id_dtp) {
  				opt.push({ type: "id_dtp", zn: id_dtp });
  			}

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
  		}
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
  				setFilterGibddLo();
  				setFilterGibddSpt();
  				setFilterMeasures();
  				setFilterGibddRub();
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

  		// id_dtp = null;
  		refresh();
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
  		setFilterSkpdi();
  		setFilterGibdd();
  		setFilterGibddLo();
  		setFilterGibddSpt();
  		setFilterGibddRub();
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
  		setFilterSkpdi();
  		setFilterGibdd();
  		setFilterGibddLo();
  		setFilterGibddSpt();
  		setFilterGibddRub();
  	}; // console.log('ss1ssss', dateInterval, beg.getDate(), end.getDate())

  	// ДТП Очаги (5)
  	let hearths_stricken5;

  	let str_icon_type5 = [""];
  	let hearths_period_type_5 = 1;
  	let hearths_year_5 = {};
  	let hearths_quarter_5 = {};
  	let last_quarter_5;

  	Object.keys(optDataHearths5.years || {}).sort().forEach(key => {
  		$$invalidate(47, hearths_year_5[key] = true, hearths_year_5);

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
  		if (DtpHearths5._map) {
  			let arg = [],
  				target = ev.target || {},
  				checked = target.checked,
  				id = target.id,
  				name = target.name;

  			// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);
  			if (id === "hearths_period_type_52") {
  				$$invalidate(46, hearths_period_type_5 = 2);
  			} else if (id === "hearths_period_type_51") {
  				$$invalidate(46, hearths_period_type_5 = 1);
  			} else if (id === "hearths_year_5") {
  				if (checked) {
  					$$invalidate(47, hearths_year_5[name] = true, hearths_year_5);
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

  			if (id_dtp) {
  				arg.push({ type: "id_dtp", zn: id_dtp });
  			}

  			DtpHearths5.setFilter(arg);
  		}
  	};

  	// ДТП Очаги (3)
  	let hearths_stricken3;

  	let str_icon_type3 = [""];
  	let hearths_period_type_3 = 1;
  	let hearths_year_3 = {};
  	let hearths_quarter_3 = {};
  	let last_quarter_3;

  	Object.keys(optDataHearths3.years || {}).sort().forEach(key => {
  		$$invalidate(51, hearths_year_3[key] = true, hearths_year_3);

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
  		if (DtpHearths3._map) {
  			let arg = [],
  				target = ev.target || {},
  				checked = target.checked,
  				id = target.id,
  				name = target.name;

  			// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);
  			if (id === "hearths_period_type_32") {
  				$$invalidate(50, hearths_period_type_3 = 2);
  			} else if (id === "hearths_period_type_31") {
  				$$invalidate(50, hearths_period_type_3 = 1);
  			} else if (id === "hearths_year_3") {
  				if (checked) {
  					$$invalidate(51, hearths_year_3[name] = true, hearths_year_3);
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

  			if (id_dtp) {
  				arg.push({ type: "id_dtp", zn: id_dtp });
  			}

  			DtpHearths3.setFilter(arg);
  		}
  	};

  	// ДТП Очаги (Stat)
  	let hearths_strickenStat;

  	let str_icon_typeStat = [""];
  	let hearths_period_type_Stat = 1;
  	let hearths_year_Stat = {};
  	let hearths_quarter_Stat = {};
  	let last_quarter_Stat;

  	Object.keys(optDataHearthsStat.years || {}).sort().forEach(key => {
  		$$invalidate(55, hearths_year_Stat[key] = true, hearths_year_Stat);

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
  		if (DtpHearthsStat._map) {
  			let arg = [],
  				target = ev.target || {},
  				checked = target.checked,
  				id = target.id,
  				name = target.name;

  			// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);
  			if (id === "hearths_period_type_Stat2") {
  				$$invalidate(54, hearths_period_type_Stat = 2);
  			} else if (id === "hearths_period_type_Stat1") {
  				$$invalidate(54, hearths_period_type_Stat = 1);
  			} else if (id === "hearths_year_Stat") {
  				if (checked) {
  					$$invalidate(55, hearths_year_Stat[name] = true, hearths_year_Stat);
  				} else {
  					delete hearths_year_Stat[name];
  				}
  			} else if (id === "hearths_quarter_Stat") {
  				let arr = name.split("_");

  				if (checked) {
  					if (!hearths_quarter_Stat[arr[0]]) {
  						$$invalidate(56, hearths_quarter_Stat[arr[0]] = {}, hearths_quarter_Stat);
  					}

  					$$invalidate(56, hearths_quarter_Stat[arr[0]][arr[1]] = true, hearths_quarter_Stat);
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

  			if (id_dtp) {
  				arg.push({ type: "id_dtp", zn: id_dtp });
  			}

  			DtpHearthsStat.setFilter(arg);
  		}
  	};

  	// ДТП Очаги (TMP)
  	let hearths_strickenTmp;

  	let str_icon_typeTmp = [""];
  	let hearths_period_type_tmp = 1;
  	let hearths_year_tmp = {};
  	let hearths_quarter_tmp = {};
  	let last_quarter_tmp;

  	Object.keys(optDataHearthsTmp.years || {}).sort().forEach(key => {
  		$$invalidate(60, hearths_year_tmp[key] = true, hearths_year_tmp);

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
  		if (DtpHearthsTmp._map) {
  			let arg = [],
  				target = ev.target || {},
  				checked = target.checked,
  				id = target.id,
  				name = target.name;

  			// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);
  			if (id === "hearths_period_type_tmp2") {
  				$$invalidate(59, hearths_period_type_tmp = 2);
  			} else if (id === "hearths_period_type_tmp1") {
  				$$invalidate(59, hearths_period_type_tmp = 1);
  			} else if (id === "hearths_year_tmp") {
  				if (checked) {
  					$$invalidate(60, hearths_year_tmp[name] = true, hearths_year_tmp);
  				} else {
  					delete hearths_year_tmp[name];
  				}
  			} else if (id === "hearths_quarter_tmp") {
  				let arr = name.split("_");

  				if (checked) {
  					if (!hearths_quarter_tmp[arr[0]]) {
  						$$invalidate(61, hearths_quarter_tmp[arr[0]] = {}, hearths_quarter_tmp);
  					}

  					$$invalidate(61, hearths_quarter_tmp[arr[0]][arr[1]] = true, hearths_quarter_tmp);
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

  			if (id_dtp) {
  				arg.push({ type: "id_dtp", zn: id_dtp });
  			}

  			DtpHearthsTmp.setFilter(arg);
  		}
  	};

  	// ДТП Очаги
  	let hearths_stricken;

  	let str_icon_type = [""];
  	let hearths_period_type = 1;
  	let hearths_year = {};
  	let hearths_quarter = {};
  	let last_quarter;

  	Object.keys(optDataHearths.years || {}).sort().forEach(key => {
  		$$invalidate(65, hearths_year[key] = true, hearths_year);

  		Object.keys(optDataHearths.years[key]).sort().forEach(key1 => {
  			last_quarter = {};
  			last_quarter[key] = {};
  			last_quarter[key][key1] = true;
  		});
  	});

  	hearths_quarter = last_quarter || {};

  	const setFilterHearths = ev => {
  		if (DtpHearths._map) {
  			let arg = [],
  				target = ev.target || {},
  				checked = target.checked,
  				id = target.id,
  				name = target.name;

  			// console.log('setFilterHearths', checked, id, name, ev);
  			if (id === "hearths_period_type2") {
  				$$invalidate(64, hearths_period_type = 2);
  			} else if (id === "hearths_period_type1") {
  				$$invalidate(64, hearths_period_type = 1);
  			} else if (id === "hearths_year") {
  				if (checked) {
  					$$invalidate(65, hearths_year[name] = true, hearths_year);
  				} else {
  					delete hearths_year[name];
  				}
  			} else if (id === "hearths_quarter") {
  				let arr = name.split("_");

  				if (checked) {
  					if (!hearths_quarter[arr[0]]) {
  						$$invalidate(66, hearths_quarter[arr[0]] = {}, hearths_quarter);
  					}

  					$$invalidate(66, hearths_quarter[arr[0]][arr[1]] = true, hearths_quarter);
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

  			if (id_dtp) {
  				arg.push({ type: "id_dtp", zn: id_dtp });
  			}

  			DtpHearths.setFilter(arg);
  		}
  	};

  	const writable_props = [
  		"DtpHearthsPicket4",
  		"DtpHearthsSettlements",
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
  		"DtpGibddSpt",
  		"DtpGibddLo",
  		"DtpHearthsLo",
  		"Rub",
  		"Measures",
  		"control"
  	];

  	Object_1.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DtpVerifyedFilters> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpVerifyedFilters", $$slots, []);
  	const $$binding_groups = [[], [], [], [], []];

  	const func = (p, c) => {
  		p += optDataHearthsLo.road[c];
  		return p;
  	};

  	function select_change_handler() {
  		roads = select_multiple_value(this);
  		$$invalidate(22, roads);
  		$$invalidate(78, optRoadTypesLo);
  	}

  	function input2_change_handler() {
  		hearths_period_type_Stat = this.__value;
  		$$invalidate(54, hearths_period_type_Stat);
  	}

  	const func_1 = (p, c) => {
  		p += optDataHearthsPicket4.road[c];
  		return p;
  	};

  	function select0_change_handler() {
  		roads = select_multiple_value(this);
  		$$invalidate(22, roads);
  		$$invalidate(78, optRoadTypesLo);
  	}

  	function select1_change_handler() {
  		hearths_stricken4 = select_value(this);
  		$$invalidate(40, hearths_stricken4);
  	}

  	const func_2 = (p, c) => {
  		p += optDataHearthsSettlements.road[c];
  		return p;
  	};

  	function select_change_handler_1() {
  		roads = select_multiple_value(this);
  		$$invalidate(22, roads);
  		$$invalidate(78, optRoadTypesLo);
  	}

  	const func_3 = (p, c) => {
  		p += optDataHearthsPicket.road[c];
  		return p;
  	};

  	function select_change_handler_2() {
  		roads = select_multiple_value(this);
  		$$invalidate(22, roads);
  		$$invalidate(78, optRoadTypesLo);
  	}

  	function input1_change_handler() {
  		hearths_period_type_5 = this.__value;
  		$$invalidate(46, hearths_period_type_5);
  	}

  	const func_4 = (p, c) => {
  		p += optDataHearths5.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_1() {
  		str_icon_type5 = select_multiple_value(this);
  		$$invalidate(45, str_icon_type5);
  		$$invalidate(90, optTypeHearths5Keys);
  	}

  	function select1_change_handler_1() {
  		hearths_stricken5 = select_value(this);
  		$$invalidate(44, hearths_stricken5);
  	}

  	function input1_change_handler_1() {
  		hearths_period_type_3 = this.__value;
  		$$invalidate(50, hearths_period_type_3);
  	}

  	const func_5 = (p, c) => {
  		p += optDataHearths3.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_2() {
  		str_icon_type3 = select_multiple_value(this);
  		$$invalidate(49, str_icon_type3);
  		$$invalidate(88, optTypeHearths3Keys);
  	}

  	function select1_change_handler_2() {
  		hearths_stricken3 = select_value(this);
  		$$invalidate(48, hearths_stricken3);
  	}

  	function input1_change_handler_2() {
  		hearths_period_type_Stat = this.__value;
  		$$invalidate(54, hearths_period_type_Stat);
  	}

  	function input2_change_handler_1() {
  		hearths_period_type_Stat = this.__value;
  		$$invalidate(54, hearths_period_type_Stat);
  	}

  	const func_6 = (p, c) => {
  		p += optDataHearthsStat.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_3() {
  		str_icon_typeStat = select_multiple_value(this);
  		$$invalidate(53, str_icon_typeStat);
  		$$invalidate(86, optTypeHearthsStatKeys);
  	}

  	function select1_change_handler_3() {
  		hearths_strickenStat = select_value(this);
  		$$invalidate(52, hearths_strickenStat);
  	}

  	function input1_change_handler_3() {
  		hearths_period_type_tmp = this.__value;
  		$$invalidate(59, hearths_period_type_tmp);
  	}

  	function input2_change_handler_2() {
  		hearths_period_type_tmp = this.__value;
  		$$invalidate(59, hearths_period_type_tmp);
  	}

  	const func_7 = (p, c) => {
  		p += optDataHearthsTmp.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_4() {
  		str_icon_typeTmp = select_multiple_value(this);
  		$$invalidate(58, str_icon_typeTmp);
  		$$invalidate(84, optTypeHearthsTmpKeys);
  	}

  	function select1_change_handler_4() {
  		hearths_strickenTmp = select_value(this);
  		$$invalidate(57, hearths_strickenTmp);
  	}

  	function input1_change_handler_4() {
  		hearths_period_type = this.__value;
  		$$invalidate(64, hearths_period_type);
  	}

  	function input2_change_handler_3() {
  		hearths_period_type = this.__value;
  		$$invalidate(64, hearths_period_type);
  	}

  	const func_8 = (p, c) => {
  		p += optDataHearths.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_5() {
  		str_icon_type = select_multiple_value(this);
  		$$invalidate(63, str_icon_type);
  		$$invalidate(82, optTypeHearthsKeys);
  	}

  	function select1_change_handler_5() {
  		hearths_stricken = select_value(this);
  		$$invalidate(62, hearths_stricken);
  	}

  	function input0_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(17, begDate = $$value);
  		});
  	}

  	function input1_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(18, endDate = $$value);
  		});
  	}

  	function input0_change_input_handler() {
  		minOpacity = to_number(this.value);
  		$$invalidate(31, minOpacity);
  	}

  	function input1_change_input_handler() {
  		radius = to_number(this.value);
  		$$invalidate(29, radius);
  	}

  	function input2_change_input_handler() {
  		blur = to_number(this.value);
  		$$invalidate(30, blur);
  	}

  	function input3_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(32, heatElement = $$value);
  		});
  	}

  	const func_9 = (p, c) => {
  		p += optMeasures.type[c];
  		return p;
  	};

  	function select_change_handler_3() {
  		measures_type = select_multiple_value(this);
  		$$invalidate(35, measures_type);
  		$$invalidate(98, optMeasuresKeys);
  	}

  	const func_10 = (p, c) => {
  		p += optData.collision_type[c];
  		return p;
  	};

  	function select_change_handler_4() {
  		collision_type = select_multiple_value(this);
  		$$invalidate(25, collision_type);
  		$$invalidate(68, optCollisionKeys);
  	}

  	const func_11 = (p, c) => {
  		p += optDataSkpdi.collision_type[c];
  		return p;
  	};

  	function select_change_handler_5() {
  		collision_type_skpdi = select_multiple_value(this);
  		$$invalidate(26, collision_type_skpdi);
  		$$invalidate(70, optCollisionSkpdiKeys);
  	}

  	const func_12 = (p, c) => {
  		p += optDataGibdd.collision_type[c];
  		return p;
  	};

  	function select_change_handler_6() {
  		collision_type_gibdd = select_multiple_value(this);
  		$$invalidate(27, collision_type_gibdd);
  		$$invalidate(72, optCollisionGibddKeys);
  	}

  	const func_13 = (p, c) => {
  		p += optDataGibddLo.collision_type[c];
  		return p;
  	};

  	function select_change_handler_7() {
  		collision_type_gibdd = select_multiple_value(this);
  		$$invalidate(27, collision_type_gibdd);
  		$$invalidate(72, optCollisionGibddKeys);
  	}

  	const func_14 = (p, c) => {
  		p += optDataGibddSpt.collision_type[c];
  		return p;
  	};

  	function select_change_handler_8() {
  		collision_type_gibdd = select_multiple_value(this);
  		$$invalidate(27, collision_type_gibdd);
  		$$invalidate(72, optCollisionGibddKeys);
  	}

  	function input1_change_handler_5() {
  		list_rubOn = this.checked;
  		$$invalidate(42, list_rubOn);
  	}

  	function input2_change_handler_4() {
  		list_rubOff = this.checked;
  		$$invalidate(43, list_rubOff);
  	}

  	const func_15 = (p, c) => {
  		p += optDataGibddRub.collision_type[c];
  		return p;
  	};

  	function select_change_handler_9() {
  		collision_type_gibddRub = select_multiple_value(this);
  		$$invalidate(28, collision_type_gibddRub);
  		$$invalidate(80, optCollisionGibddRubKeys);
  	}

  	function input0_change_handler() {
  		compOn = this.checked;
  		$$invalidate(33, compOn);
  	}

  	function input1_change_handler_6() {
  		comp1On = this.checked;
  		$$invalidate(34, comp1On);
  	}

  	$$self.$set = $$props => {
  		if ("DtpHearthsPicket4" in $$props) $$invalidate(0, DtpHearthsPicket4 = $$props.DtpHearthsPicket4);
  		if ("DtpHearthsSettlements" in $$props) $$invalidate(1, DtpHearthsSettlements = $$props.DtpHearthsSettlements);
  		if ("DtpHearthsPicket" in $$props) $$invalidate(2, DtpHearthsPicket = $$props.DtpHearthsPicket);
  		if ("DtpHearths5" in $$props) $$invalidate(3, DtpHearths5 = $$props.DtpHearths5);
  		if ("DtpHearths3" in $$props) $$invalidate(4, DtpHearths3 = $$props.DtpHearths3);
  		if ("DtpHearthsStat" in $$props) $$invalidate(14, DtpHearthsStat = $$props.DtpHearthsStat);
  		if ("DtpHearthsTmp" in $$props) $$invalidate(15, DtpHearthsTmp = $$props.DtpHearthsTmp);
  		if ("DtpHearths" in $$props) $$invalidate(16, DtpHearths = $$props.DtpHearths);
  		if ("DtpVerifyed" in $$props) $$invalidate(5, DtpVerifyed = $$props.DtpVerifyed);
  		if ("DtpSkpdi" in $$props) $$invalidate(6, DtpSkpdi = $$props.DtpSkpdi);
  		if ("DtpGibdd" in $$props) $$invalidate(7, DtpGibdd = $$props.DtpGibdd);
  		if ("DtpGibddRub" in $$props) $$invalidate(8, DtpGibddRub = $$props.DtpGibddRub);
  		if ("DtpGibddSpt" in $$props) $$invalidate(9, DtpGibddSpt = $$props.DtpGibddSpt);
  		if ("DtpGibddLo" in $$props) $$invalidate(10, DtpGibddLo = $$props.DtpGibddLo);
  		if ("DtpHearthsLo" in $$props) $$invalidate(11, DtpHearthsLo = $$props.DtpHearthsLo);
  		if ("Rub" in $$props) $$invalidate(12, Rub = $$props.Rub);
  		if ("Measures" in $$props) $$invalidate(13, Measures = $$props.Measures);
  		if ("control" in $$props) $$invalidate(129, control = $$props.control);
  	};

  	$$self.$capture_state = () => ({
  		onMount,
  		DtpHearthsPicket4,
  		DtpHearthsSettlements,
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
  		DtpGibddSpt,
  		DtpGibddLo,
  		DtpHearthsLo,
  		Rub,
  		Measures,
  		control,
  		currentFilter,
  		currentFilterDtpHearths,
  		begDate,
  		endDate,
  		td,
  		tdd,
  		ed,
  		bd,
  		id_dtp,
  		dateInterval,
  		optData,
  		optCollisionKeys,
  		optDataSkpdi,
  		optCollisionSkpdiKeys,
  		optDataGibdd,
  		optCollisionGibddKeys,
  		optDataGibddSpt,
  		optCollisionGibddSptKeys,
  		optDataGibddLo,
  		optCollisionGibddLoKeys,
  		optDataHearthsLo,
  		optRoadTypesLo,
  		dps,
  		evnt,
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
  		optDataHearthsSettlements,
  		optRoadTypes5,
  		optDataHearthsPicket,
  		optRoadTypes,
  		optDataHearthsPicket4,
  		optRoadTypes4,
  		optMeasures,
  		optMeasuresKeys,
  		roads,
  		ht,
  		id_hearth,
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
  		heatElementDtpGibddLo,
  		heatElementDtpGibddSpt,
  		heatElementDtpGibdd,
  		heatElementDtpSkpdi,
  		heatElementDtpVerifyed,
  		isHeatChecked,
  		_comps,
  		compOn,
  		comp1On,
  		measures_type,
  		setFilterMeasures,
  		setComp,
  		hearths_year_Settlements,
  		city,
  		setFilterHearthsSettlements,
  		hearths_year_Lo,
  		setFilterHearthsLo,
  		hearths_year_Picket,
  		setFilterHearthsPicket,
  		hearths_stricken4,
  		hearths_year_Picket4,
  		setFilterHearthsPicket4,
  		refresh,
  		oncheckIdCity,
  		oncheckIdDtp,
  		oncheckIdHearth,
  		oncheckHt,
  		oncheckDps,
  		oncheckEvents,
  		setHeat,
  		setMinOpacity,
  		setFilter,
  		_list_rub,
  		list_rubOn,
  		list_rubOff,
  		setFilterGibddRub,
  		setFilterGibdd,
  		setFilterGibddLo,
  		setFilterGibddSpt,
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
  		if ("DtpHearthsPicket4" in $$props) $$invalidate(0, DtpHearthsPicket4 = $$props.DtpHearthsPicket4);
  		if ("DtpHearthsSettlements" in $$props) $$invalidate(1, DtpHearthsSettlements = $$props.DtpHearthsSettlements);
  		if ("DtpHearthsPicket" in $$props) $$invalidate(2, DtpHearthsPicket = $$props.DtpHearthsPicket);
  		if ("DtpHearths5" in $$props) $$invalidate(3, DtpHearths5 = $$props.DtpHearths5);
  		if ("DtpHearths3" in $$props) $$invalidate(4, DtpHearths3 = $$props.DtpHearths3);
  		if ("DtpHearthsStat" in $$props) $$invalidate(14, DtpHearthsStat = $$props.DtpHearthsStat);
  		if ("DtpHearthsTmp" in $$props) $$invalidate(15, DtpHearthsTmp = $$props.DtpHearthsTmp);
  		if ("DtpHearths" in $$props) $$invalidate(16, DtpHearths = $$props.DtpHearths);
  		if ("DtpVerifyed" in $$props) $$invalidate(5, DtpVerifyed = $$props.DtpVerifyed);
  		if ("DtpSkpdi" in $$props) $$invalidate(6, DtpSkpdi = $$props.DtpSkpdi);
  		if ("DtpGibdd" in $$props) $$invalidate(7, DtpGibdd = $$props.DtpGibdd);
  		if ("DtpGibddRub" in $$props) $$invalidate(8, DtpGibddRub = $$props.DtpGibddRub);
  		if ("DtpGibddSpt" in $$props) $$invalidate(9, DtpGibddSpt = $$props.DtpGibddSpt);
  		if ("DtpGibddLo" in $$props) $$invalidate(10, DtpGibddLo = $$props.DtpGibddLo);
  		if ("DtpHearthsLo" in $$props) $$invalidate(11, DtpHearthsLo = $$props.DtpHearthsLo);
  		if ("Rub" in $$props) $$invalidate(12, Rub = $$props.Rub);
  		if ("Measures" in $$props) $$invalidate(13, Measures = $$props.Measures);
  		if ("control" in $$props) $$invalidate(129, control = $$props.control);
  		if ("currentFilter" in $$props) currentFilter = $$props.currentFilter;
  		if ("currentFilterDtpHearths" in $$props) currentFilterDtpHearths = $$props.currentFilterDtpHearths;
  		if ("begDate" in $$props) $$invalidate(17, begDate = $$props.begDate);
  		if ("endDate" in $$props) $$invalidate(18, endDate = $$props.endDate);
  		if ("id_dtp" in $$props) $$invalidate(19, id_dtp = $$props.id_dtp);
  		if ("dateInterval" in $$props) dateInterval = $$props.dateInterval;
  		if ("optData" in $$props) $$invalidate(67, optData = $$props.optData);
  		if ("optCollisionKeys" in $$props) $$invalidate(68, optCollisionKeys = $$props.optCollisionKeys);
  		if ("optDataSkpdi" in $$props) $$invalidate(69, optDataSkpdi = $$props.optDataSkpdi);
  		if ("optCollisionSkpdiKeys" in $$props) $$invalidate(70, optCollisionSkpdiKeys = $$props.optCollisionSkpdiKeys);
  		if ("optDataGibdd" in $$props) $$invalidate(71, optDataGibdd = $$props.optDataGibdd);
  		if ("optCollisionGibddKeys" in $$props) $$invalidate(72, optCollisionGibddKeys = $$props.optCollisionGibddKeys);
  		if ("optDataGibddSpt" in $$props) $$invalidate(73, optDataGibddSpt = $$props.optDataGibddSpt);
  		if ("optCollisionGibddSptKeys" in $$props) $$invalidate(74, optCollisionGibddSptKeys = $$props.optCollisionGibddSptKeys);
  		if ("optDataGibddLo" in $$props) $$invalidate(75, optDataGibddLo = $$props.optDataGibddLo);
  		if ("optCollisionGibddLoKeys" in $$props) $$invalidate(76, optCollisionGibddLoKeys = $$props.optCollisionGibddLoKeys);
  		if ("optDataHearthsLo" in $$props) $$invalidate(77, optDataHearthsLo = $$props.optDataHearthsLo);
  		if ("optRoadTypesLo" in $$props) $$invalidate(78, optRoadTypesLo = $$props.optRoadTypesLo);
  		if ("dps" in $$props) $$invalidate(20, dps = $$props.dps);
  		if ("evnt" in $$props) $$invalidate(21, evnt = $$props.evnt);
  		if ("optDataGibddRub" in $$props) $$invalidate(79, optDataGibddRub = $$props.optDataGibddRub);
  		if ("optCollisionGibddRubKeys" in $$props) $$invalidate(80, optCollisionGibddRubKeys = $$props.optCollisionGibddRubKeys);
  		if ("optDataHearths" in $$props) $$invalidate(81, optDataHearths = $$props.optDataHearths);
  		if ("optTypeHearthsKeys" in $$props) $$invalidate(82, optTypeHearthsKeys = $$props.optTypeHearthsKeys);
  		if ("optDataHearthsTmp" in $$props) $$invalidate(83, optDataHearthsTmp = $$props.optDataHearthsTmp);
  		if ("optTypeHearthsTmpKeys" in $$props) $$invalidate(84, optTypeHearthsTmpKeys = $$props.optTypeHearthsTmpKeys);
  		if ("optDataHearthsStat" in $$props) $$invalidate(85, optDataHearthsStat = $$props.optDataHearthsStat);
  		if ("optTypeHearthsStatKeys" in $$props) $$invalidate(86, optTypeHearthsStatKeys = $$props.optTypeHearthsStatKeys);
  		if ("optDataHearths3" in $$props) $$invalidate(87, optDataHearths3 = $$props.optDataHearths3);
  		if ("optTypeHearths3Keys" in $$props) $$invalidate(88, optTypeHearths3Keys = $$props.optTypeHearths3Keys);
  		if ("optDataHearths5" in $$props) $$invalidate(89, optDataHearths5 = $$props.optDataHearths5);
  		if ("optTypeHearths5Keys" in $$props) $$invalidate(90, optTypeHearths5Keys = $$props.optTypeHearths5Keys);
  		if ("optDataHearthsSettlements" in $$props) $$invalidate(91, optDataHearthsSettlements = $$props.optDataHearthsSettlements);
  		if ("optRoadTypes5" in $$props) $$invalidate(92, optRoadTypes5 = $$props.optRoadTypes5);
  		if ("optDataHearthsPicket" in $$props) $$invalidate(93, optDataHearthsPicket = $$props.optDataHearthsPicket);
  		if ("optRoadTypes" in $$props) $$invalidate(94, optRoadTypes = $$props.optRoadTypes);
  		if ("optDataHearthsPicket4" in $$props) $$invalidate(95, optDataHearthsPicket4 = $$props.optDataHearthsPicket4);
  		if ("optRoadTypes4" in $$props) $$invalidate(96, optRoadTypes4 = $$props.optRoadTypes4);
  		if ("optMeasures" in $$props) $$invalidate(97, optMeasures = $$props.optMeasures);
  		if ("optMeasuresKeys" in $$props) $$invalidate(98, optMeasuresKeys = $$props.optMeasuresKeys);
  		if ("roads" in $$props) $$invalidate(22, roads = $$props.roads);
  		if ("ht" in $$props) $$invalidate(23, ht = $$props.ht);
  		if ("id_hearth" in $$props) $$invalidate(24, id_hearth = $$props.id_hearth);
  		if ("collision_type" in $$props) $$invalidate(25, collision_type = $$props.collision_type);
  		if ("collision_type_skpdi" in $$props) $$invalidate(26, collision_type_skpdi = $$props.collision_type_skpdi);
  		if ("collision_type_gibdd" in $$props) $$invalidate(27, collision_type_gibdd = $$props.collision_type_gibdd);
  		if ("collision_type_gibddRub" in $$props) $$invalidate(28, collision_type_gibddRub = $$props.collision_type_gibddRub);
  		if ("beg" in $$props) beg = $$props.beg;
  		if ("end" in $$props) end = $$props.end;
  		if ("heat" in $$props) $$invalidate(99, heat = $$props.heat);
  		if ("heatName" in $$props) heatName = $$props.heatName;
  		if ("radius" in $$props) $$invalidate(29, radius = $$props.radius);
  		if ("blur" in $$props) $$invalidate(30, blur = $$props.blur);
  		if ("minOpacity" in $$props) $$invalidate(31, minOpacity = $$props.minOpacity);
  		if ("heatElement" in $$props) $$invalidate(32, heatElement = $$props.heatElement);
  		if ("heatElementDtpGibddLo" in $$props) heatElementDtpGibddLo = $$props.heatElementDtpGibddLo;
  		if ("heatElementDtpGibddSpt" in $$props) heatElementDtpGibddSpt = $$props.heatElementDtpGibddSpt;
  		if ("heatElementDtpGibdd" in $$props) heatElementDtpGibdd = $$props.heatElementDtpGibdd;
  		if ("heatElementDtpSkpdi" in $$props) heatElementDtpSkpdi = $$props.heatElementDtpSkpdi;
  		if ("heatElementDtpVerifyed" in $$props) heatElementDtpVerifyed = $$props.heatElementDtpVerifyed;
  		if ("isHeatChecked" in $$props) $$invalidate(100, isHeatChecked = $$props.isHeatChecked);
  		if ("_comps" in $$props) _comps = $$props._comps;
  		if ("compOn" in $$props) $$invalidate(33, compOn = $$props.compOn);
  		if ("comp1On" in $$props) $$invalidate(34, comp1On = $$props.comp1On);
  		if ("measures_type" in $$props) $$invalidate(35, measures_type = $$props.measures_type);
  		if ("hearths_year_Settlements" in $$props) $$invalidate(36, hearths_year_Settlements = $$props.hearths_year_Settlements);
  		if ("city" in $$props) $$invalidate(37, city = $$props.city);
  		if ("hearths_year_Lo" in $$props) $$invalidate(38, hearths_year_Lo = $$props.hearths_year_Lo);
  		if ("hearths_year_Picket" in $$props) $$invalidate(39, hearths_year_Picket = $$props.hearths_year_Picket);
  		if ("hearths_stricken4" in $$props) $$invalidate(40, hearths_stricken4 = $$props.hearths_stricken4);
  		if ("hearths_year_Picket4" in $$props) $$invalidate(41, hearths_year_Picket4 = $$props.hearths_year_Picket4);
  		if ("_list_rub" in $$props) _list_rub = $$props._list_rub;
  		if ("list_rubOn" in $$props) $$invalidate(42, list_rubOn = $$props.list_rubOn);
  		if ("list_rubOff" in $$props) $$invalidate(43, list_rubOff = $$props.list_rubOff);
  		if ("hearths_stricken5" in $$props) $$invalidate(44, hearths_stricken5 = $$props.hearths_stricken5);
  		if ("str_icon_type5" in $$props) $$invalidate(45, str_icon_type5 = $$props.str_icon_type5);
  		if ("hearths_period_type_5" in $$props) $$invalidate(46, hearths_period_type_5 = $$props.hearths_period_type_5);
  		if ("hearths_year_5" in $$props) $$invalidate(47, hearths_year_5 = $$props.hearths_year_5);
  		if ("hearths_quarter_5" in $$props) hearths_quarter_5 = $$props.hearths_quarter_5;
  		if ("last_quarter_5" in $$props) last_quarter_5 = $$props.last_quarter_5;
  		if ("hearths_stricken3" in $$props) $$invalidate(48, hearths_stricken3 = $$props.hearths_stricken3);
  		if ("str_icon_type3" in $$props) $$invalidate(49, str_icon_type3 = $$props.str_icon_type3);
  		if ("hearths_period_type_3" in $$props) $$invalidate(50, hearths_period_type_3 = $$props.hearths_period_type_3);
  		if ("hearths_year_3" in $$props) $$invalidate(51, hearths_year_3 = $$props.hearths_year_3);
  		if ("hearths_quarter_3" in $$props) hearths_quarter_3 = $$props.hearths_quarter_3;
  		if ("last_quarter_3" in $$props) last_quarter_3 = $$props.last_quarter_3;
  		if ("hearths_strickenStat" in $$props) $$invalidate(52, hearths_strickenStat = $$props.hearths_strickenStat);
  		if ("str_icon_typeStat" in $$props) $$invalidate(53, str_icon_typeStat = $$props.str_icon_typeStat);
  		if ("hearths_period_type_Stat" in $$props) $$invalidate(54, hearths_period_type_Stat = $$props.hearths_period_type_Stat);
  		if ("hearths_year_Stat" in $$props) $$invalidate(55, hearths_year_Stat = $$props.hearths_year_Stat);
  		if ("hearths_quarter_Stat" in $$props) $$invalidate(56, hearths_quarter_Stat = $$props.hearths_quarter_Stat);
  		if ("last_quarter_Stat" in $$props) last_quarter_Stat = $$props.last_quarter_Stat;
  		if ("hearths_strickenTmp" in $$props) $$invalidate(57, hearths_strickenTmp = $$props.hearths_strickenTmp);
  		if ("str_icon_typeTmp" in $$props) $$invalidate(58, str_icon_typeTmp = $$props.str_icon_typeTmp);
  		if ("hearths_period_type_tmp" in $$props) $$invalidate(59, hearths_period_type_tmp = $$props.hearths_period_type_tmp);
  		if ("hearths_year_tmp" in $$props) $$invalidate(60, hearths_year_tmp = $$props.hearths_year_tmp);
  		if ("hearths_quarter_tmp" in $$props) $$invalidate(61, hearths_quarter_tmp = $$props.hearths_quarter_tmp);
  		if ("last_quarter_tmp" in $$props) last_quarter_tmp = $$props.last_quarter_tmp;
  		if ("hearths_stricken" in $$props) $$invalidate(62, hearths_stricken = $$props.hearths_stricken);
  		if ("str_icon_type" in $$props) $$invalidate(63, str_icon_type = $$props.str_icon_type);
  		if ("hearths_period_type" in $$props) $$invalidate(64, hearths_period_type = $$props.hearths_period_type);
  		if ("hearths_year" in $$props) $$invalidate(65, hearths_year = $$props.hearths_year);
  		if ("hearths_quarter" in $$props) $$invalidate(66, hearths_quarter = $$props.hearths_quarter);
  		if ("last_quarter" in $$props) last_quarter = $$props.last_quarter;
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [
  		DtpHearthsPicket4,
  		DtpHearthsSettlements,
  		DtpHearthsPicket,
  		DtpHearths5,
  		DtpHearths3,
  		DtpVerifyed,
  		DtpSkpdi,
  		DtpGibdd,
  		DtpGibddRub,
  		DtpGibddSpt,
  		DtpGibddLo,
  		DtpHearthsLo,
  		Rub,
  		Measures,
  		DtpHearthsStat,
  		DtpHearthsTmp,
  		DtpHearths,
  		begDate,
  		endDate,
  		id_dtp,
  		dps,
  		evnt,
  		roads,
  		ht,
  		id_hearth,
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
  		measures_type,
  		hearths_year_Settlements,
  		city,
  		hearths_year_Lo,
  		hearths_year_Picket,
  		hearths_stricken4,
  		hearths_year_Picket4,
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
  		optDataGibddSpt,
  		optCollisionGibddSptKeys,
  		optDataGibddLo,
  		optCollisionGibddLoKeys,
  		optDataHearthsLo,
  		optRoadTypesLo,
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
  		optDataHearthsSettlements,
  		optRoadTypes5,
  		optDataHearthsPicket,
  		optRoadTypes,
  		optDataHearthsPicket4,
  		optRoadTypes4,
  		optMeasures,
  		optMeasuresKeys,
  		heat,
  		isHeatChecked,
  		setFilterMeasures,
  		setComp,
  		setFilterHearthsSettlements,
  		setFilterHearthsLo,
  		setFilterHearthsPicket,
  		setFilterHearthsPicket4,
  		oncheckIdCity,
  		oncheckIdDtp,
  		oncheckIdHearth,
  		oncheckHt,
  		oncheckDps,
  		oncheckEvents,
  		setHeat,
  		setMinOpacity,
  		setFilter,
  		setFilterGibddRub,
  		setFilterGibdd,
  		setFilterGibddLo,
  		setFilterGibddSpt,
  		setFilterSkpdi,
  		oncheck,
  		onPrev,
  		onNext,
  		setFilterHearths5,
  		setFilterHearths3,
  		setFilterHearthsStat,
  		setFilterHearthsTmp,
  		setFilterHearths,
  		control,
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
  		heatElementDtpGibddLo,
  		heatElementDtpGibddSpt,
  		heatElementDtpGibdd,
  		heatElementDtpSkpdi,
  		heatElementDtpVerifyed,
  		_comps,
  		refresh,
  		_list_rub,
  		func,
  		select_change_handler,
  		input2_change_handler,
  		$$binding_groups,
  		func_1,
  		select0_change_handler,
  		select1_change_handler,
  		func_2,
  		select_change_handler_1,
  		func_3,
  		select_change_handler_2,
  		input1_change_handler,
  		func_4,
  		select0_change_handler_1,
  		select1_change_handler_1,
  		input1_change_handler_1,
  		func_5,
  		select0_change_handler_2,
  		select1_change_handler_2,
  		input1_change_handler_2,
  		input2_change_handler_1,
  		func_6,
  		select0_change_handler_3,
  		select1_change_handler_3,
  		input1_change_handler_3,
  		input2_change_handler_2,
  		func_7,
  		select0_change_handler_4,
  		select1_change_handler_4,
  		input1_change_handler_4,
  		input2_change_handler_3,
  		func_8,
  		select0_change_handler_5,
  		select1_change_handler_5,
  		input0_binding,
  		input1_binding,
  		input0_change_input_handler,
  		input1_change_input_handler,
  		input2_change_input_handler,
  		input3_binding,
  		func_9,
  		select_change_handler_3,
  		func_10,
  		select_change_handler_4,
  		func_11,
  		select_change_handler_5,
  		func_12,
  		select_change_handler_6,
  		func_13,
  		select_change_handler_7,
  		func_14,
  		select_change_handler_8,
  		input1_change_handler_5,
  		input2_change_handler_4,
  		func_15,
  		select_change_handler_9,
  		input0_change_handler,
  		input1_change_handler_6
  	];
  }

  class DtpVerifyedFilters extends SvelteComponentDev {
  	constructor(options) {
  		super(options);

  		init(
  			this,
  			options,
  			instance$6,
  			create_fragment$6,
  			safe_not_equal,
  			{
  				DtpHearthsPicket4: 0,
  				DtpHearthsSettlements: 1,
  				DtpHearthsPicket: 2,
  				DtpHearths5: 3,
  				DtpHearths3: 4,
  				DtpHearthsStat: 14,
  				DtpHearthsTmp: 15,
  				DtpHearths: 16,
  				DtpVerifyed: 5,
  				DtpSkpdi: 6,
  				DtpGibdd: 7,
  				DtpGibddRub: 8,
  				DtpGibddSpt: 9,
  				DtpGibddLo: 10,
  				DtpHearthsLo: 11,
  				Rub: 12,
  				Measures: 13,
  				control: 129
  			},
  			[-1, -1, -1, -1, -1, -1, -1, -1, -1]
  		);

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpVerifyedFilters",
  			options,
  			id: create_fragment$6.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*DtpHearthsPicket4*/ ctx[0] === undefined && !("DtpHearthsPicket4" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsPicket4'");
  		}

  		if (/*DtpHearthsSettlements*/ ctx[1] === undefined && !("DtpHearthsSettlements" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsSettlements'");
  		}

  		if (/*DtpHearthsPicket*/ ctx[2] === undefined && !("DtpHearthsPicket" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsPicket'");
  		}

  		if (/*DtpHearths5*/ ctx[3] === undefined && !("DtpHearths5" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearths5'");
  		}

  		if (/*DtpHearths3*/ ctx[4] === undefined && !("DtpHearths3" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearths3'");
  		}

  		if (/*DtpHearthsStat*/ ctx[14] === undefined && !("DtpHearthsStat" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsStat'");
  		}

  		if (/*DtpHearthsTmp*/ ctx[15] === undefined && !("DtpHearthsTmp" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsTmp'");
  		}

  		if (/*DtpHearths*/ ctx[16] === undefined && !("DtpHearths" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearths'");
  		}

  		if (/*DtpVerifyed*/ ctx[5] === undefined && !("DtpVerifyed" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpVerifyed'");
  		}

  		if (/*DtpSkpdi*/ ctx[6] === undefined && !("DtpSkpdi" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpSkpdi'");
  		}

  		if (/*DtpGibdd*/ ctx[7] === undefined && !("DtpGibdd" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpGibdd'");
  		}

  		if (/*DtpGibddRub*/ ctx[8] === undefined && !("DtpGibddRub" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpGibddRub'");
  		}

  		if (/*DtpGibddSpt*/ ctx[9] === undefined && !("DtpGibddSpt" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpGibddSpt'");
  		}

  		if (/*DtpGibddLo*/ ctx[10] === undefined && !("DtpGibddLo" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpGibddLo'");
  		}

  		if (/*DtpHearthsLo*/ ctx[11] === undefined && !("DtpHearthsLo" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsLo'");
  		}

  		if (/*Rub*/ ctx[12] === undefined && !("Rub" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'Rub'");
  		}

  		if (/*Measures*/ ctx[13] === undefined && !("Measures" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'Measures'");
  		}

  		if (/*control*/ ctx[129] === undefined && !("control" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'control'");
  		}
  	}

  	get DtpHearthsPicket4() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpHearthsPicket4(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpHearthsSettlements() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpHearthsSettlements(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

  	get DtpGibddSpt() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpGibddSpt(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpGibddLo() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpGibddLo(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get DtpHearthsLo() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpHearthsLo(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get Rub() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set Rub(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get Measures() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set Measures(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get control() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set control(value) {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  /* src\DtpPopupHearths.svelte generated by Svelte v3.20.1 */

  const { console: console_1$4 } = globals;
  const file$7 = "src\\DtpPopupHearths.svelte";

  function get_each_context$5(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[14] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[14] = list[i];
  	return child_ctx;
  }

  function get_each_context_2$3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[14] = list[i];
  	child_ctx[20] = i;
  	return child_ctx;
  }

  // (49:4) {#if prp.piketaj_start_km}
  function create_if_block_4$2(ctx) {
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
  			add_location(td0, file$7, 50, 5, 1366);
  			add_location(b0, file$7, 51, 13, 1411);
  			add_location(b1, file$7, 51, 56, 1454);
  			add_location(td1, file$7, 51, 5, 1403);
  			add_location(tr, file$7, 49, 3, 1356);
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
  		id: create_if_block_4$2.name,
  		type: "if",
  		source: "(49:4) {#if prp.piketaj_start_km}",
  		ctx
  	});

  	return block;
  }

  // (55:4) {#if prp.str_icon_type}
  function create_if_block_3$2(ctx) {
  	let tr;
  	let td0;
  	let t1;
  	let td1;
  	let t2_value = (/*prp*/ ctx[0].str_icon_type || "") + "";
  	let t2;

  	const block = {
  		c: function create() {
  			tr = element("tr");
  			td0 = element("td");
  			td0.textContent = "Тип ДТП:";
  			t1 = space();
  			td1 = element("td");
  			t2 = text(t2_value);
  			attr_dev(td0, "class", "first svelte-mnr9l0");
  			add_location(td0, file$7, 56, 5, 1559);
  			add_location(td1, file$7, 57, 5, 1596);
  			add_location(tr, file$7, 55, 3, 1549);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, tr, anchor);
  			append_dev(tr, td0);
  			append_dev(tr, t1);
  			append_dev(tr, td1);
  			append_dev(td1, t2);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && t2_value !== (t2_value = (/*prp*/ ctx[0].str_icon_type || "") + "")) set_data_dev(t2, t2_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(tr);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_3$2.name,
  		type: "if",
  		source: "(55:4) {#if prp.str_icon_type}",
  		ctx
  	});

  	return block;
  }

  // (86:4) {#if current === index}
  function create_if_block_2$2(ctx) {
  	let div;
  	let current;

  	const dtppopup = new DtpPopupVerifyed({
  			props: {
  				prp: /*pt1*/ ctx[14],
  				closeMe: /*func*/ ctx[12]
  			},
  			$$inline: true
  		});

  	const block = {
  		c: function create() {
  			div = element("div");
  			create_component(dtppopup.$$.fragment);
  			attr_dev(div, "class", "win leaflet-popup-content-wrapper  svelte-mnr9l0");
  			add_location(div, file$7, 86, 4, 2471);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div, anchor);
  			mount_component(dtppopup, div, null);
  			current = true;
  		},
  		p: function update(ctx, dirty) {
  			const dtppopup_changes = {};
  			if (dirty & /*prp*/ 1) dtppopup_changes.prp = /*pt1*/ ctx[14];
  			if (dirty & /*current*/ 4) dtppopup_changes.closeMe = /*func*/ ctx[12];
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
  		id: create_if_block_2$2.name,
  		type: "if",
  		source: "(86:4) {#if current === index}",
  		ctx
  	});

  	return block;
  }

  // (73:4) {#each prp.list_dtp as pt1, index}
  function create_each_block_2$3(ctx) {
  	let tr0;
  	let td0;
  	let ul;
  	let li0;
  	let t0;
  	let t1_value = Math.floor(/*pt1*/ ctx[14].piketaj_m / 1000) + "";
  	let t1;
  	let t2;
  	let t3_value = /*pt1*/ ctx[14].piketaj_m % 1000 + "";
  	let t3;
  	let t4;
  	let t5;
  	let li1;
  	let t6_value = new Date(1000 * /*pt1*/ ctx[14].date).toLocaleDateString() + "";
  	let t6;
  	let t7;
  	let t8_value = /*pt1*/ ctx[14].lost + "";
  	let t8;
  	let t9;
  	let t10_value = /*pt1*/ ctx[14].stricken + "";
  	let t10;
  	let li1_title_value;
  	let t11;
  	let tr1;
  	let td1;
  	let t13;
  	let td2;
  	let t14_value = /*pt1*/ ctx[14].address + "";
  	let t14;
  	let br;
  	let span;
  	let t16;
  	let current;
  	let dispose;

  	function click_handler(...args) {
  		return /*click_handler*/ ctx[10](/*index*/ ctx[20], ...args);
  	}

  	function click_handler_1(...args) {
  		return /*click_handler_1*/ ctx[11](/*index*/ ctx[20], ...args);
  	}

  	let if_block = /*current*/ ctx[2] === /*index*/ ctx[20] && create_if_block_2$2(ctx);

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
  			attr_dev(li0, "class", "svelte-mnr9l0");
  			add_location(li0, file$7, 76, 5, 2012);
  			attr_dev(li1, "title", li1_title_value = "id: " + /*pt1*/ ctx[14].id);
  			attr_dev(li1, "class", "svelte-mnr9l0");
  			add_location(li1, file$7, 77, 5, 2100);
  			add_location(ul, file$7, 75, 4, 2002);
  			attr_dev(td0, "class", "first svelte-mnr9l0");
  			attr_dev(td0, "colspan", "2");
  			add_location(td0, file$7, 74, 5, 1969);
  			add_location(tr0, file$7, 73, 3, 1959);
  			attr_dev(td1, "class", "first svelte-mnr9l0");
  			add_location(td1, file$7, 83, 5, 2309);
  			add_location(br, file$7, 84, 22, 2361);
  			attr_dev(span, "class", "link svelte-mnr9l0");
  			add_location(span, file$7, 84, 28, 2367);
  			add_location(td2, file$7, 84, 5, 2344);
  			add_location(tr1, file$7, 82, 3, 2299);
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
  			current = true;
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(li1, "click", click_handler, false, false, false),
  				listen_dev(span, "click", click_handler_1, false, false, false)
  			];
  		},
  		p: function update(new_ctx, dirty) {
  			ctx = new_ctx;
  			if ((!current || dirty & /*prp*/ 1) && t1_value !== (t1_value = Math.floor(/*pt1*/ ctx[14].piketaj_m / 1000) + "")) set_data_dev(t1, t1_value);
  			if ((!current || dirty & /*prp*/ 1) && t3_value !== (t3_value = /*pt1*/ ctx[14].piketaj_m % 1000 + "")) set_data_dev(t3, t3_value);
  			if ((!current || dirty & /*prp*/ 1) && t6_value !== (t6_value = new Date(1000 * /*pt1*/ ctx[14].date).toLocaleDateString() + "")) set_data_dev(t6, t6_value);
  			if ((!current || dirty & /*prp*/ 1) && t8_value !== (t8_value = /*pt1*/ ctx[14].lost + "")) set_data_dev(t8, t8_value);
  			if ((!current || dirty & /*prp*/ 1) && t10_value !== (t10_value = /*pt1*/ ctx[14].stricken + "")) set_data_dev(t10, t10_value);

  			if (!current || dirty & /*prp*/ 1 && li1_title_value !== (li1_title_value = "id: " + /*pt1*/ ctx[14].id)) {
  				attr_dev(li1, "title", li1_title_value);
  			}

  			if ((!current || dirty & /*prp*/ 1) && t14_value !== (t14_value = /*pt1*/ ctx[14].address + "")) set_data_dev(t14, t14_value);

  			if (/*current*/ ctx[2] === /*index*/ ctx[20]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  					transition_in(if_block, 1);
  				} else {
  					if_block = create_if_block_2$2(ctx);
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
  		id: create_each_block_2$3.name,
  		type: "each",
  		source: "(73:4) {#each prp.list_dtp as pt1, index}",
  		ctx
  	});

  	return block;
  }

  // (104:3) {#if event_h}
  function create_if_block_1$3(ctx) {
  	let div1;
  	let div0;
  	let t1;
  	let ol;
  	let each_value_1 = /*event_h*/ ctx[7];
  	validate_each_argument(each_value_1);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
  	}

  	const block = {
  		c: function create() {
  			div1 = element("div");
  			div0 = element("div");
  			div0.textContent = "Привязанные мероприятия";
  			t1 = space();
  			ol = element("ol");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr_dev(div0, "class", "title");
  			add_location(div0, file$7, 105, 4, 2913);
  			attr_dev(ol, "start", "1");
  			add_location(ol, file$7, 106, 4, 2966);
  			attr_dev(div1, "class", "event_h");
  			add_location(div1, file$7, 104, 3, 2887);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div1, anchor);
  			append_dev(div1, div0);
  			append_dev(div1, t1);
  			append_dev(div1, ol);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ol, null);
  			}
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*event_h, showEvn*/ 160) {
  				each_value_1 = /*event_h*/ ctx[7];
  				validate_each_argument(each_value_1);
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_1$3(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ol, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_1.length;
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div1);
  			destroy_each(each_blocks, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_1$3.name,
  		type: "if",
  		source: "(104:3) {#if event_h}",
  		ctx
  	});

  	return block;
  }

  // (108:4) {#each event_h as pt1}
  function create_each_block_1$3(ctx) {
  	let li;
  	let t;
  	let li_data_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text("Мероприятие");
  			attr_dev(li, "class", "link svelte-mnr9l0");
  			attr_dev(li, "data", li_data_value = /*pt1*/ ctx[14].id_event);
  			add_location(li, file$7, 108, 5, 3013);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  			if (remount) dispose();
  			dispose = listen_dev(li, "click", /*showEvn*/ ctx[5], false, false, false);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_1$3.name,
  		type: "each",
  		source: "(108:4) {#each event_h as pt1}",
  		ctx
  	});

  	return block;
  }

  // (114:3) {#if event_lo}
  function create_if_block$4(ctx) {
  	let div1;
  	let div0;
  	let t1;
  	let ol;
  	let each_value = /*event_lo*/ ctx[8];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
  	}

  	const block = {
  		c: function create() {
  			div1 = element("div");
  			div0 = element("div");
  			div0.textContent = "Мероприятия в районе очага";
  			t1 = space();
  			ol = element("ol");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr_dev(div0, "class", "title");
  			add_location(div0, file$7, 115, 4, 3175);
  			attr_dev(ol, "start", "1");
  			add_location(ol, file$7, 116, 4, 3231);
  			attr_dev(div1, "class", "event_lo");
  			add_location(div1, file$7, 114, 3, 3148);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div1, anchor);
  			append_dev(div1, div0);
  			append_dev(div1, t1);
  			append_dev(div1, ol);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ol, null);
  			}
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*event_lo, showEvn*/ 288) {
  				each_value = /*event_lo*/ ctx[8];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$5(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$5(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ol, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div1);
  			destroy_each(each_blocks, detaching);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block$4.name,
  		type: "if",
  		source: "(114:3) {#if event_lo}",
  		ctx
  	});

  	return block;
  }

  // (118:4) {#each event_lo as pt1}
  function create_each_block$5(ctx) {
  	let li;
  	let t;
  	let li_data_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text("Мероприятие");
  			attr_dev(li, "class", "link svelte-mnr9l0");
  			attr_dev(li, "data", li_data_value = /*pt1*/ ctx[14].id_event);
  			add_location(li, file$7, 118, 5, 3279);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  			if (remount) dispose();
  			dispose = listen_dev(li, "click", /*showEvn*/ ctx[5], false, false, false);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$5.name,
  		type: "each",
  		source: "(118:4) {#each event_lo as pt1}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$7(ctx) {
  	let div5;
  	let div0;
  	let t0_value = (/*predochag*/ ctx[1] ? "Предочаг" : "Очаг") + "";
  	let t0;
  	let t1;
  	let t2_value = (/*prp*/ ctx[0].id || /*prp*/ ctx[0].id_hearth) + "";
  	let t2;
  	let t3;
  	let t4;
  	let t5;
  	let div1;

  	let t6_value = (/*prp*/ ctx[0].quarter
  	? /*prp*/ ctx[0].quarter + " кв."
  	: "") + "";

  	let t6;
  	let t7;
  	let t8_value = /*prp*/ ctx[0].year + "";
  	let t8;
  	let t9;
  	let t10;
  	let div3;
  	let table;
  	let tbody;
  	let t11;
  	let t12;
  	let tr0;
  	let td0;
  	let t14;
  	let td1;
  	let t15_value = /*prp*/ ctx[0].list_dtp.length + "";
  	let t15;
  	let t16;
  	let tr1;
  	let td2;
  	let t18;
  	let td3;
  	let t19_value = /*prp*/ ctx[0].count_lost + "";
  	let t19;
  	let t20;
  	let tr2;
  	let td4;
  	let t22;
  	let td5;
  	let t23_value = /*prp*/ ctx[0].count_stricken + "";
  	let t23;
  	let t24;
  	let t25;
  	let tr3;
  	let td6;
  	let div2;
  	let t26;
  	let div4;
  	let t27;
  	let current;
  	let if_block0 = /*prp*/ ctx[0].piketaj_start_km && create_if_block_4$2(ctx);
  	let if_block1 = /*prp*/ ctx[0].str_icon_type && create_if_block_3$2(ctx);
  	let each_value_2 = /*prp*/ ctx[0].list_dtp;
  	validate_each_argument(each_value_2);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_2.length; i += 1) {
  		each_blocks[i] = create_each_block_2$3(get_each_context_2$3(ctx, each_value_2, i));
  	}

  	const out = i => transition_out(each_blocks[i], 1, 1, () => {
  		each_blocks[i] = null;
  	});

  	let if_block2 = /*event_h*/ ctx[7] && create_if_block_1$3(ctx);
  	let if_block3 = /*event_lo*/ ctx[8] && create_if_block$4(ctx);

  	const block = {
  		c: function create() {
  			div5 = element("div");
  			div0 = element("div");
  			t0 = text(t0_value);
  			t1 = text(" ДТП (id: ");
  			t2 = text(t2_value);
  			t3 = text(")");
  			t4 = text(/*city*/ ctx[6]);
  			t5 = space();
  			div1 = element("div");
  			t6 = text(t6_value);
  			t7 = space();
  			t8 = text(t8_value);
  			t9 = text("г.");
  			t10 = space();
  			div3 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			if (if_block0) if_block0.c();
  			t11 = space();
  			if (if_block1) if_block1.c();
  			t12 = space();
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Всего ДТП:";
  			t14 = space();
  			td1 = element("td");
  			t15 = text(t15_value);
  			t16 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Погибших:";
  			t18 = space();
  			td3 = element("td");
  			t19 = text(t19_value);
  			t20 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Раненых:";
  			t22 = space();
  			td5 = element("td");
  			t23 = text(t23_value);
  			t24 = space();

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t25 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			div2 = element("div");
  			t26 = space();
  			div4 = element("div");
  			if (if_block2) if_block2.c();
  			t27 = space();
  			if (if_block3) if_block3.c();
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$7, 43, 2, 1075);
  			attr_dev(div1, "class", "pLine");
  			add_location(div1, file$7, 44, 2, 1178);
  			attr_dev(td0, "class", "first svelte-mnr9l0");
  			add_location(td0, file$7, 61, 5, 1663);
  			add_location(td1, file$7, 62, 5, 1702);
  			add_location(tr0, file$7, 60, 3, 1653);
  			attr_dev(td2, "class", "first svelte-mnr9l0");
  			add_location(td2, file$7, 65, 5, 1755);
  			add_location(td3, file$7, 66, 5, 1793);
  			add_location(tr1, file$7, 64, 3, 1745);
  			attr_dev(td4, "class", "first svelte-mnr9l0");
  			add_location(td4, file$7, 69, 5, 1841);
  			add_location(td5, file$7, 70, 5, 1878);
  			add_location(tr2, file$7, 68, 3, 1831);
  			attr_dev(div2, "class", "win leaflet-popup-content-wrapper hidden svelte-mnr9l0");
  			add_location(div2, file$7, 96, 2, 2698);
  			attr_dev(td6, "class", "first svelte-mnr9l0");
  			attr_dev(td6, "colspan", "2");
  			add_location(td6, file$7, 95, 14, 2667);
  			add_location(tr3, file$7, 94, 12, 2648);
  			add_location(tbody, file$7, 47, 3, 1314);
  			attr_dev(table, "class", "table svelte-mnr9l0");
  			add_location(table, file$7, 46, 4, 1289);
  			attr_dev(div3, "class", "featureCont");
  			add_location(div3, file$7, 45, 2, 1259);
  			attr_dev(div4, "class", "events");
  			add_location(div4, file$7, 102, 2, 2846);
  			attr_dev(div5, "class", "mvsPopup svelte-mnr9l0");
  			add_location(div5, file$7, 42, 1, 1050);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div5, anchor);
  			append_dev(div5, div0);
  			append_dev(div0, t0);
  			append_dev(div0, t1);
  			append_dev(div0, t2);
  			append_dev(div0, t3);
  			append_dev(div0, t4);
  			append_dev(div5, t5);
  			append_dev(div5, div1);
  			append_dev(div1, t6);
  			append_dev(div1, t7);
  			append_dev(div1, t8);
  			append_dev(div1, t9);
  			append_dev(div5, t10);
  			append_dev(div5, div3);
  			append_dev(div3, table);
  			append_dev(table, tbody);
  			if (if_block0) if_block0.m(tbody, null);
  			append_dev(tbody, t11);
  			if (if_block1) if_block1.m(tbody, null);
  			append_dev(tbody, t12);
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t14);
  			append_dev(tr0, td1);
  			append_dev(td1, t15);
  			append_dev(tbody, t16);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t18);
  			append_dev(tr1, td3);
  			append_dev(td3, t19);
  			append_dev(tbody, t20);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t22);
  			append_dev(tr2, td5);
  			append_dev(td5, t23);
  			append_dev(tbody, t24);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(tbody, null);
  			}

  			append_dev(tbody, t25);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(td6, div2);
  			/*div2_binding*/ ctx[13](div2);
  			append_dev(div5, t26);
  			append_dev(div5, div4);
  			if (if_block2) if_block2.m(div4, null);
  			append_dev(div4, t27);
  			if (if_block3) if_block3.m(div4, null);
  			current = true;
  		},
  		p: function update(ctx, [dirty]) {
  			if ((!current || dirty & /*predochag*/ 2) && t0_value !== (t0_value = (/*predochag*/ ctx[1] ? "Предочаг" : "Очаг") + "")) set_data_dev(t0, t0_value);
  			if ((!current || dirty & /*prp*/ 1) && t2_value !== (t2_value = (/*prp*/ ctx[0].id || /*prp*/ ctx[0].id_hearth) + "")) set_data_dev(t2, t2_value);

  			if ((!current || dirty & /*prp*/ 1) && t6_value !== (t6_value = (/*prp*/ ctx[0].quarter
  			? /*prp*/ ctx[0].quarter + " кв."
  			: "") + "")) set_data_dev(t6, t6_value);

  			if ((!current || dirty & /*prp*/ 1) && t8_value !== (t8_value = /*prp*/ ctx[0].year + "")) set_data_dev(t8, t8_value);

  			if (/*prp*/ ctx[0].piketaj_start_km) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_4$2(ctx);
  					if_block0.c();
  					if_block0.m(tbody, t11);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*prp*/ ctx[0].str_icon_type) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_3$2(ctx);
  					if_block1.c();
  					if_block1.m(tbody, t12);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if ((!current || dirty & /*prp*/ 1) && t15_value !== (t15_value = /*prp*/ ctx[0].list_dtp.length + "")) set_data_dev(t15, t15_value);
  			if ((!current || dirty & /*prp*/ 1) && t19_value !== (t19_value = /*prp*/ ctx[0].count_lost + "")) set_data_dev(t19, t19_value);
  			if ((!current || dirty & /*prp*/ 1) && t23_value !== (t23_value = /*prp*/ ctx[0].count_stricken + "")) set_data_dev(t23, t23_value);

  			if (dirty & /*prp, current, moveTo, Date, Math*/ 21) {
  				each_value_2 = /*prp*/ ctx[0].list_dtp;
  				validate_each_argument(each_value_2);
  				let i;

  				for (i = 0; i < each_value_2.length; i += 1) {
  					const child_ctx = get_each_context_2$3(ctx, each_value_2, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block_2$3(child_ctx);
  						each_blocks[i].c();
  						transition_in(each_blocks[i], 1);
  						each_blocks[i].m(tbody, t25);
  					}
  				}

  				group_outros();

  				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
  					out(i);
  				}

  				check_outros();
  			}

  			if (/*event_h*/ ctx[7]) if_block2.p(ctx, dirty);
  			if (/*event_lo*/ ctx[8]) if_block3.p(ctx, dirty);
  		},
  		i: function intro(local) {
  			if (current) return;

  			for (let i = 0; i < each_value_2.length; i += 1) {
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
  			if (detaching) detach_dev(div5);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			destroy_each(each_blocks, detaching);
  			/*div2_binding*/ ctx[13](null);
  			if (if_block2) if_block2.d();
  			if (if_block3) if_block3.d();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$7.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$7($$self, $$props, $$invalidate) {
  	let { prp } = $$props;
  	let { predochag } = $$props;
  	let current;

  	const moveTo = nm => {
  		let obj = prp._bounds.options.items[nm];

  		if (obj && obj._map) {
  			obj._map.panTo(obj._latlng);
  		}
  	};

  	let evnCont;

  	const showEvn = ev => {
  		let id = ev.target.getAttribute("data");
  		$$invalidate(3, evnCont.innerHTML = "", evnCont);
  		let url = "https://dtp.mvs.group/scripts/events_dev/get_event_id_" + id + ".txt";

  		fetch(url, {}).then(req => req.json()).then(json => {
  			evnCont.classList.remove("hidden");
  			const app = new DtpPopupEvnt({ target: evnCont, props: { prp: json[0] } });
  		});
  	};

  	// console.log('prp ', prp);
  	const showDtpInfo = ev => {
  		console.log("showDtpInfo ", ev);
  	};

  	let city = "city" in prp ? " (city: " + prp.city + ")" : "";

  	let event_h = prp.event_h && prp.event_h.length > 1
  	? prp.event_h
  	: null;

  	let event_lo = prp.event_lo && prp.event_lo.length > 1
  	? prp.event_lo
  	: null;

  	const writable_props = ["prp", "predochag"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<DtpPopupHearths> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupHearths", $$slots, []);

  	const click_handler = index => {
  		moveTo(index);
  	};

  	const click_handler_1 = index => {
  		$$invalidate(2, current = index);
  	};

  	const func = () => {
  		$$invalidate(2, current = null);
  	};

  	function div2_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(3, evnCont = $$value);
  		});
  	}

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("predochag" in $$props) $$invalidate(1, predochag = $$props.predochag);
  	};

  	$$self.$capture_state = () => ({
  		DtpPopup: DtpPopupVerifyed,
  		DtpPopupEvnt,
  		prp,
  		predochag,
  		current,
  		moveTo,
  		evnCont,
  		showEvn,
  		showDtpInfo,
  		city,
  		event_h,
  		event_lo
  	});

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("predochag" in $$props) $$invalidate(1, predochag = $$props.predochag);
  		if ("current" in $$props) $$invalidate(2, current = $$props.current);
  		if ("evnCont" in $$props) $$invalidate(3, evnCont = $$props.evnCont);
  		if ("city" in $$props) $$invalidate(6, city = $$props.city);
  		if ("event_h" in $$props) $$invalidate(7, event_h = $$props.event_h);
  		if ("event_lo" in $$props) $$invalidate(8, event_lo = $$props.event_lo);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [
  		prp,
  		predochag,
  		current,
  		evnCont,
  		moveTo,
  		showEvn,
  		city,
  		event_h,
  		event_lo,
  		showDtpInfo,
  		click_handler,
  		click_handler_1,
  		func,
  		div2_binding
  	];
  }

  class DtpPopupHearths extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$7, create_fragment$7, safe_not_equal, { prp: 0, predochag: 1 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupHearths",
  			options,
  			id: create_fragment$7.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$4.warn("<DtpPopupHearths> was created without expected prop 'prp'");
  		}

  		if (/*predochag*/ ctx[1] === undefined && !("predochag" in props)) {
  			console_1$4.warn("<DtpPopupHearths> was created without expected prop 'predochag'");
  		}
  	}

  	get prp() {
  		throw new Error("<DtpPopupHearths>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupHearths>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get predochag() {
  		throw new Error("<DtpPopupHearths>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set predochag(value) {
  		throw new Error("<DtpPopupHearths>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$8 = window.L;

  const popup$3 = L$8.popup();
  const popup1 = L$8.popup({minWidth: 200});
  let argFilters$3;

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
  	if (DtpHearths._group && DtpHearths._map) {
  		DtpHearths._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				list_dtp = prp.list_dtp || [],
  				cnt = 0;
  			argFilters$3.forEach(ft => {
  				if (ft.type === 'quarter') {
  					if (ft.zn[prp.year] && ft.zn[prp.year][prp.quarter]) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (list_dtp.filter(pt => pt.id == ft.zn || pt.id_skpdi == ft.zn || pt.id_stat == ft.zn).length) {
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
  					} else if (zn === 1 && !prp.count_stricken && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken && !prp.count_lost) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 4 && prp.count_stricken && prp.count_lost) {
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
  	argFilters$3 = [];
  	let opt = {str_icon_type: {}, iconType: {}, years: {}, dtps: {}, stricken: {0:0}},
  		arr = [],
  		prefix = 'https://dtp.mvs.group/scripts/hearths_dev/';

  	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				opt.stricken[0] += json.length;
  				json.forEach(it => {
  					let iconType = it.icon_type || 1,
  						list_bounds = L$8.latLngBounds(),
  						list_dtp = it.list_dtp,
  						stroke = false,
  						fillColor = '#FF0000'; //   19-20

  					chkStricken(it, opt);
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
  								// }).bindPopup(popup)
  								// .on('popupopen', (ev) => {

  									// setPopup(ev.target.options.props);
  								// }).on('popupclose', (ev) => {
  									// if (ev.popup._svObj) {
  										// ev.popup._svObj.$destroy();
  										// delete ev.popup._svObj;
  									// }
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
  								let target = ev.target,
  									latlng = ev.latlng,
  									ctrlKey = ev.originalEvent.ctrlKey;
  								if (ctrlKey) { target.bringToBack(); }
  								// target.options.items.forEach(pt => {
  									// let cd = pt._latlng.distanceTo(latlng);
  									// if (cd < dist) {
  										// dist = cd;
  										// dtp = pt;
  									// }
  								// });
  								// if (dist < 10) {
  									// setPopup(dtp.options.props);
  									// popup.setLatLng(dtp._latlng).openOn(DtpHearths._map);
  								// } else {
  									setPopup1(it);
  									popup1.setLatLng(latlng).openOn(DtpHearths._map);
  								// }
  								
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
  // console.log('__allJson_____', allJson, DtpHearths._opt);
  		});
  });

  const L$9 = window.L;

  const popup$4 = L$9.popup();
  const popup1$1 = L$9.popup({minWidth: 200});
  let argFilters$4;

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
  	if (DtpHearthsTmp._group && DtpHearthsTmp._map) {
  		DtpHearthsTmp._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				list_dtp = prp.list_dtp || [],
  				cnt = 0;
  			argFilters$4.forEach(ft => {
  				if (ft.type === 'quarter') {
  					if (ft.zn[prp.year] && ft.zn[prp.year][prp.quarter]) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (list_dtp.filter(pt => pt.id == ft.zn || pt.id_skpdi == ft.zn || pt.id_stat == ft.zn).length) {
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
  					} else if (zn === 1 && !prp.count_stricken && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken && !prp.count_lost) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 4 && prp.count_stricken && prp.count_lost) {
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
  	argFilters$4 = [];
  	let opt = {str_icon_type: {}, iconType: {}, years: {}, dtps: {}, stricken: {0:0}},
  		arr = [],
  		prefix = 'https://dtp.mvs.group/scripts/hearthstmp_dev/';

  	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				opt.stricken[0] += json.length;
  				json.forEach(it => {
  					let iconType = it.icon_type || 1,
  						list_bounds = L$9.latLngBounds(),
  						list_dtp = it.list_dtp,
  						stroke = false,
  						fillColor = '#FF0000'; //   19-20

  					chkStricken(it, opt);
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
  								// }).bindPopup(popup)
  								// .on('popupopen', (ev) => {

  									// setPopup(ev.target.options.props);
  								// }).on('popupclose', (ev) => {
  									// if (ev.popup._svObj) {
  										// ev.popup._svObj.$destroy();
  										// delete ev.popup._svObj;
  									// }
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
  								let target = ev.target,
  									latlng = ev.latlng,
  									ctrlKey = ev.originalEvent.ctrlKey;
  								if (ctrlKey) { target.bringToBack(); }
  								// target.options.items.forEach(pt => {
  									// let cd = pt._latlng.distanceTo(latlng);
  									// if (cd < dist) {
  										// dist = cd;
  										// dtp = pt;
  									// }
  								// });
  								// if (dist < 10) {
  									// setPopup(dtp.options.props);
  									// popup.setLatLng(dtp._latlng).openOn(DtpHearthsTmp._map);
  								// } else {
  									setPopup1$1(it);
  									popup1$1.setLatLng(latlng).openOn(DtpHearthsTmp._map);
  								// }
  								
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
  // console.log('__allJson_____', allJson, DtpHearthsTmp._opt);
  		});
  });

  const L$a = window.L;

  const popup$5 = L$a.popup();
  const popup1$2 = L$a.popup({minWidth: 200});
  let argFilters$5;

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
  	if (DtpHearthsStat._group && DtpHearthsStat._map) {
  		DtpHearthsStat._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				list_dtp = prp.list_dtp || [],
  				cnt = 0;
  			argFilters$5.forEach(ft => {
  				if (ft.type === 'quarter') {
  					if (ft.zn[prp.year] && ft.zn[prp.year][prp.quarter]) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (list_dtp.filter(pt => pt.id == ft.zn || pt.id_skpdi == ft.zn || pt.id_stat == ft.zn).length) {
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
  					} else if (zn === 1 && !prp.count_stricken && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken && !prp.count_lost) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 4 && prp.count_stricken && prp.count_lost) {
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
  	argFilters$5 = [];
  	let opt = {str_icon_type: {}, iconType: {}, years: {}, dtps: {}, stricken: {0:0}},
  		arr = [],
  		prefix = 'https://dtp.mvs.group/scripts/hearthsstat_dev/';

  	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				opt.stricken[0] += json.length;
  				json.forEach(it => {
  					let iconType = it.icon_type || 1,
  						list_bounds = L$a.latLngBounds(),
  						list_dtp = it.list_dtp,
  						stroke = false,
  						fillColor = '#FF0000'; //   19-20

  					chkStricken(it, opt);
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
  								// }).bindPopup(popup)
  								// .on('popupopen', (ev) => {

  									// setPopup(ev.target.options.props);
  								// }).on('popupclose', (ev) => {
  									// if (ev.popup._svObj) {
  										// ev.popup._svObj.$destroy();
  										// delete ev.popup._svObj;
  									// }
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
  								let target = ev.target,
  									latlng = ev.latlng,
  									layerPoint = ev.layerPoint,
  									ctrlKey = ev.originalEvent.ctrlKey;
  								if (ctrlKey) { target.bringToBack(); }
  								// target.options.items.forEach(pt => {
  									// let cd = pt._point.distanceTo(layerPoint);
  									// if (cd < dist) {
  										// dist = cd;
  										// dtp = pt;
  									// }
  								// });
  								// if (dist < 10) {
  									// setPopup(dtp.options.props);
  									// popup.setLatLng(dtp._latlng).openOn(DtpHearthsStat._map);
  								// } else {
  									setPopup1$2(it);
  									popup1$2.setLatLng(latlng).openOn(DtpHearthsStat._map);
  								// }
  								
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
  // console.log('__allJson_____', allJson, DtpHearthsStat._opt);
  		});
  });

  const L$b = window.L;

  const popup$6 = L$b.popup();
  const popup1$3 = L$b.popup({minWidth: 200});
  let argFilters$6;

  const setPopup1$3 = function (props) {
  	let cont = L$b.DomUtil.create('div');
  	new DtpPopupHearths({
  		target: cont,
  		props: {
  			prp: props
  		}
  	});
  	popup1$3.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const DtpHearths3 = L$b.featureGroup([]);
  DtpHearths3.setFilter = arg => {
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	DtpHearths3.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$6 = arg;

  	let arr = [];
  	if (DtpHearths3._group && DtpHearths3._map) {
  		DtpHearths3._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				list_dtp = prp.list_dtp || [],
  				cnt = 0;
  			argFilters$6.forEach(ft => {
  				if (ft.type === 'quarter') {
  					if (ft.zn[prp.year] && ft.zn[prp.year][prp.quarter]) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (list_dtp.filter(pt => pt.id == ft.zn || pt.id_skpdi == ft.zn || pt.id_stat == ft.zn).length) {
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
  					} else if (zn === 1 && !prp.count_stricken && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken && !prp.count_lost) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 4 && prp.count_stricken && prp.count_lost) {
  						cnt++;								// С пострадавшими и погибшими
  					}
  				}
  			});
  			if (cnt === argFilters$6.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		DtpHearths3.addLayer(L$b.layerGroup(arr));
  		// DtpHearths._heat.setData({
  			// max: 8,
  			// data: DtpHearths._heatData
  		// });
  	}
  };

  DtpHearths3.on('remove', () => {
  	DtpHearths3.clearLayers();
  }).on('add', ev => {
  	argFilters$6 = [];
  	let opt = {str_icon_type: {}, iconType: {}, years: {}, dtps: {}, stricken: {0:0}},
  		arr = [],
  		prefix = 'https://dtp.mvs.group/scripts/hearths3_dev/';

  	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				opt.stricken[0] += json.length;
  				json.forEach(it => {
  					let iconType = it.icon_type || 1,
  						list_bounds = L$b.latLngBounds(),
  						list_dtp = it.list_dtp,
  						stroke = false,
  						stricken = chkStricken(it, opt),
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
  						let head;
  						let arr1 = list_dtp.map(prp => {
  							let iconType = prp.iconType || 0,
  								coords = prp.coords || {lat: 0, lon: 0},
  								latlng = L$b.latLng(coords.lat, coords.lon),
  								cur = [];

  							list_bounds.extend(latlng);

  							if (prp.id === it.head) { head = prp; }

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
  							return new CirclePoint(L$b.latLng(coords.lat, coords.lon), {
  									cluster: it,
  									props: prp,
  									radius: 6,
  									zIndexOffset: 50000,
  									rhomb: true,
  									stroke: stroke,
  									fillColor: fillColor,
  									// renderer: renderer
  								// }).bindPopup(popup)
  								// .on('popupopen', (ev) => {

  									// setPopup(ev.target.options.props);
  								// }).on('popupclose', (ev) => {
  									// if (ev.popup._svObj) {
  										// ev.popup._svObj.$destroy();
  										// delete ev.popup._svObj;
  									// }
  								});
  						});
  						if (head) {
  							it._bounds = L$b.circle(L$b.latLng(head.coords.lat, head.coords.lon), {radius: it.radius || 500, items: arr1, cluster: it, color: fillColor, });
  						} else {
  							it._bounds = L$b.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'});
  						}
  						
  						it._bounds
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
  								L$b.DomEvent.stopPropagation(ev);
  								let target = ev.target,
  									latlng = ev.latlng,
  									layerPoint = ev.layerPoint,
  									ctrlKey = ev.originalEvent.ctrlKey;
  								if (ctrlKey) { target.bringToBack(); }
  								// target.options.items.forEach(pt => {
  									// let cd = pt._point.distanceTo(layerPoint);
  									// if (cd < dist) {
  										// dist = cd;
  										// dtp = pt;
  									// }
  								// });
  								// if (dist < 10) {
  									// setPopup(dtp.options.props);
  									// popup.setLatLng(dtp._latlng).openOn(DtpHearths3._map);
  								// } else {
  									setPopup1$3(it);
  									popup1$3.setLatLng(latlng).openOn(DtpHearths3._map);
  								// }
  								
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
  				DtpHearths3._opt = opt;
  				DtpHearths3._group = L$b.layerGroup(arr);
  				if (argFilters$6) {
  					DtpHearths3.setFilter(argFilters$6);
  				} else {
  					DtpHearths3.addLayer(DtpHearths3._group);
  				}
  				DtpHearths3._refreshFilters();
  			});
  console.log('__DtpHearths3_____', allJson, DtpHearths3._opt);
  		});
  });

  const L$c = window.L;

  const popup$7 = L$c.popup();
  const popup1$4 = L$c.popup({minWidth: 200});
  let argFilters$7;

  const setPopup1$4 = function (props) {
  	let cont = L$c.DomUtil.create('div');
  	new DtpPopupHearths({
  		target: cont,
  		props: {
  			prp: props
  		}
  	});
  	popup1$4.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const DtpHearths5 = L$c.featureGroup([]);
  DtpHearths5.setFilter = arg => {
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	DtpHearths5.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$7 = arg;

  	let arr = [];
  	if (DtpHearths5._group && DtpHearths5._map) {
  		DtpHearths5._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				list_dtp = prp.list_dtp || [],
  				cnt = 0;
  			argFilters$7.forEach(ft => {
  				if (ft.type === 'quarter') {
  					if (ft.zn[prp.year] && ft.zn[prp.year][prp.quarter]) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (list_dtp.filter(pt => pt.id == ft.zn || pt.id_skpdi == ft.zn || pt.id_stat == ft.zn).length) {
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
  					} else if (zn === 1 && !prp.count_stricken && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken && !prp.count_lost) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 4 && prp.count_stricken && prp.count_lost) {
  						cnt++;								// С пострадавшими и погибшими
  					}
  				}
  			});
  			if (cnt === argFilters$7.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		DtpHearths5.addLayer(L$c.layerGroup(arr));
  		// DtpHearths._heat.setData({
  			// max: 8,
  			// data: DtpHearths._heatData
  		// });
  	}
  };

  DtpHearths5.on('remove', () => {
  	DtpHearths5.clearLayers();
  }).on('add', ev => {
  	argFilters$7 = [];
  	let opt = {str_icon_type: {}, iconType: {}, years: {}, dtps: {}, stricken: {0:0}},
  		arr = [],
  		prefix = 'https://dtp.mvs.group/scripts/hearths5_dev/';

  	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				opt.stricken[0] += json.length;
  				json.forEach(it => {
  					let iconType = it.icon_type || 1,
  						list_bounds = L$c.latLngBounds(),
  						list_dtp = it.list_dtp,
  						stroke = false,
  						fillColor = '#FF0000'; //   19-20

  					chkStricken(it, opt);
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
  						let head;
  						let arr1 = list_dtp.map(prp => {
  							let iconType = prp.iconType || 0,
  								coords = prp.coords || {lat: 0, lon: 0},
  								latlng = L$c.latLng(coords.lat, coords.lon),
  								cur = [];

  							list_bounds.extend(latlng);

  							if (prp.id === it.head) { head = prp; }

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
  							return new CirclePoint(L$c.latLng(coords.lat, coords.lon), {
  									cluster: it,
  									props: prp,
  									radius: 6,
  									zIndexOffset: 50000,
  									rhomb: true,
  									stroke: stroke,
  									fillColor: fillColor,
  									// renderer: renderer
  								// }).bindPopup(popup)
  								// .on('popupopen', (ev) => {

  									// setPopup(ev.target.options.props);
  								// }).on('popupclose', (ev) => {
  									// if (ev.popup._svObj) {
  										// ev.popup._svObj.$destroy();
  										// delete ev.popup._svObj;
  									// }
  								});
  						});
  						if (head) {
  							it._bounds = L$c.circle(L$c.latLng(head.coords.lat, head.coords.lon), {radius: it.radius || 500, items: arr1, cluster: it, color: fillColor, });
  						} else {
  							it._bounds = L$c.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'});
  						}
  						
  						it._bounds
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
  								L$c.DomEvent.stopPropagation(ev);
  								let target = ev.target,
  									latlng = ev.latlng,
  									layerPoint = ev.layerPoint,
  									ctrlKey = ev.originalEvent.ctrlKey;
  								if (ctrlKey) { target.bringToBack(); }
  								// target.options.items.forEach(pt => {
  									// let cd = pt._point.distanceTo(layerPoint);
  									// if (cd < dist) {
  										// dist = cd;
  										// dtp = pt;
  									// }
  								// });
  								// if (dist < 10) {
  									// setPopup(dtp.options.props);
  									// popup.setLatLng(dtp._latlng).openOn(DtpHearths5._map);
  								// } else {
  									setPopup1$4(it);
  									popup1$4.setLatLng(latlng).openOn(DtpHearths5._map);
  								// }
  								
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
  				DtpHearths5._opt = opt;
  				DtpHearths5._group = L$c.layerGroup(arr);
  				if (argFilters$7) {
  					DtpHearths5.setFilter(argFilters$7);
  				} else {
  					DtpHearths5.addLayer(DtpHearths5._group);
  				}
  				DtpHearths5._refreshFilters();
  			});
  // console.log('__allJson_____', allJson, DtpHearths5._opt);
  		});
  });

  const L$d = window.L;

  const popup$8 = L$d.popup();
  const popup1$5 = L$d.popup({minWidth: 200});
  let argFilters$8 = [];

  const setPopup1$5 = function (props) {
  	let cont = L$d.DomUtil.create('div');
  	new DtpPopupHearths({
  		target: cont,
  		props: {
  			prp: props
  		}
  	});
  	popup1$5.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const DtpHearthsPicket = L$d.featureGroup([]);
  DtpHearthsPicket.setFilter = arg => {
  	if (!DtpHearthsPicket._map) { return; }
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	DtpHearthsPicket.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$8 = arg.length ? arg : [];

  	let fCnt = argFilters$8.length;
  	let arr = [];
  	if (DtpHearthsPicket._group) {
  		DtpHearthsPicket._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				cnt = 0;
  			argFilters$8.forEach(ft => {
  				if (ft.type === 'ht') {
  					if (ft.zn[prp.ht]) {
  						cnt++;
  					}
  				} else if (ft.type === 'roads') {
  					if (ft.zn.filter(pt => pt === prp.road).length || (ft.zn.length === 1 && ft.zn[0] === '')) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (prp.list_dtp.filter(pt => pt.id == ft.zn).length || !ft.zn.length) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_hearth') {
  					if (ft.zn == prp.id_hearth) {
  						cnt++;
  					}
  				} else if (ft.type === 'year') {
  					if (ft.zn[prp.year]) {
  						cnt++;
  					}
  				} else if (ft.type === 'stricken') {
  					let zn = ft.zn;
  					if (!zn) {
  						cnt++;
  					} else if (zn === 1 && !prp.count_stricken && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken && !prp.count_lost) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 4 && prp.count_stricken && prp.count_lost) {
  						cnt++;								// С пострадавшими и погибшими
  					}
  				}
  			});
  			if (cnt === fCnt) {
  				arr.push(it);
  			}
  		});
  		DtpHearthsPicket.addLayer(L$d.layerGroup(arr));
  	}
  };

  DtpHearthsPicket.on('remove', () => {
  	DtpHearthsPicket.clearLayers();
  }).on('add', ev => {
  	let opt = {road: {}, str_icon_type: {}, iconType: {}, years: {}, dtps: {}},
  		arr = [],
  		prefix = 'https://dtp.mvs.group/scripts/hearths_picket_dev/',
  		parseItem = (it, ht) => {
  			let iconType = it.icon_type || 1,
  				list_bounds = L$d.latLngBounds(),
  				latlngs = [],
  				list_dtp = it.list_dtp,
  				stroke = false,
  				fillColor = '#FF0000'; //   19-20

  			it.ht = ht;
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

  				if (it.road in opt.road) {
  					opt.road[it.road]++;
  				} else {
  					opt.road[it.road] = 1;
  				}

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
  				let head;
  				let arr1 = list_dtp.map(prp => {
  					let iconType = prp.iconType || 0,
  						coords = prp.coords || {lat: 0, lon: 0},
  						latlng = L$d.latLng(coords.lat, coords.lon),
  						cur = [];

  					list_bounds.extend(latlng);
  					latlngs.push(latlng);

  					if (prp.id === it.head) { head = prp; }

  					if (prp.id_skpdi) { cur.push({type: 'skpdi', id: prp.id_skpdi}); }
  					if (prp.id_stat) { cur.push({type: 'gibdd', id: prp.id_stat}); }
  					prp._cur = cur;

  					let dtps = opt.dtps[prp.id] || {};
  					let idHearth = it.id || it.id_hearth;
  					if (!dtps) {
  						dtps = {};
  						dtps[idHearth] = 1;
  					} else if (!dtps[idHearth]) {
  						dtps[idHearth] = 1;
  					} else {
  						dtps[idHearth]++;
  					}
  					opt.dtps[prp.id] = dtps;
  					return new CirclePoint(L$d.latLng(coords.lat, coords.lon), {
  							cluster: it,
  							props: prp,
  							radius: 6,
  							zIndexOffset: 50000,
  							rhomb: true,
  							stroke: stroke,
  							fillColor: fillColor,
  							// renderer: renderer
  						// }).bindPopup(popup)
  						// .on('popupopen', (ev) => {

  							// setPopup(ev.target.options.props);
  						// }).on('popupclose', (ev) => {
  							// if (ev.popup._svObj) {
  								// ev.popup._svObj.$destroy();
  								// delete ev.popup._svObj;
  							// }
  						});
  				});
  				if (head) {
  					it._bounds = L$d.circle(L$d.latLng(head.coords.lat, head.coords.lon), {radius: it.radius || 500, items: arr1, cluster: it, color: fillColor, });
  				} else if (latlngs.length) {
  					it._bounds = L$d.polyline(latlngs, {items: arr1, cluster: it, color: fillColor, weight: 4});
  				} else {
  					it._bounds = L$d.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'});
  				}

  				it._bounds
  					.on('mouseover', (ev) => {
  						let target = ev.target;
  						target._weight = target.options.weight;
  						target._color = target.options.color;
  						target.options.weight = 8;
  						target.options.color = 'red';
  						target._renderer._updateStyle(target);
  					})
  					.on('mouseout', (ev) => {
  						let target = ev.target;
  						target.options.weight = target._weight;
  						target.options.color = target._color;
  						target._renderer._updateStyle(target);
  					})
  					.on('click', (ev) => {
  						L$d.DomEvent.stopPropagation(ev);
  						let target = ev.target,
  							latlng = ev.latlng,
  							layerPoint = ev.layerPoint,
  							ctrlKey = ev.originalEvent.ctrlKey;
  						if (ctrlKey) { target.bringToBack(); }
  						// target.options.items.forEach(pt => {
  							// let cd = pt._point.distanceTo(layerPoint);
  							// if (cd < dist) {
  								// dist = cd;
  								// dtp = pt;
  							// }
  						// });
  						// if (dist < 10) {
  							// setPopup(dtp.options.props);
  							// popup.setLatLng(dtp._latlng).openOn(DtpHearthsPicket._map);
  						// } else {
  							setPopup1$5(it);
  							popup1$5.setLatLng(latlng).openOn(DtpHearthsPicket._map);
  						// }
  						
  						// console.log('popu666popen', dist, dtp);
  					});
  				arr.push(it._bounds);
  				arr = arr.concat(arr1);
  			}
  		};

  	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  	// Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				json.forEach(pt => {
  					// parseItem(pt, 'hearth3');
  					(pt.hearth3 || []).forEach(it => {
  						parseItem(it, 'hearth3');
  					});
  					(pt.hearth5 || []).forEach(it => {
  						parseItem(it, 'hearth5');
  					});
  				});
  				
  				// let y = Math.floor(max_quarter),
  					// q = 1 + 4 * (max_quarter - y);
  				// argFilters = [{type: 'quarter', year: y, zn: q}];
  // console.log('opt', opt);
  				DtpHearthsPicket._opt = opt;
  				DtpHearthsPicket._group = L$d.layerGroup(arr);
  				if (argFilters$8) {
  					DtpHearthsPicket.setFilter(argFilters$8);
  				} else {
  					DtpHearthsPicket.addLayer(DtpHearthsPicket._group);
  				}
  				DtpHearthsPicket._refreshFilters();
  			});
  console.log('__allJson_____', allJson, DtpHearthsPicket._opt);
  		});
  });

  const L$e = window.L;

  const popup$9 = L$e.popup();
  const popup1$6 = L$e.popup({minWidth: 200});
  let argFilters$9 = [];

  const setPopup1$6 = function (props) {
  	let cont = L$e.DomUtil.create('div');
  	new DtpPopupHearths({
  		target: cont,
  		props: {
  			prp: props
  		}
  	});
  	popup1$6.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const DtpHearthsSettlements = L$e.featureGroup([], {renderer: myRenderer});
  DtpHearthsSettlements.setFilter = arg => {
  	if (!DtpHearthsSettlements._map) { return; }
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	DtpHearthsSettlements.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$9 = arg.length ? arg : [];

  	let fCnt = argFilters$9.length;
  	let arr = [];
  	if (DtpHearthsSettlements._group) {
  		DtpHearthsSettlements._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				cnt = 0;
  			argFilters$9.forEach(ft => {
  				if (ft.type === 'ht') {
  					if (ft.zn[prp.ht]) {
  						cnt++;
  					}
  				} else if (ft.type === 'roads') {
  					if (ft.zn.filter(pt => pt === prp.road).length || (ft.zn.length === 1 && ft.zn[0] === '')) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (prp.list_dtp.filter(pt => pt.id == ft.zn).length || !ft.zn.length) {
  						cnt++;
  					}
  				} else if (ft.type === 'city') {
  					// if (ft.zn[prp.city]) {
  						cnt++;
  					// }
  				} else if (ft.type === 'id_hearth') {
  					if (ft.zn == prp.id_hearth) {
  						cnt++;
  					}
  				} else if (ft.type === 'year') {
  					if (ft.zn[prp.year]) {
  						cnt++;
  					}
  				} else if (ft.type === 'stricken') {
  					let zn = ft.zn;
  					if (!zn) {
  						cnt++;
  					} else if (zn === 1 && !prp.count_stricken && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken && !prp.count_lost) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 4 && prp.count_stricken && prp.count_lost) {
  						cnt++;								// С пострадавшими и погибшими
  					}
  				}
  			});
  			if (cnt === fCnt) {
  				arr.push(it);
  			}
  		});
  		DtpHearthsSettlements.addLayer(L$e.layerGroup(arr));
  	}
  };

  DtpHearthsSettlements.on('remove', () => {
  	DtpHearthsSettlements.clearLayers();
  }).on('add', ev => {
  	let opt = {road: {}, str_icon_type: {}, iconType: {}, id_city: {}, city: {}, years: {}, dtps: {}},
  		arr = [],
  		prefix = 'https://dtp.mvs.group/scripts/hearthssettlements_dev/',
  		parseItem = (it, ht) => {
  			let iconType = it.icon_type || 1,
  				list_bounds = L$e.latLngBounds(),
  				latlngs = [],
  				list_dtp = it.list_dtp,
  				stroke = false,
  				fillColor = '#FF0000'; //   19-20

  			it.ht = ht;
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

  				if (it.road in opt.road) {
  					opt.road[it.road]++;
  				} else {
  					opt.road[it.road] = 1;
  				}

  					let cityp = it.city || 0;
  					let city = opt.city[cityp] || 0;
  					opt.city[cityp] = city + 1;

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
  				let head;
  				let arr1 = list_dtp.map(prp => {
  					let iconType = prp.iconType || 0,
  						coords = prp.coords || {lat: 0, lon: 0},
  						latlng = L$e.latLng(coords.lat, coords.lon),
  						cur = [];

  					list_bounds.extend(latlng);
  					latlngs.push(latlng);

  					if (prp.id === it.head) { head = prp; }

  					if (prp.id_skpdi) { cur.push({type: 'skpdi', id: prp.id_skpdi}); }
  					if (prp.id_stat) { cur.push({type: 'gibdd', id: prp.id_stat}); }
  					prp._cur = cur;

  					let id_city = opt.id_city[prp.id_city] || 0;
  					opt.id_city[prp.id_city] = id_city + 1;

  					let dtps = opt.dtps[prp.id] || {};
  					let idHearth = it.id || it.id_hearth;
  					if (!dtps) {
  						dtps = {};
  						dtps[idHearth] = 1;
  					} else if (!dtps[idHearth]) {
  						dtps[idHearth] = 1;
  					} else {
  						dtps[idHearth]++;
  					}
  					opt.dtps[prp.id] = dtps;
  					return new CirclePoint(L$e.latLng(coords.lat, coords.lon), {
  							cluster: it,
  							props: prp,
  							radius: 6,
  							zIndexOffset: 50000,
  							rhomb: true,
  							stroke: stroke,
  							fillColor: fillColor,
  							// renderer: renderer
  						// }).bindPopup(popup)
  						// .on('popupopen', (ev) => {
  							// setPopup(ev.target.options.props);
  						// }).on('popupclose', (ev) => {
  							// if (ev.popup._svObj) {
  								// ev.popup._svObj.$destroy();
  								// delete ev.popup._svObj;
  							// }
  						})
  						.on('click', (ev) => {
  							setPopup1$6(it);
  							popup1$6.setLatLng(ev.latlng).openOn(DtpHearthsSettlements._map);
  						});
  				});
  				if (head) {
  					it._bounds = L$e.circle(L$e.latLng(head.coords.lat, head.coords.lon), {radius: it.radius || 500, items: arr1, cluster: it, color: fillColor, });
  				} else if (latlngs.length) {
  					it._bounds = L$e.polyline(latlngs, {items: arr1, cluster: it, renderer: myRenderer, color: fillColor, weight: 4});
  				} else {
  					it._bounds = L$e.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'});
  				}

  				it._bounds
  					.on('mouseover', (ev) => {
  						let target = ev.target;
  						target._weight = target.options.weight;
  						target._color = target.options.color;
  						target.options.weight = 8;
  						target.options.color = 'red';
  						target._renderer._updateStyle(target);
  					})
  					.on('mouseout', (ev) => {
  						let target = ev.target;
  						target.options.weight = target._weight;
  						target.options.color = target._color;
  						target._renderer._updateStyle(target);
  					})
  					.on('click', (ev) => {
  						L$e.DomEvent.stopPropagation(ev);
  						let target = ev.target,
  							latlng = ev.latlng,
  							layerPoint = ev.layerPoint,
  							ctrlKey = ev.originalEvent.ctrlKey;
  						if (ctrlKey) { target.bringToBack(); }
  						// target.options.items.forEach(pt => {
  							// let cd = pt._point.distanceTo(layerPoint);
  							// if (cd < dist) {
  								// dist = cd;
  								// dtp = pt;
  							// }
  						// });
  						// if (dist < 10) {
  							// setPopup(dtp.options.props);
  							// popup.setLatLng(dtp._latlng).openOn(DtpHearthsSettlements._map);
  						// } else {
  							setPopup1$6(it);
  							popup1$6.setLatLng(latlng).openOn(DtpHearthsSettlements._map);
  						// }
  						
  						// console.log('popu666popen', dist, dtp);
  					});
  				arr.push(it._bounds);
  				arr = arr.concat(arr1);
  			}
  		};

  	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  	// Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				json.forEach(pt => {
  					// parseItem(pt, 'hearth3');
  					(pt.hearth3 || []).forEach(it => {
  						parseItem(it, 'hearth3');
  					});
  					(pt.hearth5 || []).forEach(it => {
  						parseItem(it, 'hearth5');
  					});
  				});
  				
  				// let y = Math.floor(max_quarter),
  					// q = 1 + 4 * (max_quarter - y);
  				// argFilters = [{type: 'quarter', year: y, zn: q}];
  // console.log('opt', opt);
  				DtpHearthsSettlements._opt = opt;
  				DtpHearthsSettlements._group = L$e.layerGroup(arr);
  				if (argFilters$9) {
  					DtpHearthsSettlements.setFilter(argFilters$9);
  				} else {
  					DtpHearthsSettlements.addLayer(DtpHearthsSettlements._group);
  				}
  				DtpHearthsSettlements._refreshFilters();
  			});
  console.log('__allJson_____', allJson, DtpHearthsSettlements._opt);
  		});
  });

  /* src\DtpPopupRub1.svelte generated by Svelte v3.20.1 */

  const { console: console_1$5 } = globals;
  const file$8 = "src\\DtpPopupRub1.svelte";

  function get_each_context$6(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[5] = list[i];
  	child_ctx[7] = i;
  	return child_ctx;
  }

  function get_each_context_1$4(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[5] = list[i];
  	child_ctx[7] = i;
  	return child_ctx;
  }

  // (58:4) {#each complexes as pt1, index}
  function create_each_block_1$4(ctx) {
  	let button;
  	let t_value = /*pt1*/ ctx[5].complexName + "";
  	let t;
  	let button_class_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			button = element("button");
  			t = text(t_value);
  			attr_dev(button, "class", button_class_value = "tab " + /*index*/ ctx[7] + " " + (/*index*/ ctx[7] === 0 ? "active" : "") + " svelte-h8luxq");
  			add_location(button, file$8, 58, 5, 1720);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, button, anchor);
  			append_dev(button, t);
  			if (remount) dispose();
  			dispose = listen_dev(button, "click", /*onClick*/ ctx[2], false, false, false);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(button);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_1$4.name,
  		type: "each",
  		source: "(58:4) {#each complexes as pt1, index}",
  		ctx
  	});

  	return block;
  }

  // (61:4) {#each complexes as pt1, index}
  function create_each_block$6(ctx) {
  	let table;
  	let tr0;
  	let td0;
  	let td1;
  	let t1_value = /*pt1*/ ctx[5].complexName + "";
  	let t1;
  	let t2;
  	let t3_value = /*pt1*/ ctx[5].complexSid + "";
  	let t3;
  	let t4;
  	let t5;
  	let tr1;
  	let td2;
  	let td3;
  	let t7_value = /*pt1*/ ctx[5].complexModelName + "";
  	let t7;
  	let t8;
  	let tr2;
  	let td4;
  	let td5;
  	let t10_value = /*pt1*/ ctx[5].complexTypeName + "";
  	let t10;
  	let t11;
  	let tr3;
  	let td6;
  	let td7;
  	let t13_value = /*pt1*/ ctx[5].complexStageName + "";
  	let t13;
  	let t14;
  	let tr4;
  	let td8;
  	let td9;
  	let t16_value = (/*pt1*/ ctx[5].kvfStatus || "") + "";
  	let t16;
  	let t17;
  	let tr5;
  	let td10;
  	let td11;
  	let t19_value = (/*pt1*/ ctx[5].roadName || /*prp*/ ctx[0].roadName || "") + "";
  	let t19;
  	let t20;
  	let table_class_value;

  	const block = {
  		c: function create() {
  			table = element("table");
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Комплекс:";
  			td1 = element("td");
  			t1 = text(t1_value);
  			t2 = text(" (id: ");
  			t3 = text(t3_value);
  			t4 = text(")");
  			t5 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Модель:";
  			td3 = element("td");
  			t7 = text(t7_value);
  			t8 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Тип:";
  			td5 = element("td");
  			t10 = text(t10_value);
  			t11 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Этап:";
  			td7 = element("td");
  			t13 = text(t13_value);
  			t14 = space();
  			tr4 = element("tr");
  			td8 = element("td");
  			td8.textContent = "Работоспособность:";
  			td9 = element("td");
  			t16 = text(t16_value);
  			t17 = space();
  			tr5 = element("tr");
  			td10 = element("td");
  			td10.textContent = "Дорога:";
  			td11 = element("td");
  			t19 = text(t19_value);
  			t20 = space();
  			attr_dev(td0, "class", "first svelte-h8luxq");
  			add_location(td0, file$8, 62, 10, 1949);
  			add_location(td1, file$8, 62, 42, 1981);
  			add_location(tr0, file$8, 62, 6, 1945);
  			attr_dev(td2, "class", "first svelte-h8luxq");
  			add_location(td2, file$8, 63, 10, 2046);
  			add_location(td3, file$8, 63, 40, 2076);
  			add_location(tr1, file$8, 63, 6, 2042);
  			attr_dev(td4, "class", "first svelte-h8luxq");
  			add_location(td4, file$8, 64, 10, 2123);
  			add_location(td5, file$8, 64, 37, 2150);
  			add_location(tr2, file$8, 64, 6, 2119);
  			attr_dev(td6, "class", "first svelte-h8luxq");
  			add_location(td6, file$8, 65, 10, 2196);
  			add_location(td7, file$8, 65, 38, 2224);
  			add_location(tr3, file$8, 65, 6, 2192);
  			attr_dev(td8, "class", "first svelte-h8luxq");
  			add_location(td8, file$8, 66, 10, 2271);
  			add_location(td9, file$8, 66, 51, 2312);
  			add_location(tr4, file$8, 66, 6, 2267);
  			attr_dev(td10, "class", "first svelte-h8luxq");
  			add_location(td10, file$8, 68, 10, 2544);
  			add_location(td11, file$8, 68, 40, 2574);
  			add_location(tr5, file$8, 68, 6, 2540);
  			attr_dev(table, "class", table_class_value = "tabCont " + /*index*/ ctx[7] + " " + (/*index*/ ctx[7] === 0 ? "" : "hidden") + " svelte-h8luxq");
  			add_location(table, file$8, 61, 5, 1877);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, table, anchor);
  			append_dev(table, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, td1);
  			append_dev(td1, t1);
  			append_dev(td1, t2);
  			append_dev(td1, t3);
  			append_dev(td1, t4);
  			append_dev(table, t5);
  			append_dev(table, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, td3);
  			append_dev(td3, t7);
  			append_dev(table, t8);
  			append_dev(table, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, td5);
  			append_dev(td5, t10);
  			append_dev(table, t11);
  			append_dev(table, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, td7);
  			append_dev(td7, t13);
  			append_dev(table, t14);
  			append_dev(table, tr4);
  			append_dev(tr4, td8);
  			append_dev(tr4, td9);
  			append_dev(td9, t16);
  			append_dev(table, t17);
  			append_dev(table, tr5);
  			append_dev(tr5, td10);
  			append_dev(tr5, td11);
  			append_dev(td11, t19);
  			append_dev(table, t20);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && t19_value !== (t19_value = (/*pt1*/ ctx[5].roadName || /*prp*/ ctx[0].roadName || "") + "")) set_data_dev(t19, t19_value);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(table);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$6.name,
  		type: "each",
  		source: "(61:4) {#each complexes as pt1, index}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$8(ctx) {
  	let div2;
  	let div0;
  	let t0;
  	let t1_value = (/*prp*/ ctx[0].id || /*prp*/ ctx[0].lineSid) + "";
  	let t1;
  	let t2;
  	let t3;
  	let div1;
  	let table;
  	let tbody;
  	let tr0;
  	let td0;
  	let t5;
  	let td1;
  	let t6_value = (/*prp*/ ctx[0].roadName || "") + "";
  	let t6;
  	let t7;
  	let tr1;
  	let td2;
  	let t9;
  	let td3;
  	let t10_value = /*prp*/ ctx[0].lat + "";
  	let t10;
  	let t11;
  	let t12_value = /*prp*/ ctx[0].lon + "";
  	let t12;
  	let t13;
  	let span;
  	let t14;
  	let tr2;
  	let td4;
  	let t16;
  	let td5;
  	let t17_value = (/*prp*/ ctx[0].lineAddress || "") + "";
  	let t17;
  	let t18;
  	let tr3;
  	let td6;
  	let t20;
  	let td7;
  	let t22;
  	let tr4;
  	let td8;
  	let t23;
  	let dispose;
  	let each_value_1 = /*complexes*/ ctx[3];
  	validate_each_argument(each_value_1);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks_1[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
  	}

  	let each_value = /*complexes*/ ctx[3];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
  	}

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			t0 = text("Рубеж (id: ");
  			t1 = text(t1_value);
  			t2 = text(")");
  			t3 = space();
  			div1 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Дорога:";
  			t5 = space();
  			td1 = element("td");
  			t6 = text(t6_value);
  			t7 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Координаты:";
  			t9 = space();
  			td3 = element("td");
  			t10 = text(t10_value);
  			t11 = space();
  			t12 = text(t12_value);
  			t13 = space();
  			span = element("span");
  			t14 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Адрес:";
  			t16 = space();
  			td5 = element("td");
  			t17 = text(t17_value);
  			t18 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Комплексов:";
  			t20 = space();
  			td7 = element("td");
  			td7.textContent = `${/*complexes*/ ctx[3].length}`;
  			t22 = space();
  			tr4 = element("tr");
  			td8 = element("td");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t23 = space();

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$8, 35, 2, 1052);
  			attr_dev(td0, "class", "first svelte-h8luxq");
  			add_location(td0, file$8, 40, 5, 1191);
  			add_location(td1, file$8, 41, 5, 1227);
  			add_location(tr0, file$8, 39, 3, 1181);
  			attr_dev(td2, "class", "first svelte-h8luxq");
  			add_location(td2, file$8, 44, 5, 1279);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$8, 45, 29, 1343);
  			add_location(td3, file$8, 45, 5, 1319);
  			add_location(tr1, file$8, 43, 3, 1269);
  			attr_dev(td4, "class", "first svelte-h8luxq");
  			add_location(td4, file$8, 48, 5, 1471);
  			add_location(td5, file$8, 49, 5, 1506);
  			add_location(tr2, file$8, 47, 3, 1461);
  			attr_dev(td6, "class", "first svelte-h8luxq");
  			add_location(td6, file$8, 52, 5, 1561);
  			add_location(td7, file$8, 53, 5, 1601);
  			add_location(tr3, file$8, 51, 3, 1551);
  			attr_dev(td8, "class", "tabs svelte-h8luxq");
  			attr_dev(td8, "colspan", "2");
  			add_location(td8, file$8, 56, 5, 1651);
  			add_location(tr4, file$8, 55, 3, 1641);
  			add_location(tbody, file$8, 38, 3, 1170);
  			attr_dev(table, "class", "table svelte-h8luxq");
  			add_location(table, file$8, 37, 4, 1145);
  			attr_dev(div1, "class", "featureCont");
  			add_location(div1, file$8, 36, 2, 1115);
  			attr_dev(div2, "class", "mvsPopup svelte-h8luxq");
  			add_location(div2, file$8, 34, 1, 1027);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div0, t0);
  			append_dev(div0, t1);
  			append_dev(div0, t2);
  			append_dev(div2, t3);
  			append_dev(div2, div1);
  			append_dev(div1, table);
  			append_dev(table, tbody);
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t5);
  			append_dev(tr0, td1);
  			append_dev(td1, t6);
  			append_dev(tbody, t7);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t9);
  			append_dev(tr1, td3);
  			append_dev(td3, t10);
  			append_dev(td3, t11);
  			append_dev(td3, t12);
  			append_dev(td3, t13);
  			append_dev(td3, span);
  			append_dev(tbody, t14);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t16);
  			append_dev(tr2, td5);
  			append_dev(td5, t17);
  			append_dev(tbody, t18);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, t20);
  			append_dev(tr3, td7);
  			append_dev(tbody, t22);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td8);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(td8, null);
  			}

  			append_dev(td8, t23);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(td8, null);
  			}

  			if (remount) dispose();
  			dispose = listen_dev(span, "click", /*copyParent*/ ctx[1], false, false, false);
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 1 && t1_value !== (t1_value = (/*prp*/ ctx[0].id || /*prp*/ ctx[0].lineSid) + "")) set_data_dev(t1, t1_value);
  			if (dirty & /*prp*/ 1 && t6_value !== (t6_value = (/*prp*/ ctx[0].roadName || "") + "")) set_data_dev(t6, t6_value);
  			if (dirty & /*prp*/ 1 && t10_value !== (t10_value = /*prp*/ ctx[0].lat + "")) set_data_dev(t10, t10_value);
  			if (dirty & /*prp*/ 1 && t12_value !== (t12_value = /*prp*/ ctx[0].lon + "")) set_data_dev(t12, t12_value);
  			if (dirty & /*prp*/ 1 && t17_value !== (t17_value = (/*prp*/ ctx[0].lineAddress || "") + "")) set_data_dev(t17, t17_value);

  			if (dirty & /*onClick, complexes*/ 12) {
  				each_value_1 = /*complexes*/ ctx[3];
  				validate_each_argument(each_value_1);
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_1$4(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(td8, t23);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_1.length;
  			}

  			if (dirty & /*complexes, prp*/ 9) {
  				each_value = /*complexes*/ ctx[3];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$6(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$6(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(td8, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$8.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$8($$self, $$props, $$invalidate) {
  	let { prp } = $$props;
  	let current = 0;

  	const copyParent = ev => {
  		navigator.clipboard.writeText(ev.target.parentNode.textContent).catch(err => {
  			console.log("Something went wrong", err);
  		});
  	};

  	const onClick = ev => {
  		let target = ev.target,
  			arr = (/tab (\d)/).exec(target.className),
  			nm = arr && arr.length === 2 ? arr[1] : 0,
  			prn = target.parentNode;

  		for (let i = 0, len = prn.childNodes.length; i < len; i++) {
  			let node = prn.childNodes[i];

  			if (node.classList) {
  				let active = node.classList.contains(nm);

  				if (node.tagName === "BUTTON") {
  					node.classList[active ? "add" : "remove"]("active");
  				} else if (node.tagName === "TABLE") {
  					node.classList[active ? "remove" : "add"]("hidden");
  				}
  			}
  		}
  	}; // let target = ev.target.classList.remove
  	// console.log('setComplex ', prn.childNodes);

  	let complexes = prp && prp.complexes ? prp.complexes : [];
  	console.log("complexes ", complexes);
  	const writable_props = ["prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<DtpPopupRub1> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupRub1", $$slots, []);

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({
  		DtpPopup: DtpPopupVerifyed,
  		prp,
  		current,
  		copyParent,
  		onClick,
  		complexes
  	});

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("current" in $$props) current = $$props.current;
  		if ("complexes" in $$props) $$invalidate(3, complexes = $$props.complexes);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [prp, copyParent, onClick, complexes];
  }

  class DtpPopupRub1 extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$8, create_fragment$8, safe_not_equal, { prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupRub1",
  			options,
  			id: create_fragment$8.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$5.warn("<DtpPopupRub1> was created without expected prop 'prp'");
  		}
  	}

  	get prp() {
  		throw new Error("<DtpPopupRub1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupRub1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$f = window.L;

  const popup$a = L$f.popup();
  const popup1$7 = L$f.popup({minWidth: 200});
  let argFilters$a;

  const setPopup$3 = function (props) {
  	let cont = L$f.DomUtil.create('div');
  	new DtpPopupRub1({
  		target: cont,
  		props: {
  			// popup: popup,
  			prp: props
  		}
  	});
  	popup$a.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const Rub1 = L$f.featureGroup([]);
  Rub1.setFilter = arg => {
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	if (!Rub1._map) { return; }
  	Rub1.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$a = arg;

  	let arr = [];
  	if (Rub1._group) {
  		Rub1._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				cnt = 0;
  			argFilters$a.forEach(ft => {
  				if (ft.type === 'ht') {
  					if (ft.zn[prp.ht]) {
  						cnt++;
  					}
  				} else if (ft.type === 'roads') {
  					if (ft.zn.filter(pt => pt === prp.road).length || (ft.zn.length === 1 && ft.zn[0] === '')) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (prp.list_dtp.filter(pt => pt.id == ft.zn).length || !ft.zn.length) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_hearth') {
  					if (ft.zn == prp.id_hearth) {
  						cnt++;
  					}
  				} else if (ft.type === 'stricken') {
  					let zn = ft.zn;
  					if (!zn) {
  						cnt++;
  					} else if (zn === 1 && !prp.count_stricken && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken && !prp.count_lost) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 4 && prp.count_stricken && prp.count_lost) {
  						cnt++;								// С пострадавшими и погибшими
  					}
  				}
  			});
  			if (cnt === argFilters$a.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		Rub1.addLayer(L$f.layerGroup(arr));
  		// DtpHearths._heat.setData({
  			// max: 8,
  			// data: DtpHearths._heatData
  		// });
  	}
  };

  Rub1.on('remove', () => {
  	Rub1.clearLayers();
  }).on('add', ev => {
  	let parseItem = (prp) => {
  			let list_bounds = L$f.latLngBounds(),
  				// latlngs = [],
  				stroke = false,
  				fillColor = '#FF0000'; //   19-20


  			if (prp.complexes) {
  				if (prp.complexes.length === 1) {
  					fillColor = '#FFA500';
  				} else if (prp.complexes.length > 1) {
  					fillColor = '#0000FF';
  				}
  			}

  			let coords = prp.coords || {lat: prp.lat, lon: prp.lon},
  				latlng = L$f.latLng(coords.lat, coords.lon);

  			list_bounds.extend(latlng);

  			return new CirclePoint(L$f.latLng(coords.lat, coords.lon), {
  					// cluster: it,
  					props: prp,
  					radius: 6,
  					zIndexOffset: 50000,
  					// rhomb: true,
  					stroke: stroke,
  					fillColor: fillColor,
  					// renderer: renderer
  				}).bindPopup(popup$a)
  				.on('popupopen', (ev) => {

  					setPopup$3(ev.target.options.props);
  					// console.log('popupopen', ev);
  				}).on('popupclose', (ev) => {
  					if (ev.popup._svObj) {
  						ev.popup._svObj.$destroy();
  						delete ev.popup._svObj;
  					}
  				});
  		};

  	fetch('./static/rub.geojson', {}).then(req => req.json())
  		.then(json => {
  			let arr = json.map(parseItem);
  			Rub1._group = L$f.layerGroup(arr);
  			Rub1.addLayer(Rub1._group);
  // console.log('json', json);

  		});
  });

  /* src\DtpPopupRub.svelte generated by Svelte v3.20.1 */

  const { console: console_1$6 } = globals;
  const file$9 = "src\\DtpPopupRub.svelte";

  function get_each_context$7(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[5] = list[i];
  	child_ctx[7] = i;
  	return child_ctx;
  }

  function get_each_context_1$5(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[5] = list[i];
  	child_ctx[7] = i;
  	return child_ctx;
  }

  // (61:4) {#each complexes as pt1, index}
  function create_each_block_1$5(ctx) {
  	let button;
  	let t_value = /*pt1*/ ctx[5].complex_name + "";
  	let t;
  	let button_class_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			button = element("button");
  			t = text(t_value);
  			attr_dev(button, "class", button_class_value = "tab " + /*index*/ ctx[7] + " " + (/*index*/ ctx[7] === 0 ? "active" : "") + " svelte-h8luxq");
  			add_location(button, file$9, 61, 5, 1760);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, button, anchor);
  			append_dev(button, t);
  			if (remount) dispose();
  			dispose = listen_dev(button, "click", /*onClick*/ ctx[2], false, false, false);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(button);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_1$5.name,
  		type: "each",
  		source: "(61:4) {#each complexes as pt1, index}",
  		ctx
  	});

  	return block;
  }

  // (64:4) {#each complexes as pt1, index}
  function create_each_block$7(ctx) {
  	let table;
  	let tr0;
  	let td0;
  	let td1;
  	let t1_value = /*pt1*/ ctx[5].complex_name + "";
  	let t1;
  	let t2;
  	let t3_value = /*pt1*/ ctx[5].complex_sid + "";
  	let t3;
  	let t4;
  	let t5;
  	let tr1;
  	let td2;
  	let td3;
  	let t7_value = /*pt1*/ ctx[5].complex_model_name + "";
  	let t7;
  	let t8;
  	let tr2;
  	let td4;
  	let td5;
  	let t10_value = /*pt1*/ ctx[5].complex_type_name + "";
  	let t10;
  	let t11;
  	let tr3;
  	let td6;
  	let td7;
  	let t13_value = (/*pt1*/ ctx[5].cafap_status || "") + "";
  	let t13;
  	let t14;
  	let table_class_value;

  	const block = {
  		c: function create() {
  			table = element("table");
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Комплекс:";
  			td1 = element("td");
  			t1 = text(t1_value);
  			t2 = text(" (id: ");
  			t3 = text(t3_value);
  			t4 = text(")");
  			t5 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Модель:";
  			td3 = element("td");
  			t7 = text(t7_value);
  			t8 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Тип:";
  			td5 = element("td");
  			t10 = text(t10_value);
  			t11 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Работоспособность:";
  			td7 = element("td");
  			t13 = text(t13_value);
  			t14 = space();
  			attr_dev(td0, "class", "first svelte-h8luxq");
  			add_location(td0, file$9, 65, 10, 1990);
  			add_location(td1, file$9, 65, 42, 2022);
  			add_location(tr0, file$9, 65, 6, 1986);
  			attr_dev(td2, "class", "first svelte-h8luxq");
  			add_location(td2, file$9, 66, 10, 2089);
  			add_location(td3, file$9, 66, 40, 2119);
  			add_location(tr1, file$9, 66, 6, 2085);
  			attr_dev(td4, "class", "first svelte-h8luxq");
  			add_location(td4, file$9, 67, 10, 2168);
  			add_location(td5, file$9, 67, 37, 2195);
  			add_location(tr2, file$9, 67, 6, 2164);
  			attr_dev(td6, "class", "first svelte-h8luxq");
  			add_location(td6, file$9, 68, 10, 2243);
  			add_location(td7, file$9, 68, 51, 2284);
  			add_location(tr3, file$9, 68, 6, 2239);
  			attr_dev(table, "class", table_class_value = "tabCont " + /*index*/ ctx[7] + " " + (/*index*/ ctx[7] === 0 ? "" : "hidden") + " svelte-h8luxq");
  			add_location(table, file$9, 64, 5, 1918);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, table, anchor);
  			append_dev(table, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, td1);
  			append_dev(td1, t1);
  			append_dev(td1, t2);
  			append_dev(td1, t3);
  			append_dev(td1, t4);
  			append_dev(table, t5);
  			append_dev(table, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, td3);
  			append_dev(td3, t7);
  			append_dev(table, t8);
  			append_dev(table, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, td5);
  			append_dev(td5, t10);
  			append_dev(table, t11);
  			append_dev(table, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, td7);
  			append_dev(td7, t13);
  			append_dev(table, t14);
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(table);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$7.name,
  		type: "each",
  		source: "(64:4) {#each complexes as pt1, index}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$9(ctx) {
  	let div2;
  	let div0;
  	let t0;
  	let t1_value = (/*prp*/ ctx[0].id || /*prp*/ ctx[0].line_id) + "";
  	let t1;
  	let t2;
  	let t3;
  	let div1;
  	let table;
  	let tbody;
  	let tr0;
  	let td0;
  	let t5;
  	let td1;
  	let t6_value = (/*prp*/ ctx[0].stage_name || "") + "";
  	let t6;
  	let t7;
  	let tr1;
  	let td2;
  	let t9;
  	let td3;
  	let t10_value = (/*prp*/ ctx[0].road_name || "") + "";
  	let t10;
  	let t11;
  	let tr2;
  	let td4;
  	let t13;
  	let td5;
  	let t14_value = /*prp*/ ctx[0].lat + "";
  	let t14;
  	let t15;
  	let t16_value = /*prp*/ ctx[0].lon + "";
  	let t16;
  	let t17;
  	let span;
  	let t18;
  	let tr3;
  	let td6;
  	let t20;
  	let td7;
  	let t21_value = (/*prp*/ ctx[0].address || "") + "";
  	let t21;
  	let t22;
  	let tr4;
  	let td8;
  	let t24;
  	let td9;
  	let t26;
  	let tr5;
  	let td10;
  	let t27;
  	let dispose;
  	let each_value_1 = /*complexes*/ ctx[3];
  	validate_each_argument(each_value_1);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks_1[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
  	}

  	let each_value = /*complexes*/ ctx[3];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
  	}

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			t0 = text("Рубеж (id: ");
  			t1 = text(t1_value);
  			t2 = text(")");
  			t3 = space();
  			div1 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Этап:";
  			t5 = space();
  			td1 = element("td");
  			t6 = text(t6_value);
  			t7 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Дорога:";
  			t9 = space();
  			td3 = element("td");
  			t10 = text(t10_value);
  			t11 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Координаты:";
  			t13 = space();
  			td5 = element("td");
  			t14 = text(t14_value);
  			t15 = space();
  			t16 = text(t16_value);
  			t17 = space();
  			span = element("span");
  			t18 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Адрес:";
  			t20 = space();
  			td7 = element("td");
  			t21 = text(t21_value);
  			t22 = space();
  			tr4 = element("tr");
  			td8 = element("td");
  			td8.textContent = "Комплексов:";
  			t24 = space();
  			td9 = element("td");
  			td9.textContent = `${/*complexes*/ ctx[3].length}`;
  			t26 = space();
  			tr5 = element("tr");
  			td10 = element("td");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t27 = space();

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$9, 34, 2, 1007);
  			attr_dev(td0, "class", "first svelte-h8luxq");
  			add_location(td0, file$9, 39, 5, 1146);
  			add_location(td1, file$9, 40, 5, 1180);
  			add_location(tr0, file$9, 38, 3, 1136);
  			attr_dev(td2, "class", "first svelte-h8luxq");
  			add_location(td2, file$9, 43, 5, 1234);
  			add_location(td3, file$9, 44, 5, 1270);
  			add_location(tr1, file$9, 42, 3, 1224);
  			attr_dev(td4, "class", "first svelte-h8luxq");
  			add_location(td4, file$9, 47, 5, 1323);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$9, 48, 29, 1387);
  			add_location(td5, file$9, 48, 5, 1363);
  			add_location(tr2, file$9, 46, 3, 1313);
  			attr_dev(td6, "class", "first svelte-h8luxq");
  			add_location(td6, file$9, 51, 5, 1515);
  			add_location(td7, file$9, 52, 5, 1550);
  			add_location(tr3, file$9, 50, 3, 1505);
  			attr_dev(td8, "class", "first svelte-h8luxq");
  			add_location(td8, file$9, 55, 5, 1601);
  			add_location(td9, file$9, 56, 5, 1641);
  			add_location(tr4, file$9, 54, 3, 1591);
  			attr_dev(td10, "class", "tabs svelte-h8luxq");
  			attr_dev(td10, "colspan", "2");
  			add_location(td10, file$9, 59, 5, 1691);
  			add_location(tr5, file$9, 58, 3, 1681);
  			add_location(tbody, file$9, 37, 3, 1125);
  			attr_dev(table, "class", "table svelte-h8luxq");
  			add_location(table, file$9, 36, 4, 1100);
  			attr_dev(div1, "class", "featureCont");
  			add_location(div1, file$9, 35, 2, 1070);
  			attr_dev(div2, "class", "mvsPopup svelte-h8luxq");
  			add_location(div2, file$9, 33, 1, 982);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div0, t0);
  			append_dev(div0, t1);
  			append_dev(div0, t2);
  			append_dev(div2, t3);
  			append_dev(div2, div1);
  			append_dev(div1, table);
  			append_dev(table, tbody);
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t5);
  			append_dev(tr0, td1);
  			append_dev(td1, t6);
  			append_dev(tbody, t7);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t9);
  			append_dev(tr1, td3);
  			append_dev(td3, t10);
  			append_dev(tbody, t11);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t13);
  			append_dev(tr2, td5);
  			append_dev(td5, t14);
  			append_dev(td5, t15);
  			append_dev(td5, t16);
  			append_dev(td5, t17);
  			append_dev(td5, span);
  			append_dev(tbody, t18);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, t20);
  			append_dev(tr3, td7);
  			append_dev(td7, t21);
  			append_dev(tbody, t22);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td8);
  			append_dev(tr4, t24);
  			append_dev(tr4, td9);
  			append_dev(tbody, t26);
  			append_dev(tbody, tr5);
  			append_dev(tr5, td10);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(td10, null);
  			}

  			append_dev(td10, t27);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(td10, null);
  			}

  			if (remount) dispose();
  			dispose = listen_dev(span, "click", /*copyParent*/ ctx[1], false, false, false);
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 1 && t1_value !== (t1_value = (/*prp*/ ctx[0].id || /*prp*/ ctx[0].line_id) + "")) set_data_dev(t1, t1_value);
  			if (dirty & /*prp*/ 1 && t6_value !== (t6_value = (/*prp*/ ctx[0].stage_name || "") + "")) set_data_dev(t6, t6_value);
  			if (dirty & /*prp*/ 1 && t10_value !== (t10_value = (/*prp*/ ctx[0].road_name || "") + "")) set_data_dev(t10, t10_value);
  			if (dirty & /*prp*/ 1 && t14_value !== (t14_value = /*prp*/ ctx[0].lat + "")) set_data_dev(t14, t14_value);
  			if (dirty & /*prp*/ 1 && t16_value !== (t16_value = /*prp*/ ctx[0].lon + "")) set_data_dev(t16, t16_value);
  			if (dirty & /*prp*/ 1 && t21_value !== (t21_value = (/*prp*/ ctx[0].address || "") + "")) set_data_dev(t21, t21_value);

  			if (dirty & /*onClick, complexes*/ 12) {
  				each_value_1 = /*complexes*/ ctx[3];
  				validate_each_argument(each_value_1);
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_1$5(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(td10, t27);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_1.length;
  			}

  			if (dirty & /*complexes*/ 8) {
  				each_value = /*complexes*/ ctx[3];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$7(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$7(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(td10, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$9.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$9($$self, $$props, $$invalidate) {
  	let { prp } = $$props;
  	let current = 0;

  	const copyParent = ev => {
  		navigator.clipboard.writeText(ev.target.parentNode.textContent).catch(err => {
  			console.log("Something went wrong", err);
  		});
  	};

  	const onClick = ev => {
  		let target = ev.target,
  			arr = (/tab (\d)/).exec(target.className),
  			nm = arr && arr.length === 2 ? arr[1] : 0,
  			prn = target.parentNode;

  		for (let i = 0, len = prn.childNodes.length; i < len; i++) {
  			let node = prn.childNodes[i];

  			if (node.classList) {
  				let active = node.classList.contains(nm);

  				if (node.tagName === "BUTTON") {
  					node.classList[active ? "add" : "remove"]("active");
  				} else if (node.tagName === "TABLE") {
  					node.classList[active ? "remove" : "add"]("hidden");
  				}
  			}
  		}
  	}; // let target = ev.target.classList.remove
  	// console.log('setComplex ', prn.childNodes);

  	let complexes = prp && prp.list_complex ? prp.list_complex : [];
  	console.log("complexes ", complexes);
  	const writable_props = ["prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<DtpPopupRub> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupRub", $$slots, []);

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({
  		prp,
  		current,
  		copyParent,
  		onClick,
  		complexes
  	});

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("current" in $$props) current = $$props.current;
  		if ("complexes" in $$props) $$invalidate(3, complexes = $$props.complexes);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [prp, copyParent, onClick, complexes];
  }

  class DtpPopupRub extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$9, create_fragment$9, safe_not_equal, { prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupRub",
  			options,
  			id: create_fragment$9.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$6.warn("<DtpPopupRub> was created without expected prop 'prp'");
  		}
  	}

  	get prp() {
  		throw new Error("<DtpPopupRub>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupRub>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$g = window.L;

  const popup$b = L$g.popup();
  const popup1$8 = L$g.popup({minWidth: 200});
  let argFilters$b;
  let prefix$2 = 'https://dtp.mvs.group/scripts/rubez_dev/';

  const setPopup$4 = function (props) {
  	let cont = L$g.DomUtil.create('div'),
  		id = props.line_sid;
  	
  	fetch(prefix$2 + 'rubez-complex-' + id + '.txt', {}).then(req => req.json())
  		.then(json => {
  			// console.log('json', json);
  			new DtpPopupRub({
  				target: cont,
  				props: {
  					prp: json[0]
  				}
  			});
  			popup$b.setContent(cont);
  		});

  	popup$b.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const Rub = L$g.featureGroup([]);
  Rub.setFilter = arg => {
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	if (!Rub._map) { return; }
  	Rub.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$b = arg;
  	Rub._argFilters = argFilters$b;

  	let arr = [];
  	if (Rub._group) {
  		Rub._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$b.forEach(ft => {
  				if (ft.type === 'comp') {
  					if (prp.rub_flag) {
  						if (ft.zn.on) { cnt++; }
  					} else {
  						if (ft.zn.off) { cnt++; }
  					}
  				}
  			});
  			if (cnt === argFilters$b.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		Rub.addLayer(L$g.layerGroup(arr));
  		// DtpHearths._heat.setData({
  			// max: 8,
  			// data: DtpHearths._heatData
  		// });
  	}
  };

  Rub.on('remove', () => {
  	Rub.clearLayers();
  }).on('add', ev => {
  	let opt = {road: {}, bad: []},
  		arr = [],
  		line_sid = {},
  		parseItem = (prp) => {
  			let list_bounds = L$g.latLngBounds(),
  				// latlngs = [],
  				stroke = false,
  				fillColor = 'gray';

  			if (prp.rub_flag) {
  				fillColor = '#00FF00';
  			}
  			if (line_sid[prp.line_sid]) {
  				console.log('___Дубль____', prp);
  			} else {
  				line_sid[prp.line_sid] = prp;
  			}
  			if (!prp.lat || !prp.lon) {
  				opt.bad.push(prp);
  				// console.log('_______', prp);
  				return;
  				// prp.lat = prp.lon = 0;
  			}

  			let coords = prp.coords || {lat: prp.lat, lon: prp.lon},
  				latlng = L$g.latLng(coords.lat, coords.lon);

  			list_bounds.extend(latlng);

  			arr.push(new CirclePoint(L$g.latLng(coords.lat, coords.lon), {
  					// cluster: it,
  					props: prp,
  					radius: 6,
  					zIndexOffset: 50000,
  					path: 'camera',
  					stroke: stroke,
  					fillColor: fillColor,
  					// renderer: renderer
  				}).bindPopup(popup$b)
  				.on('popupopen', (ev) => {

  					setPopup$4(ev.target.options.props);
  					ev.target.bringToBack();
  					// console.log('popupopen', ev);
  				}).on('popupclose', (ev) => {
  					if (ev.popup._svObj) {
  						ev.popup._svObj.$destroy();
  						delete ev.popup._svObj;
  					}
  				})
  			);
  		};

  	fetch(prefix$2 + 'rubez.txt', {}).then(req => req.json())
  		.then(json => {
  			json.forEach(parseItem);
  			Rub._group = L$g.layerGroup(arr);
  			Rub.addLayer(Rub._group);
  			console.log('opt', opt);

  		});
  });

  /* src\MeasuresPopup.svelte generated by Svelte v3.20.1 */

  const { console: console_1$7 } = globals;
  const file$a = "src\\MeasuresPopup.svelte";

  function create_fragment$a(ctx) {
  	let div2;
  	let div0;
  	let t0;
  	let br;
  	let t1;
  	let t2_value = (/*prp*/ ctx[0].kind || "") + "";
  	let t2;
  	let t3;
  	let t4;
  	let div1;
  	let table;
  	let tbody;
  	let tr0;
  	let td0;
  	let t6;
  	let td1;
  	let t7_value = (/*prp*/ ctx[0].type || "") + "";
  	let t7;
  	let t8;
  	let tr1;
  	let td2;
  	let t10;
  	let td3;
  	let t11_value = (/*prp*/ ctx[0].id || "") + "";
  	let t11;
  	let t12;
  	let tr2;
  	let td4;
  	let t14;
  	let td5;
  	let t15_value = (/*prp*/ ctx[0].status || "") + "";
  	let t15;
  	let t16;
  	let tr3;
  	let td6;
  	let t18;
  	let td7;
  	let t19_value = /*getDate*/ ctx[3](/*prp*/ ctx[0].date_created) + "";
  	let t19;
  	let t20;
  	let tr4;
  	let td8;
  	let t22;
  	let td9;
  	let t23_value = /*getDate*/ ctx[3](/*prp*/ ctx[0].date_finish_fact) + "";
  	let t23;
  	let t24;
  	let tr5;
  	let td10;
  	let t26;
  	let td11;
  	let t27_value = /*coords*/ ctx[2].lat + "";
  	let t27;
  	let t28;
  	let t29_value = /*coords*/ ctx[2].lon + "";
  	let t29;
  	let t30;
  	let span;
  	let t31;
  	let tr6;
  	let td12;
  	let t33;
  	let td13;
  	let t34_value = (/*prp*/ ctx[0].id_dtp || "") + "";
  	let t34;
  	let t35;
  	let tr7;
  	let td14;
  	let t37;
  	let td15;
  	let t38_value = (/*prp*/ ctx[0].description || "") + "";
  	let t38;
  	let dispose;

  	const block = {
  		c: function create() {
  			div2 = element("div");
  			div0 = element("div");
  			t0 = text("Мероприятие");
  			br = element("br");
  			t1 = text("(");
  			t2 = text(t2_value);
  			t3 = text(")");
  			t4 = space();
  			div1 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Тип мероприятия:";
  			t6 = space();
  			td1 = element("td");
  			t7 = text(t7_value);
  			t8 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "ID:";
  			t10 = space();
  			td3 = element("td");
  			t11 = text(t11_value);
  			t12 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Статус:";
  			t14 = space();
  			td5 = element("td");
  			t15 = text(t15_value);
  			t16 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Дата добавления:";
  			t18 = space();
  			td7 = element("td");
  			t19 = text(t19_value);
  			t20 = space();
  			tr4 = element("tr");
  			td8 = element("td");
  			td8.textContent = "Дата завершения:";
  			t22 = space();
  			td9 = element("td");
  			t23 = text(t23_value);
  			t24 = space();
  			tr5 = element("tr");
  			td10 = element("td");
  			td10.textContent = "Координаты:";
  			t26 = space();
  			td11 = element("td");
  			t27 = text(t27_value);
  			t28 = space();
  			t29 = text(t29_value);
  			t30 = space();
  			span = element("span");
  			t31 = space();
  			tr6 = element("tr");
  			td12 = element("td");
  			td12.textContent = "ID ДТП СКПДИ:";
  			t33 = space();
  			td13 = element("td");
  			t34 = text(t34_value);
  			t35 = space();
  			tr7 = element("tr");
  			td14 = element("td");
  			td14.textContent = "Описание:";
  			t37 = space();
  			td15 = element("td");
  			t38 = text(t38_value);
  			add_location(br, file$a, 18, 32, 513);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$a, 18, 2, 483);
  			attr_dev(td0, "class", "first svelte-h8luxq");
  			add_location(td0, file$a, 23, 5, 622);
  			add_location(td1, file$a, 24, 5, 667);
  			add_location(tr0, file$a, 22, 3, 612);
  			attr_dev(td2, "class", "first svelte-h8luxq");
  			add_location(td2, file$a, 27, 5, 715);
  			add_location(td3, file$a, 28, 5, 747);
  			add_location(tr1, file$a, 26, 3, 705);
  			attr_dev(td4, "class", "first svelte-h8luxq");
  			add_location(td4, file$a, 31, 5, 793);
  			add_location(td5, file$a, 32, 5, 829);
  			add_location(tr2, file$a, 30, 3, 783);
  			attr_dev(td6, "class", "first svelte-h8luxq");
  			add_location(td6, file$a, 35, 5, 879);
  			add_location(td7, file$a, 36, 5, 924);
  			add_location(tr3, file$a, 34, 3, 869);
  			attr_dev(td8, "class", "first svelte-h8luxq");
  			add_location(td8, file$a, 39, 5, 983);
  			add_location(td9, file$a, 40, 5, 1028);
  			add_location(tr4, file$a, 38, 3, 973);
  			attr_dev(td10, "class", "first svelte-h8luxq");
  			add_location(td10, file$a, 43, 5, 1091);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$a, 44, 35, 1161);
  			add_location(td11, file$a, 44, 5, 1131);
  			add_location(tr5, file$a, 42, 3, 1081);
  			attr_dev(td12, "class", "first svelte-h8luxq");
  			add_location(td12, file$a, 47, 5, 1289);
  			add_location(td13, file$a, 48, 5, 1331);
  			add_location(tr6, file$a, 46, 3, 1279);
  			attr_dev(td14, "class", "first svelte-h8luxq");
  			add_location(td14, file$a, 51, 5, 1381);
  			add_location(td15, file$a, 52, 5, 1419);
  			add_location(tr7, file$a, 50, 3, 1371);
  			add_location(tbody, file$a, 21, 3, 601);
  			attr_dev(table, "class", "table svelte-h8luxq");
  			add_location(table, file$a, 20, 4, 576);
  			attr_dev(div1, "class", "featureCont");
  			add_location(div1, file$a, 19, 2, 546);
  			attr_dev(div2, "class", "mvsPopup svelte-h8luxq");
  			add_location(div2, file$a, 17, 1, 458);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div2, anchor);
  			append_dev(div2, div0);
  			append_dev(div0, t0);
  			append_dev(div0, br);
  			append_dev(div0, t1);
  			append_dev(div0, t2);
  			append_dev(div0, t3);
  			append_dev(div2, t4);
  			append_dev(div2, div1);
  			append_dev(div1, table);
  			append_dev(table, tbody);
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t6);
  			append_dev(tr0, td1);
  			append_dev(td1, t7);
  			append_dev(tbody, t8);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t10);
  			append_dev(tr1, td3);
  			append_dev(td3, t11);
  			append_dev(tbody, t12);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t14);
  			append_dev(tr2, td5);
  			append_dev(td5, t15);
  			append_dev(tbody, t16);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, t18);
  			append_dev(tr3, td7);
  			append_dev(td7, t19);
  			append_dev(tbody, t20);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td8);
  			append_dev(tr4, t22);
  			append_dev(tr4, td9);
  			append_dev(td9, t23);
  			append_dev(tbody, t24);
  			append_dev(tbody, tr5);
  			append_dev(tr5, td10);
  			append_dev(tr5, t26);
  			append_dev(tr5, td11);
  			append_dev(td11, t27);
  			append_dev(td11, t28);
  			append_dev(td11, t29);
  			append_dev(td11, t30);
  			append_dev(td11, span);
  			append_dev(tbody, t31);
  			append_dev(tbody, tr6);
  			append_dev(tr6, td12);
  			append_dev(tr6, t33);
  			append_dev(tr6, td13);
  			append_dev(td13, t34);
  			append_dev(tbody, t35);
  			append_dev(tbody, tr7);
  			append_dev(tr7, td14);
  			append_dev(tr7, t37);
  			append_dev(tr7, td15);
  			append_dev(td15, t38);
  			if (remount) dispose();
  			dispose = listen_dev(span, "click", /*copyParent*/ ctx[1], false, false, false);
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 1 && t2_value !== (t2_value = (/*prp*/ ctx[0].kind || "") + "")) set_data_dev(t2, t2_value);
  			if (dirty & /*prp*/ 1 && t7_value !== (t7_value = (/*prp*/ ctx[0].type || "") + "")) set_data_dev(t7, t7_value);
  			if (dirty & /*prp*/ 1 && t11_value !== (t11_value = (/*prp*/ ctx[0].id || "") + "")) set_data_dev(t11, t11_value);
  			if (dirty & /*prp*/ 1 && t15_value !== (t15_value = (/*prp*/ ctx[0].status || "") + "")) set_data_dev(t15, t15_value);
  			if (dirty & /*prp*/ 1 && t19_value !== (t19_value = /*getDate*/ ctx[3](/*prp*/ ctx[0].date_created) + "")) set_data_dev(t19, t19_value);
  			if (dirty & /*prp*/ 1 && t23_value !== (t23_value = /*getDate*/ ctx[3](/*prp*/ ctx[0].date_finish_fact) + "")) set_data_dev(t23, t23_value);
  			if (dirty & /*prp*/ 1 && t34_value !== (t34_value = (/*prp*/ ctx[0].id_dtp || "") + "")) set_data_dev(t34, t34_value);
  			if (dirty & /*prp*/ 1 && t38_value !== (t38_value = (/*prp*/ ctx[0].description || "") + "")) set_data_dev(t38, t38_value);
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div2);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$a.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$a($$self, $$props, $$invalidate) {
  	let { prp } = $$props;

  	const copyParent = ev => {
  		navigator.clipboard.writeText(ev.target.parentNode.textContent).catch(err => {
  			console.log("Something went wrong", err);
  		});
  	};

  	let coords = prp.coords[0] || { lat: prp.lat, lon: prp.lon };

  	const getDate = time => {
  		if (!time) {
  			return "";
  		}

  		let d = new Date(time * 1000);
  		return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  	};

  	const writable_props = ["prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<MeasuresPopup> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("MeasuresPopup", $$slots, []);

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({ prp, copyParent, coords, getDate });

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("coords" in $$props) $$invalidate(2, coords = $$props.coords);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [prp, copyParent, coords, getDate];
  }

  class MeasuresPopup extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$a, create_fragment$a, safe_not_equal, { prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "MeasuresPopup",
  			options,
  			id: create_fragment$a.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$7.warn("<MeasuresPopup> was created without expected prop 'prp'");
  		}
  	}

  	get prp() {
  		throw new Error("<MeasuresPopup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<MeasuresPopup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$h = window.L;

  const popup$c = L$h.popup();
  //const popup1 = L.popup({minWidth: 200});
  let argFilters$c;
  let prefix$3 = 'https://dtp.mvs.group/scripts/events_dev/get_event.txt';

  const setPopup$5 = function (props) {
  	let cont = L$h.DomUtil.create('div'),
  		id = props.id;
  	new MeasuresPopup({
  		target: cont,
  		props: {
  			prp: props
  		}
  	});
  	popup$c.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const Measures = L$h.featureGroup([]);
  Measures.setFilter = arg => {
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	if (!Measures._map) { return; }
  	Measures.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$c = arg;
  	Measures._argFilters = argFilters$c;

  	let arr = [];
  	if (Measures._group) {
  		Measures._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$c.forEach(ft => {
  				if (ft.type === 'measures_type') {
  					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.type).length) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (prp.id_dtp == ft.zn) {
  						cnt++;
  					}
  				} else if (ft.type === 'date') {
  					if (prp.date_created >= ft.zn[0] && prp.date_created < ft.zn[1]) {
  						cnt++;
  					}
  				}
  			});
  			if (cnt === argFilters$c.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		Measures.addLayer(L$h.layerGroup(arr));
  		// DtpHearths._heat.setData({
  			// max: 8,
  			// data: DtpHearths._heatData
  		// });
  	}
  };

  Measures.on('remove', () => {
  	Measures.clearLayers();
  }).on('add', ev => {
  	let opt = {type: {}, bad: []},
  		arr = [],
  		line_sid = {},
  		parseItem = (prp) => {
  			let list_bounds = L$h.latLngBounds(),
  				// latlngs = [],
  				stroke = false,
  				fillColor = 'gray';

  			if (prp.rub_flag) {
  				fillColor = '#00FF00';
  			}
  			if (line_sid[prp.id]) {
  				console.log('___Дубль____', prp);
  			} else {
  				line_sid[prp.id] = prp;
  			}

  			let coords = prp.coords[0] || {lat: prp.lat, lon: prp.lon},
  				latlng = L$h.latLng(coords.lat, coords.lon);

  			if (!coords.lat || !coords.lon || !prp.id_dtp) {
  				opt.bad.push(prp);
  				// console.log('_______', prp);
  				return;
  				// prp.lat = prp.lon = 0;
  			}
  			let ptype = prp.type || ' ';
  prp.type = ptype;
  			let type = opt.type[ptype] ;
  			if (!type) {
  				type = 1;
  			} else {
  				type++;
  			}
  			opt.type[ptype] = type;
  			// list_bounds.extend(latlng);

  			arr.push(new CirclePoint(latlng, {
  					// cluster: it,
  					props: prp,
  					radius: 9,
  					zIndexOffset: 50000,
  					// path: 'measures',
  					stroke: stroke,
  					fillColor: fillColor,
  					// renderer: renderer
  				}).bindPopup(popup$c)
  				.on('popupopen', (ev) => {

  					setPopup$5(ev.target.options.props);
  					ev.target.bringToBack();
  					// console.log('popupopen', ev);
  				}).on('popupclose', (ev) => {
  					if (ev.popup._svObj) {
  						ev.popup._svObj.$destroy();
  						delete ev.popup._svObj;
  					}
  				})
  			);
  		};

  	fetch(prefix$3, {}).then(req => req.json())
  		.then(json => {
  			json.forEach(parseItem);
  			Measures._opt = opt;
  			Measures._group = L$h.layerGroup(arr);
  			Measures.addLayer(Measures._group);
  			console.log('opt', opt);

  		});
  });

  /* src\DtpPopupGibddRub.svelte generated by Svelte v3.20.1 */

  const { console: console_1$8 } = globals;
  const file$b = "src\\DtpPopupGibddRub.svelte";

  function get_each_context$8(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[9] = list[i];
  	child_ctx[11] = i;
  	return child_ctx;
  }

  function get_each_context_2$4(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[14] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$6(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[9] = list[i];
  	return child_ctx;
  }

  // (106:6) {#if pt.ts}
  function create_if_block_7$2(ctx) {
  	let li;
  	let t_value = /*pt*/ ctx[9].ts + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$b, 105, 17, 2586);
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
  		id: create_if_block_7$2.name,
  		type: "if",
  		source: "(106:6) {#if pt.ts}",
  		ctx
  	});

  	return block;
  }

  // (108:7) {#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}
  function create_if_block_6$2(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[14].k_uch + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$b, 107, 52, 2688);
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
  		id: create_if_block_6$2.name,
  		type: "if",
  		source: "(108:7) {#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}",
  		ctx
  	});

  	return block;
  }

  // (109:7) {#if pt1.npdd}
  function create_if_block_5$2(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[14].npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$b, 108, 21, 2735);
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
  		id: create_if_block_5$2.name,
  		type: "if",
  		source: "(109:7) {#if pt1.npdd}",
  		ctx
  	});

  	return block;
  }

  // (110:7) {#if pt1.sop_npdd}
  function create_if_block_4$3(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[14].sop_npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$b, 109, 25, 2785);
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
  		id: create_if_block_4$3.name,
  		type: "if",
  		source: "(110:7) {#if pt1.sop_npdd}",
  		ctx
  	});

  	return block;
  }

  // (107:6) {#each pt.arr as pt1}
  function create_each_block_2$4(ctx) {
  	let t0;
  	let t1;
  	let if_block2_anchor;
  	let if_block0 = /*pt1*/ ctx[14].k_uch && (/*pt1*/ ctx[14].npdd || /*pt1*/ ctx[14].sop_npdd) && create_if_block_6$2(ctx);
  	let if_block1 = /*pt1*/ ctx[14].npdd && create_if_block_5$2(ctx);
  	let if_block2 = /*pt1*/ ctx[14].sop_npdd && create_if_block_4$3(ctx);

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
  			if (/*pt1*/ ctx[14].k_uch && (/*pt1*/ ctx[14].npdd || /*pt1*/ ctx[14].sop_npdd)) if_block0.p(ctx, dirty);
  			if (/*pt1*/ ctx[14].npdd) if_block1.p(ctx, dirty);
  			if (/*pt1*/ ctx[14].sop_npdd) if_block2.p(ctx, dirty);
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
  		id: create_each_block_2$4.name,
  		type: "each",
  		source: "(107:6) {#each pt.arr as pt1}",
  		ctx
  	});

  	return block;
  }

  // (105:5) {#each tsInfoArr as pt}
  function create_each_block_1$6(ctx) {
  	let t;
  	let each_1_anchor;
  	let if_block = /*pt*/ ctx[9].ts && create_if_block_7$2(ctx);
  	let each_value_2 = /*pt*/ ctx[9].arr;
  	validate_each_argument(each_value_2);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_2.length; i += 1) {
  		each_blocks[i] = create_each_block_2$4(get_each_context_2$4(ctx, each_value_2, i));
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
  			if (/*pt*/ ctx[9].ts) if_block.p(ctx, dirty);

  			if (dirty & /*tsInfoArr*/ 16) {
  				each_value_2 = /*pt*/ ctx[9].arr;
  				validate_each_argument(each_value_2);
  				let i;

  				for (i = 0; i < each_value_2.length; i += 1) {
  					const child_ctx = get_each_context_2$4(ctx, each_value_2, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_2$4(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_2.length;
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
  		id: create_each_block_1$6.name,
  		type: "each",
  		source: "(105:5) {#each tsInfoArr as pt}",
  		ctx
  	});

  	return block;
  }

  // (119:4) {#if prp.spog}
  function create_if_block_3$3(ctx) {
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
  			add_location(div0, file$b, 120, 6, 2998);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$b, 120, 40, 3032);
  			add_location(div2, file$b, 119, 5, 2986);
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
  		id: create_if_block_3$3.name,
  		type: "if",
  		source: "(119:4) {#if prp.spog}",
  		ctx
  	});

  	return block;
  }

  // (124:4) {#if prp.s_pch}
  function create_if_block_2$3(ctx) {
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
  			add_location(div0, file$b, 125, 6, 3126);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$b, 125, 42, 3162);
  			add_location(div2, file$b, 124, 5, 3114);
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
  		id: create_if_block_2$3.name,
  		type: "if",
  		source: "(124:4) {#if prp.s_pch}",
  		ctx
  	});

  	return block;
  }

  // (129:4) {#if prp.osv}
  function create_if_block_1$4(ctx) {
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
  			add_location(div0, file$b, 130, 6, 3255);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$b, 130, 46, 3295);
  			add_location(div2, file$b, 129, 5, 3243);
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
  		id: create_if_block_1$4.name,
  		type: "if",
  		source: "(129:4) {#if prp.osv}",
  		ctx
  	});

  	return block;
  }

  // (134:4) {#if prp.ndu}
  function create_if_block$5(ctx) {
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
  			add_location(div0, file$b, 135, 6, 3386);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$b, 135, 46, 3426);
  			add_location(div2, file$b, 134, 5, 3374);
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
  		id: create_if_block$5.name,
  		type: "if",
  		source: "(134:4) {#if prp.ndu}",
  		ctx
  	});

  	return block;
  }

  // (150:5) {#each (prp.list_rub || []) as pt, index}
  function create_each_block$8(ctx) {
  	let li;
  	let t0_value = /*pt*/ ctx[9].line_id + "";
  	let t0;
  	let t1;
  	let t2_value = /*pt*/ ctx[9].range + "";
  	let t2;
  	let t3;
  	let li_value_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t0 = text(t0_value);
  			t1 = text(" (");
  			t2 = text(t2_value);
  			t3 = text(" м.)");
  			attr_dev(li, "class", "link svelte-vw4d3d");
  			li.value = li_value_value = /*pt*/ ctx[9].line_id;
  			add_location(li, file$b, 150, 6, 3882);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t0);
  			append_dev(li, t1);
  			append_dev(li, t2);
  			append_dev(li, t3);
  			if (remount) dispose();
  			dispose = listen_dev(li, "click", /*showRub*/ ctx[2], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && t0_value !== (t0_value = /*pt*/ ctx[9].line_id + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 1 && t2_value !== (t2_value = /*pt*/ ctx[9].range + "")) set_data_dev(t2, t2_value);

  			if (dirty & /*prp*/ 1 && li_value_value !== (li_value_value = /*pt*/ ctx[9].line_id)) {
  				prop_dev(li, "value", li_value_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$8.name,
  		type: "each",
  		source: "(150:5) {#each (prp.list_rub || []) as pt, index}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$b(ctx) {
  	let div3;
  	let div0;
  	let b0;
  	let t0_value = (/*prp*/ ctx[0].name || /*prp*/ ctx[0].dtvp || "") + "";
  	let t0;
  	let t1;
  	let div2;
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
  	let ul0;
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
  	let t48;
  	let tr9;
  	let td18;
  	let t50;
  	let td19;
  	let div1;
  	let t51;
  	let ul1;
  	let dispose;
  	let each_value_1 = /*tsInfoArr*/ ctx[4];
  	validate_each_argument(each_value_1);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks_1[i] = create_each_block_1$6(get_each_context_1$6(ctx, each_value_1, i));
  	}

  	let if_block0 = /*prp*/ ctx[0].spog && create_if_block_3$3(ctx);
  	let if_block1 = /*prp*/ ctx[0].s_pch && create_if_block_2$3(ctx);
  	let if_block2 = /*prp*/ ctx[0].osv && create_if_block_1$4(ctx);
  	let if_block3 = /*prp*/ ctx[0].ndu && create_if_block$5(ctx);
  	let each_value = /*prp*/ ctx[0].list_rub || [];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
  	}

  	const block = {
  		c: function create() {
  			div3 = element("div");
  			div0 = element("div");
  			b0 = element("b");
  			t0 = text(t0_value);
  			t1 = space();
  			div2 = element("div");
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
  			ul0 = element("ul");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
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
  			t48 = space();
  			tr9 = element("tr");
  			td18 = element("td");
  			td18.textContent = "Рубежи:";
  			t50 = space();
  			td19 = element("td");
  			div1 = element("div");
  			t51 = space();
  			ul1 = element("ul");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			add_location(b0, file$b, 71, 4, 1617);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$b, 70, 2, 1593);
  			attr_dev(td0, "class", "first svelte-vw4d3d");
  			add_location(td0, file$b, 77, 5, 1740);
  			add_location(td1, file$b, 78, 5, 1772);
  			add_location(tr0, file$b, 76, 3, 1730);
  			attr_dev(td2, "class", "first svelte-vw4d3d");
  			add_location(td2, file$b, 81, 5, 1850);
  			add_location(td3, file$b, 82, 5, 1885);
  			add_location(tr1, file$b, 80, 3, 1840);
  			attr_dev(td4, "class", "first svelte-vw4d3d");
  			add_location(td4, file$b, 85, 5, 1953);
  			add_location(b1, file$b, 86, 9, 1994);
  			add_location(b2, file$b, 86, 34, 2019);
  			add_location(td5, file$b, 86, 5, 1990);
  			add_location(tr2, file$b, 84, 3, 1943);
  			attr_dev(td6, "class", "first svelte-vw4d3d");
  			add_location(td6, file$b, 89, 5, 2069);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$b, 90, 29, 2133);
  			add_location(td7, file$b, 90, 5, 2109);
  			add_location(tr3, file$b, 88, 3, 2059);
  			attr_dev(td8, "class", "first svelte-vw4d3d");
  			add_location(td8, file$b, 93, 5, 2261);
  			add_location(td9, file$b, 94, 5, 2301);
  			add_location(tr4, file$b, 92, 3, 2251);
  			attr_dev(td10, "class", "first svelte-vw4d3d");
  			add_location(td10, file$b, 97, 5, 2375);
  			add_location(td11, file$b, 98, 5, 2412);
  			add_location(tr5, file$b, 96, 3, 2365);
  			attr_dev(td12, "class", "first svelte-vw4d3d");
  			add_location(td12, file$b, 101, 14, 2478);
  			add_location(ul0, file$b, 103, 4, 2535);
  			add_location(td13, file$b, 102, 14, 2526);
  			add_location(tr6, file$b, 100, 12, 2459);
  			attr_dev(td14, "class", "first svelte-vw4d3d");
  			add_location(td14, file$b, 116, 14, 2911);
  			add_location(td15, file$b, 117, 14, 2957);
  			add_location(tr7, file$b, 115, 12, 2892);
  			attr_dev(td16, "class", "first svelte-vw4d3d");
  			add_location(td16, file$b, 141, 14, 3542);
  			add_location(b3, file$b, 142, 18, 3612);
  			add_location(td17, file$b, 142, 14, 3608);
  			add_location(tr8, file$b, 140, 12, 3523);
  			attr_dev(td18, "class", "first svelte-vw4d3d");
  			add_location(td18, file$b, 145, 14, 3693);
  			attr_dev(div1, "class", "win leaflet-popup-content-wrapper  svelte-vw4d3d");
  			add_location(div1, file$b, 147, 2, 3745);
  			add_location(ul1, file$b, 148, 4, 3824);
  			add_location(td19, file$b, 146, 14, 3738);
  			add_location(tr9, file$b, 144, 12, 3674);
  			add_location(tbody, file$b, 75, 3, 1719);
  			attr_dev(table, "class", "table");
  			add_location(table, file$b, 74, 4, 1694);
  			attr_dev(div2, "class", "featureCont");
  			add_location(div2, file$b, 73, 2, 1664);
  			attr_dev(div3, "class", "mvsPopup svelte-vw4d3d");
  			add_location(div3, file$b, 69, 3, 1568);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div3, anchor);
  			append_dev(div3, div0);
  			append_dev(div0, b0);
  			append_dev(b0, t0);
  			append_dev(div3, t1);
  			append_dev(div3, div2);
  			append_dev(div2, table);
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
  			append_dev(td13, ul0);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(ul0, null);
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
  			append_dev(tbody, t48);
  			append_dev(tbody, tr9);
  			append_dev(tr9, td18);
  			append_dev(tr9, t50);
  			append_dev(tr9, td19);
  			append_dev(td19, div1);
  			/*div1_binding*/ ctx[8](div1);
  			append_dev(td19, t51);
  			append_dev(td19, ul1);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul1, null);
  			}

  			if (remount) dispose();
  			dispose = listen_dev(span, "click", /*copyParent*/ ctx[3], false, false, false);
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

  			if (dirty & /*tsInfoArr*/ 16) {
  				each_value_1 = /*tsInfoArr*/ ctx[4];
  				validate_each_argument(each_value_1);
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1$6(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_1$6(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(ul0, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_1.length;
  			}

  			if (/*prp*/ ctx[0].spog) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_3$3(ctx);
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
  					if_block1 = create_if_block_2$3(ctx);
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
  					if_block2 = create_if_block_1$4(ctx);
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
  					if_block3 = create_if_block$5(ctx);
  					if_block3.c();
  					if_block3.m(td15, null);
  				}
  			} else if (if_block3) {
  				if_block3.d(1);
  				if_block3 = null;
  			}

  			if (dirty & /*prp*/ 1 && t45_value !== (t45_value = /*prp*/ ctx[0].pog + "")) set_data_dev(t45, t45_value);
  			if (dirty & /*prp*/ 1 && t47_value !== (t47_value = /*prp*/ ctx[0].ran + "")) set_data_dev(t47, t47_value);

  			if (dirty & /*prp, showRub*/ 5) {
  				each_value = /*prp*/ ctx[0].list_rub || [];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$8(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$8(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ul1, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div3);
  			destroy_each(each_blocks_1, detaching);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			if (if_block2) if_block2.d();
  			if (if_block3) if_block3.d();
  			/*div1_binding*/ ctx[8](null);
  			destroy_each(each_blocks, detaching);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_fragment$b.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$b($$self, $$props, $$invalidate) {
  	let { showModal = false } = $$props;
  	let { prp } = $$props;
  	let modal;
  	let disabled = prp.skpdiFiles ? "" : "disabled";
  	let rubCont;

  	afterUpdate(() => {
  		// console.log('the component just updated', showModal, modal);
  		if (showModal) {
  			modal = new Modal({
  					target: document.body,
  					props: { data: prp.skpdiFiles }
  				});

  			modal.$on("close", ev => {
  				modal.$destroy();
  				$$invalidate(5, showModal = false);
  			});
  		}
  	});

  	const showRub = ev => {
  		let id = ev.target.value;
  		console.log("showRub", ev.target.value);
  		$$invalidate(1, rubCont.innerHTML = "", rubCont);
  		let url = "https://dtp.mvs.group/scripts/rubez_dev/rubez-complex-" + id + ".txt";

  		fetch(url, {}).then(req => req.json()).then(json => {
  			// console.log('bindPopup', layer, json, DtpPopup);
  			const app = new DtpPopupRub({ target: rubCont, props: { prp: json[0] } });
  		});
  	};

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

  	console.log("ddddd", prp);
  	const writable_props = ["showModal", "prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$8.warn(`<DtpPopupGibddRub> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupGibddRub", $$slots, []);

  	function div1_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(1, rubCont = $$value);
  		});
  	}

  	$$self.$set = $$props => {
  		if ("showModal" in $$props) $$invalidate(5, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({
  		DtpPopup: DtpPopupRub,
  		afterUpdate,
  		Modal,
  		showModal,
  		prp,
  		modal,
  		disabled,
  		rubCont,
  		showRub,
  		copyParent,
  		tsInfoArr
  	});

  	$$self.$inject_state = $$props => {
  		if ("showModal" in $$props) $$invalidate(5, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("modal" in $$props) modal = $$props.modal;
  		if ("disabled" in $$props) disabled = $$props.disabled;
  		if ("rubCont" in $$props) $$invalidate(1, rubCont = $$props.rubCont);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [
  		prp,
  		rubCont,
  		showRub,
  		copyParent,
  		tsInfoArr,
  		showModal,
  		modal,
  		disabled,
  		div1_binding
  	];
  }

  class DtpPopupGibddRub extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$b, create_fragment$b, safe_not_equal, { showModal: 5, prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupGibddRub",
  			options,
  			id: create_fragment$b.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$8.warn("<DtpPopupGibddRub> was created without expected prop 'prp'");
  		}
  	}

  	get showModal() {
  		throw new Error("<DtpPopupGibddRub>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set showModal(value) {
  		throw new Error("<DtpPopupGibddRub>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	get prp() {
  		throw new Error("<DtpPopupGibddRub>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupGibddRub>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$i = window.L;

  const popup$d = L$i.popup();
  let argFilters$d;
  const setPopup$6 = function (id) {
  	let url = 'https://dtp.mvs.group/scripts/dtprubez_dev/get_stat_gipdd_with_rub_' + id + '.txt';
  	fetch(url, {})
  		.then(req => req.json())
  		.then(json => {
  // console.log('bindPopup', layer, json, DtpPopup);
  			let cont = L$i.DomUtil.create('div');
  			const app = new DtpPopupGibddRub({
  				target: cont,
  				props: {
  					prp: json
  				}
  			});
  			popup$d._svObj = app;
  			popup$d.setContent(cont);
  		});
  	return '';
  };

  // let renderer = L.canvas();
  const DtpGibddRub = L$i.featureGroup([]);
  DtpGibddRub._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
  DtpGibddRub.checkZoom = z => {
  	if (Object.keys(DtpGibddRub._layers).length) {
  		if (z < 12) {
  			DtpGibddRub.setFilter(argFilters$d);
  		}
  	} else if (z > 11) {
  		DtpGibddRub.setFilter(argFilters$d);
  	}
  };
  DtpGibddRub.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	if (!DtpGibddRub._map) { return; }
  	DtpGibddRub.clearLayers();
  	argFilters$d = arg || [];
  	DtpGibddRub._argFilters = argFilters$d;

  	let arr = [], heat = [];
  	if (DtpGibddRub._group && DtpGibddRub._map) {
  		DtpGibddRub._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$d.forEach(ft => {
  				if (ft.type === 'collision_type') {
  					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
  					// if (prp.collision_type === ft.zn) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (prp.id == ft.zn) {
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
  			if (cnt === argFilters$d.length) {
  				arr.push(it);
  				heat.push(it._latlng);
  			}
  		});
  		if (DtpGibddRub._needHeat) {
  			DtpGibddRub._map.addLayer(DtpGibddRub._heat);
  			DtpGibddRub._heat.setLatLngs(heat);
  			DtpGibddRub._heat.setOptions(DtpGibddRub._needHeat);
  			if (DtpGibddRub._map._zoom > 11) {
  				DtpGibddRub.addLayer(L$i.layerGroup(arr));
  			}
  		} else {
  			DtpGibddRub.addLayer(L$i.layerGroup(arr));
  			DtpGibddRub._map.removeLayer(DtpGibddRub._heat);
  		}

  	}
  };

  DtpGibddRub.on('remove', (ev) => {
  	// DtpGibddRub._needHeat = null;
  	DtpGibddRub._map.removeLayer(DtpGibddRub._heat);
  	DtpGibddRub.clearLayers();
  }).on('add', ev => {
  	// console.log('/static/data/dtpskpdi.geojson', ev);
  	DtpGibddRub._heat = L$i.heatLayer([], {
  		// blur: 50,
  		gradient: {0.1: 'blue', 0.4: 'lime', 1: 'red'}
  	});
  	argFilters$d = null;

  	fetch('https://dtp.mvs.group/scripts/dtprubez_dev/get_stat_gipdd_with_rub.txt', {})
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
  				if (!prp.list_rub) { prp.list_rub = []; }

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

  				let latLng = L$i.latLng(prp.lat, prp.lon, stroke ? 1 : 0.5);
  				heat.push(latLng);

  				return new CirclePoint(latLng, {
  					props: prp,
  					radius: 6,
  					// box: true,
  					stroke: stroke,
  					fillColor: fillColor,
  					// renderer: renderer
  				}).bindPopup(popup$d).on('popupopen', (ev) => {
  						setPopup$6(ev.target.options.props.id);
  						ev.target.bringToBack();
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
  				DtpGibddRub.addLayer(DtpGibddRub._heat);
  				DtpGibddRub._heat.setLatLngs(heat);
  				DtpGibddRub._heat.setOptions(DtpGibddRub._needHeat);
  			// }

  			DtpGibddRub._opt = opt;
  			DtpGibddRub._group = L$i.layerGroup(arr);

  			// if (argFilters) {
  				DtpGibddRub.setFilter();
  			// } else 
  			if (DtpGibddRub._map._zoom > 11) {
  				DtpGibddRub.addLayer(DtpGibddRub._group);
  			}
  			DtpGibddRub._refreshFilters();
  		});
  });

  const L$j = window.L;

  const popup$e = L$j.popup();
  let argFilters$e;

  // let renderer = L.canvas();
  const TestGraphQl = L$j.featureGroup([]);
  TestGraphQl._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
  TestGraphQl.checkZoom = z => {
  	if (Object.keys(TestGraphQl._layers).length) {
  		if (z < 12) {
  			TestGraphQl.setFilter(argFilters$e);
  		}
  	} else if (z > 11) {
  		TestGraphQl.setFilter(argFilters$e);
  	}
  };
  TestGraphQl.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	if (!TestGraphQl._map) { return; }
  	TestGraphQl.clearLayers();
  	argFilters$e = arg || [];
  	TestGraphQl._argFilters = argFilters$e;

  	let arr = [], heat = [];
  	if (TestGraphQl._group) {
  		TestGraphQl._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$e.forEach(ft => {
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
  			if (cnt === argFilters$e.length) {
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
  			TestGraphQl.addLayer(L$j.layerGroup(arr));
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

  const L$k = window.L;

  const popup$f = L$k.popup();
  const popup1$9 = L$k.popup({minWidth: 200});
  let argFilters$f;

  const setPopup1$7 = function (props) {
  	let cont = L$k.DomUtil.create('div');
  	new DtpPopupHearths({
  		target: cont,
  		props: {
  			predochag: 1,
  			prp: props
  		}
  	});
  	popup1$9.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const DtpHearthsPicket4 = L$k.featureGroup([]);
  DtpHearthsPicket4.setFilter = arg => {
  	if (!DtpHearthsPicket4._map) { return; }
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	DtpHearthsPicket4.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$f = arg;

  	let arr = [];
  	if (DtpHearthsPicket4._group) {
  		DtpHearthsPicket4._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				cnt = 0;
  			argFilters$f.forEach(ft => {
  				if (ft.type === 'ht') {
  					if (ft.zn[prp.ht]) {
  						cnt++;
  					}
  				} else if (ft.type === 'roads') {
  					if (ft.zn.filter(pt => pt === prp.road).length || (ft.zn.length === 1 && ft.zn[0] === '')) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_dtp') {
  					if (prp.list_dtp.filter(pt => pt.id_skpdi == ft.zn || pt.id_stat == ft.zn).length || !ft.zn.length) {
  						cnt++;
  					}
  				} else if (ft.type === 'id_hearth') {
  					if (ft.zn == prp.id) {
  						cnt++;
  					}
  				} else if (ft.type === 'year') {
  					if (ft.zn[prp.year]) {
  						cnt++;
  					}
  				} else if (ft.type === 'stricken') {
  					let zn = ft.zn;
  					if (!zn) {
  						cnt++;
  					} else if (zn === 1 && !prp.count_stricken && prp.count_lost) {
  						cnt++;								// Только с погибшими
  					} else if (zn === 2 && prp.count_stricken && !prp.count_lost) {
  						cnt++;								// Только с пострадавшими
  					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
  						cnt++;								// С пострадавшими или погибшими
  					} else if (zn === 4 && prp.count_stricken && prp.count_lost) {
  						cnt++;								// С пострадавшими и погибшими
  					}
  				}
  			});
  			if (cnt === argFilters$f.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		DtpHearthsPicket4.addLayer(L$k.layerGroup(arr));
  		// DtpHearths._heat.setData({
  			// max: 8,
  			// data: DtpHearths._heatData
  		// });
  	}
  };

  DtpHearthsPicket4.on('remove', () => {
  	DtpHearthsPicket4.clearLayers();
  }).on('add', ev => {
  	let opt = {road: {}, str_icon_type: {}, lost: 0, stricken: {0:0}, iconType: {}, years: {}, dtps: {}},
  		arr = [],
  		parseItem = (it, ind) => {
  			let iconType = it.icon_type || 1,
  				list_bounds = L$k.latLngBounds(),
  				latlngs = [],
  				list_dtp = it.list_dtp,
  				stroke = false,
  				fillColor = '#FF0000'; //   19-20

  			chkStricken(it, opt);
  			it.ht = ind < 2 ? 'hearth3' : 'hearth5';
  			if (list_dtp.length) {
  				opt.years[it.year] = true;

  				let cTypeCount = opt.str_icon_type[it.str_icon_type];
  				if (!cTypeCount) {
  					cTypeCount = 1;
  				} else {
  					cTypeCount++;
  				}
  				opt.str_icon_type[it.str_icon_type] = cTypeCount;
  				opt.iconType[it.str_icon_type] = iconType;

  				if (it.road in opt.road) {
  					opt.road[it.road]++;
  				} else {
  					opt.road[it.road] = 1;
  				}

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
  						latlng = L$k.latLng(coords.lat, coords.lon),
  						cur = [];

  					list_bounds.extend(latlng);
  					latlngs.push(latlng);

  					// if (prp.id === it.head) { head = prp; }

  					if (prp.id_skpdi) { cur.push({type: 'skpdi', id: prp.id_skpdi}); }
  					if (prp.id_stat) { cur.push({type: 'gibdd', id: prp.id_stat}); }
  					prp._cur = cur;

  					let idDtp = prp.id || prp.id_stat || prp.id_skpdi;
  					let dtps = opt.dtps[idDtp] || {};
  					let idHearth = it.id || it.id_hearth;
  					if (!dtps) {
  						dtps = {};
  						dtps[idHearth] = 1;
  					} else if (!dtps[idHearth]) {
  						dtps[idHearth] = 1;
  					} else {
  						dtps[idHearth]++;
  					}
  					opt.dtps[idDtp] = dtps;
  					// if (prp.stricken) { opt.stricken++; }
  					stroke = false;
  					if (prp.lost) {
  						opt.lost++;
  						stroke = true;
  					}
  					
  					return new CirclePoint(L$k.latLng(coords.lat, coords.lon), {
  							cluster: it,
  							props: prp,
  							radius: 6,
  							zIndexOffset: 50000,
  							rhomb: true,
  							stroke: stroke,
  							fillColor: fillColor,
  							// renderer: renderer
  						// }).bindPopup(popup)
  						// .on('popupopen', (ev) => {

  							// setPopup(ev.target.options.props);
  						// }).on('popupclose', (ev) => {
  							// if (ev.popup._svObj) {
  								// ev.popup._svObj.$destroy();
  								// delete ev.popup._svObj;
  							// }
  						});
  				});
  				if (latlngs.length) {
  					it._bounds = L$k.polyline(latlngs, {items: arr1, cluster: it, color: fillColor, weight: 4});
  				} else {
  					it._bounds = L$k.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'});
  				}

  				it._bounds
  					.on('mouseover', (ev) => {
  						let target = ev.target;
  						target._weight = target.options.weight;
  						target._color = target.options.color;
  						target.options.weight = 8;
  						target.options.color = 'red';
  						target._renderer._updateStyle(target);
  					})
  					.on('mouseout', (ev) => {
  						let target = ev.target;
  						target.options.weight = target._weight;
  						target.options.color = target._color;
  						target._renderer._updateStyle(target);
  					})
  					.on('click', (ev) => {
  						L$k.DomEvent.stopPropagation(ev);
  						let target = ev.target,
  							latlng = ev.latlng,
  							layerPoint = ev.layerPoint,
  							ctrlKey = ev.originalEvent.ctrlKey;
  						if (ctrlKey) { target.bringToBack(); }
  						// target.options.items.forEach(pt => {
  							// let cd = pt._point.distanceTo(layerPoint);
  							// if (cd < dist) {
  								// dist = cd;
  								// dtp = pt;
  							// }
  						// });
  						// if (dist < 10) {
  							// setPopup(dtp.options.props);
  							// popup.setLatLng(dtp._latlng).openOn(DtpHearthsPicket4._map);
  						// } else {
  							setPopup1$7(it);
  							popup1$9.setLatLng(latlng).openOn(DtpHearthsPicket4._map);
  						// }
  						
  						// console.log('popu666popen', dist, dtp);
  					});
  				arr.push(it._bounds);
  				arr = arr.concat(arr1);
  			}
  		};

  	Promise.all([
  		'https://dtp.mvs.group/scripts/prehearths2_dev/2019.txt',
  		'https://dtp.mvs.group/scripts/prehearths2_dev/2020.txt',
  		'https://dtp.mvs.group/scripts/prehearths4_dev/2019.txt',
  		'https://dtp.mvs.group/scripts/prehearths4_dev/2020.txt'
  	].map(key => fetch(key, {}).then(req => req.json())))
  	// Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach((json, ind) => {
  				opt.stricken[0] += json.length;
  				json.forEach(pt => {
  					// (pt.hearth3 || []).forEach(it => {
  						// parseItem(it, 'hearth3');
  					// });
  					// (pt.hearth5 || []).forEach(it => {
  						parseItem(pt, ind);
  					// });
  				});
  				
  				// let y = Math.floor(max_quarter),
  					// q = 1 + 4 * (max_quarter - y);
  				// argFilters = [{type: 'quarter', year: y, zn: q}];
  // console.log('opt', opt);
  				DtpHearthsPicket4._opt = opt;
  				DtpHearthsPicket4._group = L$k.layerGroup(arr);
  				if (argFilters$f) {
  					DtpHearthsPicket4.setFilter(argFilters$f);
  				} else {
  					DtpHearthsPicket4.addLayer(DtpHearthsPicket4._group);
  				}
  				DtpHearthsPicket4._refreshFilters();
  			});
  console.log('__allJson_____', allJson, DtpHearthsPicket4._opt);
  		});
  });

  // import {MarkerPoint, CirclePoint} from './CirclePoint';

  const L$l = window.L;

  // const popup = L.popup();
  let map;
  // let argFilters;

  let renderer$1 = L$l.canvas();
  const Roads = L$l.featureGroup([]);

  Roads.on('remove', (ev) => {
  	Roads.clearLayers();
  }).on('add', ev => {
  	// console.log('/static/data/dtpskpdi.geojson', ev);
  	// argFilters = [];
  	map = Roads._map;

  	fetch('static/m4.geojson', {
  	})
  	.then(req => req.json())
  	.then(json => {
  		let polyline;
  		let geojson = L$l.geoJson(json, {
  			// renderer: renderer,
  			style: () => {
  				// console.log('onEachFeature', it);
  				return {weight: 6};
  			}
  		})
  		.on('mouseout', (ev) => {
  			if (polyline && polyline._map) {
  				polyline._map.removeLayer(polyline);
  			}
  		})
  		.on('mousemove', (ev) => {
  			if (polyline && polyline._map) {
  				polyline._map.removeLayer(polyline);
  			}
  			let it = ev.layer,
  				min = Number.MAX_VALUE,
  				ep = ev.layerPoint,
  				latlng = ev.latlng,
  				_rings = it._rings[0],
  				index;
  			for (let i = 0, len = _rings.length - 1; i < len; i++) {
  				let d = L$l.LineUtil._sqClosestPointOnSegment(ep, _rings[i], _rings[i+1], true);
  				if (d < min) {
  					min = d;
  					index = i;
  				}
  			}
  			let arr = it._latlngs.slice(0, index);
  			arr.push(latlng);
  			
  			polyline = L$l.polyline(arr, {color: 'red', weight: 6, interactive: false}).bindTooltip('').addTo(map);
  			polyline.openTooltip(latlng);
  			let sm = Math.floor(getLatLngsLength(arr)),
  				km = Math.floor(sm/1000),
  				m = sm - 1000 * km;
  			polyline.setTooltipContent(km + ' км. ' + m + ' м.');
  		});
  		Roads.clearLayers();
  		Roads.addLayer(geojson);
  	});
  });

  // import {MarkerPoint, CirclePoint} from './CirclePoint';

  const L$m = window.L;

  // const popup = L.popup();
  let map$1;
  // let argFilters;

  // let renderer = L.canvas();
  const Settlements = L$m.featureGroup([]);

  Settlements.on('remove', (ev) => {
  	Settlements.clearLayers();
  }).on('add', ev => {
  	// console.log('/static/data/dtpskpdi.geojson', ev);
  	// argFilters = [];
  	map$1 = Settlements._map;

  	fetch('https://dtp.mvs.group/scripts/settlements_dev/0000.txt', {
  	})
  	.then(req => req.json())
  	.then(json => {
  		let geojson = L$m.geoJson(json, {
  			renderer: myRenderer,
  			style: (feature) => {
  				return {weight: 1};
  			}
  		})
  		.bindPopup(function (layer) {
  			layer.bringToBack();
  			return layer.feature.properties.name;
  		});
  		Settlements.clearLayers();
  		Settlements.bringToBack();
  		Settlements.addLayer(geojson);
  	});
  });

  // import 'leaflet-sidebar-v2';
  // import {GeoJsonStatic} from './GeoJsonStatic';

  const L$n = window.L;
  const map$2 = L$n.map(document.body, {
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

  var corners = map$2._controlCorners,
  	parent = map$2._controlContainer,
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
  		corners[key] = L$n.DomUtil.create('div', classNames[key], parent);
  	}
  }

  map$2.addControl(L$n.control.gmxCenter())
  	.addControl(L$n.control.fitCenter());

  var Mercator = L$n.TileLayer.extend({
  	options: {
  		tilesCRS: L$n.CRS.EPSG3395
  	},
  	_getTiledPixelBounds: function (center) {
  		var pixelBounds = L$n.TileLayer.prototype._getTiledPixelBounds.call(this, center);
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

  			tile.src = L$n.Util.template(pItem.errorTileUrlPrefix + pItem.postfix, {
  				z: searchParams.get('z'),
  				x: searchParams.get('x'),
  				y: searchParams.get('y')
  			});
  		}
  		done(e, tile);
  	},
  	_getTilePos: function (coords) {
  		var tilePos = L$n.TileLayer.prototype._getTilePos.call(this, coords);
  		return tilePos.subtract([0, this._shiftY]);
  	},

  	_getShiftY: function(zoom) {
  		var map = this._map,
  			pos = map.getCenter(),
  			shift = (map.options.crs.project(pos).y - this.options.tilesCRS.project(pos).y);

  		return Math.floor(L$n.CRS.scale(zoom) * shift / 40075016.685578496);
  	}
  });
  L$n.TileLayer.Mercator = Mercator;
  L$n.tileLayer.Mercator = function (url, options) {
  	return new Mercator(url, options);
  };

  let baseLayers = {};
  if (!hrefParams.b) { hrefParams.b = 'm2'; }
  ['m2', 'm3'].forEach(key => {
  	let it = proxy[key],
  		lit = L$n.tileLayer.Mercator(it.prefix + it.postfix, it.options);
  	baseLayers[it.title] = lit;
  	if (hrefParams.b === it.options.key) { lit.addTo(map$2); }
  });
  baseLayers.OpenStreetMap = L$n.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  	maxZoom: 21,
  	maxNativeZoom: 18
  });

  // let renderer = L.canvas();
  let geoJsonStatic = (pt) => {
  	const geoJsonStatic = L$n.featureGroup([]);
  	geoJsonStatic.on('add', ev => {
  		if (geoJsonStatic.getLayers().length === 0) {
  			fetch(pt.file, {
  			}).then(req => req.json())
  			.then(json => {
  				// console.log('ggggg', json);
  				let geojson = L$n.geoJson(json, {
  					renderer: myRenderer,
  					style: () => pt.style || {weight: 1}
  				});
  				geoJsonStatic.clearLayers();
  				geoJsonStatic.addLayer(geojson);
  			});
  		}
  	});
  	return geoJsonStatic;
  };

  let overlays = {
  	// Marker: L.marker([55.758031, 37.611694])
  		// .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
  		// .openPopup(),
  	// 'TestGraphQl': TestGraphQl,
  	
  	// 'm4': m4,
  	'Трассы': Roads,
  	'Населенные пункты': Settlements,
  	'Мероприятия': Measures,
  	'Рубежи': Rub,
  	// 'Рубежи (test)': Rub1,
  	'Очаги с привязкой к городам': DtpHearthsSettlements,
  	'Предочаги по пикетажу': DtpHearthsPicket4,
  	'Очаги ГИБДД по пикетажу': DtpHearthsPicket,
  	'Очаги ГИБДД разные типы, геометрия': DtpHearths5,
  	'Очаги ГИБДД одного типа, геометрия': DtpHearths3,
  	'ДТП Очаги(Stat)': DtpHearthsStat,
  	'ДТП Очаги(tmp)': DtpHearthsTmp,
  	'Очаги ГИБДД+СКПДИ по кварталам геометрия': DtpHearths,
  	'ДТП  ГИБДД+СКПДИ (объединение)': DtpVerifyed,
  	'ДТП СКПДИ + тепловая карта': DtpSkpdi,
  	'ДТП ГИБДД + тепловая карта': DtpGibdd,
  	'ДТП ГИБДД + тепловая карта + Рубежи': DtpGibddRub,
  	'Москва': geoJsonStatic({file:"/static/moscow.geojson", style: {color:"purple", interactive: false}}),
  	'Московская область': geoJsonStatic({file:"/static/moscowObl.geojson", style: {color:"gray", fill: false, interactive: false}}),
  	'А-108 Большая бетонка': geoJsonStatic({file:"/static/a108.geojson", style: {color:"green", fill: false, interactive: false}}),
  	'А-107 Малая бетонка': geoJsonStatic({file:"/static/a107.geojson", style: {color:"blue", fill: false, interactive: false}}),
  	'Санкт-Петербург': geoJsonStatic({file:"/static/sp.geojson", style: {color:"purple", interactive: false}}),
  	'Ленинградская область': geoJsonStatic({file:"/static/spobl.geojson", style: {color:"gray", fill: false, interactive: false}})
  };
  L$n.featureGroup([]);
  // let comp = L.DomUtil.create('div', 'layerInfo');
  // comp.innerHTML = 'df<b>df</b>df';
  // let info = L.DomUtil.create('div', '', comp);
  // L.DomEvent.on(info, 'mouseover', (ev) => console.log);
  // overlays[comp] = DtpHearths5;

  let ovHash = hrefParams.o ? hrefParams.o.split(',').reduce((p, c) => {p[c] = true; return p;}, {}) : {};
  ['m1', 'm4', 'm5'].forEach(key => {
  	let it = proxy[key],
  		lit = L$n.tileLayer.Mercator(it.prefix + it.postfix, it.options);
  	overlays[it.title] = lit;
  	if (ovHash[it.options.key]) { lit.addTo(map$2); }
  });
  var lc = L$n.control.layers(baseLayers, overlays).addTo(map$2);

  let filtersControl = L$n.control.gmxIcon({
    id: 'filters',
    className: 'leaflet-bar',
    togglable: true,
    title: 'Фильтры'
  })
  .on('statechange', function (ev) {
  	// console.log({filtersIcon: ev.target.options.isActive});
  	let target = ev.target,
  		cont = target._container,
  		cont1 = target._win,
  		isActive = target.options.isActive;
  		
  	if (isActive) {
  		if (!cont1) {
  			cont1 = target._win = L$n.DomUtil.create('div', 'win leaflet-control-layers', cont);
  			// cont1.innerHTML = 'Слой "ДТП Сводный"';
  			L$n.DomEvent.disableScrollPropagation(cont1);
  			cont1._Filters = new DtpVerifyedFilters({
  				target: cont1,
  				props: {
  					control: target,
  					DtpGibddRub: DtpGibddRub,
  					DtpGibdd: DtpGibdd,
  					DtpSkpdi: DtpSkpdi,
  					Measures: Measures,
  					Rub: Rub,
  					// Rub1: Rub1,
  					DtpHearthsPicket4: DtpHearthsPicket4,
  					DtpHearthsSettlements: DtpHearthsSettlements,
  					DtpHearthsPicket: DtpHearthsPicket,
  					DtpHearths5: DtpHearths5,
  					DtpHearths3: DtpHearths3,
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

  }).addTo(map$2);

  map$2.pm.setLang('customName', {
  	tooltips: {
  		finishLine: 'Щелкните любой существующий маркер для завершения',
  	}
  }, 'ru');
  map$2.pm.setLang('ru');

  let isMeasureActive, lineActionNode;
  map$2
  .on('pm:create', (ev) => {
  	map$2.removeLayer(ev.layer);
  	measureControl.setActive(false);
  })
  .on('pm:drawstart', (ev) => {
  	let workingLayer =  ev.workingLayer;
  	if (ev.shape === 'Line') {
  		let _hintMarker = map$2.pm.Draw.Line._hintMarker;
  		if (_hintMarker) {
  			_hintMarker.on('move', function(e) {
  				var latlngs = workingLayer.getLatLngs();
  				if (latlngs.length) {
  					var	dist = getLatLngsLength(latlngs),
  						last = distVincenty(latlngs[latlngs.length - 1], e.latlng);

  					dist += last;
  					var distStr = dist > 1000 ? (dist  / 1000).toFixed(2) + ' км' : Math.ceil(dist) + ' м';
  					var lastStr = last > 1000 ? (last  / 1000).toFixed(2) + ' км' : Math.ceil(last) + ' м';

  				  _hintMarker._tooltip.setContent('Отрезок <b>(' + lastStr + ')</b>участка <b>(' + distStr + ')</b>');
  				}
  			});
  		}
  		if (isMeasureActive && ev.target.pm.Toolbar.buttons.drawPolyline.buttonsDomNode) {
  			lineActionNode = ev.target.pm.Toolbar.buttons.drawPolyline.buttonsDomNode.children[1];
  			lineActionNode.style.display = 'none';
  		}
  	}
  });

  let measureControl = L$n.control.gmxIcon({
    id: 'measure',
    className: 'leaflet-bar',
    togglable: true,
    title: 'Включить/Отключить режим измерения расстояний'
  })
  .on('statechange', function (ev) {
  	isMeasureActive = ev.target.options.isActive;
  	// ev.stopPropagation();
  	// L.DomEvent.stopPropagation(ev);
  	if (isMeasureActive) {
  		map$2.pm.enableDraw('Line', { finishOn: 'dblclick' });
  	} else {
  		map$2.pm.disableDraw('Line');
  		if (lineActionNode) {
  			lineActionNode.style.display = '';
  		}
  	}
  }).addTo(map$2);

  const refreshFilters = () => {
  	setTimeout(() => {
  		if (filtersControl.options.isActive) {
  			filtersControl.setActive(false);
  			filtersControl._win = null;
  			filtersControl.setActive(true);
  		}
  	});
  };
  DtpGibddRub._refreshFilters =
  DtpGibdd._refreshFilters =
  DtpSkpdi._refreshFilters =
  Measures._refreshFilters =
  DtpVerifyed._refreshFilters =
  DtpHearths._refreshFilters =
  DtpHearthsStat._refreshFilters =
  DtpHearths3._refreshFilters =
  DtpHearths5._refreshFilters =
  DtpHearthsPicket._refreshFilters =
  DtpHearthsSettlements._refreshFilters =
  DtpHearthsPicket4._refreshFilters =
  Rub._refreshFilters =
  DtpHearthsTmp._refreshFilters = refreshFilters;

  const eventsStr = 'remove';
  DtpGibddRub.on(eventsStr, refreshFilters);
  DtpGibdd.on(eventsStr, refreshFilters);
  DtpSkpdi.on(eventsStr, refreshFilters);
  Measures.on(eventsStr, refreshFilters);
  DtpVerifyed.on(eventsStr, refreshFilters);
  DtpHearths.on(eventsStr, refreshFilters);
  DtpHearthsTmp.on(eventsStr, refreshFilters);
  DtpHearthsStat.on(eventsStr, refreshFilters);
  DtpHearths3.on(eventsStr, refreshFilters);
  DtpHearths5.on(eventsStr, refreshFilters);
  DtpHearthsPicket.on(eventsStr, refreshFilters);
  DtpHearthsSettlements.on(eventsStr, refreshFilters);
  DtpHearthsPicket4.on(eventsStr, refreshFilters);
  Rub.on(eventsStr, refreshFilters);

  map$2
  	.on('zoomend', (ev) => {
  		map$2._crpx = 0;
  // console.log('zoomend ', map._zoom);
  		if (DtpVerifyed._map) {
  			DtpVerifyed.checkZoom(map$2._zoom);
  		}
  		if (DtpSkpdi._map) {
  			DtpSkpdi.checkZoom(map$2._zoom);
  		}
  		if (DtpGibdd._map) {
  			DtpGibdd.checkZoom(map$2._zoom);
  		}
  	});
  window._map = map$2;

  return map$2;

}());
//# sourceMappingURL=main.js.map
