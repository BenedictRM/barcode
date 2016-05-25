// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
// Refactoring: http://docs.appcelerator.com/platform/latest/#!/guide/Working_with_JSON_Data
//SRC: https://archive.appcelerator.com/question/145460/retrieve-json-from-server-and-commonjs-module
var apiURL = "http://isbndb.com/api/v2/json/";
var accessKey = "QR0I50RW";

function getBook(){
	var bookData;
	//assemble url string
	var rawurl = apiURL + accessKey + "/book/" + args;
	//Remove all whitespace from search url
	var isbnurl = rawurl.trim();

	//call download with args
	//TODO: handle book not found exception
	download({
		url: isbnurl,
	    type: 'json', // is default or html
	    success: function (success) {
	        // put the code you want to run if successful here
	        // returns either JSON or the HTML content requested
	        bookData = JSON.stringify(success.data[0].title);
	        Ti.API.info("SUCCESS: " + bookData);
	        //pass bookdata to view 
			$.bookDataLabel.setText(bookData);
			//TODO: send bookData to mysql db for persistent storage
	    },
	     error: function (error) {
	        // error contains the error object
	        Ti.API.info("ERROR:" + error);
	    }
	});	
}

//Used to convert incomming object to a string array
function stringify(obj) {
    var arr = [], itm;
    for (itm in obj) {
        arr.push(itm + "=" + escape(obj[itm]));
    }
    return arr.join("&");
}

function download(obj) {
    var xhr = Ti.Network.createHTTPClient();
    var strMode = (obj.method || 'GET');
    xhr.setTimeout(obj.timeout || 10 * 1000);
    xhr.onload = function (e) {
        var strType = (obj.type || 'json').toLowerCase();
        switch (xhr.status) {
        case 200:
            response = this.responseText;
            switch (strType) {
            case 'json':
                console.log("got a JSON!");
                // parse the retrieved data, turning it into a JavaScript object
                json = JSON.parse(response);
                if (obj.success) {
                    obj.success(json);//put json into success as json object
                }
                else{
                	alert("I failed!");
                }
                break;
            case 'html':
                if (obj.success) {
                    obj.success(response);
                }
                break;
            };
            break;
        case 304:
            if (obj.success) {
                obj.success([]);
            }
            break;
        case 404:
            if (obj.error) {
                obj.error({
                    responseText: 'Page Not Found',
                    status: xhr.status
                });
            }
            break;
        }
    };
    if (obj.error) {
        xhr.onerror = function (e) {
            obj.error(e);
        };
    }
    if (obj.progress) {
        xhr.onsendstream = function (e) {
            if (typeof(obj.progress) !== 'undefined') {
                obj.progress({
                    value: parseFloat((e.progress * 100), 10)
                });
            }
        };
    }
    if (obj.state) {
        xhr.onreadystatechange = function (e) {
            var state = this.readyState;
            var states = [
                'Unsent',
                'Opened',
                'Headers',
                'Loading',
                'Done'
            ];
            obj.state({
                state: state,
                caption: states[state]
            });
        };
    }

    if (strMode === 'POST') {
        xhr.open(strMode, obj.url);
        xhr.send(obj.param);
    } else {
        xhr.open(strMode, obj.url + '?' + stringify(obj.param));
        xhr.send();
    }
}

$.isbndb.open();//open the isbndb view