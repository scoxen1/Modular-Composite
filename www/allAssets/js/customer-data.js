var _moduleName_customerData = "customer-data.js";

// JavaScript Document
var _customerXML = _XmlRootPath + "CustomerList" + _DataExtension;
var _machineXML = _XmlRootPath + "CustomerMachineSectionAppl" + _DataExtension;
var _newCustomerDropdownListXML = _XmlRootPath + "dropdownlist" + _DataExtension;
//pre-load and store locally
var _customerList = [];
var _machineList = [];
var _jsonNewCustomerApplicationData = [];
var _jsonNewCustomerSectionData = [];
var _jsonNewCustomerPaperGradeData = [];
var _jsonNewCustomerImperialMetricData = [];

//----------------------------------------------------------------------------------
//		Product Selection Screen
//----------------------------------------------------------------------------------
function customerData() {
    "use strict";
    LogMessage(_moduleName_customerData + ": init");

    //preload machine data, application data
    _machineList = LoadMachineList();
    //load from XML, merge with local stored customers
    _customerList = LoadCustomerList();

    //----------------------------------------------------------------------------------
    //		Load new cust dropdown list data from XML
    //----------------------------------------------------------------------------------
    $.get(_newCustomerDropdownListXML, function (data) {
        LogMessage(_moduleName_customerData + ": Load customer drop downlists");
        //init jSON obj
        //used in ddls on new customer creation

        //loop through all the elements with name of 'entry'
        $(data).find("entry").each(function (index, element) {

            var itemAdd = InitializeDropdownListItem(element);
            switch (itemAdd.TypeCode.toLowerCase()) {
                case 's':
                    _jsonNewCustomerSectionData.push(itemAdd);
                    break;
                case 'a':
                    _jsonNewCustomerApplicationData.push(itemAdd);
                    break;
                case 'p':
                    _jsonNewCustomerPaperGradeData.push(itemAdd);
                    break;
            }
        }); //loop over each entry tag in XML

        //imperial/metric
        _jsonNewCustomerImperialMetricData.push(InitializeImperialMetricItem('I', 'Imperial'));
        _jsonNewCustomerImperialMetricData.push(InitializeImperialMetricItem('M', 'Metric'));

        //save in memory json OBJ to hidden field
        //$("input#hfApplicationRank").val(JSON.stringify(_jsonRankData));
        LogMessage(_moduleName_customerData + ": Load customer drop downlists - Section Codes: " + _jsonNewCustomerSectionData.length + " items");
        LogMessage(_moduleName_customerData + ": Load customer drop downlists - Application Codes: " + _jsonNewCustomerApplicationData.length + " items");
        LogMessage(_moduleName_customerData + ": Load customer drop downlists - Paper Grades: " + _jsonNewCustomerPaperGradeData.length + " items");
        LogMessage(_moduleName_customerData + ": Load customer drop downlists - Imperial Metric: " + _jsonNewCustomerImperialMetricData.length + " items");

    })
	.done(function () {
	    //
	})
	.fail(function () {
	    //this will show error and hide loading ui
	    ShowMessage("New Customer Drop down lists", "Error getting customer drop down list data", 'error', null);
	});

}  //end initial function declaration at top of js

//----------------------------------------------------------------------------------
//		Customer List - load once at start up, save to DB
//----------------------------------------------------------------------------------
function LoadCustomerList() {

    //----------------------------------------------------------------------------------
    //		get data from XML
    //----------------------------------------------------------------------------------
    $.get(_customerXML, function (data) {

        LogMessage(_moduleName_customerData + ": load customer data");

        //clear global arrays
        _customerList = [];

        //TBD - future - add logic to load this into local db and only run through this if the data version
        // is updated

        //build up an HTML of the data in the same loop - this becomes the drop down
        resultHTML = [];

        //looping through customer data
        $(data).find("entry").each(function (index, element) {

            jsonCust = {};
            jsonCust.CustomerNumber = $(element).find('d\\:CustomerNbr,CustomerNbr').text();
            jsonCust.CreateDate = (new Date()).toLocaleDateString();
            jsonCust.IsLocal = false;
            jsonCust.Name = $(element).find('d\\:CustomerName,CustomerName').text();
            jsonCust.Address = '';
            if ($(this).find('d\\:Address1,Address1').attr('null') !== "true") {
            jsonCust.Address = $(element).find('d\\:Address1,Address1').text();
            }
            if (jsonCust.Address.toLowerCase() == '[n/a]') {
                jsonCust.Address = '';
            }
            jsonCust.City = $(element).find('d\\:City,City').text();
            jsonCust.State = "";
            if ($(this).find('d\\:State,State').attr('null') !== "true") {
                jsonCust.State = $(this).find('d\\:State,State').text();
            }
            if (jsonCust.State.toLowerCase() == '[n/a]' || jsonCust.State.toLowerCase() == '??') {
                jsonCust.State = '';
            }
            jsonCust.Zip = "";
            if ($(this).find('d\\:Zip,Zip').attr('null') !== "true") {
                jsonCust.Zip = $(this).find('d\\:Zip,Zip').text();
            }
            jsonCust.Country = $(element).find('d\\:Country,Country').text();
            jsonCust.ImperialMetric = $(element).find('d\\:ImperialMetric,ImperialMetric').text();;
            jsonCust.MachineNumber = '';
            jsonCust.SectionName = '';
            jsonCust.SectionCode = '';
            jsonCust.ApplicationName = '';
            jsonCust.ApplicationCode = '';
            jsonCust.PaperGrade = '';

            //put elements into an array that we will combine with local customers
            _customerList.push(jsonCust);

            //append to an array of li
            resultHTML.push(PopulateCustomerSearchListItem(jsonCust));
        });

        //console.log(results);
        LogMessage(_moduleName_customerData + ": load customer data - " + _customerList.length + ' server records.');

        //add hidden no matches found
        resultHTML.push('<li class="customerName search-results-list no-match" data-customernbr="NO_MATCH" >No matches found</li>');
        $("#search-results").html(resultHTML);

        //load local records - append to this - see callback for updating the search results
		//call this after the above is complete so there is no overwriting one with the other
        DataAccess_CustomerRead(OnDataAccess_CustomerRead_Success);
    })
	.fail(function () {
	    ShowMessage("Csutomer List", "Error with customer list", 'error', null);
	});

}


//----------------------------------------------------------------------------------
//		Customer data - Callback function for loading local records locally
//----------------------------------------------------------------------------------
function OnDataAccess_CustomerRead_Success (data)
{
	_customerListLocal = data;
	resultHTML = [];
	$(data).each(function (index, item) {
		//append to an array of li
		resultHTML.push(PopulateCustomerSearchListItem(item));
	});
	var currentHTML = $("#search-results").html();
	$("#search-results").html(currentHTML + resultHTML);
	LogMessage(_moduleName_customerData + ": load customer data - " + _customerListLocal.length + ' local records.');
}

//----------------------------------------------------------------------------------
//		Customer data - populate a hidden dropdown list for searches
//----------------------------------------------------------------------------------
function PopulateCustomerSearchListItem(jsonCust) {
    return '<li class="customerName search-results-list" ' +
		' data-customernbr="' + jsonCust.CustomerNumber + '"' +
        ' data-customername="' + jsonCust.Name + '"' +
        ' data-address1="' + jsonCust.Address + '"' +
        ' data-city="' + jsonCust.City + '"' +
        ' data-state="' + jsonCust.State + '"' +
        ' data-zip="' + jsonCust.Zip + '"' +
        ' data-country="' + jsonCust.Country + '"' +
        ' data-islocal="' + jsonCust.IsLocal + '"' +
        ' data-imperialmetric="' + jsonCust.ImperialMetric + '"' +
		' data-machine-number="' + jsonCust.MachineNumber + '"' +
		' data-section-code="' + jsonCust.SectionCode + '"' +
		' data-section-name="' + jsonCust.SectionName + '"' +
		' data-application-code="' + jsonCust.ApplicationCode + '"' +
		' data-application-name="' + jsonCust.ApplicationName + '"' +
		' data-paper-grade="' + jsonCust.PaperGrade + '"' +
        '>' + jsonCust.Name + ' ' + jsonCust.CustomerNumber + '</li>';
}

//----------------------------------------------------------------------------------
//		Add new customer locally
//      call customer create in local db, add to ddl list
//----------------------------------------------------------------------------------
function Customer_Add(quote) {
    //add to drop down list locally
    $("#search-results").append(PopulateCustomerSearchListItem(quote.Customer));

    //add to customer array in memory
    _customerList.push(quote.Customer);

    //save data to local storage, get id of new row
    quote.Customer.CustomerId = DataAccess_CustomerCreate(quote.Customer);
    Quote_Update(quote);
}

//----------------------------------------------------------------------------------
//		Machine List - load once at start up
//----------------------------------------------------------------------------------
function LoadMachineList() {

    //----------------------------------------------------------------------------------
    //		Machine List - get data from XML
    //----------------------------------------------------------------------------------
    $.get(_machineXML, function (data) {

        LogMessage(_moduleName_customerData + ": load machine data");

        //clear gloabale arrays
        results = [];
        _machineList = [];

        //looping through to find customer
        $(data).find("entry").each(function (index, element) {

            //load the rows
            var itemAdd = {};
            itemAdd.CustomerNumber = $(element).find('d\\:CustomerNumber,CustomerNumber').text();
            itemAdd.MachineNumber = $(element).find('d\\:Machine,Machine').text();
            itemAdd.SectionName = $(element).find('d\\:SectionName,SectionName').text();
            itemAdd.SectionCode = $(element).find('d\\:SectionCode,SectionCode').text();
            itemAdd.ApplicationCode = $(element).find('d\\:ApplicationCode,ApplicationCode').text();
            itemAdd.ApplicationName = $(element).find('d\\:ApplicationName,ApplicationName').text();
            itemAdd.PgCode = $(element).find('d\\:PGCode,PGCode').text();
            itemAdd.PgName = $(element).find('d\\:PGName,PGName').text();
            itemAdd.ImageID = $(element).find('d\\:ImageID,ImageID').text();
            itemAdd.UpdateVersion = $(element).find('d\\:UpdateVersion,UpdateVersion').text();
            //store in json object
            _machineList.push(itemAdd);
        });

        //console.log(results);
        LogMessage(_moduleName_customerData + ": load machine data - " + _machineList.length + ' records.');

    })
	.fail(function () {
	    ShowMessage("Machine List", "Error with machine list", 'error', null);
	});

}


//----------------------------------------------------------------------------------
//		Load data record drop down list
//----------------------------------------------------------------------------------
function InitializeDropdownListItem(element) {
    var itemAdd = {};
    itemAdd.Id = $(element).find('d\\:Id,Id').text();
    itemAdd.TypeCode = $(element).find('d\\:TypeCode,TypeCode').text();
    itemAdd.Code = $(element).find('d\\:Code,Code').text();
    itemAdd.Name = $(element).find('d\\:Name,Name').text();
    return itemAdd;
}

//----------------------------------------------------------------------------------
//		Load imperial/metric data record drop down list
//----------------------------------------------------------------------------------
function InitializeImperialMetricItem(code, name) {
    var itemAdd = {};
    itemAdd.Id = 1;
    itemAdd.TypeCode = code;
    itemAdd.Code = code;
    itemAdd.Name = name;
    return itemAdd;
}

//----------------------------------------------------------------------------------
//		On load of screen, init these drop downs
//----------------------------------------------------------------------------------
function InitializeNewCustomerDropDownLists() {
    //populate ddl lists from json data
    $('#ddl-newcust-section ul').html(PopulateNewCustomerDropDownList(_jsonNewCustomerSectionData));
    $('#ddl-newcust-application ul').html(PopulateNewCustomerDropDownList(_jsonNewCustomerApplicationData));
    $('#ddl-newcust-papergrade ul').html(PopulateNewCustomerDropDownList(_jsonNewCustomerPaperGradeData));
    $('#ddl-newcust-imperialmetric ul').html(PopulateNewCustomerDropDownList(_jsonNewCustomerImperialMetricData));
    $('#ddl-newcust-section > span').html('Select Section');
    $('#ddl-newcust-application > span').html('Select Application');
    $('#ddl-newcust-papergrade > span').html('Select Paper Grade');
    $('#ddl-newcust-imperialmetric > span').html('Select One');
}

//----------------------------------------------------------------------------------
//		Populate dropdownlists for new customer - common code for 3 ddl lists
//----------------------------------------------------------------------------------
function PopulateNewCustomerDropDownList(jsonData) {
    //add the items to the list
    var result = '';
    var templateLiItem = '<li class="li selectitem" data-val="%%VALUE%%">%%TEXT%%</li>';
    $(jsonData).each(function (index, item) {
        var itemLI = templateLiItem;
        itemLI = itemLI.replace('%%VALUE%%', item.Code);
        itemLI = itemLI.replace('%%TEXT%%', item.Name);
        result += itemLI;
    });
    return result;
}

//----------------------------------------------------------------------------------
//		Get the ddl data for customer selection screen for matchine list, section list, app list, 
//----------------------------------------------------------------------------------
function CustomerList_Get() {
    return _customerList;
}
//----------------------------------------------------------------------------------
//		Get the ddl data for customer selection screen for matchine list, section list, app list, 
//----------------------------------------------------------------------------------
function MachineList_Get() {
    return _machineList;
}

//----------------------------------------------------------------------------------
//		Get the ddl data for application code
//----------------------------------------------------------------------------------
function NewCustomerApplicationData_Get() {
    return _jsonNewCustomerApplicationData;
}
//----------------------------------------------------------------------------------
//		Get the ddl data for section code
//----------------------------------------------------------------------------------
function NewCustomerSectionData_Get() {
    return _jsonNewCustomerSectionData;
}
//----------------------------------------------------------------------------------
//		Get the ddl data for paper grade
//----------------------------------------------------------------------------------
function NewCustomerPaperGradeData_Get() {
    return _jsonNewCustomerPaperGradeData;
}
