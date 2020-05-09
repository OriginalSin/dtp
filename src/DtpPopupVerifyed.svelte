<script>
	// import { afterUpdate } from 'svelte';
	import DtpPopupGibdd from './DtpPopupGibdd.svelte';
	import DtpPopupSkpdi from './DtpPopupSkpdi.svelte';

	// export let showModal = false;

	export let prp;
	export let closeMe = () => {};

	let curNum = 0;
	let data = {};

    const onclick = (ev) => {
// console.log('onclick', ev)
		let target = ev.target,
			nm = Number(target.value);
		if (curNum !== nm) {
			curNum = nm;
			setPage(curNum);
		}
	};
    const setPage = (nm) => {
		let pt = prp._cur[nm],
			type = pt.type, 
			url = 'https://dtp.mvs.group/scripts/index.php?request=get_dtp_id&id=' + pt.id + '&type=' + type;


		fetch(url, {})
			.then(req => req.json())
			.then(json => {
				data = json;
			});

	};
	setPage(curNum);


</script>
	<div class="mvsPopup">
		<div class="close">
			<a class="leaflet-popup-close-button" href="#close" on:click|preventDefault={closeMe}>×</a>
		</div>

		<div class="pLine">
			{#each prp._cur as pt, i}
			<button class="{curNum === i ? 'current' : ''}" value={i} on:click={onclick}>{pt.type === 'gibdd' ? 'ГИБДД' : 'СКПДИ'}</button>
			{/each}
		</div>
		{#if prp._cur[curNum].type === 'gibdd'}
			<DtpPopupGibdd prp={data} />
		{:else}
			<DtpPopupSkpdi prp={data} />
		{/if}
	</div>

<style>
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