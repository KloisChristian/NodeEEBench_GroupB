#include <SPI.h>
 
 
const int z=100;

float x,y;

int exc[z];
int i=0;
void setup() {

 Serial.begin(115200);


SPI.begin(4);
SPI.setDataMode(4,SPI_MODE2);    
   
    for(int i=0;i<z;i++)
     {
         x=(float)i;
         y=cos((x/z)*2*PI);
         exc[i]=int((y*32768)+32767);

     }
     

 
} 

void loop() {

 



 byte MSB = (exc[i] >> 10)|0b01000000;
 byte ISB = exc[i] >> 2 ;
 byte LSB = (exc[i] & 0b0000000000000011)<<6;
 
SPI.transfer(4,MSB,SPI_CONTINUE);
SPI.transfer(4,ISB,SPI_CONTINUE);
SPI.transfer(4,LSB,SPI_LAST);
 i++;
 if(i==z){i=0;}
 
}