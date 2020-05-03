
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
          L$1.DomEvent
              // .on(this._iconClick, 'click', stop)
              .on(container, 'mousemove', stop)
              .on(container, 'touchstart', stop)
              .on(container, 'mousedown', stop)
              .on(container, 'dblclick', stop)
              // .on(container, 'click', stop)
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
  		r = options.radius || 14,
  		r2 = 2 * r,
  		ctx = this._ctx;

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
  function children(element) {
      return Array.from(element.childNodes);
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
  function select_value(select) {
      const selected_option = select.querySelector(':checked') || select.options[0];
      return selected_option && selected_option.__value;
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

  // (77:6) {#if pt.ts}
  function create_if_block_7(ctx) {
  	let li;
  	let t_value = /*pt*/ ctx[6].ts + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$1, 76, 17, 1870);
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
  		source: "(77:6) {#if pt.ts}",
  		ctx
  	});

  	return block;
  }

  // (79:7) {#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}
  function create_if_block_6(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[9].k_uch + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$1, 78, 52, 1972);
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
  		source: "(79:7) {#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}",
  		ctx
  	});

  	return block;
  }

  // (80:7) {#if pt1.npdd}
  function create_if_block_5(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[9].npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$1, 79, 21, 2019);
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
  		source: "(80:7) {#if pt1.npdd}",
  		ctx
  	});

  	return block;
  }

  // (81:7) {#if pt1.sop_npdd}
  function create_if_block_4(ctx) {
  	let li;
  	let t_value = /*pt1*/ ctx[9].sop_npdd + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$1, 80, 25, 2069);
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
  		source: "(81:7) {#if pt1.sop_npdd}",
  		ctx
  	});

  	return block;
  }

  // (78:6) {#each pt.arr as pt1}
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
  		source: "(78:6) {#each pt.arr as pt1}",
  		ctx
  	});

  	return block;
  }

  // (76:5) {#each tsInfoArr as pt}
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
  		source: "(76:5) {#each tsInfoArr as pt}",
  		ctx
  	});

  	return block;
  }

  // (90:4) {#if prp.spog}
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
  			add_location(div0, file$1, 91, 6, 2282);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$1, 91, 40, 2316);
  			add_location(div2, file$1, 90, 5, 2270);
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
  		source: "(90:4) {#if prp.spog}",
  		ctx
  	});

  	return block;
  }

  // (95:4) {#if prp.s_pch}
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
  			add_location(div0, file$1, 96, 6, 2410);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$1, 96, 42, 2446);
  			add_location(div2, file$1, 95, 5, 2398);
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
  		source: "(95:4) {#if prp.s_pch}",
  		ctx
  	});

  	return block;
  }

  // (100:4) {#if prp.osv}
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
  			add_location(div0, file$1, 101, 6, 2539);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$1, 101, 46, 2579);
  			add_location(div2, file$1, 100, 5, 2527);
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
  		source: "(100:4) {#if prp.osv}",
  		ctx
  	});

  	return block;
  }

  // (105:4) {#if prp.ndu}
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
  			add_location(div0, file$1, 106, 6, 2670);
  			attr_dev(div1, "class", "sval");
  			add_location(div1, file$1, 106, 46, 2710);
  			add_location(div2, file$1, 105, 5, 2658);
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
  		source: "(105:4) {#if prp.ndu}",
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
  	let t4_value = (/*prp*/ ctx[0].district || "") + "";
  	let t4;
  	let t5;
  	let t6_value = (/*prp*/ ctx[0].dor || "") + "";
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
  	let t17_value = (/*prp*/ ctx[0].collision_date || /*prp*/ ctx[0].dtp_date || "") + "";
  	let t17;
  	let t18;
  	let tr3;
  	let td6;
  	let t20;
  	let td7;
  	let t21_value = (/*prp*/ ctx[0].dtvp || "") + "";
  	let t21;
  	let t22;
  	let tr4;
  	let td8;
  	let t24;
  	let td9;
  	let ul;
  	let t25;
  	let tr5;
  	let td10;
  	let t27;
  	let td11;
  	let t28;
  	let t29;
  	let t30;
  	let t31;
  	let tr6;
  	let td12;
  	let t33;
  	let td13;
  	let b1;
  	let t34_value = /*prp*/ ctx[0].pog + "";
  	let t34;
  	let t35;
  	let t36_value = /*prp*/ ctx[0].ran + "";
  	let t36;
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
  			td0.textContent = "Адрес:";
  			t3 = space();
  			td1 = element("td");
  			t4 = text(t4_value);
  			t5 = space();
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
  			td4.textContent = "Дата/время:";
  			t16 = space();
  			td5 = element("td");
  			t17 = text(t17_value);
  			t18 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Вид ДТП:";
  			t20 = space();
  			td7 = element("td");
  			t21 = text(t21_value);
  			t22 = space();
  			tr4 = element("tr");
  			td8 = element("td");
  			td8.textContent = "Нарушения:";
  			t24 = space();
  			td9 = element("td");
  			ul = element("ul");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t25 = space();
  			tr5 = element("tr");
  			td10 = element("td");
  			td10.textContent = "Условия:";
  			t27 = space();
  			td11 = element("td");
  			if (if_block0) if_block0.c();
  			t28 = space();
  			if (if_block1) if_block1.c();
  			t29 = space();
  			if (if_block2) if_block2.c();
  			t30 = space();
  			if (if_block3) if_block3.c();
  			t31 = space();
  			tr6 = element("tr");
  			td12 = element("td");
  			td12.textContent = "Количество погибших/раненых:";
  			t33 = space();
  			td13 = element("td");
  			b1 = element("b");
  			t34 = text(t34_value);
  			t35 = text("/");
  			t36 = text(t36_value);
  			add_location(b0, file$1, 50, 4, 1127);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$1, 49, 2, 1103);
  			attr_dev(td0, "class", "first svelte-ipyqnf");
  			add_location(td0, file$1, 56, 5, 1250);
  			add_location(td1, file$1, 57, 5, 1285);
  			add_location(tr0, file$1, 55, 3, 1240);
  			attr_dev(td2, "class", "first svelte-ipyqnf");
  			add_location(td2, file$1, 60, 5, 1353);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$1, 61, 29, 1417);
  			add_location(td3, file$1, 61, 5, 1393);
  			add_location(tr1, file$1, 59, 3, 1343);
  			attr_dev(td4, "class", "first svelte-ipyqnf");
  			add_location(td4, file$1, 64, 5, 1545);
  			add_location(td5, file$1, 65, 5, 1585);
  			add_location(tr2, file$1, 63, 3, 1535);
  			attr_dev(td6, "class", "first svelte-ipyqnf");
  			add_location(td6, file$1, 68, 5, 1659);
  			add_location(td7, file$1, 69, 5, 1696);
  			add_location(tr3, file$1, 67, 3, 1649);
  			attr_dev(td8, "class", "first svelte-ipyqnf");
  			add_location(td8, file$1, 72, 14, 1762);
  			add_location(ul, file$1, 74, 4, 1819);
  			add_location(td9, file$1, 73, 14, 1810);
  			add_location(tr4, file$1, 71, 12, 1743);
  			attr_dev(td10, "class", "first svelte-ipyqnf");
  			add_location(td10, file$1, 87, 14, 2195);
  			add_location(td11, file$1, 88, 14, 2241);
  			add_location(tr5, file$1, 86, 12, 2176);
  			attr_dev(td12, "class", "first svelte-ipyqnf");
  			add_location(td12, file$1, 112, 14, 2826);
  			add_location(b1, file$1, 113, 18, 2896);
  			add_location(td13, file$1, 113, 14, 2892);
  			add_location(tr6, file$1, 111, 12, 2807);
  			add_location(tbody, file$1, 54, 3, 1229);
  			attr_dev(table, "class", "table");
  			add_location(table, file$1, 53, 4, 1204);
  			attr_dev(div1, "class", "featureCont");
  			add_location(div1, file$1, 52, 2, 1174);
  			attr_dev(div2, "class", "mvsPopup svelte-ipyqnf");
  			add_location(div2, file$1, 48, 3, 1078);
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
  			append_dev(td1, t5);
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
  			append_dev(td7, t21);
  			append_dev(tbody, t22);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td8);
  			append_dev(tr4, t24);
  			append_dev(tr4, td9);
  			append_dev(td9, ul);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul, null);
  			}

  			append_dev(tbody, t25);
  			append_dev(tbody, tr5);
  			append_dev(tr5, td10);
  			append_dev(tr5, t27);
  			append_dev(tr5, td11);
  			if (if_block0) if_block0.m(td11, null);
  			append_dev(td11, t28);
  			if (if_block1) if_block1.m(td11, null);
  			append_dev(td11, t29);
  			if (if_block2) if_block2.m(td11, null);
  			append_dev(td11, t30);
  			if (if_block3) if_block3.m(td11, null);
  			append_dev(tbody, t31);
  			append_dev(tbody, tr6);
  			append_dev(tr6, td12);
  			append_dev(tr6, t33);
  			append_dev(tr6, td13);
  			append_dev(td13, b1);
  			append_dev(b1, t34);
  			append_dev(b1, t35);
  			append_dev(b1, t36);
  			if (remount) dispose();
  			dispose = listen_dev(span, "click", /*copyParent*/ ctx[1], false, false, false);
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 1 && t0_value !== (t0_value = (/*prp*/ ctx[0].name || /*prp*/ ctx[0].dtvp || "") + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 1 && t4_value !== (t4_value = (/*prp*/ ctx[0].district || "") + "")) set_data_dev(t4, t4_value);
  			if (dirty & /*prp*/ 1 && t6_value !== (t6_value = (/*prp*/ ctx[0].dor || "") + "")) set_data_dev(t6, t6_value);
  			if (dirty & /*prp*/ 1 && t10_value !== (t10_value = /*prp*/ ctx[0].lat + "")) set_data_dev(t10, t10_value);
  			if (dirty & /*prp*/ 1 && t12_value !== (t12_value = /*prp*/ ctx[0].lon + "")) set_data_dev(t12, t12_value);
  			if (dirty & /*prp*/ 1 && t17_value !== (t17_value = (/*prp*/ ctx[0].collision_date || /*prp*/ ctx[0].dtp_date || "") + "")) set_data_dev(t17, t17_value);
  			if (dirty & /*prp*/ 1 && t21_value !== (t21_value = (/*prp*/ ctx[0].dtvp || "") + "")) set_data_dev(t21, t21_value);

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
  					if_block0.m(td11, t28);
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
  					if_block1.m(td11, t29);
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
  					if_block2.m(td11, t30);
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
  					if_block3.m(td11, null);
  				}
  			} else if (if_block3) {
  				if_block3.d(1);
  				if_block3 = null;
  			}

  			if (dirty & /*prp*/ 1 && t34_value !== (t34_value = /*prp*/ ctx[0].pog + "")) set_data_dev(t34, t34_value);
  			if (dirty & /*prp*/ 1 && t36_value !== (t36_value = /*prp*/ ctx[0].ran + "")) set_data_dev(t36, t36_value);
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
  DtpGibdd.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	DtpGibdd.clearLayers();
  	argFilters = arg;

  	let arr = [];
  	if (DtpGibdd._group) {
  		DtpGibdd._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters.forEach(ft => {
  				if (ft.type === 'collision_type') {
  					if (prp.collision_type === ft.zn) {
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
  			}
  		});
  		DtpGibdd.addLayer(L$5.layerGroup(arr));
  	}
  };

  DtpGibdd.on('remove', () => {
  	DtpGibdd.clearLayers();
  }).on('add', ev => {
  	// console.log('/static/data/dtpskpdi.geojson', ev);
  	
  	fetch('https://dtp.mvs.group/scripts/index.php?request=get_stat_gipdd', {})
  		.then(req => req.json())
  		.then(json => {
  			let opt = {collision_type: {}};
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
  				return new CirclePoint(L$5.latLng(prp.lat, prp.lon), {
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
  						console.log('popupclose', ev);
  						// ev.popup.setContent('');
  						if (ev.popup._svObj) {
  							ev.popup._svObj.$destroy();
  							delete ev.popup._svObj;
  						}
  					});
  			});

  			DtpGibdd._opt = opt;
  			DtpGibdd._group = L$5.layerGroup(arr);
  			if (argFilters) {
  				DtpGibdd.setFilter(argFilters);
  			} else {
  				DtpGibdd.addLayer(DtpGibdd._group);
  			}
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

  // (61:5) {#if prp.collisionTypes && prp.collisionTypes.length}
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
  		source: "(61:5) {#if prp.collisionTypes && prp.collisionTypes.length}",
  		ctx
  	});

  	return block;
  }

  // (62:5) {#each prp.collisionTypes as pt}
  function create_each_block_1$1(ctx) {
  	let li;
  	let t_value = (/*pt*/ ctx[6].collisionType || "") + "";
  	let t;

  	const block = {
  		c: function create() {
  			li = element("li");
  			t = text(t_value);
  			add_location(li, file$2, 62, 5, 1569);
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
  		source: "(62:5) {#each prp.collisionTypes as pt}",
  		ctx
  	});

  	return block;
  }

  // (73:5) {#if prp.uchs && prp.uchs.length}
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
  		source: "(73:5) {#if prp.uchs && prp.uchs.length}",
  		ctx
  	});

  	return block;
  }

  // (74:5) {#each prp.uchs as pt}
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
  			add_location(i, file$2, 74, 46, 1872);
  			add_location(b, file$2, 74, 43, 1869);
  			add_location(li, file$2, 74, 5, 1831);
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
  		source: "(74:5) {#each prp.uchs as pt}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$2(ctx) {
  	let div4;
  	let div0;
  	let b;
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
  	let t4_value = /*prp*/ ctx[1].lat + "";
  	let t4;
  	let t5;
  	let t6_value = /*prp*/ ctx[1].lon + "";
  	let t6;
  	let t7;
  	let span;
  	let t8;
  	let tr1;
  	let td2;
  	let t10;
  	let td3;
  	let t11_value = (/*prp*/ ctx[1].collision_date || /*prp*/ ctx[1].dtp_date || "") + "";
  	let t11;
  	let t12;
  	let tr2;
  	let td4;
  	let div1;
  	let t14;
  	let div2;
  	let t15_value = (/*prp*/ ctx[1].collision_context || /*prp*/ ctx[1].dtp_date || "") + "";
  	let t15;
  	let t16;
  	let tr3;
  	let td5;
  	let t18;
  	let td6;
  	let ul0;
  	let t19;
  	let tr4;
  	let td7;
  	let t21;
  	let td8;
  	let ul1;
  	let t22;
  	let tr5;
  	let td9;
  	let button;
  	let t23;
  	let dispose;
  	let if_block0 = /*prp*/ ctx[1].collisionTypes && /*prp*/ ctx[1].collisionTypes.length && create_if_block_1$1(ctx);
  	let if_block1 = /*prp*/ ctx[1].uchs && /*prp*/ ctx[1].uchs.length && create_if_block$1(ctx);

  	const block = {
  		c: function create() {
  			div4 = element("div");
  			div0 = element("div");
  			b = element("b");
  			t0 = text(t0_value);
  			t1 = space();
  			div3 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Координаты:";
  			t3 = space();
  			td1 = element("td");
  			t4 = text(t4_value);
  			t5 = space();
  			t6 = text(t6_value);
  			t7 = space();
  			span = element("span");
  			t8 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Дата/время:";
  			t10 = space();
  			td3 = element("td");
  			t11 = text(t11_value);
  			t12 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			div1 = element("div");
  			div1.textContent = "Условия ДТП:";
  			t14 = space();
  			div2 = element("div");
  			t15 = text(t15_value);
  			t16 = space();
  			tr3 = element("tr");
  			td5 = element("td");
  			td5.textContent = "Нарушения:";
  			t18 = space();
  			td6 = element("td");
  			ul0 = element("ul");
  			if (if_block0) if_block0.c();
  			t19 = space();
  			tr4 = element("tr");
  			td7 = element("td");
  			td7.textContent = "Участники:";
  			t21 = space();
  			td8 = element("td");
  			ul1 = element("ul");
  			if (if_block1) if_block1.c();
  			t22 = space();
  			tr5 = element("tr");
  			td9 = element("td");
  			button = element("button");
  			t23 = text("Фото и схемы");
  			add_location(b, file$2, 37, 4, 805);
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$2, 36, 2, 781);
  			attr_dev(td0, "class", "first");
  			add_location(td0, file$2, 43, 5, 928);
  			attr_dev(span, "title", "Скопировать в буфер обмена");
  			attr_dev(span, "class", "leaflet-gmx-icon-copy");
  			add_location(span, file$2, 44, 29, 992);
  			add_location(td1, file$2, 44, 5, 968);
  			add_location(tr0, file$2, 42, 3, 918);
  			attr_dev(td2, "class", "first");
  			add_location(td2, file$2, 47, 5, 1120);
  			add_location(td3, file$2, 48, 5, 1160);
  			add_location(tr1, file$2, 46, 3, 1110);
  			attr_dev(div1, "class", "first");
  			add_location(div1, file$2, 52, 4, 1255);
  			add_location(div2, file$2, 53, 4, 1297);
  			attr_dev(td4, "colspan", "2");
  			add_location(td4, file$2, 51, 5, 1234);
  			add_location(tr2, file$2, 50, 3, 1224);
  			attr_dev(td5, "class", "first");
  			add_location(td5, file$2, 57, 14, 1405);
  			add_location(ul0, file$2, 59, 4, 1462);
  			add_location(td6, file$2, 58, 14, 1453);
  			add_location(tr3, file$2, 56, 12, 1386);
  			attr_dev(td7, "class", "first");
  			add_location(td7, file$2, 69, 14, 1697);
  			add_location(ul1, file$2, 71, 4, 1754);
  			add_location(td8, file$2, 70, 14, 1745);
  			add_location(tr4, file$2, 68, 12, 1678);
  			attr_dev(button, "class", "primary svelte-1aipaym");
  			button.disabled = /*disabled*/ ctx[2];
  			add_location(button, file$2, 83, 4, 2033);
  			attr_dev(td9, "class", "center");
  			attr_dev(td9, "colspan", "2");
  			add_location(td9, file$2, 82, 5, 1997);
  			add_location(tr5, file$2, 81, 3, 1987);
  			add_location(tbody, file$2, 41, 3, 907);
  			attr_dev(table, "class", "table");
  			add_location(table, file$2, 40, 4, 882);
  			attr_dev(div3, "class", "featureCont");
  			add_location(div3, file$2, 39, 2, 852);
  			attr_dev(div4, "class", "mvsPopup");
  			add_location(div4, file$2, 35, 3, 756);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div4, anchor);
  			append_dev(div4, div0);
  			append_dev(div0, b);
  			append_dev(b, t0);
  			append_dev(div4, t1);
  			append_dev(div4, div3);
  			append_dev(div3, table);
  			append_dev(table, tbody);
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t3);
  			append_dev(tr0, td1);
  			append_dev(td1, t4);
  			append_dev(td1, t5);
  			append_dev(td1, t6);
  			append_dev(td1, t7);
  			append_dev(td1, span);
  			append_dev(tbody, t8);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t10);
  			append_dev(tr1, td3);
  			append_dev(td3, t11);
  			append_dev(tbody, t12);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(td4, div1);
  			append_dev(td4, t14);
  			append_dev(td4, div2);
  			append_dev(div2, t15);
  			append_dev(tbody, t16);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td5);
  			append_dev(tr3, t18);
  			append_dev(tr3, td6);
  			append_dev(td6, ul0);
  			if (if_block0) if_block0.m(ul0, null);
  			append_dev(tbody, t19);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td7);
  			append_dev(tr4, t21);
  			append_dev(tr4, td8);
  			append_dev(td8, ul1);
  			if (if_block1) if_block1.m(ul1, null);
  			append_dev(tbody, t22);
  			append_dev(tbody, tr5);
  			append_dev(tr5, td9);
  			append_dev(td9, button);
  			append_dev(button, t23);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(span, "click", /*copyParent*/ ctx[3], false, false, false),
  				listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false)
  			];
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 2 && t0_value !== (t0_value = (/*prp*/ ctx[1].name || /*prp*/ ctx[1].dtvp || "") + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 2 && t4_value !== (t4_value = /*prp*/ ctx[1].lat + "")) set_data_dev(t4, t4_value);
  			if (dirty & /*prp*/ 2 && t6_value !== (t6_value = /*prp*/ ctx[1].lon + "")) set_data_dev(t6, t6_value);
  			if (dirty & /*prp*/ 2 && t11_value !== (t11_value = (/*prp*/ ctx[1].collision_date || /*prp*/ ctx[1].dtp_date || "") + "")) set_data_dev(t11, t11_value);
  			if (dirty & /*prp*/ 2 && t15_value !== (t15_value = (/*prp*/ ctx[1].collision_context || /*prp*/ ctx[1].dtp_date || "") + "")) set_data_dev(t15, t15_value);

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
  DtpSkpdi.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	DtpSkpdi.clearLayers();
  	argFilters$1 = arg;

  	let arr = [];
  	if (DtpSkpdi._group) {
  		DtpSkpdi._group.getLayers().forEach(it => {
  			let prp = it.options.props,
  				cnt = 0;
  			argFilters$1.forEach(ft => {
  				if (ft.type === 'collision_type') {
  					if (prp.collision_type === ft.zn) {
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
  			}
  		});
  		DtpSkpdi.addLayer(L$6.layerGroup(arr));
  	}
  };

  DtpSkpdi.on('remove', () => {
  	DtpSkpdi.clearLayers();
  }).on('add', ev => {
  	// console.log('/static/data/dtpskpdi.geojson', ev);
  	
  	fetch('https://dtp.mvs.group/scripts/index.php?request=get_skpdi', {})
  	// fetch('https://dtp.mvs.group/static/data/json_stat.json', {})
  		.then(req => req.json())
  		.then(json => {
  			let opt = {collision_type: {}};
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
  				return new CirclePoint(L$6.latLng(prp.lat, prp.lon), {
  					props: prp,
  					radius: 6,
  					box: true,
  					stroke: stroke,
  					fillColor: fillColor,
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
  			
  			DtpSkpdi._opt = opt;
  			DtpSkpdi._group = L$6.layerGroup(arr);
  			// DtpSkpdi.addLayer(L.layerGroup(arr));
  			if (argFilters$1) {
  				DtpSkpdi.setFilter(argFilters$1);
  			} else {
  				DtpSkpdi.addLayer(DtpSkpdi._group);
  			}
  		});
  });

  /* src\DtpPopupVerifyed.svelte generated by Svelte v3.20.1 */
  const file$3 = "src\\DtpPopupVerifyed.svelte";

  function get_each_context$3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[5] = list[i];
  	child_ctx[7] = i;
  	return child_ctx;
  }

  // (42:3) {#each prp._cur as pt, i}
  function create_each_block$3(ctx) {
  	let button;
  	let t_value = (/*pt*/ ctx[5].type === "gibdd" ? "ГИБДД" : "СКПДИ") + "";
  	let t;
  	let button_class_value;
  	let button_value_value;
  	let dispose;

  	const block = {
  		c: function create() {
  			button = element("button");
  			t = text(t_value);
  			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*curNum*/ ctx[1] === /*i*/ ctx[7] ? "current" : "") + " svelte-txaali"));
  			button.value = button_value_value = /*i*/ ctx[7];
  			add_location(button, file$3, 42, 3, 829);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, button, anchor);
  			append_dev(button, t);
  			if (remount) dispose();
  			dispose = listen_dev(button, "click", /*onclick*/ ctx[3], false, false, false);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty & /*prp*/ 1 && t_value !== (t_value = (/*pt*/ ctx[5].type === "gibdd" ? "ГИБДД" : "СКПДИ") + "")) set_data_dev(t, t_value);

  			if (dirty & /*curNum*/ 2 && button_class_value !== (button_class_value = "" + (null_to_empty(/*curNum*/ ctx[1] === /*i*/ ctx[7] ? "current" : "") + " svelte-txaali"))) {
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
  		source: "(42:3) {#each prp._cur as pt, i}",
  		ctx
  	});

  	return block;
  }

  // (48:2) {:else}
  function create_else_block(ctx) {
  	let current;

  	const dtppopupskpdi = new DtpPopupSkpdi({
  			props: { prp: /*data*/ ctx[2] },
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
  			if (dirty & /*data*/ 4) dtppopupskpdi_changes.prp = /*data*/ ctx[2];
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
  		source: "(48:2) {:else}",
  		ctx
  	});

  	return block;
  }

  // (46:2) {#if prp._cur[curNum].type === 'gibdd'}
  function create_if_block$2(ctx) {
  	let current;

  	const dtppopupgibdd = new DtpPopupGibdd({
  			props: { prp: /*data*/ ctx[2] },
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
  			if (dirty & /*data*/ 4) dtppopupgibdd_changes.prp = /*data*/ ctx[2];
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
  		source: "(46:2) {#if prp._cur[curNum].type === 'gibdd'}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$3(ctx) {
  	let div1;
  	let div0;
  	let t;
  	let current_block_type_index;
  	let if_block;
  	let current;
  	let each_value = /*prp*/ ctx[0]._cur;
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
  	}

  	const if_block_creators = [create_if_block$2, create_else_block];
  	const if_blocks = [];

  	function select_block_type(ctx, dirty) {
  		if (/*prp*/ ctx[0]._cur[/*curNum*/ ctx[1]].type === "gibdd") return 0;
  		return 1;
  	}

  	current_block_type_index = select_block_type(ctx);
  	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

  	const block = {
  		c: function create() {
  			div1 = element("div");
  			div0 = element("div");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t = space();
  			if_block.c();
  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$3, 40, 2, 777);
  			attr_dev(div1, "class", "mvsPopup");
  			add_location(div1, file$3, 39, 1, 752);
  		},
  		l: function claim(nodes) {
  			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, div1, anchor);
  			append_dev(div1, div0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(div0, null);
  			}

  			append_dev(div1, t);
  			if_blocks[current_block_type_index].m(div1, null);
  			current = true;
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*curNum, onclick, prp*/ 11) {
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
  						each_blocks[i].m(div0, null);
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
  				if_block.m(div1, null);
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
  			if (detaching) detach_dev(div1);
  			destroy_each(each_blocks, detaching);
  			if_blocks[current_block_type_index].d();
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

  	// export let popup;
  	let curNum = 0;

  	let data = {};

  	const onclick = ev => {
  		// console.log('onclick', ev)
  		let target = ev.target, nm = Number(target.value);

  		if (curNum !== nm) {
  			$$invalidate(1, curNum = nm);
  			setPage(curNum);
  		}
  	};

  	const setPage = nm => {
  		let pt = prp._cur[nm],
  			type = pt.type,
  			url = "https://dtp.mvs.group/scripts/index.php?request=get_dtp_id&id=" + pt.id + "&type=" + type;

  		fetch(url, {}).then(req => req.json()).then(json => {
  			$$invalidate(2, data = json);
  		});
  	};

  	setPage(curNum);
  	const writable_props = ["prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DtpPopupVerifyed> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupVerifyed", $$slots, []);

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({
  		DtpPopupGibdd,
  		DtpPopupSkpdi,
  		prp,
  		curNum,
  		data,
  		onclick,
  		setPage
  	});

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  		if ("curNum" in $$props) $$invalidate(1, curNum = $$props.curNum);
  		if ("data" in $$props) $$invalidate(2, data = $$props.data);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [prp, curNum, data, onclick];
  }

  class DtpPopupVerifyed extends SvelteComponentDev {
  	constructor(options) {
  		super(options);
  		init(this, options, instance$3, create_fragment$3, safe_not_equal, { prp: 0 });

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
  DtpVerifyed.setFilter = arg => {
  // console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
  	DtpVerifyed.clearLayers();
  	// DtpVerifyed._heatData = [];
  	argFilters$2 = arg;

  	let arr = [];
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
  					} else if (ft.zn === 2 && prp.id_skpdi) {
  						cnt++;
  					} else if (ft.zn === 3 && prp.id_stat) {
  						cnt++;
  					}
  				} else if (ft.type === 'collision_type') {
  					if (prp.collision_type === ft.zn) {
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
  				// DtpVerifyed._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
  			}
  		});
  		DtpVerifyed.addLayer(L$7.layerGroup(arr));
  		// DtpVerifyed._heat.setData({
  			// max: 8,
  			// data: DtpVerifyed._heatData
  		// });
  	}
  };

  DtpVerifyed.on('remove', () => {
  	DtpVerifyed.clearLayers();
  }).on('add', ev => {
  	fetch('https://dtp.mvs.group/scripts/index.php?request=get_collision', {})
  		.then(req => req.json())
  		.then(json => {
  			let opt = {collision_type: {}};
  			// DtpVerifyed._heatData = [];
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
  				return new CirclePoint(L$7.latLng(prp.lat, prp.lon), {
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
  			
  			DtpVerifyed._opt = opt;
  			DtpVerifyed._group = L$7.layerGroup(arr);
  			if (argFilters$2) {
  				DtpVerifyed.setFilter(argFilters$2);
  			} else {
  				DtpVerifyed.addLayer(DtpVerifyed._group);
  			}
  			// DtpVerifyed._heat.setData({
  				// max: 8,
  				// data: DtpVerifyed._heatData
  			// });
  			// if (!DtpVerifyed._heat._map) {
  				// DtpVerifyed._map.addLayer(DtpVerifyed._heat);
  			// }
  		});
  });

  /* src\DtpVerifyedFilters.svelte generated by Svelte v3.20.1 */

  const { Object: Object_1, console: console_1$2 } = globals;
  const file$4 = "src\\DtpVerifyedFilters.svelte";

  function get_each_context$4(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[64] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[64] = list[i];
  	return child_ctx;
  }

  function get_each_context_2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[64] = list[i];
  	return child_ctx;
  }

  function get_each_context_3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[64] = list[i];
  	return child_ctx;
  }

  function get_each_context_4(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[64] = list[i];
  	return child_ctx;
  }

  function get_each_context_5(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[64] = list[i];
  	return child_ctx;
  }

  function get_each_context_6(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[64] = list[i];
  	return child_ctx;
  }

  // (245:2) {#if DtpHearthsTmp._map && DtpHearthsTmp._opt && DtpHearthsTmp._opt.years}
  function create_if_block_9(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div4;
  	let div1;
  	let select0;
  	let option0;
  	let t4;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let t10;
  	let div2;
  	let select2;
  	let option6;
  	let t14;
  	let div3;
  	let select3;
  	let option7;
  	let option8;
  	let option9;
  	let option10;
  	let option11;
  	let dispose;
  	let each_value_6 = Object.keys(/*DtpHearthsTmp*/ ctx[1]._opt.years).sort();
  	validate_each_argument(each_value_6);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_6.length; i += 1) {
  		each_blocks_1[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
  	}

  	let each_value_5 = /*optTypeHearthsTmpKeys*/ ctx[27];
  	validate_each_argument(each_value_5);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_5.length; i += 1) {
  		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги (TMP)";
  			t2 = space();
  			div4 = element("div");
  			div1 = element("div");
  			select0 = element("select");
  			option0 = element("option");
  			option0.textContent = "Все года";

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t4 = space();
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = "Все кварталы";
  			option2 = element("option");
  			option2.textContent = "1 квартал";
  			option3 = element("option");
  			option3.textContent = "2 квартал";
  			option4 = element("option");
  			option4.textContent = "3 квартал";
  			option5 = element("option");
  			option5.textContent = "4 квартал";
  			t10 = space();
  			div2 = element("div");
  			select2 = element("select");
  			option6 = element("option");

  			option6.textContent = `
						Все типы (${/*optTypeHearthsTmpKeys*/ ctx[27].reduce(/*func*/ ctx[48], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t14 = space();
  			div3 = element("div");
  			select3 = element("select");
  			option7 = element("option");
  			option7.textContent = "Очаги все";
  			option8 = element("option");
  			option8.textContent = "Только с погибшими";
  			option9 = element("option");
  			option9.textContent = "Только с пострадавшими";
  			option10 = element("option");
  			option10.textContent = "С пострадавшими или погибшими";
  			option11 = element("option");
  			option11.textContent = "С пострадавшими и погибшими";
  			add_location(b, file$4, 245, 31, 8164);
  			attr_dev(div0, "class", "pLine svelte-hmsp51");
  			add_location(div0, file$4, 245, 2, 8135);
  			option0.__value = "";
  			option0.value = option0.__value;
  			add_location(option0, file$4, 249, 5, 8332);
  			attr_dev(select0, "class", "svelte-hmsp51");
  			if (/*hearths_yearTmp*/ ctx[14] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[46].call(select0));
  			add_location(select0, file$4, 248, 4, 8255);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$4, 256, 5, 8585);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$4, 257, 5, 8629);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$4, 258, 5, 8669);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$4, 259, 5, 8709);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$4, 260, 5, 8749);
  			attr_dev(select1, "class", "svelte-hmsp51");
  			if (/*hearths_quarterTmp*/ ctx[15] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[47].call(select1));
  			add_location(select1, file$4, 255, 4, 8505);
  			attr_dev(div1, "class", "pLine nowrap svelte-hmsp51");
  			add_location(div1, file$4, 247, 3, 8224);
  			option6.__value = "";
  			option6.value = option6.__value;
  			add_location(option6, file$4, 265, 5, 8913);
  			attr_dev(select2, "class", "svelte-hmsp51");
  			if (/*str_icon_typeTmp*/ ctx[17] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[49].call(select2));
  			add_location(select2, file$4, 264, 4, 8835);
  			attr_dev(div2, "class", "pLine svelte-hmsp51");
  			add_location(div2, file$4, 263, 3, 8811);
  			option7.__value = "";
  			option7.value = option7.__value;
  			add_location(option7, file$4, 277, 5, 9347);
  			option8.__value = "1";
  			option8.value = option8.__value;
  			add_location(option8, file$4, 278, 5, 9388);
  			option9.__value = "2";
  			option9.value = option9.__value;
  			add_location(option9, file$4, 279, 5, 9437);
  			option10.__value = "3";
  			option10.value = option10.__value;
  			add_location(option10, file$4, 280, 5, 9490);
  			option11.__value = "4";
  			option11.value = option11.__value;
  			add_location(option11, file$4, 281, 5, 9550);
  			attr_dev(select3, "class", "svelte-hmsp51");
  			if (/*hearths_strickenTmp*/ ctx[16] === void 0) add_render_callback(() => /*select3_change_handler*/ ctx[50].call(select3));
  			add_location(select3, file$4, 276, 4, 9266);
  			attr_dev(div3, "class", "pLine svelte-hmsp51");
  			add_location(div3, file$4, 275, 3, 9242);
  			attr_dev(div4, "class", "filtersCont svelte-hmsp51");
  			add_location(div4, file$4, 246, 2, 8195);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div4, anchor);
  			append_dev(div4, div1);
  			append_dev(div1, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(select0, null);
  			}

  			select_option(select0, /*hearths_yearTmp*/ ctx[14]);
  			append_dev(div1, t4);
  			append_dev(div1, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_quarterTmp*/ ctx[15]);
  			append_dev(div4, t10);
  			append_dev(div4, div2);
  			append_dev(div2, select2);
  			append_dev(select2, option6);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select2, null);
  			}

  			select_option(select2, /*str_icon_typeTmp*/ ctx[17]);
  			append_dev(div4, t14);
  			append_dev(div4, div3);
  			append_dev(div3, select3);
  			append_dev(select3, option7);
  			append_dev(select3, option8);
  			append_dev(select3, option9);
  			append_dev(select3, option10);
  			append_dev(select3, option11);
  			select_option(select3, /*hearths_strickenTmp*/ ctx[16]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select0, "change", /*select0_change_handler*/ ctx[46]),
  				listen_dev(select0, "change", /*setFilterHearthsTmp*/ ctx[31], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler*/ ctx[47]),
  				listen_dev(select1, "change", /*setFilterHearthsTmp*/ ctx[31], false, false, false),
  				listen_dev(select2, "change", /*select2_change_handler*/ ctx[49]),
  				listen_dev(select2, "change", /*setFilterHearthsTmp*/ ctx[31], false, false, false),
  				listen_dev(select3, "change", /*select3_change_handler*/ ctx[50]),
  				listen_dev(select3, "change", /*setFilterHearthsTmp*/ ctx[31], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 2) {
  				each_value_6 = Object.keys(/*DtpHearthsTmp*/ ctx[1]._opt.years).sort();
  				validate_each_argument(each_value_6);
  				let i;

  				for (i = 0; i < each_value_6.length; i += 1) {
  					const child_ctx = get_each_context_6(ctx, each_value_6, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_6(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_6.length;
  			}

  			if (dirty[0] & /*hearths_yearTmp*/ 16384) {
  				select_option(select0, /*hearths_yearTmp*/ ctx[14]);
  			}

  			if (dirty[0] & /*hearths_quarterTmp*/ 32768) {
  				select_option(select1, /*hearths_quarterTmp*/ ctx[15]);
  			}

  			if (dirty[0] & /*optTypeHearthsTmpKeys, optDataHearthsTmp*/ 201326592) {
  				each_value_5 = /*optTypeHearthsTmpKeys*/ ctx[27];
  				validate_each_argument(each_value_5);
  				let i;

  				for (i = 0; i < each_value_5.length; i += 1) {
  					const child_ctx = get_each_context_5(ctx, each_value_5, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_5(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select2, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_5.length;
  			}

  			if (dirty[0] & /*str_icon_typeTmp*/ 131072) {
  				select_option(select2, /*str_icon_typeTmp*/ ctx[17]);
  			}

  			if (dirty[0] & /*hearths_strickenTmp*/ 65536) {
  				select_option(select3, /*hearths_strickenTmp*/ ctx[16]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div4);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_9.name,
  		type: "if",
  		source: "(245:2) {#if DtpHearthsTmp._map && DtpHearthsTmp._opt && DtpHearthsTmp._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (251:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}
  function create_each_block_6(ctx) {
  	let option;
  	let t_value = /*key*/ ctx[64] + "";
  	let t;
  	let option_value_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t = text(t_value);
  			option.__value = option_value_value = /*key*/ ctx[64];
  			option.value = option.__value;
  			add_location(option, file$4, 251, 6, 8438);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearthsTmp*/ 2 && t_value !== (t_value = /*key*/ ctx[64] + "")) set_data_dev(t, t_value);

  			if (dirty[0] & /*DtpHearthsTmp*/ 2 && option_value_value !== (option_value_value = /*key*/ ctx[64])) {
  				prop_dev(option, "__value", option_value_value);
  			}

  			option.value = option.__value;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_6.name,
  		type: "each",
  		source: "(251:5) {#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (269:5) {#each optTypeHearthsTmpKeys as key}
  function create_each_block_5(ctx) {
  	let option;
  	let t0_value = /*key*/ ctx[64] + "";
  	let t0;
  	let t1;
  	let t2_value = /*optDataHearthsTmp*/ ctx[26].str_icon_type[/*key*/ ctx[64]] + "";
  	let t2;
  	let t3;
  	let option_value_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text(t0_value);
  			t1 = text(" (");
  			t2 = text(t2_value);
  			t3 = text(")\n\t\t\t\t\t\t");
  			option.__value = option_value_value = /*key*/ ctx[64];
  			option.value = option.__value;
  			add_location(option, file$4, 269, 6, 9111);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
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
  		source: "(269:5) {#each optTypeHearthsTmpKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (289:2) {#if DtpHearths._map && DtpHearths._opt && DtpHearths._opt.years}
  function create_if_block_8(ctx) {
  	let div0;
  	let t0;
  	let b;
  	let t2;
  	let div4;
  	let div1;
  	let select0;
  	let option0;
  	let t4;
  	let select1;
  	let option1;
  	let option2;
  	let option3;
  	let option4;
  	let option5;
  	let t10;
  	let div2;
  	let select2;
  	let option6;
  	let t14;
  	let div3;
  	let select3;
  	let option7;
  	let option8;
  	let option9;
  	let option10;
  	let option11;
  	let dispose;
  	let each_value_4 = Object.keys(/*DtpHearths*/ ctx[2]._opt.years).sort();
  	validate_each_argument(each_value_4);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_4.length; i += 1) {
  		each_blocks_1[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
  	}

  	let each_value_3 = /*optTypeHearthsKeys*/ ctx[25];
  	validate_each_argument(each_value_3);
  	let each_blocks = [];

  	for (let i = 0; i < each_value_3.length; i += 1) {
  		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
  	}

  	const block = {
  		c: function create() {
  			div0 = element("div");
  			t0 = text("Фильтры - ");
  			b = element("b");
  			b.textContent = "ДТП Очаги";
  			t2 = space();
  			div4 = element("div");
  			div1 = element("div");
  			select0 = element("select");
  			option0 = element("option");
  			option0.textContent = "Все года";

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t4 = space();
  			select1 = element("select");
  			option1 = element("option");
  			option1.textContent = "Все кварталы";
  			option2 = element("option");
  			option2.textContent = "1 квартал";
  			option3 = element("option");
  			option3.textContent = "2 квартал";
  			option4 = element("option");
  			option4.textContent = "3 квартал";
  			option5 = element("option");
  			option5.textContent = "4 квартал";
  			t10 = space();
  			div2 = element("div");
  			select2 = element("select");
  			option6 = element("option");

  			option6.textContent = `
						Все типы (${/*optTypeHearthsKeys*/ ctx[25].reduce(/*func_1*/ ctx[53], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t14 = space();
  			div3 = element("div");
  			select3 = element("select");
  			option7 = element("option");
  			option7.textContent = "Очаги все";
  			option8 = element("option");
  			option8.textContent = "Только с погибшими";
  			option9 = element("option");
  			option9.textContent = "Только с пострадавшими";
  			option10 = element("option");
  			option10.textContent = "С пострадавшими или погибшими";
  			option11 = element("option");
  			option11.textContent = "С пострадавшими и погибшими";
  			add_location(b, file$4, 289, 31, 9745);
  			attr_dev(div0, "class", "pLine svelte-hmsp51");
  			add_location(div0, file$4, 289, 2, 9716);
  			option0.__value = "";
  			option0.value = option0.__value;
  			add_location(option0, file$4, 293, 5, 9901);
  			attr_dev(select0, "class", "svelte-hmsp51");
  			if (/*hearths_year*/ ctx[10] === void 0) add_render_callback(() => /*select0_change_handler_1*/ ctx[51].call(select0));
  			add_location(select0, file$4, 292, 4, 9830);
  			option1.__value = "";
  			option1.value = option1.__value;
  			add_location(option1, file$4, 300, 5, 10145);
  			option2.__value = "1";
  			option2.value = option2.__value;
  			add_location(option2, file$4, 301, 5, 10189);
  			option3.__value = "2";
  			option3.value = option3.__value;
  			add_location(option3, file$4, 302, 5, 10229);
  			option4.__value = "3";
  			option4.value = option4.__value;
  			add_location(option4, file$4, 303, 5, 10269);
  			option5.__value = "4";
  			option5.value = option5.__value;
  			add_location(option5, file$4, 304, 5, 10309);
  			attr_dev(select1, "class", "svelte-hmsp51");
  			if (/*hearths_quarter*/ ctx[11] === void 0) add_render_callback(() => /*select1_change_handler_1*/ ctx[52].call(select1));
  			add_location(select1, file$4, 299, 4, 10071);
  			attr_dev(div1, "class", "pLine nowrap svelte-hmsp51");
  			add_location(div1, file$4, 291, 3, 9799);
  			option6.__value = "";
  			option6.value = option6.__value;
  			add_location(option6, file$4, 309, 5, 10467);
  			attr_dev(select2, "class", "svelte-hmsp51");
  			if (/*str_icon_type*/ ctx[13] === void 0) add_render_callback(() => /*select2_change_handler_1*/ ctx[54].call(select2));
  			add_location(select2, file$4, 308, 4, 10395);
  			attr_dev(div2, "class", "pLine svelte-hmsp51");
  			add_location(div2, file$4, 307, 3, 10371);
  			option7.__value = "";
  			option7.value = option7.__value;
  			add_location(option7, file$4, 321, 5, 10883);
  			option8.__value = "1";
  			option8.value = option8.__value;
  			add_location(option8, file$4, 322, 5, 10924);
  			option9.__value = "2";
  			option9.value = option9.__value;
  			add_location(option9, file$4, 323, 5, 10973);
  			option10.__value = "3";
  			option10.value = option10.__value;
  			add_location(option10, file$4, 324, 5, 11026);
  			option11.__value = "4";
  			option11.value = option11.__value;
  			add_location(option11, file$4, 325, 5, 11086);
  			attr_dev(select3, "class", "svelte-hmsp51");
  			if (/*hearths_stricken*/ ctx[12] === void 0) add_render_callback(() => /*select3_change_handler_1*/ ctx[55].call(select3));
  			add_location(select3, file$4, 320, 4, 10808);
  			attr_dev(div3, "class", "pLine svelte-hmsp51");
  			add_location(div3, file$4, 319, 3, 10784);
  			attr_dev(div4, "class", "filtersCont svelte-hmsp51");
  			add_location(div4, file$4, 290, 2, 9770);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, t0);
  			append_dev(div0, b);
  			insert_dev(target, t2, anchor);
  			insert_dev(target, div4, anchor);
  			append_dev(div4, div1);
  			append_dev(div1, select0);
  			append_dev(select0, option0);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(select0, null);
  			}

  			select_option(select0, /*hearths_year*/ ctx[10]);
  			append_dev(div1, t4);
  			append_dev(div1, select1);
  			append_dev(select1, option1);
  			append_dev(select1, option2);
  			append_dev(select1, option3);
  			append_dev(select1, option4);
  			append_dev(select1, option5);
  			select_option(select1, /*hearths_quarter*/ ctx[11]);
  			append_dev(div4, t10);
  			append_dev(div4, div2);
  			append_dev(div2, select2);
  			append_dev(select2, option6);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select2, null);
  			}

  			select_option(select2, /*str_icon_type*/ ctx[13]);
  			append_dev(div4, t14);
  			append_dev(div4, div3);
  			append_dev(div3, select3);
  			append_dev(select3, option7);
  			append_dev(select3, option8);
  			append_dev(select3, option9);
  			append_dev(select3, option10);
  			append_dev(select3, option11);
  			select_option(select3, /*hearths_stricken*/ ctx[12]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select0, "change", /*select0_change_handler_1*/ ctx[51]),
  				listen_dev(select0, "change", /*setFilterHearths*/ ctx[32], false, false, false),
  				listen_dev(select1, "change", /*select1_change_handler_1*/ ctx[52]),
  				listen_dev(select1, "change", /*setFilterHearths*/ ctx[32], false, false, false),
  				listen_dev(select2, "change", /*select2_change_handler_1*/ ctx[54]),
  				listen_dev(select2, "change", /*setFilterHearths*/ ctx[32], false, false, false),
  				listen_dev(select3, "change", /*select3_change_handler_1*/ ctx[55]),
  				listen_dev(select3, "change", /*setFilterHearths*/ ctx[32], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 4) {
  				each_value_4 = Object.keys(/*DtpHearths*/ ctx[2]._opt.years).sort();
  				validate_each_argument(each_value_4);
  				let i;

  				for (i = 0; i < each_value_4.length; i += 1) {
  					const child_ctx = get_each_context_4(ctx, each_value_4, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_4(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(select0, null);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_4.length;
  			}

  			if (dirty[0] & /*hearths_year*/ 1024) {
  				select_option(select0, /*hearths_year*/ ctx[10]);
  			}

  			if (dirty[0] & /*hearths_quarter*/ 2048) {
  				select_option(select1, /*hearths_quarter*/ ctx[11]);
  			}

  			if (dirty[0] & /*optTypeHearthsKeys, optDataHearths*/ 50331648) {
  				each_value_3 = /*optTypeHearthsKeys*/ ctx[25];
  				validate_each_argument(each_value_3);
  				let i;

  				for (i = 0; i < each_value_3.length; i += 1) {
  					const child_ctx = get_each_context_3(ctx, each_value_3, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_3(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(select2, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_3.length;
  			}

  			if (dirty[0] & /*str_icon_type*/ 8192) {
  				select_option(select2, /*str_icon_type*/ ctx[13]);
  			}

  			if (dirty[0] & /*hearths_stricken*/ 4096) {
  				select_option(select3, /*hearths_stricken*/ ctx[12]);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t2);
  			if (detaching) detach_dev(div4);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_8.name,
  		type: "if",
  		source: "(289:2) {#if DtpHearths._map && DtpHearths._opt && DtpHearths._opt.years}",
  		ctx
  	});

  	return block;
  }

  // (295:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}
  function create_each_block_4(ctx) {
  	let option;
  	let t_value = /*key*/ ctx[64] + "";
  	let t;
  	let option_value_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t = text(t_value);
  			option.__value = option_value_value = /*key*/ ctx[64];
  			option.value = option.__value;
  			add_location(option, file$4, 295, 6, 10004);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t);
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*DtpHearths*/ 4 && t_value !== (t_value = /*key*/ ctx[64] + "")) set_data_dev(t, t_value);

  			if (dirty[0] & /*DtpHearths*/ 4 && option_value_value !== (option_value_value = /*key*/ ctx[64])) {
  				prop_dev(option, "__value", option_value_value);
  			}

  			option.value = option.__value;
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(option);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block_4.name,
  		type: "each",
  		source: "(295:5) {#each Object.keys(DtpHearths._opt.years).sort() as key}",
  		ctx
  	});

  	return block;
  }

  // (313:5) {#each optTypeHearthsKeys as key}
  function create_each_block_3(ctx) {
  	let option;
  	let t0_value = /*key*/ ctx[64] + "";
  	let t0;
  	let t1;
  	let t2_value = /*optDataHearths*/ ctx[24].str_icon_type[/*key*/ ctx[64]] + "";
  	let t2;
  	let t3;
  	let option_value_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text(t0_value);
  			t1 = text(" (");
  			t2 = text(t2_value);
  			t3 = text(")\n\t\t\t\t\t\t");
  			option.__value = option_value_value = /*key*/ ctx[64];
  			option.value = option.__value;
  			add_location(option, file$4, 313, 6, 10656);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
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
  		source: "(313:5) {#each optTypeHearthsKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (340:52) 
  function create_if_block_7$1(ctx) {
  	let div;

  	const block = {
  		c: function create() {
  			div = element("div");
  			div.textContent = "Нет включенных слоев";
  			attr_dev(div, "class", "pLine svelte-hmsp51");
  			add_location(div, file$4, 340, 3, 11603);
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
  		id: create_if_block_7$1.name,
  		type: "if",
  		source: "(340:52) ",
  		ctx
  	});

  	return block;
  }

  // (332:2) {#if DtpVerifyed._map || DtpSkpdi._map || DtpGibdd._map}
  function create_if_block_6$1(ctx) {
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
  			attr_dev(hr, "class", "svelte-hmsp51");
  			add_location(hr, file$4, 332, 21, 11261);
  			attr_dev(div0, "class", "pLine svelte-hmsp51");
  			add_location(div0, file$4, 332, 2, 11242);
  			attr_dev(button0, "class", "pika-prev");
  			add_location(button0, file$4, 334, 3, 11305);
  			attr_dev(input0, "type", "text");
  			attr_dev(input0, "class", "begDate svelte-hmsp51");
  			add_location(input0, file$4, 335, 3, 11362);
  			attr_dev(input1, "type", "text");
  			attr_dev(input1, "class", "endDate svelte-hmsp51");
  			add_location(input1, file$4, 336, 3, 11423);
  			attr_dev(button1, "class", "pika-next");
  			add_location(button1, file$4, 337, 3, 11484);
  			attr_dev(div1, "class", "pikaday pLine svelte-hmsp51");
  			add_location(div1, file$4, 333, 2, 11274);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div0, anchor);
  			append_dev(div0, hr);
  			insert_dev(target, t0, anchor);
  			insert_dev(target, div1, anchor);
  			append_dev(div1, button0);
  			append_dev(div1, t1);
  			append_dev(div1, input0);
  			/*input0_binding*/ ctx[56](input0);
  			append_dev(div1, t2);
  			append_dev(div1, input1);
  			/*input1_binding*/ ctx[57](input1);
  			append_dev(div1, t3);
  			append_dev(div1, button1);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(button0, "click", /*onPrev*/ ctx[34], false, false, false),
  				listen_dev(button1, "click", /*onNext*/ ctx[35], false, false, false)
  			];
  		},
  		p: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			/*input0_binding*/ ctx[56](null);
  			/*input1_binding*/ ctx[57](null);
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_6$1.name,
  		type: "if",
  		source: "(332:2) {#if DtpVerifyed._map || DtpSkpdi._map || DtpGibdd._map}",
  		ctx
  	});

  	return block;
  }

  // (344:2) {#if DtpVerifyed._map}
  function create_if_block_4$1(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div6;
  	let div2;
  	let input0;
  	let label0;
  	let t5;
  	let div3;
  	let input1;
  	let label1;
  	let t7;
  	let div4;
  	let input2;
  	let label2;
  	let t9;
  	let div5;
  	let input3;
  	let label3;
  	let t11;
  	let dispose;
  	let if_block = /*optData*/ ctx[18].collision_type && create_if_block_5$1(ctx);

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
  			input0 = element("input");
  			label0 = element("label");
  			label0.textContent = "Все";
  			t5 = space();
  			div3 = element("div");
  			input1 = element("input");
  			label1 = element("label");
  			label1.textContent = "Только Пересечения";
  			t7 = space();
  			div4 = element("div");
  			input2 = element("input");
  			label2 = element("label");
  			label2.textContent = "Только СКПДИ";
  			t9 = space();
  			div5 = element("div");
  			input3 = element("input");
  			label3 = element("label");
  			label3.textContent = "Только ГИБДД";
  			t11 = space();
  			if (if_block) if_block.c();
  			attr_dev(hr, "class", "svelte-hmsp51");
  			add_location(hr, file$4, 344, 21, 11704);
  			attr_dev(div0, "class", "pLine svelte-hmsp51");
  			add_location(div0, file$4, 344, 2, 11685);
  			add_location(b, file$4, 345, 31, 11746);
  			attr_dev(div1, "class", "pLine svelte-hmsp51");
  			add_location(div1, file$4, 345, 2, 11717);
  			attr_dev(input0, "type", "radio");
  			attr_dev(input0, "id", "d0");
  			attr_dev(input0, "name", "drone");
  			input0.value = "0";
  			input0.checked = true;
  			attr_dev(input0, "class", "svelte-hmsp51");
  			add_location(input0, file$4, 347, 22, 11821);
  			attr_dev(label0, "for", "d0");
  			attr_dev(label0, "class", "svelte-hmsp51");
  			add_location(label0, file$4, 347, 98, 11897);
  			attr_dev(div2, "class", "pLine svelte-hmsp51");
  			add_location(div2, file$4, 347, 3, 11802);
  			attr_dev(input1, "type", "radio");
  			attr_dev(input1, "id", "d1");
  			attr_dev(input1, "name", "drone");
  			input1.value = "1";
  			attr_dev(input1, "class", "svelte-hmsp51");
  			add_location(input1, file$4, 348, 22, 11953);
  			attr_dev(label1, "for", "d1");
  			attr_dev(label1, "class", "svelte-hmsp51");
  			add_location(label1, file$4, 348, 90, 12021);
  			attr_dev(div3, "class", "pLine svelte-hmsp51");
  			add_location(div3, file$4, 348, 3, 11934);
  			attr_dev(input2, "type", "radio");
  			attr_dev(input2, "id", "d2");
  			attr_dev(input2, "name", "drone");
  			input2.value = "2";
  			attr_dev(input2, "class", "svelte-hmsp51");
  			add_location(input2, file$4, 349, 22, 12092);
  			attr_dev(label2, "for", "d2");
  			attr_dev(label2, "class", "svelte-hmsp51");
  			add_location(label2, file$4, 349, 92, 12162);
  			attr_dev(div4, "class", "pLine svelte-hmsp51");
  			add_location(div4, file$4, 349, 3, 12073);
  			attr_dev(input3, "type", "radio");
  			attr_dev(input3, "id", "d3");
  			attr_dev(input3, "name", "drone");
  			input3.value = "3";
  			attr_dev(input3, "class", "svelte-hmsp51");
  			add_location(input3, file$4, 350, 22, 12227);
  			attr_dev(label3, "for", "d3");
  			attr_dev(label3, "class", "svelte-hmsp51");
  			add_location(label3, file$4, 350, 92, 12297);
  			attr_dev(div5, "class", "pLine svelte-hmsp51");
  			add_location(div5, file$4, 350, 3, 12208);
  			attr_dev(div6, "class", "filtersCont svelte-hmsp51");
  			add_location(div6, file$4, 346, 2, 11773);
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
  			append_dev(div2, input0);
  			append_dev(div2, label0);
  			append_dev(div6, t5);
  			append_dev(div6, div3);
  			append_dev(div3, input1);
  			append_dev(div3, label1);
  			append_dev(div6, t7);
  			append_dev(div6, div4);
  			append_dev(div4, input2);
  			append_dev(div4, label2);
  			append_dev(div6, t9);
  			append_dev(div6, div5);
  			append_dev(div5, input3);
  			append_dev(div5, label3);
  			append_dev(div6, t11);
  			if (if_block) if_block.m(div6, null);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(input0, "click", /*oncheck*/ ctx[33], false, false, false),
  				listen_dev(input1, "click", /*oncheck*/ ctx[33], false, false, false),
  				listen_dev(input2, "click", /*oncheck*/ ctx[33], false, false, false),
  				listen_dev(input3, "click", /*oncheck*/ ctx[33], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (/*optData*/ ctx[18].collision_type) if_block.p(ctx, dirty);
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div0);
  			if (detaching) detach_dev(t0);
  			if (detaching) detach_dev(div1);
  			if (detaching) detach_dev(t3);
  			if (detaching) detach_dev(div6);
  			if (if_block) if_block.d();
  			run_all(dispose);
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_if_block_4$1.name,
  		type: "if",
  		source: "(344:2) {#if DtpVerifyed._map}",
  		ctx
  	});

  	return block;
  }

  // (352:3) {#if optData.collision_type}
  function create_if_block_5$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_2 = /*optCollisionKeys*/ ctx[19];
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
						Все типы (${/*optCollisionKeys*/ ctx[19].reduce(/*func_2*/ ctx[58], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			add_location(option, file$4, 354, 5, 12465);
  			attr_dev(select, "class", "svelte-hmsp51");
  			if (/*collision_type*/ ctx[7] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[59].call(select));
  			add_location(select, file$4, 353, 4, 12399);
  			attr_dev(div, "class", "pLine svelte-hmsp51");
  			add_location(div, file$4, 352, 3, 12375);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_option(select, /*collision_type*/ ctx[7]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler*/ ctx[59]),
  				listen_dev(select, "change", /*setFilter*/ ctx[28], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*optCollisionKeys, optData*/ 786432) {
  				each_value_2 = /*optCollisionKeys*/ ctx[19];
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

  			if (dirty[0] & /*collision_type*/ 128) {
  				select_option(select, /*collision_type*/ ctx[7]);
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
  		id: create_if_block_5$1.name,
  		type: "if",
  		source: "(352:3) {#if optData.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (358:5) {#each optCollisionKeys as key}
  function create_each_block_2(ctx) {
  	let option;
  	let t0_value = /*key*/ ctx[64] + "";
  	let t0;
  	let t1;
  	let t2_value = /*optData*/ ctx[18].collision_type[/*key*/ ctx[64]] + "";
  	let t2;
  	let t3;
  	let option_value_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text(t0_value);
  			t1 = text(" (");
  			t2 = text(t2_value);
  			t3 = text(")\n\t\t\t\t\t\t");
  			option.__value = option_value_value = /*key*/ ctx[64];
  			option.value = option.__value;
  			add_location(option, file$4, 358, 6, 12644);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
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
  		source: "(358:5) {#each optCollisionKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (369:2) {#if DtpSkpdi._map}
  function create_if_block_2$1(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div2;
  	let if_block = /*optDataSkpdi*/ ctx[20].collision_type && create_if_block_3$1(ctx);

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
  			attr_dev(hr, "class", "svelte-hmsp51");
  			add_location(hr, file$4, 369, 21, 12833);
  			attr_dev(div0, "class", "pLine svelte-hmsp51");
  			add_location(div0, file$4, 369, 2, 12814);
  			add_location(b, file$4, 370, 31, 12875);
  			attr_dev(div1, "class", "pLine svelte-hmsp51");
  			add_location(div1, file$4, 370, 2, 12846);
  			attr_dev(div2, "class", "filtersCont svelte-hmsp51");
  			add_location(div2, file$4, 371, 2, 12900);
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
  			if (/*optDataSkpdi*/ ctx[20].collision_type) if_block.p(ctx, dirty);
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
  		id: create_if_block_2$1.name,
  		type: "if",
  		source: "(369:2) {#if DtpSkpdi._map}",
  		ctx
  	});

  	return block;
  }

  // (373:3) {#if optDataSkpdi.collision_type}
  function create_if_block_3$1(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value_1 = /*optCollisionSkpdiKeys*/ ctx[21];
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
						Все типы (${/*optCollisionSkpdiKeys*/ ctx[21].reduce(/*func_3*/ ctx[60], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			add_location(option, file$4, 375, 5, 13067);
  			attr_dev(select, "class", "svelte-hmsp51");
  			if (/*collision_type_skpdi*/ ctx[8] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[61].call(select));
  			add_location(select, file$4, 374, 4, 12990);
  			attr_dev(div, "class", "pLine svelte-hmsp51");
  			add_location(div, file$4, 373, 3, 12966);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_option(select, /*collision_type_skpdi*/ ctx[8]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_1*/ ctx[61]),
  				listen_dev(select, "change", /*setFilterSkpdi*/ ctx[30], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*optCollisionSkpdiKeys, optDataSkpdi*/ 3145728) {
  				each_value_1 = /*optCollisionSkpdiKeys*/ ctx[21];
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

  			if (dirty[0] & /*collision_type_skpdi*/ 256) {
  				select_option(select, /*collision_type_skpdi*/ ctx[8]);
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
  		id: create_if_block_3$1.name,
  		type: "if",
  		source: "(373:3) {#if optDataSkpdi.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (379:5) {#each optCollisionSkpdiKeys as key}
  function create_each_block_1$2(ctx) {
  	let option;
  	let t0_value = /*key*/ ctx[64] + "";
  	let t0;
  	let t1;
  	let t2_value = /*optDataSkpdi*/ ctx[20].collision_type[/*key*/ ctx[64]] + "";
  	let t2;
  	let t3;
  	let option_value_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text(t0_value);
  			t1 = text(" (");
  			t2 = text(t2_value);
  			t3 = text(")\n\t\t\t\t\t\t");
  			option.__value = option_value_value = /*key*/ ctx[64];
  			option.value = option.__value;
  			add_location(option, file$4, 379, 6, 13261);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
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
  		source: "(379:5) {#each optCollisionSkpdiKeys as key}",
  		ctx
  	});

  	return block;
  }

  // (390:2) {#if DtpGibdd._map}
  function create_if_block$3(ctx) {
  	let div0;
  	let hr;
  	let t0;
  	let div1;
  	let t1;
  	let b;
  	let t3;
  	let div2;
  	let if_block = /*optDataGibdd*/ ctx[22].collision_type && create_if_block_1$2(ctx);

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
  			attr_dev(hr, "class", "svelte-hmsp51");
  			add_location(hr, file$4, 390, 21, 13455);
  			attr_dev(div0, "class", "pLine svelte-hmsp51");
  			add_location(div0, file$4, 390, 2, 13436);
  			add_location(b, file$4, 391, 31, 13497);
  			attr_dev(div1, "class", "pLine svelte-hmsp51");
  			add_location(div1, file$4, 391, 2, 13468);
  			attr_dev(div2, "class", "filtersCont svelte-hmsp51");
  			add_location(div2, file$4, 392, 2, 13522);
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
  			if (/*optDataGibdd*/ ctx[22].collision_type) if_block.p(ctx, dirty);
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
  		id: create_if_block$3.name,
  		type: "if",
  		source: "(390:2) {#if DtpGibdd._map}",
  		ctx
  	});

  	return block;
  }

  // (394:3) {#if optDataGibdd.collision_type}
  function create_if_block_1$2(ctx) {
  	let div;
  	let select;
  	let option;
  	let dispose;
  	let each_value = /*optCollisionGibddKeys*/ ctx[23];
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
						Все типы (${/*optCollisionGibddKeys*/ ctx[23].reduce(/*func_4*/ ctx[62], 0)})
					`;

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			option.__value = "";
  			option.value = option.__value;
  			add_location(option, file$4, 396, 5, 13689);
  			attr_dev(select, "class", "svelte-hmsp51");
  			if (/*collision_type_gibdd*/ ctx[9] === void 0) add_render_callback(() => /*select_change_handler_2*/ ctx[63].call(select));
  			add_location(select, file$4, 395, 4, 13612);
  			attr_dev(div, "class", "pLine svelte-hmsp51");
  			add_location(div, file$4, 394, 3, 13588);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, div, anchor);
  			append_dev(div, select);
  			append_dev(select, option);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(select, null);
  			}

  			select_option(select, /*collision_type_gibdd*/ ctx[9]);
  			if (remount) run_all(dispose);

  			dispose = [
  				listen_dev(select, "change", /*select_change_handler_2*/ ctx[63]),
  				listen_dev(select, "change", /*setFilterGibdd*/ ctx[29], false, false, false)
  			];
  		},
  		p: function update(ctx, dirty) {
  			if (dirty[0] & /*optCollisionGibddKeys, optDataGibdd*/ 12582912) {
  				each_value = /*optCollisionGibddKeys*/ ctx[23];
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

  			if (dirty[0] & /*collision_type_gibdd*/ 512) {
  				select_option(select, /*collision_type_gibdd*/ ctx[9]);
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
  		id: create_if_block_1$2.name,
  		type: "if",
  		source: "(394:3) {#if optDataGibdd.collision_type}",
  		ctx
  	});

  	return block;
  }

  // (400:5) {#each optCollisionGibddKeys as key}
  function create_each_block$4(ctx) {
  	let option;
  	let t0_value = /*key*/ ctx[64] + "";
  	let t0;
  	let t1;
  	let t2_value = /*optDataGibdd*/ ctx[22].collision_type[/*key*/ ctx[64]] + "";
  	let t2;
  	let t3;
  	let option_value_value;

  	const block = {
  		c: function create() {
  			option = element("option");
  			t0 = text(t0_value);
  			t1 = text(" (");
  			t2 = text(t2_value);
  			t3 = text(")\n\t\t\t\t\t\t");
  			option.__value = option_value_value = /*key*/ ctx[64];
  			option.value = option.__value;
  			add_location(option, file$4, 400, 6, 13883);
  		},
  		m: function mount(target, anchor) {
  			insert_dev(target, option, anchor);
  			append_dev(option, t0);
  			append_dev(option, t1);
  			append_dev(option, t2);
  			append_dev(option, t3);
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
  		source: "(400:5) {#each optCollisionGibddKeys as key}",
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
  	let if_block0 = /*DtpHearthsTmp*/ ctx[1]._map && /*DtpHearthsTmp*/ ctx[1]._opt && /*DtpHearthsTmp*/ ctx[1]._opt.years && create_if_block_9(ctx);
  	let if_block1 = /*DtpHearths*/ ctx[2]._map && /*DtpHearths*/ ctx[2]._opt && /*DtpHearths*/ ctx[2]._opt.years && create_if_block_8(ctx);

  	function select_block_type(ctx, dirty) {
  		if (/*DtpVerifyed*/ ctx[0]._map || /*DtpSkpdi*/ ctx[3]._map || /*DtpGibdd*/ ctx[4]._map) return create_if_block_6$1;
  		if (!/*DtpHearths*/ ctx[2]._map && !/*DtpHearthsTmp*/ ctx[1]._map) return create_if_block_7$1;
  	}

  	let current_block_type = select_block_type(ctx);
  	let if_block2 = current_block_type && current_block_type(ctx);
  	let if_block3 = /*DtpVerifyed*/ ctx[0]._map && create_if_block_4$1(ctx);
  	let if_block4 = /*DtpSkpdi*/ ctx[3]._map && create_if_block_2$1(ctx);
  	let if_block5 = /*DtpGibdd*/ ctx[4]._map && create_if_block$3(ctx);

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
  			attr_dev(div, "class", "mvsFilters");
  			add_location(div, file$4, 242, 3, 8030);
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
  		},
  		p: function update(ctx, dirty) {
  			if (/*DtpHearthsTmp*/ ctx[1]._map && /*DtpHearthsTmp*/ ctx[1]._opt && /*DtpHearthsTmp*/ ctx[1]._opt.years) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_9(ctx);
  					if_block0.c();
  					if_block0.m(div, t0);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*DtpHearths*/ ctx[2]._map && /*DtpHearths*/ ctx[2]._opt && /*DtpHearths*/ ctx[2]._opt.years) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_8(ctx);
  					if_block1.c();
  					if_block1.m(div, t1);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
  				if_block2.p(ctx, dirty);
  			} else {
  				if (if_block2) if_block2.d(1);
  				if_block2 = current_block_type && current_block_type(ctx);

  				if (if_block2) {
  					if_block2.c();
  					if_block2.m(div, t2);
  				}
  			}

  			if (/*DtpVerifyed*/ ctx[0]._map) {
  				if (if_block3) {
  					if_block3.p(ctx, dirty);
  				} else {
  					if_block3 = create_if_block_4$1(ctx);
  					if_block3.c();
  					if_block3.m(div, t3);
  				}
  			} else if (if_block3) {
  				if_block3.d(1);
  				if_block3 = null;
  			}

  			if (/*DtpSkpdi*/ ctx[3]._map) {
  				if (if_block4) {
  					if_block4.p(ctx, dirty);
  				} else {
  					if_block4 = create_if_block_2$1(ctx);
  					if_block4.c();
  					if_block4.m(div, t4);
  				}
  			} else if (if_block4) {
  				if_block4.d(1);
  				if_block4 = null;
  			}

  			if (/*DtpGibdd*/ ctx[4]._map) {
  				if (if_block5) {
  					if_block5.p(ctx, dirty);
  				} else {
  					if_block5 = create_if_block$3(ctx);
  					if_block5.c();
  					if_block5.m(div, null);
  				}
  			} else if (if_block5) {
  				if_block5.d(1);
  				if_block5 = null;
  			}
  		},
  		i: noop,
  		o: noop,
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(div);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();

  			if (if_block2) {
  				if_block2.d();
  			}

  			if (if_block3) if_block3.d();
  			if (if_block4) if_block4.d();
  			if (if_block5) if_block5.d();
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
  	let { DtpVerifyed } = $$props;
  	let { DtpHearthsTmp } = $$props;
  	let { DtpHearths } = $$props;
  	let { DtpSkpdi } = $$props;
  	let { DtpGibdd } = $$props;
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

  	let optDataSkpdi = DtpSkpdi._opt || {};

  	let optCollisionSkpdiKeys = optDataSkpdi.collision_type
  	? Object.keys(optDataSkpdi.collision_type).sort((a, b) => optDataSkpdi.collision_type[b] - optDataSkpdi.collision_type[a])
  	: [];

  	let optDataGibdd = DtpGibdd._opt || {};

  	let optCollisionGibddKeys = optDataGibdd.collision_type
  	? Object.keys(optDataGibdd.collision_type).sort((a, b) => optDataGibdd.collision_type[b] - optDataGibdd.collision_type[a])
  	: [];

  	let optDataHearths = DtpHearths._opt || {};

  	let optTypeHearthsKeys = optDataHearths.str_icon_type
  	? Object.keys(optDataHearths.str_icon_type).sort((a, b) => optDataHearths.str_icon_type[b] - optDataHearths.str_icon_type[a])
  	: [];

  	let optDataHearthsTmp = DtpHearthsTmp._opt || {};

  	let optTypeHearthsTmpKeys = optDataHearthsTmp.str_icon_type
  	? Object.keys(optDataHearthsTmp.str_icon_type).sort((a, b) => optDataHearthsTmp.str_icon_type[b] - optDataHearthsTmp.str_icon_type[a])
  	: [];

  	let collision_type;
  	let collision_type_skpdi;
  	let collision_type_gibdd;
  	let beg;
  	let end;
  	let hearths_year;
  	let hearths_quarter;
  	let hearths_stricken;
  	let str_icon_type;
  	let hearths_yearTmp;
  	let hearths_quarterTmp;
  	let hearths_strickenTmp;
  	let str_icon_typeTmp;

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

  	const setFilterHearthsTmp = ev => {
  		// console.log('setFilterYear', hearths_year, hearths_quarter, ev);
  		let arg = [];

  		if (hearths_yearTmp) {
  			arg.push({
  				type: "year",
  				zn: Number(hearths_yearTmp)
  			});
  		}

  		if (hearths_quarterTmp) {
  			arg.push({
  				type: "quarter",
  				zn: Number(hearths_quarterTmp)
  			});
  		}

  		if (hearths_strickenTmp) {
  			arg.push({
  				type: "stricken",
  				zn: Number(hearths_strickenTmp)
  			});
  		}

  		if (str_icon_typeTmp) {
  			arg.push({
  				type: "str_icon_type",
  				zn: str_icon_typeTmp
  			});
  		}

  		DtpHearthsTmp.setFilter(arg);
  	};

  	const setFilterHearths = ev => {
  		console.log("setFilterYear", hearths_year, hearths_quarter, ev);
  		let arg = [];

  		if (hearths_year) {
  			arg.push({ type: "year", zn: Number(hearths_year) });
  		}

  		if (hearths_quarter) {
  			arg.push({
  				type: "quarter",
  				zn: Number(hearths_quarter)
  			});
  		}

  		if (hearths_stricken) {
  			arg.push({
  				type: "stricken",
  				zn: Number(hearths_stricken)
  			});
  		}

  		if (str_icon_type) {
  			arg.push({ type: "str_icon_type", zn: str_icon_type });
  		}

  		DtpHearths.setFilter(arg);
  	};

  	const oncheckDtpHearths = ev => {
  		let target = ev.target;
  		currentFilterDtpHearths = Number(target.value);
  		let year = Number(target.getAttribute("_year"));

  		// console.log('oncheck', currentFilter, DtpVerifyed._opt);
  		// setFilter();
  		let arg = {
  			type: "quarter",
  			year: Number(target.getAttribute("_year")),
  			zn: currentFilterDtpHearths
  		};

  		DtpHearths.setFilter([
  			{
  				type: "quarter",
  				year: Number(target.getAttribute("_year")),
  				zn: currentFilterDtpHearths
  			}
  		]);
  	};

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

  	const writable_props = ["DtpVerifyed", "DtpHearthsTmp", "DtpHearths", "DtpSkpdi", "DtpGibdd"];

  	Object_1.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<DtpVerifyedFilters> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpVerifyedFilters", $$slots, []);

  	function select0_change_handler() {
  		hearths_yearTmp = select_value(this);
  		$$invalidate(14, hearths_yearTmp);
  		$$invalidate(1, DtpHearthsTmp);
  	}

  	function select1_change_handler() {
  		hearths_quarterTmp = select_value(this);
  		$$invalidate(15, hearths_quarterTmp);
  	}

  	const func = (p, c) => {
  		p += optDataHearthsTmp.str_icon_type[c];
  		return p;
  	};

  	function select2_change_handler() {
  		str_icon_typeTmp = select_value(this);
  		$$invalidate(17, str_icon_typeTmp);
  		$$invalidate(27, optTypeHearthsTmpKeys);
  	}

  	function select3_change_handler() {
  		hearths_strickenTmp = select_value(this);
  		$$invalidate(16, hearths_strickenTmp);
  	}

  	function select0_change_handler_1() {
  		hearths_year = select_value(this);
  		$$invalidate(10, hearths_year);
  		$$invalidate(2, DtpHearths);
  	}

  	function select1_change_handler_1() {
  		hearths_quarter = select_value(this);
  		$$invalidate(11, hearths_quarter);
  	}

  	const func_1 = (p, c) => {
  		p += optDataHearths.str_icon_type[c];
  		return p;
  	};

  	function select2_change_handler_1() {
  		str_icon_type = select_value(this);
  		$$invalidate(13, str_icon_type);
  		$$invalidate(25, optTypeHearthsKeys);
  	}

  	function select3_change_handler_1() {
  		hearths_stricken = select_value(this);
  		$$invalidate(12, hearths_stricken);
  	}

  	function input0_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(5, begDate = $$value);
  		});
  	}

  	function input1_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			$$invalidate(6, endDate = $$value);
  		});
  	}

  	const func_2 = (p, c) => {
  		p += optData.collision_type[c];
  		return p;
  	};

  	function select_change_handler() {
  		collision_type = select_value(this);
  		$$invalidate(7, collision_type);
  		$$invalidate(19, optCollisionKeys);
  	}

  	const func_3 = (p, c) => {
  		p += optDataSkpdi.collision_type[c];
  		return p;
  	};

  	function select_change_handler_1() {
  		collision_type_skpdi = select_value(this);
  		$$invalidate(8, collision_type_skpdi);
  		$$invalidate(21, optCollisionSkpdiKeys);
  	}

  	const func_4 = (p, c) => {
  		p += optDataGibdd.collision_type[c];
  		return p;
  	};

  	function select_change_handler_2() {
  		collision_type_gibdd = select_value(this);
  		$$invalidate(9, collision_type_gibdd);
  		$$invalidate(23, optCollisionGibddKeys);
  	}

  	$$self.$set = $$props => {
  		if ("DtpVerifyed" in $$props) $$invalidate(0, DtpVerifyed = $$props.DtpVerifyed);
  		if ("DtpHearthsTmp" in $$props) $$invalidate(1, DtpHearthsTmp = $$props.DtpHearthsTmp);
  		if ("DtpHearths" in $$props) $$invalidate(2, DtpHearths = $$props.DtpHearths);
  		if ("DtpSkpdi" in $$props) $$invalidate(3, DtpSkpdi = $$props.DtpSkpdi);
  		if ("DtpGibdd" in $$props) $$invalidate(4, DtpGibdd = $$props.DtpGibdd);
  	};

  	$$self.$capture_state = () => ({
  		onMount,
  		DtpVerifyed,
  		DtpHearthsTmp,
  		DtpHearths,
  		DtpSkpdi,
  		DtpGibdd,
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
  		optDataHearths,
  		optTypeHearthsKeys,
  		optDataHearthsTmp,
  		optTypeHearthsTmpKeys,
  		collision_type,
  		collision_type_skpdi,
  		collision_type_gibdd,
  		beg,
  		end,
  		hearths_year,
  		hearths_quarter,
  		hearths_stricken,
  		str_icon_type,
  		hearths_yearTmp,
  		hearths_quarterTmp,
  		hearths_strickenTmp,
  		str_icon_typeTmp,
  		setFilter,
  		setFilterGibdd,
  		setFilterSkpdi,
  		setFilterHearthsTmp,
  		setFilterHearths,
  		oncheckDtpHearths,
  		oncheck,
  		onPrev,
  		onNext
  	});

  	$$self.$inject_state = $$props => {
  		if ("DtpVerifyed" in $$props) $$invalidate(0, DtpVerifyed = $$props.DtpVerifyed);
  		if ("DtpHearthsTmp" in $$props) $$invalidate(1, DtpHearthsTmp = $$props.DtpHearthsTmp);
  		if ("DtpHearths" in $$props) $$invalidate(2, DtpHearths = $$props.DtpHearths);
  		if ("DtpSkpdi" in $$props) $$invalidate(3, DtpSkpdi = $$props.DtpSkpdi);
  		if ("DtpGibdd" in $$props) $$invalidate(4, DtpGibdd = $$props.DtpGibdd);
  		if ("currentFilter" in $$props) currentFilter = $$props.currentFilter;
  		if ("currentFilterDtpHearths" in $$props) currentFilterDtpHearths = $$props.currentFilterDtpHearths;
  		if ("begDate" in $$props) $$invalidate(5, begDate = $$props.begDate);
  		if ("endDate" in $$props) $$invalidate(6, endDate = $$props.endDate);
  		if ("dateInterval" in $$props) dateInterval = $$props.dateInterval;
  		if ("optData" in $$props) $$invalidate(18, optData = $$props.optData);
  		if ("optCollisionKeys" in $$props) $$invalidate(19, optCollisionKeys = $$props.optCollisionKeys);
  		if ("optDataSkpdi" in $$props) $$invalidate(20, optDataSkpdi = $$props.optDataSkpdi);
  		if ("optCollisionSkpdiKeys" in $$props) $$invalidate(21, optCollisionSkpdiKeys = $$props.optCollisionSkpdiKeys);
  		if ("optDataGibdd" in $$props) $$invalidate(22, optDataGibdd = $$props.optDataGibdd);
  		if ("optCollisionGibddKeys" in $$props) $$invalidate(23, optCollisionGibddKeys = $$props.optCollisionGibddKeys);
  		if ("optDataHearths" in $$props) $$invalidate(24, optDataHearths = $$props.optDataHearths);
  		if ("optTypeHearthsKeys" in $$props) $$invalidate(25, optTypeHearthsKeys = $$props.optTypeHearthsKeys);
  		if ("optDataHearthsTmp" in $$props) $$invalidate(26, optDataHearthsTmp = $$props.optDataHearthsTmp);
  		if ("optTypeHearthsTmpKeys" in $$props) $$invalidate(27, optTypeHearthsTmpKeys = $$props.optTypeHearthsTmpKeys);
  		if ("collision_type" in $$props) $$invalidate(7, collision_type = $$props.collision_type);
  		if ("collision_type_skpdi" in $$props) $$invalidate(8, collision_type_skpdi = $$props.collision_type_skpdi);
  		if ("collision_type_gibdd" in $$props) $$invalidate(9, collision_type_gibdd = $$props.collision_type_gibdd);
  		if ("beg" in $$props) beg = $$props.beg;
  		if ("end" in $$props) end = $$props.end;
  		if ("hearths_year" in $$props) $$invalidate(10, hearths_year = $$props.hearths_year);
  		if ("hearths_quarter" in $$props) $$invalidate(11, hearths_quarter = $$props.hearths_quarter);
  		if ("hearths_stricken" in $$props) $$invalidate(12, hearths_stricken = $$props.hearths_stricken);
  		if ("str_icon_type" in $$props) $$invalidate(13, str_icon_type = $$props.str_icon_type);
  		if ("hearths_yearTmp" in $$props) $$invalidate(14, hearths_yearTmp = $$props.hearths_yearTmp);
  		if ("hearths_quarterTmp" in $$props) $$invalidate(15, hearths_quarterTmp = $$props.hearths_quarterTmp);
  		if ("hearths_strickenTmp" in $$props) $$invalidate(16, hearths_strickenTmp = $$props.hearths_strickenTmp);
  		if ("str_icon_typeTmp" in $$props) $$invalidate(17, str_icon_typeTmp = $$props.str_icon_typeTmp);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [
  		DtpVerifyed,
  		DtpHearthsTmp,
  		DtpHearths,
  		DtpSkpdi,
  		DtpGibdd,
  		begDate,
  		endDate,
  		collision_type,
  		collision_type_skpdi,
  		collision_type_gibdd,
  		hearths_year,
  		hearths_quarter,
  		hearths_stricken,
  		str_icon_type,
  		hearths_yearTmp,
  		hearths_quarterTmp,
  		hearths_strickenTmp,
  		str_icon_typeTmp,
  		optData,
  		optCollisionKeys,
  		optDataSkpdi,
  		optCollisionSkpdiKeys,
  		optDataGibdd,
  		optCollisionGibddKeys,
  		optDataHearths,
  		optTypeHearthsKeys,
  		optDataHearthsTmp,
  		optTypeHearthsTmpKeys,
  		setFilter,
  		setFilterGibdd,
  		setFilterSkpdi,
  		setFilterHearthsTmp,
  		setFilterHearths,
  		oncheck,
  		onPrev,
  		onNext,
  		currentFilter,
  		currentFilterDtpHearths,
  		dateInterval,
  		beg,
  		end,
  		td,
  		tdd,
  		ed,
  		bd,
  		oncheckDtpHearths,
  		select0_change_handler,
  		select1_change_handler,
  		func,
  		select2_change_handler,
  		select3_change_handler,
  		select0_change_handler_1,
  		select1_change_handler_1,
  		func_1,
  		select2_change_handler_1,
  		select3_change_handler_1,
  		input0_binding,
  		input1_binding,
  		func_2,
  		select_change_handler,
  		func_3,
  		select_change_handler_1,
  		func_4,
  		select_change_handler_2
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
  				DtpVerifyed: 0,
  				DtpHearthsTmp: 1,
  				DtpHearths: 2,
  				DtpSkpdi: 3,
  				DtpGibdd: 4
  			},
  			[-1, -1, -1]
  		);

  		dispatch_dev("SvelteRegisterComponent", {
  			component: this,
  			tagName: "DtpVerifyedFilters",
  			options,
  			id: create_fragment$4.name
  		});

  		const { ctx } = this.$$;
  		const props = options.props || {};

  		if (/*DtpVerifyed*/ ctx[0] === undefined && !("DtpVerifyed" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpVerifyed'");
  		}

  		if (/*DtpHearthsTmp*/ ctx[1] === undefined && !("DtpHearthsTmp" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearthsTmp'");
  		}

  		if (/*DtpHearths*/ ctx[2] === undefined && !("DtpHearths" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpHearths'");
  		}

  		if (/*DtpSkpdi*/ ctx[3] === undefined && !("DtpSkpdi" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpSkpdi'");
  		}

  		if (/*DtpGibdd*/ ctx[4] === undefined && !("DtpGibdd" in props)) {
  			console_1$2.warn("<DtpVerifyedFilters> was created without expected prop 'DtpGibdd'");
  		}
  	}

  	get DtpVerifyed() {
  		throw new Error("<DtpVerifyedFilters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
  	}

  	set DtpVerifyed(value) {
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
  }

  /* src\DtpPopupHearths.svelte generated by Svelte v3.20.1 */

  const file$5 = "src\\DtpPopupHearths.svelte";

  function get_each_context$5(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[3] = list[i];
  	child_ctx[5] = i;
  	return child_ctx;
  }

  // (37:4) {#each prp.list_dtp as pt1, index}
  function create_each_block$5(ctx) {
  	let li;
  	let t0_value = new Date(1000 * /*pt1*/ ctx[3].date).toLocaleDateString() + "";
  	let t0;
  	let t1;
  	let t2_value = new Date(1000 * /*pt1*/ ctx[3].date).toLocaleTimeString() + "";
  	let t2;
  	let li_title_value;
  	let dispose;

  	function click_handler(...args) {
  		return /*click_handler*/ ctx[2](/*index*/ ctx[5], ...args);
  	}

  	const block = {
  		c: function create() {
  			li = element("li");
  			t0 = text(t0_value);
  			t1 = space();
  			t2 = text(t2_value);
  			attr_dev(li, "title", li_title_value = "id: " + /*pt1*/ ctx[3].id);
  			attr_dev(li, "class", "svelte-18o20z6");
  			add_location(li, file$5, 37, 5, 829);
  		},
  		m: function mount(target, anchor, remount) {
  			insert_dev(target, li, anchor);
  			append_dev(li, t0);
  			append_dev(li, t1);
  			append_dev(li, t2);
  			if (remount) dispose();
  			dispose = listen_dev(li, "click", click_handler, false, false, false);
  		},
  		p: function update(new_ctx, dirty) {
  			ctx = new_ctx;
  			if (dirty & /*prp*/ 1 && t0_value !== (t0_value = new Date(1000 * /*pt1*/ ctx[3].date).toLocaleDateString() + "")) set_data_dev(t0, t0_value);
  			if (dirty & /*prp*/ 1 && t2_value !== (t2_value = new Date(1000 * /*pt1*/ ctx[3].date).toLocaleTimeString() + "")) set_data_dev(t2, t2_value);

  			if (dirty & /*prp*/ 1 && li_title_value !== (li_title_value = "id: " + /*pt1*/ ctx[3].id)) {
  				attr_dev(li, "title", li_title_value);
  			}
  		},
  		d: function destroy(detaching) {
  			if (detaching) detach_dev(li);
  			dispose();
  		}
  	};

  	dispatch_dev("SvelteRegisterBlock", {
  		block,
  		id: create_each_block$5.name,
  		type: "each",
  		source: "(37:4) {#each prp.list_dtp as pt1, index}",
  		ctx
  	});

  	return block;
  }

  function create_fragment$5(ctx) {
  	let div3;
  	let div0;
  	let t0;
  	let t1_value = /*prp*/ ctx[0].id + "";
  	let t1;
  	let t2;
  	let t3;
  	let div1;
  	let t4_value = /*prp*/ ctx[0].quarter + "";
  	let t4;
  	let t5;
  	let t6_value = /*prp*/ ctx[0].year + "";
  	let t6;
  	let t7;
  	let t8;
  	let div2;
  	let table;
  	let tbody;
  	let tr0;
  	let td0;
  	let t10;
  	let td1;
  	let t11_value = (/*prp*/ ctx[0].str_icon_type || "") + "";
  	let t11;
  	let t12;
  	let tr1;
  	let td2;
  	let t14;
  	let td3;
  	let t15_value = /*prp*/ ctx[0].list_dtp.length + "";
  	let t15;
  	let t16;
  	let tr2;
  	let td4;
  	let t18;
  	let td5;
  	let t19_value = /*prp*/ ctx[0].count_lost + "";
  	let t19;
  	let t20;
  	let tr3;
  	let td6;
  	let t22;
  	let td7;
  	let t23_value = /*prp*/ ctx[0].count_stricken + "";
  	let t23;
  	let t24;
  	let tr4;
  	let td8;
  	let ul;
  	let each_value = /*prp*/ ctx[0].list_dtp;
  	validate_each_argument(each_value);
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
  	}

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
  			t5 = text(" кв. ");
  			t6 = text(t6_value);
  			t7 = text("г.");
  			t8 = space();
  			div2 = element("div");
  			table = element("table");
  			tbody = element("tbody");
  			tr0 = element("tr");
  			td0 = element("td");
  			td0.textContent = "Тип ДТП:";
  			t10 = space();
  			td1 = element("td");
  			t11 = text(t11_value);
  			t12 = space();
  			tr1 = element("tr");
  			td2 = element("td");
  			td2.textContent = "Всего ДТП:";
  			t14 = space();
  			td3 = element("td");
  			t15 = text(t15_value);
  			t16 = space();
  			tr2 = element("tr");
  			td4 = element("td");
  			td4.textContent = "Погибших:";
  			t18 = space();
  			td5 = element("td");
  			t19 = text(t19_value);
  			t20 = space();
  			tr3 = element("tr");
  			td6 = element("td");
  			td6.textContent = "Раненых:";
  			t22 = space();
  			td7 = element("td");
  			t23 = text(t23_value);
  			t24 = space();
  			tr4 = element("tr");
  			td8 = element("td");
  			ul = element("ul");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr_dev(div0, "class", "pLine");
  			add_location(div0, file$5, 12, 2, 201);
  			attr_dev(div1, "class", "pLine");
  			add_location(div1, file$5, 13, 2, 252);
  			attr_dev(td0, "class", "first svelte-18o20z6");
  			add_location(td0, file$5, 18, 5, 386);
  			add_location(td1, file$5, 19, 5, 423);
  			add_location(tr0, file$5, 17, 3, 376);
  			attr_dev(td2, "class", "first svelte-18o20z6");
  			add_location(td2, file$5, 22, 5, 480);
  			add_location(td3, file$5, 23, 5, 519);
  			add_location(tr1, file$5, 21, 3, 470);
  			attr_dev(td4, "class", "first svelte-18o20z6");
  			add_location(td4, file$5, 26, 5, 572);
  			add_location(td5, file$5, 27, 5, 610);
  			add_location(tr2, file$5, 25, 3, 562);
  			attr_dev(td6, "class", "first svelte-18o20z6");
  			add_location(td6, file$5, 30, 5, 658);
  			add_location(td7, file$5, 31, 5, 695);
  			add_location(tr3, file$5, 29, 3, 648);
  			add_location(ul, file$5, 35, 4, 780);
  			attr_dev(td8, "class", "first svelte-18o20z6");
  			attr_dev(td8, "colspan", "2");
  			add_location(td8, file$5, 34, 5, 747);
  			add_location(tr4, file$5, 33, 3, 737);
  			add_location(tbody, file$5, 16, 3, 365);
  			attr_dev(table, "class", "table svelte-18o20z6");
  			add_location(table, file$5, 15, 4, 340);
  			attr_dev(div2, "class", "featureCont");
  			add_location(div2, file$5, 14, 2, 310);
  			attr_dev(div3, "class", "mvsPopup svelte-18o20z6");
  			add_location(div3, file$5, 11, 1, 176);
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
  			append_dev(tbody, tr0);
  			append_dev(tr0, td0);
  			append_dev(tr0, t10);
  			append_dev(tr0, td1);
  			append_dev(td1, t11);
  			append_dev(tbody, t12);
  			append_dev(tbody, tr1);
  			append_dev(tr1, td2);
  			append_dev(tr1, t14);
  			append_dev(tr1, td3);
  			append_dev(td3, t15);
  			append_dev(tbody, t16);
  			append_dev(tbody, tr2);
  			append_dev(tr2, td4);
  			append_dev(tr2, t18);
  			append_dev(tr2, td5);
  			append_dev(td5, t19);
  			append_dev(tbody, t20);
  			append_dev(tbody, tr3);
  			append_dev(tr3, td6);
  			append_dev(tr3, t22);
  			append_dev(tr3, td7);
  			append_dev(td7, t23);
  			append_dev(tbody, t24);
  			append_dev(tbody, tr4);
  			append_dev(tr4, td8);
  			append_dev(td8, ul);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul, null);
  			}
  		},
  		p: function update(ctx, [dirty]) {
  			if (dirty & /*prp*/ 1 && t1_value !== (t1_value = /*prp*/ ctx[0].id + "")) set_data_dev(t1, t1_value);
  			if (dirty & /*prp*/ 1 && t4_value !== (t4_value = /*prp*/ ctx[0].quarter + "")) set_data_dev(t4, t4_value);
  			if (dirty & /*prp*/ 1 && t6_value !== (t6_value = /*prp*/ ctx[0].year + "")) set_data_dev(t6, t6_value);
  			if (dirty & /*prp*/ 1 && t11_value !== (t11_value = (/*prp*/ ctx[0].str_icon_type || "") + "")) set_data_dev(t11, t11_value);
  			if (dirty & /*prp*/ 1 && t15_value !== (t15_value = /*prp*/ ctx[0].list_dtp.length + "")) set_data_dev(t15, t15_value);
  			if (dirty & /*prp*/ 1 && t19_value !== (t19_value = /*prp*/ ctx[0].count_lost + "")) set_data_dev(t19, t19_value);
  			if (dirty & /*prp*/ 1 && t23_value !== (t23_value = /*prp*/ ctx[0].count_stricken + "")) set_data_dev(t23, t23_value);

  			if (dirty & /*prp, moveTo, Date*/ 3) {
  				each_value = /*prp*/ ctx[0].list_dtp;
  				validate_each_argument(each_value);
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$5(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$5(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ul, null);
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

  	const moveTo = nm => {
  		let obj = prp._bounds.options.items[nm];

  		if (obj && obj._map) {
  			obj._map.panTo(obj._latlng);
  		}
  	};

  	const writable_props = ["prp"];

  	Object.keys($$props).forEach(key => {
  		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DtpPopupHearths> was created with unknown prop '${key}'`);
  	});

  	let { $$slots = {}, $$scope } = $$props;
  	validate_slots("DtpPopupHearths", $$slots, []);

  	const click_handler = index => {
  		moveTo(index);
  	};

  	$$self.$set = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	$$self.$capture_state = () => ({ prp, moveTo });

  	$$self.$inject_state = $$props => {
  		if ("prp" in $$props) $$invalidate(0, prp = $$props.prp);
  	};

  	if ($$props && "$$inject" in $$props) {
  		$$self.$inject_state($$props.$$inject);
  	}

  	return [prp, moveTo, click_handler];
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
  			console.warn("<DtpPopupHearths> was created without expected prop 'prp'");
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
  					if (ft.zn === prp.quarter) {
  						cnt++;
  					}
  				} else if (ft.type === 'str_icon_type') {
  					if (ft.zn === prp.str_icon_type) {
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
  				} else if (ft.type === 'year') {
  					if (ft.zn === prp.year) {
  						cnt++;
  					}
  				// } else if (ft.type === 'date') {
  					// if (prp.date >= ft.zn[0] && prp.date < ft.zn[1]) {
  						// cnt++;
  					// }
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
  	let opt = {str_icon_type: {}, years: {}, dtps: {}},
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
  					if (ft.zn === prp.quarter) {
  						cnt++;
  					}
  				} else if (ft.type === 'str_icon_type') {
  					if (ft.zn === prp.str_icon_type) {
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
  				} else if (ft.type === 'year') {
  					if (ft.zn === prp.year) {
  						cnt++;
  					}
  				// } else if (ft.type === 'date') {
  					// if (prp.date >= ft.zn[0] && prp.date < ft.zn[1]) {
  						// cnt++;
  					// }
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
  	let opt = {str_icon_type: {}, years: {}, dtps: {}},
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
  			});
  console.log('__allJson_____', allJson, DtpHearthsTmp._opt);
  		});
  });

  // import 'leaflet-sidebar-v2';

  const L$a = window.L;
  const map = L$a.map(document.body, {
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
  		corners[key] = L$a.DomUtil.create('div', classNames[key], parent);
  	}
  }

  map.addControl(L$a.control.gmxCenter())
  	.addControl(L$a.control.fitCenter());
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
  var Mercator = L$a.TileLayer.extend({
  	options: {
  		tilesCRS: L$a.CRS.EPSG3395
  	},
  	_getTiledPixelBounds: function (center) {
  		var pixelBounds = L$a.TileLayer.prototype._getTiledPixelBounds.call(this, center);
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

  			tile.src = L$a.Util.template(pItem.errorTileUrlPrefix + pItem.postfix, {
  				z: searchParams.get('z'),
  				x: searchParams.get('x'),
  				y: searchParams.get('y')
  			});
  		}
  		done(e, tile);
  	},
  	_getTilePos: function (coords) {
  		var tilePos = L$a.TileLayer.prototype._getTilePos.call(this, coords);
  		return tilePos.subtract([0, this._shiftY]);
  	},

  	_getShiftY: function(zoom) {
  		var map = this._map,
  			pos = map.getCenter(),
  			shift = (map.options.crs.project(pos).y - this.options.tilesCRS.project(pos).y);

  		return Math.floor(L$a.CRS.scale(zoom) * shift / 40075016.685578496);
  	}
  });
  L$a.TileLayer.Mercator = Mercator;
  L$a.tileLayer.Mercator = function (url, options) {
  	return new Mercator(url, options);
  };

  let baseLayers = {};
  if (!hrefParams.b) { hrefParams.b = 'm2'; }
  ['m2', 'm3'].forEach(key => {
  	let it = proxy[key],
  		lit = L$a.tileLayer.Mercator(it.prefix + it.postfix, it.options);
  	baseLayers[it.title] = lit;
  	if (hrefParams.b === it.options.key) { lit.addTo(map); }
  });
  baseLayers.OpenStreetMap = L$a.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  	maxZoom: 21,
  	maxNativeZoom: 18
  });

  let overlays = {
  	// Marker: L.marker([55.758031, 37.611694])
  		// .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
  		// .openPopup(),
  	'ДТП Очаги(tmp)': DtpHearthsTmp,
  	'ДТП Очаги': DtpHearths,
  	'ДТП Сводный': DtpVerifyed,
  	'ДТП СКПДИ': DtpSkpdi,
  	'ДТП ГИБДД': DtpGibdd,
  	// polygon: L.polygon([[55.05, 37],[55.03, 41],[52.05, 41],[52.04, 37]], {color: 'red'})
  };
  let ovHash = hrefParams.o ? hrefParams.o.split(',').reduce((p, c) => {p[c] = true; return p;}, {}) : {};
  ['m1', 'm4', 'm5'].forEach(key => {
  	let it = proxy[key],
  		lit = L$a.tileLayer.Mercator(it.prefix + it.postfix, it.options);
  	overlays[it.title] = lit;
  	if (ovHash[it.options.key]) { lit.addTo(map); }
  });
  L$a.control.layers(baseLayers, overlays).addTo(map);

  let filtersControl = L$a.control.gmxIcon({
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
  		
  	if (!cont1) {
  		cont1 = target._win = L$a.DomUtil.create('div', 'win leaflet-control-layers hidden', cont);
  		// cont1.innerHTML = 'Слой "ДТП Сводный"';
  		L$a.DomEvent.disableScrollPropagation(cont1);
  		cont1._Filters = new DtpVerifyedFilters({
  			target: cont1,
  			props: {
  				DtpGibdd: DtpGibdd,
  				DtpSkpdi: DtpSkpdi,
  				DtpHearthsTmp: DtpHearthsTmp,
  				DtpHearths: DtpHearths,
  				DtpVerifyed: DtpVerifyed
  			}
  		});
  	}

  	if (isActive) {
  		// MapUtils.GroupItems(map._selectedItems);
  		target._win.classList.remove('hidden');
  	} else {
  		target._win.classList.add('hidden');
  		target._win = null;
  	}

  }).addTo(map);

  return map;

}());
//# sourceMappingURL=main.js.map
