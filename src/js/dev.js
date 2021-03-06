"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ajax_1 = require("./ajax");
function isDev() {
    // return false;
    var url = window.location.href;
    url = url.toLowerCase();
    url = url.replace('http://', "").replace('https://', '');
    if (url.startsWith('127.0.0.1') || url.startsWith('localhost')) {
        return true;
    }
    return false;
}
exports.isDev = isDev;
function isProd() {
    return !isDev();
}
exports.isProd = isProd;
function reviveServer() {
    if (isDev()) {
        ajax_1.setServerOnline();
        return; // local server always online
    }
    // to send request to server to wake it up. POOR ME
    var waiting = false;
    var closeFirewallHandler = setInterval(function () {
        if (ajax_1.isServerOnline()) {
            // console.log('server online');
            $('#SafeConnectionModal').modal("hide");
        }
        else {
            $('#SafeConnectionModal').modal("show");
            // console.log("server lost"); 
        }
    }, 100);
    var trialHandler = setInterval(function () {
        // if(waiting){
        //     return;
        // }
        try {
            waiting = true;
            $('#SafeConnectionModal').modal("show");
            $.ajax({
                url: ajax_1.global_base_url + "/test",
                method: "get",
                // The name of the callback parameter, as specified by the YQL service
                jsonp: 'callback',
                // Tell jQuery we're expecting JSONP
                dataType: "jsonp",
                jsonpCallback: "revive"
            }).done(function (resp) {
                ajax_1.setServerOnline();
                // setTimeout(()=>{
                //     $('#SafeConnectionModal').modal("hide");
                // },100);
                waiting = false;
                var reload = localStorage.getItem("reload");
                if (reload.toLowerCase() == "yes") {
                    localStorage.setItem("reload", "no");
                    // location.reload(); // reload this page
                    console.log("reload");
                }
                clearInterval(trialHandler);
            }).fail(function (err) {
                waiting = false;
                ajax_1.setServerOffline();
                console.log("waiting for server");
                $('#SafeConnectionModal').modal("show");
            });
        }
        catch (error) {
            console.log("error in connect");
        }
        ;
    }, 500);
}
exports.reviveServer = reviveServer;
function checkDBStatus() {
    ajax_1.sendJsonp('/db_info', null, "post", "checkDB").done(function (resp) {
        // console.log(resp);
        console.log("DB Platform:", resp.data['name']);
    });
}
exports.checkDBStatus = checkDBStatus;
//# sourceMappingURL=dev.js.map