/*
	node Serial.js

    Details:

*/

    var SerialPort = require('serialport').SerialPort;
	
var serialPort;	

// Detect Arduino on serial port with vendorId '2341'
// available info port.path manufacturer, pnpId locationId, friendlyName, vendorId, productId	
    SerialPort.list().then(
//       console.log	   
       ports => ports.forEach(port => {
		   console.log("path: " + port.path);
		   console.log("manufacturer: " + port.manufacturer);
		   console.log("friendlyName: " + port.friendlyName);
		   console.log("vendorId: " + port.vendorId);  //2341 MKR Wifi 
		   console.log("productId: " + port.productId); //8054 MKR Wifi 
		   // console.log(port.manufacturer.includes('arduino'));
           if (typeof port.vendorId === 'undefined') { vendorId="0000"; }
		   else { vendorId = port.vendorId} 
		   if (port.manufacturer.includes('arduino') || ( vendorId == '2341') ) {
		     serialPort = new SerialPort({  //"\\.\COM22"
                path: port.path,
	            baudRate: 115200      //  Baud rate befor 19200, 52 us per bit
             });
            serial_communicate();
		   }			 
       }),
       err => console.error(err)
    );
   
function serial_communicate () {
        
		var ack = 1;
		var dataBuf="";
        var i = 0;
		
	    serialPort.on('data',
		  function (data) {
		    // get buffered data and parse it to an utf-8 string
			var data1 = data.toString('utf-8');
			 dataBuf += data1;
			 var position = dataBuf.search('\n');
			 if (position >= 0 ) {
			   var xx = dataBuf.substring(0,position);
               dataBuf = dataBuf.substring(position+1);			   
			   console.log(dataBuf.length + "," + xx);     // dataBuf
		       var x = ('000' + (i*8)).slice(-3);
			   var y = ('000' + (Math.round(i/8)*9)).slice(-3);
		       if (i < 160) {
			     i = i + 1; 
			     serialPort.write("p" + x + y + "_");
               }				 
			 }  
 		 } );

		  serialPort.write("p020040_");           // Arduino limiter
		  serialPort.write("p060080_");           // Arduino limiter
}
