var _moduleName_appUtility = "app-utility.js";

var _XmlRootPath = "allAssets/data/";  //local location
var _DataExtension = ".xml";  //local location
//var _XmlRootPath = "http://184.106.144.27/af_php/voith/air/allAssets/data/";  //server location - test
//var _XmlRootPath = "http://itnappwss2t/sites/mobile_app_store/app_data_cnt/MOD_COMP/_vti_bin/listdata.svc/";  //VOITH server location
//var _DataExtension = "/";  //VOITH server location - ends with trailing slash
var _ImagePathProductLayers = "allAssets/img/product/layers/";
var _ImagePathProduct = "allAssets/img/product/";
var _ImageNameBase = "base000.png";
var _ImageNameBase1 = "base001.png";

//----------------------------------------------------------------------------------
//		Product Selection Screen
//----------------------------------------------------------------------------------
function appUtility() {
    "use strict";
    LogMessage(_moduleName_appUtility + ": init");
}

function onOnline() {
    //TBD - update this to show indicator on screen
    LogMessage("Modular Composite", "Your device is connected.");
}
function onOffline() {
    //TBD - update this to show indicator on screen
    LogMessage("Modular Composite", "Your device is not connected.");
}

function isConnected() {
    if (IsEnvironmentPHONEGAP()) {
        if (checkConnection() == "none") {
            connectionStatus = 'offline';
        } else {
            connectionStatus = 'online';
        }
        function checkConnection() {
            var networkState = navigator.network.connection.type;
            //var states = {};
            //states[Connection.UNKNOWN] = 'Unknown connection';
            //states[Connection.ETHERNET] = 'Ethernet connection';
            //states[Connection.WIFI] = 'WiFi connection';
            //states[Connection.CELL_2G] = 'Cell 2G connection';
            //states[Connection.CELL_3G] = 'Cell 3G connection';
            //states[Connection.CELL_4G] = 'Cell 4G connection';
            //states[Connection.NONE] = 'No network connection';
            ////console.log('Connection : ' + Connection);
            ////console.log('Connection type: ' + states[networkState]);
            LogMessage("Connection State: " + networkState);
            return networkState != "none";
        }
    } else {
        return navigator.onLine;
    }
}

function LocalStorage_Get(key) {
    return window.localStorage.getItem(key);
}

function LocalStorage_Set(key, val) {
    window.localStorage.setItem(key, val);
}



//----------------------------------------------------------------------------------
//		Based on the a selected product (page 2, quoteView), load and show a layer of images
//      per 2016-06-16 - first image for all products will be _ImageNameBase1
//		NOTE - Image paths are case sensitive - folder name and image names
//----------------------------------------------------------------------------------
function Utility_LoadLayeredImageByProduct(product) {

    //if prod has RankExisting true, then don't show image to start
    if (product == undefined || product.RankExisting) {
        return '';
    }

    //if selected rank is empty, then find product selection based on page 1 selected prod
    var imageList = product.ImagesConcatenated.split('|');

    //image template, build out layered images, insert into container
    var templateImg = '<img class="image product-image" style="z-index:%%Z-INDEX%%" src="' + _ImagePathProductLayers + '%%IMAGE_NAME%%" alt="" />';
    var resultHTML = '';
    if (imageList != undefined && imageList.length > 0) {
        $.each(imageList, function (i, item) {
            var imgHTML = templateImg;
            imgHTML = imgHTML.replace('%%IMAGE_NAME%%', item.split(':')[1].toLowerCase());
            imgHTML = imgHTML.replace('%%Z-INDEX%%', GetLayeredImageZIndex(item.split(':')[0]).toString());
            resultHTML += imgHTML;
        });
    }
    return resultHTML;
}

//----------------------------------------------------------------------------------
//		Convert single image to base 64 string
//----------------------------------------------------------------------------------
function Utility_ImageToBase64(canvasId, imgId, width, height, removeTransparency) {

    LogMessage(_moduleName_appUtility + ": Utility_ImageToBase64: Canvas: " + canvasId + ", ImageId: " + imgId);

    var canvas = document.getElementById(canvasId);
	var img = document.getElementById(imgId);
	canvas.width = width;
	canvas.height = height;
    var ctx = canvas.getContext("2d");
	//LogMessage(_moduleName_appUtility + ": Img: " + img.src);
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height,0, 0, canvas.width, canvas.height); //x,y,width,height
    //LogMessage(_moduleName_appUtility + ": Utility_ImageToBase64 - finished draw image");
	
	if (removeTransparency != undefined && removeTransparency) {
		//now remove transparency - alpha channel
		//pull out canvas image and replace transparency
		var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		// take away transparency
		for (var i = 0; i < imgData.data.length; i += 4) {
			imgData.data[i + 3] = 255;
		}
		//put back the non-transaprent image into canvas
		ctx.putImageData(imgData, 0, 0);
	}

	//generate bytes to ultimately save, could consider bypassing file save and just return bytes for the PDF
	var dataURL = canvas.toDataURL("image/jpeg", 1.0);
	return dataURL;
};

//----------------------------------------------------------------------------------
//		Load layered images into canvas object for use in saving layers into single image
//----------------------------------------------------------------------------------
function Utility_GenerateLayeredImageAsBase64(quote, removeTransparency) {

    LogMessage(_moduleName_appUtility + ": Utility_GenerateLayeredImageAsBase64: " + quote.Product.ProductName);

    var product = quote.Product;

    //get list of images associated with this product and ranks
    var imageList = product.ImagesConcatenated.split('|');
    //Sort array to get the ordering of images right. Load items, get the right z index and then we can sort
    var arrayImages = [];
    var arrayOrder = [];
    if (imageList != undefined && imageList.length > 0) {
        $.each(imageList, function (i, item) {
            var itemAdd = {};
            itemAdd.Order = GetLayeredImageZIndex(item.split(':')[0]);
            itemAdd.ImageName = item.split(':')[1];
            itemAdd.Path = 'allAssets/img/product/' + item.split(':')[1];
            arrayImages.push(itemAdd);
            //add order in simple array so we can sort
            arrayOrder.push(itemAdd.Order);
        });
    }

    // Watch out that 10 comes before 2,
    // because '10' comes before '2' in Unicode code point order.
    //imageList = imageList.sort();
    //example: var scores = [1, 10, 2, 21];  //scores.sort(); // [1, 10, 2, 21]
    arrayImages = arrayImages.sort(function (a, b) { return a.Order - b.Order });

    var canvas = document.getElementById("quote-history-canvas");
    var ctx = canvas.getContext("2d");
    //do white background
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    //image template, build out layered images, insert into canvas
    if (arrayImages != undefined && arrayImages.length > 0) {
        $.each(arrayImages, function (i, item) {
			//different image load times causing the ordering to get messed up.
            //load from set of pre-loaded images 
            var img = document.getElementById('img' + item.ImageName.replace('.png', ''));
            //LogMessage(_moduleName_appUtility + ": Draw Image: " + img.src);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height,0, 0, canvas.width, canvas.height); //x,y,width,height
			if (i==0) return;
        });

		if (removeTransparency != undefined && removeTransparency) {
			//now remove transparency - alpha channel
			//pull out canvas image and replace transparency
			var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			// take away transparency
			for (var i = 0; i < imgData.data.length; i += 4) {
				imgData.data[i + 3] = 255;
			}
			//put back the non-transaprent image into canvas
			ctx.putImageData(imgData, 0, 0);
		}

        //generate bytes to ultimately save, could consider bypassing file save and just return bytes for the PDF
        var dataURL = canvas.toDataURL("image/jpeg", 1.0);
        return dataURL;
    }
};

//----------------------------------------------------------------------------------
//		Load layered images into canvas object for use in saving layers into single image
//      Returns a byte array representing the layered image
//----------------------------------------------------------------------------------
function Utility_GenerateLayeredImageAsBytes(quote, removeTransparency) {

    LogMessage(_moduleName_appUtility + ": Utility_GenerateLayeredImageAsBytes: " + quote.Product.ProductName);
    var dataURL = Utility_GenerateLayeredImageAsBase64(quote,removeTransparency);
    dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    return _base64ToByteArray(dataURL);
}


//----------------------------------------------------------------------------------
//		Load layered images into canvas object for use in saving layers into single image
//      Returns a relative file path to an image
//----------------------------------------------------------------------------------
function Utility_GenerateLayeredImageToDisk_AIR(quote) {

    LogMessage(_moduleName_appUtility + ": Utility_GenerateLayeredImageToDisk: " + quote.Product.ProductName);
    //build up a file name - if file already exists, return file name to caller
    var imageFilePath = 'quoteProductImage/' + quote.Product.ProductName;
    $.each(quote.AppType, function (i, item) {
        if (item.ShowInList) {
            imageFilePath += '_' + item.Caption + '-' + item.Rank;
        }
    });
    imageFilePath += '.png';
    var file = air.File.applicationStorageDirectory.resolvePath(imageFilePath);
    //already there, don't re-generate, else build out image
    //if (file.exists) {
    //    LogMessage(_moduleName_appUtility + ": Utility_GenerateLayeredImageToDisk: File exists: " + imageFilePath);
    //    return imageFilePath;
    //}

    var imgData = Utility_GenerateLayeredImageAsBytes(quote);

    //write data to file - file object created at top of method
    fileStream = new air.FileStream();
    fileStream.open(file, air.FileMode.WRITE);
    fileStream.writeBytes(dataURL, 0);
    fileStream.close();
    LogMessage(_moduleName_appUtility + ": Utility_GenerateLayeredImageToDisk: File created: " + imageFilePath);
    return imageFilePath;
}



//----------------------------------------------------------------------------------
//		Utility Methods - byteArrayToBase64
//----------------------------------------------------------------------------------
var _byteArrayToBase64 = function (byteArr) {
    var base64s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var encOut = "";
    var bits;
    var i = 0;

    while (byteArr.length >= i + 3) {
        bits = (byteArr[i++] & 0xff) << 16 | (byteArr[i++] & 0xff) << 8 | byteArr[i++] & 0xff;
        encOut += base64s.charAt((bits & 0x00fc0000) >> 18) + base64s.charAt((bits & 0x0003f000) >> 12) + base64s.charAt((bits & 0x00000fc0) >> 6) + base64s.charAt((bits & 0x0000003f));
    }
    if (byteArr.length - i > 0 && byteArr.length - i < 3) {
        var dual = Boolean(byteArr.length - i - 1);
        bits = ((byteArr[i++] & 0xff) << 16) | (dual ? (byteArr[i] & 0xff) << 8 : 0);
        encOut += base64s.charAt((bits & 0x00fc0000) >> 18) + base64s.charAt((bits & 0x0003f000) >> 12) + (dual ? base64s.charAt((bits & 0x00000fc0) >> 6) : '=') + '=';
    }

    return encOut;
};

//----------------------------------------------------------------------------------
//		Utility Methods - base64ToByteArray
//----------------------------------------------------------------------------------
var _base64ToByteArray = function (encStr) {
    var base64s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var decOut = new air.ByteArray();
    var bits;

    for (var i = 0, j = 0; i < encStr.length; i += 4, j += 3) {
        bits = (base64s.indexOf(encStr.charAt(i)) & 0xff) << 18 | (base64s.indexOf(encStr.charAt(i + 1)) & 0xff) << 12 | (base64s.indexOf(encStr.charAt(i + 2)) & 0xff) << 6 | base64s.indexOf(encStr.charAt(i + 3)) & 0xff;
        decOut[j + 0] = ((bits & 0xff0000) >> 16);
        if (i + 4 != encStr.length || encStr.charCodeAt(encStr.length - 2) != 61) {
            decOut[j + 1] = ((bits & 0xff00) >> 8);
        }
        if (i + 4 != encStr.length || encStr.charCodeAt(encStr.length - 1) != 61) {
            decOut[j + 2] = (bits & 0xff);
        }
    }

    return decOut;
};


