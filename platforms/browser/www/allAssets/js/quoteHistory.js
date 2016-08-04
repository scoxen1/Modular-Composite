var _moduleName_quoteHistory = "quoteHistory.js";
var _pageName_quoteHistory = "Quote History";

/*
        try {
        }
        catch (error) {
            ShowMessage(_pageName_quoteHistory, 'Error: ' + error.message, 'error', $(this));
            LogMessage(_moduleName_quoteHistory + ": icon_quote_pdf - Error: " + error.message + '...Details: ' + error.details);
        }
*/


// JavaScript Document
var _jsonQuoteHistoryData = [];
var _noMatchMessage = 'There are no quotes saved in the system.';


$(function () {
    //----------------------------------------------------------------------------------
    //		Show quote PDF from history screen 
    //----------------------------------------------------------------------------------
    $(document).on('tap click', '.icon_quote_pdf', function () {
    //$(".icon_quote_pdf").on("tap click", function () {
        try {
            LogMessage(_moduleName_quoteHistory + ": icon_quote_pdf");
            //TBD - this should open a quote PDF from local storage...
            //get quote number, find quote json object, set to current quote
            var quote = FindQuote($(this).attr('data-quote-id'));
            if (quote == undefined) return false;

            //open the quote in a PDF viewer. if quote pdf not there, then this will generate it first
            //in AiR, save it one way, in dev use the download 
            if (IsEnvironmentAIR()) {
                openPDFAliveInViewer(quote);
            }
            else {
                openPDFInViewer(quote);
            }
            return false;
        }
        catch (error) {
            ShowMessage(_pageName_quoteHistory, error.message, 'error', $(this));
            LogMessage(_moduleName_quoteHistory + ": icon_quote_pdf: " + error.message + '...Details: ' + error.details);
        }
    });

    //----------------------------------------------------------------------------------
    //		Create a new quote based on existing quote
    //----------------------------------------------------------------------------------
    $(document).on('tap click', '.quote-save-as', function () {
    //$(".quote-save-as").on("tap", function () {
        try {
            LogMessage(_moduleName_quoteHistory + ": quote-save-as");
            //get quote number, nav to page 1 with customer set and data pre-populated
            var quote = FindQuote($(this).attr('data-quote-id'));
            if (quote == undefined) return false;
            //make a copy first
            var newQuote = $.parseJSON(JSON.stringify(quote));
            //copy some data into original fields so we can preserve these and use downstream
            newQuote.OriginalQuoteId = quote.QuoteId;
            newQuote.OriginalQuoteCaption = quote.Customer.CustomerNumber + '-' + quote.QuoteId.toString();
            newQuote.ProductSelection.ProductName = quote.Product.ProductName;
            newQuote.ProductSelection.ProductImage = quote.Product.ProductImage;
            newQuote.QuoteId = -1;
            newQuote.PDFFileName = Date.now().toString() + '.pdf';
            newQuote.QuoteDate = (new Date()).toLocaleDateString();
            $.each(newQuote.AppType, function (i, item) {
                item.OriginalRank = item.Rank;
                item.Rank = null;
                item.Benefit = '';
            });
            Quote_Update(newQuote);

            //nav to page 1
            $(".app-page").hide();
            $("div.email-pdf").show();
            $("#page1").show();
            _currentPageId = 'page1';
            machineSpecSelection_loadFromCopy(newQuote);  //this will pre-populate the data on the screen
            return false;
        }
        catch (error) {
            ShowMessage(_pageName_quoteHistory, error.message, 'error', $(this));
            LogMessage(_moduleName_quoteHistory + ": quote_save_as: " + error.message + '...Details: ' + error.details);
        }
    });

    //----------------------------------------------------------------------------------
    //		Show quote PDF from history screen 
    //----------------------------------------------------------------------------------
    $(document).on('tap click', '#btn-quote-search', function () {
    //$("#btn-quote-search").on("tap click", function () {
        try {
            var term = $('input#txtQuoteSearchTerm').val();
            if (term == undefined || term.length == 0) {
                LogMessage(_moduleName_quoteHistory + ": btn-quote-search - term: [empty]");
                //still re-load from db to make sure we have latest
                quoteHistory_load();
            }
            else {
                LogMessage(_moduleName_quoteHistory + ": btn-quote-search - term: " + term);
                //get data from DB.
                quoteHistory_load(term);
            }
            return false;
        }
        catch (error) {
            ShowMessage(_pageName_quoteHistory, error.message, 'error', $(this));
            LogMessage(_moduleName_quoteHistory + ": btn-quote-search: " + error.message + '...Details: ' + error.details);
        }
    });

});

//----------------------------------------------------------------------------------
//		Product Selection Screen
//----------------------------------------------------------------------------------
function quoteHistory() {
    "use strict";
    LogMessage(_moduleName_quoteHistory + ": init");
}

//----------------------------------------------------------------------------------
//		Page Load - load up history from hidden field into grid format 
//----------------------------------------------------------------------------------
function quoteHistory_load(term) {
    LogMessage(_moduleName_quoteHistory + ": quoteHistory_load");
    //load quote history info ui
    //this is called from page load, clear out any old data and 
    //get data from DB.
    QuoteHistory_Init();
    _noMatchMessage = 'There are no quotes saved in the system.';
    //apply search filter - if any
    if (term == undefined || term.length == 0) {
		DataAccess_QuoteRead(OnDataAccess_QuoteRead_Success);
        $('input#txtQuoteSearchTerm').val('');
    }
    else {
        _noMatchMessage = 'There are no quotes containing the term "' + term + '". The search looks for matches in the customer data.';
        DataAccess_QuoteSearch(term, OnDataAccess_QuoteRead_Success);
        $('input#txtQuoteSearchTerm').val(term);
    }

}  //end of _load function

//----------------------------------------------------------------------------------
//		Quote history data - Callback function for loading local records
//----------------------------------------------------------------------------------
function OnDataAccess_QuoteRead_Success (data)
{
	_jsonQuoteHistoryData = data;
	QuoteHistory_Update(_jsonQuoteHistoryData);
	LoadQuoteHistoryUI(_jsonQuoteHistoryData, _noMatchMessage);
}


//----------------------------------------------------------------------------------
//		Load quote history grid data
//----------------------------------------------------------------------------------
function LoadQuoteHistoryUI(quoteHistoryData, noDataMessage) {
    var templateDetail = '<li%%ALT_ROW%%><div>' +
						 '<span class="col col5">' +
						 '	<a class="icon_quote_pdf" data-quote-id="%%QUOTE_ID%%" href="#">PDF</a></span>' +
						 '<span class="col col15"><a class="quote-save-as" data-quote-id="%%QUOTE_ID%%" href="#">%%QUOTE_CAPTION%%</a></span>' +
						 '<span class="col col15">%%QUOTE_DATE%%</span>' +
						 '<span class="col col30">%%CUSTOMER_INFO%%</span>' +
						 '<span class="col col30">%%PRODUCT_INFO%%</span>' +
						 //'<span class="col col5">' + 
						 //'	<a class="icon_quote_delete" data-quote-id="%%QUOTE_ID%%" href="#">Delete</a></span>' +
						 '</div></li>';
    var templateNoData = '<li>' +
							'<span class="col col100 no-data">' + noDataMessage + '</span>' +
						 '</li>';
    var resultHTML = '';
    var isAlt = false;
    $.each(quoteHistoryData, function (i, quote) {
        var detailHTML = templateDetail;
        detailHTML = detailHTML.replace(/%%QUOTE_ID%%/g, quote.QuoteId != undefined && quote.QuoteId > 0 ? quote.QuoteId : '[DRAFT]');
        detailHTML = detailHTML.replace(/%%QUOTE_CAPTION%%/g, quote.QuoteId != undefined && quote.QuoteId > 0 ? quote.Customer.CustomerNumber + '-' + quote.QuoteId.toString() : '[DRAFT]');
        detailHTML = detailHTML.replace('%%QUOTE_DATE%%', quote.QuoteDate);
        var custHTML = quote.Customer.Name + ' (' + quote.Customer.CustomerNumber + ')<br/>' +
					   'Machine Number: ' + quote.Customer.MachineNumber + '<br/>' +
					   'Section Name: ' + quote.Customer.SectionName + '<br/>' +
					   'Application: ' + quote.Customer.ApplicationName + '<br/>' +
					   'Paper Grade: ' + quote.Customer.PaperGrade +
                        (quote.OriginalQuoteId != undefined ? '<br/>' + 'Original Quote #: ' + quote.OriginalQuoteCaption : '');
        //original quote number
        detailHTML = detailHTML.replace('%%CUSTOMER_INFO%%', custHTML);
        var prodHTML = quote.Product.ProductName + ' (Module: ' + quote.Product.ModuleName + ')<br/>' +
					   'Line Load: ' + quote.ProductSelection.LineLoad + quote.ProductSelection.LineLoadUOM + '<br/>' +
					   'Temperature: ' + quote.ProductSelection.Temperature + quote.ProductSelection.TemperatureUOM + '<br/>' +
					   'Speed: ' + quote.ProductSelection.Speed + quote.ProductSelection.SpeedUOM + '<br/>' +
					   'Core Diameter: ' + quote.ProductSelection.CoreDiameter + quote.ProductSelection.CoreDiameterUOM + '<br/>' +
					   'Finish Diameter: ' + quote.ProductSelection.FinishDiameter + quote.ProductSelection.FinishDiameterUOM + '<br/>' +
					   'Cover Length: ' + quote.ProductSelection.CoverLength + quote.ProductSelection.CoverLengthUOM;
        detailHTML = detailHTML.replace('%%PRODUCT_INFO%%', prodHTML);
        //give styles to every other row
        detailHTML = detailHTML.replace('%%ALT_ROW%%', (isAlt ? ' class="grid-row-alternate" ' : ''));
        resultHTML += detailHTML;
        isAlt = !isAlt;
    });

    //if no quotes, show no data message
    if (resultHTML.length == 0) resultHTML = templateNoData;
    //populate the grid output
    $('ul#history-data-detail').html(resultHTML);
}


//----------------------------------------------------------------------------------
//		Find a quote in the collection
//----------------------------------------------------------------------------------
function FindQuote(quoteId) {
    var quoteHistoryData = QuoteHistory_Get();
    var result = null;
    $.each(quoteHistoryData, function (i, quote) {
        if (quote.QuoteId == quoteId) {
            result = quote;
            return;
        }
    });
    return result;
}

//----------------------------------------------------------------------------------
//		clear out any quote history data stored in hidden field or memory. 
//		then try to pull it from external file
//----------------------------------------------------------------------------------
function QuoteHistory_Init() {
    _jsonQuoteHistoryData == null;
    $('input#txtQuoteSearchTerm').val('');
    $("input#hfQuoteHistory").val('');
}

//----------------------------------------------------------------------------------
//		get the quote history data. If can't get it from memory, hidden field, 
//		then try to pull it from external file
//----------------------------------------------------------------------------------
function QuoteHistory_Get() {
    //get from memory
    if (_jsonQuoteHistoryData == undefined ||
		_jsonQuoteHistoryData.length == 0) {

        //load from hidden field
        var dataString = $("input#hfQuoteHistory").val();
        if (dataString.length > 0) {
            _jsonQuoteHistoryData = $.parseJSON(dataString);
        }
            //get from sql lite db
        else {
            //loads file, updates hidden field, stores in memory copy
            _jsonQuoteHistoryData = DataAccess_QuoteRead();
            QuoteHistory_Update(_jsonQuoteHistoryData);
        }
    }

    return _jsonQuoteHistoryData;
}

//----------------------------------------------------------------------------------
//		Add a quote to the data. Call this on submit from quoteView
//		TBD - save the change to external file
//----------------------------------------------------------------------------------
function QuoteHistory_Add(quote) {
    if (quote == undefined) return;
    //get the quote history collection before save so that the new quote doesn't get added in memory twice
    //this will get from a hidden field. If empty, it pulls from DB.
    var jsonQuoteHistoryData = QuoteHistory_Get();
    //save the change to DB
    quote.QuoteId = DataAccess_QuoteCreate(quote);
    //save the quote id to the current quote for display
    $("input#hfQuoteCurrent").val(JSON.stringify(quote));
    //update quote view UI with quote id
    LoadQuoteInfoUI(quote);

    //re-read the data in two different ways based on dev or not dev
    if (IsEnvironmentDEV()) {
        //add the newly saved quote to quote history array at beginning - unshift will do that
        jsonQuoteHistoryData.unshift(quote);
    }
    else {
        //loads data from local DB - this will sort by most recent at top
        jsonQuoteHistoryData = DataAccess_QuoteRead();
    }
    //update in memory copy 
    QuoteHistory_Update(jsonQuoteHistoryData);

    //generate PDF, save to disk, show to user
    //in AiR, save it one way, in dev use the download 
    if (IsEnvironmentAIR()) {
        generateQuotePDFAlive(quote);
    }
    else {
        generateQuotePDF(quote);
    }
}

//----------------------------------------------------------------------------------
//		Update the data in the json obj and the hidden field
//----------------------------------------------------------------------------------
function QuoteHistory_Update(data) {
    if (data == undefined) {
        $("input#hfQuoteHistory").val('');
        _jsonQuoteHistoryData = [];
    }
    else {
        _jsonQuoteHistoryData = data;
        $("input#hfQuoteHistory").val(JSON.stringify(data));
    }
}





