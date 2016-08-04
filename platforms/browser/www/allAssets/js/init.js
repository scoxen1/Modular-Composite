// JavaScript Document
var _moduleName_init = "Init.js";
var _applicationName = "Modular Composite";

$(document).ready(function () {

    LogMessage(_moduleName_init + ": document.ready");
    try {
        //TEST
        //DataAccess_TEST_CreateInsert();
        ShowLoadingUI();
        appUtility();
        appLogInit();
        //local XML data
        customerData();
        applicationTypeData();
        applRankData();
        //init pdf generation
        appPDFHelper();
        //init pdf alive generation  //used in AIR only
        if (IsEnvironmentAIR()) {
            appPDFAliveHelper();
        }

        customerSelection();
        //local database related code
        appDataAccessInit();
        //quoteView.js
        quoteView();
        //quoteHistory.js
        quoteHistory();
        //page 1.js
        machineSpecSelection();
        //page 2.js
        productSelection();
        HideLoadingUI();
        menu();

    }
    catch (error) {
        ShowMessage(_applicationName, error.message, 'error', $(this));
        LogMessage(_moduleName_init + ": Document.ready - Error: " + error.message + '...Details: ' + error.details);
    }

});



//if the app is online or not	
var connetionStatus;
function checkConnection() {
    "use strict";
    if (navigator.onLine) {
        // alert('online');
        connetionStatus = "true";

    } else {
        //alert('offline');
        connetionStatus = "false";
    }

}
checkConnection();


/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
//call from bottom of index page - this will get called on initial load
 var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener("online", onOnline, false);
        document.addEventListener("offline", onOffline, false);
        document.addEventListener("deviceready", this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        $('.device-ready').show();

        LogMessage('Received Event: ' + id);
    }
};


