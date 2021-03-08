const mysql = require('mysql');
const tmi = require('tmi.js');
const uniqid = require('uniqid');
const schedule = require('node-schedule');
const request = require("request");
const config = require('./config.js');
const fs = require('fs');
const webhook = require("webhook-discord")

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
  const Hook = new webhook.Webhook(config.webhook.discord);
  const HookAlert = new webhook.Webhook(config.webhook.discordalert);

  const msgnormal = new webhook.MessageBuilder()
                  .setName("tanglesheep")
                  .setColor("#63B7AF")
                  .setText("Normal feeding happen");


  const msgnpremium = new webhook.MessageBuilder()
                  .setName("tanglesheep")
                  .setColor("#BC658D")
                  .setText("Premium feeding happen");

   const errormsg = new webhook.MessageBuilder()
                  .setName("tanglesheep")
                  .setColor("#FF0000")
                  .setText("Connection from server to ESP32chip broken!!!");           

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

 

    // -----------------reset premium feeding------------------
    var resetpremium = schedule.scheduleJob('*/5 * * * *', function(){
      dbcon.query("UPDATE  twitchuser SET premiumfeed = 0 , premiumfeedtime = ' ' WHERE premiumfeedtime < (NOW() - INTERVAL 72 HOUR) AND premiumfeed = 1 ", function (err, result ) {}); //premium feed deleted every 3 days

         });
// -----------------reset premium feeding------------------



// -----------------------------------------twitch chat feeding    !subfeedin and loyalty feeding--------------------------------------------------

  client.on ('chat', function(channel, userstate,  message) { 
   // console.log(userstate);
   // console.log(message);
   const date = new Date();
   let hour = date.getHours();
 
   var newuser = "INSERT INTO twitchuser (id,firstfeed,userid,username,message) VALUES ("+ dbcon.escape(uniqid()) +","+ dbcon.escape(date) +"," + dbcon.escape(userstate['user-id']) + "," + dbcon.escape(userstate['display-name']) + "," + dbcon.escape(message) + ")";
   var userfeed = "UPDATE  twitchuser SET fedtoday = '1', message = '"+message+"' WHERE userid = " +  dbcon.escape(userstate['user-id']);
   var checkfeed = 'SELECT userid,fedtoday FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']);
   var checkpremiumfeed = 'SELECT userid,premiumfeed FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']);
   var premiumfeed = "UPDATE  twitchuser SET premiumfeed = '1', message = '"+message+"' WHERE userid = " +  dbcon.escape(userstate['user-id']);

 if ((todayfeeds >= 100) && ((userstate['custom-reward-id'] === '5d77928f-00f7-4612-9ea6-2a64070b8902') || (message === "!subfeed") ||  (message === "!premiumfeed") ||  (userstate.bits >= 1)   )){                 // dayly feeding limit 

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
                        client.action("tanglesheep", userstate['display-name'] + " You already fed today with !subfeed or !premiumfeed :( ");
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
         
    
//-----------------------------------------------------------------------premiumfeed--------------------------------------------------

if ((hour >= 20 || hour <= 6 ) &&   (message === "!premiumfeed") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder))  {

  client.action("tanglesheep", userstate['display-name'] + " Sheep's sleeping  now. Check feeding hours on video :(  Sheep need some rest <3 Thx for understanding <3 ");

  } else   if( (message === "!premiumfeed") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {

       dbcon.query(checkpremiumfeed, function (err, result) {         // veryfi if user can feed

   if (result.length == []) {                  // first time feeders not in DB
      dbcon.query(newuser, function (err, result) {  });
     
      feedingpremium();
      dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'premiumfeed', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat

      client.action("tanglesheep", userstate['display-name'] + " Thx for first time premiumfeed feeding :) :) "); 
      dbcon.query("UPDATE  twitchuser SET fedtoday=?,premiumfeed=?, premiumfeedtime=? WHERE userid=?",['1','1',(date), userstate['user-id'] ], function (err, result ) {});     //set first time feeder
                         } 
                                            });
                dbcon.query(checkpremiumfeed, function (err, result ) {  // veryfi if user can feed
                for (var i in result)
               if (result[i].premiumfeed != 0) 
               {
                 client.action("tanglesheep", userstate['display-name'] + " You can feed with !premiumfeed once per 3 days :( ");
                    } else {
                      dbcon.query("UPDATE  twitchuser SET fedtoday=?,premiumfeed=?, premiumfeedtime=? WHERE userid=?",['1','1',(date), userstate['user-id'] ], function (err, result ) {});
                   
        dbcon.query('SELECT subfeeds FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result) {      //subfeeds counter 
         for (var i in result)
         sumsubfeeds = (result[i].subfeeds) + 1;                                                                                          //incrase counter in DB
         dbcon.query("UPDATE  twitchuser SET subfeeds=? WHERE userid=? " ,[sumsubfeeds, userstate['user-id']], function (err, result ) {    //incrase counter in DB
            });
       });


       feedingpremium();             //run feeder
       dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'premiumfeed', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat

        client.action("tanglesheep", userstate['display-name'] + " Premiumfeed feeding :) ");
       }
           });
    }
    else if( message === "!premiumfeed" ) {
 
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

//--------------- Slot machine game--------------

if ((hour >= 20 || hour <= 6 ) && ( userstate['custom-reward-id'] === '69c85b34-2385-4f99-9e94-b6e751af55f3' )) {
  client.action("tanglesheep", userstate['display-name'] + " Sheep's sleeping  now. Check feeding hours on video :(  Sheep need some rest <3 Thx for understanding <3 ");

} else  if (userstate['custom-reward-id'] === '69c85b34-2385-4f99-9e94-b6e751af55f3')  {

  client.action("tanglesheep","!slots show if " + userstate['display-name'] + " is lucky ?  ");
};


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
                 dbcon.query('SELECT username,subfeeds,pointfeeds,cheerfeeds,premiumfeedtime  FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result, fields){
                 client.action("tanglesheep", "username:" +result[0].username + " subfeeds:" + result[0].subfeeds + " pointfeeds:" + result[0].pointfeeds + " cheerfeeds:" + result[0].cheerfeeds + " lastpremiumfeed:" + result[0].premiumfeedtime);
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

    
      } else  if    (userstate.bits == 5){                     //slot machine game bits amount
        client.action("tanglesheep","!slots show if " + userstate['display-name'] + " is lucky ?  ");

        } else  if    (userstate.bits <= 49){
                 client.action("tanglesheep", userstate['display-name'] + " Thx for cheering <3 <3  If you want to feed our fluffy sheep, cheer more than 49 bits :) ");
    
         
                                        
//--------------------------------------------------------cheeering Premium  feeding 80 bits-------------------------------------------------------------------------
                 } else  if (userstate.bits == 80) {
                
                         dbcon.query('SELECT userid FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result ) {       
                         if (result.length == []) {                  // first time feeders not in DB
                           dbcon.query("INSERT INTO twitchuser (id,firstfeed,userid,username,message,cheerfeeds) VALUES ("+ dbcon.escape(uniqid()) +","+ dbcon.escape(date) +"," + dbcon.escape(userstate['user-id']) + "," + dbcon.escape(userstate['display-name']) + "," + dbcon.escape(message) + ",'1')");
                                                
                            feedingpremium();
                            dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'cheerfeed', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat
                          client.action("tanglesheep", userstate['display-name'] + " Thx for firs time  Premium feeding :)  ");
                                    
                           } else {
                             dbcon.query('SELECT cheerfeeds FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result) {      //cheerfeeds counter
                              for (var i in result)
                               sumpocheerfeeds = (result[i].cheerfeeds) + 1;                                                                                          //update amount of cheerfeeds in user statas
                               dbcon.query("UPDATE  twitchuser SET cheerfeeds=? WHERE userid=?",[sumpocheerfeeds, userstate['user-id']]);   
                                 feedingpremium();
                                 dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'cheerfeed', " + dbcon.escape(userstate['display-name']) + ")"); //feedingststat
                                 client.action("tanglesheep", userstate['display-name'] + " Thx for Premium carrot feeding <3 <3   Sheep are happy :)  ");
                                              });
                                           }
                                       });
                                    
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


 
//---------------------------------------------cryptofeeding-----------------------------------------------------------


  var ltcbalances = require('request');
  var btcbalances = require('request');
  var xrpbalances = require('request');
  var bchbalances = require('request');
  var ethbalances = require('request');
  var dogecoinbalance = require('request');
  //var iotarequest = require('request');

var btc = {
  method: 'GET',
  url: 'https://blockchain.info/rawaddr/3B3XuvnASgHo3KFx66aBau2sb6mssStjuw?limit=1'
};

var ltc = {
    method: 'GET',
    url: 'https://api.blockcypher.com/v1/ltc/main/addrs/MWvyvpnuW42vNRZT6BYC83J1RWNMtuxtPr?limit=1'
  };

  var xrp = {
    method: 'GET',
    url: 'https://api.xrpscan.com/api/v1/account/rMAZ8bBvyf5YsazFRs3Aj1So3dArcaJMXD'
  };

  var bch = {
    method: 'GET',
    url: 'https://bch-chain.api.btc.com/v3/address/1Pn2oQzbk2JaALdhsvtgyWAv49rdUxHyUF'
  };

  var eth = {
    method: 'GET',
    url: 'https://api.blockcypher.com/v1/eth/main/addrs/0x042CEE4E592a54F697620bC3090800cA180DBcBE?limit=1'
  };



  var doge = {
    'method': 'GET',
    'url': 'https://sochain.com/api/v2/address/DOGE/DPNWMTWW3zWWucFRhmn3e2GS42LWHEeXDW'
  };
/*
  //--------------iota-----------
  var commandtx = {
    "command": "findTransactions",
    "addresses": [
      "RNHDJ9HBOBYCK9FAULCCBDPBYUPPEMHESSNNELHRXZNSQIHZEPYT9UZEOOAIPCVPFBJJCTBQWJIWQVGLB"
    ]
  };
  
  var commandbalance = {
    "command": "getBalances",
    "addresses": [
      "RNHDJ9HBOBYCK9FAULCCBDPBYUPPEMHESSNNELHRXZNSQIHZEPYT9UZEOOAIPCVPFBJJCTBQWJIWQVGLB"
    ],
    "threshold": 100
  };
  
  var optionstx = {
    url: 'https://nodes.thetangle.org',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-IOTA-API-Version': '1'
    },
    json: commandtx
  };
  
  var optionsbalance = {
    url: 'https://nodes.thetangle.org',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-IOTA-API-Version': '1'
    },
    json: commandbalance
  };
//--------------iota-----------
   */
var checker = schedule.scheduleJob(' 30 * * * * * ', function(){         
  const date = new Date();
  let hour = date.getHours();

  if ((hour >= 20 || hour <= 6 )  || ( todayfeeds >= 100 ) ){

            //nothing will happen       
           // console.log("feeding limit reached");
       } else {
        btcbalances(btc, function (error, response) { 
          try {
            var jsonParsed = JSON.parse(response.body);
            dbcon.query('SELECT balance FROM balance WHERE  address = ' +  dbcon.escape(jsonParsed.address), function (err, result) {  
              for (var i in result)
              if ((jsonParsed.final_balance - result[i].balance) > 2000 )    //checking   new balance - balance from DB is bigger than 0.5 $ = 5000 satoshi
              {
              
              feeding();
              dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'BTC', '"+jsonParsed.txs[0].hash+"')"); //feedingststat
              client.action("tanglesheep"," Thx for feeding using BTC  your  TX https://blockchair.com/bitcoin/transaction/"+jsonParsed.txs[0].hash  );
                dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.final_balance, jsonParsed.address], function (err, result ) {}); 
                console.log("BTC feeding works");
              };
            });
          } catch(error) {
            console.log('BTC feeding error  '+error);
          }
          });
    

          dogecoinbalance(doge, function (error, response) { 
            try {
             var jsonParsed = JSON.parse(response.body);
              dbcon.query('SELECT balance FROM balance WHERE  address = ' +  dbcon.escape(jsonParsed.data.address), function (err, result) {  
                for (var i in result)
                if ((jsonParsed.data.balance - result[i].balance) > 5 )    //checking   new balance - balance from DB is bigger than 0.5 $ = 5000 satoshi
                {
                
                feeding();
                dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'DOGE', '"+jsonParsed.data.txs[0].txid+"')"); //feedingststat
                client.action("tanglesheep"," Thx for feeding using DOGE  your  TX https://blockchair.com/dogecoin/transaction/"+jsonParsed.data.txs[0].txid  );
                  dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.data.balance, jsonParsed.data.address], function (err, result ) {}); 
                  console.log("DOGE feeding works");
                };
              });
            } catch(error) {
              console.log('DOGE feeding error  '+error);
            }
            });
    
    ltcbalances(ltc, function (error, response) { 
      try {
      var jsonParsed = JSON.parse(response.body);
     // console.log('statusCode:', response && response.statusCode);
      dbcon.query('SELECT balance FROM balance WHERE  address = ' +  dbcon.escape(jsonParsed.address), function (err, result) {  
        for (var i in result)
        if ((jsonParsed.final_balance - result[i].balance) > 200000 )    //checking   new balance - balance from DB is bigger than 0.5 $ 
        {
          
        feeding();
        dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'LTC', '"+jsonParsed.txrefs[0].tx_hash+"')"); //feedingststat
        client.action("tanglesheep"," Thx feeding using LTC   your  TX https://blockchair.com/litecoin/transaction/"+jsonParsed.txrefs[0].tx_hash  );
          dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.final_balance, jsonParsed.address], function (err, result ) {}); 
          console.log("LTC feeding works");
        };
      });
    } catch(error) {
      console.log('ltc feeding error  '+error);
      }
    });
  


      xrpbalances(xrp, function (error, response) { 
        try {
        var jsonParsed = JSON.parse(response.body);
        dbcon.query('SELECT balance FROM balance WHERE  address = ' +  dbcon.escape(jsonParsed.account), function (err, result) {  
          for (var i in result)
          if ((jsonParsed.xrpBalance - result[i].balance) > 1 )    //checking   new balance - balance from DB is bigger than than 0.5 $ 
          {
            
          feeding();
          dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'XRP', '"+jsonParsed.previousAffectingTransactionID+"')"); //feedingststat
          client.action("tanglesheep"," Thx for feeding using XRP your TX https://xrpscan.com/tx/"+jsonParsed.previousAffectingTransactionID );
            dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.xrpBalance, jsonParsed.account], function (err, result ) {}); 
            console.log("XRP feeding works");
          };
        });
      } catch(error) {
        console.log('xrp feeding error  '+error);
      }
      });

      bchbalances(bch, function (error, response) { 
        try {
        var jsonParsed = JSON.parse(response.body);
        dbcon.query('SELECT balance FROM balance WHERE  address = ' +  dbcon.escape(jsonParsed.data.address), function (err, result) {  
          for (var i in result)
          if (((jsonParsed.data.balance + jsonParsed.data.unconfirmed_received ) - result[i].balance) > 10000 )    //checking   new balance - balance from DB is bigger  than 0.5 $ 
          {
           
          feeding();
          dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'BCH', '"+jsonParsed.data.last_tx+"')"); //feedingststat
          client.action("tanglesheep"," Thx for feeding using BCH " );
            dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.data.balance + jsonParsed.data.unconfirmed_received,jsonParsed.data.address], function (err, result ) {}); 
            console.log("BCH feeding works");
          };
        });
      } catch(error) {
        console.log('bch feeding error  '+error);
        }
      });

      ethbalances(eth, function (error, response) { 
        try {
  var jsonParsed = JSON.parse(response.body);
  dbcon.query('SELECT balance FROM balance WHERE  address = "0x042cee4e592a54f697620bc3090800ca180dbcbe"', function (err, result) {   
    for (var i in result)
    if ((jsonParsed.final_balance - result[i].balance) > 1000000000000000 )    //checking   new balance - balance from DB is bigger  than 0.5 $ 
    {
    feeding();
    dbcon.query("INSERT INTO feedingstats (id, type, info) VALUES ("+ dbcon.escape(uniqid()) +", 'ETH', '"+jsonParsed.txrefs[0].tx_hash+"')"); //feedingststat
    client.action("tanglesheep"," Thx for feeding using ETH your TX https://live.blockcypher.com/eth/tx/"+jsonParsed.txrefs[0].tx_hash );
    dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.final_balance,"0x042cee4e592a54f697620bc3090800ca180dbcbe"], function (err, result ) {}); 
    console.log("ETH feeding works");
        };
      });
    } catch(error) {
      console.log('eth feeding error  '+error);
      }
   });
/*

      iotarequest(optionsbalance, function (error, response, data) {
        if (!error && response.statusCode == 200) {
    //      console.log(data.hashes[0]);
          dbcon.query('SELECT balance FROM balance WHERE  address = "RNHDJ9HBOBYCK9FAULCCBDPBYUPPEMHESSNNELHRXZNSQIHZEPYT9UZEOOAIPCVPFBJJCTBQWJIWQVGLBTYNZUZVSZ"', function (err, result) {   
            for (var i in result)
            if ((data.balances[0] - result[i].balance) > 1500000 )    //checking   new balance - balance from DB is bigger  than 0.5 $ 
            {
              console.log("IOTA feeding works");
            feeding();
            iotarequest(optionstx, function (error, response, data) {
              if (!error && response.statusCode == 200) {
             //   console.log(data.balances[0]);
                client.action("tanglesheep"," Thx for feeding using IOTA your tx is https://thetangle.org/transaction/"+data.hashes[0]);
              }
            });

            
            dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[data.balances[0],"RNHDJ9HBOBYCK9FAULCCBDPBYUPPEMHESSNNELHRXZNSQIHZEPYT9UZEOOAIPCVPFBJJCTBQWJIWQVGLBTYNZUZVSZ"], function (err, result ) {}); 
            
            };
          });
        }
      });
    */

    }
}); 


//--------------------------------END-------------cryptofeeding---------------------------------------------------------------------------------





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
  
    

  
  var lnpayrequestcreator = schedule.scheduleJob('59 * * * *', function(){  //create payment  every sunday at 1:20 am
    createlnpay ();      
  });
 
  createlnpay ();;  // create new charge each time script start or restart

  app.use(express.urlencoded({ extended: true }))
  app.post('/confirmation', function(request, response){
    const date = new Date();
    let hour = date.getHours();

    if ((hour >= 20 || hour <= 6 )  || ( todayfeeds >= 100 ) ){

      client.action("tanglesheep"," Sorry sheep sleeping :( , Thx for yoru Bitcoin LN " +request.body.hashed_order+ " payment anyway it support us :) ");

      createlnpay ();    // if somebody pays after feeding hours  create new  QR anyway

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
  const SockJS = require('sockjs-client');
  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  var sock = SockJS('http://95.85.254.86:59650/api');


  var animgifreq2 = {
    "jsonrpc": "2.0",
    "id": 10,
    "method": "setVisibility",
    "params": {
                    "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\", \"7bb7eadc-215a-4678-a9a0-d9d33db1c593\", \"image_source_cdbaf39b-78f9-4637-9165-d35bb1c90211\"]",
                    "args": [false]
                }
               }

  var soundalertreq2 = {
      "jsonrpc": "2.0",
       "id": 10,
       "method": "setVisibility",
        "params": {
                   "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"b2893761-fd07-4f3f-a7f6-fd3bdcc974e1\",\"ffmpeg_source_e15cc494-7aa4-4ea0-8bcc-0464acf9ee86\"]",
                      "args": [true]
                      }
                 }

        var animgifreq1 = {
         "jsonrpc": "2.0",
         "id": 10,
         "method": "setVisibility",
          "params": {
                      "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\", \"7bb7eadc-215a-4678-a9a0-d9d33db1c593\", \"image_source_cdbaf39b-78f9-4637-9165-d35bb1c90211\"]",
                       "args": [true]
                              }            
                }
                var soundalertreq1 = {
                 "jsonrpc": "2.0",
                 "id": 10,
                 "method": "setVisibility",
                 "params": {
                                 "resource": "SceneItem[\"scene_33f33347-27af-4aec-86b2-e8650e33003f\",\"b2893761-fd07-4f3f-a7f6-fd3bdcc974e1\",\"ffmpeg_source_e15cc494-7aa4-4ea0-8bcc-0464acf9ee86\"]",
                                 "args": [false]
                             }            
               }

   sock.onopen =  function() {
                console.log('open');
                      var req = '{"jsonrpc": "2.0","id": 8,"method": "auth","params": {"resource": "TcpServerService","args": ["'+config.obscontrol.api+'"]}}';
                            sock.send(req);

              

           sock.send(JSON.stringify(animgifreq1));
           sock.send(JSON.stringify(soundalertreq1));

          sleep(1500).then(() => {

                 sock.send(JSON.stringify(soundalertreq2));

              })
        sleep(4500).then(() => {

               sock.send(JSON.stringify(animgifreq2));
              sock.close();
         
            })
         }
    }       



//  feeding gif animation and sound






// Function calling feeder
 
  function feeding () {
    
  
      var options = { method: 'GET',url: (config.toolscontrol.dcmotor),headers:{ 'cache-control': 'no-cache' } };
        request(options, function (error, response, body) {
         if (!error && response.statusCode == 200) {
            // console.log("URL is OK") 
                  Hook.send(msgnormal);
                 dbcon.query("SELECT totalfeeds,todayfeeds FROM feedstat", function (err, result) {      //Feeding counters
                  for (var i in result)
                  totalfeeds = (result[i].totalfeeds) + 1;
                  todayfeeds = (result[i].todayfeeds) + 1;
                  dbcon.query("UPDATE feedstat SET totalfeeds=?, todayfeeds=? WHERE id=?",[totalfeeds, todayfeeds, 1], function (err, result ) {             //incrase counter in DB
                    if (err) throw err; });    
                    feedaniamtion ();   // plasy sound during the feeding
                });
          
       } else {
        HookAlert.send(errormsg);
         client.action("tanglesheep","CAN'T REACH FEEDER !!!, CONNECTION BROKEN , PLEASE CONTACT ADMIN ON DISCORD THX AND MY APOLOGIES tangle8Goatbits  tangle8Goatbits");
         console.log("can't reach ESP32")  
                 };
            });
    };
        
// Function feeding premium
          function feedingpremium () {
              
          
              var options = { method: 'GET', url: (config.toolscontrol.dcmotor),headers:{ 'cache-control': 'no-cache' } };
                request(options, function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                // console.log("URL is OK")
                           Hook.send(msgnpremium);
                          dbcon.query("SELECT totalfeeds,todayfeeds,premiumfeeds FROM feedstat", function (err, result) {      //Feeding counters
                          for (var i in result)
                          totalfeeds = (result[i].totalfeeds) + 1;
                          todayfeeds = (result[i].todayfeeds) + 1;
                          premiumfeeds = (result[i].premiumfeeds) + 1;
                          dbcon.query("UPDATE feedstat SET totalfeeds=?, todayfeeds=?, premiumfeeds=? WHERE id=?",[totalfeeds, todayfeeds, premiumfeeds, 1], function (err, result ) {             //incrase counter in DB
                            if (err) throw err; });    
                                feedaniamtion ();   // plasy sound during the feeding
                        });
          
                      } else {
                        HookAlert.send(errormsg);
                        client.action("tanglesheep","CAN'T REACH FEEDER !!!, CONNECTION BROKEN , PLEASE CONTACT ADMIN ON DISCORD THX AND MY APOLOGIES tangle8Goatbits  tangle8Goatbits ");
                        console.log("can't reach ESP32")  
                                };
                           });
                   };


  


  