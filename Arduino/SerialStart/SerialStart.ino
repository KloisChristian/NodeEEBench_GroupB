/*
 * Test serial command receive
 */

void setup() {
  // put your setup code here, to run once:

 // initialize serial communication at 115200
 Serial.begin(115200);
 Serial.println("\r\nSerial Start Sketch");


}

  char myData[20];        // incoming command string less than 20 chars before seperator 
  char inChar;            // incoming char
  int posChar = 0;        // length of string

void loop() {
  // put your main code here, to run repeatedly:

    if (Serial.available() > 0) { // serial is available
     // get incoming byte:
      while (Serial.available() > 0) {
        inChar = Serial.read();
        myData[posChar] = inChar; // Add character
        posChar++;
        myData[posChar] = 0; // New end
        // process mydata if _ or , separator or mydata longer than 18 chars
        if ((posChar > 18) || (inChar == '_')) { // end of command '_'
         // position command 'pxxxyyy_' 
          if ( myData[0] == 'p' ) { 
            String myString;
            myString = myData;
            if (posChar > 7) { // has to be 6 chars
              int posX = myString.substring(1,4).toInt();
              int posY = myString.substring(5,8).toInt();
              Serial.print("Pos valueX: ");
              Serial.print(posX);
              Serial.print(" valueY: ");
              Serial.println(posY);
            }  
          }
         // measure command 'm_'
         // other commands
          
         // clear command buffer 
          posChar = 0;     
          myData[0] = 0;
       }
     }   
  }  
  delay(10);        // delay in between reads for stability

}
