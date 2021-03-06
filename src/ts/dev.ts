import { global_base_url, setServerOnline, setServerOffline, isServerOnline, sendJsonp } from "./ajax";

declare var ENFORCE_PROD:number;

export function isDev(){
    // return false;
    let url = window.location.href;
    url = url.toLowerCase();
    url = url.replace('http://',"").replace('https://','');
    if((<any>url).startsWith('127.0.0.1') || (<any>url).startsWith('localhost')){
        return true;
    }
    return false;
}

export function isProd(){
    return !isDev();
}

export function reviveServer(){
    if(isDev()){
        setServerOnline();
        return; // local server always online
    }
    // to send request to server to wake it up. POOR ME
    let waiting = false;
    let closeFirewallHandler = setInterval(()=>{
        if(isServerOnline()){
            // console.log('server online');
            $('#SafeConnectionModal').modal("hide");    
        }
        else{
            $('#SafeConnectionModal').modal("show");
            // console.log("server lost"); 
        }
    },100);
    let trialHandler = setInterval(()=>{
        // if(waiting){
        //     return;
        // }
        try {
            waiting = true;
            $('#SafeConnectionModal').modal("show");
            $.ajax({
                url: global_base_url + "/test",
        
                method: "get",
             
                // The name of the callback parameter, as specified by the YQL service
                jsonp: 'callback',
             
                // Tell jQuery we're expecting JSONP
                dataType: "jsonp",
             
                jsonpCallback: "revive"
            }).done((resp)=>{
                setServerOnline();
                // setTimeout(()=>{
                //     $('#SafeConnectionModal').modal("hide");
                // },100);
                
                waiting = false;
                let reload = localStorage.getItem("reload");
                if(reload.toLowerCase() == "yes"){
                    localStorage.setItem("reload","no");
                    // location.reload(); // reload this page
                    console.log("reload");
                }
                
                clearInterval(trialHandler);
            }).fail((err)=>{
                waiting = false;
                setServerOffline();
                console.log("waiting for server");
                $('#SafeConnectionModal').modal("show");
            });
        } catch (error) {
            console.log("error in connect");
        };
    },500);   
}

export function checkDBStatus(){
    sendJsonp('/db_info',null,"post","checkDB").done((resp)=>{
        // console.log(resp);
        console.log("DB Platform:",resp.data['name']);
    });
}
