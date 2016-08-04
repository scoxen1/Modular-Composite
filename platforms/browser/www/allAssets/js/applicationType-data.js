var _moduleName_applicationType = "applicationType-data.js";

var _applicationTypeData = _XmlRootPath + "ApplicationType" + _DataExtension;
var _jsonAppType = [];
//Gloabal vars////////////////////////////////
var _appTypeIconPath = 'allAssets/img/attribute_icons/';
var _appTypeId_Abrasion = 2;  //abrasion
var _MinRank = 0;
var _MaxRank = 10;

//----------------------------------------------------------------------------------
//		Product Selection Screen
//----------------------------------------------------------------------------------
function applicationTypeData() {
    "use strict";
    LogMessage(_moduleName_applicationType + ": init");

    //load application types
    LoadApplicationTypes();

}  //end initial function

//----------------------------------------------------------------------------------
//		Load data from XML
//----------------------------------------------------------------------------------
function LoadApplicationTypes() {
    $.get(_applicationTypeData, function (data) {
        LogMessage(_moduleName_applicationType + ": Load application type data");
        //init jSON obj
        _jsonAppType = [];

        //loop through all the elements with name of 'entry'
        $(data).find("entry").each(function (index, element) {

            var itemAdd = {};
            itemAdd.AppTypeId = parseInt($(element).find('d\\:Id,d\\:Id').text());
            itemAdd.Sequence = parseInt($(element).find('d\\:Sequence,Sequence').text());
            itemAdd.AppTypeId_FK = parseInt($(element).find('d\\:Sequence,Sequence').text());  //TBD - change this
            itemAdd.AppTypeName = $(element).find('d\\:ApplType,ApplType').text();
            itemAdd.Caption = itemAdd.AppTypeName;
            itemAdd.ShowInList = $(element).find('d\\:ShowInList,ShowInList').text() == 'true';
            itemAdd.IconName_LightGray = _appTypeIconPath + $(element).find('d\\:LGIcon,LGIcon').text();
            itemAdd.IconName_DarkGray = _appTypeIconPath + $(element).find('d\\:DGIcon,DGIcon').text();
            itemAdd.IconName_Blue = _appTypeIconPath + $(element).find('d\\:BIcon,BIcon').text();
            itemAdd.LayeredImageNamingConvention = GetLayeredImageName(itemAdd.AppTypeId);
            itemAdd.LayeredImageZIndex = GetLayeredImageZIndex(itemAdd.AppTypeId);
            _jsonAppType.push(itemAdd);
        }); //loop over each entry tag in XML

        //save in memory json OBJ to hidden field
        $("input#hfAppType").val(JSON.stringify(_jsonAppType));

        LogMessage(_moduleName_applicationType + ": Load application type data - " + _jsonAppType.length + " items");

    })
    .done(function () {
        //
    })
    .fail(function () {
        //this will show error and hide loading ui
        ShowMessage("Application Type Data", "Error getting application type data", 'error', null);
    });
}

//----------------------------------------------------------------------------------
//		Application type - get
//----------------------------------------------------------------------------------
function AppType_Get() {
    if (_jsonAppType == undefined || _jsonAppType.length == 0) {
        if ($("input#hfAppType").val().length > 0) {
            _jsonAppType = $.parseJSON($("input#hfAppType").val());
        }
        else {
            _jsonAppType = [];
        }
    }
    return _jsonAppType;
}


//----------------------------------------------------------------------------------
//		Return caption based on appType id
//----------------------------------------------------------------------------------
function GetAppTypeCaption(appTypeId) {
    var result = '';
    var appTypes = AppType_Get();
    $.each(appTypes, function (i, item) {
        if (appTypeId == item.AppTypeId) {
            result = item.Caption;
            return;
        }
    });
    return result;
}

//----------------------------------------------------------------------------------
//		Return apptype object based on appType id
//----------------------------------------------------------------------------------
function GetAppTypeById(appTypeId) {
    var result = null;
    var appTypes = AppType_Get();
    $.each(appTypes, function (i, item) {
        if (appTypeId == item.AppTypeId) {
            result = item;
            return;
        }
    });
    return result;
}

//----------------------------------------------------------------------------------
//		Based on the application type, provide a layered image string that will get used on 
//      page 2 when showing layers by rank. Downstream, the code to swap out %%RANK%% will 
//      be based on the rank selected. Only applies to show in list app types
//----------------------------------------------------------------------------------
function GetLayeredImageName(appTypeId)
{
    switch (appTypeId)
    {
        case 2:
            return 'Abrasion_p0%%RANK%%.png';
        case 3:
            return 'Barring_p0%%RANK%%.png';
        case 4:
            return 'Impact_p0%%RANK%%.png';
        case 5:
            return 'Gloss_p0%%RANK%%.png';
        default:
            return "";
    }
}

//----------------------------------------------------------------------------------
//		Based on the application type, setup z-index to use with image layer ordering
//----------------------------------------------------------------------------------
function GetLayeredImageZIndex(appTypeId) {
    switch (appTypeId) {
        case 2:
        case '2':
            return 13;//Abrasion
        case 3:
        case '3':
            return 12;//Barring
        case 4:
        case '4':
            return 10;//Impact
        case 5:
        case '5':
            return 11;//Gloss
        case 'base':
            return 0;//base
        default:
            return "";
    }
}
