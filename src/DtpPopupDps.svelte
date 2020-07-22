<script>
	export let prp = {};
	let current = 0;

    const copyParent = (ev) => {
		navigator.clipboard.writeText(ev.target.parentNode.textContent).catch(err => {
			console.log('Something went wrong', err);
		});
	};

    const onClick = (ev) => {
		let target = ev.target,
			arr = /tab (\d)/.exec(target.className),
			nm = arr && arr.length === 2 ? arr[1] : 0,
			prn = target.parentNode;
			
		for (let i = 0, len = prn.childNodes.length; i < len; i++) {
			let node = prn.childNodes[i];
			if (node.classList) {
				let active = node.classList.contains(nm);
				if (node.tagName === 'BUTTON') {
					node.classList[active ? 'add' : 'remove']('active');
				} else if (node.tagName === 'TABLE') {
					node.classList[active ? 'remove' : 'add']('hidden');
				}
			}
		}
		// let target = ev.target.classList.remove
// console.log('setComplex ', prn.childNodes);
	};

</script>
	<div class="mvsPopup">
		<div class="pLine">{prp.title}</div><br>
		<div class="address">{prp.address}<br>{prp.contact}</div>
	</div>

<style>

.hidden {
	display: none;
}

.mvsPopup .address {
    margin: 14px;
    font-weight: 200;
}
.mvsPopup .tabs {
    padding-top: 16px;
}
.mvsPopup .tab.active {
    color: red;
}
.mvsPopup .tab {
    color: #1890ff;
    font-weight: 500;
	margin: 0px 10px 4px 0;
    padding: 8px 6px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
}

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