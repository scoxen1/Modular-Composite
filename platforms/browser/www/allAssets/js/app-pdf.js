var _moduleName_appPDFHelper = "appPDF-helper.js";

var _includeImages = true;

//----------------------------------------------------------------------------------
//		PDF Generation functionality
//----------------------------------------------------------------------------------
function appPDFHelper() {
    "use strict";
    LogMessage(_moduleName_appPDFHelper + ": init");

}

//----------------------------------------------------------------------------------
//		PDF file path
//----------------------------------------------------------------------------------
function _pdfFilePath(quote) {
    var result = 'modular-composite-quote-' + (quote.QuoteId != undefined && quote.QuoteId > 0 ?
        quote.Customer.CustomerNumber + '-' + quote.QuoteId.toString() + '.pdf' : quote.PDFFileName);
    if (IsEnvironmentAIR()) {
        //name the PDF file:
        return "quotes/" + result;
    }
    else {
        //name the PDF file:
        return result;
    }
}

//----------------------------------------------------------------------------------
//		_buildPDFDoc - build doc using jsPDF
//----------------------------------------------------------------------------------
function _buildPDFDoc(quote) {
    LogMessage(_moduleName_appPDFHelper + ": _buildPDFDoc - start");

    var doc = new jsPDF('landscape');

    var yCoordOffset = 8;
    var yHeaderOffset = 12;

    var colOffset = 90;
    var xCoord = 18;
    var yCoord = 28;
    var xCoordTwo = xCoord + colOffset;
    var yCoordTwo = yCoord;
    var xCoordThree = xCoord + colOffset * 2;
    var yCoordThree = yCoord;

    //"css"
    var fontSizeNormal = 11;
    var fontSizeMedium = 16;
    var fontSizeLarge = 20;
    var fontSizeXLarge = 30;

    //offsets for lines and other related items
    var valueOffset = 60;
    var lineOffset = 3;
    var colWidth = colOffset - 10;

    //Layered Image
    if (_includeImages) {
        //it also has white space at top, to get the layout to work well, draw image first and then add in header, prod name 
        // so that the image is behind this other stuff
        // generate a layered image on a canvas and save to base64 string to be used downstream
LogMessage(_moduleName_appPDFHelper + ": _buildPDFDoc - layered image");
        var prodImageData = Utility_GenerateLayeredImageAsBase64(quote, false);
        //original size is 560x560, canvas is 560x560
        doc.addImage(prodImageData, 'JPEG', xCoord - 10, yCoord - 10, 100, 100); //imgdata, format, x,y,w,h
    }


    //header
    //position header above the first row of content
    doc.setFontSize(fontSizeLarge);
    doc.setTextColor(45, 66, 117);
    doc.text(xCoordTwo, yCoord - yHeaderOffset, 'Modular Composite - Quote');
    //line to separate header
    doc.line(xCoord, yCoord - yHeaderOffset + lineOffset, xCoordThree + colWidth, yCoord - yHeaderOffset + lineOffset); // x1, y1, x2, y2 - horizontal line 

    //logo in header (or text to represent company info)
    if (_includeImages) {
        //Logo image
		var imgDataLogo = Utility_ImageToBase64('image-conversion-canvas','imgLogo', 135, 31);
        doc.addImage(imgDataLogo, 'JPEG', xCoordThree + colWidth - 50, 7, (135 * .35), (31 * .35)); //imgdata, format, x,y,w,h - //original size is 135x31
        //doc.addImage(img, 'png', xCoordThree + colWidth - 50, 7, (135 * .35), (31 * .35)); //imgdata, format, x,y,w,h - //original size is 135x31
        ////    var imgData =
        ////    'data:image/jpeg;base64,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A+0AAAAAABAASAAAAAEAAQBIAAAAAQABOEJJTQQmAAAAAAAOAAAAAAAAAAAAAD+AAAA4QklNBA0AAAAAAAQAAAAeOEJJTQQZAAAAAAAEAAAAHjhCSU0D8wAAAAAACQAAAAAAAAAAAQA4QklNJxAAAAAAAAoAAQAAAAAAAAABOEJJTQP1AAAAAABIAC9mZgABAGxmZgAGAAAAAAABAC9mZgABAKGZmgAGAAAAAAABADIAAAABAFoAAAAGAAAAAAABADUAAAABAC0AAAAGAAAAAAABOEJJTQP4AAAAAABwAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAADhCSU0ECAAAAAAAEAAAAAEAAAJAAAACQAAAAAA4QklNBB4AAAAAAAQAAAAAOEJJTQQaAAAAAAM/AAAABgAAAAAAAAAAAAAAHwAAAIcAAAAFAHYAbwBpAHQAaAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAhwAAAB8AAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAG51bGwAAAACAAAABmJvdW5kc09iamMAAAABAAAAAAAAUmN0MQAAAAQAAAAAVG9wIGxvbmcAAAAAAAAAAExlZnRsb25nAAAAAAAAAABCdG9tbG9uZwAAAB8AAAAAUmdodGxvbmcAAACHAAAABnNsaWNlc1ZsTHMAAAABT2JqYwAAAAEAAAAAAAVzbGljZQAAABIAAAAHc2xpY2VJRGxvbmcAAAAAAAAAB2dyb3VwSURsb25nAAAAAAAAAAZvcmlnaW5lbnVtAAAADEVTbGljZU9yaWdpbgAAAA1hdXRvR2VuZXJhdGVkAAAAAFR5cGVlbnVtAAAACkVTbGljZVR5cGUAAAAASW1nIAAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcAAAAfAAAAAFJnaHRsb25nAAAAhwAAAAN1cmxURVhUAAAAAQAAAAAAAG51bGxURVhU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b2RpZnlEYXRlPSIyMDE2LTA1LTI2VDE2OjUwOjI3LTA0OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE2LTA1LTI2VDE2OjUwOjI3LTA0OjAwIiBkYzpmb3JtYXQ9ImltYWdlL2pwZWciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NGQ2ZTM5OWUtNzY0Ny00ZWQyLTgxZTAtMGEyM2Y4MjA5ZjAxIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZmYyNWY0ZDQtNWI0Ny0xMTc5LWE3MjgtYzUzMjc5MWViZTNlIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MTdlNzc2NTctZGYzMC00NzY3LTg0NGYtMDY4ZjhkZTI4ZTE0Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxN2U3NzY1Ny1kZjMwLTQ3NjctODQ0Zi0wNjhmOGRlMjhlMTQiIHN0RXZ0OndoZW49IjIwMTYtMDQtMjBUMTE6NTA6MDQtMDQ6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gaW1hZ2UvcG5nIHRvIGltYWdlL2pwZWciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjRkNmUzOTllLTc2NDctNGVkMi04MWUwLTBhMjNmODIwOWYwMSIgc3RFdnQ6d2hlbj0iMjAxNi0wNS0yNlQxNjo1MDoyNy0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz7/7gAOQWRvYmUAZEAAAAAB/9sAhAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAgICAgICAgICAgIDAwMDAwMDAwMDAQEBAQEBAQEBAQECAgECAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwP/wAARCAAfAIcDAREAAhEBAxEB/90ABAAR/8QBogAAAAYCAwEAAAAAAAAAAAAABwgGBQQJAwoCAQALAQAABgMBAQEAAAAAAAAAAAAGBQQDBwIIAQkACgsQAAIBAwQBAwMCAwMDAgYJdQECAwQRBRIGIQcTIgAIMRRBMiMVCVFCFmEkMxdScYEYYpElQ6Gx8CY0cgoZwdE1J+FTNoLxkqJEVHNFRjdHYyhVVlcassLS4vJkg3SThGWjs8PT4yk4ZvN1Kjk6SElKWFlaZ2hpanZ3eHl6hYaHiImKlJWWl5iZmqSlpqeoqaq0tba3uLm6xMXGx8jJytTV1tfY2drk5ebn6Onq9PX29/j5+hEAAgEDAgQEAwUEBAQGBgVtAQIDEQQhEgUxBgAiE0FRBzJhFHEIQoEjkRVSoWIWMwmxJMHRQ3LwF+GCNCWSUxhjRPGisiY1GVQ2RWQnCnODk0Z0wtLi8lVldVY3hIWjs8PT4/MpGpSktMTU5PSVpbXF1eX1KEdXZjh2hpamtsbW5vZnd4eXp7fH1+f3SFhoeIiYqLjI2Oj4OUlZaXmJmam5ydnp+So6SlpqeoqaqrrK2ur6/9oADAMBAAIR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';
        ////    doc.addImage(imgData, 'JPEG', xCoordThree + colWidth - 35, yCoord - yHeaderOffset, 50, 10);
    }
    else {
        //voith logo in text
        doc.setFontSize(fontSizeXLarge);
        doc.text(xCoordThree + colWidth - 35, yCoord - yHeaderOffset, 'VOITH');
    }

    //first column
    doc.setFontSize(fontSizeLarge);
    doc.setTextColor(45, 66, 117);
    doc.text(xCoord, yCoord, quote.Product.ProductName); //product name

    //2nd Column
    doc.setFontSize(fontSizeMedium);
    doc.setTextColor(45, 66, 117);
    var wrapTextCustomerName = doc.splitTextToSize(quote.Customer.Name, colWidth);

    doc.text(xCoordTwo, yCoordTwo, wrapTextCustomerName); // quote number 
    yCoordTwo += yCoordOffset;
    doc.setFontSize(fontSizeNormal);
    doc.setTextColor(33, 35, 34);
    yCoordTwo += yCoordOffset;
    var wrapTextCustomerInfo = $.trim(quote.Customer.MachineNumber) + ' / ' +
					  $.trim(quote.Customer.SectionName) + ' / ' +
					  $.trim(quote.Customer.ApplicationName) + ' / ' +
					  $.trim(quote.Customer.PaperGrade);
    //new customer causes weird paragraph splits
    if (quote.Customer.IsLocal) {
        wrapTextCustomerInfo = wrapTextCustomerInfo.replace(/(\r\n|\n|\r)/gm, "");
        wrapTextCustomerInfo = wrapTextCustomerInfo.replace(/\t/gm, " ");
    }
    wrapTextCustomerInfo = doc.splitTextToSize(wrapTextCustomerInfo, colWidth);
    doc.text(xCoordTwo, yCoordTwo, wrapTextCustomerInfo);
    yCoordTwo += yCoordOffset;
    doc.setFontSize(fontSizeMedium);
    doc.setTextColor(45, 66, 117);
    yCoordTwo += yCoordOffset;
    var yCoordOverview = yCoordTwo;  //use this downstream to align Overview and Calendar headings
    doc.text(xCoordTwo, yCoordTwo, "Overview");
    doc.setFontSize(fontSizeNormal);
    doc.setTextColor(33, 35, 34);

    $.each(quote.Product.AppType, function (i, item) {
        if (item.ShowInList) {
            yCoordTwo += yCoordOffset;
            doc.text(xCoordTwo, yCoordTwo, item.Caption);
            if (_includeImages) {
                //load an image that has been pre-loaded into page
				var imgId = item.IconName_Blue.replace("allAssets/img/attribute_icons/", "");
				imgId = 'imgIcon' + imgId.replace(".png", "");
				var imgData = Utility_ImageToBase64('image-conversion-canvas', imgId, 335, 335, false);
                doc.addImage(imgData, 'JPEG', xCoordTwo + valueOffset - 8, yCoordTwo - 4, 5, 5); //imgdata, format, x,y,w,h
            }
            doc.text(xCoordTwo + valueOffset, yCoordTwo, item.Rank);
            doc.line(xCoordTwo, yCoordTwo + lineOffset, xCoordTwo + colWidth, yCoordTwo + lineOffset); // x1, y1, x2, y2 - horizontal line 
        }
    });


    //third column
    doc.setFontSize(fontSizeMedium);
    doc.setTextColor(45, 66, 117);
    var quoteNumber = (quote.QuoteId != undefined && quote.QuoteId > 0 ?
        quote.Customer.CustomerNumber + '-' + quote.QuoteId.toString() : '[Draft]');
    doc.text(xCoordThree, yCoordThree, 'Quote #: ' + quoteNumber);
    yCoordThree += yCoordOffset;
    doc.setFontSize(fontSizeNormal);
    doc.setTextColor(33, 35, 34);
    doc.text(xCoordThree, yCoordThree, 'Quote Date: ' + quote.QuoteDate); // date 

    doc.setFontSize(fontSizeMedium);
    doc.setTextColor(45, 66, 117);
    yCoordThree += yCoordOffset;
    //set alignment with second column Overview
    yCoordThree = yCoordOverview;
    doc.text(xCoordThree, yCoordThree, "Calendar");
    doc.setFontSize(fontSizeNormal);
    doc.setTextColor(33, 35, 34);
    yCoordThree += yCoordOffset;
    doc.text(xCoordThree, yCoordThree, 'Line Load'); // line load 
    doc.text(xCoordThree + valueOffset, yCoordThree, quote.ProductSelection.LineLoad + ' ' + quote.ProductSelection.LineLoadUOM); // line load  
    doc.line(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.text(xCoordThree, yCoordThree, 'Temperature');
    doc.text(xCoordThree + valueOffset, yCoordThree, quote.ProductSelection.Temperature + ' ' + quote.ProductSelection.TemperatureUOM); // temperature
    doc.line(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.text(xCoordThree, yCoordThree, 'Speed');
    doc.text(xCoordThree + valueOffset, yCoordThree, quote.ProductSelection.Speed + ' ' + quote.ProductSelection.SpeedUOM); // speed
    doc.line(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.text(xCoordThree, yCoordThree, 'Core Diameter');
    doc.text(xCoordThree + valueOffset, yCoordThree, quote.ProductSelection.CoreDiameter); // core diameter
    doc.line(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.text(xCoordThree, yCoordThree, 'Finish Diameter');
    doc.text(xCoordThree + valueOffset, yCoordThree, quote.ProductSelection.FinishDiameter); // finish diameter
    doc.line(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.text(xCoordThree, yCoordThree, 'Cover Length');
    doc.text(xCoordThree + valueOffset, yCoordThree, quote.ProductSelection.CoverLength); // cover length
    doc.line(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 

    //Benefit boxes, your selection
    //reset starting yCoord, yCoord2, yCoord3
    yCoordThree += yCoordOffset * 2;
    yCoord = yCoordThree;
    yCoordTwo = yCoordThree;

    //add your selection heading first
    doc.setFontSize(fontSizeMedium);
    doc.setTextColor(45, 66, 117);
    doc.text(xCoordThree, yCoordThree, 'Your Selection');
    doc.line(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.setFontSize(fontSizeNormal);

    //loop over items and pull out benefits and your selection for each app type
    $.each(quote.AppType, function (i, item) {

        var benefit = (item.Benefit == undefined || item.Benefit.length == 0 ? '' : item.Benefit);

        if (item.ShowInList) {
            var wrapTextBenefit = '';
            if (benefit != '') {
                wrapTextBenefit = doc.splitTextToSize('Benefit: ' + benefit, colWidth);
            }
            //col 1 or col 2 - odds in col one
            if (isOdd(i)) {
                doc.setTextColor(45, 66, 117);
                doc.text(xCoord, yCoord, item.Caption);
                doc.line(xCoord, yCoord + lineOffset, xCoord + colWidth, yCoord + lineOffset); // x1, y1, x2, y2 - horizontal line 
                yCoord += yCoordOffset;
                doc.setTextColor(33, 35, 34);
                doc.text(xCoord, yCoord, wrapTextBenefit);
                yCoord += yCoordOffset;
                yCoord += yCoordOffset;
                yCoord += yCoordOffset;
            }
            else {
                doc.setTextColor(45, 66, 117);
                doc.text(xCoordTwo, yCoordTwo, item.Caption);
                doc.line(xCoordTwo, yCoordTwo + lineOffset, xCoordTwo + colWidth, yCoordTwo + lineOffset); // x1, y1, x2, y2 - horizontal line 
                yCoordTwo += yCoordOffset;
                doc.setTextColor(33, 35, 34);
                doc.text(xCoordTwo, yCoordTwo, wrapTextBenefit);
                yCoordTwo += yCoordOffset;
                yCoordTwo += yCoordOffset;
                yCoordTwo += yCoordOffset;
            }
        }
        else //yes/no items
        {
            doc.setTextColor(45, 66, 117);
            doc.text(xCoordThree, yCoordThree, item.Caption);
            doc.text(xCoordThree + valueOffset, yCoordThree, (item.Rank == 0 ? 'No' : 'Yes'));
            doc.line(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 

            var wrapTextBenefit = '';
            if (benefit != '') {
                wrapTextBenefit = doc.splitTextToSize('Benefit: ' + benefit, colWidth);
                yCoordThree += yCoordOffset;
                doc.setTextColor(33, 35, 34);
                doc.text(xCoordThree, yCoordThree, wrapTextBenefit);
                yCoordThree += yCoordOffset;
                yCoordThree += yCoordOffset;
            }
            yCoordThree += yCoordOffset;
        }

    });

    return doc;
}

function isOdd(num) { return num % 2; }

//----------------------------------------------------------------------------------
//		Create a PDF doc using jsPDF
//----------------------------------------------------------------------------------
function generateQuotePDF(quote) {
    LogMessage(_moduleName_appPDFHelper + ": generateQuotePDF - start");

    var pdfFilePath = _pdfFilePath(quote);
    var doc = _buildPDFDoc(quote);
    savePDFToDisk(doc, pdfFilePath);
    openPDFInViewer(quote);

    LogMessage(_moduleName_appPDFHelper + ": generateQuotePDF - complete. FileName: " + pdfFilePath);
}

//----------------------------------------------------------------------------------
//		savePDFToDisk
//----------------------------------------------------------------------------------
function savePDFToDisk(doc, pdfFilePath) {
    //Save the PDF 
    LogMessage(_moduleName_appPDFHelper + ": savePDFToDisk - " + pdfFilePath);
    var pdfString = doc.output(undefined); //builds doc and returns pdf as string
    //this is pulled from jsPDF to generate an arrayBuffer which is converted into a Uint8Array
    var len = pdfString.length,
        ab = new ArrayBuffer(len), u8 = new Uint8Array(ab);
    while (len--) u8[len] = pdfString.charCodeAt(len);
    //now do a second conversion to take the Uint8Array and convert into bytearray which
    //can then be saved using Adobe Air methods
    var fromCharCode = String.fromCharCode;
    var pdfByteData = '';
    for (i = 0; i < pdfString.length; ++i) {
        pdfByteData += fromCharCode(u8[i]);
    }

    //troubleshooting
    //    if (_includeImages) {
    //        LogMessage(_moduleName_appPDFHelper + ": pdfString..................");
    //        LogMessage(pdfString);
    //        LogMessage(_moduleName_appPDFHelper + ": /pdfString..................");
    //    }

    //in AiR, save it one way, in dev use the download 
    if (IsEnvironmentAIR()) {
        //save bytes to file - documents directory
        var file = _AirGetFile(pdfFilePath);
        //    file.save(pdfString);  //saves as utf-8 encoded string - requires file to exist first or gives file not exist error
        fileStream = new air.FileStream();
        fileStream.open(file, air.FileMode.WRITE);
        fileStream.writeUTF(pdfString);
        //    fileStream.writeUTF(pdfByteData);
        //    fileStream.writeUTFBytes(pdfString);
        //    fileStream.writeMultiByte(pdfByteData, 'iso-8859-1');
        //    fileStream.writeMultiByte(pdfByteData, 'iso-8859-3');
        //    fileStream.writeMultiByte(pdfString, 'iso-8859-1');
        //try decoding base 64 string
        //    var pdfStringDecoded = base64ToByteArray(pdfString);
        //    fileStream.writeUTFBytes(pdfStringDecoded);
        fileStream.close();
    }
    else {
        //doc.save(pdfFilePath);
        //pg_SaveFile(doc, pdfFilePath);
        _pdfOutput = doc.output();
        //_pdfOutput = doc.output('blob');
        //convert to array for save to disk
        var buffer = new ArrayBuffer(_pdfOutput.length);
        var array = new Uint8Array(buffer);
        for (var i = 0; i < _pdfOutput.length; i++) {
            array[i] = _pdfOutput.charCodeAt(i);
        }
        //_pdfOutput = buffer;
//window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, yGotFS, onFileSystemError);

pdfWriteToFile(pdfFilePath, _pdfOutput, zOnWriteComplete);
//zWriteToFile(pdfFilePath, { foo: 'bar' }, zOnWriteComplete);
//getAndWriteFile(pdfFilePath, _pdfOutput);
//viewFile(pdfFilePath);
    }
}

function yGotFS(fileSystem) {
    console.log('fileSystem.root-Full Path:' + fileSystem.root.fullPath);
    fileSystem.root.getFile("scTest.pdf", { create: true, exclusive: true }, yGotFileEntry, onFileSystemError);
}

function yGotFileEntry(fileEntry) {
    console.log('fileEntry-Full Path:' + fileEntry.fullPath);
    fileEntry.createWriter(yGotFileWriter, onFileSystemError);
}

function yGotFileWriter(writer) {
    writer.onwriteend = function (e) {
        // for real-world usage, you might consider passing a success callback
        console.log('Write of file "' + 'sctest.pdf' + '"" completed.');
        //callBackFn(fileName);
        //zReadFromFile('sctest.pdf', null);
    };

    writer.write(_pdfOutput);
    //writer.write(doc.output());
}



function zOnWriteComplete(fileName)
{
    console.log('Write complete...');
    zReadFromFile(fileName, function (data) {
        console.log('read from file...' + data.toString());
        alert(data.toString());
    });
}

function localDataDirectory() {
    if (device.platform.toLowerCase() == 'android') {
        return cordova.file.externalDataDirectory;
    }
    else {
        return cordova.file.documentsDirectory;
    }
};

//function zWriteToFile(fileName, data, callBackFn) {
//    fileName = "sc-test.txt";
//    data = JSON.stringify(data, null, '\t');
//    window.resolveLocalFileSystemURL(localDataDirectory(), function (directoryEntry) {
//        console.log('directoryEntry-Full Path:' + directoryEntry.fullPath);
//        directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
//            fileEntry.createWriter(function (fileWriter) {
//                fileWriter.onwriteend = function (e) {
//                    // for real-world usage, you might consider passing a success callback
//                    console.log('fileEntry-Full Path:' + fileEntry.fullPath);
//                    console.log('Write-complete: ' + fileName);
//                    callBackFn(fileName);
//                };

//                fileWriter.onerror = function (e) {
//                    // you could hook this up with our global error handler, or pass in an error callback
//                    console.log('Write failed: ' + e.toString());
//                };

//                console.log('Write- start.');
//                var blob = new Blob([data], { type: 'text/plain' });
//                fileWriter.write(blob);
//            }, fileErrorHandler.bind(null, fileName));
//        }, fileErrorHandler.bind(null, fileName));
//    }, fileErrorHandler.bind(null, fileName));
//}

function pdfWriteToFile(fileName, data, callBackFn) {
    window.resolveLocalFileSystemURL(localDataDirectory(), function (directoryEntry) {
        console.log('directoryEntry-Full Path:' + directoryEntry.fullPath);
        directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (e) {
                    // for real-world usage, you might consider passing a success callback
                    console.log('fileEntry-Full Path:' + fileEntry.fullPath);
                    console.log('Write-complete: ' + fileName);
                    callBackFn(fileName);
                };

                fileWriter.onerror = function (e) {
                    // you could hook this up with our global error handler, or pass in an error callback
                    console.log('Write failed: ' + e.toString());
                };

                console.log('Write- start.');
                var blob = new Blob([data], { type: 'application/pdf' });
                fileWriter.write(blob);
            }, fileErrorHandler.bind(null, fileName));
        }, fileErrorHandler.bind(null, fileName));
    }, fileErrorHandler.bind(null, fileName));
}

function zReadFromFile(fileName, callBackFn) {
    var pathToFile = localDataDirectory() + fileName;
    console.log('read pathToFile: ' + pathToFile);
    openFile(pathToFile);
    return;
    window.resolveLocalFileSystemURL(pathToFile, function (fileEntry) {
        console.log('read fileEntry: ' + fileEntry.fullPath);
        fileEntry.file(function (file) {
            console.log('read file - size: ' + file.size);
            //window.open(file.toURL(), '_blank', 'location=no,closebuttoncaption=Close,enableViewportScale=yes');
            window.open(pathToFile, '_blank', 'location=no,closebuttoncaption=Close,enableViewportScale=yes');
            //window.plugins.fileOpener.open("file:///" + file.fullPath);
            //window.plugins.fileOpener.open("file:///sdcard/Android/data/---/www/static/sell/views/print.html");

            //var reader = new FileReader();
            //reader.onloadend = function (e) {
            //    console.log('on load end...');
            //    callBackFn(this.result);
            //    callBackFn(JSON.parse(this.result));
            //};

            //reader.readAsText(file);
        }, fileErrorHandler.bind(null, fileName));
    }, fileErrorHandler.bind(null, fileName));
}

function openFile(filePath)
{
    cordova.plugins.fileOpener2.open(
        filePath,
        'application/pdf',
        {
            error: function () { alert('Error opening file');},
            success: function () { alert('Success opening file'); }
        }
    );
}



var fileErrorHandler = function (fileName, e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'Storage quota exceeded';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'File not found';
            break;
        case FileError.SECURITY_ERR:
            msg = 'Security error';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'Invalid modification';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'Invalid state';
            break;
        default:
            msg = 'Unknown error';
            break;
    };

    console.log('Error (' + fileName + '): ' + msg);
}

/*Read/write sample*/
function getAndWriteFile(filename, contents)
{
    //window.requestFileSystem(type, size, successCallback, opt_errorCallback)
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
        console.log("file data directory..." + dir);
        dir.getFile(filename, { create: true }, function (file) {
            console.log("file name..." + file);
            if (file == null) return;
            file.createWriter(function (fileWriter) {

                fileWriter.seek(fileWriter.length);

                var blob = new Blob("my test file contents", { type: 'text/plain' });
                fileWriter.write(blob);
                fileWriter.write(contents);
                alert("ok, in theory i worked");
            }, onCreateWriterFail);
        });
    });
}

function onCreateWriterFail(evt)
{
    console.log("Error...:" + evt);
}

////////////Get the Root Directory and open in in app browser a json file///////
function viewFile(filename) {
    window.requestFileSystem(4, 0, function (fs) {
        console.log("dataDirectory = " + cordova.file.dataDirectory);
        //alert("root = " + fs.root.toURL());
        fs.root.getFile(filename, { create: false, exclusive: true });
        window.open(cordova.file.dataDirectory + '/' + filename , '_blank', 'location=yes');
    }, function () {
        alert("failed to get file system");
    });

}


/*End - Read/write sample*/




var _pdfFileName = null;
var _pdfOutput = null;

function pg_SaveFile(doc, pdfFilePath)
{
	_pdfFileName = pdfFilePath;
	console.log("PDF to save: " + _pdfFileName);
	
	//NEXT SAVE IT TO THE DEVICE'S LOCAL FILE SYSTEM
	console.log("file system...");
	_pdfOutput = doc.output();
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, onFileSystemError);
/*
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
	 
	   console.log("fileSystem.name: " + fileSystem.name);
	   console.log("fileSystem.root.name: " + fileSystem.root.name);
	   console.log("fileSystem.root.fullPath: " + fileSystem.root.fullPath);
	 
	   fileSystem.root.getFile(pdfFilePath, {create: true}, function(entry) {
		  var fileEntry = entry;
		  console.log("Entry: " + entry);
	 
		  entry.createWriter(function(writer) {
			 writer.onwrite = function(evt) {
			 console.log("write success");
			 alert ("write complete");
			 pg_OpenInViewer(_pdfFileName);
		  };
	 
		  console.log("writing to file");
			 writer.write( pdfOutput );
		  }, function(error) {
			 console.log(error);
		  });
	 
	   }, function(error){
		  console.log(error);
	   });
	},
	function(event){
	 console.log( evt.target.error.code );
	});
}
*/
}

function gotFS(fileSystem) {
	fileSystem.root.getFile(_pdfFileName, {create: true, exclusive: false}, gotFileEntry, onFileSystemError);
}

function gotFileEntry(fileEntry) {
    fileEntry.createWriter(gotFileWriter, onFileSystemError);
}

function gotFileWriter(writer) {
    writer.onwriteend = function(evt) {
        console.log("contents of file now 'some sample text'");
        writer.truncate(11);  
        writer.onwriteend = function(evt) {
            console.log("contents of file now 'some sample'");
            writer.seek(4);
            writer.write(" different text");
            writer.onwriteend = function(evt){
                console.log("contents of file now 'some different text'");
            }
        };
    };
    writer.write("some sample text");
}
	

    function pg_OpenInViewer (pdfFilePath)
    {
        _pdfFileName = pdfFilePath;
        console.log("PDF to save: " + _pdfFileName);
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onGotFileSystem, onFileSystemError);
    }

    function onGotFileSystem(fileSystem) {
        fileSystem.root.getFile(_pdfFileName, null, onGotFileEntry, onFileSystemError);
    }

    function onGotFileEntry(fileEntry) {
        fileEntry.file(onGotFile, onFileSystemError);
    }

    function onGotFile(file){
        readDataUrl(file);
    }

    function readDataUrl(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            console.log("Read as data URL");
            console.log(evt.target.result);
        };
        reader.readAsDataURL(file);
    }	

    function onFileSystemError(evt) {
        console.log("on File System Error: " + evt.target.error.code);
    }


    //----------------------------------------------------------------------------------
    //		openPDFInViewer
    //----------------------------------------------------------------------------------
    function openPDFInViewer(quote) {

        //    var pdfFilePath = _pdfFilePath(quote);
        //	Quote_Update(quote);
        //	quoteView_load();
        //	var htmlData = $('#quote-wrapper').html();
        //	window.html2pdf.create(
        //		"<html><head></head><body>" + htmlData + "</body></html>",
        //		"~/Documents/voith/modular-composite/" + pdfFilePath, // on iOS,
        //		// "test.pdf", on Android (will be stored in /mnt/sdcard/at.modalog.cordova.plugin.html2pdf/test.pdf)
        //		onCreatePDF_Success,
        //		onCreatePDF_Error
        //	);

        //     pdf.htmlToPDF({
        //            data: "<html><head></head><body>" + htmlData + "</body></html>",
        //            documentSize: "A4",
        //            landscape: "portrait",
        //            type: "base64"
        //       }, onCreatePDF_Success, onCreatePDF_Error);
        //return;

        var pdfFilePath = _pdfFilePath(quote);

        LogMessage(_moduleName_appPDFHelper + ": openPDFInViewer - " + pdfFilePath);

        //generate the PDF file first
        var doc = _buildPDFDoc(quote);
        //save
        savePDFToDisk(doc, pdfFilePath);
    }

    function onCreatePDF_Success ()
    {
        ShowMessage('Generate PDF', 'The PDF was saved', 'info', null);
    }

    function onCreatePDF_Error ()
    {
        ShowMessage('Generate PDF', 'An error occurred generating the PDF', 'error', null);
    }