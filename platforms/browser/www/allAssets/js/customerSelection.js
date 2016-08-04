// JavaScript Document
var _moduleName_custselection = "customerSelection.js";

var _machineListFiltered = [];  //filtered by selected customer
var _thread = null;

//----------------------------------------------------------------------------------
//		customerSelection
//----------------------------------------------------------------------------------
function customerSelection() {
    "use strict";

    LogMessage(_moduleName_custselection + ": customer selection init");
    ShowLoadingUI();
    //init current quote on app init
    Quote_Init();

    //----------------------------------------------------------------------------------
    //		Customer - Clear Search
    //----------------------------------------------------------------------------------
    $('#search').on('tap', function () {
        if ($('.customerName:visible').length > 0) {
            $('#search-results').show();
        }
        $('#search').val('');
    });

    //----------------------------------------------------------------------------------
    //		Customer - Perform Search
    //----------------------------------------------------------------------------------
    $('#search').keyup(function () {
        clearTimeout(_thread);
        var $this = $(this);
        _thread = setTimeout(function () { FindCustomer($this.val()); }, 500);
    });

    //----------------------------------------------------------------------------------
    //		Select customer tap
    //----------------------------------------------------------------------------------
    $(document.body).on('tap', ".customerName", function () {
        //$('.customerName').on('tap', function () {

        //if no match selected, then hide drop down and exit function
        if ($(this).hasClass("no-match")) {
            $('#search-results').hide();
            $('#search').val('');
            return false;
        }

        var customerNameSelected = $(this).attr('data-customername');
        var customerNbrSelected = $(this).attr('data-customernbr');
        LogMessage(_moduleName_custselection + ": customer selected - " + customerNameSelected + ' (' + customerNbrSelected + ') ');

        $('#search-results').hide();
        var customerIdSelected = $(this).attr('data-customerNbr');
        var customerAddressSelected = $(this).attr('data-address1');
        var customerCitySelected = $(this).attr('data-city');
        var customerStateSelected = $(this).attr('data-state');
        var customerZipSelected = $(this).attr('data-zip');
        var customerCountrySelected = $(this).attr('data-country');
        var isLocal = $(this).attr('data-islocal') == 'true';

        //save selected cust data to hidden field (json formatted)
        Quote_Init();  //clear out previous info
        var quote = Quote_Get();
        quote.Customer.CustomerId = customerIdSelected;
        quote.Customer.CustomerNumber = customerNbrSelected;
        quote.Customer.Name = customerNameSelected;
        quote.Customer.Address = customerAddressSelected;
        quote.Customer.City = customerCitySelected;
        quote.Customer.State = customerStateSelected;
        quote.Customer.Zip = customerZipSelected;
        quote.Customer.Country = customerCountrySelected;
        quote.Customer.IsLocal = isLocal;
        quote.Customer.ImperialMetric = $(this).attr('data-imperialmetric');
        //init/overwrite the machine/section/app/paper grade on change of customer
        quote.Customer.MachineNumber = $(this).attr('data-machine-number');
        quote.Customer.SectionCode = $(this).attr('data-section-code');
        quote.Customer.SectionName = $(this).attr('data-section-name');
        quote.Customer.ApplicationCode = $(this).attr('data-application-code');
        quote.Customer.ApplicationName = $(this).attr('data-application-name');
        quote.Customer.PaperGrade = $(this).attr('data-paper-grade');
        Quote_Update(quote);

        //populate fields
        onSelectCustomer(quote.Customer);
    });


    //----------------------------------------------------------------------------------
    //		Machine List - select
    //----------------------------------------------------------------------------------
    $(document.body).on('tap', "#ddl-custselect-machine ul li.selectitem", function () {

        var selectedText = $(this).text();
        LogMessage(_moduleName_custselection + ": Customer Select - Machine select - " + selectedText);

        //save selected data to hidden field (json formatted)
        var quote = Quote_Get();
        quote.Customer.MachineNumber = selectedText;
        Quote_Update(quote);

        //close list, update related lists
        $("#ddl-custselect-machine ul").toggle();
        $("#ddl-custselect-machine > span").html(selectedText);
        $("#ddl-custselect-section > span").html('Select Section');
        $("#ddl-custselect-application > span").html('Select Application');

        //show sections for this machine
        FilterSectionList(_machineListFiltered, selectedText);
    });

    //----------------------------------------------------------------------------------
    //		Section List - select
    //----------------------------------------------------------------------------------
    $(document.body).on('tap', "#ddl-custselect-section ul li.selectitem", function () {

        var selectedText = $(this).text();
        LogMessage(_moduleName_custselection + ": Customer Select - Section select - " + selectedText);

        //save selected data to hidden field (json formatted)
        var quote = Quote_Get();
        quote.Customer.SectionName = selectedText;
        quote.Customer.SectionCode = $(this).attr('data-section-code');
        Quote_Update(quote);

        //close list, update related lists
        $("#ddl-custselect-section ul").toggle();
        $("#ddl-custselect-section > span").html(selectedText);
        $("#ddl-custselect-application > span").html('Select Application');

        //show applications for this section
        FilterApplicationList(_machineListFiltered, quote.Customer.MachineNumber, quote.Customer.SectionCode);
    });
    //end Section List - select

    //----------------------------------------------------------------------------------
    //		Application List - Select
    //----------------------------------------------------------------------------------
    $(document.body).on('tap', "#ddl-custselect-application ul li.selectitem", function () {

        var selectedText = $(this).text();
        LogMessage(_moduleName_custselection + ": Customer Select - Application select - " + selectedText);

        //save selected data to hidden field (json formatted)
        var quote = Quote_Get();
        quote.Customer.ApplicationName = selectedText;
        quote.Customer.ApplicationCode = $(this).attr('data-application-code');
        quote.Customer.PaperGrade = $(this).attr('data-paper-grade-name');
        Quote_Update(quote);

        //close list, update related lists
        $("#ddl-custselect-application ul").toggle();
        $("#ddl-custselect-application > span").html(selectedText);


        $("#machine-text > span").html(quote.Customer.MachineNumber);
        $("#section-text > span").html(quote.Customer.SectionName);
        //$("#application-text > span").html('<input id="appl-input" type="text" value="'+applicationName+'" />');
        $("#application-text > span").html(quote.Customer.ApplicationName);

        $("#paper-grade-value").html(quote.Customer.PaperGrade);
        $("#paper-grade-textx > span").html(quote.Customer.PaperGrade);
    });//end Application List - select

} //end customerSelection init

//----------------------------------------------------------------------------------
//		Events
//----------------------------------------------------------------------------------
$(function () {
    //----------------------------------------------------------------------------------
    //		dropdownlist - arrow click
    //----------------------------------------------------------------------------------
    $(document.body).on('tap', '.ddl-container .drop-down-btn', function () {
        var ul = $(this).closest('.ddl-container').find("ul");
        if (ul.find('li').length == 0) return;
        ul.toggle();
    });

    //----------------------------------------------------------------------------------
    //		New Customer - Application
    //----------------------------------------------------------------------------------
    $(document.body).on('tap', "#ddl-newcust-application ul li.selectitem", function () {

        LogMessage(_moduleName_custselection + ": new customer - Application select");

        //save selected data to hidden field (json formatted)
        var quote = Quote_Get();
        quote.Customer.ApplicationName = $(this).text();
        quote.Customer.ApplicationCode = $(this).attr('data-val');
        Quote_Update(quote);

        //close all list
        $("#ddl-newcust-application ul").toggle();
        $("#ddl-newcust-application > span").html($(this).text());
    });


    //----------------------------------------------------------------------------------
    //		New Customer - Section
    //----------------------------------------------------------------------------------
    $(document.body).on('tap', "#ddl-newcust-section ul li.selectitem", function () {

        LogMessage(_moduleName_custselection + ": new customer - Section select");

        //save selected data to hidden field (json formatted)
        var quote = Quote_Get();
        quote.Customer.SectionName = $(this).text();
        quote.Customer.SectionCode = $(this).attr('data-val');
        Quote_Update(quote);

        //close all list
        $("#ddl-newcust-section ul").toggle();
        $("#ddl-newcust-section > span").html($(this).text());
    });

    //----------------------------------------------------------------------------------
    //		New Customer - PaperGrade
    //----------------------------------------------------------------------------------
    $(document.body).on('tap', "#ddl-newcust-papergrade ul li.selectitem", function () {

        LogMessage(_moduleName_custselection + ": new customer - PaperGrade select");

        //save selected data to hidden field (json formatted)
        var quote = Quote_Get();
        quote.Customer.PaperGrade = $(this).text(); //$(this).attr('data-val');
        Quote_Update(quote);

        //close all list
        $("#ddl-newcust-papergrade ul").toggle();
        $("#ddl-newcust-papergrade > span").html($(this).text());
    });

    //----------------------------------------------------------------------------------
    //		New Customer - Imperial/Metric Select
    //----------------------------------------------------------------------------------
    $(document.body).on('tap', "#ddl-newcust-imperialmetric ul li.selectitem", function () {

        LogMessage(_moduleName_custselection + ": new customer - Imperial/Metric select");

        //save selected data to hidden field (json formatted)
        var quote = Quote_Get();
        quote.Customer.ImperialMetric = $(this).attr('data-val');;
        Quote_Update(quote);

        //close all list
        $("#ddl-newcust-imperialmetric ul").toggle();
        $("#ddl-newcust-imperialmetric > span").html($(this).text());
    });

});


//----------------------------------------------------------------------------------
//		Customer Selection Screen
//		Load - clear out the display or load using a customer object
//----------------------------------------------------------------------------------
function customerSelection_Load(quote) {
    //init all the data
    //if cust is null, then this indicates to clear everything out
    if (quote == undefined || quote.Customer == undefined) {
        Quote_Init();
        //Init all values on page
        $('#customer-name,#customer-text,#qcustomer-name').html('');
        $('#address').html('');
        $('#customer_number').html('');
        $('#search').val('');
        $("#machine-text > span").html('');
        $("#section-text > span").html('');
        $("#application-text > span").html('');
        $("#paper-grade-value").html('');
        $("#paper-grade-textx > span").html('');
        $("#ddl-custselect-machine > span").html('Select Machine');
        $("#ddl-custselect-section > span").html('Select Section');
        $("#ddl-custselect-application > span").html('Select Application');
    }
    else {
        //populate fields
        onSelectCustomer(quote.Customer);
    }
}

//----------------------------------------------------------------------------------
//		New Customer Screen
//		Load - clear out the display 
//----------------------------------------------------------------------------------
function newCustomer_Load() {
    //init all the data, clear everything out
    Quote_Init();
    //Init all values on page
    $('#custname-input').val('');
    $('#custadd-input').val('');
    $('#custcity-input').val('');
    $('#custstate-input').val('');
    $('#custzip-input').val('');
    $('#custctry-input').val('');
    $('#cusmach-input').val('');
    //application, section, papergrade, imperial metric
    InitializeNewCustomerDropDownLists();
    $('#new-customer .ddl-container ul').hide();

    $("#machine-text > span").html('');
    $("#section-text > span").html('');
    $("#application-text > span").html('');
    $("#paper-grade-value").html('');
    $("#paper-grade-textx > span").html('');
}


//----------------------------------------------------------------------------------
//		Customer Selection - Is everything selected (customer, machine, application, paper grade)
//----------------------------------------------------------------------------------
function IsCustomerSelected() {
    var jsonCust = Quote_Get().Customer;
    return (jsonCust != undefined && jsonCust.CustomerNumber != undefined && jsonCust.CustomerNumber != '');
}

//----------------------------------------------------------------------------------
//		Customer Selection - Is everything selected (customer, machine, application, paper grade)
//----------------------------------------------------------------------------------
function ValidateCustomerSelection(sender, title) {
    LogMessage(_moduleName_custselection + ": ValidateCustomerSelection");
    if (!IsCustomerSelected()) {
        ShowMessage(title, "No customer is selected", 'error', sender);
        return false;
    }
    var result = true;
    var message = "";
    var quote = Quote_Get();
    if (quote.Customer.Name == '') {  //only could be empty for new customer scenario
        message += "Customer name is required. ";
        result = false;
    }
    if (quote.Customer.MachineNumber == '') {
        message += "Machine is required. ";
        result = false;
    }
    if (quote.Customer.SectionCode == '') {
        message += (message.length > 0 ? " " : "");
        message += "Section is required. ";
        result = false;
    }
    if (quote.Customer.ApplicationCode == '') {
        message += (message.length > 0 ? " " : "");
        message += "Application is required. ";
        result = false;
    }
    if (quote.Customer.ImperialMetric == undefined || quote.Customer.ImperialMetric == '') {  //only could be empty for new customer scenario
        message += "Imperial/Metric is required. ";
        result = false;
    }

    //show the message
    if (!result) {
        ShowMessage(title, message, 'error', sender);
    }
    return result;
}

//----------------------------------------------------------------------------------
//		New Customer - Is everything populated (customer, machine, application, paper grade)
//----------------------------------------------------------------------------------
function ValidateAndSaveNewCustomer(sender) {
    LogMessage(_moduleName_custselection + ": ValidateAndSaveNewCustomer");

    //transfer data from fields to json object
    var quote = Quote_Get();  //quote object initialized on load of page
    //save data to customer selected hidden field
    quote.Customer.CustomerId = Date.now();
    quote.Customer.CustomerNumber = quote.Customer.CustomerId;
    quote.Customer.CreateDate = (new Date()).toLocaleDateString();
    quote.Customer.IsLocal = true;
    quote.Customer.Name = $('#custname-input').val();
    quote.Customer.Address = $('#custadd-input').val();
    quote.Customer.City = $('#custcity-input').val();
    quote.Customer.State = $('#custstate-input').val();
    quote.Customer.Zip = $('#custzip-input').val();
    quote.Customer.Country = $('#custctry-input').val();
    quote.Customer.MachineNumber = $('#cusmach-input').val();
    //quote.Customer.SectionName = //set on select
    //quote.Customer.SectionCode = //set on select
    //quote.Customer.ApplicationName = //set on select
    //quote.Customer.ApplicationCode = //set on select
    //quote.Customer.PaperGrade = //set on select
    //quote.Customer.ImperialMetric = //set on select
    Quote_Update(quote);
    //check validity
    if (!ValidateCustomerSelection(sender, 'New Customer')) {
        return false;
    }

    //call customer create in local db, add to ddl list
    Customer_Add(quote);

    //populate stuff on page2 (also populates cust selection screen)
    onSelectCustomer(quote.Customer);

    LogMessage(_moduleName_custselection + ": ValidateAndSaveNewCustomer - new customer created - " + quote.Customer.Name);

    return true;
}

//----------------------------------------------------------------------------------
//		on select of a customer - from the drop down search or from the page load
//----------------------------------------------------------------------------------
function onSelectCustomer(jsonCust) {
    //set value on subsequent page (page1) and on this page
    $('#customer-name,#customer-text,#qcustomer-name').html(jsonCust.Name);
    $('#address, #customer-address-road').html((jsonCust.Address == '' ? '' : jsonCust.Address + '<br/>') +
											   jsonCust.City + ", " + jsonCust.State + '<br />' +
											   jsonCust.Zip + ", " + jsonCust.Country);
    $('#customer_number').html(jsonCust.CustomerNumber);

    //re-init ddls
    $("#ddl-custselect-machine > span").html('Select Machine');
    $("#ddl-custselect-section > span").html('Select Section');
    $("#ddl-custselect-application > span").html('Select Application');
    //re-init values set downstream
    $("#machine-text > span").html('');
    $("#section-text > span").html('');
    $("#application-text > span").html('');
    $("#paper-grade-value").html('');
    $("#paper-grade-textx > span").html('');

    $('#search').val('');
    if (jsonCust.IsLocal) {
        //if local, then assign machine, section, application, paper grade straight away
        $("#ddl-custselect-machine > span").html(jsonCust.MachineNumber);
        $("#ddl-custselect-section > span").html(jsonCust.SectionName);
        $("#ddl-custselect-application > span").html(jsonCust.ApplicationName);
        $("#machine-text > span").html(jsonCust.MachineNumber);
        $("#section-text > span").html(jsonCust.SectionName);
        $("#application-text > span").html(jsonCust.ApplicationName);
        $("#paper-grade-value").html(jsonCust.PaperGrade);
        $("#paper-grade-textx > span").html(jsonCust.PaperGrade);
    }
    else {
        _machineListFiltered = FilterMachineList(MachineList_Get(), jsonCust.CustomerNumber);
    }
}

//----------------------------------------------------------------------------------
//		Find a Customer
//----------------------------------------------------------------------------------
function FindCustomer(searchValue) {

    LogMessage(_moduleName_custselection + ": find customer");

    //Make jQuery :contains Case-Insensitive
    $.expr[":"].contains = $.expr.createPseudo(function (arg) {
        return function (elem) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });

    //set all to hidden then show the ones that have matching text using contains
    $('.customerName').hide();
    $(".customerName:contains('" + searchValue + "')").show();
    //hide no match so it doesn't come up incidentally
    $(".customerName.no-match").hide();

    //only show the drop down if something is showing
    //have to show parent container first so that the element count line will get proper count
    $('#search-results').show();
    if ($('.customerName:visible').length == 0) {
        $(".customerName.no-match").show();
    }

    //only show the drop down if something is showing
    if ($('.customerName:visible').length > 0) {
        $('#search-results').show();
    }
    else {
        $('#search-results').hide();
    }

}

//----------------------------------------------------------------------------------
//		Filter machines based on customer selected
//----------------------------------------------------------------------------------
function FilterMachineList(machineList, customerNumber) {
    ShowLoadingUI();

    //init
    $("#ddl-custselect-machine ul").html('');
    $("#ddl-custselect-section ul").html('');
    $("#ddl-custselect-application ul").html('');

    //results.push(machineNumber + "*" + sectionName + "*" + applicationName + "*" + sectionCode + "*" + applicationCode + "*" + pgCode + "*" + pgName + "*" + imageID + "*" + updateVersion);
    var result = [];
    var itemListConcatenated = '|';
    var resultHTML = '';
    var templateLiItem = '<li class="li selectitem" data-val="%%VALUE%%">%%TEXT%%</li>';
    $(machineList).each(function (index, item) {
        //only add for this customer number
        if (item.CustomerNumber == customerNumber) {
            //push to create a filtered list of machines by cust
            result.push(item);

            //only show unique values - check for dups
            if (itemListConcatenated.indexOf('|' + item.MachineNumber + '|') == -1) {
                itemListConcatenated += item.MachineNumber + '|';
                var itemLI = templateLiItem;
                itemLI = itemLI.replace('%%VALUE%%', item.MachineNumber);
                itemLI = itemLI.replace('%%TEXT%%', item.MachineNumber);
                resultHTML += itemLI;
            }
        }
    });
    $("#ddl-custselect-machine ul").html(resultHTML);
    //hide loading ui when done loading machine list
    HideLoadingUI();

    LogMessage(_moduleName_custselection + ": filterMachineList - " + result.length + ' records.');
    return result;

} //end filter MachineList

//----------------------------------------------------------------------------------
//		Filter sections based on machine selected
//----------------------------------------------------------------------------------
function FilterSectionList(machineList, machineNumber) {
    ShowLoadingUI();

    //init
    $("#ddl-custselect-section ul").html('');
    $("#ddl-custselect-application ul").html('');

    //loop through section	
    var itemListConcatenated = '|';
    var resultHTML = '';
    var templateLiItem = '<li class="li selectitem" data-machine-number="%%MACHINE_NUMBER%%" data-section-code="%%SECTION_CODE%%">%%TEXT%%</li>';
    $(machineList).each(function (index, item) {
        if (item.MachineNumber == machineNumber) {
            //check for dups
            if (itemListConcatenated.indexOf('|' + item.SectionCode + '|') == -1) {
                itemListConcatenated += item.SectionCode + '|';
                var itemLI = templateLiItem;
                itemLI = itemLI.replace('%%MACHINE_NUMBER%%', item.MachineNumber);
                itemLI = itemLI.replace('%%SECTION_CODE%%', item.SectionCode);
                itemLI = itemLI.replace('%%TEXT%%', item.SectionName);
                resultHTML += itemLI;
            }
        }

    });
    $("#ddl-custselect-section ul").html(resultHTML);
    //hide loading ui when done loading machine list
    HideLoadingUI();
}

//----------------------------------------------------------------------------------
//		Filter applications based on machine, section selected
//----------------------------------------------------------------------------------
function FilterApplicationList(machineList, machineNumber, sectionCode) {
    ShowLoadingUI();

    //init
    $("#ddl-custselect-application ul").html('');

    //loop through section	
    var itemListConcatenated = '|';
    var resultHTML = '';
    var templateLiItem = '<li class="li selectitem" data-machine-number="%%MACHINE_NUMBER%%"' +
												    ' data-section-code="%%SECTION_CODE%%"' +
												    ' data-application-code="%%APPLICATION_CODE%%"' +
												    ' data-paper-grade-name="%%PAPER_GRADE%%"' +
													' >%%TEXT%%</li>';
    $(machineList).each(function (index, item) {
        if (item.MachineNumber == machineNumber & item.SectionCode == sectionCode) {
            //check for dups
            if (itemListConcatenated.indexOf('|' + item.ApplicationCode + '|') == -1) {
                itemListConcatenated += item.ApplicationCode + '|';
                var itemLI = templateLiItem;
                itemLI = itemLI.replace('%%MACHINE_NUMBER%%', item.MachineNumber);
                itemLI = itemLI.replace('%%SECTION_CODE%%', item.SectionCode);
                itemLI = itemLI.replace('%%APPLICATION_CODE%%', item.ApplicationCode);
                itemLI = itemLI.replace('%%PAPER_GRADE%%', item.PgName);
                itemLI = itemLI.replace('%%TEXT%%', item.ApplicationName);
                resultHTML += itemLI;
            }
        }

    });
    $("#ddl-custselect-application ul").html(resultHTML);
    //hide loading ui when done loading machine list
    HideLoadingUI();
}

