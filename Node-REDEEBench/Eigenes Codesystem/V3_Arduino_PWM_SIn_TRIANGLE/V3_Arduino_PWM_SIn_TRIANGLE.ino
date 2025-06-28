#include <Arduino.h>
#include "wiring_private.h" // für pinPeripheral()

#define PWM_PIN 10
#define DAC_PIN A0

const uint16_t sineTable[256] = {
  511, 524, 536, 549, 561, 574, 586, 598,
  611, 623, 635, 647, 659, 671, 683, 695,
  707, 718, 730, 741, 752, 763, 774, 785,
  795, 806, 816, 826, 835, 845, 855, 864,
  873, 881, 890, 898, 906, 914, 922, 929,
  936, 943, 950, 956, 962, 968, 973, 979,
  984, 988, 993, 997, 1000, 1004, 1007, 1010,
  1013, 1015, 1017, 1019, 1020, 1021, 1022, 1022,
  1023, 1022, 1022, 1021, 1020, 1019, 1017, 1015,
  1013, 1010, 1007, 1004, 1000, 997, 993, 988,
  984, 979, 973, 968, 962, 956, 950, 943,
  936, 929, 922, 914, 906, 898, 890, 881,
  873, 864, 855, 845, 835, 826, 816, 806,
  795, 785, 774, 763, 752, 741, 730, 718,
  707, 695, 683, 671, 659, 647, 635, 623,
  611, 598, 586, 574, 561, 549, 536, 524,
  511, 498, 486, 473, 461, 448, 436, 424,
  411, 399, 387, 375, 363, 351, 339, 327,
  315, 304, 292, 281, 270, 259, 248, 237,
  227, 216, 206, 196, 187, 177, 168, 159,
  150, 142, 133, 125, 118, 110, 103,  96,
   89,  83,  76,  70,  64,  59,  53,  48,
   43,  39,  34,  30,  27,  23,  20,  17,
   14,  12,  10,   8,   7,   6,   5,   5,
    4,   5,   5,   6,   7,   8,  10,  12,
   14,  17,  20,  23,  27,  30,  34,  39,
   43,  48,  53,  59,  64,  70,  76,  83,
   89,  96, 103, 110, 118, 125, 133, 142,
  150, 159, 168, 177, 187, 196, 206, 216,
  227, 237, 248, 259, 270, 281, 292, 304,
  315, 327, 339, 351, 363, 375, 387, 399,
  411, 424, 436, 448, 461, 473, 486, 498
};

uint32_t currentFreq = 1000;
float currentDuty = 50.0;
String currentForm = "RECT";

volatile uint8_t waveIndex = 0;
bool pwmActive = false;

void setup() {
  Serial.begin(9600);
  while (!Serial);

  analogWriteResolution(10); // DAC auf 10 Bit
  pinPeripheral(PWM_PIN, PIO_TIMER);

  // Clock aktivieren (TC3 = ID 27)
  GCLK->CLKCTRL.reg = GCLK_CLKCTRL_ID(27) | GCLK_CLKCTRL_GEN_GCLK0 | GCLK_CLKCTRL_CLKEN;
  while (GCLK->STATUS.bit.SYNCBUSY);

  // Timer TC3 vorbereiten
  TC3->COUNT16.CTRLA.reg = TC_CTRLA_SWRST;
  while (TC3->COUNT16.STATUS.bit.SYNCBUSY);
  while (TC3->COUNT16.CTRLA.bit.SWRST);
}

void loop() {
  handleSerialInput();
}

void handleSerialInput() {
  static String input = "";
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      input.trim();
      parseCommand(input);
      input = "";
    } else {
      input += c;
    }
  }
}

void parseCommand(const String &cmd) {
  if (cmd.startsWith("START")) {
    int fIndex = cmd.indexOf("FREQ=");
    int dIndex = cmd.indexOf("DUTY=");
    int formIndex = cmd.indexOf("FORM=");

    if (fIndex > 0 && dIndex > 0 && formIndex > 0) {
      currentFreq = cmd.substring(fIndex + 5, cmd.indexOf(";", fIndex + 5)).toInt();
      currentDuty = cmd.substring(dIndex + 5, cmd.indexOf(";", dIndex + 5)).toFloat();
      currentForm = cmd.substring(formIndex + 5);

      if (currentForm == "RECT") {
        stopDAC();
        setupPWM(currentFreq, currentDuty);
        pwmActive = true;
      } else {
        stopPWM();
        startDAC(currentForm);
      }

      Serial.print("STATUS;FREQ=");
      Serial.print(currentFreq);
      Serial.print(";DUTY=");
      Serial.print(currentDuty);
      Serial.print(";FORM=");
      Serial.println(currentForm);
    }

  } else if (cmd.startsWith("STOP")) {
    stopPWM();
    stopDAC();
    pwmActive = false;
    Serial.println("STOPPED");
  }
}

void setupPWM(uint32_t freq, float duty) {
  TC3->COUNT16.CTRLA.reg = TC_CTRLA_SWRST;
  while (TC3->COUNT16.STATUS.bit.SYNCBUSY);
  while (TC3->COUNT16.CTRLA.bit.SWRST);

  TC3->COUNT16.CTRLA.reg =
    TC_CTRLA_MODE_COUNT16 |
    TC_CTRLA_WAVEGEN_NPWM |
    TC_CTRLA_PRESCALER_DIV1;
  while (TC3->COUNT16.STATUS.bit.SYNCBUSY);

  uint32_t top = 48000000 / freq - 1;
  TC3->COUNT16.CC[0].reg = top;
  while (TC3->COUNT16.STATUS.bit.SYNCBUSY);

  uint32_t compare = (duty / 100.0) * top;
  TC3->COUNT16.CC[1].reg = compare;
  while (TC3->COUNT16.STATUS.bit.SYNCBUSY);

  TC3->COUNT16.CTRLA.reg |= TC_CTRLA_ENABLE;
  while (TC3->COUNT16.STATUS.bit.SYNCBUSY);
}

void stopPWM() {
  TC3->COUNT16.CTRLA.reg &= ~TC_CTRLA_ENABLE;
  while (TC3->COUNT16.STATUS.bit.SYNCBUSY);
}

void startDAC(String form) {
  // TimerInterrupt für DAC Ausgabe bei gewünschter Frequenz
  TcCount16* TC = (TcCount16*) TC5;
  PM->APBCMASK.reg |= PM_APBCMASK_TC5;

  GCLK->CLKCTRL.reg = GCLK_CLKCTRL_ID_TCC0_TCC1 | GCLK_CLKCTRL_GEN_GCLK0 | GCLK_CLKCTRL_CLKEN;
  while (GCLK->STATUS.bit.SYNCBUSY);

  TC->CTRLA.reg = TC_CTRLA_SWRST;
  while (TC->STATUS.bit.SYNCBUSY);
  while (TC->CTRLA.bit.SWRST);

  uint32_t period = 48000000 / (currentFreq * 256);
  TC->CTRLA.reg = TC_CTRLA_MODE_COUNT16 | TC_CTRLA_PRESCALER_DIV1 | TC_CTRLA_WAVEGEN_MFRQ;
  TC->CC[0].reg = period;
  while (TC->STATUS.bit.SYNCBUSY);

  NVIC_EnableIRQ(TC5_IRQn);
  TC->INTENSET.reg = TC_INTENSET_MC0;
  TC->CTRLA.reg |= TC_CTRLA_ENABLE;
  while (TC->STATUS.bit.SYNCBUSY);
}

void stopDAC() {
  NVIC_DisableIRQ(TC5_IRQn);
  TC5->CTRLA.reg &= ~TC_CTRLA_ENABLE;
  while (TC5->STATUS.bit.SYNCBUSY);
  analogWrite(DAC_PIN, 0);
}

void TC5_Handler() {
  TC5->INTFLAG.bit.MC0 = 1;
  analogWrite(DAC_PIN, sineTable[waveIndex++]);
  waveIndex &= 0xFF;
}
