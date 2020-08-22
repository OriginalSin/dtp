// import {MarkerPoint, CirclePoint} from './CirclePoint';
// import DtpPopup from './DtpPopupGibdd.svelte';
// import {getLatLngsLength} from './MapUtils';

const L = window.L;

// const popup = L.popup();
let map;
// let argFilters;

let renderer = L.canvas();
export const Settlements = L.featureGroup([]);

Settlements.on('remove', (ev) => {
	Settlements.clearLayers();
}).on('add', ev => {
	// console.log('/static/data/dtpskpdi.geojson', ev);
	// argFilters = [];
	map = Settlements._map;

	fetch('https://dtp.mvs.group/scripts/settlements_dev/0000.txt', {
	})
	.then(req => req.json())
	.then(json => {
		let geojson = L.geoJson(json, {
			renderer: renderer,
			style: (feature) => {
				// console.log('onEachFeature', it);
				return {weight: 1};
			}
		})
		.bindPopup(function (layer) {
			return layer.feature.properties.name;
		});
		Settlements.clearLayers();
		Settlements.addLayer(geojson);
	});
});

