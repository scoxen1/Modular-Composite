var _moduleName_prodselection = "page2.js";

//global vars
var _jsonRankDataFiltered = [];
var _jsonRankDataFilteredStart = [];

var _UseDynamicSummary = true;

//----------------------------------------------------------------------------------
//		Product Selection Screen
//----------------------------------------------------------------------------------
function productSelection() {
    "use strict";
    LogMessage(_moduleName_prodselection + ": init");

    //----------------------------------------------------------------------------------
    //		Reset tap on the page. Clear out data and re-init
    //----------------------------------------------------------------------------------
    $("#Reset").on("tap", function () {
        LogMessage(_moduleName_prodselection + ": reset tap");
        productSelection_load();
    });

    //----------------------------------------------------------------------------------
    //		Tap on appType item in right hand list
    //----------------------------------------------------------------------------------
    $('.vnav-menu').on('tap', '.vnav-item', function () {
        //$('.vnav-item').on('tap', function () {
        var appTypeId = $(this).attr('data-appTypeId');
        var caption = GetAppTypeCaption(parseInt(appTypeId));
        LogMessage(_moduleName_prodselection + ": tap - " + caption);
        onSelectAppType(appTypeId, caption);
        return false;
    });


    //----------------------------------------------------------------------------------
    //		Clicking an item in the number 0-10 - bottom panel
    //----------------------------------------------------------------------------------
    $('a.circle-num1').on('tap', function () {
        LogMessage(_moduleName_prodselection + ": tap - circle-num1");
        //if disabled AND original class exists, show message so they know they can't select 
        if ($(this).hasClass('disabled') && $(this).hasClass('original')) {
            ShowMessage('Select Rank', 'This rank is not allowed with the current configuration.', 'error', null);
        }
        //if disabled, return 
        if ($(this).hasClass('disabled')) return false;

        var appTypeId = $(this).attr('data-appTypeId');
        var val = $(this).attr('data-rank');

        //remove selected from all others
        $('a.circle-num1').removeClass('selected');
        //populate the benefit value
        var benefitText = $(this).attr('data-benefit');
        $('p#benefit-text').html(benefitText);
        //mark the item selected
        $(this).removeClass('selected').addClass('selected');
        //do this below in setuprankcircles
        //        //set the summary panel item value
        //        $('.list-p2[data-appTypeId=' + appTypeId + '] a.circle-num').removeClass('selected');
        //        $('.list-p2[data-appTypeId=' + appTypeId + '] a.circle-num[data-rank=' + val + '] ').addClass('selected');

        //set the number value beneath the icon
        var spanRank = $('.appType-indicator-panel li[data-appTypeId=' + appTypeId + '] span.rank-caption');
        spanRank.html('<br />' + val);
        spanRank.removeClass('complete').addClass('complete');
        spanRank.css('display', 'inline-block');

        //set the rank value in the collection of ranks
        var quote = Quote_Get();
        $.each(quote.AppType, function (i, itemRank) {
            if (itemRank.AppTypeId == appTypeId) {
                itemRank.Rank = val;
                itemRank.Benefit = benefitText;
                return false;
            }
        });
        Quote_Update(quote);

        //filter allowable ranks
        //set the circles enabled/disabled based on filter
        if (_UseDynamicSummary) {
            var jsonFilteredSummary = FilterAllowableRanksSummary(quote);
            SetupRankCirclesSummary(jsonFilteredSummary, quote);
            LoadLayeredImageByAppType('');
        }
        else {
            var jsonFilteredEnd = FilterAllowableRanks(quote, appTypeId);
            SetupRankCircles(appTypeId, jsonFilteredEnd, quote);
        }

        //if all selected, then pick out the first product that matches
        SelectMatchingProduct();
    });
} //end initial function declaration at top of js

//----------------------------------------------------------------------------------
//		Init page 
//----------------------------------------------------------------------------------
// Hidden elements on page load
function productSelection_load() {
    LogMessage(_moduleName_prodselection + ": page load");
    //clear status circle
    $('.vnav-item').removeClass('in-progress').removeClass('complete');
    //clear summary benchmark
    $('.list-p2 a.circle-num').removeClass('selected');
    //clear the benefit value
    $('p#benefit-text').html('');
    //hide all rank labels beneath icons
    $('.appType-indicator-panel li img').hide();
    $('.appType-indicator-panel span.rank-caption').hide();
    $('.appType-indicator-panel span.rank-caption').removeClass('complete');
    $('.appType-indicator-panel span.rank-caption').html('');

    //json data storing the selected values and filtered appl ranks
    SelectedRank_Init();
    FilteredRankData_Init();
    //vertical nav - upper right - only load initially
    LoadAppTypeVerticalNav();
    LoadHorizontalIconRankIndicators();
    //load up the sidebar ui
    LoadSidebarRankItems();

    var quote = Quote_Get();

    //load initial image
    LoadLayeredImageByAppType('');
    $('#page2-benchmark-product-name').html(quote.ProductSelection.ProductName); 

    //load up the initial appType
    var caption = 'Select Application Type to begin';
    onSelectAppType(null, caption);
    if (_UseDynamicSummary) {
        var jsonFilteredSummary = FilterAllowableRanksSummary(quote);
        SetupRankCirclesSummary(jsonFilteredSummary, quote);
    }
}

//----------------------------------------------------------------------------------
//		this is called from the back button on the quoteview page
//----------------------------------------------------------------------------------
function productSelectionModify_load() {
    LogMessage(_moduleName_prodselection + ": modify");
    //skip over the initialization of filter, circles, etc. return to the page as it was
    //and show the abrasion rank
    var appTypeId = _appTypeId_Abrasion;
    var caption = GetAppTypeCaption(appTypeId);
    onSelectAppType(appTypeId, caption);
}

//----------------------------------------------------------------------------------
//		Load left rank circles on the left sidebar
//----------------------------------------------------------------------------------
function LoadSidebarRankItems() {
    //build out list items of rank circles - re-use for each app type	
    var templateRankLiHTML = '<li><a class="circle-num" href="#" data-rank="%%RANK%%">%%RANK%%</a></li>';
    var rankLiHTML = '';
    for (var i = _MinRank; i <= _MaxRank; i++) {
        rankLiHTML += templateRankLiHTML.replace(/%%RANK%%/gi, i.toString());
    }

    var resultHTML = '';
    var templateAppTypeContainer = '<div class="list-p2" data-appTypeId="%%AppTypeId%%" >' +
			'<span class="section-heading" >%%Caption%%</span>' +
            '<ul>%%RANK_LI%%</ul>' +
            '</div>' +
			'<div class="clear"></div>';
    //pull out rank caption, app type id, then append 10 rank list items
    var quote = Quote_Get();
    if (quote == undefined || quote.AppType == undefined || quote.AppType.length == 0) { return; }
    var result = true;
    $.each(quote.AppType, function (i, item) {
        if (item.ShowInList) { //only show if this value is true
            var currentItemHTML = templateAppTypeContainer;
            currentItemHTML = currentItemHTML.replace(/%%AppTypeId%%/gi, item.AppTypeId);
            currentItemHTML = currentItemHTML.replace(/%%Caption%%/gi, item.Caption);
            currentItemHTML = currentItemHTML.replace(/%%RANK_LI%%/gi, rankLiHTML);
            resultHTML += currentItemHTML;
        }
    });
    //put the html into its container
    var container = $('#results-scroll-box');
    container.html('');
    container.html(resultHTML);
}

//----------------------------------------------------------------------------------
//		Based on the user ranks selected, load a base image and and show a layer of images
//		NOTE - Image paths are case sensitive - folder name and image names
//----------------------------------------------------------------------------------
function LoadLayeredImageByAppType(prodName) {
    //get container
    $('#page2-prod-image-container').html('');

    if (prodName == undefined || prodName == '') prodName = '&nbsp;';
    var resultHTML = '';
	//var resultHTML = '<span class="product-name" >' + prodName + '</span><br/>';
    //load a layered image associated with each rank
    var templateImg = '<img class="image product-image" style="z-index:%%Z-INDEX%%" src="' + _ImagePathProductLayers + '%%IMAGE_NAME%%" alt="" />';
    //load base image - use base image 0 unless 'impact resistance' selected, then use base1
    var baseImageName = _ImageNameBase;
    var quote = Quote_Get();
    if (!SelectedRank_IsEmpty()) {
        $.each(quote.AppType, function (i, item) {
            if (item.AppTypeId == 4 && item.Rank != undefined) {
                baseImageName = _ImageNameBase1;
            }
        });
    }
	
    var imgHTML = templateImg;
    imgHTML = imgHTML.replace('%%IMAGE_NAME%%', baseImageName.toLowerCase());
    imgHTML = imgHTML.replace('%%Z-INDEX%%', '0');
    resultHTML += imgHTML;
    if (!SelectedRank_IsEmpty()) {
        $.each(quote.AppType, function (i, item) {
            if (item.ShowInList && item.Rank != undefined) {
                var imgHTML = templateImg;
                var imgName = item.LayeredImageNamingConvention.replace('%%RANK%%', item.Rank == 10 ? item.Rank : '0' + item.Rank);
                imgHTML = imgHTML.replace('%%IMAGE_NAME%%', imgName.toLowerCase());
                imgHTML = imgHTML.replace('%%Z-INDEX%%', GetLayeredImageZIndex(item.AppTypeId).toString());
                resultHTML += imgHTML;
            }
        });
    }
	//put span with name after
    resultHTML += '<span class="product-name" >' + prodName + '</span><br/>';
	
    $('#page2-prod-image-container').html(resultHTML);
}

//----------------------------------------------------------------------------------
//		Load vertical nav items in the upper right
//----------------------------------------------------------------------------------
function LoadAppTypeVerticalNav() {
    //build out list items of rank circles - re-use for each app type	
    var templateLI = '<li><a href="#" class="vnav-item" data-apptypeid="%%AppTypeId%%">' +
					 '<img src="%%ICON%%" class="image" alt="">%%Caption%%' +
                     '<div class="circle-26px status-circle"></div></a></li>';
    var resultHTML = '';
    var appTypes = AppType_Get();
    $.each(appTypes, function (i, item) {
        var currentItemHTML = templateLI;
        currentItemHTML = currentItemHTML.replace(/%%AppTypeId%%/gi, item.AppTypeId);
        currentItemHTML = currentItemHTML.replace(/%%Caption%%/gi, item.Caption);
        currentItemHTML = currentItemHTML.replace(/%%ICON%%/gi, item.IconName_LightGray);
        resultHTML += currentItemHTML;
    });
    //put the html into its container
    var container = $('#page2 .vnav-menu');
    container.html('');
    container.html(resultHTML);
}

//----------------------------------------------------------------------------------
//		Load vertical nav items in the upper right
//----------------------------------------------------------------------------------
function LoadHorizontalIconRankIndicators() {

    //build out list items of rank circles - re-use for each app type	
    var templateLI = '<li data-apptypeid="%%AppTypeId%%" >' +
					 '<img src="%%ICON-GRAY%%" class="image inprogress" alt="">' +
					 '<img src="%%ICON-BLUE%%" class="image complete" alt="">' +
					 '<span class="rank-caption" ></span>';
    var resultHTML = '';
    var appTypes = AppType_Get();
    $.each(appTypes, function (i, item) {
        var currentItemHTML = templateLI;
        currentItemHTML = currentItemHTML.replace(/%%AppTypeId%%/gi, item.AppTypeId);
        currentItemHTML = currentItemHTML.replace(/%%Caption%%/gi, item.Caption);
        currentItemHTML = currentItemHTML.replace(/%%ICON-GRAY%%/gi, item.IconName_LightGray);
        currentItemHTML = currentItemHTML.replace(/%%ICON-BLUE%%/gi, item.IconName_Blue);
        resultHTML += currentItemHTML;
    });
    //put the html into its container
    var container = $('.appType-indicator-panel ul');
    container.html('');
    container.html(resultHTML);
}

//----------------------------------------------------------------------------------
//		Validation
//----------------------------------------------------------------------------------
function ValidateProductSelection(sender) {
    var result = true;
    var message = "";
    var quote = Quote_Get();
    $.each(quote.AppType, function (i, itemRank) {
        if (itemRank.Rank == undefined) {
            message += (message.length > 0 ? " <br />" : "");
            message += itemRank.Caption + " is required.";
            result = false;
        }
    });

    //check that there is a matching product
    //only do this check if all other validation passes. If we are mid-stream, don
    if (result && quote.Product == null) {
        message += (message.length > 0 ? " <br />" : "");
        message += "There are no products matching these application type selections.";
        result = false;
    }
    //show the message
    if (!result) {
        ShowMessage("Product Selector", message, 'error', sender);
    }
    return result;
}

//----------------------------------------------------------------------------------
//		Set CSS classes of vnav and icon items based on whether rank is selected
//		Incomplete = no rank and not currently selected (red circle, no icon)
//		In progress = currently selected, no value set (yellow circle, gray icon)
//		Complete = rank set (blue circle, blue icon)
//----------------------------------------------------------------------------------
function AssignCompletionStatus(appTypeId) {
    LogMessage(_moduleName_prodselection + ": AssignCompletionStatus");
    var quote = Quote_Get();

    //vnav - set all to deselect
    $('.vnav-item').removeClass('selected');

    $.each(quote.AppType, function (i, itemRank) {
        var vnavItem = $('.vnav-item[data-appTypeId=' + itemRank.AppTypeId + ']');
        var imgInProgress = $('.appType-indicator-panel li[data-appTypeId=' + itemRank.AppTypeId + '] img.inprogress');
        var imgComplete = $('.appType-indicator-panel li[data-appTypeId=' + itemRank.AppTypeId + '] img.complete');
        var rankCaption = $('.appType-indicator-panel li[data-appTypeId=' + itemRank.AppTypeId + '] span.rank-caption');
        imgInProgress.removeClass('show');
        imgComplete.removeClass('show');
        //mark complete
        if (itemRank.Rank != undefined) {
            vnavItem.removeClass('in-progress').removeClass('complete').addClass('complete');
            imgComplete.addClass('show');
            //set the number value beneath the icon
            rankCaption.html('<br />' + itemRank.Rank);
            rankCaption.removeClass('complete').addClass('complete');
            rankCaption.show();
        }
            //mark in progress
        else if (itemRank.AppTypeId == appTypeId) {
            vnavItem.removeClass('in-progress').addClass('in-progress');
            imgInProgress.addClass('show');
            //set the number value beneath the icon
            rankCaption.html('');
            rankCaption.removeClass('complete');
            rankCaption.hide();
        }
        else {
            vnavItem.removeClass('in-progress').removeClass('complete');
            //set the number value beneath the icon
            rankCaption.html('');
            rankCaption.removeClass('complete');
            rankCaption.hide();
        }
    });
}

//----------------------------------------------------------------------------------
//		Update the selected panel at bottom of screen
//		Update the completion status in right panel
//      Update the summary panel on the left sidebar
//		Update the icons above bottom panel
//----------------------------------------------------------------------------------
function onSelectAppType(appTypeId, caption) {
    LogMessage(_moduleName_prodselection + ": onSelectAppType - " + caption);

    //update vnav & image icon incomplete/complete/not started
    AssignCompletionStatus(appTypeId);

    //set caption
    $('.appType-caption').html(caption);

    //clear the benefit value
    $('p#benefit-text').html('');

    var quote = Quote_Get();
    //filter allowable ranks
    var jsonFilteredEnd = FilterAllowableRanks(quote, appTypeId);
    //set the circles enabled/disabled based on filter
    SetupRankCircles(appTypeId, jsonFilteredEnd, quote);
}


//----------------------------------------------------------------------------------
//		Filter allowable ranks based on quote selections
//----------------------------------------------------------------------------------
function FilterAllowableRanks(quote, appTypeId) {
    LogMessage(_moduleName_prodselection + ": FilterAllowableRanks - Filter Count at start: " + _jsonRankDataFilteredStart.length);

    //before spend time looping everything, check selected ranks to see if anything is saved yet.
    //if nothing, then skip the filtering and everything is eligible
    var result = [];
    if (SelectedRank_IsEmpty()) {
        LogMessage(_moduleName_prodselection + ": FilterAllowableRanks - No selected ranks - nothing to filter. ");
        result = _jsonRankDataFilteredStart;
    }
    else {
        //we have to re-filter all prods each time to avoid this scenario. I selected abrasion rank,
        //it filtered out all other abrasion possibilities that weren't equal to the rank. Then I couldn't return 
        //to abrasion and change it. 

        //loop over everything in filter and pull out eligible items into newly filtered subset
        $.each(_jsonRankDataFilteredStart, function (j, item) {
            var bEligible = true;
            //loop over selected ranks to see if this item is using one of the selected ranks
            $.each(quote.AppType, function (s, itemRank) {
                //only consider the current apptype for the filter
                if (item.AppTypeRankConcatenated.indexOf(appTypeId + ':') != -1) {
                    //rank undefined means any rank is eligible, don't filter against the current appTypeId
                    if (itemRank.Rank != undefined && itemRank.AppTypeId != appTypeId) {
                        //if the selected rank is not found in the concatenated list of ranks, this item is ineligible.
                        var rankSearchString = itemRank.AppTypeId + ':' + itemRank.Rank;
                        if (item.AppTypeRankConcatenated.indexOf(rankSearchString) == -1) {
                            //ineligible, don't look for any more for this item 
                            bEligible = false;
                            return;
                        }
                    }
                }
            });
            //if eligible, push it to the filtered list
            if (bEligible) {
                result.push(item);
            }

        });

        //now update the filtered set
        FilteredRankData_Update(result);
    }  //end if/then check for empty

    LogMessage(_moduleName_prodselection + ": FilterAllowableRanks - Filter Count at end: " + result.length);

    return result;
}

//----------------------------------------------------------------------------------
//		Filter allowable ranks based on quote selections
//----------------------------------------------------------------------------------
function FilterAllowableRanksSummary(quote) {
    LogMessage(_moduleName_prodselection + ": FilterAllowableRanksSummary - Filter Count at start: " + _jsonRankDataFilteredStart.length);

    //before spend time looping everything, check selected ranks to see if anything is saved yet.
    //if nothing, then skip the filtering and everything is eligible
    var result = [];
    if (SelectedRank_IsEmpty()) {
        LogMessage(_moduleName_prodselection + ": FilterAllowableRanksSummary - No selected ranks - nothing to filter. ");
        result = _jsonRankDataFilteredStart;
    }
    else {
        //we have to re-filter all prods each time to avoid this scenario. I selected abrasion rank,
        //it filtered out all other abrasion possibilities that weren't equal to the rank. Then I couldn't return 
        //to abrasion and change it. 

        //loop over everything in filter and pull out eligible items into newly filtered subset
        $.each(_jsonRankDataFilteredStart, function (j, item) {
            var bEligible = true;
            //loop over selected ranks to see if this item is using one of the selected ranks
            $.each(quote.AppType, function (s, itemRank) {
                //rank undefined means any rank is eligible, DO filter against the current appTypeId
                if (itemRank.Rank != undefined) {
                    //if the selected rank is not found in the concatenated list of ranks, this item is ineligible.
                    var rankSearchString = itemRank.AppTypeId + ':' + itemRank.Rank;
                    if (item.AppTypeRankConcatenated.indexOf(rankSearchString) == -1) {
                        //ineligible, don't look for any more for this item 
                        bEligible = false;
                        return;
                    }
                }
            });
            //if eligible, push it to the filtered list
            if (bEligible) {
                result.push(item);
            }

        });
    }  //end if/then check for empty

    LogMessage(_moduleName_prodselection + ": FilterAllowableRanksSummary - Filter Count at end: " + result.length);

    return result;
}

//----------------------------------------------------------------------------------
//		Determine which ranks are allowed for the current appType
//		Set the benefit for each rank
//----------------------------------------------------------------------------------
function SetupRankCircles(appTypeId, jsonRankFiltered, quote) {

    //remove style related to previous app type, remove benefit value
    $('a.circle-num1').removeClass('selected').removeClass('disabled').removeClass('original');
    $('a.circle-num1').attr('data-benefit', '');
    //assign appType id to circles
    $('a.circle-num1').attr('data-appTypeId', appTypeId);

    //setup rank circles on sidebar - loop through each case and update enable/disable/selected/original
    //only do this from circle tap event
    if (!_UseDynamicSummary) {
        SetupRankCirclesSummary(jsonRankFiltered, quote);
        LoadLayeredImageByAppType();
    }

    //if nothing in filtered collection, then all are disabled
    //setup initial state and then return
    if (appTypeId == undefined || jsonRankFiltered == undefined || jsonRankFiltered.length == 0) {
        InitializeRankCircles(jsonRankFiltered, quote);
        return;
    }

    //applies to big rank circles at bottom
    //if this item is previously selected, then show that.
    //if this item has original rank, then show that.
    $.each(quote.AppType, function (i, itemRank) {
        //big rank circles - only selected rank
        if (itemRank.AppTypeId == appTypeId && itemRank.OriginalRank != undefined) {
            //mark the selected rank
            $('a.circle-num1[data-rank=' + itemRank.OriginalRank.toString() + ']').addClass('original');
        }
        if (itemRank.AppTypeId == appTypeId && itemRank.Rank != undefined) {
            //mark the selected rank
            $('a.circle-num1[data-rank=' + itemRank.Rank.toString() + ']').addClass('selected');
            //re-set the benefit value
            $('p#benefit-text').html(itemRank.Benefit);
        }
    });

    //store the ranks allowed here
    var ranksCumulated = [];
    for (var i = _MinRank; i <= _MaxRank; i++) {
        ranksCumulated[i] = false;
    }
    //loop over products left in filtered ranks, pull out ranks allowed for this appType
    //set up benefit text associated with rank
    $.each(jsonRankFiltered, function (i, item) {
        var rank = null;
        var benefit = '';
        $.each(item.AppType, function (i, appType) {
            if (appTypeId == appType.AppTypeId && ranksCumulated[appType.Rank] == false) {
                LogMessage(_moduleName_prodselection + ": SetupRankCircles - Enable " +
                "App Type Id - " + appType.AppTypeId + ", Rank - " + appType.Rank);
                rank = appType.Rank;
                benefit = appType.Benefit;
                return;
            }
        });

        if (rank != undefined && rank != '')
            //add this rank to an array, once it reaches 11 elements (0-10), then we can stop. If we never get to 10, the loop will end.
            ranksCumulated[rank] = true;
        //add benefit text to the circle for this rank
        $('a.circle-num1[data-rank=' + rank + ']').attr('data-benefit', benefit);
    });

    //update the circles to reflect enable/disable
    for (var i = _MinRank; i <= _MaxRank; i++) {
        if (!ranksCumulated[i]) {
            //big circles you click at bottom
            $('a.circle-num1[data-rank=' + i + ']').addClass('disabled');
        }
    }
    //for (var i = _MinRank; i <= _MaxRank; i++) {
    //    LogMessage(_moduleName_prodselection + ": SetupRankCircles - " +
    //				"a.circle-num1[data-rank=" + i + "] disabled: " +
    //				$('a.circle-num1[data-rank=' + i + ']').hasClass('disabled'));
    //}
}

//----------------------------------------------------------------------------------
//		This will get called when appTypeId is null on SetupRankCircles
//      It is only expected to be null on initial page load
//----------------------------------------------------------------------------------
function InitializeRankCircles(jsonRankFiltered, quote) {
    $('a.circle-num1').addClass('disabled');
    $('a.circle-num1').attr('data-appTypeId', '');
}

//----------------------------------------------------------------------------------
//		Loop through the summary panel and update rank circles enable/disable/selected/original
//----------------------------------------------------------------------------------
function SetupRankCirclesSummary(jsonRankFiltered, quote) {

    //set selected, original rank values
    $('.list-p2 a.circle-num').removeClass('selected').removeClass('original');
    $.each(quote.AppType, function (i, item) {
        if (item.ShowInList) {
            $('.list-p2[data-appTypeId=' + item.AppTypeId + '] a.circle-num').removeClass('selected');
            //setup small rank circles - all app types
            if (item.OriginalRank != undefined) {
                //small circles on left sidebar
                $('.list-p2[data-appTypeId=' + item.AppTypeId + '] a.circle-num[data-rank=' + item.OriginalRank + '] ').addClass('original');
            }
            if (item.Rank != undefined) {
                //small circles on left sidebar
                $('.list-p2[data-appTypeId=' + item.AppTypeId + '] a.circle-num[data-rank=' + item.Rank + '] ').addClass('selected');
            }
        }
    });

    //set all disabled then remove disabled for each item that has allowable rank
    $('.list-p2 a.circle-num').removeClass('disabled').addClass('disabled');
    //loop over products left in filtered ranks, pull out ranks allowed for this appType
    //set up benefit text associated with rank
    $.each(jsonRankFiltered, function (i, item) {
        $.each(item.AppType, function (i, appType) {
            //only worry about certain app types that show in summary
            if (appType.ShowInList && (appType.Rank != undefined || appType.Rank != '')) {
                $('.list-p2[data-appTypeId=' + appType.AppTypeId + '] a.circle-num[data-rank=' + appType.Rank + '] ').removeClass('disabled');
            }
        });
    });
}


//----------------------------------------------------------------------------------
//		if all items selected, then set the matching product
//----------------------------------------------------------------------------------
function SelectMatchingProduct() {
    //if anything not set, exit function
    var quote = Quote_Get();
    var allSelected = true;
    $.each(quote.AppType, function (i, itemRank) {
        if (itemRank.Rank == undefined) {
            quote.Product = null;
            Quote_Update(quote);
            allSelected = false;
            return;
        }
    });
    if (!allSelected) return;

    //if we get here, then filter matching prod
    var matches = FilterProductsBasedOnRanks(quote, _jsonRankDataFilteredStart);
    switch (matches.length) {
        case 0:
            quote.Product = null;
            Quote_Update(quote);
            return;
        case 1:
        default:  //greater than one, choose first one for now, revisit this
            quote.Product = matches[0];
            Quote_Update(quote);
            //update the product image
            LoadLayeredImageByAppType(quote.Product.ProductName);
            return;
    }
}


function FilterProductsBasedOnRanks(quote, jsonRankData) {
    LogMessage(_moduleName_prodselection + ": FilterProductsBasedOnRanks - Filter Count at start: " + jsonRankData.length);
    var result = [];

    //build out a concatenated list of ranks and match to each item's concatenated list of ranks
    //loop over selected ranks to see if this item is using one of the selected ranks
    var rankSearchString = '';
    $.each(quote.AppType, function (s, item) {
        if (item.Rank != undefined) {
            rankSearchString += (rankSearchString.length > 0 ? '|' : '')
            rankSearchString += item.AppTypeId + ':' + item.Rank;
        }
    });
    //nothing in selected ranks, therefore no matches in filter
    if (rankSearchString == '') return result;

    //loop over everything in ranks array and pull out eligible items into newly filtered subset
    $.each(jsonRankData, function (j, itemAppType) {
        //if eligible, push it to the filtered list
        if (itemAppType.AppTypeRankConcatenated == rankSearchString) {
            LogMessage(_moduleName_prodselection + ": FilterProductsBasedOnRanks - Match: " +
								itemAppType.ProductName + ' (' +
								' Module:' + itemAppType.ModuleName +
								', App Code:' + itemAppType.ApplicationCode +
								', Rank Ex:' + itemAppType.RankExisting +
								', Std Config:' + itemAppType.StandardConfiguration +
								')');
            result.push(itemAppType);
        }
    });

    //now update the filtered set
    LogMessage(_moduleName_prodselection + ": FilterProductsBasedOnRanks - Filter Count at end: " + result.length);
    return result;
}

//----------------------------------------------------------------------------------
//		Check if selected rank is empty
//----------------------------------------------------------------------------------
function SelectedRank_IsEmpty() {
    var quote = Quote_Get();
    if (quote == undefined) { return true; }
    if (quote.AppType == undefined || quote.AppType.length == 0) { return true; }
    var result = true;
    $.each(quote.AppType, function (i, item) {
        if (item.Rank != undefined) {
            result = false;
            return;
        }
    });
    return result;
}

//----------------------------------------------------------------------------------
//		Init selected rank - clear out ranks, benefits
//----------------------------------------------------------------------------------
function SelectedRank_Init() {
    var quote = Quote_Get();
    $.each(quote.AppType, function (i, item) {
        item.Rank = null;
        item.Benefit = '';
    });
    Quote_Update(quote);
}

//----------------------------------------------------------------------------------
//		Init filtered Rank object
//		As user progresses through screen, this will get whittled down to one product
// 		At start, filter down to matching appl code matches
//----------------------------------------------------------------------------------
function FilteredRankData_Init() {
    //initially filter it only on the data where the application code matches up
    //match 1st 2 letters in ApplRank.XML ApplicationCode field against 1st 2 letters in selected customer ApplicationCode 
    //if customer is local customer, then don't filter (confirm this)
    var quote = Quote_Get();
    var jsonRankData = RankDataRankNotExisting_Get();
    //Application Code Match - get first 2 chars
    _jsonRankDataFilteredStart = FilterRankOnApplicationCode(jsonRankData, quote.Customer.ApplicationCode);

    _jsonRankDataFiltered = _jsonRankDataFilteredStart;
    $("input#hfApplicationRankFiltered").val(JSON.stringify(_jsonRankDataFiltered));
}

//----------------------------------------------------------------------------------
//		pull selected Rank from hidden field and parse json into object
//----------------------------------------------------------------------------------
function FilteredRankData_Get() {
    if (_jsonRankDataFiltered == undefined) {
        FilteredRankData_Init();
    }
    return _jsonRankDataFiltered;
}

//----------------------------------------------------------------------------------
//		Update the Rank hidden field with data from a json object
//----------------------------------------------------------------------------------
function FilteredRankData_Update(jsonData) {
    if (jsonData == undefined) {
        $("input#hfApplicationRankFiltered").val('');
        _jsonRankDataFiltered = null;
    }
    else {
        _jsonRankDataFiltered = jsonData;
        $("input#hfApplicationRankFiltered").val(JSON.stringify(jsonData));
    }
}


