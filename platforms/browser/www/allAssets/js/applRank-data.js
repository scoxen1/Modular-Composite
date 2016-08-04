var _moduleName_applRank = "applRank-data.js";

// JavaScript Document
//init jSON obj - store rank data in json object
var applicationRankData = _XmlRootPath + "ApplRank" + _DataExtension;
var _jsonRankDataNotRankExisting = [];
var _jsonRankDataStandardConfig = [];
var _jsonRankDataRankExisting = [];

//----------------------------------------------------------------------------------
//		Product Selection Screen
//----------------------------------------------------------------------------------
function applRankData() {
    "use strict";
    LogMessage(_moduleName_applRank + ": init");

    //----------------------------------------------------------------------------------
    //		Load Application Rank Data from XML
    //----------------------------------------------------------------------------------
    $.get(applicationRankData, function (data) {
        LogMessage(_moduleName_applRank + ": Load Application Rank data");
        //init jSON obj
        //used for page 2 product selection
        _jsonRankDataNotRankExisting = [];
        //used for product drop down on page 1
        _jsonRankDataStandardConfig = [];
        _jsonRankDataRankExisting = [];

        //loop through all the elements with name of 'entry'
        $(data).find("entry").each(function (index, element) {

            //exclude record type of h (header)
            var isDetail = $(element).find('d\\:RecordType,RecordType').text() == 'D';
            if (isDetail) {
                var itemAdd = InitializeRankDataItem(element);
                //add to collection - use on page 2
                if (!itemAdd.RankExisting) {
                    _jsonRankDataNotRankExisting.push(itemAdd);
                }
                _jsonRankDataNotRankExisting.push(itemAdd);
                //add to standard config - use on page 1
                if (itemAdd.StandardConfiguration) {
                    _jsonRankDataStandardConfig.push(itemAdd);
                }
                //add to rank existing - use on page 1
                if (itemAdd.RankExisting) {
                    _jsonRankDataRankExisting.push(itemAdd);
                }
            } //end is detail check
        }); //loop over each entry tag in XML

        //save in memory json OBJ to hidden field
        //filtered copy will be used to pare down list as user selects data 
        $("input#hfApplicationRank").val(JSON.stringify(_jsonRankDataNotRankExisting));

        LogMessage(_moduleName_applRank + ": Load Application Rank data - " + _jsonRankDataNotRankExisting.length + " items");

    })
	.done(function () {
	    //
	})
	.fail(function () {
	    //this will show error and hide loading ui
	    ShowMessage("Product Selection", "Error getting application rank data", 'error', null);
	});

}  //end initial function declaration at top of js


//----------------------------------------------------------------------------------
//		Load Application Rank Data from XML
//----------------------------------------------------------------------------------
function InitializeRankDataItem(element) {
    var itemAdd = {};
    itemAdd.SectionName = $(element).find('d\\:SectionName,SectionName').text();
    itemAdd.ProductLine = $(element).find('d\\:ProductLine,ProductLine').text();
    itemAdd.Supplier = $(element).find('d\\:Supplier,Supplier').text();
    itemAdd.ModuleName = $(element).find('d\\:ModuleName,ModuleName').text();
    itemAdd.ProductName = $(element).find('d\\:productName,productName').text();
    itemAdd.ApplicationCode = $(element).find('d\\:ApplicationCode,ApplicationCode').text();
    itemAdd.RankExisting = $(element).find('d\\:RankExisting,RankExisting').text().toLowerCase() == 'x';
    itemAdd.StandardConfiguration = $(element).find('d\\:StandardConfiguration,StandardConfiguration').text().toLowerCase() == 'x';

    //rule 1, rule2, operand1, operand2, operator1, operator2
    itemAdd.Rule1 = $(element).find('d\\:Rule1,Rule1').text();
    itemAdd.Rule2 = $(element).find('d\\:Rule2,Rule2').text();
    itemAdd.Operand1 = $(element).find('d\\:Operand1,Operand1').text();
    itemAdd.Operand2 = $(element).find('d\\:Operand2,Operand2').text();
    itemAdd.Operator1 = $(element).find('d\\:Operator1,Operator1').text();
    itemAdd.Operator2 = $(element).find('d\\:Operator2,Operator2').text();

    //make the data more object oriented and easier to sift through
    itemAdd.AppType = [];
    var appTypes = AppType_Get();
    var imageBase = '';
    $.each(appTypes, function (i, item) {
        var appType = {};
        appType.AppTypeId = item.AppTypeId;
        appType.AppTypeId_FK = item.AppTypeId_FK;
        appType.Sequence = item.Sequence;
        appType.Caption = item.Caption;
        appType.ShowInList = item.ShowInList;
        appType.IconName_LightGray = item.IconName_LightGray;
        appType.IconName_DarkGray = item.IconName_DarkGray;
        appType.IconName_Blue = item.IconName_Blue;
        appType.Rank = $(element).find('d\\:Rank' + item.AppTypeId_FK.toString() + ',Rank' + item.AppTypeId_FK.toString()).text();
        if (appType.Rank == '' || appType.Rank == '[N/A]') appType.Rank = undefined;
        appType.BaseImage = $(element).find('d\\:BaseImage' + item.AppTypeId_FK.toString() + ',BaseImage' + item.AppTypeId_FK.toString()).text();
        appType.BaseImage = (appType.BaseImage == '[N/A]' ? '' : appType.BaseImage);
        appType.LayerImage = $(element).find('d\\:LayerImage' + item.AppTypeId_FK.toString() + ',LayerImage' + item.AppTypeId_FK.toString()).text();
        appType.LayerImage = (appType.LayerImage == '[N/A]' ? '' : appType.LayerImage);
        appType.Benefit = $(element).find('d\\:Benefit' + item.AppTypeId_FK.toString() + ',Benefit' + item.AppTypeId_FK.toString()).text();
        appType.Benefit = (appType.Benefit == '[N/A]' ? '' : appType.Benefit);
        itemAdd.AppType.push(appType);

        //concatenate ranks into delimited field for easier searching downstream
        if (appType.Rank != undefined || appType.Rank != '') {
            itemAdd.AppTypeRankConcatenated = (itemAdd.AppTypeRankConcatenated != undefined && itemAdd.AppTypeRankConcatenated.length > 0 ?
												  itemAdd.AppTypeRankConcatenated + '|' : '');
            itemAdd.AppTypeRankConcatenated += item.AppTypeId.toString() + ':' + appType.Rank;
        }

        //concatenate images into delimited field for easier searching downstream
        if (i == 0 && appType.BaseImage != '') { //first time through loop
            imageBase = 'base:' + appType.BaseImage;
        }
        if (i == 1 && appType.BaseImage != '') { //2nd time through loop - of image is there, make it the dropdown image
            itemAdd.ProductImage = appType.BaseImage;
        }
        if (appType.LayerImage != '') {
            itemAdd.ImagesConcatenated = (itemAdd.ImagesConcatenated != undefined && itemAdd.ImagesConcatenated.length > 0 ?
												  itemAdd.ImagesConcatenated + '|' : '');
            itemAdd.ImagesConcatenated += item.AppTypeId.toString() + ':' + appType.LayerImage;
        }
    });
    //now concatenate base plus layers
    itemAdd.ImagesConcatenated = imageBase + '|' + itemAdd.ImagesConcatenated;
    return itemAdd;
}

//----------------------------------------------------------------------------------
//		Get the ranks with Standardconfiguration = x
//		This is loaded up on application start up
//----------------------------------------------------------------------------------
function RankDataStandardConfiguration_Get() {
    return _jsonRankDataStandardConfig;
}

//----------------------------------------------------------------------------------
//		Get the ranks with Standardconfiguration = x
//		This is loaded up on application start up
//----------------------------------------------------------------------------------
function RankDataRankExisting_Get() {
    return _jsonRankDataRankExisting;
}

//----------------------------------------------------------------------------------
//		Get the ranks with RankExisting <> x
//		This is loaded up on application start up
//----------------------------------------------------------------------------------
function RankDataRankNotExisting_Get() {
    return _jsonRankDataNotRankExisting;
}

//----------------------------------------------------------------------------------
//		Filter a collection of ranks based on an application code
//		
//----------------------------------------------------------------------------------
function FilterRankOnApplicationCode(jsonRankData, applicationCode) {
    //Application Code Match - get first 2 chars
    var result = [];
    $.each(jsonRankData, function (i, item) {
        //Application Code Match - get first 2 chars
        if (item.ApplicationCode.toLowerCase().substr(0, 2) == applicationCode.toLowerCase().substr(0, 2)) {
            result.push(item);
        }
    });
    LogMessage(_moduleName_applRank + ": FilterRankOnApplicationCode - AppCode abbr: " + applicationCode + ", Num matches: " + result.length);
    return result;
}

//----------------------------------------------------------------------------------
//		Filter a collection of ranks based on an application code and selected product
//		
//----------------------------------------------------------------------------------
function FilterRankOnApplicationCodeAndSelectedProduct(jsonRankData, applicationCode, selectedProduct) {
    //Application Code Match - get first 2 chars
    var result = [];
    $.each(jsonRankData, function (i, item) {
        //Application Code Match - get first 2 chars
        if (item.ApplicationCode.toLowerCase().substr(0, 2) == applicationCode.toLowerCase().substr(0, 2) &&
			item.ProductName.toLowerCase() == selectedProduct.toLowerCase()) {
            result.push(item);
        }
    });
    LogMessage(_moduleName_applRank + ": FilterRankOnApplicationCodeAndSelectedProduct - AppCode abbr: " + applicationCode +
		", Selected product: " + selectedProduct + ", Num matches: " + result.length);
    return result;
}

//----------------------------------------------------------------------------------
//		Filter a collection of ranks based on rule 1, rule 2 defined in XML data
//----------------------------------------------------------------------------------
function FilterRankOnRule1Rule2(jsonRankData, selCustomer) {
    //Application Code Match - get first 2 chars
    var result = [];
    $.each(jsonRankData, function (i, item) {

        //rule1 match
        var isMatch = IsRuleMatch(item.Rule1, item.Operator1.toLowerCase(),
                                  item.Operand1, selCustomer, item.ProductName);
        //if rule matches, check rule 2
        if (isMatch) {
            isMatch = IsRuleMatch(item.Rule2, item.Operator2.toLowerCase(),
                                  item.Operand2, selCustomer, item.ProductName);
        }

        //if match achieved, then add to result
        if (isMatch) {
            result.push(item);
        }
    });
    LogMessage(_moduleName_applRank + ": FilterRankOnRule1Rule2 - ApplicationCode: " + selCustomer.ApplicationCode +
        ", PaperGrade: " + selCustomer.PaperGrade +
		", Num matches: " + result.length);
    return result;
}

//----------------------------------------------------------------------------------
//		Test if a rule matches
//      called from FilterRankOnRule1Rule2
//----------------------------------------------------------------------------------
function IsRuleMatch(rule, valueCompare, operand, selCustomer, prodName) {
    var bNoRuleInForce = false;
    var valueTest = '';
    //rule1
    switch (rule.toLowerCase()) {
        //ApplicationCode	PGName	=	SN	=	WWFC
        case 'applicationcode':
            valueTest = selCustomer.ApplicationCode.substr(0, 2).toLowerCase();
            break;
        case 'pgname':
            valueTest = selCustomer.PaperGrade.toLowerCase();
            break;
            //no rule to test, return true
        case '[n/a]':
        case '':
        case 'undefined':
            bNoRuleInForce = true;
            break;
        default:
            ShowMessage(_moduleName_applRank, "Filter on Rules - Invalid Rule '" + rule + "' (product name: " + prodName + ").", 'error', null);
            break;
    }

    //
    LogMessage(_moduleName_applRank + ": FilterRankOnRule1Rule2-IsRuleMatch - ProductName: " + prodName + " - Rule: " + rule +
		", valueCompare:" + valueCompare + " " + operand + " valueTest:" + valueTest);
    //if no rule in force, then return true
    if (bNoRuleInForce) return true;


    //see if it matches based on operand
    switch (operand.toLowerCase()) {
        //ApplicationCode	PGName	=	SN	=	WWFC
        case '=':
            return valueCompare.toLowerCase() == valueTest.toLowerCase();
            break;
        case '<>':
            return valueCompare.toLowerCase() != valueTest.toLowerCase();
            break;
        case '[n/a]':
        case '':
        case 'undefined':
            return true;
            break;
        default:
            ShowMessage(_moduleName_applRank, "Filter on Rules - Invalid operand '" + operand + "' (product name: " + prodName + ").", 'error', null);
            break;
    }
}