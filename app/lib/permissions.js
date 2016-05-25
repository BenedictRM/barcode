//This js file requests all necessary permissions for the app to run
//Titanium does not automatically grant permission just because they are in manifest
//Force a permission request here
//Reference: https://github.com/appcelerator-developer-relations/appc-sample-ti510/blob/master/app/controllers/permissions.js
//Reference: for CommonJS: https://archive.appcelerator.com/question/146003/accessing-a-function-from-other-js-file
// The new cross-platform way to request permissions using commonjs method:

// Arguments passed into this script can be accessed via the `$.args` object directly or:

/**
 * Event listener added in the view.
 * Fired when user taps on edit-button to open the app settings.
 */
function checkPermissions() {
	//check that camera permissions are turned on
	var result = camera();
	
	return result;
}

/**
 * This function requests camera permissions
 * This function is fired when user first selects camera
 * IDEA: consider firing on first time-app launched 
 */
function camera(){
	var hasCameraPermissions = Ti.Media.hasCameraPermissions();
	console.log("PERMISSION FOR CAMERA: " + hasCameraPermissions);
	
	//Already have camera permissions	
	if (hasCameraPermissions) {

		// FIXME: https://jira.appcelerator.org/browse/TIMOB-19933
		// IDEA -- call app splash page after instead of this current call:
		return(1);//camera permissions granted
	}

	// This iOS-only property is available since Ti 4.0
	if (OS_IOS) {

		// Map constants to names
		var map = {};
		map[Ti.Media.CAMERA_AUTHORIZATION_AUTHORIZED] = 'CAMERA_AUTHORIZATION_AUTHORIZED';
		map[Ti.Media.CAMERA_AUTHORIZATION_DENIED] = 'CAMERA_AUTHORIZATION_DENIED';
		map[Ti.Media.CAMERA_AUTHORIZATION_RESTRICTED] = 'CAMERA_AUTHORIZATION_RESTRICTED';
		map[Ti.Media.CAMERA_AUTHORIZATION_NOT_DETERMINED] = 'CAMERA_AUTHORIZATION_NOT_DETERMINED';

		var cameraAuthorizationStatus = Ti.Media.cameraAuthorizationStatus;
		console.log('Ti.Media.cameraAuthorizationStatus', 'Ti.Media.' + map[cameraAuthorizationStatus]);

		if (cameraAuthorizationStatus === Ti.Media.CAMERA_AUTHORIZATION_RESTRICTED) {
			return alert('Because permission are restricted by some policy which you as user cannot change, we don\'t request as that might also cause issues.');

		} else if (cameraAuthorizationStatus === Ti.Media.CAMERA_AUTHORIZATION_DENIED) {
			return dialogs.confirm({
				title: 'You denied permission before',
				message: 'We don\'t request again as that won\'t show the dialog anyway. Instead, press Yes to open the Settings App to grant permission there.',
				callback: editPermissions
			});
		}
	}
	
	else{
		// FIXME: https://jira.appcelerator.org/browse/TIMOB-19851
		// You will be prompted to grant to permissions. If you deny either one weird things happen
		Ti.Media.requestCameraPermissions(function(e) {
			console.log('Ti.Media.requestCameraPermissions', e);
	
			if (e.success) {
				// Instead, probably call the same method you call if hasCameraPermissions() is true

				//FIXME: need event listener instead of just opening here
				var win=Alloy.createController('index').getView();
				win.open();
				alert('You granted permission to use camera!');
				
				return(1);//camera permissions granted
	
			} else if (OS_ANDROID) {
				alert('You don\'t have the required uses-permissions in tiapp.xml or you denied permission for now, forever or the dialog did not show at all because you denied forever before.');
				return(0);//camera permissions granted
			} else {
	
				// We already check AUTHORIZATION_DENIED earlier so we can be sure it was denied now and not before
				alert('You denied camera permission. This app will not be able to scan books');
				return(0);//camera permissions granted
			}
		});
	}
}

//Public Methods
exports.checkPermissions = checkPermissions;