const chkStricken = (it, opt) => {
	let lost = it.count_lost,
		stricken = it.count_stricken;
	if (!stricken && lost) {			// Только с погибшими
		opt.stricken[1] = 1 + (opt.stricken[1] || 0);
	}
	if (stricken && !lost) {			// Только с пострадавшими
		opt.stricken[2] = 1 + (opt.stricken[2] || 0);
	}

	if (stricken || lost) {				// С пострадавшими или погибшими
		opt.stricken[3] = 1 + (opt.stricken[3] || 0);
	}
	if (stricken && lost) {				// С пострадавшими и погибшими
		opt.stricken[4] = 1 + (opt.stricken[4] || 0);
	}
}

const distVincenty = (latlng1, latlng2) => {
	var rd = Math.PI / 180.0,
		p1 = { lon: rd * latlng1.lng, lat: rd * latlng1.lat },
		p2 = { lon: rd * latlng2.lng, lat: rd * latlng2.lat },
		a = 6378137,
		b = 6356752.3142,
		f = 1 / 298.257223563;  // WGS-84 ellipsiod

	var L1 = p2.lon - p1.lon,
		U1 = Math.atan((1 - f) * Math.tan(p1.lat)),
		U2 = Math.atan((1 - f) * Math.tan(p2.lat)),
		sinU1 = Math.sin(U1), cosU1 = Math.cos(U1),
		sinU2 = Math.sin(U2), cosU2 = Math.cos(U2),
		lambda = L1,
		lambdaP = 2 * Math.PI,
		iterLimit = 20;
	while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0) {
			var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda),
				sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) +
				(cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
			if (sinSigma === 0) { return 0; }
			var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda,
				sigma = Math.atan2(sinSigma, cosSigma),
				sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma,
				cosSqAlpha = 1 - sinAlpha * sinAlpha,
				cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
			if (isNaN(cos2SigmaM)) { cos2SigmaM = 0; }
			var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
			lambdaP = lambda;
			lambda = L1 + (1 - C) * f * sinAlpha *
				(sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
	}
	if (iterLimit === 0) { return NaN; }

	var uSq = cosSqAlpha * ((a * a) / (b * b) - 1),
		A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
		B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
		deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
			B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM))),
		s = b * A * (sigma - deltaSigma);

	//s = s.toFixed(3);
	return s;
};

const getLatLngsLength = (latlngs) => {
	latlngs = latlngs || [];
	let	dist = 0,
		latlng = latlngs[0];
	latlngs.forEach( it => {
		dist += distVincenty(it, latlng);
		latlng = it;
	});
	return dist;
};

export {chkStricken, getLatLngsLength};
