const tmi = require('tmi.js');
var schedule = require('node-schedule');
const fs = require('fs');
const config = require('./configtools.js');

// Define configuration options
const opts = {
    identity: {
      username: (config.twitchapi.username),
      password: (config.twitchapi.password)
    },
    channels: [
      "tanglesheep"
    ],
    connection:{
      reconnect: true
    }
  };


//  var scena = "scene_655ebfbe-1998-4755-808d-4d1b032b11b1" ;

 //twitch tmi connection
 const client = new tmi.client(opts);
 client.on('connected', onConnectedHandler);
 client.connect();

  function onConnectedHandler (addr, port) {
   console.log(`* Connected to ${addr}:${port}`);
 } 
 //twitch tmi connection




client.on ('chat', function(channel, userstate,  message, self) {
//  console.log(message);
//   console.log (userstate);
if( message === "!premiumfeed") {
  
client.action("tanglesheep", userstate['display-name'] + " Premium Feeding was removed. :(  ");

} 

  
  // switch cams
               if( (message === "!birdcam") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                 birdcam();
                                   client.action("tanglesheep", userstate['display-name'] + " switching to bird cam ");
  
                                  } 
                                  
                                  if( (message === "!sheepcam") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                     sheepcam();
                                   client.action("tanglesheep", userstate['display-name'] + " switching to sheep cam ");
  
                                  } 
                                  
                                  if( (message === "!goatshedcam") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                     goatshedcam();
                                   client.action("tanglesheep", userstate['display-name'] + " switching to goat shed cam ");
                               
                                  } 
                                  
                                  if(( userstate['custom-reward-id'] === '99d381a5-b224-4277-a061-b42c5dc75221') && (message === "switchtosheepcam")) {
                                    sheepcam();
                                       client.action("tanglesheep", userstate['display-name'] + " switching to sheep cam ");
                     
                                   } 
                                    if(( userstate['custom-reward-id'] === '99d381a5-b224-4277-a061-b42c5dc75221') && (message === "switchtobirdcam")) {
                                      birdcam();
                                    client.action("tanglesheep", userstate['display-name'] + " switching to bird cam ");

                                  } 
                                    if( userstate['custom-reward-id'] === '65263b98-c85f-4905-b35a-a965eca3cba7') {
                                   
                                  client.action("tanglesheep","!8ball Answer " + userstate['display-name'] + " question..  ");

                                } 
                                
                                if( userstate['custom-reward-id'] === '44fe302e-9369-49db-bb48-f9c9fb80e128') {
                                  showstat();
                                  client.action("tanglesheep","woooow check stats  for today");

                                } 
                                
                                if ((( userstate['custom-reward-id'] === '9e47f62a-a26c-46c3-8eda-affb9124e652') && (message === "bigbirdcam")) || ((userstate.badges.subscriber || userstate.badges.founder))) {
                                  global.scena = "scene_0d23c014-d824-4172-a0bd-560b84e060e7";
                                  switchscene();
                                  client.action("tanglesheep","woooow big birds cam");

                                } 
                                
                                if((( userstate['custom-reward-id'] === '9e47f62a-a26c-46c3-8eda-affb9124e652') && (message === "biggoatcam")) || ((userstate.badges.subscriber || userstate.badges.founder))) {
                                  global.scena = "scene_7f387d78-3019-4394-bcc2-4182d1ecabbc";
                                  switchscene();
                                  client.action("tanglesheep","woooow big goat cam");

                                } 
                                
                                if((( userstate['custom-reward-id'] === '9e47f62a-a26c-46c3-8eda-affb9124e652')  && (message === "bigsheepcam")) || ((userstate.badges.subscriber || userstate.badges.founder))){
                                  global.scena = "scene_68c54b98-b21d-4c22-aaff-fd40eee037f4";
                                  switchscene();
                                  client.action("tanglesheep","woooow big sheep outside cam");

                                } 
                                
                                if((( userstate['custom-reward-id'] === '9e47f62a-a26c-46c3-8eda-affb9124e652') && (message === "bigsheepshed")) || ((userstate.badges.subscriber || userstate.badges.founder))) {
                                   global.scena = "scene_655ebfbe-1998-4755-808d-4d1b032b11b1";
                                  switchscene();
                                  client.action("tanglesheep","woooow big sheep shed cam");
                                 } 
                                 
                                 if( (message === "!sheepentry" ) && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                              camentry();
                                   client.action("tanglesheep", userstate['display-name'] + " camera moving to sheep shed entry ");
  
                                   } 
                                   
                              if( (message === "!sheepgarden") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                              camgarden();
                                   client.action("tanglesheep", userstate['display-name'] + " camera moving to sheep's garden ");
  
                   } 
                     if( (message === "!goat") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                              camaroundshed();
                                   client.action("tanglesheep", userstate['display-name'] + " camera moving to check goats area ");
  
                    } 
                      if( (message === "!sheepfargarden") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                               camfargarden();
                                   client.action("tanglesheep", userstate['display-name'] + " camera moving to check far away sheep ");
                     }
  
                       if( (message === "!sheeppatrol") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                                 camsheeppatrol();
                                   client.action("tanglesheep", userstate['display-name'] + " camera starting to patrol ");
                     }

                       if( (message === "!birdmain") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                                cambirdmain();
                                   client.action("tanglesheep", userstate['display-name'] + " Cage of Lary and Roby ");
                     }
  
                      if( (message === "!birdrest") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                                 cambirdrest();
                                   client.action("tanglesheep", userstate['display-name'] + " Resting place view ");
                     }
  
                      if( (message === "!birdfeeding") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                               cambirdfeeding();
                                   client.action("tanglesheep", userstate['display-name'] + " Feeding place view ");
                     }
  
                       if( (message === "!birdfeeding2") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                              cambirdfeeding2();
                                   client.action("tanglesheep", userstate['display-name'] + " Lary's feeding place ");
                     }
  
                      if( (message === "!bird2main") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                               cambird2main();
                                   client.action("tanglesheep", userstate['display-name'] + " Second cage all view ");
                     }
                    if( (message === "!bird2feeding") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                              cambird2feeding();
                                   client.action("tanglesheep", userstate['display-name'] + " Second cage feeding place view ");
                     }
                     if( (message === "!bird2rest") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                          cambird2rest();
                                   client.action("tanglesheep", userstate['display-name'] + " Second cage rest place view ");

                     }  
                     
                     if((( message === "!birdcam" ) || (message === "!sheepcam") || (message === "!goatshedcam") || (message === "!goat")) && (userstate['badge-info'] === null) ){
 
                      client.action("tanglesheep", userstate['display-name'] + " you need to be subscriber of tanglesheep channel");
            
                     }



                 // sheep free ptz move    
                     var movevalue = message.match(/\d+/g);
     
                     if (movevalue === null){
                       return false;
                      }
                     else if
                     ( (message == "!sheepcam x"+movevalue[0]+" y"+movevalue[1]+" zoom"+movevalue[2] ) && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                       x = movevalue[0] * 10;
                       y = movevalue[1] * 10;
                       zoom = movevalue[2] * 10;
                        sheepptzfree();
                    //  client.action("tanglesheep", userstate['display-name'] + " camera moving  ");
                     }
                     else if
                     ( (message == "!birdcam x"+movevalue[0]+" y"+movevalue[1]+" zoom"+movevalue[2] ) && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                       x = movevalue[0] * 10;;
                       y = movevalue[1] * 10;;
                       zoom = movevalue[2] * 10;
                       birdptzfree();
                    //  client.action("tanglesheep", userstate['display-name'] + " camera moving  ");
                     } 
  
  });








//camera handling

//dravci on
function birdcam () {
const SockJS = require('sockjs-client');
var sock = SockJS('http://192.168.1.60:59650/api');
 sock.onopen = function() {
              console.log('open');
                    var req = '{"jsonrpc": "2.0","id": 8,"method": "auth","params": {"resource": "TcpServerService","args": ["'+config.obscontrol.api+'"]}}';
                          sock.send(req);
//ovce off
               var req = {
                     "jsonrpc": "2.0",
                     "id": 10,
                     "method": "setVisibility",
                     "params": {
                                     "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"d73bb435-0675-4754-93f4-e32414e85657\",\"vlc_source_37f2c3f5-d5d1-4c0b-b48e-787fea5958c7\"]",
                                     "args": [false]
                                 }
         }
              sock.send(JSON.stringify(req));




  //dravci on
                             var req = {
                     "jsonrpc": "2.0",
                     "id": 10,
                     "method": "setVisibility",
                     "params": {
                                     "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"cc5c1a40-7761-49f7-b5f7-a2f24d73eff6\",\"vlc_source_4f468466-fa9c-4d48-bf98-869e7fb5c56c\"]",
                                     "args": [true]
                                 }
         }
              sock.send(JSON.stringify(req));


//dravci on
                             var req = {
                     "jsonrpc": "2.0",
                     "id": 10,
                     "method": "setVisibility",
                     "params": {
                                     "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"cc5c1a40-7761-49f7-b5f7-a2f24d73eff6\",\"vlc_source_4f468466-fa9c-4d48-bf98-869e7fb5c56c\"]",
                                     "args": [true]
                                 }
         }
              sock.send(JSON.stringify(req));




//goat off
var req = {
  "jsonrpc": "2.0",
  "id": 10,
  "method": "setVisibility",
  "params": {
                  "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"4cdb9f11-d7ee-4f04-8f3b-4bdd7f841d81\",\"vlc_source_c948cad3-cd7c-42dc-b554-5d472b1ac522\"]",
                  "args": [false]
              }
}
sock.send(JSON.stringify(req));



          };

 sock.onmessage = function(e) {
              console.log('message', e.data);
              sock.close();
          };

 sock.onclose = function() {
              console.log('close');
          };

}

 //ovce on

function sheepcam () {
const SockJS = require('sockjs-client');
var sock = SockJS('http://192.168.1.60:59650/api');
 sock.onopen = function() {
              console.log('open');
                    var req = '{"jsonrpc": "2.0","id": 8,"method": "auth","params": {"resource": "TcpServerService","args": ["'+config.obscontrol.api+'"]}}';
                          sock.send(req);
//ovce on
               var req = {
                     "jsonrpc": "2.0",
                     "id": 10,
                     "method": "setVisibility",
                     "params": {
                                     "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"d73bb435-0675-4754-93f4-e32414e85657\",\"vlc_source_37f2c3f5-d5d1-4c0b-b48e-787fea5958c7\"]",
                                     "args": [true]
                                 }
         }
              sock.send(JSON.stringify(req));




  //dravci off
                             var req = {
                     "jsonrpc": "2.0",
                     "id": 10,
                     "method": "setVisibility",
                     "params": {
                                     "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"cc5c1a40-7761-49f7-b5f7-a2f24d73eff6\",\"vlc_source_4f468466-fa9c-4d48-bf98-869e7fb5c56c\"]",
                                     "args": [false]
                                 }
         }
              sock.send(JSON.stringify(req));



//goat off
var req = {
  "jsonrpc": "2.0",
  "id": 10,
  "method": "setVisibility",
  "params": {
                  "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"4cdb9f11-d7ee-4f04-8f3b-4bdd7f841d81\",\"vlc_source_c948cad3-cd7c-42dc-b554-5d472b1ac522\"]",
                  "args": [false]
              }
}
sock.send(JSON.stringify(req));




          };

 sock.onmessage = function(e) {
              console.log('message', e.data);
              sock.close();
          };

 sock.onclose = function() {
              console.log('close');
          };

}



//goats on

function goatshedcam () {
  const SockJS = require('sockjs-client');
  var sock = SockJS('http://192.168.1.60:59650/api');
   sock.onopen = function() {
                console.log('open');
                      var req = '{"jsonrpc": "2.0","id": 8,"method": "auth","params": {"resource": "TcpServerService","args": ["'+config.obscontrol.api+'"]}}';
                            sock.send(req);
  //ovce off
                 var req = {
                       "jsonrpc": "2.0",
                       "id": 10,
                       "method": "setVisibility",
                       "params": {
                                       "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"d73bb435-0675-4754-93f4-e32414e85657\",\"vlc_source_37f2c3f5-d5d1-4c0b-b48e-787fea5958c7\"]",
                                       "args": [false]
                                   }
           }
                sock.send(JSON.stringify(req));
  
  
  
  
    //dravci off
                               var req = {
                       "jsonrpc": "2.0",
                       "id": 10,
                       "method": "setVisibility",
                       "params": {
                                       "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"cc5c1a40-7761-49f7-b5f7-a2f24d73eff6\",\"vlc_source_4f468466-fa9c-4d48-bf98-869e7fb5c56c\"]",
                                       "args": [false]
                                   }
           }
                sock.send(JSON.stringify(req));
  
  


//goat on
var req = {
  "jsonrpc": "2.0",
  "id": 10,
  "method": "setVisibility",
  "params": {
                  "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"4cdb9f11-d7ee-4f04-8f3b-4bdd7f841d81\",\"vlc_source_c948cad3-cd7c-42dc-b554-5d472b1ac522\"]",
                  "args": [true]
              }
}
sock.send(JSON.stringify(req));




            };

  
   sock.onmessage = function(e) {
                console.log('message', e.data);
                sock.close();
            };
  
   sock.onclose = function() {
                console.log('close');
            };
  
  }







//camera entry
function camentry () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.12/ISAPI/PTZCtrl/channels/1/presets/1/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//camera garden
function camgarden () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.12/ISAPI/PTZCtrl/channels/1/presets/2/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//camera aroundshed
function camfargarden () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.12/ISAPI/PTZCtrl/channels/1/presets/3/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//camera fargarden
function camaroundshed () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.12/ISAPI/PTZCtrl/channels/1/presets/4/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}


//camera sheep Patrol
function camsheeppatrol() {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.12/ISAPI/PTZCtrl/channels/1/presets/45/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}



//camera cambirdmain Preset 1
function cambirdmain () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/1/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}


//camera cambirdrest Preset 2
function cambirdrest () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/2/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}




//camera cambirdfeeding Preset 3
function cambirdfeeding () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/3/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}


//camera cambirdfeeding2 Preset 4
function cambirdfeeding2 () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/4/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}


//camera cambird2main Preset 5
function cambird2main () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/5/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//camera cambird2feeding Preset 6
function cambird2feeding () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/6/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//camera cambird2feeding Preset 7
function cambird2rest() {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/7/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//sheep freeeptz
function sheepptzfree () {
               
  var request = require('request');
   var options = {
  'method': 'PUT',
  'url': 'http://'+config.camera.pass+'@192.168.1.12/ISAPI/PTZCtrl/channels/1/absolute',
  'headers': {
    'Content-Type': 'application/xml'
  },
  body: "<PTZData>\n<AbsoluteHigh>\n<elevation> "+y+" </elevation>\n<azimuth> "+x+" </azimuth>\n<absoluteZoom>"+zoom+"</absoluteZoom>\n</AbsoluteHigh> \n</PTZData>"

};

request(options, function (error, response) { 
  console.log(error);
});
}

//birds freeeptz
function birdptzfree () {
               
  var request = require('request');
   var options = {
  'method': 'PUT',
  'url': 'http://'+config.camera.pass+'@192.168.1.14/ISAPI/PTZCtrl/channels/1/absolute',
  'headers': {
    'Content-Type': 'application/xml'
  },
  body: "<PTZData>\n<AbsoluteHigh>\n<elevation> "+y+" </elevation>\n<azimuth> "+x+" </azimuth>\n<absoluteZoom>"+zoom+"</absoluteZoom>\n</AbsoluteHigh> \n</PTZData>"

};

request(options, function (error, response) { 
  console.log(error);
});
}






// show statistic for points


function showstat () {
  const SockJS = require('sockjs-client');
  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  var sock = SockJS('http://192.168.1.60:59650/api');
   sock.onopen =  function() {
                console.log('open');
                      var req = '{"jsonrpc": "2.0","id": 8,"method": "auth","params": {"resource": "TcpServerService","args": ["'+config.obscontrol.api+'"]}}';
                            sock.send(req);

                 var req1 = {
                       "jsonrpc": "2.0",
                       "id": 10,
                       "method": "setVisibility",
                       "params": {
                                       "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\", \"6b386ed5-8418-405c-88d8-90d432f6bfa5\", \"browser_source_c4f354c3-dfd0-45ee-b269-5fbb2e60a1ba\"]",
                                       "args": [true]
                                   }
                                   
           }
           
           sock.send(JSON.stringify(req1));
           sock.onmessage = function(e) {
            console.log('message deactive', e.data);
          };
          sleep(15000).then(() => {
           var req2 = {
            "jsonrpc": "2.0",
            "id": 10,
            "method": "setVisibility",
            "params": {
                            "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\", \"6b386ed5-8418-405c-88d8-90d432f6bfa5\", \"browser_source_c4f354c3-dfd0-45ee-b269-5fbb2e60a1ba\"]",
                            "args": [false]
                        }
                       }
                     
                 sock.send(JSON.stringify(req2));
                sock.onmessage = function(e) {
                  console.log('message active', e.data);
                  sock.close();
                  console.log('close');
              }
            })
            }
      
    }       






// scene switching


function switchscene () {
  const SockJS = require('sockjs-client');
  console.log(scena);
  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  var sock = SockJS('http://192.168.1.60:59650/api');
   sock.onopen =  function() {
                console.log('open');
                      var req = '{"jsonrpc": "2.0","id": 8,"method": "auth","params": {"resource": "TcpServerService","args": ["'+config.obscontrol.api+'"]}}';
                            sock.send(req);

                 var req1 = {
                       "jsonrpc": "2.0",
                       "id": 10,
                       "method": "makeSceneActive",
                       "params": {
                        "resource": "ScenesService",
                                       "args": [scena]
                                   }
                                   
           }
           
           sock.send(JSON.stringify(req1));
           sock.onmessage = function(e) {
            console.log('message deactive', e.data);
          };
          sleep(30000).then(() => {
           var req2 = {
            "jsonrpc": "2.0",
            "id": 10,
            "method": "makeSceneActive",
            "params": {
              "resource": "ScenesService",
                            "args": ["scene_33f33347-27af-4aec-86b2-e8650e33003f"]
                        }
                       }
                     
                 sock.send(JSON.stringify(req2));
                sock.onmessage = function(e) {
                  console.log('message active', e.data);
                  sock.close();
                  console.log('close');
              }
            })
            }
      
    }       



// scene switching




