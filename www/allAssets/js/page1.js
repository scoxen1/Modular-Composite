var _moduleName_machineSpecSelection = "page1.js";

var _sliderDefaultData = _XmlRootPath + "SectionAttributes" + _DataExtension;
var _jsonSliderConfig = [];

//----------------------------------------------------------------------------------
//		Product Selection Screen
//----------------------------------------------------------------------------------
function machineSpecSelection() {
    "use strict";
    LogMessage(_moduleName_machineSpecSelection + ": init");

    //load default slider settings
    LoadSectionAttributes();

    //----------------------------------------------------------------------------------
    //		Slider initialize event, set the corresponding display labels
    //----------------------------------------------------------------------------------
    $("[data-slider]").each(function () {
        //output is this css class for the output number
        $("<span>").addClass("output").insertAfter($(this));
    })
	//----------------------------------------------------------------------------------
	//		Slider change event, set the corresponding display labels, update hidden quote values
	//----------------------------------------------------------------------------------
	.bind("slider:ready slider:changed", function (event, data) {
	    UpdateRelatedSliderDisplay($(this), data.value, data.ratio);
	});

    //this is necessary to update the display labels
    // add the sliders to the DOM
    $(".output:nth-child(3n)").attr('id', 'firstSlider');
    //call this after previous line
    machineSpecSelection_load();

    //----------------------------------------------------------------------------------
    //		Update product name selection
    //----------------------------------------------------------------------------------
    $(document.body).on('change', "#ddlProductName", function () {
        LogMessage(_moduleName_machineSpecSelection + ": Product name select change");
        //get selected option to get the custom attributes
        var optionSelected = $("option:selected", $(this));

        //get data attributes
        var quote = Quote_Get();
        quote.ProductSelection.ProductName = $(this).val();
        quote.ProductSelection.RankExisting = (optionSelected.attr('data-rank-existing') == 'true');
        quote.ProductSelection.ImagesConcatenated = optionSelected.attr('data-images-concatenated');
        quote.ProductSelection.ProductImage = optionSelected.attr('data-product-image');
        var ranks = optionSelected.attr('data-rank-concatenated').split('|');
        //update original product ranks
        //loop through all the app types and set original rank values
        //split out the ranks concatenated into individual items
        $.each(quote.AppType, function (i, item) {
            item.OriginalRank = undefined;
            $.each(ranks, function (j, rank) {
                if (item.AppTypeId == rank.split(':')[0]) {
                    item.OriginalRank = rank.split(':')[1];
                }
            });
        });
        //set product image
        SetProductImage(quote.ProductSelection.ProductImage);

        Quote_Update(quote);
    });


}  //end initial function

//----------------------------------------------------------------------------------
//		Init page - empty page
//----------------------------------------------------------------------------------
function machineSpecSelection_load() {
    LogMessage(_moduleName_machineSpecSelection + ": page load");

    //set the slider to some default values
    InitSliderValuesDefault('calendar', 'rolls');

    //update the quote to match the slider default values
    var quote = Quote_Get();
    quote.ProductSelection.LineLoad = $("#lineLoadSlider[data-slider]").val();
    quote.ProductSelection.Temperature = $("#temperatureSlider[data-slider]").val();
    quote.ProductSelection.Speed = $("#speedSlider[data-slider]").val();

    //init the diameters, cover length
    InitRollDimensions(quote);

    //init product name drop down
    InitProductDropDown(quote);

    Quote_Update(quote);
}

//----------------------------------------------------------------------------------
//		Init page 
//----------------------------------------------------------------------------------
function machineSpecSelection_loadFromCopy(quote) {
    LogMessage(_moduleName_machineSpecSelection + ": page load - from copy");

    //set the customer info
    //set value on page1 and on cust selection page with data from this quote.Customer
    $('#name,#customer-text,#qcustomer-name').html(quote.Customer.Name);
    $('#address, #customer-address-road').html(quote.Customer.Address);
    $('#city, #customer-address-city-state').html(quote.Customer.City + ", " + quote.Customer.State);
    $('#zip, #customer-address-country').html(quote.Customer.Zip + ", " + quote.Customer.Country);
    $('#customer_Number').html(!quote.Customer.IsLocal ? quote.Customer.CustomerNumber : '[Local]');
    $("#machine-text > span").html(quote.Customer.MachineNumber);
    $("#section-text > span").html(quote.Customer.SectionName);
    $("#application-text > span").html(quote.Customer.ApplicationName);
    $("#paper-grade-text > span").html(quote.Customer.PaperGrade);
    $("#paper-grade-textx > span").html(quote.Customer.PaperGrade);

    InitSliderValuesFromQuote(quote);

    //init product name drop down
    InitRollDimensions(quote);

    //init product name drop down
    InitProductDropDown(quote);
}

//----------------------------------------------------------------------------------
//		Init textbox formatting based on imperial or metric
//----------------------------------------------------------------------------------
function InitRollDimensions(quote) {

    var isMetric = quote.Customer.ImperialMetric == undefined || quote.Customer.ImperialMetric.toLowerCase() == 'm';
    var numDecimalPlaces = isMetric ? 2 : 4;
    var placeholder = isMetric ? '#.##' : '#.####';

    //set placeholder attrib
    $('#txtCoreDiameter').attr('placeholder', placeholder);
    $('#txtFinishDiameter').attr('placeholder', placeholder);
    $('#txtCoverLength').attr('placeholder', placeholder);

    //init textboxes
    $('#txtCoreDiameter').val('');
    $('#txtFinishDiameter').val('');
    $('#txtCoverLength').val('');

    //set up num decimals based on customer uom
    var coreDiameter = quote.ProductSelection.CoreDiameter;
    var finishDiameter = quote.ProductSelection.FinishDiameter;
    var coverLength = quote.ProductSelection.CoverLength;

    $('#txtCoreDiameter').val(coreDiameter == undefined || isNaN(coreDiameter) ? '' :
										  parseFloat(coreDiameter).toFixed(numDecimalPlaces).toString());
    $('#txtFinishDiameter').val(finishDiameter == undefined || isNaN(finishDiameter) ? '' :
										  parseFloat(finishDiameter).toFixed(numDecimalPlaces).toString());
    $('#txtCoverLength').val(coverLength == undefined || isNaN(coverLength) ? '' :
										  parseFloat(coverLength).toFixed(numDecimalPlaces).toString());
}

//----------------------------------------------------------------------------------
//		Init prod drop down - this works for both new quote and existing quote 
//----------------------------------------------------------------------------------
function InitProductDropDown(quote) {
    //get standard config - if there are matches based on application code, show that list
    var jsonRankDataStandardConfig = RankDataStandardConfiguration_Get();
    if (jsonRankDataStandardConfig.length > 0) {
        //filter on rule1, rule 2
        jsonRankDataStandardConfig = FilterRankOnRule1Rule2(jsonRankDataStandardConfig, quote.Customer);
    }
    //2016-05-26 - SC - Per Robin - Append the rank existing items to the list instead or either/or
    var jsonRankDataRankExisting = RankDataRankExisting_Get();
    //if (jsonRankData.length == 0) {
    //    jsonRankData = RankDataRankExisting_Get();
    //}
    //populate dropdownlist
    var resultHTML = '';
    var hasSelected = false;
    $.each(jsonRankDataStandardConfig, function (i, item) {
        var isSelected = false;
        if (!hasSelected && quote.ProductSelection.ProductName != undefined &&
				item.ProductName.toLowerCase() == quote.ProductSelection.ProductName.toLowerCase()) {
            isSelected = true;
            hasSelected = true;
        }
        resultHTML += AppendProductDropDownItem(item, isSelected);
    });
    //2016-05-26 - SC - Per Robin - Append the rank existing items to the list instead or either/or
    $.each(jsonRankDataRankExisting, function (i, item) {
        var isSelected = false;
        if (!hasSelected && quote.ProductSelection.ProductName != undefined &&
				item.ProductName.toLowerCase() == quote.ProductSelection.ProductName.toLowerCase()) {
            isSelected = true;
            hasSelected = true;
        }
        resultHTML += AppendProductDropDownItem(item, isSelected);
    });
    //do some special handling for quote from history
    if (quote.Product.ProductName != undefined) {
        //if no match, then this means the productSelection from the historical quote isn't in the list
        //add to the list and select
        if (!hasSelected) {
            //insert at front
            resultHTML = AppendProductDropDownItem(quote.Product, true) + resultHTML;
        }
    }

    //if nothing selected, make 'select one' the selected item
    var selectHTML = "<option value='-1' %%SELECTED%%>Select One</option>";
    selectHTML = selectHTML.replace(/%%SELECTED%%/g, !hasSelected ? 'selected ' : '');
    resultHTML = selectHTML + resultHTML;
    $('#ddlProductName').html(resultHTML);
    var count = jsonRankDataStandardConfig.length + jsonRankDataRankExisting.length;
    LogMessage(_moduleName_machineSpecSelection + ": InitProductDropDown - matches: " + count);

    //set prod image for historical quote
    SetProductImage(quote.ProductSelection.ProductImage);
}

//----------------------------------------------------------------------------------
//		Take items and build out html for current item
//----------------------------------------------------------------------------------
function AppendProductDropDownItem(item, isSelected) {
    var selectHTML = "<option value='%%VALUE%%' %%SELECTED%% data-rank-concatenated='%%RANK_CONCATENATED%%' " +
							" data-rank-existing='%%RANK_EXISTING%%' " +
							" data-images-concatenated='%%IMAGES_CONCATENATED%%' " +
                            " data-product-image='%%PRODUCT_IMAGE%%' >%%TEXT%%</option>";
    selectHTML = selectHTML.replace(/%%VALUE%%/g, item.ProductName);
    selectHTML = selectHTML.replace(/%%SELECTED%%/g, isSelected ? 'selected ' : '');
    selectHTML = selectHTML.replace(/%%TEXT%%/g, item.ProductName);
    selectHTML = selectHTML.replace(/%%RANK_CONCATENATED%%/g, item.AppTypeRankConcatenated);
    selectHTML = selectHTML.replace(/%%RANK_EXISTING%%/g, item.RankExisting);
    selectHTML = selectHTML.replace(/%%IMAGES_CONCATENATED%%/g, item.RankExisting ? "" : item.ImagesConcatenated);
    selectHTML = selectHTML.replace(/%%PRODUCT_IMAGE%%/g, item.ProductImage);
    return selectHTML;
}

//----------------------------------------------------------------------------------
//		SetProductImage - called on ddlProduct change or init screen from history
//----------------------------------------------------------------------------------
function SetProductImage(productImage) {
    //set the prod image
    var imgHTML = '<img class="image product-image" style="z-index:1" src="' + _ImagePathProduct + '%%IMAGE_NAME%%" alt="" />';
    imgHTML = imgHTML.replace('%%IMAGE_NAME%%', productImage);
    if (productImage == undefined || productImage == '') imgHTML = '';
    $('#page1-prod-image-container').html(imgHTML);
}

//----------------------------------------------------------------------------------
//		Init slider values, min, max using default settings
//----------------------------------------------------------------------------------
function InitSliderValuesDefault(sectionName, prodLine) {
    sectionName = sectionName.toLowerCase();
    prodLine = prodLine.toLowerCase();
    var lineLoad = '0';
    var lineLoadRange = '0,350';
    var temperature = '0';
    var temperatureRange = '0,170';
    var speed = '0';
    var speedRange = '0,1600';

    //loop through all the elements an pull out the default values
    //if none found, use 0, 0, 0
    $.each(_jsonSliderConfig, function (i, item) {
        if (item.SectionName == sectionName && item.ProductLine == prodLine) {
            if (item.AttributeType == 'line load') {
                lineLoad = parseInt(item.DefaultValue);
                lineLoadRange = item.MinValue + ',' + item.MaxValue;
            }
            if (item.AttributeType == 'temperature') {
                temperature = parseInt(item.DefaultValue);
                temperatureRange = item.MinValue + ',' + item.MaxValue;
            }
            if (item.AttributeType == 'speed') {
                speed = parseInt(item.DefaultValue);
                speedRange = item.MinValue + ',' + item.MaxValue;
            }
        }
    });
    //slider is initialized on load of page which only happens once. Therefore, setting the max, min 
    //is not being updated. It is not an exposed setting of the slider. For now, revert everything
    //to use the initial mins, maxs 
    lineLoadRange = '0,350';
    temperatureRange = '0,170';
    speedRange = '0,1600';

    InitSliderValues(lineLoad, lineLoadRange, temperature, temperatureRange, speed, speedRange);
}

//----------------------------------------------------------------------------------
//		Init slider values, min, max using quote values and default ranges
//----------------------------------------------------------------------------------
function InitSliderValuesFromQuote(quote) {
    sectionName = 'calendar';
    prodLine = 'rolls';
    var lineLoadRange = '0,350';
    var temperatureRange = '0,170';
    var speedRange = '0,1600';

    //loop through all the elements an pull out the default values
    //if none found, use 0, 0, 0
    $.each(_jsonSliderConfig, function (i, item) {
        if (item.SectionName == sectionName && item.ProductLine == prodLine) {
            if (item.AttributeType == 'line load') {
                lineLoadRange = item.MinValue + ',' + item.MaxValue;
            }
            if (item.AttributeType == 'temperature') {
                temperatureRange = item.MinValue + ',' + item.MaxValue;
            }
            if (item.AttributeType == 'speed') {
                speedRange = item.MinValue + ',' + item.MaxValue;
            }
        }
    });
    //slider is initialized on load of page which only happens once. Therefore, setting the max, min 
    //is not being updated. It is not an exposed setting of the slider. For now, revert everything
    //to use the initial mins, maxs 
    lineLoadRange = '0,350';
    temperatureRange = '0,170';
    speedRange = '0,1600';

    InitSliderValues(quote.ProductSelection.LineLoad,
		lineLoadRange,
        quote.ProductSelection.Temperature,
        temperatureRange,
        quote.ProductSelection.Speed,
        speedRange);
}

//----------------------------------------------------------------------------------
//		Init slider values, min, max 
//----------------------------------------------------------------------------------
function InitSliderValues(lineLoad, lineLoadRange, temperature, temperatureRange, speed, speedRange) {
    //set mins, max, initial value
    $('#lineLoadSlider').val(lineLoad); //75
    $('#lineLoadSlider').attr('data-slider-range', lineLoadRange); //'0,350'
    $('#temperatureSlider').val(temperature);  //80
    $('#temperatureSlider').attr('data-slider-range', temperatureRange); //'0,170'
    $('#speedSlider').val(speed); //425
    $('#speedSlider').attr('data-slider-range', speedRange); // '0,1600'

    //TBD - slider not obeying mins, max set at run time

    //----------------------------------------------------------------------------------
    //		Slider initialize event, set the corresponding display labels
    //----------------------------------------------------------------------------------
    $("[data-slider]").each(function () {
        //assign slider text, knob
        var min = $(this).attr('data-slider-range').split(',')[0];
        var max = $(this).attr('data-slider-range').split(',')[1];
        var val = parseFloat($(this).val());
        //don't let the knob extend beyond the min, max
        if (val > max) val = parseFloat(max);
        if (val < min) val = parseFloat(min);
        var percentLeft = (val - parseFloat(min)) * 100 / (parseFloat(max) - parseFloat(min));

        //move the slider knob
        $('#' + $(this).attr('id') + '-slider .dragger').css('left', percentLeft.toString() + '%');
        //update related data
        UpdateRelatedSliderDisplay($(this), val, val / max);
        //update slider labels
        $(this).parent().find('.slider-label-min').html(min);
        $(this).parent().find('.slider-label-max').html(max);
        //<, > labels
        var min33 = parseInt((max - min) * .29) + parseInt(min);
        var min50 = parseInt((max - min) * .5) + parseInt(min);
        var min67 = parseInt((max - min) * .72) + parseInt(min);
        $(this).parent().parent().find('.range-label.label-left').html('< ' + min33);
        $(this).parent().parent().find('.range-label.label-center').html(min50);
        $(this).parent().parent().find('.range-label.label-right').html('> ' + min67);
    })
}


//----------------------------------------------------------------------------------
//		//before validation, pull out the core diameter, finish diameter, cover length, prod name
//----------------------------------------------------------------------------------
function UpdateRollDimensions(sender) {
    //parse to num decimal places based on customer uom class (metric = 2, imperial = 4)
    var quote = Quote_Get();
    var isMetric = quote.Customer.ImperialMetric == undefined || quote.Customer.ImperialMetric.toLowerCase() == 'm';
    var numDecimalPlaces = isMetric ? 2 : 4;
    var coreDiameter = $('#txtCoreDiameter').val();
    var finishDiameter = $('#txtFinishDiameter').val();
    var coverLength = $('#txtCoverLength').val();
    quote.ProductSelection.CoreDiameter = coreDiameter.length == 0 || isNaN(coreDiameter) ? undefined :
										  parseFloat($('#txtCoreDiameter').val()).toFixed(numDecimalPlaces).toString();
    quote.ProductSelection.FinishDiameter = finishDiameter.length == 0 || isNaN(finishDiameter) ? undefined :
										  parseFloat($('#txtFinishDiameter').val()).toFixed(numDecimalPlaces).toString();
    quote.ProductSelection.CoverLength = coverLength.length == 0 || isNaN(coverLength) ? undefined :
										  parseFloat($('#txtCoverLength').val()).toFixed(numDecimalPlaces).toString();
    Quote_Update(quote);
}

//----------------------------------------------------------------------------------
//		Validation - Is everything selected (customer, machine, application, paper grade)
//----------------------------------------------------------------------------------
function ValidateMachineSpecSelection(sender) {
    var result = true;
    var message = "";
    var quote = Quote_Get();

    //page 1 js - data
    if (quote.ProductSelection.CoreDiameter == null || quote.ProductSelection.CoreDiameter == '') {
        message += (message.length > 0 ? " <br />" : "");
        message += "Core diameter is required.";
        result = false;
    }
    if (quote.ProductSelection.CoreDiameter < 0) {
        message += (message.length > 0 ? " <br />" : "");
        message += "Core diameter - value < 0.";
        result = false;
    }
    if (quote.ProductSelection.FinishDiameter == null || quote.ProductSelection.FinishDiameter == '') {
        message += (message.length > 0 ? " <br />" : "");
        message += "Finish diameter is required.";
        result = false;
    }
    if (quote.ProductSelection.FinishDiameter < 0) {
        message += (message.length > 0 ? " <br />" : "");
        message += "Finish diameter - value < 0.";
        result = false;
    }
    if (quote.ProductSelection.CoverLength == null || quote.ProductSelection.CoverLength == '') {
        message += (message.length > 0 ? " <br />" : "");
        message += "Cover length is required.";
        result = false;
    }
    if (quote.ProductSelection.CoverLength < 0) {
        message += (message.length > 0 ? " <br />" : "");
        message += "Cover length - value < 0.";
        result = false;
    }
    if (quote.ProductSelection.ProductName == undefined || quote.ProductSelection.ProductName == '-1') {
        message += (message.length > 0 ? " <br />" : "");
        message += "Product Name is required.";
        result = false;
    }
    if (quote.ProductSelection.LineLoad == null || quote.ProductSelection.LineLoad < 0) {
        message += (message.length > 0 ? " <br />" : "");
        message += "Line Load is required.";
        result = false;
    }
    if (quote.ProductSelection.Temperature == null || quote.ProductSelection.Temperature < 0) {
        message += (message.length > 0 ? " <br />" : "");
        message += "Temperature is required.";
        result = false;
    }
    if (quote.ProductSelection.Speed == null || quote.ProductSelection.Speed < 0) {
        message += (message.length > 0 ? " <br />" : "");
        message += "Speed is required.";
        result = false;
    }
    //TBD - add validation for min, max line load, temps, speed
    //TBD - add validation for numeric values

    //show the message
    if (!result) {
        ShowMessage("Product Selector", message, 'error', sender);
    }
    return result;
}

//----------------------------------------------------------------------------------
//		Update the slider related UI and quote data
//----------------------------------------------------------------------------------
function UpdateRelatedSliderDisplay(sender, val, ratio) {
    // adds the value to the correct circle text			
    sender.nextAll(".output:first").html(val.toFixed(0));

    //find the location of the CCS circles
    var sliderName = sender.attr('id');
    var s1 = $("#" + sliderName).parent("div").siblings(".s1");
    var s2 = $("#" + sliderName).parent("div").siblings(".s2");
    var s3 = $("#" + sliderName).parent("div").siblings(".s3");

    //convert ration into degrees
    var percent = ratio * 100;
    var degrees = percent * 3.6;
    var rot = "rotate(" + degrees + "deg)";

    //rotate the CSS circles
    if (degrees < '180') {
        $(s1).css("-webkit-transform", rot);
        $(s3).css("z-index", "3");
        $(s2).css("-webkit-transform", "rotate(0deg)");
    }

    if (degrees > '180') {
        $(s3).css("z-index", "0");
        $(s2).css("-webkit-transform", rot);
        $(s1).css("-webkit-transform", "rotate(180deg)");
    }

    else {
        $(s2).css("-webkit-transform", "rotate(180deg)");
    }
    //update hidden quote
    var quote = Quote_Get();
    switch (sender.attr('id')) {
        case 'lineLoadSlider':
            quote.ProductSelection.LineLoad = val.toFixed(0);
            break;
        case 'temperatureSlider':
            quote.ProductSelection.Temperature = val.toFixed(0);
            break;
        case 'speedSlider':
            quote.ProductSelection.Speed = val.toFixed(0);
            break;
    }
    Quote_Update(quote);

}

//----------------------------------------------------------------------------------
//		Load Default Slider settings from XML
//----------------------------------------------------------------------------------
function LoadSectionAttributes() {
    $.get(_sliderDefaultData, function (data) {
        LogMessage(_moduleName_machineSpecSelection + ": Load Section Attributes data");
        //init jSON obj
        _jsonSliderConfig = [];

        //loop through all the elements with name of 'entry'
        $(data).find("entry").each(function (index, element) {

            var itemAdd = {};
            itemAdd.SectionName = $(element).find('d\\:SectionName,SectionName').text().toLowerCase();
            itemAdd.ProductLine = $(element).find('d\\:ProductLine,ProductLine').text().toLowerCase();
            itemAdd.AttributeType = $(element).find('d\\:AttributeType,AttributeType').text().toLowerCase();
            itemAdd.MinValue = $(element).find('d\\:Low,Low').text();
            itemAdd.DefaultValue = $(element).find('d\\:StandardConfig,StandardConfig').text();
            itemAdd.MaxValue = $(element).find('d\\:High,High').text();
            _jsonSliderConfig.push(itemAdd);
        }); //loop over each entry tag in XML

        //save in memory json OBJ to hidden field
        //$("input#hfSliderDefaults").val(JSON.stringify(_jsonSliderConfig));

        LogMessage(_moduleName_machineSpecSelection + ": Load Section Attributes data - " + _jsonSliderConfig.length + " items");

    })
    .done(function () {
        //
    })
    .fail(function () {
        //this will show error and hide loading ui
        ShowMessage("Machine Selection", "Error getting section attributes data", 'error', null);
    });
}

