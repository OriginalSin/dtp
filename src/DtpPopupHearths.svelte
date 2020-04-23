<script>
	// import { afterUpdate } from 'svelte';
	// import DtpPopupGibdd from './DtpPopupGibdd.svelte';
	// import DtpPopupSkpdi from './DtpPopupSkpdi.svelte';

	// export let showModal = false;

	export let prp;
	// export let popup;


</script>
	<div class="mvsPopup">
		<div class="pLine">Очаг ДТП (id: {prp.id})</div>
		<div class="pLine">{prp.quarter} кв. {prp.year}г.</div>
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
			<tr>
			  <td class="first" colspan=2>
				<ul>
				{#each prp.list_dtp as pt1}
					<li>{new Date(1000 * pt1.date).toLocaleDateString()} {new Date(1000 * pt1.date).toLocaleTimeString()}</li>
				{/each}
				</ul>
			  </td>
			</tr>
		   </tbody>
		  </table>
		</div>
	</div>

<style>
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