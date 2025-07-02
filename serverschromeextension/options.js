// Saves options to chrome.storage
function save_options() {
	
  var showTin = document.getElementById('tin').checked;
  var showBronze = document.getElementById('bronze').checked;   
  var showDrProd = document.getElementById('drprod').checked;
  var showCorp = document.getElementById('corp').checked;
  var showDemo = document.getElementById('demo').checked;
  var showProd = document.getElementById('prod').checked;
  var showCarbon = document.getElementById('carbon').checked;
  var showCorndog = document.getElementById('corndog').checked;
  var showHotdog = document.getElementById('hotdog').checked;
  
  chrome.storage.sync.set({
	showTin: showTin,
	showBronze: showBronze, 
	showDrProd: showDrProd,
	showCorp: showCorp,
	showDemo: showDemo,
	showProd: showProd,
	showCarbon: showCarbon,
	showCorndog: showCorndog,
	showHotdog: showHotdog,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    showTin: true,
	showBronze: true,
	showDrProd: true,
	showCorp: true,
	showDemo: true,
	showProd: true,
	showCarbon: true,
	showCorndog: false,
	showHotdog: false,
	}, function(items) {
  	document.getElementById('tin').checked = items.showTin;
	document.getElementById('bronze').checked = items.showBronze;
	document.getElementById('drprod').checked = items.showDrProd;
	document.getElementById('corp').checked = items.showCorp;
	document.getElementById('demo').checked = items.showDemo;
	document.getElementById('prod').checked = items.showProd;
	document.getElementById('carbon').checked = items.showCarbon;
	//document.getElementById('corndog').checked = items.showCorndog;
	//document.getElementById('hotdog').checked = items.showHotdog;	
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);