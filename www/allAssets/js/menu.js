// JavaScript Document
var _moduleName_menu = "Menu.js";
var _currentPageId = 'page1';

function menu() {
    "use strict";

    var menuStatus = "hidden";

    //----------------------------------------------------------------------------------
    //		on initial load, show menu
    //----------------------------------------------------------------------------------
    openMainMenu();

}

//----------------------------------------------------------------------------------
//		Wire up events
//----------------------------------------------------------------------------------
$(function () {
    /////// Menu Button open and close///////////////
    $('#btn-menu').on('tapstart', function () {
        if (menuStatus === "hidden") {
            openMainMenu();
        }
        else {
            closeMainMenu();

        }
    });

    /////tap background to get the menu closed
    /*$('#menuBackDrop').on('tapstart', function(){
        if (menuStatus === "show"){
             menuStatus = "hidden";	
            closeMainMenu();
        }
    });*/

    ////////Main menu retun to starting list//////
    $('#close-menu').on('tap', function () {
        closeMainMenu();
    });

    //----------------------------------------------------------------------------------
    //		Load cust select
    //----------------------------------------------------------------------------------
    $('.btn-cust-select').on('tapstart', function () {
        try {
            HideAllPagesAndNavButtons();
            $("div.nav-btns li.li-update-software").removeClass('hide');
            $("#new-quote").show();
            _currentPageId = 'new-quote';
            customerSelection_Load(null);
        }
        catch (error) {
            ShowMessage(_applicationName, error.message, 'error', $(this));
            LogMessage(_moduleName_menu + ": " + $(this).attr('id') + " - Error: " + error.message + '...Details: ' + error.details);
        }
        closeMainMenu();
    });


    //----------------------------------------------------------------------------------
    //		Load New Customer Screen
    //----------------------------------------------------------------------------------
    $('.btn-new-customer').on('tapstart', function () {
        try {
            HideAllPagesAndNavButtons();
            $("div.nav-btns li.li-update-software").removeClass('hide');
            $("#new-customer").show();
            _currentPageId = 'new-customer';
            newCustomer_Load();
        }
        catch (error) {
            ShowMessage(_applicationName, error.message, 'error', $(this));
            LogMessage(_moduleName_menu + ": " + $(this).attr('id') + " - Error: " + error.message + '...Details: ' + error.details);
        }
        closeMainMenu();
    });

    //----------------------------------------------------------------------------------
    //		Load Quote History
    //----------------------------------------------------------------------------------
    $('.btn-quote-history').on('tapstart', function () {
        try {
            HideAllPagesAndNavButtons();
            $("div.nav-btns li.li-update-software").removeClass('hide');
            $("#quote-history").show();
            _currentPageId = 'quote-history';
            quoteHistory_load();
        }
        catch (error) {
            ShowMessage(_applicationName, error.message, 'error', $(this));
            LogMessage(_moduleName_menu + ": " + $(this).attr('id') + " - Error: " + error.message + '...Details: ' + error.details);
        }
        closeMainMenu();
    });

    //----------------------------------------------------------------------------------
    //		Customer select screen tap to advance to page 1
    //----------------------------------------------------------------------------------
    //btn-new-quote-next - SC - this is arrow click from customer selection screen
    $('#btn-new-quote-next').on('tapstart', function () {
        try {
            LogMessage(_moduleName_menu + ": Customer selection - next");
            //make sure all is selected prior to proceeding
            if (!ValidateCustomerSelection($(this), "Customer Selection")) return;
            HideAllPagesAndNavButtons();
            $("div.nav-btns li.li-update-software").removeClass('hide');
            $("#page1").show();
            _currentPageId = 'page1';
            machineSpecSelection_load();
        }
        catch (error) {
            ShowMessage(_applicationName, error.message, 'error', $(this));
            LogMessage(_moduleName_menu + ": " + $(this).attr('id') + " - Error: " + error.message + '...Details: ' + error.details);
        }
    });

    //----------------------------------------------------------------------------------
    //		New Customer select tap - arrow next to page 1
    //----------------------------------------------------------------------------------
    $('#btn-new-customer-next').on('tapstart', function () {
        try {
            LogMessage(_moduleName_menu + ": New Customer - next");
            //save & validate new customer
            //make sure all is selected prior to proceeding
            if (!ValidateAndSaveNewCustomer($(this))) return;
            HideAllPagesAndNavButtons();
            $("div.nav-btns li.li-update-software").removeClass('hide');
            $("#page1").show();
            _currentPageId = 'page1';
            machineSpecSelection_load();
        }
        catch (error) {
            ShowMessage(_applicationName, error.message, 'error', $(this));
            LogMessage(_moduleName_menu + ": " + $(this).attr('id') + " - Error: " + error.message + '...Details: ' + error.details);
        }
        closeMainMenu();
    });

    //----------------------------------------------------------------------------------
    //		Advance to product selection screen - arrow next
    //----------------------------------------------------------------------------------
    $('#btn-next').on('tapstart', function () {
        try {
            //before validation, pull out the core diameter, finish diameter, cover length, prod name
            UpdateRollDimensions();
            LogMessage(_moduleName_menu + ": Advance to product selection page 2 - next");
            //make sure all is selected prior to proceeding
            if (!ValidateCustomerSelection($(this), "Product Selection")) return;
            if (!ValidateMachineSpecSelection($(this))) return;

            HideAllPagesAndNavButtons();
            $("div.nav-btns li.li-update-software").removeClass('hide');
            $("#page2").show();
            _currentPageId = 'page2';
            productSelection_load();
        }
        catch (error) {
            ShowMessage(_applicationName, error.message, 'error', $(this));
            LogMessage(_moduleName_menu + ": " + $(this).attr('id') + " - Error: " + error.message + '...Details: ' + error.details);
        }
        closeMainMenu();
    });


    //----------------------------------------------------------------------------------
    //		Product selection (page 2) - Submit the selection and advance to quote-wrapper screen 
    //		Navigate to quote view page. Called from submit click or from quote history page
    //----------------------------------------------------------------------------------
    $('#submit').on('tapstart', function () {
        try {
            //$('.btn-submit.icon.check').on('tap', function () {
            LogMessage(_moduleName_prodselection + ": tap - btn-submit icon check");
            //make sure customer is selected prior to proceeding - this should be checked upstream as well
            if (!ValidateCustomerSelection($(this), "Customer Selection")) return;
            //check the machine specs are assigned
            if (!ValidateMachineSpecSelection($(this))) return;
            //check that all ranks have a value. 
            if (!ValidateProductSelection($(this))) return;

            //show/hide correct page
            HideAllPagesAndNavButtons();
            $("div.nav-btns li.li-modify").removeClass('hide');
            $("div.nav-btns li.li-confirm").removeClass('hide');
            $("#quote-wrapper").show();
            _currentPageId = 'quote-wrapper';
            quoteView_load();
        }
        catch (error) {
            ShowMessage(_applicationName, error.message, 'error', $(this));
            LogMessage(_moduleName_menu + ": " + $(this).attr('id') + " - Error: " + error.message + '...Details: ' + error.details);
        }
        closeMainMenu();
    });

    //----------------------------------------------------------------------------------
    //		Quote modify click - go back to page 2
    //----------------------------------------------------------------------------------
    $("a#btn-modify-quote").on("tap", function () {
        try {
            LogMessage(_moduleName_menu + ": btn-modify-quote - go back to page 2");
            HideAllPagesAndNavButtons();
            $("div.nav-btns li.li-update-software").removeClass('hide');
            $("#page2").show();
            _currentPageId = 'page2';
            productSelectionModify_load();
        }
        catch (error) {
            ShowMessage(_applicationName, error.message, 'error', $(this));
            LogMessage(_moduleName_menu + ": " + $(this).attr('id') + " - Error: " + error.message + '...Details: ' + error.details);
        }
        return false;
    });

    //----------------------------------------------------------------------------------
    //		Quote confirm click - save to history, generate PDF
    //----------------------------------------------------------------------------------
    $("a#btn-confirm-quote").on("tap", function () {
        try {
            LogMessage(_moduleName_menu + ": btn-confirm-quote - save quote to history");
            var quote = Quote_Get();
            QuoteHistory_Add(quote);
            ShowMessage('Save Quote', 'Your quote has been saved', 'info', null);
            //hide email icon, hide save, back
            $("div.nav-btns li.li-email").removeClass('hide').addClass('hide');
            $("div.nav-btns li.li-modify").removeClass('hide').addClass('hide');
            $("div.nav-btns li.li-confirm").removeClass('hide').addClass('hide');
        }
        catch (error) {
            ShowMessage(_applicationName, error.message, 'error', $(this));
            LogMessage(_moduleName_menu + ": " + $(this).attr('id') + " - Error: " + error.message + '...Details: ' + error.details);
        }
        return false;
    });

    //----------------------------------------------------------------------------------
    //		Debug log - show
    //----------------------------------------------------------------------------------
    $("li.btn-debug-show").on("tap", function () {
        try {
            HideAllPagesAndNavButtons();
            LogMessage(_moduleName_menu + ": btn-debug-show - show log");
            $("#debug-console").show();
            //scroll so we can see the last message
            $("html, body").animate({ scrollTop: $("div.debug-console").offset().top + 400 }, 0);
            $("div.debug-console").scrollTop(function () { return this.scrollHeight; });
            _currentPageId = 'debug-console';
            closeMainMenu();
        }
        catch (error) {
            ShowMessage(_applicationName, error.message, 'error', $(this));
            LogMessage(_moduleName_menu + ": " + $(this).attr('id') + " - Error: " + error.message + '...Details: ' + error.details);
        }
        return false;
    });

});


////Open Main Menu ////////
function openMainMenu() {

	$('#menuBackDrop').fadeIn('fast', function () {
		//$('#menu').css("top","200px");
		$('#menu').css({
			"-webkit-animation": "menu-down 1s",
			"-webkit-animation-iteration-count": " 1",
			"-webkit-animation-fill-mode": "forwards"
		});
	});
	menuStatus = "show";

}

/////Closing main Menu////////////
function closeMainMenu() {
	//$('#loader').show();
	var menu = $('#menu');
	menu.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
	   function () {
		   // code to execute after animation ends
		   $('#menuBackDrop').fadeOut('fast');
		   $('#loader').hide();
	   });

	$('#menu').css({
		"-webkit-animation": "menu-up .7s",
		"-webkit-animation-iteration-count": " .7",
		"-webkit-animation-fill-mode": "forwards"
	});

	menuStatus = "hidden";
	//if current page is page 1 and no customer selected, nav to customer selected.
	if (_currentPageId == 'page1' && !IsCustomerSelected()) {
		HideAllPagesAndNavButtons();
		$("div.nav-btns li.li-update-software").removeClass('hide');
		$("#new-quote").show();
		_currentPageId = 'new-quote';
		customerSelection_Load(null);
	}
}


//----------------------------------------------------------------------------------
//		hide all pages and icons, then each button click will show current page and associated icons
//----------------------------------------------------------------------------------
function HideAllPagesAndNavButtons() {
	$(".app-page").hide();
	$("div.nav-btns li.li-update-software").removeClass('hide').addClass('hide');
	$("div.nav-btns li.li-modify").removeClass('hide').addClass('hide');
	$("div.nav-btns li.li-confirm").removeClass('hide').addClass('hide');
}

