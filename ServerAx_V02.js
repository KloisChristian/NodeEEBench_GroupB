/*
    Arduino on COM21
    write following command to run the server 
    npm install express(only required first time)
    
	node ServerEEBench.js

    Details:
    - Espress = framework for server (in place of http)
    - path = gives you static path from root of the server
    - public folder =  contains all files that can be accessed from the website
    - Express app by default run on localhost:3000
*/

    //Importing the core modules
    var fs = require('fs');
//    var util = require('util');
    var path = require('path');

// opening application
    var open = require('open');
     
    var express = require('express');
//    var jsonfile = require('jsonfile');
//    var sleep = require('sleep');
//    var csv = require('fast-csv');
    var SerialPort = require('serialport').SerialPort;

    //Importing child Process 
    var app = express();
    var http = require('http').Server(app);
    var spawnSync = require('child_process').spawnSync;
    var execSync = require('child_process').execSync;
    var execFileSync = require('child_process').execFileSync;
    var io = require('socket.io')(http);
    var dataMax = 512;
	var logCon = false;
	
var serialPort;
var pPath="";	
// port.path manufacturer, pnpId locationId, friendlyName, vendorId, productId	
    SerialPort.list().then(
//       console.log	   
       ports => ports.forEach(port => {
		   console.log("path: " + port.path);
		   console.log("manufacturer: " + port.manufacturer);
		   console.log("friendlyName: " + port.friendlyName);
		   // console.log("vendorId: " + port.vendorId);
		   // console.log("productId: " + port.productId);
		   // console.log(port.manufacturer.includes('arduino'));
           if (port.manufacturer.includes('arduino') || port.friendlyName.includes('Arduino')) {
		     serialPort = new SerialPort({  //"\\.\COM22"
                path: port.path,
	            baudRate: 115200      //  Baud rate befor 19200, 52 us per bit
             });
           }  			   
       }),
       err => console.error(err)
    );
   // no Arduino take last port
   // if (!serialPort) {
   //		     serialPort = new SerialPort({  //"\\.\COM22"
   //             path: pPath,
   //	            baudRate: 115200      //  Baud rate befor 19200, 52 us per bit
   //          });
   // }
// old manual serial port
//    SerialPort.list().then(
//       ports => ports.forEach(console.log),
//       err => console.error(err)
//    );
//   var serialPort = new SerialPort({  //"\\.\COM22"
//     path: "COM11 ",
//	  baudRate: 115200      //  Baud rate befor 19200, 52 us per bit
//  });     
   
    function hex(str) {
        var arr = [];
        for (var i = 0, l = str.length; i < l; i ++) {
                var ascii = str.charCodeAt(i);
                arr.push(ascii);
        }
        arr.push(255);
        arr.push(255);
        arr.push(255);
        return new Buffer(arr);
    }

function DecHexValue(x) {
 if (x=="A") { return 10; } else if (x=="B") {  return 11;
 } else if (x=="C") { return 12; } else if (x=="D") {  return 13;
 } else if (x=="E") {return 14; } else if (x=="F") {  return 15;
 } else { return parseInt(x); }
}

function hexToDec(x) {
   var hexN = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
   var dec = 0;
   for (var i = 0; i < x.length; i++) {    //  8 hex digits
      dec = dec * 16 + DecHexValue(x[i]); 
   }
   return dec;
}

    app.get('/', function(req,res){
   		fs.readFile(__dirname + '/Projekte/SerialA.html', 'binary', function(err, data) {
               if (err) data = "No such file";
    	       res.send(data);
            });
   	  // res.sendFile(path.join(__dirname + '/WebEditor/WebEditor.html'));
    });
     
    // Serve Static Directories
    app.use(express.static(path.join(__dirname)));
       
    //    
    io.on('connection', function(socket){ 
		var con = true;                             // connection still valid?
        console.log('An user is connected')
     
        // get data from connected device via serial port
		var dataBuf="";
         
         socket.on('cmd', function(data){     // get client event
        	var cmdName = data.value;         // cmd passed from client to Arduino
        	if (cmdName == "quiet") logCon = false; 
			if (cmdName == "log") logCon = true; 
			console.log('cmd: ' + cmdName);
    	    serialPort.write("_" + cmdName + "_");           // Arduino limiter
			// insert server action commands
			// var data= "Test Data:" + cmdName;
    		// socket.emit('newData',{value: data });  // send data to client
        });

	    serialPort.on('data',
		  function (data) {
		    // get buffered data and parse it to an utf-8 string
			var data1 = data.toString('utf-8');
			 dataBuf += data1;
			 var position = dataBuf.search('\n');
			 if (position >= 0 ) {
			   var xx = dataBuf.substring(0,position);
               dataBuf = dataBuf.substring(position+1);			   
			   if (logCon) console.log(dataBuf.length + "," + xx);     // dataBuf
		       socket.emit('newData',{value: xx});  // send data to client
			 }  
 		 } );
 
        socket.on('disconnect', function(data){
    	    console.log('An user is disconnected');
			con = false;
        });   
    }); 	
     
    // Server Starting
    // Listening on port 3000
    http.listen(3000, function(err){
        if(err){
    	  console.log('Error starting http server');
        } else{
    	  console.log('Sever running at http://localhost:3000 ');
		  // ready to open browser
		  var add = 'http://localhost:3000';
		  setTimeout(open, 2000, add);  // problems connecting 
        }
    });
