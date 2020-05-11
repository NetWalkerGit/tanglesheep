const mysql = require('mysql');
const tmi = require('tmi.js');
const uniqid = require('uniqid');
const schedule = require('node-schedule');
const request = require("request");
const config = require('./config.js');

const dbcon = mysql.createConnection({
  host: (config.db.host),
  user: (config.db.user),
  password: (config.db.password),
  database: (config.db.database)
});

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

  const client = new tmi.client(opts);
  client.on('connected', onConnectedHandler);
  client.connect();



  
  var totalfeeds ;
  var todayfeeds ;
  var sumsubfeeds ;
  var sumpointfeeds ;
  var sumpocheerfeeds;



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
           });
 // -----------------reset feeding------------------

 




// -----------------------------------------twitch chat feeding    !subfeedin and loyalty feeding--------------------------------------------------

  client.on ('chat', function(channel, userstate,  message) { 
   // console.log(userstate);
   // console.log(message);
   const date = new Date();
   let hour = date.getHours();
 
   var newuser = "INSERT INTO twitchuser (id,firstfeed,userid,username,message) VALUES ("+ dbcon.escape(uniqid()) +","+ dbcon.escape(date) +"," + dbcon.escape(userstate['user-id']) + "," + dbcon.escape(userstate['display-name']) + "," + dbcon.escape(message) + ")";
   var userfeed = "UPDATE  twitchuser SET fedtoday = '1', message = '"+message+"' WHERE userid = " +  dbcon.escape(userstate['user-id']);
   var checkfeed = 'SELECT userid,fedtoday FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']);

 if (todayfeeds >= 100){                 // dayly feeding limit 

  client.action("tanglesheep", userstate['display-name'] + " Max day feeds limit reached , try tomorrow :(  Lets not overfeed sheep <3 Thx for cheering anyway. it support us. ");
 } else { 



        //-----------------------------------------------------------------------subfeeds--------------------------------------------------

        if ((hour >= 20 || hour <= 7 ) &&   (message === "!subfeed") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder))  {

         client.action("tanglesheep", userstate['display-name'] + " Sheep's sleeping  now. Check feeding hours on video :(  Sheep need some rest <3 Thx for understanding <3 ");

         } else   if( (message === "!subfeed") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {
 
              dbcon.query(checkfeed, function (err, result) {         // veryfi if user can feed

          if (result.length == []) {                  // first time feeders not in DB
             dbcon.query(newuser, function (err, result) {  });
              
                feeding();
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
                sumsubfeeds = (result[i].subfeeds) + 1;                                                                                          //incrase counter in DB
                dbcon.query("UPDATE  twitchuser SET subfeeds=? WHERE userid=?",[sumsubfeeds, userstate['user-id']], function (err, result ) {    //incrase counter in DB
                   });
              });


                feeding();             //run feeder
               client.action("tanglesheep", userstate['display-name'] + " Sub power feeding :) ");
              }
                  });
           };
         
    
//-----------------------------------------------------------------------premiumfeed--------------------------------------------------

if ((hour >= 20 || hour <= 7 ) &&   (message === "!premiumfeed") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder))  {

  client.action("tanglesheep", userstate['display-name'] + " Sheep's sleeping  now. Check feeding hours on video :(  Sheep need some rest <3 Thx for understanding <3 ");

  } else   if( (message === "!premiumfeed") && userstate.badges && (userstate.badges.subscriber || userstate.badges.founder)) {

       dbcon.query(checkfeed, function (err, result) {         // veryfi if user can feed

   if (result.length == []) {                  // first time feeders not in DB
      dbcon.query(newuser, function (err, result) {  });
       
      feedingservo();
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
         sumsubfeeds = (result[i].subfeeds) + 1;                                                                                          //incrase counter in DB
         dbcon.query("UPDATE  twitchuser SET subfeeds=? WHERE userid=?",[sumsubfeeds, userstate['user-id']], function (err, result ) {    //incrase counter in DB
            });
       });


         feedingservo();             //run feeder
        client.action("tanglesheep", userstate['display-name'] + " Premiumfeed feeding :) ");
       }
           });
    };


//----------------------------------------------------------------------------- Loyalty feeding--------------------------------------------------

   if ((hour >= 20 || hour <= 7 ) &&  (userstate['custom-reward-id'] === '5d77928f-00f7-4612-9ea6-2a64070b8902') ) {
  
                    client.action("tanglesheep", userstate['display-name'] + " Sheep's sleeping  now. Check feeding hours on video :(  Sheep need some rest <3 Thx for understanding <3 ");
  
  
                  } else  if (userstate['custom-reward-id'] === '5d77928f-00f7-4612-9ea6-2a64070b8902')  {
                    dbcon.query(checkfeed, function (err, result ) {         // veryfi if user can feed
                        if (result.length == []) {                  // first time feeders not in DB
                           dbcon.query(newuser, function (err, result  ) {  
                          });
                          dbcon.query("UPDATE  twitchuser SET pointfeeds=? WHERE userid=?",[1, userstate['user-id']], function (err, result ) {    //incrase counter in DB
                          });   
                               feeding();                          //run feeder
                           client.action("tanglesheep", userstate['display-name'] + " Thx for first time  loyalty feeding:) ");
                          
                                                 }        
                                                     else {

                             dbcon.query('SELECT pointfeeds FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result) {      //sumpointfeeds counter
                               for (var i in result)
                               sumpointfeeds = (result[i].pointfeeds) + 1;                                                                                          //incrase counter in DB
                               dbcon.query("UPDATE  twitchuser SET pointfeeds=?,message=?  WHERE userid=?",[sumpointfeeds,message, userstate['user-id']], function (err, result ) {    //incrase counter in DB
                                       //  if (err) throw err; });   
                                  });
                             });
                            
                                  feeding();   //run feeder
                             client.action("tanglesheep", userstate['display-name'] + " Enjoy your loyalty feeding :) <3 ");
                                                                 }
                                                                });
                                                              } 
      }


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

 
       if (hour >= 20 || hour <= 7 )   {

        client.action("tanglesheep", userstate['display-name'] + " Sheep's sleeping   now. Check feeding hours on video :(  Sheep need some rest <3 Thx for understanding <3 ");
    
    
           } else  if    (userstate.bits <= 49){
                 client.action("tanglesheep", userstate['display-name'] + " Thx for cheering <3 <3  If you want to feed our fluffy sheep, cheer more than 49 bits :) ");
    
          }  else if ( todayfeeds >= 100 ) {
                                        client.action("tanglesheep", userstate['display-name'] + " Max day feeds limit reached , try tomorrow :(  Lets not overfeed sheep <3 Thx for cheering anyway. it support us. ");
                                      
            } else  if (userstate.bits == 50) {
                
              dbcon.query('SELECT userid FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result ) {       
                if (result.length == []) {                  // first time feeders not in DB
                   dbcon.query("INSERT INTO twitchuser (id,firstfeed,userid,username,message,cheerfeeds) VALUES ("+ dbcon.escape(uniqid()) +","+ dbcon.escape(date) +"," + dbcon.escape(userstate['user-id']) + "," + dbcon.escape(userstate['display-name']) + "," + dbcon.escape(message) + ",'1')", function (err, result  ) {  
                    });
                    
                    feeding();
                   client.action("tanglesheep", userstate['display-name'] + " Thx for firs time  cheer feeding :)  ");
        
                                      } else {
    
                                        dbcon.query('SELECT cheerfeeds FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result) {      //cheerfeeds counter
                                          for (var i in result)
                                          sumpocheerfeeds = (result[i].cheerfeeds) + 1;                                                                                          //incrase counter in DB
                                          dbcon.query("UPDATE  twitchuser SET cheerfeeds=? WHERE userid=?",[sumpocheerfeeds, userstate['user-id']], function (err, result ) {    //incrase counter in DB
                                                    });   
                                        feeding();
                                        client.action("tanglesheep", userstate['display-name'] + " Thx for feeding <3 <3   Sheep are happy :)  ");
                                               });
                                             }
                                          });
                                        
//--------------------------------------------------------cheeering Premium  feeding-------------------------------------------------------------------------
                 } else  if (userstate.bits >= 51) {
                
                   dbcon.query('SELECT userid FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result ) {       
                        if (result.length == []) {                  // first time feeders not in DB
                           dbcon.query("INSERT INTO twitchuser (id,firstfeed,userid,username,message,cheerfeeds) VALUES ("+ dbcon.escape(uniqid()) +","+ dbcon.escape(date) +"," + dbcon.escape(userstate['user-id']) + "," + dbcon.escape(userstate['display-name']) + "," + dbcon.escape(message) + ",'1')", function (err, result  ) {  
                            });
                                                
                            feedingservo();
                          client.action("tanglesheep", userstate['display-name'] + " Thx for firs time  Premium feeding :)  ");
                                    
                           } else {
                             dbcon.query('SELECT cheerfeeds FROM twitchuser WHERE  userid = ' +  dbcon.escape(userstate['user-id']), function (err, result) {      //cheerfeeds counter
                              for (var i in result)
                               sumpocheerfeeds = (result[i].cheerfeeds) + 1;                                                                                          //incrase counter in DB
                               dbcon.query("UPDATE  twitchuser SET cheerfeeds=? WHERE userid=?",[sumpocheerfeeds, userstate['user-id']], function (err, result ) {    //incrase counter in DB
                                 });   
                                 feedingservo();
                                   client.action("tanglesheep", userstate['display-name'] + " Thx for Premium carrot feeding <3 <3   Sheep are happy :)  ");
                                              });
                                           }
                                       });
                                    }

                            
        });


 
//---------------------------------------------cryptofeeding-----------------------------------------------------------

// client.on ('chat', function(channel, userstate,  message) { 
  var ltcbalances = require('request');
  var btcbalances = require('request');
  var xrpbalances = require('request');
  var bchbalances = require('request');
  var ethbalances = require('request');
  //var iotarequest = require('request');

var btc = {
  'method': 'GET',
  'url': 'https://blockchain.info/rawaddr/37wQuQDXQvw8yLwPSmAjkuU8xgjqJycwBp',
  'headers': {
  }
};

var ltc = {
    'method': 'GET',
    'url': 'https://api.blockcypher.com/v1/ltc/main/addrs/MWvyvpnuW42vNRZT6BYC83J1RWNMtuxtPr/full?limit=1',
    'headers': {
    }
  };

  var xrp = {
    'method': 'GET',
    'url': 'https://api.xrpscan.com/api/v1/account/rMAZ8bBvyf5YsazFRs3Aj1So3dArcaJMXD',
    'headers': {
    }
  };

  var bch = {
    'method': 'GET',
    'url': 'https://bch-chain.api.btc.com/v3/address/1Pn2oQzbk2JaALdhsvtgyWAv49rdUxHyUF',
    'headers': {
    }
  };

  var eth = {
    'method': 'GET',
    'url': 'https://api.blockchair.com/ethereum/dashboards/address/0x042CEE4E592a54F697620bC3090800cA180DBcBE?limit=1&offset=0',
    'headers': {
    }
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
var checker = schedule.scheduleJob(' */30 * * * * * ', function(){
  const date = new Date();
  let hour = date.getHours();

  if ((hour >= 20 || hour <= 7 )  || ( todayfeeds >= 100 ) ){

            //nothing will happen       musim pridat zpravu pri pripsani krypta
           // console.log("feeding limit reached");
       } else {
    btcbalances(btc, function (error, response) { 
        if (error) throw new Error(error);
        var jsonParsed = JSON.parse(response.body);
        dbcon.query('SELECT balance FROM balance WHERE  address = ' +  dbcon.escape(jsonParsed.address), function (err, result) {  
          for (var i in result)
          if ((jsonParsed.final_balance - result[i].balance) > 2000 )    //checking   new balance - balance from DB is bigger than 0.5 $ = 5000 satoshi
          {
            console.log("BTC feeding works");
          feeding();
          client.action("tanglesheep"," Thx for feeding using BTC  your  TX https://blockchair.com/bitcoin/transaction/"+jsonParsed.txs[0].hash  );
            dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.final_balance, jsonParsed.address], function (err, result ) {}); 
          
          };
        });
     
      });
    
    
    ltcbalances(ltc, function (error, response) { 
      if (error) throw new Error(error);
      var jsonParsed = JSON.parse(response.body);
      dbcon.query('SELECT balance FROM balance WHERE  address = ' +  dbcon.escape(jsonParsed.address), function (err, result) {  
        for (var i in result)
        if ((jsonParsed.final_balance - result[i].balance) > 200000 )    //checking   new balance - balance from DB is bigger than 0.5 $ 
        {
          console.log("LTC feeding works");
        feeding();
        client.action("tanglesheep"," Thx feeding using LTC   your  TX https://blockchair.com/litecoin/transaction/"+jsonParsed.txs[0].hash  );
          dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.final_balance, jsonParsed.address], function (err, result ) {}); 
        
        };
      });
   
    });
  


      xrpbalances(xrp, function (error, response) { 
        if (error) throw new Error(error);
        var jsonParsed = JSON.parse(response.body);
        dbcon.query('SELECT balance FROM balance WHERE  address = ' +  dbcon.escape(jsonParsed.account), function (err, result) {  
          for (var i in result)
          if ((jsonParsed.xrpBalance - result[i].balance) > 1 )    //checking   new balance - balance from DB is bigger than than 0.5 $ 
          {
            console.log("XRP feeding works");
          feeding();
          client.action("tanglesheep"," Thx for feeding using XRP your TX https://xrpscan.com/tx/"+jsonParsed.previousAffectingTransactionID );
            dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.xrpBalance, jsonParsed.account], function (err, result ) {}); 
          
          };
        });
     
      });

      bchbalances(bch, function (error, response) { 
        if (error) throw new Error(error);
        var jsonParsed = JSON.parse(response.body);
        dbcon.query('SELECT balance FROM balance WHERE  address = ' +  dbcon.escape(jsonParsed.data.address), function (err, result) {  
          for (var i in result)
          if (((jsonParsed.data.balance + jsonParsed.data.unconfirmed_received ) - result[i].balance) > 10000 )    //checking   new balance - balance from DB is bigger  than 0.5 $ 
          {
            console.log("BCH feeding works");
          feeding();
          client.action("tanglesheep"," Thx for feeding using BCH your TX https://bch.btc.com/"+jsonParsed.data.last_tx );
            dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.data.balance + jsonParsed.data.unconfirmed_received,jsonParsed.data.address], function (err, result ) {}); 
          
          };
        });
     
      });

      ethbalances(eth, function (error, response) { 
        if (error) throw new Error(error);
        var jsonParsed = JSON.parse(response.body);
        dbcon.query('SELECT balance FROM balance WHERE  address = "0x042cee4e592a54f697620bc3090800ca180dbcbe"', function (err, result) {   
          for (var i in result)
          if ((jsonParsed.data["0x042cee4e592a54f697620bc3090800ca180dbcbe"]["address"]["balance"] - result[i].balance) > 1000000000000000 )    //checking   new balance - balance from DB is bigger  than 0.5 $ 
          {
            console.log("ETH feeding works");
          feeding();
          client.action("tanglesheep"," Thx for feeding using ETH your TX https://blockchair.com/ethereum/transaction/"+jsonParsed.data["0x042cee4e592a54f697620bc3090800ca180dbcbe"]["calls"]["0"]["transaction_hash"] );
          dbcon.query("UPDATE  balance SET balance=? WHERE address=?",[jsonParsed.data["0x042cee4e592a54f697620bc3090800ca180dbcbe"]["address"]["balance"],"0x042cee4e592a54f697620bc3090800ca180dbcbe"], function (err, result ) {}); 
          
          };
        });
     
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


function printQRimage () {
  var endpoint = 'https://api.strike.acinq.co';
  var api_key = (config.acinqapi.apikey);
  
  var options = {
    method: 'GET',
    url: endpoint + '/api/v1/charges?1',
    headers: {
      'cache-control': 'no-cache',
      'Content-Type': 'application/json' },
    json: true,
    auth: {
      user: api_key,
      pass: '',
    }
  };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var qr_svg = qr.image(body[0].payment_request, { type: 'png' });
  qr_svg.pipe(require('fs').createWriteStream('/var/www/html/tanglesheep/streamfeedcount/LNpayment.png'));
  var svg_string = qr.imageSync(body[0].payment_request, { type: 'png' });
  
    //console.log(body);
  });
  
  }
  
  //------------creating new charge---------
  function createnewcharge () {
  
  
  var endpoint = 'https://api.strike.acinq.co';
  var api_key = (config.acinqapi.apikey);
  
  var options = {
    method: 'POST',
    url: endpoint + '/api/v1/charges',
    headers: {
      'cache-control': 'no-cache',
      'Content-Type': 'application/json' },
    body: {
      amount: 5500,
      description: 'feeding',
      expiry_sec: 604000,
      currency: 'btc'
    },
    json: true,
    auth: {
      user: api_key,
      pass: '',
    }
  };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    printQRimage () ;   // create new qr code  with last payment request [0]
   // console.log(body);
  });
  
  }
  
  var lnpayrequestcreator = schedule.scheduleJob({hour: 1, minute: 30, dayOfWeek: 0}, function(){  //create payment  every sunday at 1:20 am
    createnewcharge ();         
  });
 
  
  app.use(express.json());
  app.post('/confirmation', function(request, response){
    const date = new Date();
    let hour = date.getHours();

    if ((hour >= 20 || hour <= 7 )  || ( todayfeeds >= 100 ) ){

      client.action("tanglesheep"," Sorry sheep sleeping :( , Thx for yoru Bitcoin LN " +request.body.data.payment_hash+ " payment anyway it support us :) ");

      createnewcharge ();    // if somebody pays after feeding hours  create new  QR anyway

     }else if (request.body.data.paid == true){
      client.action("tanglesheep"," Thx for feeding via BITCOIN LN your payment hash is "+request.body.data.payment_hash);
      createnewcharge ();
      feeding ();
     }
  });
  app.listen(8899);




//--------------------------------------------------Bitocin LN  payment ------------------------------------------------------------------








// Function calling feeder
function feeding () {
  //  Hook.send(msg);

    var options = { method: 'GET',
    url: (config.toolscontrol.dcmotor),
    headers:
     { 'cache-control': 'no-cache' } }; request(options, function (error, response, body) {
        console.log(error);
    //    console.log(response);
               });
               dbcon.query("SELECT totalfeeds,todayfeeds FROM feedstat", function (err, result) {      //Feeding counters
                for (var i in result)
                totalfeeds = (result[i].totalfeeds) + 1;
                todayfeeds = (result[i].todayfeeds) + 1;
                dbcon.query("UPDATE feedstat SET totalfeeds=?, todayfeeds=? WHERE id=?",[totalfeeds, todayfeeds, 1], function (err, result ) {             //incrase counter in DB
                  if (err) throw err; });    
                   
              });

          };

          function feedingservo () {
            //  Hook.send(msg);
          
              var options = { method: 'GET',
              url: (config.toolscontrol.servo12),
              headers:
               { 'cache-control': 'no-cache' } }; request(options, function (error, response, body) {
                  console.log(error);
              //    console.log(response);
                         });
                         dbcon.query("SELECT totalfeeds,todayfeeds FROM feedstat", function (err, result) {      //Feeding counters
                          for (var i in result)
                          totalfeeds = (result[i].totalfeeds) + 1;
                          todayfeeds = (result[i].todayfeeds) + 1;
                          dbcon.query("UPDATE feedstat SET totalfeeds=?, todayfeeds=? WHERE id=?",[totalfeeds, todayfeeds, 1], function (err, result ) {             //incrase counter in DB
                            if (err) throw err; });    
                             
                        });
          
                    };

function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
   
  }
  


  