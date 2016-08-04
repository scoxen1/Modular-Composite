var _moduleName_error = "app_log";
var _targetEnvironment = 'PHONEGAP';  //'PHONEGAP', 'DEV'
var _writeToLog = true;

//-----------------------------------------------------------------------------------
//      Wire up events
//-----------------------------------------------------------------------------------
function appLogInit()
{
	//hide message
	$('.message-container span.icon-close').on('tapstart', function(){
	//$(document).on('tap', '.message-container span.icon-close', function () {
		return HideMessage();
	});

	//hide message
	$('.message-container-bg').on('tapstart', function(){
	//$(document).on('tap', '.message-container-bg', function () {
		return HideMessage();
	});

}

//-----------------------------------------------------------------------------------
//      get target environment - data access and logging use this to determine how to proceed
//-----------------------------------------------------------------------------------
function IsEnvironmentAIR()
{
    return (_targetEnvironment == 'AIR');
}

//-----------------------------------------------------------------------------------
//      get target environment - data access and logging use this to determine how to proceed
//-----------------------------------------------------------------------------------
function IsEnvironmentDEV() {
    return (_targetEnvironment == 'DEV');
}

//-----------------------------------------------------------------------------------
//      get target environment - data access and logging use this to determine how to proceed
//-----------------------------------------------------------------------------------
function IsEnvironmentPHONEGAP() {
    return (_targetEnvironment == 'PHONEGAP');
}

//-----------------------------------------------------------------------------------
//      Error Handling and Logging - Air has different debug console syntax
//-----------------------------------------------------------------------------------
function LogMessage(message) {
    if (!_writeToLog) return;
    //log to console
	if (!IsEnvironmentAIR()) {
		console.log(message);
	}
	else {
	    air.trace(message);
	}
}

function ShowMessage(title, message, type, sender) {
    //if loading ui is showing, hide so we can see message
    HideLoadingUI();

    var messageTitle = $('.message-container .title');
    messageTitle.html(title);
    var messageBody = $('.message-container .body');
    messageBody.html(message);
    //set a bg container so user cannot click links behind message
    $('div.message-container-bg').show();
    //set css class for message type and show
    var messageContainer = $('.message-container');
    messageContainer.removeClass('error');
    messageContainer.removeClass('success');
    messageContainer.removeClass('warning');
    messageContainer.removeClass('info');
    messageContainer.addClass(type);
    messageContainer.show();
    //expect an element object
    //posiiton based on location of sender button
//SC - position at sender requires jQueryUI which we don't have
//reference to - check compatability w/ Air before uncommenting
/*
    if (sender != undefined) {
        messageContainer.position({
            my: "center",
            at: "center",
            of: sender,
            collision: "fit"
        });
    }
        //position center of screen or close to button calling event
    else {
*/
        var toppos = ($(window).height() / 2) - (messageContainer.outerHeight() / 2);
        var leftpos = ($(window).width() / 2) - (messageContainer.outerWidth() / 2);
        messageContainer.css('top', toppos).css('left', leftpos);
        //scroll so we can see the message
        $("html, body").animate({ scrollTop: messageContainer.offset().top - 40 }, 0);
//    }

}

function HideMessage() {
    LogMessage(_moduleName_error + ": Hide Message");
    $('div.message-container-bg').hide();
    $('.message-container').hide();
    return false;
}

//-----------------------------------------------------------------------------------
//      Loading UI - hide/show
//-----------------------------------------------------------------------------------
function ShowLoadingUI() {
    $("div.message-container-bg").show();
    var container = $("div.loading-container");
    var toppos = ($(window).height() / 2) - (container.outerHeight() / 2);
    var leftpos = ($(window).width() / 2) - (container.outerWidth() / 2);
    container.show();
    container.css('top', toppos).css('left', leftpos);
}

function HideLoadingUI() {
    $("div.message-container-bg").hide();
    $("div.loading-container").fadeOut(900);
}



