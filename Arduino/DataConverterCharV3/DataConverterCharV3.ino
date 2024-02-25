/* #include <LiquidCrystal.h>

/*
  Target board Arduino MKR WIFI 1010
  This sketch generates a sine signal with 
     DAC: DAC0, AIN[0], PA02, A0, D15
     PWL: AIN[7],PA07,A6,D21
     Digital: PA22,23,10,11,PB10,11,PA20, PA21
     PMOD DA2 Digilent
  This sketch samples:
    OSC1: AIN[10], PB02, A1, D16 
    OSC2: AIN[11], PB03, A2, D17
    OSC3: AIN[4], PA04, A3, D18 
    OSC4: AIN[5], PA05, A4, D19  
    OSC5: PMOD AD2 Digilent
  Transfers 16k values to serial port.
      
  This example code is in the public domain.

  Written 9 Sep 2020 by Joerg Vollrath
*/

#define DAC_D5          5
#define DAC_D6          6
#define DAC_PWM          7

void setup() {
  // put your setup code here, to run once:
  pinMode(DAC_PWM, OUTPUT);
  pinMode(DAC_D5, OUTPUT);

 delay(2000);
 // initialize serial communication at 115200
 Serial.begin(115200);
 Serial.println("\r\nData Converter Sine Test");
 
}

void loop() {
  // put your main code here, to run repeatedly:
  // Sigma delta ADC
  // 1) Toggle one pin
  // 2) Read Input and set out put accordingly
  // 3) Implement filter like JavaScript 
    long maxRange = 1024*1024*1024;
    long sx1 = 0;     // sinc2 filter 
    long sx3 = 0;     // sinc2 filter 
    long sy0 = 0;     // sinc2 filter 
    long sy1 = 0;     // sinc2 filter 
    long sy2 = 0;     // sinc2 filter 
    long sy3 = 0;     // sinc2 filter 
    long sy4 = 0;     // sinc2 filter 
    long scn1 = 0;     // sinc2 filter 
    long scn3 = 0;     // sinc2 filter 
    long sdn0 = 0;     // sinc2 filter 
    long sdn1 = 0;     // sinc2 filter 
    long sdn2 = 0;     // sinc2 filter 
    long sdn3 = 0;     // sinc2 filter 
    long dout = 0;     // sinc2 filter 
    int osr = 256;    // oversampling rate
    // char str256[256];
    int toggle = 0;
    
    // Serial.print("New block: ");
    scn1 = 0;  scn3 = 0; sdn0 = 0; sdn1 = 0; sdn2 = 0; sdn3 = 0; dout = 0;
    sx1 = 0; sx3 = 0; sy0 = 0; sy1 = 0; sy2 = 0; sy3 = 0; sy4 = 0;
    for (int i2 = 0; i2 < 256*8; i2++) {  // generate 256 values
      Serial.print(i2);
      for (int i1 = 0; i1 < 4; i1 += 1) { // Generate 6 values to be adjusted (ramp used 6, sine used 20)
        scn1 = 0;
        scn3 = 0;
        for (int i3 = 0; i3 < osr; i3++) {  // generate OSR values
          
          int val = digitalRead(DAC_D6);
                   
          if (val == HIGH) { // writing output Pin inverse
             digitalWrite(DAC_PWM, LOW);
             scn1 = scn1 + 1;  
             sx1 = sx1 +1;
             if (sx1 >= maxRange) { sx1 = sx1 - maxRange; }
             // str256[i3] ="1";  
          } else {
             digitalWrite(DAC_PWM, HIGH);
            // str256[i3] ="0";  
          }
          if (toggle == 0) {
            toggle = 1;
            digitalWrite(DAC_D5, LOW);
          } else {
            toggle = 0;
            digitalWrite(DAC_D5, HIGH);
          }
          scn3 = scn3 + scn1;  // second adder stage      
          sx3 = sx3 + sx1;    
          if (sx3 >= maxRange) { sx3 = sx3 - maxRange; }
        }  
        sdn0 = scn3;        // low frequency latch       
        dout = sdn0 - sdn2;
        sdn2 = sdn0;
        
        sy0 = sx3;
        sy2 = sy2 - sy1;
        if (sy2 < 0) { sy2 = sy2 + maxRange; }
        sy4 = sy2 - sy3;
        if (sy4 < 0) { sy4 = sy4 + maxRange; }
        sy3 = sy2;
        sy1 = sy0;
      }
      Serial.print(", scn1: ");
      Serial.print((scn1<<4)&0X1FFF);
      Serial.print(", scn3: ");
      Serial.print((scn3)&0XFFFF);
      Serial.print(", dout: ");
      Serial.print((dout>>3)&0X1FFF);
      Serial.print(", sy4: ");
      Serial.print(sy4);
      Serial.println();
      // Serial.print(", value: ");
      // Serial.println(dout);
      // Serial.print(", string: ");
      // Serial.println(str256);
      
    }

    
    delay(2);

}
