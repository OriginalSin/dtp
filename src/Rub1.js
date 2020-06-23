import {Bbox, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupVerifyed.svelte';
import DtpPopupRub1 from './DtpPopupRub1.svelte';

const L = window.L;

const popup = L.popup();
const popup1 = L.popup({minWidth: 200});
let argFilters;
let collision_type;

const setPopup = function (props) {
	let cont = L.DomUtil.create('div');
	new DtpPopupRub1({
		target: cont,
		props: {
			// popup: popup,
			prp: props
		}
	});
	popup.setContent(cont);
	return cont;
}

// let renderer = L.canvas();
export const Rub1 = L.featureGroup([]);
Rub1.setFilter = arg => {
// console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
	if (!Rub1._map) { return; }
	Rub1.clearLayers();
	// DtpHearths._heatData = [];
	argFilters = arg;

	let arr = [];
	if (Rub1._group) {
		Rub1._group.getLayers().forEach(it => {
			let prp = it.options.cluster,
				cnt = 0;
			argFilters.forEach(ft => {
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
					} else if (zn === 3 && prp.count_stricken && prp.count_lost) {
						cnt++;								// С пострадавшими и погибшими
					}
				}
			});
			if (cnt === argFilters.length) {
				arr.push(it);
				// arr = arr.concat(it.options.items);
				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
			}
		});
		Rub1.addLayer(L.layerGroup(arr));
		// DtpHearths._heat.setData({
			// max: 8,
			// data: DtpHearths._heatData
		// });
	}
};

Rub1.on('remove', () => {
	Rub1.clearLayers();
}).on('add', ev => {
	let opt = {road: {}, str_icon_type: {}, iconType: {}, years: {}, dtps: {}},
		arr = [],
		max_quarter = 0,
		prefix = 'https://dtp.mvs.group/scripts/hearths_picket/',
		parseItem = (prp) => {
			let iconType = 1,
				list_bounds = L.latLngBounds(),
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
				latlng = L.latLng(coords.lat, coords.lon),
				cur = [];

			list_bounds.extend(latlng);

			return new CirclePoint(L.latLng(coords.lat, coords.lon), {
					// cluster: it,
					props: prp,
					radius: 6,
					zIndexOffset: 50000,
					// rhomb: true,
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
				});
		};

	fetch('./static/rub.geojson', {}).then(req => req.json())
		.then(json => {
			let arr = json.map(parseItem);
			Rub1._group = L.layerGroup(arr);
			Rub1.addLayer(Rub1._group);
// console.log('json', json);

		});
});

