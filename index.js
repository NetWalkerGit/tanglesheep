const mysql = require('mysql');
const tmi = require('tmi.js');
const uniqid = require('uniqid');
const schedule = require('node-schedule');
const request = require("request");
const config = require('./config.js');
const fs = require('fs');
const { default: OBSWebSocket } = require('obs-websocket-js');
const obs = new OBSWebSocket();


const dbcon = mysql.createConnection({
  host: (config.db.host),
  user: (config.db.user),
  password: (config.db.password),
  database: (config.db.database)
});

//twitch chat connection
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

  //twitch tmi connection
  const client = new tmi.client(opts);
  client.on('connected', onConnectedHandler);
  client.connect();

   function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  } 
  //twitch tmi connection


//webhook to discord


  const { Webhook } = require('discord-webhook-node');
  const Hook = new Webhook(config.webhook.discord);
  const HookAlert = new Webhook(config.webhook.discordalert);
         

//webhook to discord
 



  dbcon.connect(function(err) {                //db connection start
    console.log("DB Connected!");
  });   //end of db coonect

// ------------------Load variables during script start-----------------
  dbcon.query("SELECT totalfeeds,todayfeeds FROM feedstat", function (err, result) {      
    for (var i in result)
    todayfeeds = (result[i].todayfeeds);
    totalfeeds = (result[i].totalfeeds);
  }); 
// ------------------Load variables during script start-----------------


    // -----------------reset feeding------------------
   var j = schedule.scheduleJob(' 1 1 * * *', function(){
        dbcon.query("UPDATE  feedstat SET todayfeeds = 0 WHERE id = 1", function (err, result) {
          if (err) throw err; });
          dbcon.query("UPDATE twitchuser SET fedtoday = 0", function (err, result  ) {  
            if (err) throw err;  });

            dbcon.query("SELECT totalfeeds,todayfeeds FROM feedstat", function (err, result) {      
              for (var i in result)
              todayfeeds = (result[i].todayfeeds);
              totalfeeds = (result[i].totalfeeds);
            }); 

           });
 // -----------------reset feeding------------------

 



// -----------------------------------------twitch chat feeding    !subfeed and loyalty feeding--------------------------------------------------

  client.on ('chat', function(channel, userstate,  message) { 
   // console.log(userstate);
   // console.log(message);
   const date = new Date();
   let hour = date.getHours();
 
   var newuser = "INSERT INTO twitchuser (id,firstfeed,userid,username,message) VALUES ("+ dbcon.escape(uniqid()) +","+ dbcon.escape(date) +"," + dbcon.escape(userstate['user-id']) + "," + dbcon.escape(userstate['display-name']) + "," + dbcon.escape(message) + ")";
   var userfeed = "UPDATE  twitchuser SET fedtoday = '1', message = '"+message+"' WHERE userid = " +  dbcon.escape(userstate['user-id']);
   var checkfeed = 'SELECT userid,fedtoday FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']);

 if ((todayfeeds >= 100) && ((userstate['custom-reward-id'] === '5d77928f-00f7-4612-9ea6-2a64070b8902') || (message === "!subfeed") ||  (userstate.bits >= 1)   )){                 // dayly feeding limit 

  client.action("tanglesheep", userstate['display-name'] + " Max day feeds limit reached , try tomorrow :(  Lets not overfeed sheep <3 Thx for cheering anyway. it support us. ");
 } else { 



        //-----------------------------------------------------------------------subfeeds--------------------------------------------------

        if ((hour >= 20 || hour <= 6 ) &&   (message === "!subfeed") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder))  {

         client.action("tanglesheep", userstate['display-name'] + " Sheep's sleeping  now. Check feeding hours on video :(  Sheep need some rest <3 Thx for understanding <3 ");

         } else   if( (message === "!subfeed") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
 
              dbcon.query(checkfeed, function (err, result) {         // veryfi if user can feed

          if (result.length == []) {                  // first time feeders not in DB
             dbcon.query(newuser, function (err, result) {  });
              
                feeding();
                dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'subfeed', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat

             client.action("tanglesheep", userstate['display-name'] + " Thx for first time subpower feeding :) :) "); 
             dbcon.query("UPDATE  twitchuser SET fedtoday=?,subfeeds=? WHERE userid=?",['1','1', userstate['user-id']], function (err, result ) {});     //set first time feeder
                                } 
                                                   });
                       dbcon.query(checkfeed, function (err, result ) {  // veryfi if user can feed
                       for (var i in result)
                      if (result[i].fedtoday != 0) 
                      {
                        client.action("tanglesheep", userstate['display-name'] + " You already fed today with !subfeed  :( ");
                           } else {
                           dbcon.query(userfeed, function (err, result ) {  });     //set user feeding to 1
                         
               dbcon.query('SELECT subfeeds FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result) {      //subfeeds counter 
                for (var i in result)
                sumsubfeeds = (result[i].subfeeds) + 1;                                                                                        
                dbcon.query("UPDATE  twitchuser SET subfeeds=? WHERE userid=?",[sumsubfeeds, userstate['user-id']], function (err, result ) {    //incrase counter in DB
                   });
              });


                feeding();             //run feeder
                dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'subfeed', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat

               client.action("tanglesheep", userstate['display-name'] + " Sub power feeding :) ");
              }
                  });
           }
           else if( message === "!subfeed" ) {
 
            client.action("tanglesheep", userstate['display-name'] + " you need to be subscriber of tanglesheep channel or use bits");
  
           }
         


//----------------------------------------------------------------------------- Loyalty feeding--------------------------------------------------

   if ((hour >= 20 || hour <= 6 ) &&  (userstate['custom-reward-id'] === '5d77928f-00f7-4612-9ea6-2a64070b8902') ) {
  
                    client.action("tanglesheep", userstate['display-name'] + " Sheep's sleeping  now. Check feeding hours on video :(  Sheep need some rest <3 Thx for understanding <3 ");
  
  
                  } else  if (userstate['custom-reward-id'] === '5d77928f-00f7-4612-9ea6-2a64070b8902')  {
                    dbcon.query(checkfeed, function (err, result ) {         // veryfi if user can feed
                        if (result.length == []) {                  // first time feeders not in DB
                           dbcon.query(newuser, function (err, result  ) {  
                          });
                          dbcon.query("UPDATE  twitchuser SET pointfeeds=? WHERE userid=?",[1, userstate['user-id']], function (err, result ) {    //incrase counter in DB
                          });   
                               feeding();                          //run feeder
                               dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'loyaltyfeed', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat
                           client.action("tanglesheep", userstate['display-name'] + " Thx for first time  loyalty feeding:) ");
                          
                                                 }        
                                else {

                             dbcon.query('SELECT pointfeeds FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result) {      //sumpointfeeds counter
                               for (var i in result)
                               sumpointfeeds = (result[i].pointfeeds) + 1;                                                                                          //incrase counter in DB
                               dbcon.query("UPDATE  twitchuser SET pointfeeds=?,message=?  WHERE userid=?",[sumpointfeeds,message, userstate['user-id']]);    //incrase counter in DB  
                             });
                            
                                  feeding();   //run feeder
                           dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'loyaltyfeed', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat

                             client.action("tanglesheep", userstate['display-name'] + " Enjoy your loyalty feeding :) <3 ");
                                                                 }
                                                                });
                                                              } 
      }




//Winner run
      if( ((message === "tangle8Shepherd | tangle8Shepherd | tangle8Shepherd") || (message === "tangle8Feedsheep | tangle8Feedsheep | tangle8Feedsheep") ||  (message === "tangle8Hypesheep | tangle8Hypesheep | tangle8Hypesheep") ) && (userstate['display-name'] === 'Nightbot') ) {     
        client.action("tanglesheep", " JACKPOT!!!  Today is your lucky DAY, watch the feeding.");
        feeding();             //run feeder
        dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'SlotsWinner', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat
      };
//--------------- Slot machine game--------------




        // -------------------------------user can print his feeding stats--------------------------------
      dbcon.query('SELECT userid FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result) {
        if ((result.length > 0 ) && ( message === "!myfeedingstats"))   // if user exist and mesage is  then print stats
          { 
                 dbcon.query('SELECT username,subfeeds,pointfeeds,cheerfeeds  FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result, fields){
                 client.action("tanglesheep", "username:" +result[0].username + " subfeeds:" + result[0].subfeeds + " pointfeeds:" + result[0].pointfeeds + " cheerfeeds:" + result[0].cheerfeeds);
                 });     
                        
             }else if ( message === "!myfeedingstats")  {
                      client.action("tanglesheep", userstate['display-name'] + " You dont  exist in database , please feed our cute sheep <3")
                    }
           });
});

// -----------------------------------------twitch chat feeding    !subfeedin and loyalty feeding--------------------------------------------------



//--------------------------------------------------------cheeering feeding-------------------------------------------------------------------------

client.on ("cheer", (channel, userstate, message) =>  {

  const date = new Date();
  let hour = date.getHours();

 
       if (hour >= 20|| hour <= 6 )   {

        client.action("tanglesheep", userstate['display-name'] + " Sheep's sleeping   now. Check feeding hours on video :(  Sheep need some rest <3 Thx for understanding <3 ");
     
      }  else if ( todayfeeds >= 100 ) {              // max feeding limit
        client.action("tanglesheep", userstate['display-name'] + " Max day feeds limit reached , try tomorrow :(  Lets not overfeed sheep <3 Thx for cheering anyway. it support us. ");


        } else  if    (userstate.bits <= 49){
                 client.action("tanglesheep", userstate['display-name'] + " Thx for cheering <3 <3  If you want to feed our fluffy sheep, cheer more than 49 bits :) ");
    

                                    
              //cheering pellets amounr bigger than 50 but not 80
                 } else   {
                
                       dbcon.query('SELECT userid FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result ) {       
                        if (result.length == []) {                  // first time feeders not in DB
                        dbcon.query("INSERT INTO twitchuser (id,firstfeed,userid,username,message,cheerfeeds) VALUES ("+ dbcon.escape(uniqid()) +","+ dbcon.escape(date) +"," + dbcon.escape(userstate['user-id']) + "," + dbcon.escape(userstate['display-name']) + "," + dbcon.escape(message) + ",'1')", function (err, result  ) {  
                         });
                         
                         feeding();
                         dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'cheerfeed', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat
                        client.action("tanglesheep", userstate['display-name'] + " Thx for firs time  cheer feeding :)  ");
                              
                          } else {
                          
                          dbcon.query('SELECT cheerfeeds FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result) {      //cheerfeeds counter
                            for (var i in result)
                            sumpocheerfeeds = (result[i].cheerfeeds) + 1;                                                                                          //incrase counter in DB
                            dbcon.query("UPDATE  twitchuser SET cheerfeeds=? WHERE userid=?",[sumpocheerfeeds, userstate['user-id']], function (err, result ) {    //incrase counter in DB
                                      });   
                          feeding();
                          dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'cheerfeed', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat
                          client.action("tanglesheep", userstate['display-name'] + " Thx for feeding <3 <3   Sheep are happy :)  ");
                                 });
                               }
                            });
                          }
        });


 

//--------------------------------------------------Bitocin LN  payment ------------------------------------------------------------------



var qr = require('qr-image');
var express = require('express');
var app = express();

  
  //------------creating new charge---------
  const opennode = require('opennode');
  opennode.setCredentials(config.opennode.apikey, 'live');
  
  const charge = {
    description: 'Feeding sheep',
    amount: 0.5, // required
    currency: 'USD',
    callback_url: config.opennode.callbackurl,
    auto_settle: false
  };
  
  function createlnpay () {
  opennode.createCharge(charge)
      .then(charge => {
       //        console.log(charge);
     //create QR code      
            var qr_svg = qr.image(charge.lightning_invoice.payreq, { type: 'png' });
           qr_svg.pipe(require('fs').createWriteStream('/var/www/html/tanglesheep/streamfeedcount/LNpayment.png'));
           var svg_string = qr.imageSync(charge.lightning_invoice.payreq, { type: 'png' });
      
         //   console.log(jsonParsed.payreq);
       
      })
      .catch(error => {
          console.error(`${error.status} | ${error.message}`);
      });
  
    };
  
    

  
  var lnpayrequestcreator = schedule.scheduleJob('*/10 * * * *', function(){  //create LN invoice every 10 minutes
    createlnpay ();      
  });
 
  createlnpay ();;  // create new charge each time script start or restart

  app.use(express.urlencoded({ extended: true }))
  app.post('/confirmation', function(request, response){
    const date = new Date();
    let hour = date.getHours();

    if ((hour >= 20 || hour <= 6 )  || ( todayfeeds >= 100 ) ){

     // client.action("tanglesheep"," Sorry sheep sleeping :( , Thx for yoru Bitcoin LN " +request.body.hashed_order+ " payment anyway it support us :) ");

     
     }else if (request.body.status == "paid"){
      client.action("tanglesheep"," Thx for feeding via BITCOIN LN your payment hash is "+request.body.hashed_order);
      createlnpay (); 
      feeding ();
      dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'BTCLN', '"+request.body.hashed_order+"')"); //feedingststat
     }
     response.status(200).end();
  });
  app.listen(8899);




//--------------------------------------------------Bitocin LN  payment  end ------------------------------------------------------------------





// feeding gif animation and sound


function feedaniamtion () {
  // Connect to OBS WebSocket
  obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew)
      .then(() => {
        //  console.log('Connected to OBS WebSocket, Identified');
          // Enable the scene item
          return obs.call('SetSceneItemEnabled', {
              sceneName: 'Main',
              sceneItemId: 23,
              sceneItemEnabled: true
          });
      })
      .then(() => {
          console.log('Scene item enabled');
          // Wait for 4.5 seconds before disabling the scene item
          return new Promise(resolve => setTimeout(resolve, 4500)); // 4500 milliseconds = 4.5 seconds
      })
      .then(() => {
          // Disable the scene item
          return obs.call('SetSceneItemEnabled', {
              sceneName: 'Main',
              sceneItemId: 23,
              sceneItemEnabled: false
          });
      })
      .catch(err => {
          console.error('Error occurred:', err);
         
      });
}



//  feeding gif animation and sound




//activate broekn feeder notice on the stream
function feedingbroken () {
  obs.connect('ws://192.168.1.60:4455', config.obscontrol.apinew );
  obs.on('Identified', () => {
           
        obs.call('SetSceneItemEnabled', {
          sceneName: 'Main',
          sceneItemId: 24,
          sceneItemEnabled: true 
        
         });
      }
  )}
//activate broekn feeder notice on the stream





// Function calling feeder
 
  function feeding () {
    
  
      var options = { method: 'GET',url: (config.toolscontrol.dcmotor),headers:{ 'cache-control': 'no-cache' } };
        request(options, function (error, response, body) {
         if (!error && response.statusCode == 200) {
            // console.log("URL is OK") 
                  Hook.send("Normal feeding happen");
                 dbcon.query("SELECT totalfeeds,todayfeeds FROM feedstat", function (err, result) {      //Feeding counters
                  for (var i in result)
                  totalfeeds = (result[i].totalfeeds) + 1;
                  todayfeeds = (result[i].todayfeeds) + 1;
                  dbcon.query("UPDATE feedstat SET totalfeeds=?, todayfeeds=? WHERE id=?",[totalfeeds, todayfeeds, 1], function (err, result ) {             //incrase counter in DB
                    if (err) throw err; });    
                    feedaniamtion ();   // plasy sound during the feeding
                });
          
       } else {
        HookAlert.send("Connection from server to ESP32chip broken!!!");
        feedingbroken () ;
         client.action("tanglesheep","CAN'T REACH FEEDER !!!, CONNECTION BROKEN , PLEASE CONTACT ADMIN ON DISCORD THX AND MY APOLOGIES tangle8Goatbits  tangle8Goatbits");
         console.log("can't reach ESP32")  
                 };
            });
    };
        



  


  