<script>
	import DtpPopup from './DtpPopupVerifyed.svelte';
	export let prp;
	let current;

    const moveTo = (nm) => {
		let obj = prp._bounds.options.items[nm];
		if (obj && obj._map) {
			obj._map.panTo(obj._latlng);
		}
	};

    const showDtpInfo = (ev) => {
console.log('showDtpInfo ', ev);
	};

</script>
	<div class="mvsPopup">
		<div class="pLine">Очаг ДТП (id: {prp.id})</div>
		<div class="pLine">{prp.quarter ? prp.quarter + ' кв.': ''} {prp.year}г.</div>
		<div class="featureCont">
		  <table class="table">
			<tbody>
			<tr>
			  <td class="first">Тип ДТП:</td>
			  <td>{prp.str_icon_type || ''}</td>
			</tr>
			<tr>
			  <td class="first">Всего ДТП:</td>
			  <td>{prp.list_dtp.length}</td>
			</tr>
			<tr>
			  <td class="first">Погибших:</td>
			  <td>{prp.count_lost}</td>
			</tr>
			<tr>
			  <td class="first">Раненых:</td>
			  <td>{prp.count_stricken}</td>
			</tr>
				{#each prp.list_dtp as pt1, index}
			<tr>
			  <td class="first" colspan=2>
				<ul>
					<li on:click={() => {moveTo(index);}} title={'id: ' + pt1.id}>{new Date(1000 * pt1.date).toLocaleDateString()} погибших {pt1.lost}, раненых {pt1.stricken}</li>
				</ul>
			  </td>
			</tr>
			<tr>
			  <td class="first">Адрес:</td>
			  <td>{pt1.address}<br /><span class="link" on:click={() => {current = index;}}>подробнее</span>
				{#if current === index}
				<div class="win leaflet-popup-content-wrapper ">
					<DtpPopup prp={pt1} closeMe={() => {current = null;}} />
				</div>
				{/if}

			  </td>
			</tr>
				{/each}
		   </tbody>
		  </table>
		</div>
	</div>

<style>
.win {
    position: absolute;
    min-width: 280px;
    left: 360px;
    top: 76px;
}
span.link {
    cursor: pointer;
    color: blue;
    display: block;
    margin-top: 6px;
}
.mvsPopup {
    min-width: 260px;
}
.mvsPopup li {
    cursor: pointer;
}
.mvsPopup .table {
    width: 100%;
}
.mvsPopup .featureCont .first {
    max-width: 100px;
}
.primary {
    color: #fff;
    background-color: #1890ff;
    border-color: #1890ff;
    text-shadow: 0 -1px 0 rgba(0,0,0,.12);
    -webkit-box-shadow: 0 2px 0 rgba(0,0,0,.045);
    box-shadow: 0 2px 0 rgba(0,0,0,.045);
}
button:disabled,
button[disabled] {
    cursor: default;
    opacity: 0.5;
}
button:hover {
    color: blue;
}
button.current {
    text-decoration-line: underline;
}
button {
    line-height: 1.499;
    position: relative;
    display: inline-block;
    font-weight: 400;
    white-space: nowrap;
    text-align: center;
    background-image: none;
    -webkit-box-shadow: 0 2px 0 rgba(0,0,0,.015);
    box-shadow: 0 2px 0 rgba(0,0,0,.015);
    cursor: pointer;
    -webkit-transition: all .3s cubic-bezier(.645,.045,.355,1);
    transition: all .3s cubic-bezier(.645,.045,.355,1);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    height: 32px;
    padding: 0 15px;
    font-size: 14px;
    border-radius: 4px;
    color: rgba(0,0,0,.65);
    background-color: #fff;
    border: 1px solid #d9d9d9;
}

</style>