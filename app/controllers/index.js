//Check permissions TODO: consider moving to alloy.js as this is really an initializaiton call
var permissions = require('permissions');
var granted = permissions.checkPermissions();

//facebook login authentication currently only works for android
//TODO: set up ios facebook login -- see 'additional ios step' here: http://docs.appcelerator.com/platform/latest/#!/api/Modules.Facebook
var fb = require('facebook');
//request permissions app uses, must be set or login button fails
//complete list of permissions: https://developers.facebook.com/docs/facebook-login/permissions/v2.2
fb.permissions = ['email', 'public_profile'];
fb.initialize();

//This event listener handles users logging in from index.xml view
fb.addEventListener('login', function(e) {
    if (e.success) {
        alert('login from uid: '+e.uid+', name: '+ JSON.parse(e.data).name);
        label.text = 'Logged In = ' + fb.loggedIn;
    }
    else if (e.cancelled) {
        // user cancelled
        //we need to enter the unque hashes both stores will give us to the facebook developer page 
        //in order to get facebook authentication working
        //TODO: fix login when ready to publish to store 
        //TODO: Add temporary buttons that give a random uid to developers to login into database for now -- replace when app completed with fb login
        alert('LOGIN WILL NOT WORK UNTIL WE HAVE PUBLISHED ON APPLE AND GOOGLE PLAY STORES');
    }
    else {
        alert(e.error);
    }
});

//Log user out and forget authentication token
fb.addEventListener('logout', function(e) {
    alert('Logged out');
});

//Users can change app permissions from facebook.com -- this method listens for updates to those permissions and updates as needed
fb.addEventListener('tokenUpdated', function(e) {
    Ti.API.info('Updated permissions: ' + JSON.stringify(fb.permissions));
});
fb.refreshPermissionsFromServer();

function doSave(){
	alert("I'm just an example!");
}

function doClose(){
	alert("I'm just an example!");
}

function doScan(){
	//Take control of scannercontroller and open in new window, pass no args
	var win=Alloy.createController('scanner').getView();
	win.open();
}

console.log("ABOUT TO OPEN WINDOW WITH CAMERA PERMISSIONS GRANTED: " + granted);
//If permissions have been granted start application
if(granted){
	//create facebook proxy so that facebook token does not get garbage collected (REQUIRED to work in android)
	if (OS_ANDROID) {
    	$.index.fbProxy = Alloy.Globals.Facebook.createActivityWorker({lifecycleContainer: $.index});
	}
	
	$.index.open();//open the index view from index.xml
}