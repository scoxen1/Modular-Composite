//documentation reference for alivePDF - http://alivepdf.bytearray.org/alivepdf-asdoc/org/alivepdf/pdf/PDF.html
var _moduleName_appPDFAliveHelper = 'app-pdf-alive.js'

//----------------------------------------------------------------------------------
//		PDF Generation functionality
//----------------------------------------------------------------------------------
function appPDFAliveHelper() {
    "use strict";
    LogMessage(_moduleName_appPDFHelper + ": init");

}


//----------------------------------------------------------------------------------
//		_buildPDFDoc - build doc using alive PDF
//----------------------------------------------------------------------------------
function _buildPDFDocAlive(quote)
{
    LogMessage(_moduleName_appPDFHelper + ": _buildPDFDoc - start");

    var marginWidth = 10;
    var yCoordOffset = 8;
    var yCoordWrapOffset = 4;
    var yHeaderOffset = 12;

    var colOffset = 90;
    var xCoord = marginWidth + 2;
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

    //init PDF library
    var PDF = new $(document).pdf();

    //init base font
    var baseFont = new PDF.Fonts.CoreFont(PDF.Fonts.FontFamily.ARIAL);
    var blackColor = new PDF.RGBColor(0x212322);
    var whiteColor = new PDF.RGBColor(0xFFFFFF);
    var blueColor = new PDF.RGBColor(0x2D4275); //PDF.RGBColor(0x2D4275);

    //Set some initial values on the PDF itself
    var doc = PDF.newDocument(PDF.Orientation.LANDSCAPE, PDF.Unit.MM, PDF.Size.A4).Document;
    doc.setDisplayMode(PDF.Display.FULL_WIDTH); //set to show full screen zoom
    doc.setAuthor("Voith");
    doc.setCreator("Modular Composite - AIR Application");
    //create first page
    doc.addPage();
    doc.setMargins(marginWidth, marginWidth/2, marginWidth, marginWidth);  //left,top,right,bottom

    //lets keep height of the page for further use
    //var pageH = doc.getPage(1).h;
    var rightEdge = doc.getPage(1).w - marginWidth;

    //Layered Image
    //TBD - alignment is off for some reason, 
    //it also has white space at top, to get the layout to work well, draw image first and then add in header, prod name 
    // so that the image is behind this other stuff
    //TEMP
    //generate a layered image on a canvas and save to disk or bytes
    //var prodImageFilePath = _AirGetFilePathApplication(_ImagePathProductLayers + "_ProductImageTest.jpg");
    //var prodImageFilePath = Utility_GenerateLayeredImageToDisk_AIR(quote);
    //prodImageFilePath = _AirGetFilePathApplicationStorage(prodImageFilePath);
    //var prodImageBytes = PDF.imageAsBytes(prodImageFilePath);
    var prodImageBytes = Utility_GenerateLayeredImageAsBytes(quote);
    doc.addImageStream(
        prodImageBytes,
        PDF.ColorSpace.DEVICE_RGB,
        new PDF.Resize("none", "left"),
        xCoord - 33, yCoord - 20, 100, 100 //original size is 560x560, canvas is 200x200
    );

    //header
    //position header above the first row of content
    doc.setFontSize(fontSizeLarge);
    doc.textStyle(blueColor); 
    doc.addText('Modular Composite - Quote',xCoordTwo, yCoord - yHeaderOffset);
    //line to separate header
    PDF.drawLine(marginWidth, yCoord - yHeaderOffset + lineOffset, rightEdge, yCoord - yHeaderOffset + lineOffset); // x1, y1, x2, y2 - horizontal line 

    //Embed Logo
    //public function addImageStream(imageBytes:ByteArray, colorSpace:String, resizeMode:Resize = null, x:Number = 0, y:Number = 0, width:Number = 0, height:Number = 0, rotation:Number = 0, alpha:Number = 1, blendMode:String = Normal, link:ILink = null):void
    doc.addImageStream(
        PDF.imageAsBytes(_AirGetFilePathApplication('allAssets/img/voith.png')),
        PDF.ColorSpace.DEVICE_RGB,
        null, 
        (rightEdge - 10 - 131 * .35), -2, (131 * .35), (35 * .35)  //original size is 131x35
    );

    //first column
    //put the prod name after the image so it lays on top of the image
    doc.setFontSize(fontSizeLarge);
    doc.textStyle(blueColor); 
    doc.addText(quote.Product.ProductName, xCoord, yCoord ); //product name
    yCoord += yCoordOffset;

    //2nd Column
    doc.setFontSize(fontSizeMedium);
    doc.textStyle(blueColor);
    var wrapTextCustomerName = SplitTextToLines(quote.Customer.Name, fontSizeMedium, colWidth);
    $.each(wrapTextCustomerName, function (i, item) {
        doc.addText(item, xCoordTwo, yCoordTwo);
        yCoordTwo += yCoordOffset;
    });

    //customer info
    doc.setFontSize(fontSizeNormal);
    doc.textStyle(blackColor);
    var wrapTextCustomerInfo = $.trim(quote.Customer.MachineNumber) + ' / ' +
					  $.trim(quote.Customer.SectionName) + ' / ' +
					  $.trim(quote.Customer.ApplicationName) + ' / ' +
					  $.trim(quote.Customer.PaperGrade);
    //new customer causes weird paragraph splits
    if (quote.Customer.IsLocal) {
        wrapTextCustomerInfo = wrapTextCustomerInfo.replace(/(\r\n|\n|\r)/gm, "");
        wrapTextCustomerInfo = wrapTextCustomerInfo.replace(/\t/gm, " ");
    }
    var wrapTextCustomerInfo = SplitTextToLines(wrapTextCustomerInfo, fontSizeNormal, colWidth);
    var yCoordWrapText = yCoordTwo;  //use this to set different line height for wrapped text
    $.each(wrapTextCustomerInfo, function (i, item) {
        doc.addText(item, xCoordTwo, yCoordWrapText);
        yCoordWrapText += yCoordWrapOffset;
    });
    //allot two lines for customer info so Overview does not wrap into it
    yCoordTwo += yCoordOffset;
    yCoordTwo += yCoordOffset;

    doc.setFontSize(fontSizeMedium);
    doc.textStyle(blueColor); 
    var yCoordOverview = yCoordTwo;  //use this downstream to align Overview and Calendar headings
    doc.addText("Overview", xCoordTwo, yCoordTwo);
    doc.setFontSize(fontSizeNormal);
    doc.textStyle(blackColor); 

    $.each(quote.Product.AppType, function (i, item) {
        if (item.ShowInList) {
            yCoordTwo += yCoordOffset;
            doc.addText(item.Caption, xCoordTwo, yCoordTwo);
            doc.addImageStream(
                PDF.imageAsBytes(_AirGetFilePathApplication(item.IconName_Blue.replace(".png", ".jpg"))),  //have a set of non-transparent jpgs for this pdf generation
                PDF.ColorSpace.DEVICE_RGB,
                null,
                xCoordTwo + valueOffset-18, yCoordTwo - 9, 5, 5
            );
            doc.addText(item.Rank, xCoordTwo + valueOffset, yCoordTwo);
            //line to separate items
            PDF.drawLine(xCoordTwo, yCoordTwo + lineOffset, xCoordTwo + colWidth, yCoordTwo + lineOffset); // x1, y1, x2, y2 - horizontal line 
        }
    });

    //third column
    doc.setFontSize(fontSizeMedium);
    doc.textStyle(blueColor); 
    var quoteNumber = (quote.QuoteId != undefined && quote.QuoteId > 0 ?
        quote.Customer.CustomerNumber + '-' + quote.QuoteId.toString() : '[Draft]');
    doc.addText('Quote #: ' + quoteNumber, xCoordThree, yCoordThree);
    yCoordThree += yCoordOffset;
    doc.setFontSize(fontSizeNormal);
    doc.textStyle(blackColor); 
    doc.addText('Quote Date: ' + quote.QuoteDate, xCoordThree, yCoordThree); // date 

    doc.setFontSize(fontSizeMedium);
    doc.textStyle(blueColor); 
    //set alignment with second column Overview
    yCoordThree = yCoordOverview;
    doc.addText("Calendar", xCoordThree, yCoordThree);
    doc.setFontSize(fontSizeNormal);
    doc.textStyle(blackColor); 
    yCoordThree += yCoordOffset;
    doc.addText('Line Load', xCoordThree, yCoordThree); // line load 
    doc.addText(quote.ProductSelection.LineLoad + ' ' + quote.ProductSelection.LineLoadUOM, xCoordThree + valueOffset, yCoordThree); // line load  
    PDF.drawLine(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.addText('Temperature', xCoordThree, yCoordThree);
    doc.addText(quote.ProductSelection.Temperature + ' ' + quote.ProductSelection.TemperatureUOM, xCoordThree + valueOffset, yCoordThree); // temperature
    PDF.drawLine(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.addText('Speed', xCoordThree, yCoordThree);
    doc.addText(quote.ProductSelection.Speed + ' ' + quote.ProductSelection.SpeedUOM, xCoordThree + valueOffset, yCoordThree); // speed
    PDF.drawLine(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.addText('Core Diameter', xCoordThree, yCoordThree);
    doc.addText(quote.ProductSelection.CoreDiameter, xCoordThree + valueOffset, yCoordThree); // core diameter
    PDF.drawLine(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.addText('Finish Diameter', xCoordThree, yCoordThree);
    doc.addText(quote.ProductSelection.FinishDiameter, xCoordThree + valueOffset, yCoordThree); // finish diameter
    PDF.drawLine(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.addText('Cover Length', xCoordThree, yCoordThree);
    doc.addText(quote.ProductSelection.CoverLength, xCoordThree + valueOffset, yCoordThree); // cover length
    PDF.drawLine(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 

    //Benefit boxes, your selection
    //reset starting yCoord, yCoord2, yCoord3
    yCoordThree += yCoordOffset * 2;
    yCoord = yCoordThree;
    yCoordTwo = yCoordThree;

    //add your selection heading first
    doc.setFontSize(fontSizeMedium);
    doc.textStyle(blueColor); 
    doc.addText('Your Selection', xCoordThree, yCoordThree);
    PDF.drawLine(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 
    yCoordThree += yCoordOffset;
    doc.setFontSize(fontSizeNormal);

    //loop over items and pull out benefits and your selection for each app type
    $.each(quote.AppType, function (i, item) {

        var benefit = (item.Benefit == undefined || item.Benefit.length == 0 ? '' : item.Benefit);

        if (item.ShowInList) {
            var wrapTextBenefit = '';
            if (benefit != '') {
                wrapTextBenefit = SplitTextToLines('Benefit: ' + benefit, fontSizeNormal, colWidth);
            }
            //col 1 or col 2 - odds in col one
            if (isOdd(i)) {
                doc.textStyle(blueColor); 
                doc.addText(item.Caption, xCoord, yCoord);
                PDF.drawLine(xCoord, yCoord + lineOffset, xCoord + colWidth, yCoord + lineOffset); // x1, y1, x2, y2 - horizontal line 
                yCoord += yCoordOffset;
                doc.textStyle(blackColor); 
                yCoordWrapText = yCoord;
                $.each(wrapTextBenefit, function (i, item) {
                    doc.addText(item, xCoord, yCoordWrapText);
                    yCoordWrapText += yCoordWrapOffset;
                });
                //increment the lines 3 times for consistent layout
                yCoord += yCoordOffset;
                yCoord += yCoordOffset;
                yCoord += yCoordOffset;
            }
            else {
                doc.textStyle(blueColor); 
                doc.addText(item.Caption, xCoordTwo, yCoordTwo);
                PDF.drawLine(xCoordTwo, yCoordTwo + lineOffset, xCoordTwo + colWidth, yCoordTwo + lineOffset); // x1, y1, x2, y2 - horizontal line 
                yCoordTwo += yCoordOffset;
                doc.textStyle(blackColor); 
                yCoordWrapText = yCoordTwo;
                $.each(wrapTextBenefit, function (i, item) {
                    doc.addText(item, xCoordTwo, yCoordWrapText);
                    yCoordWrapText += yCoordWrapOffset;
                });
                //increment the lines 3 times for consistent layout
                yCoordTwo += yCoordOffset;
                yCoordTwo += yCoordOffset;
                yCoordTwo += yCoordOffset;
            }
        }
        else //yes/no items
        {
            doc.textStyle(blueColor); 
            doc.addText(item.Caption, xCoordThree, yCoordThree);
            doc.addText((item.Rank == 0 ? 'No' : 'Yes'), xCoordThree + valueOffset, yCoordThree);
            PDF.drawLine(xCoordThree, yCoordThree + lineOffset, xCoordThree + colWidth, yCoordThree + lineOffset); // x1, y1, x2, y2 - horizontal line 

            var wrapTextBenefit = '';
            if (benefit != '') {
                wrapTextBenefit = SplitTextToLines('Benefit: ' + benefit, fontSizeNormal, colWidth);
                yCoordThree += yCoordOffset;
                doc.textStyle(blackColor); 
                yCoordWrapText = yCoordThree;
                $.each(wrapTextBenefit, function (i, item) {
                    doc.addText(item, xCoordThree, yCoordWrapText);
                    yCoordWrapText += yCoordWrapOffset;
                });
                //after last benefit, then make col3 position equal to last increment
                yCoordWrapText += yCoordWrapOffset;
                yCoordThree = yCoordWrapText;
            }
            else
            {
                yCoordThree += yCoordOffset;
            }
        }

    });

    return PDF;

}

//----------------------------------------------------------------------------------
//		Create a PDF doc using PDF Alive
//----------------------------------------------------------------------------------
function generateQuotePDFAlive(quote) {
    LogMessage(_moduleName_appPDFAliveHelper + ": generateQuotePDFAlive - start");

    var pdfFilePath = _pdfFilePath(quote);
    var pdf = _buildPDFDocAlive(quote);
    savePDFAliveToDisk(pdf, pdfFilePath);
    openPDFAliveInViewer(quote);
    LogMessage(_moduleName_appPDFAliveHelper + ": generateQuotePDFAlive - complete. FileName: " + pdfFilePath);
}

//----------------------------------------------------------------------------------
//		openPDFAliveInViewer
//----------------------------------------------------------------------------------
function openPDFAliveInViewer(quote) {
    //temp - always generate pdf while developing solution
    var pdfFilePath = _pdfFilePath(quote);

    LogMessage(_moduleName_appPDFAliveHelper + ": openPDFAliveInViewer - " + pdfFilePath);

    //open with default application
//    var file = _AirGetFile(pdfFilePath);
//    if (!file.exists) {
//    LogMessage(_moduleName_appPDFAliveHelper + ": openPDFAliveInViewer - file does not exist");
        //generate the PDF file first
        var pdf = _buildPDFDocAlive(quote);
        //save
        savePDFAliveToDisk(pdf, pdfFilePath);
//    }
    //open in PDF viewer
    var file = _AirGetFile(pdfFilePath);
    file.openWithDefaultApplication();
}

//----------------------------------------------------------------------------------
//		savePDFToDisk
//----------------------------------------------------------------------------------
function savePDFAliveToDisk(pdf, pdfFilePath) {
    //Save the PDF
    var path = _AirGetFilePathApplicationStorage(pdfFilePath);
    LogMessage(_moduleName_appPDFAliveHelper + ": savePDFAliveToDisk - " + path);
    pdf.save(path);
}


//----------------------------------------------------------------------------------
//		Helper - call jsPDF plugin to do this. They already built it so use their stuff
//          Split text into lines so that we can wrap long text
//----------------------------------------------------------------------------------
function SplitTextToLines(val, fontSize, colWidth)
{
    var doc = new jsPDF('landscape');
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(val, colWidth);
}

//----------------------------------------------------------------------------------
//		Helper to get application path
//----------------------------------------------------------------------------------
function _AirGetFilePathApplication(relativeFilePath)
{
    return air.File.applicationDirectory.resolvePath(relativeFilePath);
}

//----------------------------------------------------------------------------------
//		Helper to get application storage path
//----------------------------------------------------------------------------------
function _AirGetFilePathApplicationStorage(relativeFilePath) {
    return air.File.applicationStorageDirectory.resolvePath(relativeFilePath);
}
