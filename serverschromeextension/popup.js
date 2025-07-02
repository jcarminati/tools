function restore_options() {
var servers = ["showTin", "showBronze", "showDrProd", "showCorp", "showDemo", "showProd", 
"showCarbon", "showCorndog", "showHotdog",];

  // get stored values
  chrome.storage.sync.get(servers, function(items){
  console.log(items);
  
if (items.showTin == false){
document.getElementById("dTin").style.visibility="hidden"
document.getElementById("dTin").style.height="0px"
  }
  
  if (items.showBronze == false){
document.getElementById("dBronze").style.visibility="hidden"
document.getElementById("dBronze").style.height="0px"
  }
      
    if (items.showDrProd == false){
document.getElementById("dDrProd").style.visibility="hidden"
document.getElementById("dDrProd").style.height="0px"
  }
  
  if (items.showCorp == false){
document.getElementById("dCorp").style.visibility="hidden"
document.getElementById("dCorp").style.height="0px"
  }
  
  if (items.showDemo == false){
document.getElementById("dDemo").style.visibility="hidden"
document.getElementById("dDemo").style.height="0px"
  }  

if (items.showProd == false){
document.getElementById("dProd").style.visibility="hidden"
document.getElementById("dProd").style.height="0px"
  }
  
  if (items.showCarbon == false){
document.getElementById("dCarbon").style.visibility="hidden"
document.getElementById("dCarbon").style.height="0px"
  }
  
 if (items.showCorndog == false){
document.getElementById("dCorndog").style.visibility="hidden"
document.getElementById("dCorndog").style.height="0px"
  }

if (items.showHotdog == false){
document.getElementById("dHotdog").style.visibility="hidden"
document.getElementById("dHotdog").style.height="0px"
  }
})
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', restore_options);
