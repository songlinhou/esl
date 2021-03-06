import { ICoordinate, processCoordinates, getDistanceBetween } from "./location";
import { getEmailOfUser } from "./credential";
import { showStartChatModal } from "./appointment";

declare var Instascan:any;


interface IQRJSON {
    appname:string,
    username:string,
    latitude:number,
    longitude:number,
    timestamp:string,
    email:string,
    role:string
};


export function generateInvitingQRCodeURL(username:string,location:ICoordinate,timestamp:string,role:string,size:string="150x150"):string{
    let email = getEmailOfUser();
    let dataJSON:IQRJSON = {
        appname:"ESL-CPMS",
        username:username,
        latitude:location.latitude,
        longitude:location.longitude,
        email:email,
        role:role,
        timestamp:timestamp
    };
    return generateQRCodeAddr(JSON.stringify(dataJSON),size);
}

export function onInvitingQRCodeDecoded(result:string){
    let dataJSON:IQRJSON = JSON.parse(result);
    let initDate = new Date(dataJSON.timestamp);
    let now = new Date();
    let durationInMinutes = (now.getTime() - initDate.getTime()) / 1000 / 60;
    let role = "Student";
    if(dataJSON.role.toUpperCase() == "STUDENT"){
        role = "Student";
    }
    else if(dataJSON.role.toUpperCase() == "PARTNER"){
        role = "Partner";
    }
    else if(dataJSON.role.toUpperCase() == "ADMIN"){
        role = "Admin";
    }
    if(durationInMinutes > 5){
        //expired
        $('#debugGroupInfo').html("expried already");
        $('#qrScannerModal').modal("hide");
        // $('#conversatonResultModal').modal("show");

        showStartChatModal(dataJSON.username,dataJSON.email,role);
        console.log("already expired");
    }
    else{
        //check wether they are nearby
        if(dataJSON.latitude == dataJSON.longitude && dataJSON.latitude == -1){
            // invalid position, skip validation
            // form a group
            console.log("skip position check. group formed!");

            
            $('#debugGroupInfo').html("positions from both devices are not enabled;");
            $('#qrScannerModal').modal("hide");
            // $('#conversatonResultModal').modal("show");
            showStartChatModal(dataJSON.username,dataJSON.email,dataJSON.role);
            return;
        }

        processCoordinates((lat:number,long:number)=>{
            if(lat == long && lat == -1){
                // invalid position, skip validation
                // form a group
                console.log("skip position check. group formed!");
                $('#debugGroupInfo').html("positions from one device is not enabled;");
                $('#qrScannerModal').modal("hide");
                // $('#conversatonResultModal').modal("show");
                showStartChatModal(dataJSON.username,dataJSON.email,role);
                return;
            }
            let distanceInKM = getDistanceBetween(lat,long,dataJSON.latitude,dataJSON.longitude,'K');
            console.log("user distance (km)",distanceInKM);
            if(distanceInKM< 0.5){
                // within 0.5 km
                // valid position, success
                console.log("position check successful. group formed!");
                $('#debugGroupInfo').html("positions check successful;");
                $('#qrScannerModal').modal("hide");
                // $('#conversatonResultModal').modal("show");
                showStartChatModal(dataJSON.username,dataJSON.email,role);
                return;
            }
            else{
                // beyone 0.5 km
                // valid position, fail
                console.log("position check fail. group not formed!");
                $('#debugGroupInfo').html("positions check failed!!");
                $('#qrScannerModal').modal("hide");
                // $('#conversatonResultModal').modal("show");
                showStartChatModal(dataJSON.username,dataJSON.email,role);
                return;
            }
        });
    }
}



export function generateQRCodeAddr(content:string,size:string="150x150"):string{
    //https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${content}`;
}



// export function setupQRScanner(video_id:string){
//     $('#changeJoinMethodBtn').html("4 Digit Code");
//     var scanner = new Instascan.Scanner({ video: $( `#${video_id}` )[0] });
//     scanner.addListener('scan', function (content:string) {
//         console.log(content);
//         alert(content);
//     });
//     Instascan.Camera.getCameras().then(function (cameras:any) {
//     if (cameras.length > 0) {
//         scanner.start(cameras[0]);
//     } else {
//         console.error('No cameras found.');
//         alert("no camera");
//     }
//     }).catch(function (e:any) {
//     console.error(e);
//         alert(e);
//     });
// }

