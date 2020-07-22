
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

  /* src\DtpPopupGibdd.svelte generated by Svelte v3.20.1 */

  const { console: console_1$1 } = globals;
  const file$2 = "src\\DtpPopupGibdd.svelte";

  function get_each_context$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[9] = list[i];
  	return child_ctx;
  }

  function get_each_context_2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[9] = list[i];
  	return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[12] = list[i];
  	return child_ctx;
  }

  // (109:6) {#if pt.ts}
  function create_if_block_7(ctx) {
  	let li;
  	let t_value = /*pt*/ ctx[12].ts + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$2, 108, 17, 2681);
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
  		source: "(109:6) {#if pt.ts}",
  		ctx
  	});

  	return block;
  }

  // (111:7) {#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}
  function create_if_block_6(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[9].k_uch + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$2, 110, 52, 2783);
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
  		source: "(111:7) {#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}",
  		ctx
  	});

  	return block;
  }

  // (112:7) {#if pt1.npdd}
  function create_if_block_5(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[9].npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$2, 111, 21, 2830);
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
  		source: "(112:7) {#if pt1.npdd}",
  		ctx
  	});

  	return block;
  }

  // (113:7) {#if pt1.sop_npdd}
  function create_if_block_4(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[9].sop_npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$2, 112, 25, 2880);
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
  		source: "(113:7) {#if pt1.sop_npdd}",
  		ctx
  	});

  	return block;
  }

  // (110:6) {#each pt.arr as pt1}
  function create_each_block_2(ctx) {
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
  		id: create_each_block_2.name,
  		type: "each",
  		source: "(110:6) {#each pt.arr as pt1}",
  		ctx
  	});

  	return block;
  }

  // (108:5) {#each tsInfoArr as pt}
  function create_each_block_1(ctx) {
  	let t;
  	let each_1_anchor;
  	let if_block = /*pt*/ ctx[12].ts && create_if_block_7(ctx);
  	let each_value_2 = /*pt*/ ctx[12].arr;
  	validate_each_argument(each_value_2);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_2.length; i += 1) {
  		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
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
  			if (/*pt*/ ctx[12].ts) if_block.p(ctx, dirty);

  			if (dirty & /*tsInfoArr*/ 16) {
  				each_value_2 = /*pt*/ ctx[12].arr;
  				validate_each_argument(each_value_2);
  				let i;

  				for (i = 0; i < each_value_2.length; i += 1) {
  					const child_ctx = get_each_context_2(ctx, each_value_2, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_2(child_ctx);
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
  		id: create_each_block_1.name,
  		type: "each",
  		source: "(108:5) {#each tsInfoArr as pt}",
  		ctx
  	});

  	return block;
  }

  // (122:4) {#if prp.spog}
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
  			add_location(div0, file$2, 123, 6, 3093);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$2, 123, 40, 3127);
  			add_location(div2, file$2, 122, 5, 3081);
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
  		source: "(122:4) {#if prp.spog}",
  		ctx
  	});

  	return block;
  }

  // (127:4) {#if prp.s_pch}
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
  			add_location(div0, file$2, 128, 6, 3221);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$2, 128, 42, 3257);
  			add_location(div2, file$2, 127, 5, 3209);
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
  		source: "(127:4) {#if prp.s_pch}",
  		ctx
  	});

  	return block;
  }

  // (132:4) {#if prp.osv}
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
  			add_location(div0, file$2, 133, 6, 3350);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$2, 133, 46, 3390);
  			add_location(div2, file$2, 132, 5, 3338);
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
  		source: "(132:4) {#if prp.osv}",
  		ctx
  	});

  	return block;
  }

  // (137:4) {#if prp.ndu}
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
  			add_location(div0, file$2, 138, 6, 3481);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$2, 138, 46, 3521);
  			add_location(div2, file$2, 137, 5, 3469);
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
  		source: "(137:4) {#if prp.ndu}",
  		ctx
  	});

  	return block;
  }

  // (152:3) {#each (prp.dps_plk || []) as pt1}
  function create_each_block$1(ctx) {
  	let li;
  	let t;
  	let li_value_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text("батальон ДПС");
  			attr_dev(li, "class", "link svelte-bxm1yk");
  			li.value = li_value_value = /*pt1*/ ctx[9];
  			add_location(li, file$2, 152, 4, 3945);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t);
  			if (remount) dispose();
  			dispose = listen_dev(li, "click", /*showBat*/ ctx[2], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && li_value_value !== (li_value_value = /*pt1*/ ctx[9])) {
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
  		source: "(152:3) {#each (prp.dps_plk || []) as pt1}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$2(ctx) {
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
  	let div1;
  	let t49;
  	let ul1;
  	let dispose;
  	let each_value_1 = /*tsInfoArr*/ ctx[4];
  	validate_each_argument(each_value_1);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  	}

  	let if_block0 = /*prp*/ ctx[0].spog && create_if_block_3(ctx);
  	let if_block1 = /*prp*/ ctx[0].s_pch && create_if_block_2(ctx);
  	let if_block2 = /*prp*/ ctx[0].osv && create_if_block_1(ctx);
  	let if_block3 = /*prp*/ ctx[0].ndu && create_if_block(ctx);
  	let each_value = /*prp*/ ctx[0].dps_plk || [];
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
  			div1 = element("div");
  			t49 = space();
  			ul1 = element("ul");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			add_location(b0, file$2, 74, 4, 1712);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$2, 73, 2, 1688);
  			attr_dev(td0, "class", "first svelte-bxm1yk");
  			add_location(td0, file$2, 80, 5, 1835);
  			add_location(td1, file$2, 81, 5, 1867);
  			add_location(tr0, file$2, 79, 3, 1825);
  			attr_dev(td2, "class", "first svelte-bxm1yk");
  			add_location(td2, file$2, 84, 5, 1945);
  			add_location(td3, file$2, 85, 5, 1980);
  			add_location(tr1, file$2, 83, 3, 1935);
  			attr_dev(td4, "class", "first svelte-bxm1yk");
  			add_location(td4, file$2, 88, 5, 2048);
  			add_location(b1, file$2, 89, 9, 2089);
  			add_location(b2, file$2, 89, 34, 2114);
  			add_location(td5, file$2, 89, 5, 2085);
  			add_location(tr2, file$2, 87, 3, 2038);
  			attr_dev(td6, "class", "first svelte-bxm1yk");
  			add_location(td6, file$2, 92, 5, 2164);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$2, 93, 29, 2228);
  			add_location(td7, file$2, 93, 5, 2204);
  			add_location(tr3, file$2, 91, 3, 2154);
  			attr_dev(td8, "class", "first svelte-bxm1yk");
  			add_location(td8, file$2, 96, 5, 2356);
  			add_location(td9, file$2, 97, 5, 2396);
  			add_location(tr4, file$2, 95, 3, 2346);
  			attr_dev(td10, "class", "first svelte-bxm1yk");
  			add_location(td10, file$2, 100, 5, 2470);
  			add_location(td11, file$2, 101, 5, 2507);
  			add_location(tr5, file$2, 99, 3, 2460);
  			attr_dev(td12, "class", "first svelte-bxm1yk");
  			add_location(td12, file$2, 104, 14, 2573);
  			add_location(ul0, file$2, 106, 4, 2630);
  			add_location(td13, file$2, 105, 14, 2621);
  			add_location(tr6, file$2, 103, 12, 2554);
  			attr_dev(td14, "class", "first svelte-bxm1yk");
  			add_location(td14, file$2, 119, 14, 3006);
  			add_location(td15, file$2, 120, 14, 3052);
  			add_location(tr7, file$2, 118, 12, 2987);
  			attr_dev(td16, "class", "first svelte-bxm1yk");
  			add_location(td16, file$2, 144, 14, 3637);
  			add_location(b3, file$2, 145, 18, 3707);
  			add_location(td17, file$2, 145, 14, 3703);
  			add_location(tr8, file$2, 143, 12, 3618);
  			attr_dev(div1, "class", "win leaflet-popup-content-wrapper  svelte-bxm1yk");
  			add_location(div1, file$2, 149, 2, 3819);
  			add_location(ul1, file$2, 150, 4, 3898);
  			attr_dev(td18, "class", "first svelte-bxm1yk");
  			attr_dev(td18, "colspan", "2");
  			add_location(td18, file$2, 148, 14, 3788);
  			add_location(tr9, file$2, 147, 12, 3769);
  			add_location(tbody, file$2, 78, 3, 1814);
  			attr_dev(table, "class", "table");
  			add_location(table, file$2, 77, 4, 1789);
  			attr_dev(div2, "class", "featureCont");
  			add_location(div2, file$2, 76, 2, 1759);
  			attr_dev(div3, "class", "mvsPopup svelte-bxm1yk");
  			add_location(div3, file$2, 72, 3, 1663);
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
  			append_dev(td18, div1);
  			/*div1_binding*/ ctx[8](div1);
  			append_dev(td18, t49);
  			append_dev(td18, ul1);

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
  					const child_ctx = get_each_context_1(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_1(child_ctx);
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

  			if (dirty & /*prp, showBat*/ 5) {
  				each_value = /*prp*/ ctx[0].dps_plk || [];
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$1(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$1(child_ctx);
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
  	let disabled = prp.skpdiFiles ? "" : "disabled";
  	let gpsCont;

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
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<DtpPopupGibdd> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupGibdd", $$slots, []);

  	function div1_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(1, gpsCont = $$value);
  		});
  	}

  	$$self.$set = $$props => {
  		if ("showModal" in $$props) $$invalidate(5, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({
  		afterUpdate,
  		Modal,
  		DtpPopup: DtpPopupDps,
  		showModal,
  		prp,
  		modal,
  		disabled,
  		gpsCont,
  		showBat,
  		copyParent,
  		tsInfoArr
  	});

  	$$self.$inject_state = $$props => {
  		if ("showModal" in $$props) $$invalidate(5, showModal = $$props.showModal);
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("modal" in $$props) modal = $$props.modal;
  		if ("disabled" in $$props) disabled = $$props.disabled;
  		if ("gpsCont" in $$props) $$invalidate(1, gpsCont = $$props.gpsCont);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [
  		prp,
  		gpsCont,
  		showBat,
  		copyParent,
  		tsInfoArr,
  		showModal,
  		modal,
  		disabled,
  		div1_binding
  	];
  }

  class DtpPopupGibdd extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$2, create_fragment$2, safe_not_equal, { showModal: 5, prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupGibdd",
  			options,
  			id: create_fragment$2.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$1.warn("<DtpPopupGibdd> was created without expected prop 'prp'");
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

  const { console: console_1$2 } = globals;
  const file$3 = "src\\DtpPopupSkpdi.svelte";

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
  			add_location(li, file$3, 72, 5, 1845);
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
  			add_location(i, file$3, 84, 46, 2148);
  			add_location(b, file$3, 84, 43, 2145);
  			add_location(li, file$3, 84, 5, 2107);
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

  function create_fragment$3(ctx) {
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
  			add_location(b0, file$3, 38, 4, 855);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$3, 37, 2, 831);
  			attr_dev(td0, "class", "first");
  			add_location(td0, file$3, 44, 5, 978);
  			add_location(td1, file$3, 45, 5, 1010);
  			add_location(tr0, file$3, 43, 3, 968);
  			attr_dev(td2, "class", "first");
  			add_location(td2, file$3, 48, 5, 1087);
  			add_location(b1, file$3, 49, 9, 1128);
  			add_location(b2, file$3, 49, 34, 1153);
  			add_location(td3, file$3, 49, 5, 1124);
  			add_location(tr1, file$3, 47, 3, 1077);
  			attr_dev(td4, "class", "first");
  			add_location(td4, file$3, 53, 5, 1204);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$3, 54, 29, 1268);
  			add_location(td5, file$3, 54, 5, 1244);
  			add_location(tr2, file$3, 52, 3, 1194);
  			attr_dev(td6, "class", "first");
  			add_location(td6, file$3, 57, 5, 1396);
  			add_location(td7, file$3, 58, 5, 1436);
  			add_location(tr3, file$3, 56, 3, 1386);
  			attr_dev(div1, "class", "first");
  			add_location(div1, file$3, 62, 4, 1531);
  			add_location(div2, file$3, 63, 4, 1573);
  			attr_dev(td8, "colspan", "2");
  			add_location(td8, file$3, 61, 5, 1510);
  			add_location(tr4, file$3, 60, 3, 1500);
  			attr_dev(td9, "class", "first");
  			add_location(td9, file$3, 67, 14, 1681);
  			add_location(ul0, file$3, 69, 4, 1738);
  			add_location(td10, file$3, 68, 14, 1729);
  			add_location(tr5, file$3, 66, 12, 1662);
  			attr_dev(td11, "class", "first");
  			add_location(td11, file$3, 79, 14, 1973);
  			add_location(ul1, file$3, 81, 4, 2030);
  			add_location(td12, file$3, 80, 14, 2021);
  			add_location(tr6, file$3, 78, 12, 1954);
  			attr_dev(button, "class", "primary svelte-1aipaym");
  			button.disabled = /*disabled*/ ctx[2];
  			add_location(button, file$3, 93, 4, 2309);
  			attr_dev(td13, "class", "center");
  			attr_dev(td13, "colspan", "2");
  			add_location(td13, file$3, 92, 5, 2273);
  			add_location(tr7, file$3, 91, 3, 2263);
  			add_location(tbody, file$3, 42, 3, 957);
  			attr_dev(table, "class", "table");
  			add_location(table, file$3, 41, 4, 932);
  			attr_dev(div3, "class", "featureCont");
  			add_location(div3, file$3, 40, 2, 902);
  			attr_dev(div4, "class", "mvsPopup");
  			add_location(div4, file$3, 36, 3, 806);
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
  			if (dirty & /*prp*/ 2 && t4_value !== (t4_value = (/*prp*/ ctx[1].id || /*prp*/ ctx[1].id_stat || /*prp*/ ctx[1].id_skpdi || "") + "")) set_data_dev(t4, t4_value);
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
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<DtpPopupSkpdi> was created with unknown prop '${key}'`);
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
  		init(this, options, instance$3, create_fragment$3, safe_not_equal, { showModal: 0, prp: 1 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupSkpdi",
  			options,
  			id: create_fragment$3.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[1] === undefined && !("prp" in props)) {
  			console_1$2.warn("<DtpPopupSkpdi> was created without expected prop 'prp'");
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
  const file$4 = "src\\DtpPopupVerifyed.svelte";

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
  			add_location(button, file$4, 46, 3, 970);
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

  function create_fragment$4(ctx) {
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
  			add_location(a, file$4, 41, 3, 814);
  			attr_dev(div0, "class", "close");
  			add_location(div0, file$4, 40, 2, 791);
  			attr_dev(div1, "class", "pLine");
  			add_location(div1, file$4, 44, 2, 918);
  			attr_dev(div2, "class", "mvsPopup");
  			add_location(div2, file$4, 39, 1, 766);
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
  		id: create_fragment$4.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$4($$self, $$props, $$invalidate) {
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
  		init(this, options, instance$4, create_fragment$4, safe_not_equal, { prp: 0, closeMe: 1 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupVerifyed",
  			options,
  			id: create_fragment$4.name
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

  const { Object: Object_1 } = globals;
  const file$5 = "src\\DtpVerifyedFilters.svelte";

  function get_each_context$4(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_2$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_4(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_6(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[183] = list[i];
  	return child_ctx;
  }

  function get_each_context_5(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_7(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_8(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_10(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[183] = list[i];
  	return child_ctx;
  }

  function get_each_context_9(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_11(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_12(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_14(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[183] = list[i];
  	return child_ctx;
  }

  function get_each_context_13(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_15(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_16(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_17(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_18(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_19(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_20(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_21(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  function get_each_context_22(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[170] = list[i];
  	return child_ctx;
  }

  // (795:2) {#if DtpHearthsPicket4._map && DtpHearthsPicket4._opt && DtpHearthsPicket4._opt.years}
  function create_if_block_18(ctx) {
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
  	let each_value_22 = Object.keys(/*DtpHearthsPicket4*/ ctx[0]._opt.years).sort();
  	validate_each_argument(each_value_22);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_22.length; i += 1) {
  		each_blocks_1[i] = create_each_block_22(get_each_context_22(ctx, each_value_22, i));
  	}

  	let each_value_21 = /*optRoadTypes4*/ ctx[76];
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
						Все дороги (${/*optRoadTypes4*/ ctx[76].reduce(/*func*/ ctx[124], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t19 = space();
  			div8 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearthsPicket4*/ ctx[75].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearthsPicket4*/ ctx[75].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearthsPicket4*/ ctx[75].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearthsPicket4*/ ctx[75].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearthsPicket4*/ ctx[75].stricken[4] || 0}) С пострадавшими и погибшими`;
  			add_location(b, file$5, 795, 31, 24791);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 795, 2, 24762);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_hearth*/ ctx[17];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$5, 797, 32, 24886);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 797, 3, 24857);
  			attr_dev(input1, "type", "text");
  			input1.value = /*id_dtp*/ ctx[14];
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$5, 798, 30, 24989);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$5, 798, 3, 24962);
  			add_location(legend, file$5, 801, 5, 25106);
  			attr_dev(input2, "type", "radio");
  			input2.__value = input2_value_value = 1;
  			input2.value = input2.__value;
  			input2.checked = input2_checked_value = /*hearths_period_type_Stat*/ ctx[42] === 1;
  			attr_dev(input2, "id", "hearths_period_type_Stat1");
  			attr_dev(input2, "name", "hearths_period_type_Stat");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[123][2].push(input2);
  			add_location(input2, file$5, 803, 6, 25183);
  			attr_dev(label0, "for", "hearths_period_type_Stat1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$5, 803, 214, 25391);
  			attr_dev(div3, "class", "pLine margin svelte-1jsovbn");
  			add_location(div3, file$5, 804, 6, 25464);
  			attr_dev(div4, "class", "pLine type svelte-1jsovbn");
  			add_location(div4, file$5, 802, 5, 25152);
  			add_location(fieldset, file$5, 800, 4, 25090);
  			attr_dev(div5, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div5, file$5, 799, 3, 25059);
  			attr_dev(input3, "type", "checkbox");
  			attr_dev(input3, "id", "ht_3");
  			input3.checked = input3_checked_value = /*ht*/ ctx[16].hearth3;
  			attr_dev(input3, "name", "hearth3");
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$5, 813, 4, 25884);
  			attr_dev(label1, "for", "ht_3");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$5, 813, 95, 25975);
  			attr_dev(input4, "type", "checkbox");
  			attr_dev(input4, "id", "ht_5");
  			input4.checked = input4_checked_value = /*ht*/ ctx[16].hearth5;
  			attr_dev(input4, "name", "hearth5");
  			attr_dev(input4, "class", "svelte-1jsovbn");
  			add_location(input4, file$5, 814, 4, 26017);
  			attr_dev(label2, "for", "ht_5");
  			attr_dev(label2, "class", "svelte-1jsovbn");
  			add_location(label2, file$5, 814, 95, 26108);
  			attr_dev(div6, "class", "pLine svelte-1jsovbn");
  			add_location(div6, file$5, 812, 3, 25860);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$5, 818, 5, 26294);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*roads*/ ctx[15] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[125].call(select0));
  			add_location(select0, file$5, 817, 4, 26184);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$5, 816, 3, 26160);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$5, 830, 5, 26743);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$5, 831, 5, 26827);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$5, 832, 5, 26919);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$5, 833, 5, 27015);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$5, 834, 5, 27118);
  			attr_dev(select1, "name", "stricken");
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken4*/ ctx[28] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[126].call(select1));
  			add_location(select1, file$5, 829, 4, 26644);
  			attr_dev(div8, "class", "pLine svelte-1jsovbn");
  			add_location(div8, file$5, 828, 3, 26620);
  			attr_dev(div9, "class", "filtersCont svelte-1jsovbn");
  			add_location(div9, file$5, 796, 2, 24828);
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
  			input2.checked = input2.__value === /*hearths_period_type_Stat*/ ctx[42];
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

  			select_options(select0, /*roads*/ ctx[15]);
  			append_dev(div9, t19);
  			append_dev(div9, div8);
  			append_dev(div8, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken4*/ ctx[28]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdHearth*/ ctx[82], false, false, false),
  				listen_dev(input1, "input", /*oncheckIdDtp*/ ctx[81], false, false, false),
  				listen_dev(input2, "change", /*setFilterHearthsPicket4*/ ctx[80], false, false, false),
  				listen_dev(input2, "change", /*input2_change_handler*/ ctx[122]),
  				listen_dev(input3, "change", /*oncheckHt*/ ctx[83], false, false, false),
  				listen_dev(input4, "change", /*oncheckHt*/ ctx[83], false, false, false),
  				listen_dev(select0, "change", /*select0_change_handler*/ ctx[125]),
  				listen_dev(select0, "change", /*setFilterHearthsPicket4*/ ctx[80], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler*/ ctx[126]),
  				listen_dev(select1, "change", /*setFilterHearthsPicket4*/ ctx[80], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_hearth*/ 131072 && input0.value !== /*id_hearth*/ ctx[17]) {
  				prop_dev(input0, "value", /*id_hearth*/ ctx[17]);
  			}

  			if (dirty[0] & /*id_dtp*/ 16384 && input1.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input1, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 2048 && input2_checked_value !== (input2_checked_value = /*hearths_period_type_Stat*/ ctx[42] === 1)) {
  				prop_dev(input2, "checked", input2_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 2048) {
  				input2.checked = input2.__value === /*hearths_period_type_Stat*/ ctx[42];
  			}

  			if (dirty[0] & /*DtpHearthsPicket4, hearths_year_Picket4*/ 536870913 | dirty[1] & /*hearths_period_type_Stat*/ 2048 | dirty[2] & /*setFilterHearthsPicket4*/ 262144) {
  				each_value_22 = Object.keys(/*DtpHearthsPicket4*/ ctx[0]._opt.years).sort();
  				validate_each_argument(each_value_22);
  				let i;

  				for (i = 0; i < each_value_22.length; i += 1) {
  					const child_ctx = get_each_context_22(ctx, each_value_22, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_22(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div3, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_22.length;
  			}

  			if (dirty[0] & /*ht*/ 65536 && input3_checked_value !== (input3_checked_value = /*ht*/ ctx[16].hearth3)) {
  				prop_dev(input3, "checked", input3_checked_value);
  			}

  			if (dirty[0] & /*ht*/ 65536 && input4_checked_value !== (input4_checked_value = /*ht*/ ctx[16].hearth5)) {
  				prop_dev(input4, "checked", input4_checked_value);
  			}

  			if (dirty[2] & /*optRoadTypes4, optDataHearthsPicket4*/ 24576) {
  				each_value_21 = /*optRoadTypes4*/ ctx[76];
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

  			if (dirty[0] & /*roads*/ 32768) {
  				select_options(select0, /*roads*/ ctx[15]);
  			}

  			if (dirty[0] & /*hearths_stricken4*/ 268435456) {
  				select_option(select1, /*hearths_stricken4*/ ctx[28]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div9);
  			/*$$binding_groups*/ ctx[123][2].splice(/*$$binding_groups*/ ctx[123][2].indexOf(input2), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_18.name,
  		type: "if",
  		source: "(795:2) {#if DtpHearthsPicket4._map && DtpHearthsPicket4._opt && DtpHearthsPicket4._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (806:6) {#each Object.keys(DtpHearthsPicket4._opt.years).sort() as key}
  function create_each_block_22(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[170] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_Picket4");
  			input.checked = input_checked_value = /*hearths_year_Picket4*/ ctx[29][/*key*/ ctx[170]];
  			input.disabled = input_disabled_value = /*hearths_period_type_Stat*/ ctx[42] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[170]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 806, 7, 25568);
  			attr_dev(label, "for", "hearths_year_Picket4");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 806, 183, 25744);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsPicket4*/ ctx[80], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*hearths_year_Picket4, DtpHearthsPicket4*/ 536870913 && input_checked_value !== (input_checked_value = /*hearths_year_Picket4*/ ctx[29][/*key*/ ctx[170]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 2048 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_Stat*/ ctx[42] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsPicket4*/ 1 && input_name_value !== (input_name_value = /*key*/ ctx[170])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsPicket4*/ 1 && t_value !== (t_value = /*key*/ ctx[170] + "")) set_data_dev(t, t_value);
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
  		source: "(806:6) {#each Object.keys(DtpHearthsPicket4._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (822:5) {#each optRoadTypes4 as key}
  function create_each_block_21(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsPicket4*/ ctx[75].road[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "road_" + /*key*/ ctx[170] + " svelte-1jsovbn");
  			add_location(option, file$5, 822, 6, 26473);
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
  		source: "(822:5) {#each optRoadTypes4 as key}",
  		ctx
  	});

  	return block;
  }

  // (841:2) {#if DtpHearthsPicket._map && DtpHearthsPicket._opt && DtpHearthsPicket._opt.years}
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
  	let each_value_20 = /*optRoadTypes*/ ctx[74];
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
						Все дороги (${/*optRoadTypes*/ ctx[74].reduce(/*func_1*/ ctx[127], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			add_location(b, file$5, 841, 31, 27373);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 841, 2, 27344);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_hearth*/ ctx[17];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$5, 843, 32, 27464);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 843, 3, 27435);
  			attr_dev(input1, "type", "text");
  			input1.value = /*id_dtp*/ ctx[14];
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$5, 844, 30, 27567);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$5, 844, 3, 27540);
  			attr_dev(input2, "type", "checkbox");
  			attr_dev(input2, "id", "ht_3");
  			input2.checked = input2_checked_value = /*ht*/ ctx[16].hearth3;
  			attr_dev(input2, "name", "hearth3");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$5, 846, 4, 27661);
  			attr_dev(label0, "for", "ht_3");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$5, 846, 95, 27752);
  			attr_dev(input3, "type", "checkbox");
  			attr_dev(input3, "id", "ht_5");
  			input3.checked = input3_checked_value = /*ht*/ ctx[16].hearth5;
  			attr_dev(input3, "name", "hearth5");
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$5, 847, 4, 27794);
  			attr_dev(label1, "for", "ht_5");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$5, 847, 95, 27885);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$5, 845, 3, 27637);
  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$5, 851, 5, 28070);
  			attr_dev(select, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select.multiple = true;
  			if (/*roads*/ ctx[15] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[128].call(select));
  			add_location(select, file$5, 850, 4, 27961);
  			attr_dev(div4, "class", "pLine svelte-1jsovbn");
  			add_location(div4, file$5, 849, 3, 27937);
  			attr_dev(div5, "class", "filtersCont svelte-1jsovbn");
  			add_location(div5, file$5, 842, 2, 27406);
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

  			select_options(select, /*roads*/ ctx[15]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdHearth*/ ctx[82], false, false, false),
  				listen_dev(input1, "input", /*oncheckIdDtp*/ ctx[81], false, false, false),
  				listen_dev(input2, "change", /*oncheckHt*/ ctx[83], false, false, false),
  				listen_dev(input3, "change", /*oncheckHt*/ ctx[83], false, false, false),
  				listen_dev(select, "change", /*select_change_handler*/ ctx[128]),
  				listen_dev(select, "change", /*setFilterHearthsPicket*/ ctx[79], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_hearth*/ 131072 && input0.value !== /*id_hearth*/ ctx[17]) {
  				prop_dev(input0, "value", /*id_hearth*/ ctx[17]);
  			}

  			if (dirty[0] & /*id_dtp*/ 16384 && input1.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input1, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (dirty[0] & /*ht*/ 65536 && input2_checked_value !== (input2_checked_value = /*ht*/ ctx[16].hearth3)) {
  				prop_dev(input2, "checked", input2_checked_value);
  			}

  			if (dirty[0] & /*ht*/ 65536 && input3_checked_value !== (input3_checked_value = /*ht*/ ctx[16].hearth5)) {
  				prop_dev(input3, "checked", input3_checked_value);
  			}

  			if (dirty[2] & /*optRoadTypes, optDataHearthsPicket*/ 6144) {
  				each_value_20 = /*optRoadTypes*/ ctx[74];
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

  			if (dirty[0] & /*roads*/ 32768) {
  				select_options(select, /*roads*/ ctx[15]);
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
  		source: "(841:2) {#if DtpHearthsPicket._map && DtpHearthsPicket._opt && DtpHearthsPicket._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (855:5) {#each optRoadTypes as key}
  function create_each_block_20(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsPicket*/ ctx[73].road[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "road_" + /*key*/ ctx[170] + " svelte-1jsovbn");
  			add_location(option, file$5, 855, 6, 28246);
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
  		source: "(855:5) {#each optRoadTypes as key}",
  		ctx
  	});

  	return block;
  }

  // (865:2) {#if DtpHearths5._map && DtpHearths5._opt && DtpHearths5._opt.years}
  function create_if_block_16(ctx) {
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
  	let each_value_19 = Object.keys(/*DtpHearths5*/ ctx[2]._opt.years).sort();
  	validate_each_argument(each_value_19);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_19.length; i += 1) {
  		each_blocks_1[i] = create_each_block_19(get_each_context_19(ctx, each_value_19, i));
  	}

  	let each_value_18 = /*optTypeHearths5Keys*/ ctx[72];
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
						Все типы (${/*optTypeHearths5Keys*/ ctx[72].reduce(/*func_2*/ ctx[130], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t13 = space();
  			div6 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearths5*/ ctx[71].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearths5*/ ctx[71].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearths5*/ ctx[71].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearths5*/ ctx[71].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearths5*/ ctx[71].stricken[4] || 0}) С пострадавшими и погибшими`;
  			add_location(b, file$5, 865, 31, 28511);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 865, 2, 28482);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[14];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$5, 867, 30, 28596);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 867, 3, 28569);
  			add_location(legend, file$5, 870, 4, 28711);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 1;
  			input1.value = input1.__value;
  			input1.checked = input1_checked_value = /*hearths_period_type_5*/ ctx[34] === 1;
  			attr_dev(input1, "id", "hearths_period_type_51");
  			attr_dev(input1, "name", "hearths_period_type_5");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[123][4].push(input1);
  			add_location(input1, file$5, 872, 5, 28786);
  			attr_dev(label, "for", "hearths_period_type_51");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 872, 195, 28976);
  			attr_dev(div2, "class", "pLine margin svelte-1jsovbn");
  			add_location(div2, file$5, 873, 5, 29045);
  			attr_dev(div3, "class", "pLine type svelte-1jsovbn");
  			add_location(div3, file$5, 871, 4, 28756);
  			add_location(fieldset, file$5, 869, 3, 28696);
  			attr_dev(div4, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div4, file$5, 868, 3, 28666);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$5, 883, 5, 29539);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_type5*/ ctx[33] === void 0) add_render_callback(() => /*select0_change_handler_1*/ ctx[131].call(select0));
  			add_location(select0, file$5, 882, 4, 29426);
  			attr_dev(div5, "class", "pLine svelte-1jsovbn");
  			add_location(div5, file$5, 881, 3, 29402);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$5, 895, 5, 30013);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$5, 896, 5, 30091);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$5, 897, 5, 30177);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$5, 898, 5, 30267);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$5, 899, 5, 30364);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken5*/ ctx[32] === void 0) add_render_callback(() => /*select1_change_handler_1*/ ctx[132].call(select1));
  			add_location(select1, file$5, 894, 4, 29936);
  			attr_dev(div6, "class", "pLine svelte-1jsovbn");
  			add_location(div6, file$5, 893, 3, 29912);
  			attr_dev(div7, "class", "filtersCont svelte-1jsovbn");
  			add_location(div7, file$5, 866, 2, 28540);
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
  			input1.checked = input1.__value === /*hearths_period_type_5*/ ctx[34];
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

  			select_options(select0, /*str_icon_type5*/ ctx[33]);
  			append_dev(div7, t13);
  			append_dev(div7, div6);
  			append_dev(div6, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken5*/ ctx[32]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[81], false, false, false),
  				listen_dev(input1, "change", /*setFilterHearths5*/ ctx[93], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler*/ ctx[129]),
  				listen_dev(select0, "change", /*select0_change_handler_1*/ ctx[131]),
  				listen_dev(select0, "change", /*setFilterHearths5*/ ctx[93], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_1*/ ctx[132]),
  				listen_dev(select1, "change", /*setFilterHearths5*/ ctx[93], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 16384 && input0.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (dirty[1] & /*hearths_period_type_5*/ 8 && input1_checked_value !== (input1_checked_value = /*hearths_period_type_5*/ ctx[34] === 1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_5*/ 8) {
  				input1.checked = input1.__value === /*hearths_period_type_5*/ ctx[34];
  			}

  			if (dirty[0] & /*DtpHearths5*/ 4 | dirty[1] & /*hearths_year_5, hearths_period_type_5*/ 24 | dirty[3] & /*setFilterHearths5*/ 1) {
  				each_value_19 = Object.keys(/*DtpHearths5*/ ctx[2]._opt.years).sort();
  				validate_each_argument(each_value_19);
  				let i;

  				for (i = 0; i < each_value_19.length; i += 1) {
  					const child_ctx = get_each_context_19(ctx, each_value_19, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_19(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div2, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_19.length;
  			}

  			if (dirty[2] & /*optTypeHearths5Keys, optDataHearths5*/ 1536) {
  				each_value_18 = /*optTypeHearths5Keys*/ ctx[72];
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

  			if (dirty[1] & /*str_icon_type5*/ 4) {
  				select_options(select0, /*str_icon_type5*/ ctx[33]);
  			}

  			if (dirty[1] & /*hearths_stricken5*/ 2) {
  				select_option(select1, /*hearths_stricken5*/ ctx[32]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div7);
  			/*$$binding_groups*/ ctx[123][4].splice(/*$$binding_groups*/ ctx[123][4].indexOf(input1), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_16.name,
  		type: "if",
  		source: "(865:2) {#if DtpHearths5._map && DtpHearths5._opt && DtpHearths5._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (875:5) {#each Object.keys(DtpHearths5._opt.years).sort() as key}
  function create_each_block_19(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[170] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_5");
  			input.checked = input_checked_value = /*hearths_year_5*/ ctx[35][/*key*/ ctx[170]];
  			input.disabled = input_disabled_value = /*hearths_period_type_5*/ ctx[34] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[170]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 875, 6, 29141);
  			attr_dev(label, "for", "hearths_year_5");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 875, 161, 29296);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths5*/ ctx[93], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths5*/ 4 | dirty[1] & /*hearths_year_5*/ 16 && input_checked_value !== (input_checked_value = /*hearths_year_5*/ ctx[35][/*key*/ ctx[170]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_5*/ 8 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_5*/ ctx[34] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths5*/ 4 && input_name_value !== (input_name_value = /*key*/ ctx[170])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths5*/ 4 && t_value !== (t_value = /*key*/ ctx[170] + "")) set_data_dev(t, t_value);
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
  		source: "(875:5) {#each Object.keys(DtpHearths5._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (887:5) {#each optTypeHearths5Keys as key}
  function create_each_block_18(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearths5*/ ctx[71].str_icon_type[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearths5*/ ctx[71].iconType[/*key*/ ctx[170]] + " svelte-1jsovbn");
  			add_location(option, file$5, 887, 6, 29731);
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
  		source: "(887:5) {#each optTypeHearths5Keys as key}",
  		ctx
  	});

  	return block;
  }

  // (906:2) {#if DtpHearths3._map && DtpHearths3._opt && DtpHearths3._opt.years}
  function create_if_block_15(ctx) {
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
  	let each_value_17 = Object.keys(/*DtpHearths3*/ ctx[3]._opt.years).sort();
  	validate_each_argument(each_value_17);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_17.length; i += 1) {
  		each_blocks_1[i] = create_each_block_17(get_each_context_17(ctx, each_value_17, i));
  	}

  	let each_value_16 = /*optTypeHearths3Keys*/ ctx[70];
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
						Все типы (${/*optTypeHearths3Keys*/ ctx[70].reduce(/*func_3*/ ctx[134], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t13 = space();
  			div6 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearths3*/ ctx[69].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearths3*/ ctx[69].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearths3*/ ctx[69].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearths3*/ ctx[69].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearths3*/ ctx[69].stricken[4] || 0}) С пострадавшими и погибшими`;
  			add_location(b, file$5, 906, 31, 30598);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 906, 2, 30569);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[14];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$5, 908, 30, 30683);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 908, 3, 30656);
  			add_location(legend, file$5, 911, 4, 30798);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 1;
  			input1.value = input1.__value;
  			input1.checked = input1_checked_value = /*hearths_period_type_3*/ ctx[38] === 1;
  			attr_dev(input1, "id", "hearths_period_type_31");
  			attr_dev(input1, "name", "hearths_period_type_3");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[123][3].push(input1);
  			add_location(input1, file$5, 913, 5, 30873);
  			attr_dev(label, "for", "hearths_period_type_31");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 913, 195, 31063);
  			attr_dev(div2, "class", "pLine margin svelte-1jsovbn");
  			add_location(div2, file$5, 914, 5, 31132);
  			attr_dev(div3, "class", "pLine type svelte-1jsovbn");
  			add_location(div3, file$5, 912, 4, 30843);
  			add_location(fieldset, file$5, 910, 3, 30783);
  			attr_dev(div4, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div4, file$5, 909, 3, 30753);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$5, 924, 5, 31626);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_type3*/ ctx[37] === void 0) add_render_callback(() => /*select0_change_handler_2*/ ctx[135].call(select0));
  			add_location(select0, file$5, 923, 4, 31513);
  			attr_dev(div5, "class", "pLine svelte-1jsovbn");
  			add_location(div5, file$5, 922, 3, 31489);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$5, 936, 5, 32100);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$5, 937, 5, 32178);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$5, 938, 5, 32264);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$5, 939, 5, 32354);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$5, 940, 5, 32451);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken3*/ ctx[36] === void 0) add_render_callback(() => /*select1_change_handler_2*/ ctx[136].call(select1));
  			add_location(select1, file$5, 935, 4, 32023);
  			attr_dev(div6, "class", "pLine svelte-1jsovbn");
  			add_location(div6, file$5, 934, 3, 31999);
  			attr_dev(div7, "class", "filtersCont svelte-1jsovbn");
  			add_location(div7, file$5, 907, 2, 30627);
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
  			input1.checked = input1.__value === /*hearths_period_type_3*/ ctx[38];
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

  			select_options(select0, /*str_icon_type3*/ ctx[37]);
  			append_dev(div7, t13);
  			append_dev(div7, div6);
  			append_dev(div6, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken3*/ ctx[36]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[81], false, false, false),
  				listen_dev(input1, "change", /*setFilterHearths3*/ ctx[94], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_1*/ ctx[133]),
  				listen_dev(select0, "change", /*select0_change_handler_2*/ ctx[135]),
  				listen_dev(select0, "change", /*setFilterHearths3*/ ctx[94], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_2*/ ctx[136]),
  				listen_dev(select1, "change", /*setFilterHearths3*/ ctx[94], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 16384 && input0.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (dirty[1] & /*hearths_period_type_3*/ 128 && input1_checked_value !== (input1_checked_value = /*hearths_period_type_3*/ ctx[38] === 1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_3*/ 128) {
  				input1.checked = input1.__value === /*hearths_period_type_3*/ ctx[38];
  			}

  			if (dirty[0] & /*DtpHearths3*/ 8 | dirty[1] & /*hearths_year_3, hearths_period_type_3*/ 384 | dirty[3] & /*setFilterHearths3*/ 2) {
  				each_value_17 = Object.keys(/*DtpHearths3*/ ctx[3]._opt.years).sort();
  				validate_each_argument(each_value_17);
  				let i;

  				for (i = 0; i < each_value_17.length; i += 1) {
  					const child_ctx = get_each_context_17(ctx, each_value_17, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_17(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div2, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_17.length;
  			}

  			if (dirty[2] & /*optTypeHearths3Keys, optDataHearths3*/ 384) {
  				each_value_16 = /*optTypeHearths3Keys*/ ctx[70];
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

  			if (dirty[1] & /*str_icon_type3*/ 64) {
  				select_options(select0, /*str_icon_type3*/ ctx[37]);
  			}

  			if (dirty[1] & /*hearths_stricken3*/ 32) {
  				select_option(select1, /*hearths_stricken3*/ ctx[36]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div7);
  			/*$$binding_groups*/ ctx[123][3].splice(/*$$binding_groups*/ ctx[123][3].indexOf(input1), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_15.name,
  		type: "if",
  		source: "(906:2) {#if DtpHearths3._map && DtpHearths3._opt && DtpHearths3._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (916:5) {#each Object.keys(DtpHearths3._opt.years).sort() as key}
  function create_each_block_17(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[170] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_3");
  			input.checked = input_checked_value = /*hearths_year_3*/ ctx[39][/*key*/ ctx[170]];
  			input.disabled = input_disabled_value = /*hearths_period_type_3*/ ctx[38] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[170]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 916, 6, 31228);
  			attr_dev(label, "for", "hearths_year_3");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 916, 161, 31383);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths3*/ ctx[94], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths3*/ 8 | dirty[1] & /*hearths_year_3*/ 256 && input_checked_value !== (input_checked_value = /*hearths_year_3*/ ctx[39][/*key*/ ctx[170]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_3*/ 128 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_3*/ ctx[38] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths3*/ 8 && input_name_value !== (input_name_value = /*key*/ ctx[170])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths3*/ 8 && t_value !== (t_value = /*key*/ ctx[170] + "")) set_data_dev(t, t_value);
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
  		source: "(916:5) {#each Object.keys(DtpHearths3._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (928:5) {#each optTypeHearths3Keys as key}
  function create_each_block_16(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearths3*/ ctx[69].str_icon_type[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearths3*/ ctx[69].iconType[/*key*/ ctx[170]] + " svelte-1jsovbn");
  			add_location(option, file$5, 928, 6, 31818);
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
  		source: "(928:5) {#each optTypeHearths3Keys as key}",
  		ctx
  	});

  	return block;
  }

  // (947:2) {#if DtpHearthsStat._map && DtpHearthsStat._opt && DtpHearthsStat._opt.years}
  function create_if_block_14(ctx) {
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
  	let each_value_15 = Object.keys(/*DtpHearthsStat*/ ctx[9]._opt.years).sort();
  	validate_each_argument(each_value_15);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_15.length; i += 1) {
  		each_blocks_2[i] = create_each_block_15(get_each_context_15(ctx, each_value_15, i));
  	}

  	let each_value_13 = Object.keys(/*DtpHearthsStat*/ ctx[9]._opt.years).sort();
  	validate_each_argument(each_value_13);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_13.length; i += 1) {
  		each_blocks_1[i] = create_each_block_13(get_each_context_13(ctx, each_value_13, i));
  	}

  	let each_value_12 = /*optTypeHearthsStatKeys*/ ctx[68];
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
						Все типы (${/*optTypeHearthsStatKeys*/ ctx[68].reduce(/*func_4*/ ctx[139], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t16 = space();
  			div8 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearthsStat*/ ctx[67].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearthsStat*/ ctx[67].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearthsStat*/ ctx[67].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearthsStat*/ ctx[67].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearthsStat*/ ctx[67].stricken[4] || 0}) С пострадавшими и погибшими`;
  			add_location(b, file$5, 947, 31, 32694);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 947, 2, 32665);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[14];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$5, 949, 30, 32782);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 949, 3, 32755);
  			add_location(legend, file$5, 952, 4, 32897);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 1;
  			input1.value = input1.__value;
  			input1.checked = input1_checked_value = /*hearths_period_type_Stat*/ ctx[42] === 1;
  			attr_dev(input1, "id", "hearths_period_type_Stat1");
  			attr_dev(input1, "name", "hearths_period_type_Stat");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[123][2].push(input1);
  			add_location(input1, file$5, 954, 5, 32972);
  			attr_dev(label0, "for", "hearths_period_type_Stat1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$5, 954, 210, 33177);
  			attr_dev(div2, "class", "pLine margin svelte-1jsovbn");
  			add_location(div2, file$5, 955, 5, 33249);
  			attr_dev(div3, "class", "pLine type svelte-1jsovbn");
  			add_location(div3, file$5, 953, 4, 32942);
  			attr_dev(input2, "type", "radio");
  			input2.__value = input2_value_value = 2;
  			input2.value = input2.__value;
  			attr_dev(input2, "id", "hearths_period_type_Stat2");
  			attr_dev(input2, "name", "hearths_period_type_Stat");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[123][2].push(input2);
  			add_location(input2, file$5, 962, 4, 33629);
  			attr_dev(label1, "for", "hearths_period_type_Stat2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$5, 962, 168, 33793);
  			attr_dev(div4, "class", "pLine margin svelte-1jsovbn");
  			add_location(div4, file$5, 963, 5, 33869);
  			attr_dev(div5, "class", "pLine type svelte-1jsovbn");
  			add_location(div5, file$5, 961, 4, 33600);
  			add_location(fieldset, file$5, 951, 3, 32882);
  			attr_dev(div6, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div6, file$5, 950, 3, 32852);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$5, 976, 5, 34563);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_typeStat*/ ctx[41] === void 0) add_render_callback(() => /*select0_change_handler_3*/ ctx[140].call(select0));
  			add_location(select0, file$5, 975, 4, 34444);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$5, 974, 3, 34420);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$5, 988, 5, 35058);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$5, 989, 5, 35139);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$5, 990, 5, 35228);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$5, 991, 5, 35321);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$5, 992, 5, 35421);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_strickenStat*/ ctx[40] === void 0) add_render_callback(() => /*select1_change_handler_3*/ ctx[141].call(select1));
  			add_location(select1, file$5, 987, 4, 34975);
  			attr_dev(div8, "class", "pLine svelte-1jsovbn");
  			add_location(div8, file$5, 986, 3, 34951);
  			attr_dev(div9, "class", "filtersCont svelte-1jsovbn");
  			add_location(div9, file$5, 948, 2, 32726);
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
  			input1.checked = input1.__value === /*hearths_period_type_Stat*/ ctx[42];
  			append_dev(div3, label0);
  			append_dev(div3, t8);
  			append_dev(div3, div2);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(div2, null);
  			}

  			append_dev(fieldset, t9);
  			append_dev(fieldset, div5);
  			append_dev(div5, input2);
  			input2.checked = input2.__value === /*hearths_period_type_Stat*/ ctx[42];
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

  			select_options(select0, /*str_icon_typeStat*/ ctx[41]);
  			append_dev(div9, t16);
  			append_dev(div9, div8);
  			append_dev(div8, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_strickenStat*/ ctx[40]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[81], false, false, false),
  				listen_dev(input1, "change", /*setFilterHearthsStat*/ ctx[95], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_2*/ ctx[137]),
  				listen_dev(input2, "change", /*setFilterHearthsStat*/ ctx[95], false, false, false),
  				listen_dev(input2, "change", /*input2_change_handler_1*/ ctx[138]),
  				listen_dev(select0, "change", /*select0_change_handler_3*/ ctx[140]),
  				listen_dev(select0, "change", /*setFilterHearthsStat*/ ctx[95], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_3*/ ctx[141]),
  				listen_dev(select1, "change", /*setFilterHearthsStat*/ ctx[95], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 16384 && input0.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 2048 && input1_checked_value !== (input1_checked_value = /*hearths_period_type_Stat*/ ctx[42] === 1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 2048) {
  				input1.checked = input1.__value === /*hearths_period_type_Stat*/ ctx[42];
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 512 | dirty[1] & /*hearths_year_Stat, hearths_period_type_Stat*/ 6144 | dirty[3] & /*setFilterHearthsStat*/ 4) {
  				each_value_15 = Object.keys(/*DtpHearthsStat*/ ctx[9]._opt.years).sort();
  				validate_each_argument(each_value_15);
  				let i;

  				for (i = 0; i < each_value_15.length; i += 1) {
  					const child_ctx = get_each_context_15(ctx, each_value_15, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_2[i] = create_each_block_15(child_ctx);
  						each_blocks_2[i].c();
  						each_blocks_2[i].m(div2, null);
  					}
  				}

  				for (; i < each_blocks_2.length; i += 1) {
  					each_blocks_2[i].d(1);
  				}

  				each_blocks_2.length = each_value_15.length;
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 2048) {
  				input2.checked = input2.__value === /*hearths_period_type_Stat*/ ctx[42];
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 512 | dirty[1] & /*hearths_quarter_Stat, hearths_period_type_Stat*/ 10240 | dirty[3] & /*setFilterHearthsStat*/ 4) {
  				each_value_13 = Object.keys(/*DtpHearthsStat*/ ctx[9]._opt.years).sort();
  				validate_each_argument(each_value_13);
  				let i;

  				for (i = 0; i < each_value_13.length; i += 1) {
  					const child_ctx = get_each_context_13(ctx, each_value_13, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_13(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div4, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_13.length;
  			}

  			if (dirty[2] & /*optTypeHearthsStatKeys, optDataHearthsStat*/ 96) {
  				each_value_12 = /*optTypeHearthsStatKeys*/ ctx[68];
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

  			if (dirty[1] & /*str_icon_typeStat*/ 1024) {
  				select_options(select0, /*str_icon_typeStat*/ ctx[41]);
  			}

  			if (dirty[1] & /*hearths_strickenStat*/ 512) {
  				select_option(select1, /*hearths_strickenStat*/ ctx[40]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div9);
  			/*$$binding_groups*/ ctx[123][2].splice(/*$$binding_groups*/ ctx[123][2].indexOf(input1), 1);
  			destroy_each(each_blocks_2, detaching);
  			/*$$binding_groups*/ ctx[123][2].splice(/*$$binding_groups*/ ctx[123][2].indexOf(input2), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_14.name,
  		type: "if",
  		source: "(947:2) {#if DtpHearthsStat._map && DtpHearthsStat._opt && DtpHearthsStat._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (957:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}
  function create_each_block_15(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[170] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_Stat");
  			input.checked = input_checked_value = /*hearths_year_Stat*/ ctx[43][/*key*/ ctx[170]];
  			input.disabled = input_disabled_value = /*hearths_period_type_Stat*/ ctx[42] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[170]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 957, 6, 33348);
  			attr_dev(label, "for", "hearths_year_Stat");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 957, 173, 33515);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsStat*/ ctx[95], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsStat*/ 512 | dirty[1] & /*hearths_year_Stat*/ 4096 && input_checked_value !== (input_checked_value = /*hearths_year_Stat*/ ctx[43][/*key*/ ctx[170]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 2048 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_Stat*/ ctx[42] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 512 && input_name_value !== (input_name_value = /*key*/ ctx[170])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 512 && t_value !== (t_value = /*key*/ ctx[170] + "")) set_data_dev(t, t_value);
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
  		source: "(957:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (966:6) {#each Object.keys(DtpHearthsStat._opt.years[key]).sort() as key1}
  function create_each_block_14(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t0_value = /*key1*/ ctx[183] + "";
  	let t0;
  	let t1;
  	let t2_value = /*key*/ ctx[170] + "";
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
  			input.checked = input_checked_value = /*hearths_quarter_Stat*/ ctx[44][/*key*/ ctx[170]] && /*hearths_quarter_Stat*/ ctx[44][/*key*/ ctx[170]][/*key1*/ ctx[183]];
  			input.disabled = input_disabled_value = /*hearths_period_type_Stat*/ ctx[42] === 1;
  			attr_dev(input, "name", input_name_value = "" + (/*key*/ ctx[170] + "_" + /*key1*/ ctx[183]));
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 966, 7, 34042);
  			attr_dev(label, "for", label_for_value = "hearths_quarter_Stat_" + /*key*/ ctx[170] + "_" + /*key1*/ ctx[183]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 966, 222, 34257);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t0);
  			append_dev(label, t1);
  			append_dev(label, t2);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsStat*/ ctx[95], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsStat*/ 512 | dirty[1] & /*hearths_quarter_Stat*/ 8192 && input_checked_value !== (input_checked_value = /*hearths_quarter_Stat*/ ctx[44][/*key*/ ctx[170]] && /*hearths_quarter_Stat*/ ctx[44][/*key*/ ctx[170]][/*key1*/ ctx[183]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_Stat*/ 2048 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_Stat*/ ctx[42] === 1)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 512 && input_name_value !== (input_name_value = "" + (/*key*/ ctx[170] + "_" + /*key1*/ ctx[183]))) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsStat*/ 512 && t0_value !== (t0_value = /*key1*/ ctx[183] + "")) set_data_dev(t0, t0_value);
  			if (dirty[0] & /*DtpHearthsStat*/ 512 && t2_value !== (t2_value = /*key*/ ctx[170] + "")) set_data_dev(t2, t2_value);

  			if (dirty[0] & /*DtpHearthsStat*/ 512 && label_for_value !== (label_for_value = "hearths_quarter_Stat_" + /*key*/ ctx[170] + "_" + /*key1*/ ctx[183])) {
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
  		source: "(966:6) {#each Object.keys(DtpHearthsStat._opt.years[key]).sort() as key1}",
  		ctx
  	});

  	return block;
  }

  // (965:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}
  function create_each_block_13(ctx) {
  	let t;
  	let br;
  	let each_value_14 = Object.keys(/*DtpHearthsStat*/ ctx[9]._opt.years[/*key*/ ctx[170]]).sort();
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
  			add_location(br, file$5, 968, 6, 34349);
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, t, anchor);
  			insert_dev(target, br, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsStat*/ 512 | dirty[1] & /*hearths_quarter_Stat, hearths_period_type_Stat*/ 10240 | dirty[3] & /*setFilterHearthsStat*/ 4) {
  				each_value_14 = Object.keys(/*DtpHearthsStat*/ ctx[9]._opt.years[/*key*/ ctx[170]]).sort();
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
  		source: "(965:5) {#each Object.keys(DtpHearthsStat._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (980:5) {#each optTypeHearthsStatKeys as key}
  function create_each_block_12(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsStat*/ ctx[67].str_icon_type[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearthsStat*/ ctx[67].iconType[/*key*/ ctx[170]] + " svelte-1jsovbn");
  			add_location(option, file$5, 980, 6, 34764);
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
  		source: "(980:5) {#each optTypeHearthsStatKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (999:2) {#if DtpHearthsTmp._map && DtpHearthsTmp._opt && DtpHearthsTmp._opt.years}
  function create_if_block_13(ctx) {
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
  	let each_value_11 = Object.keys(/*DtpHearthsTmp*/ ctx[10]._opt.years).sort();
  	validate_each_argument(each_value_11);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_11.length; i += 1) {
  		each_blocks_2[i] = create_each_block_11(get_each_context_11(ctx, each_value_11, i));
  	}

  	let each_value_9 = Object.keys(/*DtpHearthsTmp*/ ctx[10]._opt.years).sort();
  	validate_each_argument(each_value_9);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_9.length; i += 1) {
  		each_blocks_1[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
  	}

  	let each_value_8 = /*optTypeHearthsTmpKeys*/ ctx[66];
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
						Все типы (${/*optTypeHearthsTmpKeys*/ ctx[66].reduce(/*func_5*/ ctx[144], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t16 = space();
  			div8 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearthsTmp*/ ctx[65].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearthsTmp*/ ctx[65].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearthsTmp*/ ctx[65].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearthsTmp*/ ctx[65].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearthsTmp*/ ctx[65].stricken[4] || 0}) С пострадавшими и погибшими`;
  			add_location(b, file$5, 999, 31, 35664);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 999, 2, 35635);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[14];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$5, 1001, 30, 35751);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 1001, 3, 35724);
  			add_location(legend, file$5, 1004, 4, 35866);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 1;
  			input1.value = input1.__value;
  			input1.checked = input1_checked_value = /*hearths_period_type_tmp*/ ctx[47] === 1;
  			attr_dev(input1, "id", "hearths_period_type_tmp1");
  			attr_dev(input1, "name", "hearths_period_type_tmp");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[123][1].push(input1);
  			add_location(input1, file$5, 1006, 5, 35941);
  			attr_dev(label0, "for", "hearths_period_type_tmp1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$5, 1006, 205, 36141);
  			attr_dev(div2, "class", "pLine margin svelte-1jsovbn");
  			add_location(div2, file$5, 1007, 5, 36212);
  			attr_dev(div3, "class", "pLine type svelte-1jsovbn");
  			add_location(div3, file$5, 1005, 4, 35911);
  			attr_dev(input2, "type", "radio");
  			input2.__value = input2_value_value = 2;
  			input2.value = input2.__value;
  			attr_dev(input2, "id", "hearths_period_type_tmp2");
  			attr_dev(input2, "name", "hearths_period_type_tmp");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[123][1].push(input2);
  			add_location(input2, file$5, 1014, 4, 36586);
  			attr_dev(label1, "for", "hearths_period_type_tmp2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$5, 1014, 164, 36746);
  			attr_dev(div4, "class", "pLine margin svelte-1jsovbn");
  			add_location(div4, file$5, 1015, 5, 36821);
  			attr_dev(div5, "class", "pLine type svelte-1jsovbn");
  			add_location(div5, file$5, 1013, 4, 36557);
  			add_location(fieldset, file$5, 1003, 3, 35851);
  			attr_dev(div6, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div6, file$5, 1002, 3, 35821);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$5, 1042, 5, 38059);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_typeTmp*/ ctx[46] === void 0) add_render_callback(() => /*select0_change_handler_4*/ ctx[145].call(select0));
  			add_location(select0, file$5, 1041, 4, 37942);
  			attr_dev(div7, "class", "pLine svelte-1jsovbn");
  			add_location(div7, file$5, 1040, 3, 37918);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$5, 1054, 5, 38547);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$5, 1055, 5, 38627);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$5, 1056, 5, 38715);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$5, 1057, 5, 38807);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$5, 1058, 5, 38906);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_strickenTmp*/ ctx[45] === void 0) add_render_callback(() => /*select1_change_handler_4*/ ctx[146].call(select1));
  			add_location(select1, file$5, 1053, 4, 38466);
  			attr_dev(div8, "class", "pLine svelte-1jsovbn");
  			add_location(div8, file$5, 1052, 3, 38442);
  			attr_dev(div9, "class", "filtersCont svelte-1jsovbn");
  			add_location(div9, file$5, 1000, 2, 35695);
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
  			input1.checked = input1.__value === /*hearths_period_type_tmp*/ ctx[47];
  			append_dev(div3, label0);
  			append_dev(div3, t8);
  			append_dev(div3, div2);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(div2, null);
  			}

  			append_dev(fieldset, t9);
  			append_dev(fieldset, div5);
  			append_dev(div5, input2);
  			input2.checked = input2.__value === /*hearths_period_type_tmp*/ ctx[47];
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

  			select_options(select0, /*str_icon_typeTmp*/ ctx[46]);
  			append_dev(div9, t16);
  			append_dev(div9, div8);
  			append_dev(div8, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_strickenTmp*/ ctx[45]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[81], false, false, false),
  				listen_dev(input1, "change", /*setFilterHearthsTmp*/ ctx[96], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_3*/ ctx[142]),
  				listen_dev(input2, "change", /*setFilterHearthsTmp*/ ctx[96], false, false, false),
  				listen_dev(input2, "change", /*input2_change_handler_2*/ ctx[143]),
  				listen_dev(select0, "change", /*select0_change_handler_4*/ ctx[145]),
  				listen_dev(select0, "change", /*setFilterHearthsTmp*/ ctx[96], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_4*/ ctx[146]),
  				listen_dev(select1, "change", /*setFilterHearthsTmp*/ ctx[96], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 16384 && input0.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 65536 && input1_checked_value !== (input1_checked_value = /*hearths_period_type_tmp*/ ctx[47] === 1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 65536) {
  				input1.checked = input1.__value === /*hearths_period_type_tmp*/ ctx[47];
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 | dirty[1] & /*hearths_year_tmp, hearths_period_type_tmp*/ 196608 | dirty[3] & /*setFilterHearthsTmp*/ 8) {
  				each_value_11 = Object.keys(/*DtpHearthsTmp*/ ctx[10]._opt.years).sort();
  				validate_each_argument(each_value_11);
  				let i;

  				for (i = 0; i < each_value_11.length; i += 1) {
  					const child_ctx = get_each_context_11(ctx, each_value_11, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_2[i] = create_each_block_11(child_ctx);
  						each_blocks_2[i].c();
  						each_blocks_2[i].m(div2, null);
  					}
  				}

  				for (; i < each_blocks_2.length; i += 1) {
  					each_blocks_2[i].d(1);
  				}

  				each_blocks_2.length = each_value_11.length;
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 65536) {
  				input2.checked = input2.__value === /*hearths_period_type_tmp*/ ctx[47];
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 | dirty[1] & /*hearths_quarter_tmp, hearths_period_type_tmp*/ 327680 | dirty[3] & /*setFilterHearthsTmp*/ 8) {
  				each_value_9 = Object.keys(/*DtpHearthsTmp*/ ctx[10]._opt.years).sort();
  				validate_each_argument(each_value_9);
  				let i;

  				for (i = 0; i < each_value_9.length; i += 1) {
  					const child_ctx = get_each_context_9(ctx, each_value_9, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_9(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div4, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_9.length;
  			}

  			if (dirty[2] & /*optTypeHearthsTmpKeys, optDataHearthsTmp*/ 24) {
  				each_value_8 = /*optTypeHearthsTmpKeys*/ ctx[66];
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

  			if (dirty[1] & /*str_icon_typeTmp*/ 32768) {
  				select_options(select0, /*str_icon_typeTmp*/ ctx[46]);
  			}

  			if (dirty[1] & /*hearths_strickenTmp*/ 16384) {
  				select_option(select1, /*hearths_strickenTmp*/ ctx[45]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div9);
  			/*$$binding_groups*/ ctx[123][1].splice(/*$$binding_groups*/ ctx[123][1].indexOf(input1), 1);
  			destroy_each(each_blocks_2, detaching);
  			/*$$binding_groups*/ ctx[123][1].splice(/*$$binding_groups*/ ctx[123][1].indexOf(input2), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_13.name,
  		type: "if",
  		source: "(999:2) {#if DtpHearthsTmp._map && DtpHearthsTmp._opt && DtpHearthsTmp._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1009:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}
  function create_each_block_11(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[170] + "";
  	let t;
  	let dispose;

  	const block = {
  		c: function create() {
  			input = element("input");
  			label = element("label");
  			t = text(t_value);
  			attr_dev(input, "type", "checkbox");
  			attr_dev(input, "id", "hearths_year_tmp");
  			input.checked = input_checked_value = /*hearths_year_tmp*/ ctx[48][/*key*/ ctx[170]];
  			input.disabled = input_disabled_value = /*hearths_period_type_tmp*/ ctx[47] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[170]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 1009, 6, 36310);
  			attr_dev(label, "for", "hearths_year_tmp");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 1009, 169, 36473);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsTmp*/ ctx[96], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 | dirty[1] & /*hearths_year_tmp*/ 131072 && input_checked_value !== (input_checked_value = /*hearths_year_tmp*/ ctx[48][/*key*/ ctx[170]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 65536 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_tmp*/ ctx[47] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 && input_name_value !== (input_name_value = /*key*/ ctx[170])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 && t_value !== (t_value = /*key*/ ctx[170] + "")) set_data_dev(t, t_value);
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
  		source: "(1009:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1018:6) {#each Object.keys(DtpHearthsTmp._opt.years[key]).sort() as key1}
  function create_each_block_10(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t0_value = /*key1*/ ctx[183] + "";
  	let t0;
  	let t1;
  	let t2_value = /*key*/ ctx[170] + "";
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
  			input.checked = input_checked_value = /*hearths_quarter_tmp*/ ctx[49][/*key*/ ctx[170]] && /*hearths_quarter_tmp*/ ctx[49][/*key*/ ctx[170]][/*key1*/ ctx[183]];
  			input.disabled = input_disabled_value = /*hearths_period_type_tmp*/ ctx[47] === 1;
  			attr_dev(input, "name", input_name_value = "" + (/*key*/ ctx[170] + "_" + /*key1*/ ctx[183]));
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 1018, 7, 36992);
  			attr_dev(label, "for", label_for_value = "hearths_quarter_tmp_" + /*key*/ ctx[170] + "_" + /*key1*/ ctx[183]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 1018, 217, 37202);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t0);
  			append_dev(label, t1);
  			append_dev(label, t2);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearthsTmp*/ ctx[96], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 | dirty[1] & /*hearths_quarter_tmp*/ 262144 && input_checked_value !== (input_checked_value = /*hearths_quarter_tmp*/ ctx[49][/*key*/ ctx[170]] && /*hearths_quarter_tmp*/ ctx[49][/*key*/ ctx[170]][/*key1*/ ctx[183]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type_tmp*/ 65536 && input_disabled_value !== (input_disabled_value = /*hearths_period_type_tmp*/ ctx[47] === 1)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 && input_name_value !== (input_name_value = "" + (/*key*/ ctx[170] + "_" + /*key1*/ ctx[183]))) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 && t0_value !== (t0_value = /*key1*/ ctx[183] + "")) set_data_dev(t0, t0_value);
  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 && t2_value !== (t2_value = /*key*/ ctx[170] + "")) set_data_dev(t2, t2_value);

  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 && label_for_value !== (label_for_value = "hearths_quarter_tmp_" + /*key*/ ctx[170] + "_" + /*key1*/ ctx[183])) {
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
  		source: "(1018:6) {#each Object.keys(DtpHearthsTmp._opt.years[key]).sort() as key1}",
  		ctx
  	});

  	return block;
  }

  // (1017:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}
  function create_each_block_9(ctx) {
  	let t;
  	let br;
  	let each_value_10 = Object.keys(/*DtpHearthsTmp*/ ctx[10]._opt.years[/*key*/ ctx[170]]).sort();
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
  			add_location(br, file$5, 1020, 6, 37293);
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, t, anchor);
  			insert_dev(target, br, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 1024 | dirty[1] & /*hearths_quarter_tmp, hearths_period_type_tmp*/ 327680 | dirty[3] & /*setFilterHearthsTmp*/ 8) {
  				each_value_10 = Object.keys(/*DtpHearthsTmp*/ ctx[10]._opt.years[/*key*/ ctx[170]]).sort();
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
  		source: "(1017:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1046:5) {#each optTypeHearthsTmpKeys as key}
  function create_each_block_8(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearthsTmp*/ ctx[65].str_icon_type[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearthsTmp*/ ctx[65].iconType[/*key*/ ctx[170]] + " svelte-1jsovbn");
  			add_location(option, file$5, 1046, 6, 38257);
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
  		source: "(1046:5) {#each optTypeHearthsTmpKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1065:2) {#if DtpHearths._map && DtpHearths._opt && DtpHearths._opt.years}
  function create_if_block_12(ctx) {
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
  	let each_value_7 = Object.keys(/*DtpHearths*/ ctx[11]._opt.years).sort();
  	validate_each_argument(each_value_7);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_7.length; i += 1) {
  		each_blocks_2[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
  	}

  	let each_value_5 = Object.keys(/*DtpHearths*/ ctx[11]._opt.years).sort();
  	validate_each_argument(each_value_5);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_5.length; i += 1) {
  		each_blocks_1[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
  	}

  	let each_value_4 = /*optTypeHearthsKeys*/ ctx[64];
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
						Все типы (${/*optTypeHearthsKeys*/ ctx[64].reduce(/*func_6*/ ctx[149], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t17 = space();
  			div9 = element("div");
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = `(${/*optDataHearths*/ ctx[63].stricken[0] || 0}) Очаги все`;
  			option2 = element("option");
  			option2.textContent = `(${/*optDataHearths*/ ctx[63].stricken[1] || 0}) Только с погибшими`;
  			option3 = element("option");
  			option3.textContent = `(${/*optDataHearths*/ ctx[63].stricken[2] || 0}) Только с пострадавшими`;
  			option4 = element("option");
  			option4.textContent = `(${/*optDataHearths*/ ctx[63].stricken[3] || 0}) С пострадавшими или погибшими`;
  			option5 = element("option");
  			option5.textContent = `(${/*optDataHearths*/ ctx[63].stricken[4] || 0}) С пострадавшими и погибшими`;
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$5, 1065, 21, 39129);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 1065, 2, 39110);
  			add_location(b, file$5, 1066, 31, 39171);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 1066, 2, 39142);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[14];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$5, 1068, 30, 39252);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$5, 1068, 3, 39225);
  			add_location(legend, file$5, 1071, 4, 39367);
  			attr_dev(input1, "type", "radio");
  			input1.__value = input1_value_value = 1;
  			input1.value = input1.__value;
  			input1.checked = input1_checked_value = /*hearths_period_type*/ ctx[52] === 1;
  			attr_dev(input1, "id", "hearths_period_type1");
  			attr_dev(input1, "name", "hearths_period_type");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[123][0].push(input1);
  			add_location(input1, file$5, 1073, 5, 39442);
  			attr_dev(label0, "for", "hearths_period_type1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$5, 1073, 186, 39623);
  			attr_dev(div3, "class", "pLine margin svelte-1jsovbn");
  			add_location(div3, file$5, 1074, 5, 39690);
  			attr_dev(div4, "class", "pLine type svelte-1jsovbn");
  			add_location(div4, file$5, 1072, 4, 39412);
  			attr_dev(input2, "type", "radio");
  			input2.__value = input2_value_value = 2;
  			input2.value = input2.__value;
  			attr_dev(input2, "id", "hearths_period_type2");
  			attr_dev(input2, "name", "hearths_period_type");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			/*$$binding_groups*/ ctx[123][0].push(input2);
  			add_location(input2, file$5, 1081, 4, 40047);
  			attr_dev(label1, "for", "hearths_period_type2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$5, 1081, 149, 40192);
  			attr_dev(div5, "class", "pLine margin svelte-1jsovbn");
  			add_location(div5, file$5, 1082, 5, 40263);
  			attr_dev(div6, "class", "pLine type svelte-1jsovbn");
  			add_location(div6, file$5, 1080, 4, 40018);
  			add_location(fieldset, file$5, 1070, 3, 39352);
  			attr_dev(div7, "class", "pLine nowrap svelte-1jsovbn");
  			add_location(div7, file$5, 1069, 3, 39322);
  			option0.__value = "";
  			option0.value = option0.__value;
  			attr_dev(option0, "class", "svelte-1jsovbn");
  			add_location(option0, file$5, 1095, 5, 40912);
  			attr_dev(select0, "class", "multiple_icon_typeTmp svelte-1jsovbn");
  			select0.multiple = true;
  			if (/*str_icon_type*/ ctx[51] === void 0) add_render_callback(() => /*select0_change_handler_5*/ ctx[150].call(select0));
  			add_location(select0, file$5, 1094, 4, 40801);
  			attr_dev(div8, "class", "pLine svelte-1jsovbn");
  			add_location(div8, file$5, 1093, 3, 40777);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$5, 1107, 5, 41379);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$5, 1108, 5, 41456);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$5, 1109, 5, 41541);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$5, 1110, 5, 41630);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$5, 1111, 5, 41726);
  			attr_dev(select1, "class", "svelte-1jsovbn");
  			if (/*hearths_stricken*/ ctx[50] === void 0) add_render_callback(() => /*select1_change_handler_5*/ ctx[151].call(select1));
  			add_location(select1, file$5, 1106, 4, 41304);
  			attr_dev(div9, "class", "pLine svelte-1jsovbn");
  			add_location(div9, file$5, 1105, 3, 41280);
  			attr_dev(div10, "class", "filtersCont svelte-1jsovbn");
  			add_location(div10, file$5, 1067, 2, 39196);
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
  			input1.checked = input1.__value === /*hearths_period_type*/ ctx[52];
  			append_dev(div4, label0);
  			append_dev(div4, t9);
  			append_dev(div4, div3);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(div3, null);
  			}

  			append_dev(fieldset, t10);
  			append_dev(fieldset, div6);
  			append_dev(div6, input2);
  			input2.checked = input2.__value === /*hearths_period_type*/ ctx[52];
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

  			select_options(select0, /*str_icon_type*/ ctx[51]);
  			append_dev(div10, t17);
  			append_dev(div10, div9);
  			append_dev(div9, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_stricken*/ ctx[50]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[81], false, false, false),
  				listen_dev(input1, "change", /*setFilterHearths*/ ctx[97], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_4*/ ctx[147]),
  				listen_dev(input2, "change", /*setFilterHearths*/ ctx[97], false, false, false),
  				listen_dev(input2, "change", /*input2_change_handler_3*/ ctx[148]),
  				listen_dev(select0, "change", /*select0_change_handler_5*/ ctx[150]),
  				listen_dev(select0, "change", /*setFilterHearths*/ ctx[97], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_5*/ ctx[151]),
  				listen_dev(select1, "change", /*setFilterHearths*/ ctx[97], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 16384 && input0.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (dirty[1] & /*hearths_period_type*/ 2097152 && input1_checked_value !== (input1_checked_value = /*hearths_period_type*/ ctx[52] === 1)) {
  				prop_dev(input1, "checked", input1_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type*/ 2097152) {
  				input1.checked = input1.__value === /*hearths_period_type*/ ctx[52];
  			}

  			if (dirty[0] & /*DtpHearths*/ 2048 | dirty[1] & /*hearths_year, hearths_period_type*/ 6291456 | dirty[3] & /*setFilterHearths*/ 16) {
  				each_value_7 = Object.keys(/*DtpHearths*/ ctx[11]._opt.years).sort();
  				validate_each_argument(each_value_7);
  				let i;

  				for (i = 0; i < each_value_7.length; i += 1) {
  					const child_ctx = get_each_context_7(ctx, each_value_7, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_2[i] = create_each_block_7(child_ctx);
  						each_blocks_2[i].c();
  						each_blocks_2[i].m(div3, null);
  					}
  				}

  				for (; i < each_blocks_2.length; i += 1) {
  					each_blocks_2[i].d(1);
  				}

  				each_blocks_2.length = each_value_7.length;
  			}

  			if (dirty[1] & /*hearths_period_type*/ 2097152) {
  				input2.checked = input2.__value === /*hearths_period_type*/ ctx[52];
  			}

  			if (dirty[0] & /*DtpHearths*/ 2048 | dirty[1] & /*hearths_quarter, hearths_period_type*/ 10485760 | dirty[3] & /*setFilterHearths*/ 16) {
  				each_value_5 = Object.keys(/*DtpHearths*/ ctx[11]._opt.years).sort();
  				validate_each_argument(each_value_5);
  				let i;

  				for (i = 0; i < each_value_5.length; i += 1) {
  					const child_ctx = get_each_context_5(ctx, each_value_5, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_5(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(div5, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_5.length;
  			}

  			if (dirty[2] & /*optTypeHearthsKeys, optDataHearths*/ 6) {
  				each_value_4 = /*optTypeHearthsKeys*/ ctx[64];
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

  			if (dirty[1] & /*str_icon_type*/ 1048576) {
  				select_options(select0, /*str_icon_type*/ ctx[51]);
  			}

  			if (dirty[1] & /*hearths_stricken*/ 524288) {
  				select_option(select1, /*hearths_stricken*/ ctx[50]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div10);
  			/*$$binding_groups*/ ctx[123][0].splice(/*$$binding_groups*/ ctx[123][0].indexOf(input1), 1);
  			destroy_each(each_blocks_2, detaching);
  			/*$$binding_groups*/ ctx[123][0].splice(/*$$binding_groups*/ ctx[123][0].indexOf(input2), 1);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_12.name,
  		type: "if",
  		source: "(1065:2) {#if DtpHearths._map && DtpHearths._opt && DtpHearths._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (1076:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}
  function create_each_block_7(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t_value = /*key*/ ctx[170] + "";
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
  			input.checked = input_checked_value = /*hearths_year*/ ctx[53][/*key*/ ctx[170]];
  			input.disabled = input_disabled_value = /*hearths_period_type*/ ctx[52] === 2;
  			attr_dev(input, "name", input_name_value = /*key*/ ctx[170]);
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 1076, 6, 39785);
  			attr_dev(label, "for", label_for_value = "hearths_year" + /*key*/ ctx[170]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 1076, 154, 39933);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths*/ ctx[97], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 2048 | dirty[1] & /*hearths_year*/ 4194304 && input_checked_value !== (input_checked_value = /*hearths_year*/ ctx[53][/*key*/ ctx[170]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type*/ 2097152 && input_disabled_value !== (input_disabled_value = /*hearths_period_type*/ ctx[52] === 2)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 2048 && input_name_value !== (input_name_value = /*key*/ ctx[170])) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 2048 && t_value !== (t_value = /*key*/ ctx[170] + "")) set_data_dev(t, t_value);

  			if (dirty[0] & /*DtpHearths*/ 2048 && label_for_value !== (label_for_value = "hearths_year" + /*key*/ ctx[170])) {
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
  		source: "(1076:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1085:6) {#each Object.keys(DtpHearths._opt.years[key]).sort() as key1}
  function create_each_block_6(ctx) {
  	let input;
  	let input_checked_value;
  	let input_disabled_value;
  	let input_name_value;
  	let label;
  	let t0_value = /*key1*/ ctx[183] + "";
  	let t0;
  	let t1;
  	let t2_value = /*key*/ ctx[170] + "";
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
  			input.checked = input_checked_value = /*hearths_quarter*/ ctx[54][/*key*/ ctx[170]] && /*hearths_quarter*/ ctx[54][/*key*/ ctx[170]][/*key1*/ ctx[183]];
  			input.disabled = input_disabled_value = /*hearths_period_type*/ ctx[52] === 1;
  			attr_dev(input, "name", input_name_value = "" + (/*key*/ ctx[170] + "_" + /*key1*/ ctx[183]));
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 1085, 7, 40428);
  			attr_dev(label, "for", label_for_value = "hearths_quarter_" + /*key*/ ctx[170] + "_" + /*key1*/ ctx[183]);
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 1085, 198, 40619);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, input, anchor);
  			insert_dev(target, label, anchor);
  			append_dev(label, t0);
  			append_dev(label, t1);
  			append_dev(label, t2);
  			if (remount) dispose();
  			dispose = listen_dev(input, "change", /*setFilterHearths*/ ctx[97], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 2048 | dirty[1] & /*hearths_quarter*/ 8388608 && input_checked_value !== (input_checked_value = /*hearths_quarter*/ ctx[54][/*key*/ ctx[170]] && /*hearths_quarter*/ ctx[54][/*key*/ ctx[170]][/*key1*/ ctx[183]])) {
  				prop_dev(input, "checked", input_checked_value);
  			}

  			if (dirty[1] & /*hearths_period_type*/ 2097152 && input_disabled_value !== (input_disabled_value = /*hearths_period_type*/ ctx[52] === 1)) {
  				prop_dev(input, "disabled", input_disabled_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 2048 && input_name_value !== (input_name_value = "" + (/*key*/ ctx[170] + "_" + /*key1*/ ctx[183]))) {
  				attr_dev(input, "name", input_name_value);
  			}

  			if (dirty[0] & /*DtpHearths*/ 2048 && t0_value !== (t0_value = /*key1*/ ctx[183] + "")) set_data_dev(t0, t0_value);
  			if (dirty[0] & /*DtpHearths*/ 2048 && t2_value !== (t2_value = /*key*/ ctx[170] + "")) set_data_dev(t2, t2_value);

  			if (dirty[0] & /*DtpHearths*/ 2048 && label_for_value !== (label_for_value = "hearths_quarter_" + /*key*/ ctx[170] + "_" + /*key1*/ ctx[183])) {
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
  		source: "(1085:6) {#each Object.keys(DtpHearths._opt.years[key]).sort() as key1}",
  		ctx
  	});

  	return block;
  }

  // (1084:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}
  function create_each_block_5(ctx) {
  	let t;
  	let br;
  	let each_value_6 = Object.keys(/*DtpHearths*/ ctx[11]._opt.years[/*key*/ ctx[170]]).sort();
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
  			add_location(br, file$5, 1087, 6, 40706);
  		},
  		m: function mount(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert_dev(target, t, anchor);
  			insert_dev(target, br, anchor);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 2048 | dirty[1] & /*hearths_quarter, hearths_period_type*/ 10485760 | dirty[3] & /*setFilterHearths*/ 16) {
  				each_value_6 = Object.keys(/*DtpHearths*/ ctx[11]._opt.years[/*key*/ ctx[170]]).sort();
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
  		source: "(1084:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (1099:5) {#each optTypeHearthsKeys as key}
  function create_each_block_4(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataHearths*/ ctx[63].str_icon_type[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataHearths*/ ctx[63].iconType[/*key*/ ctx[170]] + " svelte-1jsovbn");
  			add_location(option, file$5, 1099, 6, 41101);
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
  		source: "(1099:5) {#each optTypeHearthsKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1143:184) 
  function create_if_block_11(ctx) {
  	let div;

  	const block = {
  		c: function create() {
  			div = element("div");
  			div.textContent = "Нет включенных слоев";
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$5, 1143, 3, 43285);
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
  		source: "(1143:184) ",
  		ctx
  	});

  	return block;
  }

  // (1118:2) {#if DtpVerifyed._map || DtpSkpdi._map || DtpGibdd._map || DtpGibddRub._map}
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
  	let input5_checked_value;
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
  			t7 = text(/*minOpacity*/ ctx[24]);
  			t8 = text(")");
  			t9 = space();
  			br1 = element("br");
  			t10 = space();
  			label1 = element("label");
  			input3 = element("input");
  			span1 = element("span");
  			t11 = text("Радиус (");
  			t12 = text(/*radius*/ ctx[22]);
  			t13 = text(")");
  			t14 = space();
  			br2 = element("br");
  			t15 = space();
  			label2 = element("label");
  			input4 = element("input");
  			span2 = element("span");
  			t16 = text("Размытие (");
  			t17 = text(/*blur*/ ctx[23]);
  			t18 = text(")");
  			t19 = space();
  			div3 = element("div");
  			input5 = element("input");
  			label3 = element("label");
  			label3.textContent = "- тепловая карта";
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$5, 1118, 21, 41957);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 1118, 2, 41938);
  			attr_dev(button0, "class", "pika-prev");
  			add_location(button0, file$5, 1120, 3, 42001);
  			attr_dev(input0, "type", "text");
  			attr_dev(input0, "class", "begDate svelte-1jsovbn");
  			add_location(input0, file$5, 1121, 3, 42058);
  			attr_dev(input1, "type", "text");
  			attr_dev(input1, "class", "endDate svelte-1jsovbn");
  			add_location(input1, file$5, 1122, 3, 42119);
  			attr_dev(button1, "class", "pika-next");
  			add_location(button1, file$5, 1123, 3, 42180);
  			attr_dev(div1, "class", "pikaday pLine svelte-1jsovbn");
  			add_location(div1, file$5, 1119, 2, 41970);
  			add_location(br0, file$5, 1126, 4, 42270);
  			attr_dev(input2, "type", "range");
  			attr_dev(input2, "min", "0.05");
  			attr_dev(input2, "max", "1");
  			attr_dev(input2, "step", "0.01");
  			input2.disabled = input2_disabled_value = !/*heat*/ ctx[77];
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$5, 1128, 5, 42294);
  			add_location(span0, file$5, 1128, 122, 42411);
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$5, 1127, 4, 42281);
  			add_location(br1, file$5, 1130, 4, 42468);
  			attr_dev(input3, "type", "range");
  			attr_dev(input3, "min", "0");
  			attr_dev(input3, "max", "100");
  			attr_dev(input3, "step", "1");
  			input3.disabled = input3_disabled_value = !/*heat*/ ctx[77];
  			attr_dev(input3, "class", "svelte-1jsovbn");
  			add_location(input3, file$5, 1132, 5, 42492);
  			add_location(span1, file$5, 1132, 114, 42601);
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$5, 1131, 4, 42479);
  			add_location(br2, file$5, 1134, 4, 42649);
  			attr_dev(input4, "type", "range");
  			attr_dev(input4, "min", "0");
  			attr_dev(input4, "max", "15");
  			attr_dev(input4, "step", "0.01");
  			input4.disabled = input4_disabled_value = !/*heat*/ ctx[77];
  			attr_dev(input4, "class", "svelte-1jsovbn");
  			add_location(input4, file$5, 1136, 5, 42673);
  			add_location(span2, file$5, 1136, 114, 42782);
  			attr_dev(label2, "class", "svelte-1jsovbn");
  			add_location(label2, file$5, 1135, 4, 42660);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$5, 1125, 3, 42246);
  			attr_dev(input5, "type", "checkbox");
  			input5.checked = input5_checked_value = /*DtpGibddRub*/ ctx[7]._needHeat || /*DtpGibdd*/ ctx[6]._needHeat || /*DtpSkpdi*/ ctx[5]._needHeat || /*DtpVerifyed*/ ctx[4]._needHeat;
  			attr_dev(input5, "name", "heat");
  			attr_dev(input5, "class", "svelte-1jsovbn");
  			add_location(input5, file$5, 1140, 4, 42863);
  			attr_dev(label3, "for", "heat");
  			attr_dev(label3, "class", "svelte-1jsovbn");
  			add_location(label3, file$5, 1140, 184, 43043);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$5, 1139, 3, 42839);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, button0);
  			append_dev(div1, t1);
  			append_dev(div1, input0);
  			/*input0_binding*/ ctx[152](input0);
  			append_dev(div1, t2);
  			append_dev(div1, input1);
  			/*input1_binding*/ ctx[153](input1);
  			append_dev(div1, t3);
  			append_dev(div1, button1);
  			insert_dev(target, t4, anchor);
  			insert_dev(target, div2, anchor);
  			append_dev(div2, br0);
  			append_dev(div2, t5);
  			append_dev(div2, label0);
  			append_dev(label0, input2);
  			set_input_value(input2, /*minOpacity*/ ctx[24]);
  			append_dev(label0, span0);
  			append_dev(span0, t6);
  			append_dev(span0, t7);
  			append_dev(span0, t8);
  			append_dev(div2, t9);
  			append_dev(div2, br1);
  			append_dev(div2, t10);
  			append_dev(div2, label1);
  			append_dev(label1, input3);
  			set_input_value(input3, /*radius*/ ctx[22]);
  			append_dev(label1, span1);
  			append_dev(span1, t11);
  			append_dev(span1, t12);
  			append_dev(span1, t13);
  			append_dev(div2, t14);
  			append_dev(div2, br2);
  			append_dev(div2, t15);
  			append_dev(div2, label2);
  			append_dev(label2, input4);
  			set_input_value(input4, /*blur*/ ctx[23]);
  			append_dev(label2, span2);
  			append_dev(span2, t16);
  			append_dev(span2, t17);
  			append_dev(span2, t18);
  			insert_dev(target, t19, anchor);
  			insert_dev(target, div3, anchor);
  			append_dev(div3, input5);
  			/*input5_binding*/ ctx[157](input5);
  			append_dev(div3, label3);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(button0, "click", /*onPrev*/ ctx[91], false, false, false),
  				listen_dev(button1, "click", /*onNext*/ ctx[92], false, false, false),
  				listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[154]),
  				listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[154]),
  				listen_dev(input2, "input", /*setMinOpacity*/ ctx[85], false, false, false),
  				listen_dev(input3, "change", /*input3_change_input_handler*/ ctx[155]),
  				listen_dev(input3, "input", /*input3_change_input_handler*/ ctx[155]),
  				listen_dev(input3, "input", /*setMinOpacity*/ ctx[85], false, false, false),
  				listen_dev(input4, "change", /*input4_change_input_handler*/ ctx[156]),
  				listen_dev(input4, "input", /*input4_change_input_handler*/ ctx[156]),
  				listen_dev(input4, "input", /*setMinOpacity*/ ctx[85], false, false, false),
  				listen_dev(input5, "change", /*setHeat*/ ctx[84], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*minOpacity*/ 16777216) {
  				set_input_value(input2, /*minOpacity*/ ctx[24]);
  			}

  			if (dirty[0] & /*minOpacity*/ 16777216) set_data_dev(t7, /*minOpacity*/ ctx[24]);

  			if (dirty[0] & /*radius*/ 4194304) {
  				set_input_value(input3, /*radius*/ ctx[22]);
  			}

  			if (dirty[0] & /*radius*/ 4194304) set_data_dev(t12, /*radius*/ ctx[22]);

  			if (dirty[0] & /*blur*/ 8388608) {
  				set_input_value(input4, /*blur*/ ctx[23]);
  			}

  			if (dirty[0] & /*blur*/ 8388608) set_data_dev(t17, /*blur*/ ctx[23]);

  			if (dirty[0] & /*DtpGibddRub, DtpGibdd, DtpSkpdi, DtpVerifyed*/ 240 && input5_checked_value !== (input5_checked_value = /*DtpGibddRub*/ ctx[7]._needHeat || /*DtpGibdd*/ ctx[6]._needHeat || /*DtpSkpdi*/ ctx[5]._needHeat || /*DtpVerifyed*/ ctx[4]._needHeat)) {
  				prop_dev(input5, "checked", input5_checked_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			/*input0_binding*/ ctx[152](null);
  			/*input1_binding*/ ctx[153](null);
  			if (detaching) detach_dev(t4);
  			if (detaching) detach_dev(div2);
  			if (detaching) detach_dev(t19);
  			if (detaching) detach_dev(div3);
  			/*input5_binding*/ ctx[157](null);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_10.name,
  		type: "if",
  		source: "(1118:2) {#if DtpVerifyed._map || DtpSkpdi._map || DtpGibdd._map || DtpGibddRub._map}",
  		ctx
  	});

  	return block;
  }

  // (1147:2) {#if DtpVerifyed._map}
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
  	let label0;
  	let t7;
  	let t8;
  	let div4;
  	let input2;
  	let label1;
  	let t10;
  	let dispose;

  	function select_block_type_1(ctx, dirty) {
  		if (/*DtpVerifyed*/ ctx[4]._arm) return create_if_block_9;
  		return create_else_block$1;
  	}

  	let current_block_type = select_block_type_1(ctx);
  	let if_block0 = current_block_type(ctx);
  	let if_block1 = /*optData*/ ctx[55].collision_type && create_if_block_8(ctx);

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
  			div5 = element("div");
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
  			if (if_block1) if_block1.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$5, 1147, 21, 43386);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 1147, 2, 43367);
  			add_location(b, file$5, 1148, 31, 43428);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 1148, 2, 43399);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[14];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$5, 1150, 30, 43511);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$5, 1150, 3, 43484);
  			attr_dev(input1, "type", "radio");
  			attr_dev(input1, "id", "d0");
  			attr_dev(input1, "name", "drone");
  			input1.value = "0";
  			input1.checked = true;
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$5, 1151, 22, 43600);
  			attr_dev(label0, "for", "d0");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$5, 1151, 98, 43676);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$5, 1151, 3, 43581);
  			attr_dev(input2, "type", "radio");
  			attr_dev(input2, "id", "d3");
  			attr_dev(input2, "name", "drone");
  			input2.value = "3";
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$5, 1158, 22, 44205);
  			attr_dev(label1, "for", "d3");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$5, 1158, 92, 44275);
  			attr_dev(div4, "class", "pLine svelte-1jsovbn");
  			add_location(div4, file$5, 1158, 3, 44186);
  			attr_dev(div5, "class", "filtersCont svelte-1jsovbn");
  			add_location(div5, file$5, 1149, 2, 43455);
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
  			append_dev(div5, t7);
  			if_block0.m(div5, null);
  			append_dev(div5, t8);
  			append_dev(div5, div4);
  			append_dev(div4, input2);
  			append_dev(div4, label1);
  			append_dev(div5, t10);
  			if (if_block1) if_block1.m(div5, null);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[81], false, false, false),
  				listen_dev(input1, "click", /*oncheck*/ ctx[90], false, false, false),
  				listen_dev(input2, "click", /*oncheck*/ ctx[90], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 16384 && input0.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
  				if_block0.p(ctx, dirty);
  			} else {
  				if_block0.d(1);
  				if_block0 = current_block_type(ctx);

  				if (if_block0) {
  					if_block0.c();
  					if_block0.m(div5, t8);
  				}
  			}

  			if (/*optData*/ ctx[55].collision_type) if_block1.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div5);
  			if_block0.d();
  			if (if_block1) if_block1.d();
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_7$1.name,
  		type: "if",
  		source: "(1147:2) {#if DtpVerifyed._map}",
  		ctx
  	});

  	return block;
  }

  // (1155:3) {:else}
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
  			add_location(input0, file$5, 1155, 22, 43922);
  			attr_dev(label0, "for", "d1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$5, 1155, 90, 43990);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 1155, 3, 43903);
  			attr_dev(input1, "type", "radio");
  			attr_dev(input1, "id", "d2");
  			attr_dev(input1, "name", "drone");
  			input1.value = "2";
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$5, 1156, 22, 44061);
  			attr_dev(label1, "for", "d2");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$5, 1156, 92, 44131);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 1156, 3, 44042);
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
  				listen_dev(input0, "click", /*oncheck*/ ctx[90], false, false, false),
  				listen_dev(input1, "click", /*oncheck*/ ctx[90], false, false, false)
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
  		source: "(1155:3) {:else}",
  		ctx
  	});

  	return block;
  }

  // (1153:3) {#if DtpVerifyed._arm}
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
  			add_location(input, file$5, 1153, 22, 43758);
  			attr_dev(label, "for", "d1");
  			attr_dev(label, "class", "svelte-1jsovbn");
  			add_location(label, file$5, 1153, 90, 43826);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$5, 1153, 3, 43739);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, input);
  			append_dev(div, label);
  			if (remount) dispose();
  			dispose = listen_dev(input, "click", /*oncheck*/ ctx[90], false, false, false);
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
  		source: "(1153:3) {#if DtpVerifyed._arm}",
  		ctx
  	});

  	return block;
  }

  // (1160:3) {#if optData.collision_type}
  function create_if_block_8(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_3 = /*optCollisionKeys*/ ctx[56];
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
						Все типы (${/*optCollisionKeys*/ ctx[56].reduce(/*func_7*/ ctx[158], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$5, 1162, 5, 44479);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type*/ ctx[18] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[159].call(select));
  			add_location(select, file$5, 1161, 4, 44377);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$5, 1160, 3, 44353);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type*/ ctx[18]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_1*/ ctx[159]),
  				listen_dev(select, "change", /*setFilter*/ ctx[86], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*optCollisionKeys, optData*/ 50331648) {
  				each_value_3 = /*optCollisionKeys*/ ctx[56];
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

  			if (dirty[0] & /*collision_type*/ 262144) {
  				select_options(select, /*collision_type*/ ctx[18]);
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
  		source: "(1160:3) {#if optData.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1166:5) {#each optCollisionKeys as key}
  function create_each_block_3(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optData*/ ctx[55].collision_type[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optData*/ ctx[55].iconType[/*key*/ ctx[170]] + " svelte-1jsovbn");
  			add_location(option, file$5, 1166, 6, 44658);
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
  		source: "(1166:5) {#each optCollisionKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1177:2) {#if DtpSkpdi._map}
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
  	let if_block = /*optDataSkpdi*/ ctx[57].collision_type && create_if_block_6$1(ctx);

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
  			div3 = element("div");
  			div2 = element("div");
  			t4 = text("ID ДТП: ");
  			input = element("input");
  			t5 = space();
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$5, 1177, 21, 44891);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 1177, 2, 44872);
  			add_location(b, file$5, 1178, 31, 44933);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 1178, 2, 44904);
  			attr_dev(input, "type", "text");
  			input.value = /*id_dtp*/ ctx[14];
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 1180, 30, 45014);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$5, 1180, 3, 44987);
  			attr_dev(div3, "class", "filtersCont svelte-1jsovbn");
  			add_location(div3, file$5, 1179, 2, 44958);
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
  			dispose = listen_dev(input, "input", /*oncheckIdDtp*/ ctx[81], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 16384 && input.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (/*optDataSkpdi*/ ctx[57].collision_type) if_block.p(ctx, dirty);
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
  		source: "(1177:2) {#if DtpSkpdi._map}",
  		ctx
  	});

  	return block;
  }

  // (1182:3) {#if optDataSkpdi.collision_type}
  function create_if_block_6$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_2 = /*optCollisionSkpdiKeys*/ ctx[58];
  	validate_each_argument(each_value_2);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_2.length; i += 1) {
  		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
  	}

  	const block = {
  		c: function create() {
  			div = element("div");
  			select = element("select");
  			option = element("option");

  			option.textContent = `
						Все типы (${/*optCollisionSkpdiKeys*/ ctx[58].reduce(/*func_8*/ ctx[160], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$5, 1184, 5, 45258);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_skpdi*/ ctx[19] === void 0) add_render_callback(() => /*select_change_handler_2*/ ctx[161].call(select));
  			add_location(select, file$5, 1183, 4, 45145);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$5, 1182, 3, 45121);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_skpdi*/ ctx[19]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_2*/ ctx[161]),
  				listen_dev(select, "change", /*setFilterSkpdi*/ ctx[89], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*optCollisionSkpdiKeys, optDataSkpdi*/ 201326592) {
  				each_value_2 = /*optCollisionSkpdiKeys*/ ctx[58];
  				validate_each_argument(each_value_2);
  				let i;

  				for (i = 0; i < each_value_2.length; i += 1) {
  					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_2$1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_2.length;
  			}

  			if (dirty[0] & /*collision_type_skpdi*/ 524288) {
  				select_options(select, /*collision_type_skpdi*/ ctx[19]);
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
  		source: "(1182:3) {#if optDataSkpdi.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1188:5) {#each optCollisionSkpdiKeys as key}
  function create_each_block_2$1(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataSkpdi*/ ctx[57].collision_type[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataSkpdi*/ ctx[57].iconType[/*key*/ ctx[170]] + " svelte-1jsovbn");
  			add_location(option, file$5, 1188, 6, 45452);
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
  		id: create_each_block_2$1.name,
  		type: "each",
  		source: "(1188:5) {#each optCollisionSkpdiKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1199:2) {#if DtpGibdd._map}
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
  	let if_block = /*optDataGibdd*/ ctx[59].collision_type && create_if_block_4$1(ctx);

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
  			div3 = element("div");
  			div2 = element("div");
  			t4 = text("ID ДТП: ");
  			input = element("input");
  			t5 = space();
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-1jsovbn");
  			add_location(hr, file$5, 1199, 21, 45695);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 1199, 2, 45676);
  			add_location(b, file$5, 1200, 31, 45737);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 1200, 2, 45708);
  			attr_dev(input, "type", "text");
  			input.value = /*id_dtp*/ ctx[14];
  			attr_dev(input, "class", "svelte-1jsovbn");
  			add_location(input, file$5, 1202, 30, 45818);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$5, 1202, 3, 45791);
  			attr_dev(div3, "class", "filtersCont svelte-1jsovbn");
  			add_location(div3, file$5, 1201, 2, 45762);
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
  			dispose = listen_dev(input, "input", /*oncheckIdDtp*/ ctx[81], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 16384 && input.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (/*optDataGibdd*/ ctx[59].collision_type) if_block.p(ctx, dirty);
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
  		source: "(1199:2) {#if DtpGibdd._map}",
  		ctx
  	});

  	return block;
  }

  // (1204:3) {#if optDataGibdd.collision_type}
  function create_if_block_4$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_1 = /*optCollisionGibddKeys*/ ctx[60];
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
						Все типы (${/*optCollisionGibddKeys*/ ctx[60].reduce(/*func_9*/ ctx[162], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$5, 1206, 5, 46062);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_gibdd*/ ctx[20] === void 0) add_render_callback(() => /*select_change_handler_3*/ ctx[163].call(select));
  			add_location(select, file$5, 1205, 4, 45949);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$5, 1204, 3, 45925);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_gibdd*/ ctx[20]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_3*/ ctx[163]),
  				listen_dev(select, "change", /*setFilterGibdd*/ ctx[88], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*optCollisionGibddKeys, optDataGibdd*/ 805306368) {
  				each_value_1 = /*optCollisionGibddKeys*/ ctx[60];
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

  			if (dirty[0] & /*collision_type_gibdd*/ 1048576) {
  				select_options(select, /*collision_type_gibdd*/ ctx[20]);
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
  		source: "(1204:3) {#if optDataGibdd.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1210:5) {#each optCollisionGibddKeys as key}
  function create_each_block_1$2(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataGibdd*/ ctx[59].collision_type[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataGibdd*/ ctx[59].iconType[/*key*/ ctx[170]] + " svelte-1jsovbn");
  			add_location(option, file$5, 1210, 6, 46256);
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
  		source: "(1210:5) {#each optCollisionGibddKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1221:2) {#if DtpGibddRub._map}
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
  	let if_block = /*optDataGibddRub*/ ctx[61].collision_type && create_if_block_2$1(ctx);

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
  			add_location(hr, file$5, 1221, 21, 46502);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 1221, 2, 46483);
  			add_location(b, file$5, 1222, 31, 46544);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 1222, 2, 46515);
  			attr_dev(input0, "type", "text");
  			input0.value = /*id_dtp*/ ctx[14];
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$5, 1223, 30, 46606);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$5, 1223, 3, 46579);
  			attr_dev(input1, "type", "checkbox");
  			attr_dev(input1, "name", "list_rubOn");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$5, 1225, 3, 46698);
  			attr_dev(label0, "for", "list_rubOn");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$5, 1225, 100, 46795);
  			attr_dev(input2, "type", "checkbox");
  			attr_dev(input2, "name", "list_rubOff");
  			attr_dev(input2, "class", "svelte-1jsovbn");
  			add_location(input2, file$5, 1226, 3, 46844);
  			attr_dev(label1, "for", "list_rubOff");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$5, 1226, 102, 46943);
  			attr_dev(div3, "class", "pLine svelte-1jsovbn");
  			add_location(div3, file$5, 1224, 2, 46675);
  			attr_dev(div4, "class", "filtersCont svelte-1jsovbn");
  			add_location(div4, file$5, 1228, 2, 47002);
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
  			input1.checked = /*list_rubOn*/ ctx[30];
  			append_dev(div3, label0);
  			append_dev(div3, t7);
  			append_dev(div3, input2);
  			input2.checked = /*list_rubOff*/ ctx[31];
  			append_dev(div3, label1);
  			insert_dev(target, t9, anchor);
  			insert_dev(target, div4, anchor);
  			if (if_block) if_block.m(div4, null);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "input", /*oncheckIdDtp*/ ctx[81], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_5*/ ctx[164]),
  				listen_dev(input1, "change", /*setFilterGibddRub*/ ctx[87], false, false, false),
  				listen_dev(input2, "change", /*input2_change_handler_4*/ ctx[165]),
  				listen_dev(input2, "change", /*setFilterGibddRub*/ ctx[87], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*id_dtp*/ 16384 && input0.value !== /*id_dtp*/ ctx[14]) {
  				prop_dev(input0, "value", /*id_dtp*/ ctx[14]);
  			}

  			if (dirty[0] & /*list_rubOn*/ 1073741824) {
  				input1.checked = /*list_rubOn*/ ctx[30];
  			}

  			if (dirty[1] & /*list_rubOff*/ 1) {
  				input2.checked = /*list_rubOff*/ ctx[31];
  			}

  			if (/*optDataGibddRub*/ ctx[61].collision_type) if_block.p(ctx, dirty);
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
  		source: "(1221:2) {#if DtpGibddRub._map}",
  		ctx
  	});

  	return block;
  }

  // (1230:3) {#if optDataGibddRub.collision_type}
  function create_if_block_2$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value = /*optCollisionGibddRubKeys*/ ctx[62];
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
						Все типы (${/*optCollisionGibddRubKeys*/ ctx[62].reduce(/*func_10*/ ctx[166], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			attr_dev(option, "class", "svelte-1jsovbn");
  			add_location(option, file$5, 1232, 5, 47214);
  			attr_dev(select, "class", "multiple_icon_type svelte-1jsovbn");
  			select.multiple = true;
  			if (/*collision_type_gibddRub*/ ctx[21] === void 0) add_render_callback(() => /*select_change_handler_4*/ ctx[167].call(select));
  			add_location(select, file$5, 1231, 4, 47095);
  			attr_dev(div, "class", "pLine svelte-1jsovbn");
  			add_location(div, file$5, 1230, 3, 47071);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_options(select, /*collision_type_gibddRub*/ ctx[21]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_4*/ ctx[167]),
  				listen_dev(select, "change", /*setFilterGibddRub*/ ctx[87], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[1] & /*optDataGibddRub*/ 1073741824 | dirty[2] & /*optCollisionGibddRubKeys*/ 1) {
  				each_value = /*optCollisionGibddRubKeys*/ ctx[62];
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

  			if (dirty[0] & /*collision_type_gibddRub*/ 2097152) {
  				select_options(select, /*collision_type_gibddRub*/ ctx[21]);
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
  		source: "(1230:3) {#if optDataGibddRub.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (1236:5) {#each optCollisionGibddRubKeys as key}
  function create_each_block$4(ctx) {
  	let option;
  	let t0;
  	let t1_value = /*optDataGibddRub*/ ctx[61].collision_type[/*key*/ ctx[170]] + "";
  	let t1;
  	let t2;
  	let t3_value = /*key*/ ctx[170] + "";
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
  			option.__value = option_value_value = /*key*/ ctx[170];
  			option.value = option.__value;
  			attr_dev(option, "class", option_class_value = "icon_type_" + /*optDataGibddRub*/ ctx[61].iconType[/*key*/ ctx[170]] + " svelte-1jsovbn");
  			add_location(option, file$5, 1236, 6, 47417);
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
  		source: "(1236:5) {#each optCollisionGibddRubKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (1247:2) {#if Rub._map}
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
  			add_location(hr, file$5, 1247, 21, 47661);
  			attr_dev(div0, "class", "pLine svelte-1jsovbn");
  			add_location(div0, file$5, 1247, 2, 47642);
  			add_location(b, file$5, 1248, 31, 47703);
  			attr_dev(div1, "class", "pLine svelte-1jsovbn");
  			add_location(div1, file$5, 1248, 2, 47674);
  			attr_dev(input0, "type", "checkbox");
  			attr_dev(input0, "name", "comp1");
  			attr_dev(input0, "class", "svelte-1jsovbn");
  			add_location(input0, file$5, 1251, 4, 47779);
  			attr_dev(label0, "for", "comp1");
  			attr_dev(label0, "class", "svelte-1jsovbn");
  			add_location(label0, file$5, 1251, 82, 47857);
  			attr_dev(input1, "type", "checkbox");
  			attr_dev(input1, "name", "comp");
  			attr_dev(input1, "class", "svelte-1jsovbn");
  			add_location(input1, file$5, 1252, 4, 47906);
  			attr_dev(label1, "for", "comp");
  			attr_dev(label1, "class", "svelte-1jsovbn");
  			add_location(label1, file$5, 1252, 82, 47984);
  			attr_dev(div2, "class", "pLine svelte-1jsovbn");
  			add_location(div2, file$5, 1250, 3, 47755);
  			attr_dev(div3, "class", "filtersCont");
  			add_location(div3, file$5, 1249, 2, 47726);
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
  			input0.checked = /*compOn*/ ctx[26];
  			append_dev(div2, label0);
  			append_dev(div2, t5);
  			append_dev(div2, input1);
  			input1.checked = /*comp1On*/ ctx[27];
  			append_dev(div2, label1);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "change", /*input0_change_handler*/ ctx[168]),
  				listen_dev(input0, "change", /*setComp*/ ctx[78], false, false, false),
  				listen_dev(input1, "change", /*input1_change_handler_6*/ ctx[169]),
  				listen_dev(input1, "change", /*setComp*/ ctx[78], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*compOn*/ 67108864) {
  				input0.checked = /*compOn*/ ctx[26];
  			}

  			if (dirty[0] & /*comp1On*/ 134217728) {
  				input1.checked = /*comp1On*/ ctx[27];
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
  		source: "(1247:2) {#if Rub._map}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$5(ctx) {
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
  	let if_block0 = /*DtpHearthsPicket4*/ ctx[0]._map && /*DtpHearthsPicket4*/ ctx[0]._opt && /*DtpHearthsPicket4*/ ctx[0]._opt.years && create_if_block_18(ctx);
  	let if_block1 = /*DtpHearthsPicket*/ ctx[1]._map && /*DtpHearthsPicket*/ ctx[1]._opt && /*DtpHearthsPicket*/ ctx[1]._opt.years && create_if_block_17(ctx);
  	let if_block2 = /*DtpHearths5*/ ctx[2]._map && /*DtpHearths5*/ ctx[2]._opt && /*DtpHearths5*/ ctx[2]._opt.years && create_if_block_16(ctx);
  	let if_block3 = /*DtpHearths3*/ ctx[3]._map && /*DtpHearths3*/ ctx[3]._opt && /*DtpHearths3*/ ctx[3]._opt.years && create_if_block_15(ctx);
  	let if_block4 = /*DtpHearthsStat*/ ctx[9]._map && /*DtpHearthsStat*/ ctx[9]._opt && /*DtpHearthsStat*/ ctx[9]._opt.years && create_if_block_14(ctx);
  	let if_block5 = /*DtpHearthsTmp*/ ctx[10]._map && /*DtpHearthsTmp*/ ctx[10]._opt && /*DtpHearthsTmp*/ ctx[10]._opt.years && create_if_block_13(ctx);
  	let if_block6 = /*DtpHearths*/ ctx[11]._map && /*DtpHearths*/ ctx[11]._opt && /*DtpHearths*/ ctx[11]._opt.years && create_if_block_12(ctx);

  	function select_block_type(ctx, dirty) {
  		if (/*DtpVerifyed*/ ctx[4]._map || /*DtpSkpdi*/ ctx[5]._map || /*DtpGibdd*/ ctx[6]._map || /*DtpGibddRub*/ ctx[7]._map) return create_if_block_10;
  		if (!/*DtpHearths*/ ctx[11]._map && !/*DtpHearthsStat*/ ctx[9]._map && !/*DtpHearthsTmp*/ ctx[10]._map && !/*DtpHearthsPicket4*/ ctx[0]._map && !/*DtpHearthsPicket*/ ctx[1]._map && !/*DtpHearths3*/ ctx[3]._map && !/*DtpHearths5*/ ctx[2]._map && !/*Rub*/ ctx[8]._map) return create_if_block_11;
  	}

  	let current_block_type = select_block_type(ctx);
  	let if_block7 = current_block_type && current_block_type(ctx);
  	let if_block8 = /*DtpVerifyed*/ ctx[4]._map && create_if_block_7$1(ctx);
  	let if_block9 = /*DtpSkpdi*/ ctx[5]._map && create_if_block_5$1(ctx);
  	let if_block10 = /*DtpGibdd*/ ctx[6]._map && create_if_block_3$1(ctx);
  	let if_block11 = /*DtpGibddRub*/ ctx[7]._map && create_if_block_1$2(ctx);
  	let if_block12 = /*Rub*/ ctx[8]._map && create_if_block$3(ctx);

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
  			attr_dev(div, "class", "mvsFilters");
  			add_location(div, file$5, 792, 3, 24645);
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
  		},
  		p: function update(ctx, dirty) {
  			if (/*DtpHearthsPicket4*/ ctx[0]._map && /*DtpHearthsPicket4*/ ctx[0]._opt && /*DtpHearthsPicket4*/ ctx[0]._opt.years) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_18(ctx);
  					if_block0.c();
  					if_block0.m(div, t0);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*DtpHearthsPicket*/ ctx[1]._map && /*DtpHearthsPicket*/ ctx[1]._opt && /*DtpHearthsPicket*/ ctx[1]._opt.years) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_17(ctx);
  					if_block1.c();
  					if_block1.m(div, t1);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if (/*DtpHearths5*/ ctx[2]._map && /*DtpHearths5*/ ctx[2]._opt && /*DtpHearths5*/ ctx[2]._opt.years) {
  				if (if_block2) {
  					if_block2.p(ctx, dirty);
  				} else {
  					if_block2 = create_if_block_16(ctx);
  					if_block2.c();
  					if_block2.m(div, t2);
  				}
  			} else if (if_block2) {
  				if_block2.d(1);
  				if_block2 = null;
  			}

  			if (/*DtpHearths3*/ ctx[3]._map && /*DtpHearths3*/ ctx[3]._opt && /*DtpHearths3*/ ctx[3]._opt.years) {
  				if (if_block3) {
  					if_block3.p(ctx, dirty);
  				} else {
  					if_block3 = create_if_block_15(ctx);
  					if_block3.c();
  					if_block3.m(div, t3);
  				}
  			} else if (if_block3) {
  				if_block3.d(1);
  				if_block3 = null;
  			}

  			if (/*DtpHearthsStat*/ ctx[9]._map && /*DtpHearthsStat*/ ctx[9]._opt && /*DtpHearthsStat*/ ctx[9]._opt.years) {
  				if (if_block4) {
  					if_block4.p(ctx, dirty);
  				} else {
  					if_block4 = create_if_block_14(ctx);
  					if_block4.c();
  					if_block4.m(div, t4);
  				}
  			} else if (if_block4) {
  				if_block4.d(1);
  				if_block4 = null;
  			}

  			if (/*DtpHearthsTmp*/ ctx[10]._map && /*DtpHearthsTmp*/ ctx[10]._opt && /*DtpHearthsTmp*/ ctx[10]._opt.years) {
  				if (if_block5) {
  					if_block5.p(ctx, dirty);
  				} else {
  					if_block5 = create_if_block_13(ctx);
  					if_block5.c();
  					if_block5.m(div, t5);
  				}
  			} else if (if_block5) {
  				if_block5.d(1);
  				if_block5 = null;
  			}

  			if (/*DtpHearths*/ ctx[11]._map && /*DtpHearths*/ ctx[11]._opt && /*DtpHearths*/ ctx[11]._opt.years) {
  				if (if_block6) {
  					if_block6.p(ctx, dirty);
  				} else {
  					if_block6 = create_if_block_12(ctx);
  					if_block6.c();
  					if_block6.m(div, t6);
  				}
  			} else if (if_block6) {
  				if_block6.d(1);
  				if_block6 = null;
  			}

  			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block7) {
  				if_block7.p(ctx, dirty);
  			} else {
  				if (if_block7) if_block7.d(1);
  				if_block7 = current_block_type && current_block_type(ctx);

  				if (if_block7) {
  					if_block7.c();
  					if_block7.m(div, t7);
  				}
  			}

  			if (/*DtpVerifyed*/ ctx[4]._map) {
  				if (if_block8) {
  					if_block8.p(ctx, dirty);
  				} else {
  					if_block8 = create_if_block_7$1(ctx);
  					if_block8.c();
  					if_block8.m(div, t8);
  				}
  			} else if (if_block8) {
  				if_block8.d(1);
  				if_block8 = null;
  			}

  			if (/*DtpSkpdi*/ ctx[5]._map) {
  				if (if_block9) {
  					if_block9.p(ctx, dirty);
  				} else {
  					if_block9 = create_if_block_5$1(ctx);
  					if_block9.c();
  					if_block9.m(div, t9);
  				}
  			} else if (if_block9) {
  				if_block9.d(1);
  				if_block9 = null;
  			}

  			if (/*DtpGibdd*/ ctx[6]._map) {
  				if (if_block10) {
  					if_block10.p(ctx, dirty);
  				} else {
  					if_block10 = create_if_block_3$1(ctx);
  					if_block10.c();
  					if_block10.m(div, t10);
  				}
  			} else if (if_block10) {
  				if_block10.d(1);
  				if_block10 = null;
  			}

  			if (/*DtpGibddRub*/ ctx[7]._map) {
  				if (if_block11) {
  					if_block11.p(ctx, dirty);
  				} else {
  					if_block11 = create_if_block_1$2(ctx);
  					if_block11.c();
  					if_block11.m(div, t11);
  				}
  			} else if (if_block11) {
  				if_block11.d(1);
  				if_block11 = null;
  			}

  			if (/*Rub*/ ctx[8]._map) {
  				if (if_block12) {
  					if_block12.p(ctx, dirty);
  				} else {
  					if_block12 = create_if_block$3(ctx);
  					if_block12.c();
  					if_block12.m(div, null);
  				}
  			} else if (if_block12) {
  				if_block12.d(1);
  				if_block12 = null;
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

  			if (if_block7) {
  				if_block7.d();
  			}

  			if (if_block8) if_block8.d();
  			if (if_block9) if_block9.d();
  			if (if_block10) if_block10.d();
  			if (if_block11) if_block11.d();
  			if (if_block12) if_block12.d();
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
  	let { DtpHearthsPicket4 } = $$props;
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
  	let { control } = $$props;

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

  	

  	if (!DtpHearths5) {
  		DtpHearths5 = {};
  	}

  	

  	if (!DtpHearths3) {
  		DtpHearths3 = {};
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

  	let optDataHearthsPicket = (DtpHearthsPicket || {})._opt || {};

  	let optRoadTypes = optDataHearthsPicket.road
  	? Object.keys(optDataHearthsPicket.road).sort((a, b) => optDataHearthsPicket.road[b] - optDataHearthsPicket.road[a])
  	: [];

  	let optDataHearthsPicket4 = (DtpHearthsPicket4 || {})._opt || {};

  	let optRoadTypes4 = optDataHearthsPicket4.road
  	? Object.keys(optDataHearthsPicket4.road).sort((a, b) => optDataHearthsPicket4.road[b] - optDataHearthsPicket4.road[a])
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
  	let heatElementDtpGibdd;
  	let heatElementDtpSkpdi;
  	let heatElementDtpVerifyed;

  	let _comps = Rub && Rub._argFilters
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
  		if (DtpHearthsPicket._map) {
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
  		}
  	};

  	let hearths_stricken4;
  	let hearths_year_Picket4 = {};

  	Object.keys(optDataHearthsPicket4.years || {}).sort().forEach(key => {
  		$$invalidate(29, hearths_year_Picket4[key] = true, hearths_year_Picket4);
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
  					$$invalidate(29, hearths_year_Picket4[name] = checked, hearths_year_Picket4);
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
  		setFilterHearthsPicket4();
  		setFilterHearthsPicket();
  		setFilterHearths5({});
  		setFilterHearths3({});
  		setFilterHearths({});
  		setFilterHearthsTmp({});
  		setFilterHearthsStat({});
  		setFilterSkpdi();
  		setFilterGibdd();
  		setFilterGibddRub();
  		setFilter();
  	};

  	const oncheckIdDtp = ev => {
  		let target = ev.target, value = target.value;
  		$$invalidate(14, id_dtp = value ? value : null);
  		$$invalidate(98, control._id_dtp = id_dtp, control);
  		refresh();
  	};

  	const oncheckIdHearth = ev => {
  		let target = ev.target, value = target.value;
  		$$invalidate(17, id_hearth = value ? value : null);
  		setFilterHearthsPicket();
  		setFilterHearthsPicket4();
  	};

  	const oncheckHt = ev => {
  		let target = ev.target;
  		$$invalidate(16, ht[target.name] = target.checked, ht);
  		setFilterHearthsPicket();
  		setFilterHearthsPicket4();
  	};

  	const setHeat = ev => {
  		let target = ev.target;
  		$$invalidate(7, DtpGibddRub._needHeat = $$invalidate(6, DtpGibdd._needHeat = $$invalidate(5, DtpSkpdi._needHeat = $$invalidate(4, DtpVerifyed._needHeat = target.checked ? heat : false, DtpVerifyed), DtpSkpdi), DtpGibdd), DtpGibddRub);
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
  		if (DtpVerifyed._map) {
  			let opt = [{ type: "itemType", zn: currentFilter }];

  			if (id_dtp) {
  				opt.push({ type: "id_dtp", zn: id_dtp });
  			}

  			if (dateInterval) {
  				$$invalidate(98, control._dateInterval = dateInterval, control);
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
  			let opt = [];

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

  	const setFilterSkpdi = () => {
  		if (DtpSkpdi._map) {
  			let opt = [];

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
  		$$invalidate(35, hearths_year_5[key] = true, hearths_year_5);

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
  				$$invalidate(34, hearths_period_type_5 = 2);
  			} else if (id === "hearths_period_type_51") {
  				$$invalidate(34, hearths_period_type_5 = 1);
  			} else if (id === "hearths_year_5") {
  				if (checked) {
  					$$invalidate(35, hearths_year_5[name] = true, hearths_year_5);
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
  		$$invalidate(39, hearths_year_3[key] = true, hearths_year_3);

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
  				$$invalidate(38, hearths_period_type_3 = 2);
  			} else if (id === "hearths_period_type_31") {
  				$$invalidate(38, hearths_period_type_3 = 1);
  			} else if (id === "hearths_year_3") {
  				if (checked) {
  					$$invalidate(39, hearths_year_3[name] = true, hearths_year_3);
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
  		$$invalidate(43, hearths_year_Stat[key] = true, hearths_year_Stat);

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
  				$$invalidate(42, hearths_period_type_Stat = 2);
  			} else if (id === "hearths_period_type_Stat1") {
  				$$invalidate(42, hearths_period_type_Stat = 1);
  			} else if (id === "hearths_year_Stat") {
  				if (checked) {
  					$$invalidate(43, hearths_year_Stat[name] = true, hearths_year_Stat);
  				} else {
  					delete hearths_year_Stat[name];
  				}
  			} else if (id === "hearths_quarter_Stat") {
  				let arr = name.split("_");

  				if (checked) {
  					if (!hearths_quarter_Stat[arr[0]]) {
  						$$invalidate(44, hearths_quarter_Stat[arr[0]] = {}, hearths_quarter_Stat);
  					}

  					$$invalidate(44, hearths_quarter_Stat[arr[0]][arr[1]] = true, hearths_quarter_Stat);
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
  		$$invalidate(48, hearths_year_tmp[key] = true, hearths_year_tmp);

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
  				$$invalidate(47, hearths_period_type_tmp = 2);
  			} else if (id === "hearths_period_type_tmp1") {
  				$$invalidate(47, hearths_period_type_tmp = 1);
  			} else if (id === "hearths_year_tmp") {
  				if (checked) {
  					$$invalidate(48, hearths_year_tmp[name] = true, hearths_year_tmp);
  				} else {
  					delete hearths_year_tmp[name];
  				}
  			} else if (id === "hearths_quarter_tmp") {
  				let arr = name.split("_");

  				if (checked) {
  					if (!hearths_quarter_tmp[arr[0]]) {
  						$$invalidate(49, hearths_quarter_tmp[arr[0]] = {}, hearths_quarter_tmp);
  					}

  					$$invalidate(49, hearths_quarter_tmp[arr[0]][arr[1]] = true, hearths_quarter_tmp);
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
  		$$invalidate(53, hearths_year[key] = true, hearths_year);

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
  				$$invalidate(52, hearths_period_type = 2);
  			} else if (id === "hearths_period_type1") {
  				$$invalidate(52, hearths_period_type = 1);
  			} else if (id === "hearths_year") {
  				if (checked) {
  					$$invalidate(53, hearths_year[name] = true, hearths_year);
  				} else {
  					delete hearths_year[name];
  				}
  			} else if (id === "hearths_quarter") {
  				let arr = name.split("_");

  				if (checked) {
  					if (!hearths_quarter[arr[0]]) {
  						$$invalidate(54, hearths_quarter[arr[0]] = {}, hearths_quarter);
  					}

  					$$invalidate(54, hearths_quarter[arr[0]][arr[1]] = true, hearths_quarter);
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
  		"Rub",
  		"control"
  	];

  	Object_1.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DtpVerifyedFilters> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpVerifyedFilters", $$slots, []);
  	const $$binding_groups = [[], [], [], [], []];

  	function input2_change_handler() {
  		hearths_period_type_Stat = this.__value;
  		$$invalidate(42, hearths_period_type_Stat);
  	}

  	const func = (p, c) => {
  		p += optDataHearthsPicket4.road[c];
  		return p;
  	};

  	function select0_change_handler() {
  		roads = select_multiple_value(this);
  		$$invalidate(15, roads);
  		$$invalidate(76, optRoadTypes4);
  	}

  	function select1_change_handler() {
  		hearths_stricken4 = select_value(this);
  		$$invalidate(28, hearths_stricken4);
  	}

  	const func_1 = (p, c) => {
  		p += optDataHearthsPicket.road[c];
  		return p;
  	};

  	function select_change_handler() {
  		roads = select_multiple_value(this);
  		$$invalidate(15, roads);
  		$$invalidate(76, optRoadTypes4);
  	}

  	function input1_change_handler() {
  		hearths_period_type_5 = this.__value;
  		$$invalidate(34, hearths_period_type_5);
  	}

  	const func_2 = (p, c) => {
  		p += optDataHearths5.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_1() {
  		str_icon_type5 = select_multiple_value(this);
  		$$invalidate(33, str_icon_type5);
  		$$invalidate(72, optTypeHearths5Keys);
  	}

  	function select1_change_handler_1() {
  		hearths_stricken5 = select_value(this);
  		$$invalidate(32, hearths_stricken5);
  	}

  	function input1_change_handler_1() {
  		hearths_period_type_3 = this.__value;
  		$$invalidate(38, hearths_period_type_3);
  	}

  	const func_3 = (p, c) => {
  		p += optDataHearths3.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_2() {
  		str_icon_type3 = select_multiple_value(this);
  		$$invalidate(37, str_icon_type3);
  		$$invalidate(70, optTypeHearths3Keys);
  	}

  	function select1_change_handler_2() {
  		hearths_stricken3 = select_value(this);
  		$$invalidate(36, hearths_stricken3);
  	}

  	function input1_change_handler_2() {
  		hearths_period_type_Stat = this.__value;
  		$$invalidate(42, hearths_period_type_Stat);
  	}

  	function input2_change_handler_1() {
  		hearths_period_type_Stat = this.__value;
  		$$invalidate(42, hearths_period_type_Stat);
  	}

  	const func_4 = (p, c) => {
  		p += optDataHearthsStat.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_3() {
  		str_icon_typeStat = select_multiple_value(this);
  		$$invalidate(41, str_icon_typeStat);
  		$$invalidate(68, optTypeHearthsStatKeys);
  	}

  	function select1_change_handler_3() {
  		hearths_strickenStat = select_value(this);
  		$$invalidate(40, hearths_strickenStat);
  	}

  	function input1_change_handler_3() {
  		hearths_period_type_tmp = this.__value;
  		$$invalidate(47, hearths_period_type_tmp);
  	}

  	function input2_change_handler_2() {
  		hearths_period_type_tmp = this.__value;
  		$$invalidate(47, hearths_period_type_tmp);
  	}

  	const func_5 = (p, c) => {
  		p += optDataHearthsTmp.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_4() {
  		str_icon_typeTmp = select_multiple_value(this);
  		$$invalidate(46, str_icon_typeTmp);
  		$$invalidate(66, optTypeHearthsTmpKeys);
  	}

  	function select1_change_handler_4() {
  		hearths_strickenTmp = select_value(this);
  		$$invalidate(45, hearths_strickenTmp);
  	}

  	function input1_change_handler_4() {
  		hearths_period_type = this.__value;
  		$$invalidate(52, hearths_period_type);
  	}

  	function input2_change_handler_3() {
  		hearths_period_type = this.__value;
  		$$invalidate(52, hearths_period_type);
  	}

  	const func_6 = (p, c) => {
  		p += optDataHearths.str_icon_type[c];
  		return p;
  	};

  	function select0_change_handler_5() {
  		str_icon_type = select_multiple_value(this);
  		$$invalidate(51, str_icon_type);
  		$$invalidate(64, optTypeHearthsKeys);
  	}

  	function select1_change_handler_5() {
  		hearths_stricken = select_value(this);
  		$$invalidate(50, hearths_stricken);
  	}

  	function input0_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(12, begDate = $$value);
  		});
  	}

  	function input1_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(13, endDate = $$value);
  		});
  	}

  	function input2_change_input_handler() {
  		minOpacity = to_number(this.value);
  		$$invalidate(24, minOpacity);
  	}

  	function input3_change_input_handler() {
  		radius = to_number(this.value);
  		$$invalidate(22, radius);
  	}

  	function input4_change_input_handler() {
  		blur = to_number(this.value);
  		$$invalidate(23, blur);
  	}

  	function input5_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(25, heatElement = $$value);
  		});
  	}

  	const func_7 = (p, c) => {
  		p += optData.collision_type[c];
  		return p;
  	};

  	function select_change_handler_1() {
  		collision_type = select_multiple_value(this);
  		$$invalidate(18, collision_type);
  		$$invalidate(56, optCollisionKeys);
  	}

  	const func_8 = (p, c) => {
  		p += optDataSkpdi.collision_type[c];
  		return p;
  	};

  	function select_change_handler_2() {
  		collision_type_skpdi = select_multiple_value(this);
  		$$invalidate(19, collision_type_skpdi);
  		$$invalidate(58, optCollisionSkpdiKeys);
  	}

  	const func_9 = (p, c) => {
  		p += optDataGibdd.collision_type[c];
  		return p;
  	};

  	function select_change_handler_3() {
  		collision_type_gibdd = select_multiple_value(this);
  		$$invalidate(20, collision_type_gibdd);
  		$$invalidate(60, optCollisionGibddKeys);
  	}

  	function input1_change_handler_5() {
  		list_rubOn = this.checked;
  		$$invalidate(30, list_rubOn);
  	}

  	function input2_change_handler_4() {
  		list_rubOff = this.checked;
  		$$invalidate(31, list_rubOff);
  	}

  	const func_10 = (p, c) => {
  		p += optDataGibddRub.collision_type[c];
  		return p;
  	};

  	function select_change_handler_4() {
  		collision_type_gibddRub = select_multiple_value(this);
  		$$invalidate(21, collision_type_gibddRub);
  		$$invalidate(62, optCollisionGibddRubKeys);
  	}

  	function input0_change_handler() {
  		compOn = this.checked;
  		$$invalidate(26, compOn);
  	}

  	function input1_change_handler_6() {
  		comp1On = this.checked;
  		$$invalidate(27, comp1On);
  	}

  	$$self.$set = $$props => {
  		if ("DtpHearthsPicket4" in $$props) $$invalidate(0, DtpHearthsPicket4 = $$props.DtpHearthsPicket4);
  		if ("DtpHearthsPicket" in $$props) $$invalidate(1, DtpHearthsPicket = $$props.DtpHearthsPicket);
  		if ("DtpHearths5" in $$props) $$invalidate(2, DtpHearths5 = $$props.DtpHearths5);
  		if ("DtpHearths3" in $$props) $$invalidate(3, DtpHearths3 = $$props.DtpHearths3);
  		if ("DtpHearthsStat" in $$props) $$invalidate(9, DtpHearthsStat = $$props.DtpHearthsStat);
  		if ("DtpHearthsTmp" in $$props) $$invalidate(10, DtpHearthsTmp = $$props.DtpHearthsTmp);
  		if ("DtpHearths" in $$props) $$invalidate(11, DtpHearths = $$props.DtpHearths);
  		if ("DtpVerifyed" in $$props) $$invalidate(4, DtpVerifyed = $$props.DtpVerifyed);
  		if ("DtpSkpdi" in $$props) $$invalidate(5, DtpSkpdi = $$props.DtpSkpdi);
  		if ("DtpGibdd" in $$props) $$invalidate(6, DtpGibdd = $$props.DtpGibdd);
  		if ("DtpGibddRub" in $$props) $$invalidate(7, DtpGibddRub = $$props.DtpGibddRub);
  		if ("Rub" in $$props) $$invalidate(8, Rub = $$props.Rub);
  		if ("control" in $$props) $$invalidate(98, control = $$props.control);
  	};

  	$$self.$capture_state = () => ({
  		onMount,
  		DtpHearthsPicket4,
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
  		optDataHearthsPicket4,
  		optRoadTypes4,
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
  		heatElementDtpGibdd,
  		heatElementDtpSkpdi,
  		heatElementDtpVerifyed,
  		_comps,
  		compOn,
  		comp1On,
  		setComp,
  		setFilterHearthsPicket,
  		hearths_stricken4,
  		hearths_year_Picket4,
  		setFilterHearthsPicket4,
  		refresh,
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
  		if ("DtpHearthsPicket4" in $$props) $$invalidate(0, DtpHearthsPicket4 = $$props.DtpHearthsPicket4);
  		if ("DtpHearthsPicket" in $$props) $$invalidate(1, DtpHearthsPicket = $$props.DtpHearthsPicket);
  		if ("DtpHearths5" in $$props) $$invalidate(2, DtpHearths5 = $$props.DtpHearths5);
  		if ("DtpHearths3" in $$props) $$invalidate(3, DtpHearths3 = $$props.DtpHearths3);
  		if ("DtpHearthsStat" in $$props) $$invalidate(9, DtpHearthsStat = $$props.DtpHearthsStat);
  		if ("DtpHearthsTmp" in $$props) $$invalidate(10, DtpHearthsTmp = $$props.DtpHearthsTmp);
  		if ("DtpHearths" in $$props) $$invalidate(11, DtpHearths = $$props.DtpHearths);
  		if ("DtpVerifyed" in $$props) $$invalidate(4, DtpVerifyed = $$props.DtpVerifyed);
  		if ("DtpSkpdi" in $$props) $$invalidate(5, DtpSkpdi = $$props.DtpSkpdi);
  		if ("DtpGibdd" in $$props) $$invalidate(6, DtpGibdd = $$props.DtpGibdd);
  		if ("DtpGibddRub" in $$props) $$invalidate(7, DtpGibddRub = $$props.DtpGibddRub);
  		if ("Rub" in $$props) $$invalidate(8, Rub = $$props.Rub);
  		if ("control" in $$props) $$invalidate(98, control = $$props.control);
  		if ("currentFilter" in $$props) currentFilter = $$props.currentFilter;
  		if ("currentFilterDtpHearths" in $$props) currentFilterDtpHearths = $$props.currentFilterDtpHearths;
  		if ("begDate" in $$props) $$invalidate(12, begDate = $$props.begDate);
  		if ("endDate" in $$props) $$invalidate(13, endDate = $$props.endDate);
  		if ("id_dtp" in $$props) $$invalidate(14, id_dtp = $$props.id_dtp);
  		if ("dateInterval" in $$props) dateInterval = $$props.dateInterval;
  		if ("optData" in $$props) $$invalidate(55, optData = $$props.optData);
  		if ("optCollisionKeys" in $$props) $$invalidate(56, optCollisionKeys = $$props.optCollisionKeys);
  		if ("optDataSkpdi" in $$props) $$invalidate(57, optDataSkpdi = $$props.optDataSkpdi);
  		if ("optCollisionSkpdiKeys" in $$props) $$invalidate(58, optCollisionSkpdiKeys = $$props.optCollisionSkpdiKeys);
  		if ("optDataGibdd" in $$props) $$invalidate(59, optDataGibdd = $$props.optDataGibdd);
  		if ("optCollisionGibddKeys" in $$props) $$invalidate(60, optCollisionGibddKeys = $$props.optCollisionGibddKeys);
  		if ("optDataGibddRub" in $$props) $$invalidate(61, optDataGibddRub = $$props.optDataGibddRub);
  		if ("optCollisionGibddRubKeys" in $$props) $$invalidate(62, optCollisionGibddRubKeys = $$props.optCollisionGibddRubKeys);
  		if ("optDataHearths" in $$props) $$invalidate(63, optDataHearths = $$props.optDataHearths);
  		if ("optTypeHearthsKeys" in $$props) $$invalidate(64, optTypeHearthsKeys = $$props.optTypeHearthsKeys);
  		if ("optDataHearthsTmp" in $$props) $$invalidate(65, optDataHearthsTmp = $$props.optDataHearthsTmp);
  		if ("optTypeHearthsTmpKeys" in $$props) $$invalidate(66, optTypeHearthsTmpKeys = $$props.optTypeHearthsTmpKeys);
  		if ("optDataHearthsStat" in $$props) $$invalidate(67, optDataHearthsStat = $$props.optDataHearthsStat);
  		if ("optTypeHearthsStatKeys" in $$props) $$invalidate(68, optTypeHearthsStatKeys = $$props.optTypeHearthsStatKeys);
  		if ("optDataHearths3" in $$props) $$invalidate(69, optDataHearths3 = $$props.optDataHearths3);
  		if ("optTypeHearths3Keys" in $$props) $$invalidate(70, optTypeHearths3Keys = $$props.optTypeHearths3Keys);
  		if ("optDataHearths5" in $$props) $$invalidate(71, optDataHearths5 = $$props.optDataHearths5);
  		if ("optTypeHearths5Keys" in $$props) $$invalidate(72, optTypeHearths5Keys = $$props.optTypeHearths5Keys);
  		if ("optDataHearthsPicket" in $$props) $$invalidate(73, optDataHearthsPicket = $$props.optDataHearthsPicket);
  		if ("optRoadTypes" in $$props) $$invalidate(74, optRoadTypes = $$props.optRoadTypes);
  		if ("optDataHearthsPicket4" in $$props) $$invalidate(75, optDataHearthsPicket4 = $$props.optDataHearthsPicket4);
  		if ("optRoadTypes4" in $$props) $$invalidate(76, optRoadTypes4 = $$props.optRoadTypes4);
  		if ("roads" in $$props) $$invalidate(15, roads = $$props.roads);
  		if ("ht" in $$props) $$invalidate(16, ht = $$props.ht);
  		if ("id_hearth" in $$props) $$invalidate(17, id_hearth = $$props.id_hearth);
  		if ("collision_type" in $$props) $$invalidate(18, collision_type = $$props.collision_type);
  		if ("collision_type_skpdi" in $$props) $$invalidate(19, collision_type_skpdi = $$props.collision_type_skpdi);
  		if ("collision_type_gibdd" in $$props) $$invalidate(20, collision_type_gibdd = $$props.collision_type_gibdd);
  		if ("collision_type_gibddRub" in $$props) $$invalidate(21, collision_type_gibddRub = $$props.collision_type_gibddRub);
  		if ("beg" in $$props) beg = $$props.beg;
  		if ("end" in $$props) end = $$props.end;
  		if ("heat" in $$props) $$invalidate(77, heat = $$props.heat);
  		if ("heatName" in $$props) heatName = $$props.heatName;
  		if ("radius" in $$props) $$invalidate(22, radius = $$props.radius);
  		if ("blur" in $$props) $$invalidate(23, blur = $$props.blur);
  		if ("minOpacity" in $$props) $$invalidate(24, minOpacity = $$props.minOpacity);
  		if ("heatElement" in $$props) $$invalidate(25, heatElement = $$props.heatElement);
  		if ("heatElementDtpGibdd" in $$props) heatElementDtpGibdd = $$props.heatElementDtpGibdd;
  		if ("heatElementDtpSkpdi" in $$props) heatElementDtpSkpdi = $$props.heatElementDtpSkpdi;
  		if ("heatElementDtpVerifyed" in $$props) heatElementDtpVerifyed = $$props.heatElementDtpVerifyed;
  		if ("_comps" in $$props) _comps = $$props._comps;
  		if ("compOn" in $$props) $$invalidate(26, compOn = $$props.compOn);
  		if ("comp1On" in $$props) $$invalidate(27, comp1On = $$props.comp1On);
  		if ("hearths_stricken4" in $$props) $$invalidate(28, hearths_stricken4 = $$props.hearths_stricken4);
  		if ("hearths_year_Picket4" in $$props) $$invalidate(29, hearths_year_Picket4 = $$props.hearths_year_Picket4);
  		if ("_list_rub" in $$props) _list_rub = $$props._list_rub;
  		if ("list_rubOn" in $$props) $$invalidate(30, list_rubOn = $$props.list_rubOn);
  		if ("list_rubOff" in $$props) $$invalidate(31, list_rubOff = $$props.list_rubOff);
  		if ("hearths_stricken5" in $$props) $$invalidate(32, hearths_stricken5 = $$props.hearths_stricken5);
  		if ("str_icon_type5" in $$props) $$invalidate(33, str_icon_type5 = $$props.str_icon_type5);
  		if ("hearths_period_type_5" in $$props) $$invalidate(34, hearths_period_type_5 = $$props.hearths_period_type_5);
  		if ("hearths_year_5" in $$props) $$invalidate(35, hearths_year_5 = $$props.hearths_year_5);
  		if ("hearths_quarter_5" in $$props) hearths_quarter_5 = $$props.hearths_quarter_5;
  		if ("last_quarter_5" in $$props) last_quarter_5 = $$props.last_quarter_5;
  		if ("hearths_stricken3" in $$props) $$invalidate(36, hearths_stricken3 = $$props.hearths_stricken3);
  		if ("str_icon_type3" in $$props) $$invalidate(37, str_icon_type3 = $$props.str_icon_type3);
  		if ("hearths_period_type_3" in $$props) $$invalidate(38, hearths_period_type_3 = $$props.hearths_period_type_3);
  		if ("hearths_year_3" in $$props) $$invalidate(39, hearths_year_3 = $$props.hearths_year_3);
  		if ("hearths_quarter_3" in $$props) hearths_quarter_3 = $$props.hearths_quarter_3;
  		if ("last_quarter_3" in $$props) last_quarter_3 = $$props.last_quarter_3;
  		if ("hearths_strickenStat" in $$props) $$invalidate(40, hearths_strickenStat = $$props.hearths_strickenStat);
  		if ("str_icon_typeStat" in $$props) $$invalidate(41, str_icon_typeStat = $$props.str_icon_typeStat);
  		if ("hearths_period_type_Stat" in $$props) $$invalidate(42, hearths_period_type_Stat = $$props.hearths_period_type_Stat);
  		if ("hearths_year_Stat" in $$props) $$invalidate(43, hearths_year_Stat = $$props.hearths_year_Stat);
  		if ("hearths_quarter_Stat" in $$props) $$invalidate(44, hearths_quarter_Stat = $$props.hearths_quarter_Stat);
  		if ("last_quarter_Stat" in $$props) last_quarter_Stat = $$props.last_quarter_Stat;
  		if ("hearths_strickenTmp" in $$props) $$invalidate(45, hearths_strickenTmp = $$props.hearths_strickenTmp);
  		if ("str_icon_typeTmp" in $$props) $$invalidate(46, str_icon_typeTmp = $$props.str_icon_typeTmp);
  		if ("hearths_period_type_tmp" in $$props) $$invalidate(47, hearths_period_type_tmp = $$props.hearths_period_type_tmp);
  		if ("hearths_year_tmp" in $$props) $$invalidate(48, hearths_year_tmp = $$props.hearths_year_tmp);
  		if ("hearths_quarter_tmp" in $$props) $$invalidate(49, hearths_quarter_tmp = $$props.hearths_quarter_tmp);
  		if ("last_quarter_tmp" in $$props) last_quarter_tmp = $$props.last_quarter_tmp;
  		if ("hearths_stricken" in $$props) $$invalidate(50, hearths_stricken = $$props.hearths_stricken);
  		if ("str_icon_type" in $$props) $$invalidate(51, str_icon_type = $$props.str_icon_type);
  		if ("hearths_period_type" in $$props) $$invalidate(52, hearths_period_type = $$props.hearths_period_type);
  		if ("hearths_year" in $$props) $$invalidate(53, hearths_year = $$props.hearths_year);
  		if ("hearths_quarter" in $$props) $$invalidate(54, hearths_quarter = $$props.hearths_quarter);
  		if ("last_quarter" in $$props) last_quarter = $$props.last_quarter;
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [
  		DtpHearthsPicket4,
  		DtpHearthsPicket,
  		DtpHearths5,
  		DtpHearths3,
  		DtpVerifyed,
  		DtpSkpdi,
  		DtpGibdd,
  		DtpGibddRub,
  		Rub,
  		DtpHearthsStat,
  		DtpHearthsTmp,
  		DtpHearths,
  		begDate,
  		endDate,
  		id_dtp,
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
  		optDataHearthsPicket4,
  		optRoadTypes4,
  		heat,
  		setComp,
  		setFilterHearthsPicket,
  		setFilterHearthsPicket4,
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
  		heatElementDtpGibdd,
  		heatElementDtpSkpdi,
  		heatElementDtpVerifyed,
  		_comps,
  		refresh,
  		_list_rub,
  		input2_change_handler,
  		$$binding_groups,
  		func,
  		select0_change_handler,
  		select1_change_handler,
  		func_1,
  		select_change_handler,
  		input1_change_handler,
  		func_2,
  		select0_change_handler_1,
  		select1_change_handler_1,
  		input1_change_handler_1,
  		func_3,
  		select0_change_handler_2,
  		select1_change_handler_2,
  		input1_change_handler_2,
  		input2_change_handler_1,
  		func_4,
  		select0_change_handler_3,
  		select1_change_handler_3,
  		input1_change_handler_3,
  		input2_change_handler_2,
  		func_5,
  		select0_change_handler_4,
  		select1_change_handler_4,
  		input1_change_handler_4,
  		input2_change_handler_3,
  		func_6,
  		select0_change_handler_5,
  		select1_change_handler_5,
  		input0_binding,
  		input1_binding,
  		input2_change_input_handler,
  		input3_change_input_handler,
  		input4_change_input_handler,
  		input5_binding,
  		func_7,
  		select_change_handler_1,
  		func_8,
  		select_change_handler_2,
  		func_9,
  		select_change_handler_3,
  		input1_change_handler_5,
  		input2_change_handler_4,
  		func_10,
  		select_change_handler_4,
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
  			instance$5,
  			create_fragment$5,
  			safe_not_equal,
  			{
  				DtpHearthsPicket4: 0,
  				DtpHearthsPicket: 1,
  				DtpHearths5: 2,
  				DtpHearths3: 3,
  				DtpHearthsStat: 9,
  				DtpHearthsTmp: 10,
  				DtpHearths: 11,
  				DtpVerifyed: 4,
  				DtpSkpdi: 5,
  				DtpGibdd: 6,
  				DtpGibddRub: 7,
  				Rub: 8,
  				control: 98
  			},
  			[-1, -1, -1, -1, -1, -1, -1, -1]
  		);

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpVerifyedFilters",
  			options,
  			id: create_fragment$5.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*DtpHearthsPicket4*/ ctx[0] === undefined && !("DtpHearthsPicket4" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsPicket4'");
  		}

  		if (/*DtpHearthsPicket*/ ctx[1] === undefined && !("DtpHearthsPicket" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsPicket'");
  		}

  		if (/*DtpHearths5*/ ctx[2] === undefined && !("DtpHearths5" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearths5'");
  		}

  		if (/*DtpHearths3*/ ctx[3] === undefined && !("DtpHearths3" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearths3'");
  		}

  		if (/*DtpHearthsStat*/ ctx[9] === undefined && !("DtpHearthsStat" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsStat'");
  		}

  		if (/*DtpHearthsTmp*/ ctx[10] === undefined && !("DtpHearthsTmp" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsTmp'");
  		}

  		if (/*DtpHearths*/ ctx[11] === undefined && !("DtpHearths" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearths'");
  		}

  		if (/*DtpVerifyed*/ ctx[4] === undefined && !("DtpVerifyed" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpVerifyed'");
  		}

  		if (/*DtpSkpdi*/ ctx[5] === undefined && !("DtpSkpdi" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpSkpdi'");
  		}

  		if (/*DtpGibdd*/ ctx[6] === undefined && !("DtpGibdd" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpGibdd'");
  		}

  		if (/*DtpGibddRub*/ ctx[7] === undefined && !("DtpGibddRub" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'DtpGibddRub'");
  		}

  		if (/*Rub*/ ctx[8] === undefined && !("Rub" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'Rub'");
  		}

  		if (/*control*/ ctx[98] === undefined && !("control" in props)) {
  			console.warn("<DtpVerifyedFilters> was created without expected prop 'control'");
  		}
  	}

  	get DtpHearthsPicket4() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpHearthsPicket4(value) {
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

  	get Rub() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set Rub(value) {
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

  const { console: console_1$3 } = globals;
  const file$6 = "src\\DtpPopupHearths.svelte";

  function get_each_context$5(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[8] = list[i];
  	child_ctx[10] = i;
  	return child_ctx;
  }

  // (25:4) {#if prp.piketaj_start_km}
  function create_if_block_2$2(ctx) {
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
  			add_location(td0, file$6, 26, 5, 646);
  			add_location(b0, file$6, 27, 13, 691);
  			add_location(b1, file$6, 27, 56, 734);
  			add_location(td1, file$6, 27, 5, 683);
  			add_location(tr, file$6, 25, 3, 636);
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
  		id: create_if_block_2$2.name,
  		type: "if",
  		source: "(25:4) {#if prp.piketaj_start_km}",
  		ctx
  	});

  	return block;
  }

  // (31:4) {#if prp.str_icon_type}
  function create_if_block_1$3(ctx) {
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
  			add_location(td0, file$6, 32, 5, 839);
  			add_location(td1, file$6, 33, 5, 876);
  			add_location(tr, file$6, 31, 3, 829);
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
  		id: create_if_block_1$3.name,
  		type: "if",
  		source: "(31:4) {#if prp.str_icon_type}",
  		ctx
  	});

  	return block;
  }

  // (62:4) {#if current === index}
  function create_if_block$4(ctx) {
  	let div;
  	let current;

  	const dtppopup = new DtpPopupVerifyed({
  			props: {
  				prp: /*pt1*/ ctx[8],
  				closeMe: /*func*/ ctx[7]
  			},
  			$$inline: true
  		});

  	const block = {
  		c: function create() {
  			div = element("div");
  			create_component(dtppopup.$$.fragment);
  			attr_dev(div, "class", "win leaflet-popup-content-wrapper  svelte-mnr9l0");
  			add_location(div, file$6, 62, 4, 1751);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div, anchor);
  			mount_component(dtppopup, div, null);
  			current = true;
  		},
  		p: function update(ctx, dirty) {
  			const dtppopup_changes = {};
  			if (dirty & /*prp*/ 1) dtppopup_changes.prp = /*pt1*/ ctx[8];
  			if (dirty & /*current*/ 4) dtppopup_changes.closeMe = /*func*/ ctx[7];
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
  		source: "(62:4) {#if current === index}",
  		ctx
  	});

  	return block;
  }

  // (49:4) {#each prp.list_dtp as pt1, index}
  function create_each_block$5(ctx) {
  	let tr0;
  	let td0;
  	let ul;
  	let li0;
  	let t0;
  	let t1_value = Math.floor(/*pt1*/ ctx[8].piketaj_m / 1000) + "";
  	let t1;
  	let t2;
  	let t3_value = /*pt1*/ ctx[8].piketaj_m % 1000 + "";
  	let t3;
  	let t4;
  	let t5;
  	let li1;
  	let t6_value = new Date(1000 * /*pt1*/ ctx[8].date).toLocaleDateString() + "";
  	let t6;
  	let t7;
  	let t8_value = /*pt1*/ ctx[8].lost + "";
  	let t8;
  	let t9;
  	let t10_value = /*pt1*/ ctx[8].stricken + "";
  	let t10;
  	let li1_title_value;
  	let t11;
  	let tr1;
  	let td1;
  	let t13;
  	let td2;
  	let t14_value = /*pt1*/ ctx[8].address + "";
  	let t14;
  	let br;
  	let span;
  	let t16;
  	let t17;
  	let current;
  	let dispose;

  	function click_handler(...args) {
  		return /*click_handler*/ ctx[5](/*index*/ ctx[10], ...args);
  	}

  	function click_handler_1(...args) {
  		return /*click_handler_1*/ ctx[6](/*index*/ ctx[10], ...args);
  	}

  	let if_block = /*current*/ ctx[2] === /*index*/ ctx[10] && create_if_block$4(ctx);

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
  			add_location(li0, file$6, 52, 5, 1292);
  			attr_dev(li1, "title", li1_title_value = "id: " + /*pt1*/ ctx[8].id);
  			attr_dev(li1, "class", "svelte-mnr9l0");
  			add_location(li1, file$6, 53, 5, 1380);
  			add_location(ul, file$6, 51, 4, 1282);
  			attr_dev(td0, "class", "first svelte-mnr9l0");
  			attr_dev(td0, "colspan", "2");
  			add_location(td0, file$6, 50, 5, 1249);
  			add_location(tr0, file$6, 49, 3, 1239);
  			attr_dev(td1, "class", "first svelte-mnr9l0");
  			add_location(td1, file$6, 59, 5, 1589);
  			add_location(br, file$6, 60, 22, 1641);
  			attr_dev(span, "class", "link svelte-mnr9l0");
  			add_location(span, file$6, 60, 28, 1647);
  			add_location(td2, file$6, 60, 5, 1624);
  			add_location(tr1, file$6, 58, 3, 1579);
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
  			if ((!current || dirty & /*prp*/ 1) && t1_value !== (t1_value = Math.floor(/*pt1*/ ctx[8].piketaj_m / 1000) + "")) set_data_dev(t1, t1_value);
  			if ((!current || dirty & /*prp*/ 1) && t3_value !== (t3_value = /*pt1*/ ctx[8].piketaj_m % 1000 + "")) set_data_dev(t3, t3_value);
  			if ((!current || dirty & /*prp*/ 1) && t6_value !== (t6_value = new Date(1000 * /*pt1*/ ctx[8].date).toLocaleDateString() + "")) set_data_dev(t6, t6_value);
  			if ((!current || dirty & /*prp*/ 1) && t8_value !== (t8_value = /*pt1*/ ctx[8].lost + "")) set_data_dev(t8, t8_value);
  			if ((!current || dirty & /*prp*/ 1) && t10_value !== (t10_value = /*pt1*/ ctx[8].stricken + "")) set_data_dev(t10, t10_value);

  			if (!current || dirty & /*prp*/ 1 && li1_title_value !== (li1_title_value = "id: " + /*pt1*/ ctx[8].id)) {
  				attr_dev(li1, "title", li1_title_value);
  			}

  			if ((!current || dirty & /*prp*/ 1) && t14_value !== (t14_value = /*pt1*/ ctx[8].address + "")) set_data_dev(t14, t14_value);

  			if (/*current*/ ctx[2] === /*index*/ ctx[10]) {
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
  		source: "(49:4) {#each prp.list_dtp as pt1, index}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$6(ctx) {
  	let div3;
  	let div0;
  	let t0_value = (/*predochag*/ ctx[1] ? "Предочаг" : "Очаг") + "";
  	let t0;
  	let t1;
  	let t2_value = (/*prp*/ ctx[0].id || /*prp*/ ctx[0].id_hearth) + "";
  	let t2;
  	let t3;
  	let t4;
  	let div1;

  	let t5_value = (/*prp*/ ctx[0].quarter
  	? /*prp*/ ctx[0].quarter + " кв."
  	: "") + "";

  	let t5;
  	let t6;
  	let t7_value = /*prp*/ ctx[0].year + "";
  	let t7;
  	let t8;
  	let t9;
  	let div2;
  	let table;
  	let tbody;
  	let t10;
  	let t11;
  	let tr0;
  	let td0;
  	let t13;
  	let td1;
  	let t14_value = /*prp*/ ctx[0].list_dtp.length + "";
  	let t14;
  	let t15;
  	let tr1;
  	let td2;
  	let t17;
  	let td3;
  	let t18_value = /*prp*/ ctx[0].count_lost + "";
  	let t18;
  	let t19;
  	let tr2;
  	let td4;
  	let t21;
  	let td5;
  	let t22_value = /*prp*/ ctx[0].count_stricken + "";
  	let t22;
  	let t23;
  	let current;
  	let if_block0 = /*prp*/ ctx[0].piketaj_start_km && create_if_block_2$2(ctx);
  	let if_block1 = /*prp*/ ctx[0].str_icon_type && create_if_block_1$3(ctx);
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
  			t0 = text(t0_value);
  			t1 = text(" ДТП (id: ");
  			t2 = text(t2_value);
  			t3 = text(")");
  			t4 = space();
  			div1 = element("div");
  			t5 = text(t5_value);
  			t6 = space();
  			t7 = text(t7_value);
  			t8 = text("г.");
  			t9 = space();
  			div2 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			if (if_block0) if_block0.c();
  			t10 = space();
  			if (if_block1) if_block1.c();
  			t11 = space();
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Всего ДТП:";
  			t13 = space();
  			td1 = element("td");
  			t14 = text(t14_value);
  			t15 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Погибших:";
  			t17 = space();
  			td3 = element("td");
  			t18 = text(t18_value);
  			t19 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Раненых:";
  			t21 = space();
  			td5 = element("td");
  			t22 = text(t22_value);
  			t23 = space();

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$6, 19, 2, 361);
  			attr_dev(div1, "class", "pLine");
  			add_location(div1, file$6, 20, 2, 458);
  			attr_dev(td0, "class", "first svelte-mnr9l0");
  			add_location(td0, file$6, 37, 5, 943);
  			add_location(td1, file$6, 38, 5, 982);
  			add_location(tr0, file$6, 36, 3, 933);
  			attr_dev(td2, "class", "first svelte-mnr9l0");
  			add_location(td2, file$6, 41, 5, 1035);
  			add_location(td3, file$6, 42, 5, 1073);
  			add_location(tr1, file$6, 40, 3, 1025);
  			attr_dev(td4, "class", "first svelte-mnr9l0");
  			add_location(td4, file$6, 45, 5, 1121);
  			add_location(td5, file$6, 46, 5, 1158);
  			add_location(tr2, file$6, 44, 3, 1111);
  			add_location(tbody, file$6, 23, 3, 594);
  			attr_dev(table, "class", "table svelte-mnr9l0");
  			add_location(table, file$6, 22, 4, 569);
  			attr_dev(div2, "class", "featureCont");
  			add_location(div2, file$6, 21, 2, 539);
  			attr_dev(div3, "class", "mvsPopup svelte-mnr9l0");
  			add_location(div3, file$6, 18, 1, 336);
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
  			append_dev(div0, t3);
  			append_dev(div3, t4);
  			append_dev(div3, div1);
  			append_dev(div1, t5);
  			append_dev(div1, t6);
  			append_dev(div1, t7);
  			append_dev(div1, t8);
  			append_dev(div3, t9);
  			append_dev(div3, div2);
  			append_dev(div2, table);
  			append_dev(table, tbody);
  			if (if_block0) if_block0.m(tbody, null);
  			append_dev(tbody, t10);
  			if (if_block1) if_block1.m(tbody, null);
  			append_dev(tbody, t11);
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t13);
  			append_dev(tr0, td1);
  			append_dev(td1, t14);
  			append_dev(tbody, t15);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t17);
  			append_dev(tr1, td3);
  			append_dev(td3, t18);
  			append_dev(tbody, t19);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t21);
  			append_dev(tr2, td5);
  			append_dev(td5, t22);
  			append_dev(tbody, t23);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(tbody, null);
  			}

  			current = true;
  		},
  		p: function update(ctx, [dirty]) {
  			if ((!current || dirty & /*predochag*/ 2) && t0_value !== (t0_value = (/*predochag*/ ctx[1] ? "Предочаг" : "Очаг") + "")) set_data_dev(t0, t0_value);
  			if ((!current || dirty & /*prp*/ 1) && t2_value !== (t2_value = (/*prp*/ ctx[0].id || /*prp*/ ctx[0].id_hearth) + "")) set_data_dev(t2, t2_value);

  			if ((!current || dirty & /*prp*/ 1) && t5_value !== (t5_value = (/*prp*/ ctx[0].quarter
  			? /*prp*/ ctx[0].quarter + " кв."
  			: "") + "")) set_data_dev(t5, t5_value);

  			if ((!current || dirty & /*prp*/ 1) && t7_value !== (t7_value = /*prp*/ ctx[0].year + "")) set_data_dev(t7, t7_value);

  			if (/*prp*/ ctx[0].piketaj_start_km) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_2$2(ctx);
  					if_block0.c();
  					if_block0.m(tbody, t10);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*prp*/ ctx[0].str_icon_type) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_1$3(ctx);
  					if_block1.c();
  					if_block1.m(tbody, t11);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if ((!current || dirty & /*prp*/ 1) && t14_value !== (t14_value = /*prp*/ ctx[0].list_dtp.length + "")) set_data_dev(t14, t14_value);
  			if ((!current || dirty & /*prp*/ 1) && t18_value !== (t18_value = /*prp*/ ctx[0].count_lost + "")) set_data_dev(t18, t18_value);
  			if ((!current || dirty & /*prp*/ 1) && t22_value !== (t22_value = /*prp*/ ctx[0].count_stricken + "")) set_data_dev(t22, t22_value);

  			if (dirty & /*prp, current, moveTo, Date, Math*/ 13) {
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
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			destroy_each(each_blocks, detaching);
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
  	let { prp } = $$props;
  	let { predochag } = $$props;
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

  	const writable_props = ["prp", "predochag"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<DtpPopupHearths> was created with unknown prop '${key}'`);
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

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("predochag" in $$props) $$invalidate(1, predochag = $$props.predochag);
  	};

  	$$self.$capture_state = () => ({
  		DtpPopup: DtpPopupVerifyed,
  		prp,
  		predochag,
  		current,
  		moveTo,
  		showDtpInfo
  	});

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("predochag" in $$props) $$invalidate(1, predochag = $$props.predochag);
  		if ("current" in $$props) $$invalidate(2, current = $$props.current);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [
  		prp,
  		predochag,
  		current,
  		moveTo,
  		showDtpInfo,
  		click_handler,
  		click_handler_1,
  		func
  	];
  }

  class DtpPopupHearths extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$6, create_fragment$6, safe_not_equal, { prp: 0, predochag: 1 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupHearths",
  			options,
  			id: create_fragment$6.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$3.warn("<DtpPopupHearths> was created without expected prop 'prp'");
  		}

  		if (/*predochag*/ ctx[1] === undefined && !("predochag" in props)) {
  			console_1$3.warn("<DtpPopupHearths> was created without expected prop 'predochag'");
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
  // console.log('__allJson_____', allJson, DtpHearths._opt);
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
  // console.log('__allJson_____', allJson, DtpHearthsTmp._opt);
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
  // console.log('__allJson_____', allJson, DtpHearthsStat._opt);
  		});
  });

  const L$b = window.L;

  const popup$6 = L$b.popup();
  const popup1$3 = L$b.popup({minWidth: 200});
  let argFilters$6;

  const setPopup$6 = function (props) {
  	let cont = L$b.DomUtil.create('div');
  	new DtpPopupVerifyed({
  		target: cont,
  		props: {
  			// popup: popup,
  			prp: props
  		}
  	});
  	popup$6.setContent(cont);
  	return cont;
  };

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
  								}).bindPopup(popup$6)
  								.on('popupopen', (ev) => {

  									setPopup$6(ev.target.options.props);
  									// console.log('popupopen', ev);
  								}).on('popupclose', (ev) => {
  									if (ev.popup._svObj) {
  										ev.popup._svObj.$destroy();
  										delete ev.popup._svObj;
  									}
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
  									setPopup$6(dtp.options.props);
  									popup$6.setLatLng(dtp._latlng).openOn(DtpHearths3._map);
  								} else {
  									setPopup1$3(it);
  									popup1$3.setLatLng(latlng).openOn(DtpHearths3._map);
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

  const setPopup$7 = function (props) {
  	let cont = L$c.DomUtil.create('div');
  	new DtpPopupVerifyed({
  		target: cont,
  		props: {
  			// popup: popup,
  			prp: props
  		}
  	});
  	popup$7.setContent(cont);
  	return cont;
  };

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
  								}).bindPopup(popup$7)
  								.on('popupopen', (ev) => {

  									setPopup$7(ev.target.options.props);
  									// console.log('popupopen', ev);
  								}).on('popupclose', (ev) => {
  									if (ev.popup._svObj) {
  										ev.popup._svObj.$destroy();
  										delete ev.popup._svObj;
  									}
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
  									setPopup$7(dtp.options.props);
  									popup$7.setLatLng(dtp._latlng).openOn(DtpHearths5._map);
  								} else {
  									setPopup1$4(it);
  									popup1$4.setLatLng(latlng).openOn(DtpHearths5._map);
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
  let argFilters$8;

  const setPopup$8 = function (props) {
  	let cont = L$d.DomUtil.create('div');
  	new DtpPopupVerifyed({
  		target: cont,
  		props: {
  			// popup: popup,
  			prp: props
  		}
  	});
  	popup$8.setContent(cont);
  	return cont;
  };

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
  	argFilters$8 = arg;

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
  			if (cnt === argFilters$8.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		DtpHearthsPicket.addLayer(L$d.layerGroup(arr));
  		// DtpHearths._heat.setData({
  			// max: 8,
  			// data: DtpHearths._heatData
  		// });
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
  						}).bindPopup(popup$8)
  						.on('popupopen', (ev) => {

  							setPopup$8(ev.target.options.props);
  							// console.log('popupopen', ev);
  						}).on('popupclose', (ev) => {
  							if (ev.popup._svObj) {
  								ev.popup._svObj.$destroy();
  								delete ev.popup._svObj;
  							}
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
  							setPopup$8(dtp.options.props);
  							popup$8.setLatLng(dtp._latlng).openOn(DtpHearthsPicket._map);
  						} else {
  							setPopup1$5(it);
  							popup1$5.setLatLng(latlng).openOn(DtpHearthsPicket._map);
  						}
  						
  						// console.log('popu666popen', dist, dtp);
  					});
  				arr.push(it._bounds);
  				arr = arr.concat(arr1);
  			}
  		};

  	Promise.all([2019].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  	// Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
  		.then(allJson => {
  			allJson.forEach(json => {
  				json.forEach(pt => {
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

  /* src\DtpPopupRub1.svelte generated by Svelte v3.20.1 */

  const { console: console_1$4 } = globals;
  const file$7 = "src\\DtpPopupRub1.svelte";

  function get_each_context$6(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[5] = list[i];
  	child_ctx[7] = i;
  	return child_ctx;
  }

  function get_each_context_1$3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[5] = list[i];
  	child_ctx[7] = i;
  	return child_ctx;
  }

  // (58:4) {#each complexes as pt1, index}
  function create_each_block_1$3(ctx) {
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
  			add_location(button, file$7, 58, 5, 1720);
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
  		id: create_each_block_1$3.name,
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
  			add_location(td0, file$7, 62, 10, 1949);
  			add_location(td1, file$7, 62, 42, 1981);
  			add_location(tr0, file$7, 62, 6, 1945);
  			attr_dev(td2, "class", "first svelte-h8luxq");
  			add_location(td2, file$7, 63, 10, 2046);
  			add_location(td3, file$7, 63, 40, 2076);
  			add_location(tr1, file$7, 63, 6, 2042);
  			attr_dev(td4, "class", "first svelte-h8luxq");
  			add_location(td4, file$7, 64, 10, 2123);
  			add_location(td5, file$7, 64, 37, 2150);
  			add_location(tr2, file$7, 64, 6, 2119);
  			attr_dev(td6, "class", "first svelte-h8luxq");
  			add_location(td6, file$7, 65, 10, 2196);
  			add_location(td7, file$7, 65, 38, 2224);
  			add_location(tr3, file$7, 65, 6, 2192);
  			attr_dev(td8, "class", "first svelte-h8luxq");
  			add_location(td8, file$7, 66, 10, 2271);
  			add_location(td9, file$7, 66, 51, 2312);
  			add_location(tr4, file$7, 66, 6, 2267);
  			attr_dev(td10, "class", "first svelte-h8luxq");
  			add_location(td10, file$7, 68, 10, 2544);
  			add_location(td11, file$7, 68, 40, 2574);
  			add_location(tr5, file$7, 68, 6, 2540);
  			attr_dev(table, "class", table_class_value = "tabCont " + /*index*/ ctx[7] + " " + (/*index*/ ctx[7] === 0 ? "" : "hidden") + " svelte-h8luxq");
  			add_location(table, file$7, 61, 5, 1877);
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

  function create_fragment$7(ctx) {
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
  		each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
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
  			add_location(div0, file$7, 35, 2, 1052);
  			attr_dev(td0, "class", "first svelte-h8luxq");
  			add_location(td0, file$7, 40, 5, 1191);
  			add_location(td1, file$7, 41, 5, 1227);
  			add_location(tr0, file$7, 39, 3, 1181);
  			attr_dev(td2, "class", "first svelte-h8luxq");
  			add_location(td2, file$7, 44, 5, 1279);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$7, 45, 29, 1343);
  			add_location(td3, file$7, 45, 5, 1319);
  			add_location(tr1, file$7, 43, 3, 1269);
  			attr_dev(td4, "class", "first svelte-h8luxq");
  			add_location(td4, file$7, 48, 5, 1471);
  			add_location(td5, file$7, 49, 5, 1506);
  			add_location(tr2, file$7, 47, 3, 1461);
  			attr_dev(td6, "class", "first svelte-h8luxq");
  			add_location(td6, file$7, 52, 5, 1561);
  			add_location(td7, file$7, 53, 5, 1601);
  			add_location(tr3, file$7, 51, 3, 1551);
  			attr_dev(td8, "class", "tabs svelte-h8luxq");
  			attr_dev(td8, "colspan", "2");
  			add_location(td8, file$7, 56, 5, 1651);
  			add_location(tr4, file$7, 55, 3, 1641);
  			add_location(tbody, file$7, 38, 3, 1170);
  			attr_dev(table, "class", "table svelte-h8luxq");
  			add_location(table, file$7, 37, 4, 1145);
  			attr_dev(div1, "class", "featureCont");
  			add_location(div1, file$7, 36, 2, 1115);
  			attr_dev(div2, "class", "mvsPopup svelte-h8luxq");
  			add_location(div2, file$7, 34, 1, 1027);
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
  					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_1$3(child_ctx);
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
  		id: create_fragment$7.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$7($$self, $$props, $$invalidate) {
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
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<DtpPopupRub1> was created with unknown prop '${key}'`);
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
  		init(this, options, instance$7, create_fragment$7, safe_not_equal, { prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupRub1",
  			options,
  			id: create_fragment$7.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$4.warn("<DtpPopupRub1> was created without expected prop 'prp'");
  		}
  	}

  	get prp() {
  		throw new Error("<DtpPopupRub1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupRub1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$e = window.L;

  const popup$9 = L$e.popup();
  const popup1$6 = L$e.popup({minWidth: 200});
  let argFilters$9;

  const setPopup$9 = function (props) {
  	let cont = L$e.DomUtil.create('div');
  	new DtpPopupRub1({
  		target: cont,
  		props: {
  			// popup: popup,
  			prp: props
  		}
  	});
  	popup$9.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const Rub1 = L$e.featureGroup([]);
  Rub1.setFilter = arg => {
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	if (!Rub1._map) { return; }
  	Rub1.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$9 = arg;

  	let arr = [];
  	if (Rub1._group) {
  		Rub1._group.getLayers().forEach(it => {
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
  			if (cnt === argFilters$9.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		Rub1.addLayer(L$e.layerGroup(arr));
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
  			let list_bounds = L$e.latLngBounds(),
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
  				latlng = L$e.latLng(coords.lat, coords.lon);

  			list_bounds.extend(latlng);

  			return new CirclePoint(L$e.latLng(coords.lat, coords.lon), {
  					// cluster: it,
  					props: prp,
  					radius: 6,
  					zIndexOffset: 50000,
  					// rhomb: true,
  					stroke: stroke,
  					fillColor: fillColor,
  					// renderer: renderer
  				}).bindPopup(popup$9)
  				.on('popupopen', (ev) => {

  					setPopup$9(ev.target.options.props);
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
  			Rub1._group = L$e.layerGroup(arr);
  			Rub1.addLayer(Rub1._group);
  // console.log('json', json);

  		});
  });

  /* src\DtpPopupRub.svelte generated by Svelte v3.20.1 */

  const { console: console_1$5 } = globals;
  const file$8 = "src\\DtpPopupRub.svelte";

  function get_each_context$7(ctx, list, i) {
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

  // (61:4) {#each complexes as pt1, index}
  function create_each_block_1$4(ctx) {
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
  			add_location(button, file$8, 61, 5, 1760);
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
  			add_location(td0, file$8, 65, 10, 1990);
  			add_location(td1, file$8, 65, 42, 2022);
  			add_location(tr0, file$8, 65, 6, 1986);
  			attr_dev(td2, "class", "first svelte-h8luxq");
  			add_location(td2, file$8, 66, 10, 2089);
  			add_location(td3, file$8, 66, 40, 2119);
  			add_location(tr1, file$8, 66, 6, 2085);
  			attr_dev(td4, "class", "first svelte-h8luxq");
  			add_location(td4, file$8, 67, 10, 2168);
  			add_location(td5, file$8, 67, 37, 2195);
  			add_location(tr2, file$8, 67, 6, 2164);
  			attr_dev(td6, "class", "first svelte-h8luxq");
  			add_location(td6, file$8, 68, 10, 2243);
  			add_location(td7, file$8, 68, 51, 2284);
  			add_location(tr3, file$8, 68, 6, 2239);
  			attr_dev(table, "class", table_class_value = "tabCont " + /*index*/ ctx[7] + " " + (/*index*/ ctx[7] === 0 ? "" : "hidden") + " svelte-h8luxq");
  			add_location(table, file$8, 64, 5, 1918);
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

  function create_fragment$8(ctx) {
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
  		each_blocks_1[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
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
  			add_location(div0, file$8, 34, 2, 1007);
  			attr_dev(td0, "class", "first svelte-h8luxq");
  			add_location(td0, file$8, 39, 5, 1146);
  			add_location(td1, file$8, 40, 5, 1180);
  			add_location(tr0, file$8, 38, 3, 1136);
  			attr_dev(td2, "class", "first svelte-h8luxq");
  			add_location(td2, file$8, 43, 5, 1234);
  			add_location(td3, file$8, 44, 5, 1270);
  			add_location(tr1, file$8, 42, 3, 1224);
  			attr_dev(td4, "class", "first svelte-h8luxq");
  			add_location(td4, file$8, 47, 5, 1323);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$8, 48, 29, 1387);
  			add_location(td5, file$8, 48, 5, 1363);
  			add_location(tr2, file$8, 46, 3, 1313);
  			attr_dev(td6, "class", "first svelte-h8luxq");
  			add_location(td6, file$8, 51, 5, 1515);
  			add_location(td7, file$8, 52, 5, 1550);
  			add_location(tr3, file$8, 50, 3, 1505);
  			attr_dev(td8, "class", "first svelte-h8luxq");
  			add_location(td8, file$8, 55, 5, 1601);
  			add_location(td9, file$8, 56, 5, 1641);
  			add_location(tr4, file$8, 54, 3, 1591);
  			attr_dev(td10, "class", "tabs svelte-h8luxq");
  			attr_dev(td10, "colspan", "2");
  			add_location(td10, file$8, 59, 5, 1691);
  			add_location(tr5, file$8, 58, 3, 1681);
  			add_location(tbody, file$8, 37, 3, 1125);
  			attr_dev(table, "class", "table svelte-h8luxq");
  			add_location(table, file$8, 36, 4, 1100);
  			attr_dev(div1, "class", "featureCont");
  			add_location(div1, file$8, 35, 2, 1070);
  			attr_dev(div2, "class", "mvsPopup svelte-h8luxq");
  			add_location(div2, file$8, 33, 1, 982);
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
  					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_1$4(child_ctx);
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

  	let complexes = prp && prp.list_complex ? prp.list_complex : [];
  	console.log("complexes ", complexes);
  	const writable_props = ["prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<DtpPopupRub> was created with unknown prop '${key}'`);
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
  		init(this, options, instance$8, create_fragment$8, safe_not_equal, { prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupRub",
  			options,
  			id: create_fragment$8.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$5.warn("<DtpPopupRub> was created without expected prop 'prp'");
  		}
  	}

  	get prp() {
  		throw new Error("<DtpPopupRub>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set prp(value) {
  		throw new Error("<DtpPopupRub>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}
  }

  const L$f = window.L;

  const popup$a = L$f.popup();
  const popup1$7 = L$f.popup({minWidth: 200});
  let argFilters$a;
  let prefix$2 = 'https://dtp.mvs.group/scripts/rubez_dev/';

  const setPopup$a = function (props) {
  	let cont = L$f.DomUtil.create('div'),
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
  			popup$a.setContent(cont);
  		});

  	popup$a.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const Rub = L$f.featureGroup([]);
  Rub.setFilter = arg => {
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	if (!Rub._map) { return; }
  	Rub.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$a = arg;
  	Rub._argFilters = argFilters$a;

  	let arr = [];
  	if (Rub._group) {
  		Rub._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$a.forEach(ft => {
  				if (ft.type === 'comp') {
  					if (prp.rub_flag) {
  						if (ft.zn.on) { cnt++; }
  					} else {
  						if (ft.zn.off) { cnt++; }
  					}
  				}
  			});
  			if (cnt === argFilters$a.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		Rub.addLayer(L$f.layerGroup(arr));
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
  			let list_bounds = L$f.latLngBounds(),
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
  				latlng = L$f.latLng(coords.lat, coords.lon);

  			list_bounds.extend(latlng);

  			arr.push(new CirclePoint(L$f.latLng(coords.lat, coords.lon), {
  					// cluster: it,
  					props: prp,
  					radius: 6,
  					zIndexOffset: 50000,
  					path: 'camera',
  					stroke: stroke,
  					fillColor: fillColor,
  					// renderer: renderer
  				}).bindPopup(popup$a)
  				.on('popupopen', (ev) => {

  					setPopup$a(ev.target.options.props);
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
  			Rub._group = L$f.layerGroup(arr);
  			Rub.addLayer(Rub._group);
  			console.log('opt', opt);

  		});
  });

  /* src\DtpPopupGibddRub.svelte generated by Svelte v3.20.1 */

  const { console: console_1$6 } = globals;
  const file$9 = "src\\DtpPopupGibddRub.svelte";

  function get_each_context$8(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[9] = list[i];
  	child_ctx[11] = i;
  	return child_ctx;
  }

  function get_each_context_2$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[14] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$5(ctx, list, i) {
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
  			add_location(li, file$9, 105, 17, 2586);
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
  			add_location(li, file$9, 107, 52, 2688);
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
  			add_location(li, file$9, 108, 21, 2735);
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
  function create_if_block_4$2(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[14].sop_npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$9, 109, 25, 2785);
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
  		id: create_if_block_4$2.name,
  		type: "if",
  		source: "(110:7) {#if pt1.sop_npdd}",
  		ctx
  	});

  	return block;
  }

  // (107:6) {#each pt.arr as pt1}
  function create_each_block_2$2(ctx) {
  	let t0;
  	let t1;
  	let if_block2_anchor;
  	let if_block0 = /*pt1*/ ctx[14].k_uch && (/*pt1*/ ctx[14].npdd || /*pt1*/ ctx[14].sop_npdd) && create_if_block_6$2(ctx);
  	let if_block1 = /*pt1*/ ctx[14].npdd && create_if_block_5$2(ctx);
  	let if_block2 = /*pt1*/ ctx[14].sop_npdd && create_if_block_4$2(ctx);

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
  		id: create_each_block_2$2.name,
  		type: "each",
  		source: "(107:6) {#each pt.arr as pt1}",
  		ctx
  	});

  	return block;
  }

  // (105:5) {#each tsInfoArr as pt}
  function create_each_block_1$5(ctx) {
  	let t;
  	let each_1_anchor;
  	let if_block = /*pt*/ ctx[9].ts && create_if_block_7$2(ctx);
  	let each_value_2 = /*pt*/ ctx[9].arr;
  	validate_each_argument(each_value_2);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_2.length; i += 1) {
  		each_blocks[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
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
  					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_2$2(child_ctx);
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
  		id: create_each_block_1$5.name,
  		type: "each",
  		source: "(105:5) {#each tsInfoArr as pt}",
  		ctx
  	});

  	return block;
  }

  // (119:4) {#if prp.spog}
  function create_if_block_3$2(ctx) {
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
  			add_location(div0, file$9, 120, 6, 2998);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$9, 120, 40, 3032);
  			add_location(div2, file$9, 119, 5, 2986);
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
  		id: create_if_block_3$2.name,
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
  			add_location(div0, file$9, 125, 6, 3126);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$9, 125, 42, 3162);
  			add_location(div2, file$9, 124, 5, 3114);
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
  			add_location(div0, file$9, 130, 6, 3255);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$9, 130, 46, 3295);
  			add_location(div2, file$9, 129, 5, 3243);
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
  			add_location(div0, file$9, 135, 6, 3386);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$9, 135, 46, 3426);
  			add_location(div2, file$9, 134, 5, 3374);
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
  			add_location(li, file$9, 150, 6, 3882);
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

  function create_fragment$9(ctx) {
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
  		each_blocks_1[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
  	}

  	let if_block0 = /*prp*/ ctx[0].spog && create_if_block_3$2(ctx);
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

  			add_location(b0, file$9, 71, 4, 1617);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$9, 70, 2, 1593);
  			attr_dev(td0, "class", "first svelte-vw4d3d");
  			add_location(td0, file$9, 77, 5, 1740);
  			add_location(td1, file$9, 78, 5, 1772);
  			add_location(tr0, file$9, 76, 3, 1730);
  			attr_dev(td2, "class", "first svelte-vw4d3d");
  			add_location(td2, file$9, 81, 5, 1850);
  			add_location(td3, file$9, 82, 5, 1885);
  			add_location(tr1, file$9, 80, 3, 1840);
  			attr_dev(td4, "class", "first svelte-vw4d3d");
  			add_location(td4, file$9, 85, 5, 1953);
  			add_location(b1, file$9, 86, 9, 1994);
  			add_location(b2, file$9, 86, 34, 2019);
  			add_location(td5, file$9, 86, 5, 1990);
  			add_location(tr2, file$9, 84, 3, 1943);
  			attr_dev(td6, "class", "first svelte-vw4d3d");
  			add_location(td6, file$9, 89, 5, 2069);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$9, 90, 29, 2133);
  			add_location(td7, file$9, 90, 5, 2109);
  			add_location(tr3, file$9, 88, 3, 2059);
  			attr_dev(td8, "class", "first svelte-vw4d3d");
  			add_location(td8, file$9, 93, 5, 2261);
  			add_location(td9, file$9, 94, 5, 2301);
  			add_location(tr4, file$9, 92, 3, 2251);
  			attr_dev(td10, "class", "first svelte-vw4d3d");
  			add_location(td10, file$9, 97, 5, 2375);
  			add_location(td11, file$9, 98, 5, 2412);
  			add_location(tr5, file$9, 96, 3, 2365);
  			attr_dev(td12, "class", "first svelte-vw4d3d");
  			add_location(td12, file$9, 101, 14, 2478);
  			add_location(ul0, file$9, 103, 4, 2535);
  			add_location(td13, file$9, 102, 14, 2526);
  			add_location(tr6, file$9, 100, 12, 2459);
  			attr_dev(td14, "class", "first svelte-vw4d3d");
  			add_location(td14, file$9, 116, 14, 2911);
  			add_location(td15, file$9, 117, 14, 2957);
  			add_location(tr7, file$9, 115, 12, 2892);
  			attr_dev(td16, "class", "first svelte-vw4d3d");
  			add_location(td16, file$9, 141, 14, 3542);
  			add_location(b3, file$9, 142, 18, 3612);
  			add_location(td17, file$9, 142, 14, 3608);
  			add_location(tr8, file$9, 140, 12, 3523);
  			attr_dev(td18, "class", "first svelte-vw4d3d");
  			add_location(td18, file$9, 145, 14, 3693);
  			attr_dev(div1, "class", "win leaflet-popup-content-wrapper  svelte-vw4d3d");
  			add_location(div1, file$9, 147, 2, 3745);
  			add_location(ul1, file$9, 148, 4, 3824);
  			add_location(td19, file$9, 146, 14, 3738);
  			add_location(tr9, file$9, 144, 12, 3674);
  			add_location(tbody, file$9, 75, 3, 1719);
  			attr_dev(table, "class", "table");
  			add_location(table, file$9, 74, 4, 1694);
  			attr_dev(div2, "class", "featureCont");
  			add_location(div2, file$9, 73, 2, 1664);
  			attr_dev(div3, "class", "mvsPopup svelte-vw4d3d");
  			add_location(div3, file$9, 69, 3, 1568);
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
  					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_1$5(child_ctx);
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
  					if_block0 = create_if_block_3$2(ctx);
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
  		id: create_fragment$9.name,
  		type: "component",
  		source: "",
  		ctx
  	});

  	return block;
  }

  function instance$9($$self, $$props, $$invalidate) {
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
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<DtpPopupGibddRub> was created with unknown prop '${key}'`);
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
  		init(this, options, instance$9, create_fragment$9, safe_not_equal, { showModal: 5, prp: 0 });

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpPopupGibddRub",
  			options,
  			id: create_fragment$9.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*prp*/ ctx[0] === undefined && !("prp" in props)) {
  			console_1$6.warn("<DtpPopupGibddRub> was created without expected prop 'prp'");
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

  const L$g = window.L;

  const popup$b = L$g.popup();
  let argFilters$b;
  const setPopup$b = function (id) {
  	let url = 'https://dtp.mvs.group/scripts/dtprubez_dev/get_stat_gipdd_with_rub_' + id + '.txt';
  	fetch(url, {})
  		.then(req => req.json())
  		.then(json => {
  // console.log('bindPopup', layer, json, DtpPopup);
  			let cont = L$g.DomUtil.create('div');
  			const app = new DtpPopupGibddRub({
  				target: cont,
  				props: {
  					prp: json
  				}
  			});
  			popup$b._svObj = app;
  			popup$b.setContent(cont);
  		});
  	return '';
  };

  // let renderer = L.canvas();
  const DtpGibddRub = L$g.featureGroup([]);
  DtpGibddRub._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
  DtpGibddRub.checkZoom = z => {
  	if (Object.keys(DtpGibddRub._layers).length) {
  		if (z < 12) {
  			DtpGibddRub.setFilter(argFilters$b);
  		}
  	} else if (z > 11) {
  		DtpGibddRub.setFilter(argFilters$b);
  	}
  };
  DtpGibddRub.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	if (!DtpGibddRub._map) { return; }
  	DtpGibddRub.clearLayers();
  	argFilters$b = arg || [];
  	DtpGibddRub._argFilters = argFilters$b;

  	let arr = [], heat = [];
  	if (DtpGibddRub._group && DtpGibddRub._map) {
  		DtpGibddRub._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$b.forEach(ft => {
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
  			if (cnt === argFilters$b.length) {
  				arr.push(it);
  				heat.push(it._latlng);
  			}
  		});
  		if (DtpGibddRub._needHeat) {
  			DtpGibddRub._map.addLayer(DtpGibddRub._heat);
  			DtpGibddRub._heat.setLatLngs(heat);
  			DtpGibddRub._heat.setOptions(DtpGibddRub._needHeat);
  			if (DtpGibddRub._map._zoom > 11) {
  				DtpGibddRub.addLayer(L$g.layerGroup(arr));
  			}
  		} else {
  			DtpGibddRub.addLayer(L$g.layerGroup(arr));
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
  	DtpGibddRub._heat = L$g.heatLayer([], {
  		// blur: 50,
  		gradient: {0.1: 'blue', 0.4: 'lime', 1: 'red'}
  	});
  	argFilters$b = null;

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

  				let latLng = L$g.latLng(prp.lat, prp.lon, stroke ? 1 : 0.5);
  				heat.push(latLng);

  				return new CirclePoint(latLng, {
  					props: prp,
  					radius: 6,
  					// box: true,
  					stroke: stroke,
  					fillColor: fillColor,
  					// renderer: renderer
  				}).bindPopup(popup$b).on('popupopen', (ev) => {
  						setPopup$b(ev.target.options.props.id);
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
  			DtpGibddRub._group = L$g.layerGroup(arr);

  			// if (argFilters) {
  				DtpGibddRub.setFilter();
  			// } else 
  			if (DtpGibddRub._map._zoom > 11) {
  				DtpGibddRub.addLayer(DtpGibddRub._group);
  			}
  			DtpGibddRub._refreshFilters();
  		});
  });

  const L$h = window.L;

  const popup$c = L$h.popup();
  let argFilters$c;

  // let renderer = L.canvas();
  const TestGraphQl = L$h.featureGroup([]);
  TestGraphQl._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
  TestGraphQl.checkZoom = z => {
  	if (Object.keys(TestGraphQl._layers).length) {
  		if (z < 12) {
  			TestGraphQl.setFilter(argFilters$c);
  		}
  	} else if (z > 11) {
  		TestGraphQl.setFilter(argFilters$c);
  	}
  };
  TestGraphQl.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	if (!TestGraphQl._map) { return; }
  	TestGraphQl.clearLayers();
  	argFilters$c = arg || [];
  	TestGraphQl._argFilters = argFilters$c;

  	let arr = [], heat = [];
  	if (TestGraphQl._group) {
  		TestGraphQl._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$c.forEach(ft => {
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
  			if (cnt === argFilters$c.length) {
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
  			TestGraphQl.addLayer(L$h.layerGroup(arr));
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

  const L$i = window.L;

  const popup$d = L$i.popup();
  const popup1$8 = L$i.popup({minWidth: 200});
  let argFilters$d;

  const setPopup$c = function (props) {
  	let cont = L$i.DomUtil.create('div');
  	new DtpPopupVerifyed({
  		target: cont,
  		props: {
  			prp: props
  		}
  	});
  	popup$d.setContent(cont);
  	return cont;
  };

  const setPopup1$6 = function (props) {
  	let cont = L$i.DomUtil.create('div');
  	new DtpPopupHearths({
  		target: cont,
  		props: {
  			predochag: 1,
  			prp: props
  		}
  	});
  	popup1$8.setContent(cont);
  	return cont;
  };

  // let renderer = L.canvas();
  const DtpHearthsPicket4 = L$i.featureGroup([]);
  DtpHearthsPicket4.setFilter = arg => {
  	if (!DtpHearthsPicket4._map) { return; }
  // console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
  	DtpHearthsPicket4.clearLayers();
  	// DtpHearths._heatData = [];
  	argFilters$d = arg;

  	let arr = [];
  	if (DtpHearthsPicket4._group) {
  		DtpHearthsPicket4._group.getLayers().forEach(it => {
  			let prp = it.options.cluster,
  				cnt = 0;
  			argFilters$d.forEach(ft => {
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
  			if (cnt === argFilters$d.length) {
  				arr.push(it);
  				// arr = arr.concat(it.options.items);
  				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		DtpHearthsPicket4.addLayer(L$i.layerGroup(arr));
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
  				list_bounds = L$i.latLngBounds(),
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
  						latlng = L$i.latLng(coords.lat, coords.lon),
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
  					
  					return new CirclePoint(L$i.latLng(coords.lat, coords.lon), {
  							cluster: it,
  							props: prp,
  							radius: 6,
  							zIndexOffset: 50000,
  							rhomb: true,
  							stroke: stroke,
  							fillColor: fillColor,
  							// renderer: renderer
  						}).bindPopup(popup$d)
  						.on('popupopen', (ev) => {

  							setPopup$c(ev.target.options.props);
  							// console.log('popupopen', ev);
  						}).on('popupclose', (ev) => {
  							if (ev.popup._svObj) {
  								ev.popup._svObj.$destroy();
  								delete ev.popup._svObj;
  							}
  						});
  				});
  				if (latlngs.length) {
  					it._bounds = L$i.polyline(latlngs, {items: arr1, cluster: it, color: fillColor, weight: 4});
  				} else {
  					it._bounds = L$i.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'});
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
  						L$i.DomEvent.stopPropagation(ev);
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
  							setPopup$c(dtp.options.props);
  							popup$d.setLatLng(dtp._latlng).openOn(DtpHearthsPicket4._map);
  						} else {
  							setPopup1$6(it);
  							popup1$8.setLatLng(latlng).openOn(DtpHearthsPicket4._map);
  						}
  						
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
  				DtpHearthsPicket4._group = L$i.layerGroup(arr);
  				if (argFilters$d) {
  					DtpHearthsPicket4.setFilter(argFilters$d);
  				} else {
  					DtpHearthsPicket4.addLayer(DtpHearthsPicket4._group);
  				}
  				DtpHearthsPicket4._refreshFilters();
  			});
  console.log('__allJson_____', allJson, DtpHearthsPicket4._opt);
  		});
  });

  // import {MarkerPoint, CirclePoint} from './CirclePoint';

  const L$j = window.L;

  // const popup = L.popup();
  let map;
  // let argFilters;

  let renderer$1 = L$j.canvas();
  const Roads = L$j.featureGroup([]);

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
  		let geojson = L$j.geoJson(json, {
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
  				let d = L$j.LineUtil._sqClosestPointOnSegment(ep, _rings[i], _rings[i+1], true);
  				if (d < min) {
  					min = d;
  					index = i;
  				}
  			}
  			let arr = it._latlngs.slice(0, index);
  			arr.push(latlng);
  			
  			polyline = L$j.polyline(arr, {color: 'red', weight: 6, interactive: false}).bindTooltip('').addTo(map);
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

  // import 'leaflet-sidebar-v2';

  const L$k = window.L;
  const map$1 = L$k.map(document.body, {
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

  var corners = map$1._controlCorners,
  	parent = map$1._controlContainer,
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
  		corners[key] = L$k.DomUtil.create('div', classNames[key], parent);
  	}
  }

  map$1.addControl(L$k.control.gmxCenter())
  	.addControl(L$k.control.fitCenter());

  var Mercator = L$k.TileLayer.extend({
  	options: {
  		tilesCRS: L$k.CRS.EPSG3395
  	},
  	_getTiledPixelBounds: function (center) {
  		var pixelBounds = L$k.TileLayer.prototype._getTiledPixelBounds.call(this, center);
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

  			tile.src = L$k.Util.template(pItem.errorTileUrlPrefix + pItem.postfix, {
  				z: searchParams.get('z'),
  				x: searchParams.get('x'),
  				y: searchParams.get('y')
  			});
  		}
  		done(e, tile);
  	},
  	_getTilePos: function (coords) {
  		var tilePos = L$k.TileLayer.prototype._getTilePos.call(this, coords);
  		return tilePos.subtract([0, this._shiftY]);
  	},

  	_getShiftY: function(zoom) {
  		var map = this._map,
  			pos = map.getCenter(),
  			shift = (map.options.crs.project(pos).y - this.options.tilesCRS.project(pos).y);

  		return Math.floor(L$k.CRS.scale(zoom) * shift / 40075016.685578496);
  	}
  });
  L$k.TileLayer.Mercator = Mercator;
  L$k.tileLayer.Mercator = function (url, options) {
  	return new Mercator(url, options);
  };

  let baseLayers = {};
  if (!hrefParams.b) { hrefParams.b = 'm2'; }
  ['m2', 'm3'].forEach(key => {
  	let it = proxy[key],
  		lit = L$k.tileLayer.Mercator(it.prefix + it.postfix, it.options);
  	baseLayers[it.title] = lit;
  	if (hrefParams.b === it.options.key) { lit.addTo(map$1); }
  });
  baseLayers.OpenStreetMap = L$k.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  	maxZoom: 21,
  	maxNativeZoom: 18
  });

  let overlays = {
  	// Marker: L.marker([55.758031, 37.611694])
  		// .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
  		// .openPopup(),
  	// 'TestGraphQl': TestGraphQl,
  	
  	// 'm4': m4,
  	'Трассы': Roads,
  	'Рубежи': Rub,
  	// 'Рубежи (test)': Rub1,
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
  };

  // let comp = L.DomUtil.create('div', 'layerInfo');
  // comp.innerHTML = 'df<b>df</b>df';
  // let info = L.DomUtil.create('div', '', comp);
  // L.DomEvent.on(info, 'mouseover', (ev) => console.log);
  // overlays[comp] = DtpHearths5;

  let ovHash = hrefParams.o ? hrefParams.o.split(',').reduce((p, c) => {p[c] = true; return p;}, {}) : {};
  ['m1', 'm4', 'm5'].forEach(key => {
  	let it = proxy[key],
  		lit = L$k.tileLayer.Mercator(it.prefix + it.postfix, it.options);
  	overlays[it.title] = lit;
  	if (ovHash[it.options.key]) { lit.addTo(map$1); }
  });
  var lc = L$k.control.layers(baseLayers, overlays).addTo(map$1);

  let filtersControl = L$k.control.gmxIcon({
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
  			cont1 = target._win = L$k.DomUtil.create('div', 'win leaflet-control-layers', cont);
  			// cont1.innerHTML = 'Слой "ДТП Сводный"';
  			L$k.DomEvent.disableScrollPropagation(cont1);
  			cont1._Filters = new DtpVerifyedFilters({
  				target: cont1,
  				props: {
  					control: target,
  					DtpGibddRub: DtpGibddRub,
  					DtpGibdd: DtpGibdd,
  					DtpSkpdi: DtpSkpdi,
  					Rub: Rub,
  					// Rub1: Rub1,
  					DtpHearthsPicket4: DtpHearthsPicket4,
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

  }).addTo(map$1);

  map$1.pm.setLang('customName', {
  	tooltips: {
  		finishLine: 'Щелкните любой существующий маркер для завершения',
  	}
  }, 'ru');
  map$1.pm.setLang('ru');

  let isMeasureActive, lineActionNode;
  map$1
  .on('pm:create', (ev) => {
  	map$1.removeLayer(ev.layer);
  	measureControl.setActive(false);
  })
  .on('pm:drawstart', (ev) => {
  	let workingLayer =  ev.workingLayer;
  	if (ev.shape === 'Line') {
  		let _hintMarker = map$1.pm.Draw.Line._hintMarker;
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

  let measureControl = L$k.control.gmxIcon({
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
  		map$1.pm.enableDraw('Line', { finishOn: 'dblclick' });
  	} else {
  		map$1.pm.disableDraw('Line');
  		if (lineActionNode) {
  			lineActionNode.style.display = '';
  		}
  	}
  }).addTo(map$1);

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
  DtpVerifyed._refreshFilters =
  DtpHearths._refreshFilters =
  DtpHearthsStat._refreshFilters =
  DtpHearths3._refreshFilters =
  DtpHearths5._refreshFilters =
  DtpHearthsPicket._refreshFilters =
  DtpHearthsPicket4._refreshFilters =
  Rub._refreshFilters =
  DtpHearthsTmp._refreshFilters = refreshFilters;

  const eventsStr = 'remove';
  DtpGibddRub.on(eventsStr, refreshFilters);
  DtpGibdd.on(eventsStr, refreshFilters);
  DtpSkpdi.on(eventsStr, refreshFilters);
  DtpVerifyed.on(eventsStr, refreshFilters);
  DtpHearths.on(eventsStr, refreshFilters);
  DtpHearthsTmp.on(eventsStr, refreshFilters);
  DtpHearthsStat.on(eventsStr, refreshFilters);
  DtpHearths3.on(eventsStr, refreshFilters);
  DtpHearths5.on(eventsStr, refreshFilters);
  DtpHearthsPicket.on(eventsStr, refreshFilters);
  DtpHearthsPicket4.on(eventsStr, refreshFilters);
  Rub.on(eventsStr, refreshFilters);

  map$1
  	.on('zoomend', (ev) => {
  		map$1._crpx = 0;
  // console.log('zoomend ', map._zoom);
  		if (DtpVerifyed._map) {
  			DtpVerifyed.checkZoom(map$1._zoom);
  		}
  		if (DtpSkpdi._map) {
  			DtpSkpdi.checkZoom(map$1._zoom);
  		}
  		if (DtpGibdd._map) {
  			DtpGibdd.checkZoom(map$1._zoom);
  		}
  	});
  window._map = map$1;

  return map$1;

}());
//# sourceMappingURL=main.js.map
