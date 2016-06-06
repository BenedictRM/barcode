// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
/**
 * In this example, we'll use the Barcode module to display some information about
 * the scanned barcode.
 */
var Barcode = require('ti.barcode');
Barcode.allowRotation = true;
Barcode.displayedMessage = ' ';
Barcode.allowMenu = false;
Barcode.allowInstructions = false;
Barcode.useLED = true;//Automatically turns on flashlight -- TODO: make this a button option

/**
 * Create a chrome for the barcode scanner.
 */
//create a var to hold a view for later use
var overlay = Ti.UI.createView({
    backgroundColor: 'transparent',
    top: 0, right: 0, bottom: 0, left: 0
});
//example cancel button -- can refactor at UI time
var cancelButton = Ti.UI.createButton({
    title: 'Cancel', textAlign: 'center',
    color: '#000', backgroundColor: '#fff', style: 0,
    font: { fontWeight: 'bold', fontSize: 16 },
    borderColor: '#000', borderRadius: 10, borderWidth: 1,
    opacity: 0.5,
    width: 220, height: 30,
    top: 20
});
cancelButton.addEventListener('click', function () {
    Barcode.cancel();
});
overlay.add(cancelButton);

/*
 * Button Functions
 */
//'e' marks this funciton as an event listener
function getScan(e){
	reset();
	
    // Note: while the simulator will NOT show a camera stream in the simulator, you may still call "Barcode.capture"
    // to test your barcode scanning overlay.
    Barcode.capture({
        animate: true,
        overlay: overlay,
        showCancel: false,
        showRectangle: true,
        keepOpen: false/*,
        acceptedFormats: [
            Barcode.FORMAT_QR_CODE
        ]*/
    });
}

//'e' marks this funciton as an event listener
function getBook(e){
	//get isbn number from view
	var isbn = $.scanResult.text;
	console.log("isbn: " + isbn);
	//Take control of isbndb controller and open in new window
	var win=Alloy.createController('isbndb', isbn).getView();
	win.open();
}

/**
 * Now listen for various events from the Barcode module. This is the module's way of communicating with us.
 */
var scannedBarcodes = {}, scannedBarcodesCount = 0;

function reset() {
    scannedBarcodes = {};
    scannedBarcodesCount = 0;
    cancelButton.title = 'Cancel';
	
	//Clear data
	$.scanResult.setText(' ');
	$.scanContentType.setText(' ');
	$.scanFormat.setText(' ');
	$.scanParsed.setText(' ');
}
Barcode.addEventListener('error', function (e) {
	
	$.scanResult.setText(e.message);
	$.scanContentType.setText(' ');
	$.scanFormat.setText(' ');
	$.scanParsed.setText(' ');
});
Barcode.addEventListener('cancel', function (e) {
    Ti.API.info('Cancel received');
});
Barcode.addEventListener('success', function (e) {
    Ti.API.info('Success called with barcode: ' + e.result);
    if (!scannedBarcodes['' + e.result]) {
        scannedBarcodes[e.result] = true;
        scannedBarcodesCount += 1;
        cancelButton.title = 'Finished (' + scannedBarcodesCount + ' Scanned)';
		
		//Fill Data
		$.scanResult.setText(e.result + ' ');
		$.scanContentType.setText(parseContentType(e.contentType) + ' ');
		$.scanFormat.setText(e.format + ' ');
		$.scanParsed.setText(parseResult(e) + ' ');
		
		//Activate book lookup in scanner view
		$.lookup.setEnabled('true');
    }
});

function parseContentType(contentType) {
    switch (contentType) {
        case Barcode.URL:
            return 'URL';
        case Barcode.SMS:
            return 'SMS';
        case Barcode.TELEPHONE:
            return 'TELEPHONE';
        case Barcode.TEXT:
            return 'TEXT';
        case Barcode.CALENDAR:
            return 'CALENDAR';
        case Barcode.GEOLOCATION:
            return 'GEOLOCATION';
        case Barcode.EMAIL:
            return 'EMAIL';
        case Barcode.CONTACT:
            return 'CONTACT';
        case Barcode.BOOKMARK:
            return 'BOOKMARK';
        case Barcode.WIFI:
            return 'WIFI';
        default:
            return 'UNKNOWN';
    }
}

function parseResult(event) {
    var msg = '';
    switch (event.contentType) {
        case Barcode.URL:
            msg = 'URL = ' + event.result;
            break;
        case Barcode.SMS:
            msg = 'SMS = ' + JSON.stringify(event.data);
            break;
        case Barcode.TELEPHONE:
            msg = 'Telephone = ' + event.data.phonenumber;
            break;
        case Barcode.TEXT:
            msg = 'Text = ' + event.result;
            break;
        case Barcode.CALENDAR:
            msg = 'Calendar = ' + JSON.stringify(event.data);
            break;
        case Barcode.GEOLOCATION:
            msg = 'Geo = ' + JSON.stringify(event.data);
            break;
        case Barcode.EMAIL:
            msg = 'Email = ' + event.data.email + '\nSubject = ' + event.data.subject + '\nMessage = ' + event.data.message;
            break;
        case Barcode.CONTACT:
            msg = 'Contact = ' + JSON.stringify(event.data);
            break;
        case Barcode.BOOKMARK:
            msg = 'Bookmark = ' + JSON.stringify(event.data);
            break;
        case Barcode.WIFI:
            return 'WIFI = ' + JSON.stringify(event.data);
        default:
            msg = 'unknown content type';
            break;
    }
    return msg;
}

$.scanner.open();//open the scanner view