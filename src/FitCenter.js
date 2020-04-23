const L = window.L;


L.Control.FitCenter = L.Control.extend({
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
            container = L.DomUtil.create('div', className),
            // span = L.DomUtil.create('div', '', container),
            input = L.DomUtil.create('input', '', container),
            button = L.DomUtil.create('button', '', container),
            results = L.DomUtil.create('div', 'results', container);

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
		L.DomEvent.on(input, 'input', this._getSuggestions, this);
		L.DomEvent.on(input, 'contextmenu', L.DomEvent.stopPropagation, this);
		// L.DomEvent.on(container, 'mousemove', L.DomEvent.stopPropagation);
		L.DomEvent.on(container, 'mousemove', L.DomEvent.stop);
		L.DomEvent.on(container, 'mouseover', ev => {
			if (this._results.style.display !== 'block') {
				// L.DomEvent.stop(ev);
				// console.log('mouseover input', ev);
				this._results.style.display = 'block';
			}
		}, this);
		L.DomEvent.on(button, 'click', function () {
			let arr = input.value.match(/[+-]?([0-9]*[.])?[0-9]+/g);
			if (arr && arr.length > 1) { map.setView([Number(arr[0]), Number(arr[1])]); }
		});
		L.DomEvent.disableClickPropagation(container);


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
					node = L.DomUtil.create('div', '', frag);
			    node.innerHTML = str;
				L.DomEvent.on(node, 'click', ev => {
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

L.control.fitCenter = function (options) {
  return new L.Control.FitCenter(options);
};
