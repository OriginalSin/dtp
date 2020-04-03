
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var dtp = (function () {
	'use strict';

	//import App from './App.svelte';

	const L = window.L;
	const map = L.map(document.body, {
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
		renderer: L.canvas()
	});
	var baseLayers = {
		OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map)
	};
	var overlays = {
		Marker: L.marker([55.758031, 37.611694])
			.bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
			.openPopup(),
		polygon: L.polygon([[55.05, 37],[55.03, 41],[52.05, 41],[52.04, 37]], {color: 'red'})
	};

	L.control.layers(baseLayers, overlays).addTo(map);

	return map;

}());
//# sourceMappingURL=main.js.map
