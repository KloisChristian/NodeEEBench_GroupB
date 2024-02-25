/* 2012 Joerg Vollrath
 *  Chart Tool
 *  IBIS Scatterplots
 * Analyzer Box plots
 * fontsize depending on canvas size 40x80 characters
 */

// Here it starts        div        label     values   xaxis
// function ScatterPlot("Chartid","Chartname",x,y,    "xaxisname","lin","auto","yaxisname","lin","auto","nogrid");
//      Axis: lin 0 , log  1
//      Scaling:  auto   Fit into graph with some space around
//                minmax no space around grasph
//                auto0  Fit including 0
//      Grid: nogrid, Grid, Fine 
//
//                          "row","col"      0/1                 
//   function tableChart(tableId,rowCol,index,header, w, h, nameH, add) {
//
//
// function ScatterPlotSimple   no values on x and y axis
// function drawText(x,y,txt) 
//
// function addCurve("Chartid",xy,nr);
// Arbitrary number of points
//
// function setLegend("line1,line2,line3")
// function clearLegend() {
//
// function drawLabelxy
//
// function setLPos(px,py);  right, center 0.0, 0.4 ; right, top 0.0,0.15; left, bottom -0.5, 0,7
//
var Chart_name;
var xaxis_name;
var yaxis_name;
var chart_context;
var xll, yll, xup, yur;
var scalexx,scaleyy;
var scalex_fk,scalex_of,scaley_fk,scaley_of;
var chartO = { xstyp: 0, ystyp: 0}; // linear axis
var c_fontsize = 12;
var currColorIndex = 0;
var legend=new Array();
var legendPos = { px: 0.0 , py: 0.15};     // TRBLC: top right, bottom, left, center for x and y
                                                
 	var perSizeX =0.75;
    var	perSizeY =0.75;
 
 function scalexg(x) {
  var xx;	 
  if (chartO.xstyp == 1) {x = Math.log(Math.abs(x)) / Math.log(10);}
  xx = Math.round(x * scalex_fk + scalex_of);
  if (xx < xll) xx = xll; 
  if (xx > xur) xx = xur; 
  return xx;
 }
 function scaleyg(y) {
  var yy;
  if (chartO.ystyp == 1) {y = Math.log(Math.abs(y)) / Math.log(10);}
  yy = Math.round(scaley_of - y * scaley_fk);
  if (yy < yll) yy = yll; 
  if (yy > yur) yy = yur; 
 return yy;
 }

var listCharts= new Array();

function add_chart(chartnr) {
    listCharts[listCharts.length] = chartnr;
    chartnr();   
 }

function update_charts() {
   for (var i = 0; i < listCharts.length; i++) {
    // alert(i);
    listCharts[i]();
   }
 }

 var oMax,oMin,Norm_Delta,Small_Delta;

//#########################
//# Format Numbers with prescaler m,u,n,p,k,M,G,T
//#########################
//# Adjust min,max to allow nice axis labels
 	  function vToZahl (vor) { // Bsp: 2.5n -> 2.5E-9
           var x=parseFloat(vor.substr(0,vor.length-1));
		   var vorx=vor.substr(vor.length-1,1);
		  // alert(vor+"x"+x);
   		  if (vorx=="T") { return x*1E12;}
   		  if (vorx=="G") { return x*1E9;}
		  if (vorx=="M") { return x*1E6;}
		  if (vorx=="k") { return x*1E3;}
		  if (vorx=="m") { return x*1E-3;}
		  if (vorx=="u") { return x*1E-6;}
		  if (vorx=="n") { return x*1E-9;}
		  if (vorx=="p") { return x*1E-12;}
		  if (vorx=="f") { return x*1E-15;}
		  if (vorx=="a") { return x*1E-18;}
		  // keine Skalierung Vorsatzzeichen
		  x=parseFloat(vor);
		  return x;
		}
 
        function vToBase (vor) { // Bsp: 2.5n -> n
           var x=parseFloat(vor.substr(0,vor.length-1));
		   var vorx=vor.substr(vor.length-1,1);
		  // alert(vor+"x"+x);
   		  if (vorx=="T") { return x;}
   		  if (vorx=="G") { return x;}
		  if (vorx=="M") { return x;}
		  if (vorx=="k") { return x;}
		  if (vorx=="m") { return x;}
		  if (vorx=="u") { return x;}
		  if (vorx=="n") { return x;}
		  if (vorx=="p") { return x;}
		  if (vorx=="f") { return x;}
		  if (vorx=="a") { return x;}
		  // keine Skalierung Vorsatzzeichen
		  x=parseFloat(vor);
		  return x;
		}
		
        function zahlToV (zahl) { // Bsp: 2.5E-9 -> 2.5n
		  var Betrag=Math.abs(zahl);
		  if (Betrag < 1E-15) return (Math.round(zahl*1E20)/100+"a"); 
		  if (Betrag < 1E-12) return (Math.round(zahl*1E17)/100+"f"); 
		  if (Betrag < 1E-9) return (Math.round(zahl*1E14)/100+"p"); 
		  if (Betrag < 1E-6) return (Math.round(zahl*1E11)/100+"n"); 
		  if (Betrag < 1E-3) return (Math.round(zahl*1E8)/100+"u"); 
		  if (Betrag < 1)    return (Math.round(zahl*1E5)/100+"m"); 
		  if (Betrag > 1E3) return (Math.round(zahl*1E-1)/100+"k"); 
		  if (Betrag > 1E6) return (Math.round(zahl*1E-4)/100+"M"); 
		  if (Betrag > 1E9) return (Math.round(zahl*1E-7)/100+"G"); 
		  if (Betrag > 1E12) return (Math.round(zahl*1E-7)/100+"T"); 
		  return Math.round(zahl*100)/100;
		}

        function zahlToVb (zahl, b) { // Bsp: 2.5E-9 -> 2.5n
		  var Betrag = b;
		  if (Betrag < 1E-15) return (Math.round(zahl*1E20)/100+"a"); 
		  if (Betrag < 1E-12) return (Math.round(zahl*1E17)/100+"f"); 
		  if (Betrag < 1E-9) return (Math.round(zahl*1E14)/100+"p"); 
		  if (Betrag < 1E-6) return (Math.round(zahl*1E11)/100+"n"); 
		  if (Betrag < 1E-3) return (Math.round(zahl*1E8)/100+"u"); 
		  if (Betrag < 1)    return (Math.round(zahl*1E5)/100+"m"); 
		  if (Betrag > 1E3) return (Math.round(zahl*1E-1)/100+"k"); 
		  if (Betrag > 1E6) return (Math.round(zahl*1E-4)/100+"M"); 
		  if (Betrag > 1E9) return (Math.round(zahl*1E-7)/100+"G"); 
		  if (Betrag > 1E12) return (Math.round(zahl*1E-7)/100+"T"); 
		  return Math.round(zahl*100)/100;
		}

//#########################
//# scale_log_max_min
//#########################
//# Adjust min,max to allow nice axis labels
 function scale_log_max_min (vmax,vmin,scale) {
   var number_of_labels=5;
   var Delta,Exponent;
   if (vmax == vmin) {
        vmax = 1.1 * vmax;
        vmin = 0.9 * vmin;
   }
   Delta = (Math.log(vmax)/Math.log(10)-Math.log(vmin)/Math.log(10))/number_of_labels;
   oMin=vmin; oMax = vmax;
   if (scale.substr(0,4)=="auto") {
     oMin =Math.exp(Math.floor(Math.log(vmin)/Math.log(10))*Math.log(10));
     oMax =Math.exp(Math.ceil(Math.log(vmax)/Math.log(10))*Math.log(10));
   }
   if (Delta<1) {
     Norm_Delta=10; Small_Delta=1;
   } else {	
     Norm_Delta=Math.exp(Math.round(Delta)*Math.log(10));
     if (Norm_Delta > 4) {
      Small_Delta =10;
      } else {
	   Small_Delta=1;
     }	 
   }
   // alert(oMin+" "+oMax+" "+Norm_Delta+" "+vmax+" "+vmin);
}

//#########################
//# scale_lin_max_min
//#########################
//# Adjust min,max to allow nice axis labels
 function scale_lin_max_min (vmax,vmin,scale) {
   var number_of_labels=5;
   var Delta,Exponent;
   
   if (vmax == vmin) {
   	 if (vmax == 0){
   	 	vmax = 0.5;
   	 	vmin = -0.5;
   	 } else {
        vmax = 1.1 * vmax;
        vmin = 0.9 * vmin;
		if (vmax < vmin) {
		  var vs = vmax;
		  vmax = vmin;
		  vmin = vs;
		}	
   	 }
   }
   // alert(scale.substr(scale.length-1,1)+"Hello"+scale.substr(0,4));
   if (scale.substr(scale.length-1,1)=="0") {
      if ((vmax>0) && (vmin>0)) {vmin=0;}
      if ((vmax<0) && (vmin<0)) {vmax=0;}
   }
   
   Delta = (vmax-vmin)/number_of_labels;
   
   Exponent = Math.floor(Math.log(Delta)/Math.log(10));
   Norm_Delta = Delta / Math.exp(Exponent*Math.log(10));
   if (Norm_Delta > 5 ) {
     Exponent = Exponent +1;
     Norm_Delta = 1; Small_Delta =0.2;
   }
   else if (Norm_Delta > 2) {
     Norm_Delta = 5; Small_Delta =1;
   }
   else if (Norm_Delta > 1) {
     Norm_Delta = 2; Small_Delta =0.5;
   } else {
     Norm_Delta = 1; Small_Delta =0.2;
   }
//   alert("Max "+vmax+" Min "+vmin+" Exponent "+Exponent+" Norm_Delta "+Norm_Delta);
   oMax = vmax; oMin = vmin;
   if (scale.substr(0,4)=="auto") {
    if (vmax > 0) {
      oMax = (Math.floor(vmax/Norm_Delta/Math.exp(Exponent*Math.log(10))+1)) * Norm_Delta * Math.exp(Exponent*Math.log(10));  
    }
    else {
      oMax = (Math.floor(vmax/Norm_Delta/Math.exp(Exponent*Math.log(10)))) * Norm_Delta * Math.exp(Exponent*Math.log(10));  
    }
    if (vmin > 0) {
      oMin = (Math.floor(vmin/Norm_Delta/Math.exp(Exponent*Math.log(10)))) * Norm_Delta * Math.exp(Exponent*Math.log(10));  
    }
    else {
      oMin = (Math.floor(vmin/Norm_Delta/Math.exp(Exponent*Math.log(10))-1)) * Norm_Delta * Math.exp(Exponent*Math.log(10));  
    }
   }
   if (scale.substr(scale.length-1,1)=="0") {
      if ((vmax>0) && (vmin>0)) {oMin=0;}
      if ((vmax<0) && (vmin<0)) {oMax=0;}
   }
   // alert(scale+"x"+scale.substr(scale.length-1,1)+"x"+vmin+"x"+vmax+"x"+oMax+"x"+oMin);
   Norm_Delta = Norm_Delta * Math.exp(Exponent*Math.log(10));
   Small_Delta = Small_Delta * Math.exp(Exponent*Math.log(10));
  // alert("Max "+oMax+" Min "+oMin+" Exponent "+Exponent+" Norm_Delta "+Norm_Delta);
}

//#########################
//# Label_X_Axis 
//#########################
//# create from min, max values better rounded min, max values
//# make alist of labels
//# Plot labels and ticks 
function Label_X_Axis (xmin,xmax,Delta,SDelta,chart_context,canvas,linlog,grid){
 var current_x = xmin;
 var j;
 var Logscale = [2,3/2,4/3,5/4,6/5,7/6,8/7,9/8,10/9];
 var limitwhile=0;
 
 var betragA = Math.abs(xmin);
 if (Math.abs(xmax) > betragA) { betragA = Math.abs(xmax); }

 while ( (current_x <= xmax) && (limitwhile <20) ) {
        limitwhile=limitwhile+1;
        chart_context.strokeStyle = '#FFF';
        chart_context.beginPath();
        chart_context.moveTo(scalexg(current_x),canvas.height*(0.1+perSizeY)+5);
        chart_context.lineTo(scalexg(current_x),canvas.height*(0.1+perSizeY));
        chart_context.stroke();        
//Grid
       if ((grid=="Grid") || (grid=="Fine")) {
  chart_context.strokeStyle = '#999';
        chart_context.beginPath();
        chart_context.moveTo(scalexg(current_x),canvas.height*(0.1+perSizeY));
        chart_context.lineTo(scalexg(current_x),canvas.height*0.1);
        chart_context.stroke();
  }        
// Text
  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = 'top';
      chart_context.textAlign = 'center';
          // orientText(rm); 
          if (linlog=="lin") {
		   chart_context.fillText  ( zahlToVb(current_x,betragA) ,scalexg(current_x,j), canvas.height*(0.1+perSizeY)+7);
           // chart_context.fillText  (current_x.toPrecision(4) ,scalexg(current_x,j), canvas.height*(0.1+perSizeY)+7);
 		   current_x=current_x+Delta;
		  } else {
		   if (current_x != 0 ) {
            chart_context.fillText  ("1E"+Math.round(Math.log(Math.abs(current_x))/Math.log(10)) ,scalexg(current_x,j), canvas.height*(0.1+perSizeY)+7);
		   }
		   current_x=current_x*Delta;   // missing small values
		  }
 }
 // fine grid
 if (grid=="Fine") {
 current_x = xmin;
 var limitwhile=0;
 while ( (current_x <= xmax) && (limitwhile <100) ) {
 //Grid
        chart_context.strokeStyle = '#404040';
        chart_context.beginPath();
        chart_context.moveTo(scalexg(current_x),canvas.height*(0.1+perSizeY));
        chart_context.lineTo(scalexg(current_x),canvas.height*0.1);
        chart_context.stroke();        
          if (linlog=="lin") {
 		   current_x=current_x+SDelta;
		  } else {
		   current_x=current_x*Logscale[(limitwhile % 9)];   // missing small values
		  }
        limitwhile=limitwhile+1;
		// alert(limitwhile+" "+(limitwhile % 9)+" "+xmax.toPrecision(6)
		//       +" "+xmin.toPrecision(6)+" "+current_x.toPrecision(6));
  }
 }
}

//########################
// Label_Y_Axis 
//########################
// create from min, max values better rounded min, max values
// make alist of labels
// Plot labels and ticks 
function Label_Y_Axis(ymin,ymax,Delta,SDelta,chart_context,canvas,linlog,grid) {
 var current_y = ymin;
 var j;
 var Logscale = [2,3/2,4/3,5/4,6/5,7/6,8/7,9/8,10/9];
 var limitwhile=0;
 var betragA = Math.abs(ymin);
 if (Math.abs(ymax) > betragA) { betragA = Math.abs(ymax); }

  if (linlog=="lin") {j=0;} else {j=1;}       
 while ( (current_y <= ymax) && (limitwhile <20) ) {
        limitwhile=limitwhile+1;
        chart_context.strokeStyle = '#FFF';
        chart_context.beginPath();
        chart_context.moveTo(canvas.width*0.18-5,scaleyg(current_y,j));
        chart_context.lineTo(canvas.width*0.18,scaleyg(current_y,j));
        chart_context.stroke();        
// Grid 
     if ((grid=="Grid") || (grid=="Fine")) {
        chart_context.strokeStyle = '#999';
        chart_context.beginPath();
        chart_context.moveTo(canvas.width*0.18,scaleyg(current_y,j));
        chart_context.lineTo(canvas.width*(0.18+perSizeX),scaleyg(current_y,j));
        chart_context.stroke();        
	 }	
//		Text
  	     chart_context.font = 'bold '+c_fontsize+'px sans-serif';
         chart_context.textBaseline = 'middle';
         chart_context.textAlign = 'right';
          // orientText(rm); 
          if (linlog=="lin") {
		   chart_context.fillText  ( zahlToVb(current_y,betragA) , canvas.width*0.18-7,scaleyg(current_y,j));
           // chart_context.fillText  (current_y.toPrecision(4) , canvas.width*0.18-7,scaleyg(current_y,j));
		   current_y=current_y+Delta;
		  } else {
		   current_y=current_y*Delta;   // missing small values
           if (current_y!=0) {
		    chart_context.fillText  ("1E"+Math.round(Math.log(Math.abs(current_y))/Math.log(10)) , canvas.width*0.18-7,scaleyg(current_y,j));
		   }
		  }
	}
// fine grid
     if (grid=="Fine") {
 current_y = ymin;
 var limitwhile=0;
  while ( (current_y <= ymax) && (limitwhile <100) ) {
        chart_context.strokeStyle = '#444';
        chart_context.beginPath();
        chart_context.moveTo(canvas.width*0.18,scaleyg(current_y,j));
        chart_context.lineTo(canvas.width*(0.18+perSizeX),scaleyg(current_y,j));
        chart_context.stroke();        
          // orientText(rm); 
          if (linlog=="lin") {
		   current_y=current_y+SDelta;
		  } else {
		   current_y=current_y*Logscale[limitwhile % 9];   // missing small values
		  }
		  limitwhile=limitwhile+1;
		}
	}
}

//########################
// Draw_Marker 
//########################
// create from min, max values better rounded min, max values
// box, circle, cross, x, triangle, raute
function Draw_Marker(x,y,size,type,chart_context) {
  type= type % 6;
   chart_context.beginPath();
  if (type == 0) {
        chart_context.moveTo(x+size,y-size);
        chart_context.lineTo(x-size,y-size);
        chart_context.lineTo(x-size,y+size);
        chart_context.lineTo(x+size,y+size);
        chart_context.lineTo(x+size,y-size);
  } else if (type == 1) {
       chart_context.arc(x,y,size, 0, 2*Math.PI, false);
  } else if (type == 2) {
        chart_context.moveTo(x+size,y);
        chart_context.lineTo(x-size,y);
        chart_context.moveTo(x,y+size);
        chart_context.lineTo(x,y-size);
  } else if (type == 3) {
        chart_context.moveTo(x+size,y+size);
        chart_context.lineTo(x-size,y-size);
        chart_context.moveTo(x-size,y+size);
        chart_context.lineTo(x+size,y-size);
  } else if (type == 4) {
        chart_context.moveTo(x+size,y-size);
        chart_context.lineTo(x-size,y-size);
        chart_context.lineTo(x,y+size);
        chart_context.lineTo(x+size,y-size);
  } else if (type == 5) {
        chart_context.moveTo(x,y-size);
        chart_context.lineTo(x+size,y);
        chart_context.lineTo(x,y+size);
        chart_context.lineTo(x-size,y);
        chart_context.lineTo(x,y-size);
  }
  chart_context.stroke();        
   
}

//########################
// Draw text
//########################
function drawLabelxy(x,xstyp,y,ystyp,text,base, align) {
  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = base;
      chart_context.textAlign = align;
      chart_context.fillText  (text ,scalexg(x),scaleyg(y));
}

function drawBubblexy(x,xstyp,y,ystyp,xr,yr, text,base, align, colorX) {
  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = base;
      chart_context.textAlign = align;
	  chart_context.save();
      
	  chart_context.strokeStyle = colorX;
	  chart_context.lineWidth = 3;
      chart_context.beginPath();
	  var yRs =Math.abs((scaleyg(y) - scaleyg(yr)) / (scalexg(xr)-scalexg(x)));
      chart_context.scale( 1, yRs);       // scale to xr,yr
      // alert(Math.abs(scalexg(x)-scalexg(xr)) + " " + (scaleyg(y) - scaleyg(yr)) / (scalexg(xr)-scalexg(x)));
	  chart_context.arc(scalexg(x),scaleyg(y)/yRs,Math.abs(scalexg(x)-scalexg(xr)), 0, 2 * Math.PI, false);
      chart_context.stroke();  
      chart_context.restore();       // scale to xr,yr
      
	  chart_context.fillText  (text ,scalexg(x),scaleyg(y));
}

function drawLinexy(x,xstyp,y,ystyp,x1,y1) {
        chart_context.beginPath();
        chart_context.moveTo(scalexg(x),scaleyg(y));
        chart_context.lineTo(scalexg(x1),scaleyg(y1));
        chart_context.stroke();  
}

function setStroke(lw,color) {
      //          blue      green      red      pink      dgreen    dviolett   yellow     lblue    
    var colorstr=['#0000ff','#00A000','#ff0000','#ff00ff','#007070','#700070','#ffff00','#00ffff']
    var colorstr=['#FF8C00','#0000FF','#FF1493','#008000','#FF4500','#4682B4','#DC143C','#ABABAB']
	chart_context.lineWidth   = lw;
    chart_context.strokeStyle = color; // red
}

function clearLegend() {
    legend.length=0;
}

function setLegend(leg) {
   legend.length=0; 
   var leg1=leg.split(",");
   for (var i=0; i< leg1.length; i++) {
    legend[i]=leg1[i];
  }
}

function setLPos(px,py) {
   legendPos.px=px;
   legendPos.py=py;
}

function drawText(x,y,txt) {
         chart_context.strokeStyle = "#ffffff"; // black
         chart_context.textBaseline = 'middle';
         chart_context.textAlign = 'left';
         chart_context.fillText(txt,scalexg(x)+10,scaleyg(y)+10);
		 // alert();
}

function drawMarker(x,y,nr) {
      chart_context.save();
      chart_context.beginPath();
      chart_context.strokeStyle = "#ff0000"; // Red
	  chart_context.rect(scalexg(x)-8,scaleyg(y)-8, 16, 16);
  	  chart_context.stroke();
      chart_context.restore();
	  // Draw_Marker(x,y,20,nr,chart_context);
}


function drawRichtung(px1,py1,px2,py2,sc) {
        var dx, dy, px3, px4,py3,py4;
         chart_context.strokeStyle = "#000000"; // black
        chart_context.beginPath();
        dx = scalexg(px1) - scalexg(px2); dy = scaleyg(py1) - scaleyg(py2);
		var dl = Math.sqrt( dx * dx + dy * dy);
		dx = dx / dl; dy = dy / dl
 		px3 = scalexg(px2) + (dx - dy ) * sc * 10; 
		py3 = scaleyg(py2)  + (dy + dx ) * sc * 10;
 		px4 = scalexg(px2)	+ (dy + dx ) * sc * 10; 
		py4 = scaleyg(py2) + (dy - dx ) * sc * 10;
		// Problem xscale different than y scale 
        chart_context.moveTo(px3, py3);
        chart_context.lineTo(scalexg(px2), scaleyg(py2) );
        chart_context.lineTo(px4, py4 );
        chart_context.stroke();  
		 // alert();
}

//########################
// function addCurve("Chartid",xy,nr);
//########################
 function addCurve(Chartid,x,nr,tl) 
 {      //         blue    green  red  pink dgreen dviolett yellow lblue    
   var colorstr=['#0000ff','#00a000','#ff0000','#ff00ff','#007070','#700070','#ffff00','#00ffff']
    var colorstr=['#FF8C00','#0000FF','#FF1493','#008000','#FF4500','#4682B4','#DC143C','#ABABAB']
   var canv_obj=document.getElementById(Chartid);
   var xy;
   var xmin,xmax,ymin,ymax, ysmall, xsmall,Deltax, Deltay, SDeltax, SDeltay;
   // alert(currColorIndex);
   // alert(tl + "," + !tl);
   if (!tl) { tl = 1;}
	if (!canv_obj) {
	   canv_obj=Chartid;
      // alert('Error: I cannot find the canvas element!');
      // return;
    }
    if (!canv_obj.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }
    // Get the 2D canvas context.
    chart_context = canv_obj.getContext('2d');
    if (!chart_context) {
      alert('Error: failed to getContext!');
      return;
    }
	chart_context.lineWidth   = 2;
         var px = legendPos.px;  // Position Top right
		 var py = legendPos.py;   // 0.6 center
	for (var j = 1; j < Math.round(x.length/nr); j++) {
	   currColorIndex = currColorIndex + 1;
       chart_context.strokeStyle = colorstr[currColorIndex % colorstr.length]; // red
       Draw_Marker(scalexg(x[0]),scaleyg(x[0+j*nr]),4,currColorIndex+1,chart_context);		
       chart_context.beginPath();
       chart_context.moveTo(scalexg(x[0]), scaleyg(x[j*nr]) );
	   for( var i=1; i< nr; i++) {
	      if (tl > 0) {
           chart_context.lineTo(scalexg(x[i]), scaleyg(x[i+j*nr]) );
          }
	   }
       chart_context.stroke();  
	   for( var i=1; i< nr; i++) {
         Draw_Marker(scalexg(x[i]), scaleyg(x[i+j*nr]), 4, currColorIndex + 1,chart_context);		
	   }// Legende
	   // alert(legend.length+","+Math.round(x.length/nr));
	   if (legend.length > 0 ) {
		 // alert(currColorIndex);
		 var tMaxLen = legend[currColorIndex].length;
         chart_context.fillStyle="#FFFFFF";       // Fill region background white
		 chart_context.fillRect(canv_obj.width * (0.1 + perSizeX + px),canv_obj.height * (py + 0.05 * (currColorIndex + 0.5)), 
		                       canv_obj.width * (tMaxLen + 2) * 0.02, canv_obj.height * 1 * 0.05)
         chart_context.fillStyle="#000000";     // Fill region

        chart_context.strokeStyle = colorstr[currColorIndex % colorstr.length]; // red
        Draw_Marker(canv_obj.width * (0.12 + perSizeX + px),canv_obj.height*( py + (currColorIndex + 1) * 0.05),4
		            ,currColorIndex + 1,chart_context);		
        chart_context.textBaseline = 'middle';
        chart_context.textAlign = 'left';
        chart_context.fillText(legend[currColorIndex]
		                       , canv_obj.width*(0.15 + px + perSizeX)
							   , canv_obj.height*(py + (currColorIndex + 1) *0.05));
	   }
     }	 
  }
  
function scatterTable(tableId,tableName,x,nr) 
{
   var tableObj = document.getElementById(tableId);
   var tableText = "<table>\n";
       tableText += tableName;
	for (var j = 0; j < nr; j++) {
      tableText += "<tr>";
	  for (var k = 0; k < Math.round(x.length/nr); k++) {
	     tableText += "<td>" + x[j + k * nr] + "</td>";
      }
	  tableText += "</tr>\n";
	}
   tableText += "</table>\n";
   tableObj.innerHTML = tableText;	
}

//########################
// function ScatterPlot("Chartid","Chartname",xy,    "xaxisname","lin","auto","yaxisname","lin","auto","nogrid");
//########################
 function ScatterPlot(Chartid,Chartname,x,nr,xaxisname,xlinlog,xscaling,yaxisname,ylinlog,yscaling,grido) 
 {      //         blue    green  red  pink dgreen dviolett yellow lblue    
   var colorstr=['#0000ff','#00a000','#ff0000','#ff00ff','#007070','#700070','#ffff00','#00ffff']
    var colorstr=['#FF8C00','#0000FF','#FF1493','#008000','#FF4500','#4682B4','#DC143C','#ABABAB']
   var canv_obj=document.getElementById(Chartid);
   var xy;
   var xmin,xmax,ymin,ymax, ysmall, xsmall,Deltax, Deltay, SDeltax, SDeltay;
    currColorIndex = 0;
    Chart_name= Chartname;
	if (!canv_obj) {
	   canv_obj=Chartid;
      // alert('Error: I cannot find the canvas element!');
      // return;
    }
    if (!canv_obj.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }
    // Get the 2D canvas context.
    chart_context = canv_obj.getContext('2d');
    if (!chart_context) {
      alert('Error: failed to getContext!');
      return;
    }
  	chart_context.clearRect(0,0,canv_obj.width,canv_obj.height);
    // 20% are for labels
	 xll=0.18*canv_obj.width;
	 xur= (0.18+perSizeX)*canv_obj.width;
	 yll=0.1*canv_obj.height;
	 yur=(0.1+perSizeY)*canv_obj.height;
    chart_context.beginPath();
    chart_context.strokeStyle = "#000000"; // black
	chart_context.rect(xll,yll,canv_obj.width*perSizeX,canv_obj.height*perSizeY);
    chart_context.stroke();
      // Find min and max
     xmin=parseFloat(x[0]); xmax=parseFloat(x[0]);	
	 if (Math.abs(x[0])!=0) { xsmall=Math.abs(x[0]); } else {xsmall=1;} 
     ymin=parseFloat(x[nr]); ymax=parseFloat(x[nr]);
     if (Math.abs(x[nr])!=0) { ysmall=Math.abs(x[nr]); } else {ysmall=1;}
	 for( var i=0; i< nr; i++) {
        var bf= parseFloat(x[i]);
		if (bf>xmax) { xmax=bf;}
        if (bf<xmin) { xmin=bf;}
        if (Math.abs(bf)<xsmall) { xsmall=Math.abs(bf);}
	    for (var j=1; j<Math.round(x.length/nr); j++) {
		  var af = parseFloat(x[j*nr+i]);
		  if (af > ymax) { ymax=af;}
          if (af < ymin) { ymin=af;}
          if (Math.abs(af)<ysmall) { ysmall=Math.abs(af);}
		}
     }	 
     // alert(x.length+" "+nr+" "+xmin+" "+xmax+" "+ymin+" "+ymax);
     // Resize min,max for axis grid
	 if (xlinlog =="lin") {
       chartO.xstyp=0;
 	   scale_lin_max_min (xmax,xmin,xscaling);
         // Set scaling and offset
	   xmax=oMax; xmin=oMin;
	   Deltax=Norm_Delta; SDeltax=Small_Delta;
	   scalex_fk=canv_obj.width*perSizeX/(xmax-xmin);
	   scalex_of=xll-xmin*scalex_fk;
	 } else {
	   chartO.xstyp=1;
 	   scale_log_max_min (xmax,xsmall,xscaling);
	   xmax=oMax; xmin=oMin;
	   Deltax=Norm_Delta; SDeltax=Small_Delta;
	   scalex_fk=canv_obj.width*perSizeX/(Math.log(Math.abs(xmax))/Math.log(10)-Math.log(Math.abs(xmin))/Math.log(10));
	   scalex_of=xll-Math.log(Math.abs(xmin))/Math.log(10)*scalex_fk;
	 }
	 if (ylinlog =="lin") {
  	   chartO.ystyp=0;
 	   scale_lin_max_min (ymax,ymin,yscaling); 
	   // Set scaling and offset
	   ymax=oMax; ymin=oMin;
	   Deltay=Norm_Delta; SDeltay=Small_Delta;
	   scaley_fk=canv_obj.height*perSizeY/(ymax-ymin);
       scaley_of=yur+ymin*scaley_fk;
	 } else {
	   chartO.ystyp=1;
 	   scale_log_max_min (ymax,ysmall,yscaling);
	   ymax=oMax; ymin=oMin;
	   Deltay=Norm_Delta; SDeltay=Small_Delta;
	   scaley_fk=canv_obj.height*perSizeY/(Math.log(Math.abs(ymax))/Math.log(10)-Math.log(Math.abs(ymin))/Math.log(10));
       scaley_of=yur+Math.log(Math.abs(ymin))/Math.log(10)*scaley_fk;
	 }
     // alert(xmin+" "+xmax+" "+ymin+" "+ymax+" "+scalex_fk+" "+scaley_fk+" "+scalex_of+" "+scaley_of);
	 // display values    
	chart_context.lineWidth   = 2;
	for (var j = 1; j < Math.round(x.length/nr); j++) {
       chart_context.strokeStyle = colorstr[(j-1)%colorstr.length]; // red
       Draw_Marker(scalexg(x[0]), scaleyg(x[0+j*nr]), 4, j, chart_context);		
       for( var i=1; i< nr; i++) {
        chart_context.beginPath();
        chart_context.moveTo(scalexg(x[i-1]), scaleyg(x[i-1+j*nr]));
        chart_context.lineTo(scalexg(x[i]), scaleyg(x[i+j*nr]));
        chart_context.stroke();  
        Draw_Marker(scalexg(x[i]), scaleyg(x[i+j*nr]), 4, j, chart_context);		
	   }
	   currColorIndex = (Math.round(x.length/nr) - 2) % colorstr.length;
    }
	 // draw axis
	chart_context.lineWidth   = 1;
	 Label_X_Axis(xmin,xmax,Deltax,SDeltax,chart_context,canv_obj,xlinlog,grido);
	 Label_Y_Axis(ymin,ymax,Deltay,SDeltay,chart_context,canv_obj,ylinlog,grido);
	 // draw text
  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = 'middle';
      chart_context.textAlign = 'center';
      chart_context.fillText  (Chartname ,canv_obj.width/2, canv_obj.height*0.05);
	 
  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = 'top';
      chart_context.textAlign = 'center';
      chart_context.fillText  (xaxisname ,canv_obj.width/2, canv_obj.height*0.95);

  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = 'middle';
      chart_context.textAlign = 'center';
//	  chart_context.fillText  (yaxisname ,canv_obj.width*0.05, canv_obj.height*0.5);
	  chart_context.save();
	  chart_context.rotate(Math.PI*1.5);
	  chart_context.fillText  (yaxisname ,-canv_obj.height*0.5,canv_obj.width*0.02);
//	  chart_context.fillText  ("here" ,-50,100);
      chart_context.restore();
	  
	   //--------------------------------------------------------------------------
	   // Legende
	   // alert(legend.length+","+Math.round(x.length/nr));
    if (legend.length > 0) { // == (Math.round(x.length/nr)-1)
	     // alert("legende");
	    var tMaxLen = legend[0].length;
		for (var j = 1; j < Math.round(x.length/nr); j++) {
		  if ( tMaxLen < legend[j-1].length )  tMaxLen = legend[j-1].length;
        }
        var px = legendPos.px;  // Position Top right
		var py = legendPos.py;   // 0.6 center
        chart_context.fillStyle="#FFFFFF";     // Fill regionbackground white
		chart_context.fillRect(canv_obj.width * (0.1 + perSizeX + px),canv_obj.height * py, 
		                       canv_obj.width * (tMaxLen + 2) * 0.02, canv_obj.height * Math.round(x.length/nr) * 0.05)
        chart_context.fillStyle="#000000";     // Fill region
		// alert("hello");  
	    for (var j = 1; j < Math.round(x.length/nr); j++) {
		   chart_context.strokeStyle = colorstr[(j-1)%colorstr.length]; // red
	       Draw_Marker(canv_obj.width * (0.12 + perSizeX + px),canv_obj.height*( py + j*0.05),4,j,chart_context);		
           chart_context.textBaseline = 'middle';
           chart_context.textAlign = 'left';
           chart_context.fillText(legend[j-1],canv_obj.width*(0.15 + px + perSizeX),canv_obj.height*(py + j*0.05));
	    }
     }	 

	 }

//########################
// function ScatterPlotO("Chartid","Chartname",xy,    "xaxisname","lin","auto","yaxisname","lin","auto","nogrid"
//  xaxisIndex, activeIndex, channels);
// Oscilloscope: only certain curves plotted with special scaling (offset, range),
// scaling: "div" 
// xy plot: index of x-axis -> color adaption
// y axis in color of active curve
// display only active channels
//########################
 function ScatterPlotO(Chartid,Chartname,x,nr,xaxisname,xlinlog,xscaling,yaxisname,ylinlog,yscaling,grido,
                         xAxisIndex, activeIndex, channels) 
 {      //         blue    green  red  pink dgreen dviolett yellow lblue    
   var colorstr=['#0000ff','#00a000','#ff0000','#ff00ff','#007070','#700070','#ffff00','#00ffff']
    var colorstr=['#FF8C00','#0000FF','#FF1493','#008000','#FF4500','#4682B4','#DC143C','#ABABAB']
   var canv_obj=document.getElementById(Chartid);
   var xy;
   var xmin,xmax,ymin,ymax, ysmall, xsmall,Deltax, Deltay, SDeltax, SDeltay;
    currColorIndex = 0;
    Chart_name= Chartname;
	if (!canv_obj) {
	   canv_obj=Chartid;
      // alert('Error: I cannot find the canvas element!');
      // return;
    }
    if (!canv_obj.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }
    // Get the 2D canvas context.
    chart_context = canv_obj.getContext('2d');
    if (!chart_context) {
      alert('Error: failed to getContext!');
      return;
    }
  	chart_context.clearRect(0,0,canv_obj.width,canv_obj.height);
    // 20% are for labels
	 xll=0.18*canv_obj.width;
	 xur= (0.18+perSizeX)*canv_obj.width;
	 yll=0.1*canv_obj.height;
	 yur=(0.1+perSizeY)*canv_obj.height;
    chart_context.beginPath();
    chart_context.strokeStyle = "#000000"; // black
	chart_context.rect(xll,yll,canv_obj.width*perSizeX,canv_obj.height*perSizeY);
    chart_context.stroke();

      // Find min and max (optional)
     xmin=parseFloat(x[0]); xmax=parseFloat(x[0]);	
	 if (Math.abs(x[0])!=0) { xsmall=Math.abs(x[0]); } else {xsmall=1;} 
     ymin=parseFloat(x[nr]); ymax=parseFloat(x[nr]);
     if (Math.abs(x[nr])!=0) { ysmall=Math.abs(x[nr]); } else {ysmall=1;}
	 for( var i=0; i< nr; i++) {
        var bf= parseFloat(x[i]);
		if (bf>xmax) { xmax = bf;}
        if (bf<xmin) { xmin = bf;}
        if (Math.abs(bf)<xsmall) { xsmall = Math.abs(bf);}
	    for (var j = 1; j < Math.round(x.length/nr); j++) {
		  var af = parseFloat(x[j*nr+i]);
		  if (af > ymax) { ymax = af;}
          if (af < ymin) { ymin = af;}
          if (Math.abs(af) < ysmall) { ysmall = Math.abs(af);}
		}
     }	 
     // alert(x.length+" "+nr+" "+xmin+" "+xmax+" "+ymin+" "+ymax);
     // Resize min,max for axis grid, x -axis could be other index
	 
	 if (xlinlog =="lin") {
       chartO.xstyp = 0;
       xmax = - channels[xAxisIndex].offset + channels[xAxisIndex].range * 5;
       xmin = - channels[xAxisIndex].offset - channels[xAxisIndex].range * 5;
       // grid and fine grid
	   Deltax = channels[xAxisIndex].range; SDeltax = channels[xAxisIndex].range/10;
	   scalex_fk = canv_obj.width * perSizeX / (xmax - xmin);
	   scalex_of = xll - xmin * scalex_fk;
	   channels[xAxisIndex].factor = scalex_fk;
	   channels[xAxisIndex].offScale = scalex_of;
	 } else {  // not changed hopefully is ok
	   chartO.xstyp = 1;
 	   scale_log_max_min (xmax,xsmall,xscaling);
	   xmax = oMax; xmin = oMin;
	   Deltax = Norm_Delta; SDeltax=Small_Delta;
	   scalex_fk = canv_obj.width*perSizeX/(Math.log(Math.abs(xmax))/Math.log(10)-Math.log(Math.abs(xmin))/Math.log(10));
	   scalex_of = xll-Math.log(Math.abs(xmin))/Math.log(10)*scalex_fk;
	 }
	 // alert(xmax + "," + xmin + "," + perSizeX + "," + xAxisIndex´+ "," + Deltax);
	 if (ylinlog =="lin") {
  	   chartO.ystyp = 0;
	   for (var kk = 0; kk < channels.length; kk++) {
 	     if (kk != xAxisIndex) {
		   ymax = - channels[kk].offset + channels[kk].range * 5;  // only valid for oscilloscope
           ymin = - channels[kk].offset - channels[kk].range * 5;
	       Deltay = channels[kk].range; SDeltay = Math.round(channels[kk].range/5);
	       scaley_fk = canv_obj.height * perSizeY / (ymax - ymin);
           scaley_of = yur + ymin * scaley_fk;
	       channels[kk].factor = scaley_fk;
	       channels[kk].offScale = scaley_of;
		 }  
	   }	 
	 } else { // not changed hopefully is ok
	   chartO.ystyp = 1;
 	   scale_log_max_min (ymax,ysmall,yscaling);
	   ymax = oMax; ymin = oMin;
	   Deltay = Norm_Delta; SDeltay = Small_Delta;
	   scaley_fk = canv_obj.height*perSizeY/(Math.log(Math.abs(ymax))/Math.log(10)-Math.log(Math.abs(ymin))/Math.log(10));
       scaley_of = yur+Math.log(Math.abs(ymin))/Math.log(10)*scaley_fk;
	 }
	 
     channels[0].factor = scalex_fk;
     channels[0].offScale = scalex_of;
	 // alert(xmin+" "+xmax+" "+ymin+" "+ymax+" "+scalex_fk+" "+scaley_fk+" "+scalex_of+" "+scaley_of);
	 // display values, plot active curves, allow xy curves    
	chart_context.lineWidth   = 2;
    scalex_fk = channels[xAxisIndex].factor;
    scalex_of = channels[xAxisIndex].offScale;
	for (var j = 1; j < Math.round(x.length/nr); j++) {
      //alert(j + "," + channels[j].selected + "," + channels[j].factor + "," + channels[j].offScale); 
	  if (channels[j].selected == "1") { 
	    scaley_fk = channels[j].factor;
		scaley_of = channels[j].offScale;
		// alert(scaley_fk + "," + scaley_of);
		chart_context.strokeStyle = colorstr[(j-1)%colorstr.length]; // red
        Draw_Marker(scalexg(x[0+xAxisIndex*nr]), scaleyg(x[0+j*nr]), 4, j, chart_context);		
		for( var i=1; i< nr; i++) {
          chart_context.beginPath();
          chart_context.moveTo(scalexg(x[i-1 + xAxisIndex*nr]), scaleyg(x[i-1+j*nr]));
          chart_context.lineTo(scalexg(x[i + xAxisIndex*nr]), scaleyg(x[i+j*nr]));
          chart_context.stroke();  
          Draw_Marker(scalexg(x[i + xAxisIndex*nr]), scaleyg(x[i+j*nr]), 4, j, chart_context);		
          // alert(scalexg(x[i+xAxisIndex*nr]) + "," + scaleyg(x[i+j*nr]));
	    }
	  }	
	  currColorIndex = (Math.round(x.length/nr) - 2) % colorstr.length;
    }

	 // draw axis
	chart_context.lineWidth   = 1;
	// text color new
     if (xAxisIndex == 0) { chart_context.fillStyle = "#000000"; }
	 else { chart_context.fillStyle = colorstr[xAxisIndex - 1 ]; }
	 scalex_fk = channels[xAxisIndex].factor;
	 scalex_of = channels[xAxisIndex].offScale;
	 if (xlinlog == "lin") {
	    Deltax = channels[xAxisIndex].range; SDeltax = Deltax / 10;
	 } else {
	 	Deltax = Norm_Delta; SDeltax=Small_Delta;
	 }	 
	 // alert(xmax + "," + xmin + "," + Deltax + ","+ SDeltax);
	 Label_X_Axis(xmin,xmax,Deltax,SDeltax,chart_context,canv_obj,xlinlog,grido);
	// text color new
	 chart_context.fillStyle = colorstr[activeIndex - 1 ];
     ymax = - channels[activeIndex].offset + channels[activeIndex].range * 5;
     ymin = - channels[activeIndex].offset - channels[activeIndex].range * 5;
	 scaley_fk = channels[activeIndex].factor;
	 scaley_of = channels[activeIndex].offScale;
	 Deltay = channels[activeIndex].range; 
	 SDeltay = Math.round(Deltay / 10);
	 Label_Y_Axis(ymin,ymax,Deltay,SDeltay,chart_context,canv_obj,ylinlog,grido);
	 chart_context.fillStyle = "#000000";
	 // draw text
  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = 'middle';
      chart_context.textAlign = 'center';
      chart_context.fillText  (Chartname ,canv_obj.width/2, canv_obj.height*0.05);
	 
  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = 'top';
      chart_context.textAlign = 'center';
      chart_context.fillText  (xaxisname ,canv_obj.width/2, canv_obj.height*0.95);

  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = 'middle';
      chart_context.textAlign = 'center';
//	  chart_context.fillText  (yaxisname ,canv_obj.width*0.05, canv_obj.height*0.5);
	  chart_context.save();
	  chart_context.rotate(Math.PI*1.5);
	  chart_context.fillText  (yaxisname ,-canv_obj.height*0.5,canv_obj.width*0.02);
//	  chart_context.fillText  ("here" ,-50,100);
      chart_context.restore();
	  
	   //--------------------------------------------------------------------------
	   // Legende
	   // alert(legend.length+","+Math.round(x.length/nr));
    if (legend.length > 0) { // == (Math.round(x.length/nr)-1)
	     // alert("legende");
	    var tMaxLen = legend[0].length;
		for (var j = 1; j < Math.round(x.length/nr); j++) {
		  if ( tMaxLen < legend[j-1].length )  tMaxLen = legend[j-1].length;
        }
        var px = legendPos.px;  // Position Top right
		var py = legendPos.py;   // 0.6 center
        chart_context.fillStyle="#FFFFFF";     // Fill regionbackground white
		chart_context.fillRect(canv_obj.width * (0.1 + perSizeX + px),canv_obj.height * py, 
		                       canv_obj.width * (tMaxLen + 2) * 0.02, canv_obj.height * Math.round(x.length/nr) * 0.05)
        chart_context.fillStyle="#000000";     // Fill region
		// alert("hello");  
	    for (var j = 1; j < Math.round(x.length/nr); j++) {
		   chart_context.strokeStyle = colorstr[(j-1)%colorstr.length]; // red
	       Draw_Marker(canv_obj.width * (0.12 + perSizeX + px),canv_obj.height*( py + j*0.05),4,j,chart_context);		
           chart_context.textBaseline = 'middle';
           chart_context.textAlign = 'left';
           chart_context.fillText(legend[j-1],canv_obj.width*(0.15 + px + perSizeX),canv_obj.height*(py + j*0.05));
	    }
     }	 
     // show areas    
  	// chart_context.clearRect(0,0,canv_obj.width,canv_obj.height);
    // 20% are for labels
	// xll=0.18*canv_obj.width;
	// xur= (0.18+perSizeX)*canv_obj.width;
	// yll=0.1*canv_obj.height;
	// yur=(0.1+perSizeY)*canv_obj.height;
    chart_context.strokeStyle = "#99ff33"; // light green
	var xb = canv_obj.width*0.05;
	var yb = canv_obj.height*0.05;
	// chart_context.beginPath();
    // chart_context.rect(xll - xb,yll,xb,canv_obj.height*perSizeY); //left side
    // chart_context.stroke();
    // chart_context.beginPath();
    // chart_context.rect(xll,yur,xur-xll,yb); // under x axis bottom
    // chart_context.stroke();
    // chart_context.strokeStyle = "#ff80df"; // light pink for cursors
	// chart_context.beginPath();
    // chart_context.rect(xur,yll,xb,canv_obj.height*perSizeY); // right side
    // chart_context.stroke();
    // chart_context.beginPath();
    // chart_context.rect(xll,yll-yb,xur-xll,yb); // above graph x axis top
    // chart_context.stroke();
	 }
	 
//##################### End ScatterPlotO

//########################
// function ScatterPlotSimple("Chartid","Chartname",xy,    "xaxisname","lin","auto","yaxisname","lin","auto","nogrid");
//########################
 function ScatterPlotSimple(Chartid,Chartname,x,nr,xaxisname,xlinlog,xscaling,yaxisname,ylinlog,yscaling,grido) 
 {      //         blue    green  red  pink dgreen dviolett yellow lblue    
   var colorstr=['#0000ff','#00a000','#ff0000','#ff00ff','#007070','#700070','#ffff00','#00ffff']
    var colorstr=['#FF8C00','#0000FF','#FF1493','#008000','#FF4500','#4682B4','#DC143C','#ABABAB']
   var canv_obj=document.getElementById(Chartid);
   var xy;
   var xmin,xmax,ymin,ymax, ysmall, xsmall,Deltax, Deltay, SDeltax, SDeltay;
    currColorIndex = 0;
    Chart_name= Chartname;
	if (!canv_obj) {
	   canv_obj=Chartid;
      // alert('Error: I cannot find the canvas element!');
      // return;
    }
    if (!canv_obj.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }
    // Get the 2D canvas context.
    chart_context = canv_obj.getContext('2d');
    if (!chart_context) {
      alert('Error: failed to getContext!');
      return;
    }
  	chart_context.clearRect(0,0,canv_obj.width,canv_obj.height);
    // 20% are for labels
	 xll=0.18*canv_obj.width;
	 xur= (0.18+perSizeX)*canv_obj.width;
	 yll=0.1*canv_obj.height;
	 yur=(0.1+perSizeY)*canv_obj.height;
    chart_context.strokeStyle = "#000000"; // black
    chart_context.beginPath();
    chart_context.rect(xll,yll,canv_obj.width*perSizeX,canv_obj.height*perSizeY);
    chart_context.stroke();
      // Find min and max
     xmin=parseFloat(x[0]); xmax=parseFloat(x[0]);	
	 if (Math.abs(x[0])!=0) { xsmall=Math.abs(x[0]); } else {xsmall=1;} 
     ymin=parseFloat(x[nr]); ymax=parseFloat(x[nr]);
     if (Math.abs(x[nr])!=0) { ysmall=Math.abs(x[nr]); } else {ysmall=1;}
	 for( var i=0; i< nr; i++) {
        var bf= parseFloat(x[i]);
		if (bf>xmax) { xmax=bf;}
        if (bf<xmin) { xmin=bf;}
        if (Math.abs(bf)<xsmall) { xsmall=Math.abs(bf);}
	    for (var j=1; j<Math.round(x.length/nr); j++) {
		  var af = parseFloat(x[j*nr+i]);
		  if (af > ymax) { ymax=af;}
          if (af < ymin) { ymin=af;}
          if (Math.abs(af)<ysmall) { ysmall=Math.abs(af);}
		}
     }	 
     // alert(x.length+" "+nr+" "+xmin+" "+xmax+" "+ymin+" "+ymax);
     // Resize min,max for axis grid
	 if (xlinlog =="lin") {
       chartO.xstyp=0;
 	   scale_lin_max_min (xmax,xmin,xscaling);
         // Set scaling and offset
	   xmax=oMax; xmin=oMin;
	   Deltax=Norm_Delta; SDeltax=Small_Delta;
	   scalex_fk=canv_obj.width*perSizeX/(xmax-xmin);
	   scalex_of=xll-xmin*scalex_fk;
	 } else {
	   chartO.xstyp=1;
 	   scale_log_max_min (xmax,xsmall,xscaling);
	   xmax=oMax; xmin=oMin;
	   Deltax=Norm_Delta; SDeltax=Small_Delta;
	   scalex_fk=canv_obj.width*perSizeX/(Math.log(Math.abs(xmax))/Math.log(10)-Math.log(Math.abs(xmin))/Math.log(10));
	   scalex_of=xll-Math.log(Math.abs(xmin))/Math.log(10)*scalex_fk;
	 }
	 if (ylinlog =="lin") {
  	   chartO.ystyp=0;
 	   scale_lin_max_min (ymax,ymin,yscaling); 
	   // Set scaling and offset
	   ymax=oMax; ymin=oMin;
	   Deltay=Norm_Delta; SDeltay=Small_Delta;
	   scaley_fk=canv_obj.height*perSizeY/(ymax-ymin);
       scaley_of=yur+ymin*scaley_fk;
	 } else {
	   chartO.ystyp=1;
 	   scale_log_max_min (ymax,ysmall,yscaling);
	   ymax=oMax; ymin=oMin;
	   Deltay=Norm_Delta; SDeltay=Small_Delta;
	   scaley_fk=canv_obj.height*perSizeY/(Math.log(Math.abs(ymax))/Math.log(10)-Math.log(Math.abs(ymin))/Math.log(10));
       scaley_of=yur+Math.log(Math.abs(ymin))/Math.log(10)*scaley_fk;
	 }
     // alert(xmin+" "+xmax+" "+ymin+" "+ymax+" "+scalex_fk+" "+scaley_fk+" "+scalex_of+" "+scaley_of);
	 // display values    
	chart_context.lineWidth   = 2;
	for (var j = 1; j < Math.round(x.length/nr); j++) {
       chart_context.strokeStyle = colorstr[(j-1)%colorstr.length]; // red
       Draw_Marker(scalexg(x[0]), scaleyg(x[0+j*nr]), 4, j, chart_context);		
       for( var i=1; i< nr; i++) {
        chart_context.beginPath();
        chart_context.moveTo(scalexg(x[i-1]), scaleyg(x[i-1+j*nr]));
        chart_context.lineTo(scalexg(x[i]), scaleyg(x[i+j*nr]));
        chart_context.stroke();  
        Draw_Marker(scalexg(x[i]), scaleyg(x[i+j*nr]), 4, j, chart_context);		
	   }
	   currColorIndex = (Math.round(x.length/nr) - 2) % colorstr.length;
    }
	 // draw axis
	chart_context.lineWidth   = 1;
//	 Label_X_Axis(xmin,xmax,Deltax,SDeltax,chart_context,canv_obj,xlinlog,grido);
//	 Label_Y_Axis(ymin,ymax,Deltay,SDeltay,chart_context,canv_obj,ylinlog,grido);
	 // draw text
//  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
//      chart_context.textBaseline = 'middle';
//      chart_context.textAlign = 'center';
//      chart_context.fillText  (Chartname ,canv_obj.width/2, canv_obj.height*0.05);
	 
  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = 'top';
      chart_context.textAlign = 'center';
      chart_context.fillText  (xaxisname ,canv_obj.width/2, canv_obj.height*0.92);

  	  chart_context.font = 'bold '+c_fontsize+'px sans-serif';
      chart_context.textBaseline = 'middle';
      chart_context.textAlign = 'center';
//	  chart_context.fillText  (yaxisname ,canv_obj.width*0.05, canv_obj.height*0.5);
	  chart_context.save();
	  chart_context.rotate(Math.PI*1.5);
	  chart_context.fillText  (yaxisname ,-canv_obj.height*0.5,canv_obj.width*0.02);
//	  chart_context.fillText  ("here" ,-50,100);
      chart_context.restore();
	   //--------------------------------------------------------------------------
	   // Legende
	   // alert(legend.length+","+Math.round(x.length/nr));
    if (legend.length > 0) { // == (Math.round(x.length/nr)-1)
	     // alert("legende");
	    var tMaxLen = legend[0].length;
		for (var j = 1; j < Math.round(x.length/nr); j++) {
		  if ( tMaxLen < legend[j-1].length )  tMaxLen = legend[j-1].length;
        }
        var px = legendPos.px;  // Position Top right
		var py = legendPos.py;   // 0.6 center
        chart_context.fillStyle="#FFFFFF";     // Fill regionbackground white
		chart_context.fillRect(canv_obj.width * (0.1 + perSizeX + px),canv_obj.height * py, 
		                       canv_obj.width * (tMaxLen + 2) * 0.02, canv_obj.height * Math.round(x.length/nr) * 0.05)
        chart_context.fillStyle="#000000";     // Fill region
		// alert("hello");  
	    for (var j = 1; j < Math.round(x.length/nr); j++) {
		   chart_context.strokeStyle = colorstr[(j-1)%colorstr.length]; // red
	       Draw_Marker(canv_obj.width * (0.12 + perSizeX + px),canv_obj.height*( py + j*0.05),4,j,chart_context);		
           chart_context.textBaseline = 'middle';
           chart_context.textAlign = 'left';
           chart_context.fillText(legend[j-1],canv_obj.width*(0.15 + px + perSizeX),canv_obj.height*(py + j*0.05));
	    }
     }	 
	  
	  }
	  
 function insertAfter(el, referenceNode) {
	    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
 }
 
//   X: <span id="chartX">Anzahl schritte</span>, <span id="chartXL">lin</span>, 
//      <span id="chartXSC">minmax</span><br> Y:<span id="chartY">Anzahl ereignisse</span>, 
//      <span id="chartYL">lin</span>, <span id="chartYSC">auto</span><br>
//      <span id="chartGR">Grid</span><br><br> 
//      <span id="chartCN">Testgrafik</span><br><br> 
//      <table id="chartTB" border="1"><tbody>
//        <tr><td>0</td><td>0</td><td>0</td></tr>
//        <tr><td>1</td><td>2</td><td>1</td></tr>
//        <tr><td>2</td><td>4</td><td>2</td></tr>
//        <tr><td>3</td><td>9</td><td>3</td></tr>
//       </table>

 function tableChart(tableid,width,height) {
	  var newEl = document.createElement('canvas');
	  newEl.width = width;
	  newEl.height = height;
	  var newid = tableid.substr(0,tableid.length-2);
	  newEl.id = newid;
	  insertAfter(newEl, document.getElementById(tableid));
	  var tblObj = document.getElementById(tableid);
	  var rows = tblObj.rows.length;
	  var cols = tblObj.rows[0].cells.length; 
	  var x = new Array();
	  for (var i = 0; i < rows; i++) {
          // x axis
		  x[i] = parseFloat(tblObj.rows[i].cells[0].innerHTML);
	      for (var j = 1; j < cols; j++) {
		     x[j * rows + i] = parseFloat(tblObj.rows[i].cells[j].innerHTML);
		  }		  
	  }
	  var nr = rows;
      var Chartname = document.getElementById(newid + "CN").innerHTML;	  
      var xaxisname = document.getElementById(newid + "X").innerHTML;	  
      var xlinlog = document.getElementById(newid + "XL").innerHTML;	  
      var xscaling = document.getElementById(newid + "XSC").innerHTML;	  
      var yaxisname = document.getElementById(newid + "Y").innerHTML;	  
      var ylinlog = document.getElementById(newid + "YL").innerHTML;	  
      var yscaling = document.getElementById(newid + "YSC").innerHTML;	  
      var grido = document.getElementById(newid + "GR").innerHTML;	  
	  // alert(newid + "," + newEl.id + "," + Chartname + "," + nr + "," + xaxisname + "," + xlinlog + "," + xscaling
	  //      + "," + yaxisname + "," + ylinlog + "," + yscaling + "," + grido);
	  ScatterPlot(newEl.id,Chartname,x,nr,xaxisname,xlinlog,xscaling,yaxisname,ylinlog,yscaling,grido);
 }
 
 // With click and table
 function ScatterPlotX(Chartid,Chartname,x,nr,xaxisname,xlinlog,xscaling,yaxisname,ylinlog,yscaling,grido) {
      ScatterPlot(Chartid,Chartname,x,nr,xaxisname,xlinlog,xscaling,yaxisname,ylinlog,yscaling,grido) 
	  var newEl = document.createElement('div');
	  newEl.id = Chartid + "MX";
	  //  alert(newEl.id);
	  // x kommt in die Tabelle, xaxisname lin/log xscaling
	  newEl.style.display = "none";        // not visible menue
      var dataTbl;
	  dataTbl = "X: <span id='" + Chartid + "X'>" + xaxisname + "</span>, <span id='" + Chartid + "XL'>" + xlinlog +"</span>"
                + ", <span id='" + Chartid + "XSC'>" + xscaling + "</span><br> Y:<span id='" + Chartid + "Y'>" + yaxisname +"</span>"	  
                + ", <span id='" + Chartid + "YL'>" + ylinlog + "</span>, <span id='" + Chartid + "YSC'>" 
				+ yscaling +"</span> (auto, minmax, auto0) <br>"	  
      dataTbl += "<span id='" + Chartid + "GR'>" + grido + "</span> &nbsp;(nogrid,Grid,Fine) <br>" ;
      for (var i=0; i< legend.length; i++) {
        dataTbl += legend[i] + ", ";
      }
      dataTbl += "<br> ";
     
	  dataTbl +="<table id='" + Chartid + "TB' border='1'>";
      for (var i = 0; i < nr; i++) {
        dataTbl += "<tr>"; 	  
        for (var j = 0; j < Math.round(x.length/nr); j++) {
		  dataTbl += "<td>" + x[i + j * nr]+ "</td>"; 	  
        }
	    dataTbl += "</tr>"; 	  
	  }
      dataTbl += "</table>"; 	  
	  newEl.innerHTML = "Raw data:<br>" + dataTbl;
	  insertAfter(newEl, document.getElementById(Chartid));
	  document.getElementById(Chartid).onclick = function(){   // toggle menue
	       var objX = document.getElementById(this.id + "MX");
		   if (objX.style.display == "block") {
       	      objX.style.display = "none";
           } else {
       	      objX.style.display = "block";
           }			   
	  };
 }
 
   //                       "row","col"      0/1                 
   function tableChart(tableId,rowCol,index,header, w, h, nameH, add, xindex, xlin, ylin) {
     var tableX = document.getElementById(tableId);
     if (add != 1) {	 
	   setLPos(-0.6,0.1);
	   var newEl = document.createElement('canvas');
          newEl.width = w;
          newEl.height = h;
          newEl.id = tableId + "CH";
          insertAfter(newEl, document.getElementById(tableId));
	 }
	 
	 if (!xindex) {xindex = 0;}
	 if (!xlin) {xlin = "lin";}
	 if (!ylin) {ylin = "lin";}
	 var x = [];
	 var nameX = "x-axis"; 
	 var nameY = "y-axis";	 
	 // var nameH = "Überschrift";	 
	  var gr = 0;
	  var cols = tableX.rows[0].cells.length; 			  
	  var rows = tableX.rows.length;
	  if  (rowCol == "row") {
	    gr = cols - header;
		if (header > 0) {
		   nameX = tableX.rows[0 + xindex].cells[0].innerHTML;
		   nameY = tableX.rows[index].cells[0].innerHTML;
		   legend.push(nameY);
		}
        for (var i = header; i < gr + header; i++) {
	       x[i - header] = parseFloat(tableX.rows[0 + xindex].cells[i].innerHTML);
	       x[i + gr - header] = parseFloat(tableX.rows[index].cells[i].innerHTML);
        }	  
      } else {
	    gr = rows - header;
		if (header > 0) {
		   nameX = tableX.rows[0].cells[0 + xindex].innerHTML;
		   nameY = tableX.rows[0].cells[index].innerHTML;
		   legend.push(nameY);
		}
        for (var i = header; i < gr + header; i++) {
	       x[i - header] = parseFloat(tableX.rows[i].cells[0 + xindex].innerHTML);
	       x[i + gr - header] = parseFloat(tableX.rows[i].cells[index].innerHTML);
        }	  
	  }
	  if (add == 1) {
		  addCurve(tableId + "CH",x,gr);
      } else {		  
	    clearLegend();
	    if (add == 2) {legend.push(nameY);}
	    ScatterPlot(tableId + "CH",nameH,x,gr,nameX,xlin,"auto",
	              nameY,ylin,"auto","Grid");
		// legend.push(nameY);		  
      }				  
  }
  
//  tableChart("ueb1","row",2,1,400,400);

 
