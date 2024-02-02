const tmi = require('tmi.js');
var schedule = require('node-schedule');
const fs = require('fs');
const request = require('request');
const config = require('./configtools.js');
const { Configuration, OpenAIApi } = require("openai");
const { default: OBSWebSocket } = require('obs-websocket-js');



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


  // switch cams
  client.on('chat', (channel, userstate, message, self) => {
    // Helper function to check if a user is a subscriber or founder
    const isSubscriberOrFounder = userstate.badges && (userstate.badges.subscriber || userstate.badges.founder);

    // Function to handle camera switch commands directly
    const switchCameraCommand = (cameraType) => {
        switchCamera(cameraType);
        client.action("tanglesheep", `${userstate['display-name']} switching to ${cameraType} cam`);
    };

    // Helper function to set the scene and announce camera switch for big camera commands
    const setSceneAndAnnounce = (scene, announcement) => {
        global.scena = scene;
        sceneswitch();
        client.action("tanglesheep", announcement);
    };

    // Mapping for commands that require subscriber or founder status, including camera entry and movement commands
    const subscriberCommands = {
        "!sheepentry": () => camentry(),
        "!sheepgarden": () => camgarden(),
        "!goat": () => camaroundshep(),
        "!sheepfargarden": () => camfargarden(),
        "!sheeppatrol": () => camsheeppatrol(),
        "!birdmain": () => cambirdmain(),
        "!birdrest": () => cambirdrest(),
        "!birdfeeding": () => cambirdfeeding(),
        "!birdfeeding2": () => cambirdfeeding2(),
        "!bird2main": () => cambird2main(),
        "!bird2feeding": () => cambird2feeding(),
        "!bird2rest": () => cambird2rest(),
        "switchtosheepcam": () => userstate['custom-reward-id'] === '99d381a5-b224-4277-a061-b42c5dc75221' && switchCameraCommand('sheep'),
        "switchtobirdcam": () => userstate['custom-reward-id'] === '99d381a5-b224-4277-a061-b42c5dc75221' && switchCamera('bird'), // Assuming birdcam is similar to switchCamera
        // Merge switch camera commands for better organization
        "!birdcam": () => switchCameraCommand('bird'),
        "!sheepcam": () => switchCameraCommand('sheep'),
        "!goatcam": () => switchCameraCommand('goat'),
        "!radar": () => showRadar(),
    };

    // Command mapping for custom rewards and big camera commands
    const customRewardCommands = {
        "65263b98-c85f-4905-b35a-a965eca3cba7": () => client.action("tanglesheep", `!8ball Answer ${userstate['display-name']}'s question..`),
        "switchtosheepcam": () => switchCameraCommand('sheep'),
        "switchtobirdcam": () => switchCamera('bird'), // Assuming birdcam is similar to switchCamera
        
    };

    // Handling for big camera commands with custom rewards or badge info
    const bigCameraCommands = {
        "bigbirdcam": ["BirdBigCam", "woooow big birds cam"],
        "biggoatcam": ["GoatBigCam", "woooow big goat cam"],
        "bigsheepcam": ["SheepBigOutsideCam", "woooow big sheep outside cam"],
        "bigsheepshed": ["SheepshedBig", "woooow big sheep shed cam"],
    };

    // Execute command if it's a subscriber command or a big camera command
    if (isSubscriberOrFounder && subscriberCommands[message]) {
        subscriberCommands[message]();
        return;
    }

    // Check and execute big camera commands
    const bigCameraCommand = bigCameraCommands[message];
    if (bigCameraCommand && (userstate['custom-reward-id'] === '9e47f62a-a26c-46c3-8eda-affb9124e652' || userstate['badge-info'] != null)) {
        setSceneAndAnnounce(bigCameraCommand[0], bigCameraCommand[1]);
        return;
    }

    // Special handling for custom reward ID with no direct mapping to switchCamera
    if (customRewardCommands[userstate['custom-reward-id']]) {
        customRewardCommands[userstate['custom-reward-id']]();
        return;
    }

    // Inform users without badge info about subscription requirement for specific commands
    if (["!birdcam", "!sheepcam", "!goatshedcam", "!goat"].includes(message) && !userstate['badge-info']) {
        client.action("tanglesheep", `${userstate['display-name']} you need to be a subscriber of tanglesheep channel`);
    }
});

//PTZ MOVE

client.on('chat', (channel, userstate, message, self) => {
    // Extract movement values from the message
    const moveValue = message.match(/\d+/g);

    if (!moveValue || !(userstate.badges && (userstate.badges.subscriber || userstate.badges.founder))) {
        return false; // Exit if there are no movement values or the user is not authorized
    }

    const [x, y, zoom] = moveValue.map(v => v * 10);

    if (message.startsWith("!sheepcam")) {
        sendPTZCommand(x, y, zoom, 'sheep');
    } else if (message.startsWith("!birdcam")) {
        sendPTZCommand(x, y, zoom, 'bird');
    }
});

// Generalized PTZ control function
function sendPTZCommand(x, y, zoom, type) {
    const cameraIp = type === 'sheep' ? '192.168.1.12' : '192.168.1.14';
    const options = {
        method: 'PUT',
        url: `http://${config.camera.pass}@${cameraIp}/ISAPI/PTZCtrl/channels/1/absolute`,
        headers: { 'Content-Type': 'application/xml' },
        body: `<PTZData>\n<AbsoluteHigh>\n<elevation> ${y} </elevation>\n<azimuth> ${x} </azimuth>\n<absoluteZoom>${zoom}</absoluteZoom>\n</AbsoluteHigh> \n</PTZData>`
    };

    request(options, (error, response) => {
        if (error) console.log(error);
        // Optionally handle response or log success message
    });
}





//camera handling

function switchCamera(cameraType) {
  const obs = new OBSWebSocket();
  
  // Define scene item IDs for each camera type
  const cameraSettings = {
    bird: { enable: 36, disable: [37, 38] },
    sheep: { enable: 37, disable: [36, 38] },
    goat: { enable: 38, disable: [36, 37] },
  };
  
  const settings = cameraSettings[cameraType];
  if (!settings) {
    console.error('Invalid camera type specified');
    return;
  }
  
  // Connect to OBS WebSocket
  obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew).then(() => {
    console.log(`Successfully connected to OBS WebSocket for ${cameraType} camera`);

    // Generate batch commands based on the camera type
    const batchCommands = [
      {
        requestType: 'SetSceneItemEnabled',
        requestData: {
          sceneName: 'Main',
          sceneItemId: settings.enable,
          sceneItemEnabled: true
        }
      },
      ...settings.disable.map(sceneItemId => ({
        requestType: 'SetSceneItemEnabled',
        requestData: {
          sceneName: 'Main',
          sceneItemId,
          sceneItemEnabled: false
        }
      }))
    ];

    // Execute batch commands
    return obs.callBatch(batchCommands);
  }).then(() => {
    console.log(`Commands executed successfully for ${cameraType} camera`);
    obs.disconnect();
  }).catch((error) => {
    console.error(`Error occurred in ${cameraType} camera:`, error);
    obs.disconnect();
  });
}




//camera entry
function camentry () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.12/ISAPI/PTZCtrl/channels/1/presets/1/goto"
   }; request(options, function (error) {
  console.log(error);
});
}

//camera garden
function camgarden () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.12/ISAPI/PTZCtrl/channels/1/presets/2/goto"
   }; request(options, function (error) {

  console.log(error);
});
}

//camera aroundshed
function camfargarden () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.12/ISAPI/PTZCtrl/channels/1/presets/3/goto"
  }; request(options, function (error) {

  console.log(error);
});
}

//camera fargarden
function camaroundshed () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.12/ISAPI/PTZCtrl/channels/1/presets/4/goto"
   }; request(options, function (error) {

  console.log(error);
});
}


//camera sheep Patrol
function camsheeppatrol() {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.12/ISAPI/PTZCtrl/channels/1/presets/45/goto"
   }; request(options, function (error) {

  console.log(error);
});
}



//camera cambirdmain Preset 1
function cambirdmain () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/1/goto"
  }; request(options, function (error) {

  console.log(error);
});
}


//camera cambirdrest Preset 2
function cambirdrest () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/2/goto"
  }; request(options, function (error) {

  console.log(error);
});
}




//camera cambirdfeeding Preset 3
function cambirdfeeding () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/3/goto"
   }; request(options, function (error) {

  console.log(error);
});
}


//camera cambirdfeeding2 Preset 4
function cambirdfeeding2 () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/4/goto"
  }; request(options, function (error) {

  console.log(error);
});
}


//camera cambird2main Preset 5
function cambird2main () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/5/goto"
   }; request(options, function (error) {

  console.log(error);
});
}

//camera cambird2feeding Preset 6
function cambird2feeding () {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/6/goto"
   }; request(options, function (error) {

  console.log(error);
});
}

//camera cambird2feeding Preset 7
function cambird2rest() {
var request = require("request"); var options = { method: 'PUT',
  url: "http://"+config.camera.pass+"@192.168.1.14/ISAPI/PTZCtrl/channels/1/presets/7/goto"
  }; request(options, function (error) {

  console.log(error);
});
}




// show radar widget
async function showRadar() {
  const obs = new OBSWebSocket();

  // Helper function to wait for a specified amount of time
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
      // Connect to OBS WebSocket
      await obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew);
      console.log('Connected to OBS WebSocket');

      // Enable the scene item
      await obs.call('SetSceneItemEnabled', {
          sceneName: 'Main',
          sceneItemId: 22,
          sceneItemEnabled: true
      });
      console.log('Scene item enabled');

      // Wait for 10 seconds before disabling the scene item
      await wait(10000); // 10000 milliseconds = 10 seconds

      // Disable the scene item
      await obs.call('SetSceneItemEnabled', {
          sceneName: 'Main',
          sceneItemId: 22,
          sceneItemEnabled: false
      });
      console.log('Scene item disabled');

  } catch (err) {
      console.error('Error occurred:', err);
  } finally {
      // Disconnect from OBS WebSocket in both success and error cases
      obs.disconnect();
      console.log('Disconnected from OBS WebSocket');
  }
}



// scene switching

async function sceneswitch() {
  try {
      // Connect to OBS WebSocket
      const obs = new OBSWebSocket();
      await obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew);
      console.log('Connected to OBS WebSocket');

      // Switch to the desired scene
      await obs.call('SetCurrentProgramScene', { sceneName: scena });
      console.log('Switched to ' + scena);

      // Wait for 30 seconds
      await new Promise(resolve => setTimeout(resolve, 30000));
      
     await obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew);
      // Switch back to the Main scene
      await obs.call('SetCurrentProgramScene', { sceneName: 'Main' });
      console.log('Switched back to Main');
      obs.disconnect();
  } catch (err) {
      console.error('Error occurred:', err);
  } 
}
