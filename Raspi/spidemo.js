var rpio = require('rpio');

/*  https://www.npmjs.com/package/rpio
 *  The code below reads the 128x8 contents of an AT93C46 serial EEPROM.
 *
 *  Pin | Function
 * -----|----------
 *   19 |   MOSI
 *   21 |   MISO
 *   23 |   SCLK
 *   24 |   CE0
 *   26 |   CE1
 */
 
rpio.spiBegin();
/*
 *  Value | Pin
 *  ------|---------------------
 *    0   | SPI_CE0 (24 / GPIO8)
 *    1   | SPI_CE1 (26 / GPIO7)
 *    2   | Both
 */
rpio.spiChipSelect(0);                  /* Use CE0 */
rpio.spiSetCSPolarity(0, rpio.HIGH);    /* AT93C46 chip select is active-high */
rpio.spiSetClockDivider(128);           /* AT93C46 max is 2MHz, 128 == 1.95MHz */
/*
 *  Mode | CPOL | CPHA
 *  -----|------|-----
 *    0  |  0   |  0
 *    1  |  0   |  1
 *    2  |  1   |  0
 *    3  |  1   |  1
 */
rpio.spiSetDataMode(0); /* 0 is the default */

/*
 * There are various magic numbers below.  A quick overview:
 *
 *   tx[0] is always 0x3, the EEPROM READ instruction.
 *   tx[1] is set to var i which is the EEPROM address to read from.
 *   tx[2] and tx[3] can be anything, at this point we are only interested in
 *     reading the data back from the EEPROM into our rx buffer.
 *
 * Once we have the data returned in rx, we have to do some bit shifting to
 * get the result in the format we want, as the data is not 8-bit aligned.
 */
var tx = new Buffer([0x3, 0x0, 0x0, 0x0]);
var rx = new Buffer(4);
var out;
var i, j = 0;

for (i = 0; i < 128; i++, ++j) {
        tx[1] = i;
        rpio.spiTransfer(tx, rx, 4);
        out = ((rx[2] << 1) | (rx[3] >> 7));
        process.stdout.write(out.toString(16) + ((j % 16 == 0) ? '\n' : ' '));
}
rpio.spiEnd();