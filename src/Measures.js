import {CirclePoint} from './CirclePoint';
import MeasuresPopup from './MeasuresPopup.svelte';

const L = window.L;

const popup = L.popup();
//const popup1 = L.popup({minWidth: 200});
let argFilters;
let collision_type;
let prefix = 'https://dtp.mvs.group/scripts/events_dev/get_event.txt';

const setPopup = function (props) {
	let cont = L.DomUtil.create('div'),
		id = props.id;
	new MeasuresPopup({
		target: cont,
		props: {
			prp: props
		}
	});
	popup.setContent(cont);
/*
	fetch(prefix + 'rubez-complex-' + id + '.txt', {}).then(req => req.json())
		.then(json => {
			// console.log('json', json);
			new MeasuresPopup({
				target: cont,
				props: {
					prp: json[0]
				}
			});
			popup.setContent(cont);
		});

	popup.setContent(cont);

*/
	return cont;
}

// let renderer = L.canvas();
export const Measures = L.featureGroup([]);
Measures.setFilter = arg => {
// console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
	if (!Measures._map) { return; }
	Measures.clearLayers();
	// DtpHearths._heatData = [];
	argFilters = arg;
	Measures._argFilters = argFilters;

	let arr = [];
	if (Measures._group) {
		Measures._group.getLayers().forEach(it => {
			let prp = it.options.props,
				cnt = 0;
			argFilters.forEach(ft => {
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
			if (cnt === argFilters.length) {
				arr.push(it);
				// arr = arr.concat(it.options.items);
				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
			}
		});
		Measures.addLayer(L.layerGroup(arr));
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
			let iconType = 1,
				list_bounds = L.latLngBounds(),
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
				latlng = L.latLng(coords.lat, coords.lon),
				cur = [];

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
					radius: 10,
					zIndexOffset: 50000,
					path: 'measures',
					stroke: stroke,
					fillColor: fillColor,
					// renderer: renderer
				}).bindPopup(popup)
				.on('popupopen', (ev) => {

					setPopup(ev.target.options.props);
					// console.log('popupopen', ev);
				}).on('popupclose', (ev) => {
					if (ev.popup._svObj) {
						ev.popup._svObj.$destroy();
						delete ev.popup._svObj;
					}
				})
			);
		};

	fetch(prefix, {}).then(req => req.json())
		.then(json => {
			json.forEach(parseItem);
			Measures._opt = opt;
			Measures._group = L.layerGroup(arr);
			Measures.addLayer(Measures._group);
			console.log('opt', opt);

		});
});

