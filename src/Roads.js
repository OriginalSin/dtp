// import {MarkerPoint, CirclePoint} from './CirclePoint';
// import DtpPopup from './DtpPopupGibdd.svelte';
import {getLatLngsLength} from './MapUtils';

const L = window.L;

// const popup = L.popup();
let map;
// let argFilters;

let renderer = L.canvas();
export const Roads = L.featureGroup([]);

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
		let geojson = L.geoJson(json, {
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
				let d = L.LineUtil._sqClosestPointOnSegment(ep, _rings[i], _rings[i+1], true);
				if (d < min) {
					min = d;
					index = i;
				}
			}
			let arr = it._latlngs.slice(0, index);
			arr.push(latlng);
			
			polyline = L.polyline(arr, {color: 'red', weight: 6, interactive: false}).bindTooltip('').addTo(map);
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

