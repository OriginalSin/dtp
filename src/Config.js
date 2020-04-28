const yandex = '&copy; <a href="https://n.maps.yandex.ru/?oid=1900133#!/?z=18&ll=36.860478%2C55.429679&l=nk%23map">Yandex</a> contributors',
	prefix = '//inv.mvs.group/mapcache/',
	cd = new Date(),
	m = cd.getMonth() + 1,
	d = cd.getDate(),
	dstr = cd.getFullYear() + '.' + (m < 10 ? '0' : '') + m + '.' + (d < 10 ? '0' : '') + d,
	dtpTemplate = 'https://dtp-stat.ru/moskovskaia-oblast/?participantType=7_8_9&zoom=16&lng={lng}&lat={lat}&fromDate=2019.01.01&toDate=' + dstr,
	panoramaTemplate = 'https://yandex.ru/maps/213/moscow/?l=stv%2Csta&ll={lng}%2C{lat}&z={z}',
	panoramaMode = '&mode=whatshere&panorama%5Bdirection%5D=105.985618%2C0.000000&panorama%5Bfull%5D=true&panorama&whatshere%5Bpoint%5D={lng}%2C{lat}&whatshere%5Bzoom%5D=18';

const proxy = {
	m1: {
		title: 'Дороги',
		prefix: prefix + 'm1/',
		postfix: '?x={x}&y={y}&z={z}&l=mpskl&sl=104,301135,301750,302526,5300026,5400046,70300482,70300490,70300627',
		errorTileUrlPrefix: '//04.core-nmaps-renderer-nmaps.maps.yandex.net/',
		options: {
			key: 'm1',
			minZoom: 8,
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
		//postfix: '?x={x}&y={y}&z={z}&l=mpskl&sl=104,301135,301750,302526,302827,5300026,5400046,70300236,70300638',
		postfix: '?x={x}&y={y}&z={z}&l=mpskl&sl=302827',
		errorTileUrlPrefix: '//01.core-nmaps-renderer-nmaps.maps.yandex.net/',
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
		errorTileUrlPrefix: '//01.core-nmaps-renderer-nmaps.maps.yandex.net/',
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

export {proxy, hrefParams, dtpTemplate, panoramaTemplate, panoramaMode};
