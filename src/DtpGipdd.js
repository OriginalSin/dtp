import {MarkerPoint, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopup.svelte';

const L = window.L;

const popup = L.popup();
const setPopup = function (id) {
	let url = 'https://dtp.mvs.group/scripts/index.php?request=get_dtp_id&id=' + id + '&type=gibdd';
	fetch(url, {})
	// fetch('/static/data/dtpexample.json', {})
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
	// return layer.feature.properties.id || '';
}

// let renderer = L.canvas();
export const DtpGipdd = L.featureGroup([]);

DtpGipdd.on('remove', () => {
	DtpGipdd.clearLayers();
}).on('add', ev => {
	console.log('/static/data/dtpskpdi.geojson', ev);
	
	fetch('https://dtp.mvs.group/scripts/index.php?request=get_stat_gipdd', {})
	// fetch('https://dtp.mvs.group/static/data/json_stat.json', {})
		.then(req => req.json())
		.then(json => {
			let arr = json.map(prp => {
				let iconType = prp.iconType || 0,
					stroke = false,
					fillColor = '#FFCC66'; //  - автомобили
				if (iconType) {
					stroke = iconType % 2 === 0 ? true : false; //  - смертельные ДТП
					if (iconType === 3 || iconType === 4) {
						fillColor = '#99CCFF'; //  - пешеходы
					} else if (iconType === 5 || iconType === 6) {
						fillColor = '#99CC99'; //  - велосипеды
					}
				}
if (!prp.lat || !prp.lon) {
console.log('_______', prp);
	prp.lat = prp.lon = 0;
}
				return new CirclePoint(L.latLng(prp.lat, prp.lon), {
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
			
			DtpGipdd.addLayer(L.layerGroup(arr));
		});
});

