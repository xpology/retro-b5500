/***********************************************************************
* retro-b5500/emulator B5500Console.js
************************************************************************
* Copyright (c) 2012,2014, Nigel Williams and Paul Kimpel.
* Licensed under the MIT License, see
*       http://www.opensource.org/licenses/mit-license.php
************************************************************************
* B5500 Operations Console Javascript module.
*
* Implements event handlers and control functions for the B5500 emulator
* operations console.
*
************************************************************************
* 2014-07-20  P.Kimpel
*   Original version, extracted from B5500Console.html.
***********************************************************************/
"use strict";

window.addEventListener("load", function() {
    var consolePanel = null;            // the ConsolePanel object
    var statusMsgTimer = 0;             // status message timer control token

    /**************************************/
    function systemShutDown() {
        /* Re-enables the startup buttons on the home page */

        consolePanel = null;
        document.getElementById("StartUpPoweredBtn").disabled = false;
        document.getElementById("StartUpNoPowerBtn").disabled = false;
        document.getElementById("StartUpPoweredBtn").focus();
        window.focus();
    }

    /**************************************/
    function systemStartup(ev) {
        /* Establishes the system components */
        var powerUp = (ev.target.id == "StartUpPoweredBtn" ? 1 : 0);

        consolePanel = new B5500ConsolePanel(window, powerUp, systemShutDown);
        document.getElementById("StartUpPoweredBtn").disabled = true;
        document.getElementById("StartUpNoPowerBtn").disabled = true;
    }

    /**************************************/
    function clearStatusMsg(inSeconds) {
        /* Delays for "inSeconds" seconds, then clears the StatusMsg element */

        if (statusMsgTimer) {
            clearTimeout(statusMsgTimer);
        }

        statusMsgTimer = setTimeout(function(ev) {
            document.getElementById("StatusMsg").textContent = "";
            statusMsgTimer = 0;
        }, inSeconds*1000);
    }

    /**************************************/
    function checkBrowser() {
        /* Checks whether this browser can support the necessary stuff */
        var missing = "";

        if (!window.ArrayBuffer) {missing += ", ArrayBuffer"}
        if (!window.DataView) {missing += ", DataView"}
        if (!window.Blob) {missing += ", Blob"}
        if (!window.File) {missing += ", File"}
        if (!window.FileReader) {missing += ", FileReader"}
        if (!window.FileList) {missing += ", FileList"}
        if (!window.indexedDB) {missing += ", IndexedDB"}
        if (!window.Promise) {missing += ", Promise"}
        if (!(window.performance && "now" in performance)) {missing += ", performance.now"}

        if (missing.length == 0) {
            return true;
        } else {
            alert("The emulator cannot run...\n" +
                "your browser does not support the following features:\n\n" +
                missing.substring(2));
            return false;
        }
    }

    /***** window.onload() outer block *****/

    document.getElementById("StartUpPoweredBtn").disabled = true;
    document.getElementById("StartUpNoPowerBtn").disabled = true;
    document.getElementById("EmulatorVersion").textContent = B5500CentralControl.version;
    if (checkBrowser()) {
        document.getElementById("StartUpPoweredBtn").disabled = false;
        document.getElementById("StartUpPoweredBtn").addEventListener("click", systemStartup);
        document.getElementById("StartUpNoPowerBtn").disabled = false;
        document.getElementById("StartUpNoPowerBtn").addEventListener("click", systemStartup);
        document.getElementById("StartUpPoweredBtn").focus();

        document.getElementById("StatusMsg").textContent = "The Application Cache feature has been deimplemented";
            clearStatusMsg(30);
    }
});
