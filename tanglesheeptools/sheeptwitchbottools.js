const tmi = require('tmi.js');
var schedule = require('node-schedule');
const fs = require('fs');
const config = require('./configtools.js');
const { Configuration, OpenAIApi } = require("openai");
const { default: OBSWebSocket } = require('obs-websocket-js');
const obs = new OBSWebSocket();


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

//openai Define configuration options
  const configuration = new Configuration({
    apiKey: (config.openai.api),
  });
  const openai = new OpenAIApi(configuration)
//openai Define configuration options


 //twitch tmi connection
 const client = new tmi.client(opts);
 client.on('connected', onConnectedHandler);
 client.connect();

  function onConnectedHandler (addr, port) {
   console.log(`* Connected to ${addr}:${port}`);
 } 
 //twitch tmi connection





//OPENAI chatgpt  

client.on ('message', function(channel, userstate,  message, self) {

  if (self) return;
  if ( userstate ['custom-reward-id'] === '1f835010-ee82-45c0-934a-b8326979b793') {

const completion = openai.createCompletion({
  model: "text-davinci-003",
  prompt: message,
  max_tokens: 1000
});


//console.info("Searching for answer...");
completion.then((result) => {
  client.say(channel, result.data.choices[0].text);
});

} 

});


//OPENAI chatgpt  





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
                                
                                if( (message === "!radar") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
                                  showradar();
                                  client.action("tanglesheep","do you see any storm?");

                                } 
                                
                                      if ((( userstate['custom-reward-id'] === '9e47f62a-a26c-46c3-8eda-affb9124e652') && (message === "bigbirdcam")) || ((userstate['badge-info'] != null) && (message === "bigbirdcam"))) {
                                      global.scena = "BirdBigCam";
                                      sceneswitch();
                                       client.action("tanglesheep","woooow big birds cam");

                                } 
                                
                                if((( userstate['custom-reward-id'] === '9e47f62a-a26c-46c3-8eda-affb9124e652') && (message === "biggoatcam")) || ((userstate['badge-info'] != null) && (message === "biggoatcam"))) {
                                  global.scena = "GoatBigCam";
                                  sceneswitch();
                                  client.action("tanglesheep","woooow big goat cam");

                                } 
                                
                                if((( userstate['custom-reward-id'] === '9e47f62a-a26c-46c3-8eda-affb9124e652')  && (message === "bigsheepcam")) || ((userstate['badge-info'] != null) && (message === "bigsheepcam"))){
                                  global.scena = "SheepBigOutsideCam";
                                  sceneswitch();
                                  client.action("tanglesheep","woooow big sheep outside cam");

                                } 
                                
                                if((( userstate['custom-reward-id'] === '9e47f62a-a26c-46c3-8eda-affb9124e652') && (message === "bigsheepshed")) || ((userstate['badge-info'] != null) && (message === "bigsheepshed"))) {
                                   global.scena = "SheepshedBig";
                                   sceneswitch();
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
  obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew );
  obs.on('Identified', () => {
   
        obs.call('SetSceneItemEnabled', {
          sceneName: 'Main',
          sceneItemId: 3,
          sceneItemEnabled: true 
        });

        obs.call('SetSceneItemEnabled', {  
          sceneName: 'Main',
          sceneItemId: 2,
          sceneItemEnabled: false 
        });   
        
        obs.call('SetSceneItemEnabled', {  
          sceneName: 'Main',
          sceneItemId: 4,
          sceneItemEnabled: false 
        }).then(() => {
          obs.disconnect();
         });
      }
  )}

 //ovce on

function sheepcam () {
  obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew );
  obs.on('Identified', () => {
   
        obs.call('SetSceneItemEnabled', {
          sceneName: 'Main',
          sceneItemId: 2,
          sceneItemEnabled: true 
        });

        obs.call('SetSceneItemEnabled', {  
          sceneName: 'Main',
          sceneItemId: 3,
          sceneItemEnabled: false 
        });  

        obs.call('SetSceneItemEnabled', {  
          sceneName: 'Main',
          sceneItemId: 4,
          sceneItemEnabled: false 
        }).then(() => {
          obs.disconnect();
         });
      }
  )}



//goats on

function goatshedcam () {
  obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew );
  obs.on('Identified', () => {
   
        obs.call('SetSceneItemEnabled', {
          sceneName: 'Main',
          sceneItemId: 2,
          sceneItemEnabled: false 
        });

        obs.call('SetSceneItemEnabled', {  
          sceneName: 'Main',
          sceneItemId: 3,
          sceneItemEnabled: false 
        });  

        obs.call('SetSceneItemEnabled', {  
          sceneName: 'Main',
          sceneItemId: 4,
          sceneItemEnabled: true 
        }).then(() => {
          obs.disconnect();
         });
      }
  )}








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






// show radar widget


function showradar() {
  // Connect to OBS WebSocket
  obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew)
      .then(() => {
          console.log('Connected to OBS WebSocket');
          // Enable the scene item
          return obs.call('SetSceneItemEnabled', {
              sceneName: 'Main',
              sceneItemId: 22,
              sceneItemEnabled: true
          });
      })
      .then(() => {
          console.log('Scene item enabled');
          // Wait for 10 seconds before disabling the scene item
          return new Promise(resolve => setTimeout(resolve, 10000)); // 10000 milliseconds = 10 seconds
      })
      .then(() => {
          // Disable the scene item
          return obs.call('SetSceneItemEnabled', {
              sceneName: 'Main',
              sceneItemId: 22,
              sceneItemEnabled: false
          });
      })
      .then(() => {
          console.log('Scene item disabled');
          // Disconnect from OBS WebSocket
       
      })
      .catch(err => {
          console.error('Error occurred:', err);
          // Ensure disconnection in case of error
          obs.disconnect();
      });
}





// scene switching

function sceneswitch() {
  // Connect to OBS WebSocket
  obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew)
      .then(() => {
          console.log('Connected to OBS WebSocket');
          // Switch to the desired scene
          return obs.call('SetCurrentProgramScene', { sceneName: scena });
      })
      .then(() => {
          console.log('Switched to ' + scena);
          // Set a timeout for 30 seconds before switching back
          setTimeout(() => switchBackToMain(), 30000); // 30000 milliseconds = 30 seconds
      })
      .catch(err => {
          console.error('Error occurred:', err);
          // Disconnect in case of an error
          obs.disconnect();
      });
}

function switchBackToMain() {
  obs.call('SetCurrentProgramScene', { sceneName: 'Main' })
      .then(() => {
          console.log('Switched back to Main');
      })
      .catch(err => {
          console.error('Error switching back to Main:', err);
          obs.disconnect();
      })
      .finally(() => {
          // Disconnect from OBS WebSocket after switching back or if an error occurs
       
      });
}


