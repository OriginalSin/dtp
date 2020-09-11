import {Bbox, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupVerifyed.svelte';
import DtpPopupRub from './DtpPopupRub.svelte';

const L = window.L;

const popup = L.popup();
const popup1 = L.popup({minWidth: 200});
let argFilters;
let collision_type;
let prefix = 'https://dtp.mvs.group/scripts/rubez_dev/';

const setPopup = function (props) {
	let cont = L.DomUtil.create('div'),
		id = props.line_sid;
	
	fetch(prefix + 'rubez-complex-' + id + '.txt', {}).then(req => req.json())
		.then(json => {
			// console.log('json', json);
			new DtpPopupRub({
				target: cont,
				props: {
					prp: json[0]
				}
			});
			popup.setContent(cont);
		});

	popup.setContent(cont);
	return cont;
}

// let renderer = L.canvas();
export const Rub = L.featureGroup([]);
Rub.setFilter = arg => {
// console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
	if (!Rub._map) { return; }
	Rub.clearLayers();
	// DtpHearths._heatData = [];
	argFilters = arg;
	Rub._argFilters = argFilters;

	let arr = [];
	if (Rub._group) {
		Rub._group.getLayers().forEach(it => {
			let prp = it.options.props,
				cnt = 0;
			argFilters.forEach(ft => {
				if (ft.type === 'comp') {
					if (prp.rub_flag) {
						if (ft.zn.on) { cnt++; }
					} else {
						if (ft.zn.off) { cnt++; }
					}
				}
			});
			if (cnt === argFilters.length) {
				arr.push(it);
				// arr = arr.concat(it.options.items);
				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
			}
		});
		Rub.addLayer(L.layerGroup(arr));
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
			let iconType = 1,
				list_bounds = L.latLngBounds(),
				// latlngs = [],
				stroke = false,
				fillColor = 'gray';

			if (prp.rub_flag) {
				fillColor = '#00FF00';
			}
			if (line_sid[prp.line_sid]) {
				console.log('___Дубль____', prp);
			} else {
				line_sid[prp.line_sid] = prp
			}
			if (!prp.lat || !prp.lon) {
				opt.bad.push(prp);
				// console.log('_______', prp);
				return;
				// prp.lat = prp.lon = 0;
			}

			let coords = prp.coords || {lat: prp.lat, lon: prp.lon},
				latlng = L.latLng(coords.lat, coords.lon),
				cur = [];

			list_bounds.extend(latlng);

			arr.push(new CirclePoint(L.latLng(coords.lat, coords.lon), {
					// cluster: it,
					props: prp,
					radius: 6,
					zIndexOffset: 50000,
					path: 'camera',
					stroke: stroke,
					fillColor: fillColor,
					// renderer: renderer
				}).bindPopup(popup)
				.on('popupopen', (ev) => {

					setPopup(ev.target.options.props);
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

	fetch(prefix + 'rubez.txt', {}).then(req => req.json())
		.then(json => {
			json.forEach(parseItem);
			Rub._group = L.layerGroup(arr);
			Rub.addLayer(Rub._group);
			console.log('opt', opt);

		});
});

