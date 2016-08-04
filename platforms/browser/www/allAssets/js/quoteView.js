var _moduleName_quoteView = "quoteView.js";

// JavaScript Document
var _jsonQuoteData = [];

//----------------------------------------------------------------------------------
//		Product Selection Screen
//----------------------------------------------------------------------------------
function quoteView() {
    "use strict";
    LogMessage(_moduleName_quoteView + ": init");
}

//----------------------------------------------------------------------------------
//		Init page - called from page submit or quote history
//----------------------------------------------------------------------------------
function quoteView_load() {
    LogMessage(_moduleName_quoteView + ": page load");
    //load quote info ui
    LoadQuoteInfoUI(_jsonQuoteData);
    //load product info section
    LoadProductInfoUI(_jsonQuoteData.Product);
    //load quote info ui
    LoadLayeredImage(_jsonQuoteData.Product);
    //load overview section
    LoadApplicationTypeUI(_jsonQuoteData.Product);
    //load customer section
    LoadCustomerUI(_jsonQuoteData.Customer);
    //load calendar, product info section
    LoadProductSelectionUI(_jsonQuoteData.ProductSelection);
}

//----------------------------------------------------------------------------------
//		Load overview section - load overview section by looping through app types and 
//			displaying rank as icons
//		Load benefit - load by looping through app types 
//----------------------------------------------------------------------------------
function LoadApplicationTypeUI(jsonSelectedProduct) {
    var htmlOverview = '';
    var htmlBenefit = '';
    var htmlBenefitYesNo = '';
    $.each(jsonSelectedProduct.AppType, function (i, item) {
        if (item.ShowInList) {
            //overview
            htmlOverview += '<li>' + item.Caption;
            htmlOverview += LoadOverviewIcons(item);
            htmlOverview += '</li>';

            //benefit
            htmlBenefit += LoadBenefitHTML(item);
        }
        else {
            //benefit yes/no
            htmlBenefitYesNo += LoadYourSelectionUI(item);
        }
    });
    var ulOverview = $('ul.list-overview.quote-overview');
    ulOverview.html('');
    ulOverview.html(htmlOverview);

    //benefit section
    var divBenefitContainer = $('.container-quoteview-benefit');
    divBenefitContainer.html('');
    divBenefitContainer.html(htmlBenefit);

    //benefit yes/no section
    var divBenefitContainerYesNo = $('.container-quoteview-benefit-yes-no');
    divBenefitContainerYesNo.html('');
    htmlBenefitYesNo = '<span class="section-heading" >Your Selection</span>' + htmlBenefitYesNo;
    divBenefitContainerYesNo.html(htmlBenefitYesNo);

}

//----------------------------------------------------------------------------------
//		Load overview icons - dynamically show icons based on rank value
//----------------------------------------------------------------------------------
function LoadOverviewIcons(item) {
    var result = '<div class="icons">';
    var htmlIcon = '<img src="%%iconName%%" class="image%%InComplete%%" alt="" />';
    htmlIcon = htmlIcon.replace('%%iconName%%', item.IconName_Blue);
    htmlIcon = htmlIcon.replace('001.png', '001_25.png');
    htmlIcon = htmlIcon.replace('002.png', '002_25.png');
    //show rank next to single icon
    var incompleteCSS = (item.Rank > 0 ? '' : ' incomplete');
    result += htmlIcon.replace('%%InComplete%%', incompleteCSS) + '&nbsp;' + item.Rank.toString();
    result += '</div><div class="clear"></div>'
    return result;
}

//----------------------------------------------------------------------------------
//		Load quote data
//----------------------------------------------------------------------------------
function LoadQuoteInfoUI(jsonQuote) {
    $('#quote-number').html('Quote #: ' + (jsonQuote.QuoteId != undefined && jsonQuote.QuoteId > 0 ? 
        jsonQuote.Customer.CustomerNumber + '-' + jsonQuote.QuoteId.toString() : '[DRAFT]'));
    $('#quote-date').html('Date: ' + jsonQuote.QuoteDate);
}

//----------------------------------------------------------------------------------
//		Load prod data
//----------------------------------------------------------------------------------
function LoadProductInfoUI(jsonProduct) {
    $('#quote-product-name').html(jsonProduct.ProductName);
    $('#quote-product-detail').html('');  //TBD on this field
    //TBD - product image
}

//----------------------------------------------------------------------------------
//		Load cust data
//----------------------------------------------------------------------------------
function LoadCustomerUI(jsonCust) {
    var resultsHTML = jsonCust.MachineNumber + ' / ' +
					  jsonCust.SectionName + ' / ' +
					  jsonCust.ApplicationName + ' / ' +
					  jsonCust.PaperGrade;
    $('#quote-customer-name').html(jsonCust.Name);
    $('#quote-customer-info').html(resultsHTML);
}

//----------------------------------------------------------------------------------
//		Load cust data
//----------------------------------------------------------------------------------
function LoadProductSelectionUI(jsonProductSelection) {
    $('#quote-line-load').html(jsonProductSelection.LineLoad + ' ' + jsonProductSelection.LineLoadUOM);
    $('#quote-temperature').html(jsonProductSelection.Temperature + ' ' + jsonProductSelection.TemperatureUOM);
    $('#quote-speed').html(jsonProductSelection.Speed + ' ' + jsonProductSelection.SpeedUOM);
    $('#quote-core-diameter').html(jsonProductSelection.CoreDiameter + ' ' + jsonProductSelection.CoreDiameterUOM);
    $('#quote-finish-diameter').html(jsonProductSelection.FinishDiameter + ' ' + jsonProductSelection.FinishDiameterUOM);
    $('#quote-cover-length').html(jsonProductSelection.CoverLength + ' ' + jsonProductSelection.CoverLengthUOM);
}

//----------------------------------------------------------------------------------
//		Load benefit html - dynamically show icons based on rank value, app type
//----------------------------------------------------------------------------------
function LoadBenefitHTML(item) {
    var result = '<div class="quoteview-benefit-panel" data-appTypeId="%%AppTypeId%%" >' +
			'<span class="section-heading" >%%Caption%%</span>' +
            '<p class="section-body">%%Benefit%%</p>' +
            '</div>';
    result = result.replace(/%%Caption%%/gi, item.Caption);
    result = result.replace(/%%AppTypeId%%/gi, item.AppTypeId);
    result = result.replace(/%%Benefit%%/gi,
				(item.Benefit != undefined && item.Benefit.length > 0 ? "Benefit<br />" + item.Benefit : ""));
    return result;
}

//----------------------------------------------------------------------------------
//		Load benefit yes/no html
//----------------------------------------------------------------------------------
function LoadYourSelectionUI(item) {
    var result = '<div class="quoteview-benefit-panel" data-appTypeId="%%AppTypeId%%" >' +
			'<span class="icon-%%YESNO%%"></span>' +
            '<p class="section-body"><strong>%%Caption%%:</strong> %%Benefit%%</p>' +
            '</div>';
    result = result.replace(/%%Caption%%/gi, item.Caption);
    result = result.replace(/%%AppTypeId%%/gi, item.AppTypeId);
    result = result.replace(/%%Benefit%%/gi,
				(item.Benefit != undefined && item.Benefit.length > 0 ? item.Benefit : ""));
    result = result.replace(/%%YESNO%%/gi,
				(item.Rank != undefined && item.Rank > 0 ? "yes" : "no"));
    return result;
}

//----------------------------------------------------------------------------------
//		Based on the user selections, load and show a layer of images
//			appTypeId = null on load of page
//----------------------------------------------------------------------------------
function LoadLayeredImage(product) {
    $('#quote-product-image-container').html(Utility_LoadLayeredImageByProduct(product));
}

//----------------------------------------------------------------------------------
//		Init a jsonObject that contains the basic quote information
//		Eventually, some of this data could be pulled in from an external source
//----------------------------------------------------------------------------------
function Quote_Init() {

    $("input#hfQuoteCurrent").val('');
    _jsonQuoteData = {};
    _jsonQuoteData.QuoteId = -1; //keep at -1 till db auto generates
    _jsonQuoteData.QuoteDate = (new Date()).toLocaleDateString();
    _jsonQuoteData.PDFFileName = Date.now().toString() + '.pdf';
    _jsonQuoteData.OriginalQuoteId = null;
    _jsonQuoteData.OriginalQuoteCaption = null;
    var customer = {};
    customer.CustomerId = null;
    customer.CustomerNumber = '';
    customer.CreateDate = '';
    customer.IsLocal = false;
    customer.Name = '';
    customer.Address = '';
    customer.City = '';
    customer.State = '';
    customer.Zip = '';
    customer.Country = '';
    customer.MachineNumber = '';
    customer.SectionName = '';
    customer.SectionCode = '';
    customer.ApplicationName = '';
    customer.ApplicationCode = '';
    customer.PaperGrade = '';
    /*
                    '{"CustomerId":"","CustomerNumber":"","Name":"",'
					+ '"Address":"","City":"","State":"", "Zip":"", "Country":"",'
					+ '"MachineNumber":"","SectionCode":"","SectionName":"",'
					+ '"ApplicationCode":"","ApplicationName":"", "PaperGrade":"", '
					+ '"IsLocal":""}';
    */
    _jsonQuoteData.Customer = customer;

    //page 1 js - data
    var productSelection = {};
    productSelection.CoreDiameter = null;
    productSelection.FinishDiameter = null;
    productSelection.CoverLength = null;
    productSelection.ProductName = null;
    productSelection.Temperature = null;
    productSelection.Speed = null;
    productSelection.LineLoadUOM = 'kN/m';
    productSelection.TemperatureUOM = 'c';
    productSelection.SpeedUOM = 'm/min';
    productSelection.CoreDiameterUOM = '';
    productSelection.FinishDiameterUOM = '';
    productSelection.CoverLengthUOM = '';
    _jsonQuoteData.ProductSelection = productSelection;

    //application type data - prod selection screen
    _jsonQuoteData.Product = {};
    _jsonQuoteData.AppType = [];
    var appTypes = AppType_Get();
    $.each(appTypes, function (i, item) {
        var appType = {};
        appType.AppTypeId = item.AppTypeId;
        appType.AppTypeId_FK = item.AppTypeId_FK;
        appType.Sequence = item.Sequence;
        appType.Caption = item.Caption;
        appType.ShowInList = item.ShowInList;
        appType.Rank = null;
        appType.OriginalRank = null;  //used for copy scenario
        appType.Benefit = '';
        appType.LayeredImageNamingConvention = item.LayeredImageNamingConvention;
        appType.LayeredImageZIndex = item.LayeredImageZIndex;
        _jsonQuoteData.AppType.push(appType);
    });
    $("input#hfQuoteCurrent").val(JSON.stringify(_jsonQuoteData));
    return _jsonQuoteData;
}

//----------------------------------------------------------------------------------
//		pull selected Rank from hidden field and parse json into object
//----------------------------------------------------------------------------------
function Quote_Get() {
    if (_jsonQuoteData == undefined ||
		_jsonQuoteData.AppType == undefined ||
		_jsonQuoteData.AppType.length == 0) {
        Quote_Init();
    }
    return _jsonQuoteData;
}

//----------------------------------------------------------------------------------
//		Update the data in the json obj and the hidden field
//----------------------------------------------------------------------------------
function Quote_Update(data) {
    if (data == undefined) {
        $("input#hfQuoteCurrent").val('');
        _jsonQuoteData = [];
    }
    else {
        _jsonQuoteData = data;
        $("input#hfQuoteCurrent").val(JSON.stringify(data));
    }
}




