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




// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
//client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();








//camera handling

//dravci on
function birdcam () {
const SockJS = require('sockjs-client');
var sock = SockJS('http://46.252.233.34:59650/api');
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
var sock = SockJS('http://46.252.233.34:59650/api');
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


          };

 sock.onmessage = function(e) {
              console.log('message', e.data);
              sock.close();
          };

 sock.onclose = function() {
              console.log('close');
          };

}







//subscribers  cams

client.on ('chat', function(channel, userstate,  message, self) {
// console.log(message);
// console.log (userstate);
    // switch cams
             if( (message === "!birdcam") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  birdscamswitch = birdcam();
                                 client.action("tanglesheep", userstate['display-name'] + " switching to bird cam ");

                                } else   if( (message === "!sheepcam") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                  const  sheepcamswitch = sheepcam();
                                 client.action("tanglesheep", userstate['display-name'] + " switching to sheep cam ");
                               
                                } else   if( userstate['custom-reward-id'] === '99d381a5-b224-4277-a061-b42c5dc75221') {
                                  const  sheepcamswitch = sheepcam();
                                     client.action("tanglesheep", userstate['display-name'] + " switching to sheep cam ");
                   
                                 } else   if( userstate['custom-reward-id'] === '563f34fc-bf9e-4414-8c25-0a12615b2d84') {
                                   const  sheepcamswitch = birdcam();
                                  client.action("tanglesheep", userstate['display-name'] + " switching to bird cam ");
             
             
             
               //sheep cams

                                        } else   if( (message === "!sheepentry" ) && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                 const  entry = camentry();
                                 client.action("tanglesheep", userstate['display-name'] + " camera moving to sheep shed entry ");

                                 } else   if( (message === "!sheepgarden") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  garden = camgarden();
                                 client.action("tanglesheep", userstate['display-name'] + " camera moving to sheep's garden ");

                 } else   if( (message === "!goat") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  aroundshed = camaroundshed();
                                 client.action("tanglesheep", userstate['display-name'] + " camera moving to check around shed ");

                  } else   if( (message === "!sheepfargarden") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  fargarden = camfargarden();
                                 client.action("tanglesheep", userstate['display-name'] + " camera moving to check far away sheep ");
                   }

                                         else   if( (message === "!sheeppatrol") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  sheeppatrol = camsheeppatrol();
                                 client.action("tanglesheep", userstate['display-name'] + " camera starting to patrol ");
                   }
                                   //birds  cams
                                    else   if( (message === "!birdmain") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  birdmain = cambirdmain();
                                 client.action("tanglesheep", userstate['display-name'] + " Cage of Lary and Roby ");
                   }

                                    else   if( (message === "!birdrest") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  birdrest = cambirdrest();
                                 client.action("tanglesheep", userstate['display-name'] + " Resting place view ");
                   }

                                   else   if( (message === "!birdfeeding") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  birdfeeding = cambirdfeeding();
                                 client.action("tanglesheep", userstate['display-name'] + " Feeding place view ");
                   }

                                      else   if( (message === "!birdfeeding2") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  birdfeeding2 = cambirdfeeding2();
                                 client.action("tanglesheep", userstate['display-name'] + " Lary's feeding place ");
                   }

                                      else   if( (message === "!bird2main") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  bird2main = cambird2main();
                                 client.action("tanglesheep", userstate['display-name'] + " Second cage all view ");
                   }
                                    else   if( (message === "!bird2feeding") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  bird2feeding = cambird2feeding();
                                 client.action("tanglesheep", userstate['display-name'] + " Second cage feeding place view ");
                   }
                                   else   if( (message === "!bird2rest") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                              const  bird2rest = cambird2rest();
                                 client.action("tanglesheep", userstate['display-name'] + " Second cage rest place view ");
                   }


});



//camera entry
function camentry () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:82/ISAPI/PTZCtrl/channels/1/presets/1/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//camera garden
function camgarden () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:82/ISAPI/PTZCtrl/channels/1/presets/2/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//camera aroundshed
function camaroundshed () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:82/ISAPI/PTZCtrl/channels/1/presets/3/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//camera fargarden
function camfargarden () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:82/ISAPI/PTZCtrl/channels/1/presets/4/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}


//camera sheep Patrol
function camsheeppatrol() {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:82/ISAPI/PTZCtrl/channels/1/presets/45/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}



//camera cambirdmain Preset 1
function cambirdmain () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:83/ISAPI/PTZCtrl/channels/1/presets/1/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}


//camera cambirdrest Preset 2
function cambirdrest () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:83/ISAPI/PTZCtrl/channels/1/presets/2/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}




//camera cambirdfeeding Preset 3
function cambirdfeeding () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:83/ISAPI/PTZCtrl/channels/1/presets/3/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}


//camera cambirdfeeding2 Preset 4
function cambirdfeeding2 () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:83/ISAPI/PTZCtrl/channels/1/presets/4/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}


//camera cambird2main Preset 5
function cambird2main () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:83/ISAPI/PTZCtrl/channels/1/presets/5/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//camera cambird2feeding Preset 6
function cambird2feeding () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:83/ISAPI/PTZCtrl/channels/1/presets/6/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}

//camera cambird2feeding Preset 7
function cambird2rest() {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@46.252.233.34:83/ISAPI/PTZCtrl/channels/1/presets/7/goto",
  headers:
   { 'Postman-Token': '7d077821-b40b-4268-a8d7-110f504600c7',
     'cache-control': 'no-cache' } }; request(options, function (error) {

  console.log(error);
});
}






// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
