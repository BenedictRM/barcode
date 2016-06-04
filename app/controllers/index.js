//Check permissions TODO: consider moving to alloy.js as this is really an initializaiton call
var permissions = require('permissions');
var granted = permissions.checkPermissions();

function doSave(){
	alert("I'm just an example!");
}

function doClose(){
	alert("I'm just an example!");
}

function doLogin(){
	alert("TODO: set up facebook authentication!");
}

function doScan(){
	//Take control of scannercontroller and open in new window, pass no args
	var win=Alloy.createController('scanner').getView();
	win.open();
}

console.log("ABOUT TO OPEN WINDOW WITH: " + granted);
//If permissions have been granted start application
if(granted){
	$.index.open();//open the index view from index.xml
}