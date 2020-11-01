'use strict'

SWRESET = 0x01; // Software Reset
SLPIN   = 0x10; // Sleep In & Booster Off
SLPOUT  = 0x11; // Sleep Out & Booster On
NORON   = 0x13; // Partial Off (Normal)
INVOFF  = 0x20; // Negative/Invert Color Off
INVON   = 0x21; // Negative/Invert Color On
GAMSET  = 0x26; // Gamma Curve Select
DISPOFF = 0x28; // Display Off
DISPON  = 0x29; // Display On
CASET   = 0x2a; // Column Address Set
RASET   = 0x2b; // Row Address Set
RAMWR   = 0x2c; // Memory Write
RAMRD   = 0x2e; // Memory Read
MADCTL  = 0x36; // Memory Data Access Control: row order, col order, row colum xchange, vert/refr order, rgb/bgr, hor/refr order, 0, 0
COLMOD  = 0x3a; // Interface Pixel Format: 3=12bit, 5=16-bit, 6=18-bit  pixel color mode
FRMCTR1 = 0xb1; // Frame Rate Control in normal mode, full colors
FRMCTR2 = 0xb2; // Frame Rate Control in idle mode, 8 colors
FRMCTR3 = 0xb3; // Frame Rate Control in partial mode, full colors
INVCTR  = 0xb4; // Display Inversion Control
PWCTR1  = 0xc0; // Power Control 1
PWCTR2  = 0xc1; // Power Control 2
PWCTR3  = 0xc2; // Power Control 3 in normal mode, full colors
PWCTR4  = 0xc3; // Power Control 4 in idle mode 8colors
PWCTR5  = 0xc4; // Power Control 5 in partial mode, full colors
VMCTR1  = 0xc5; // VCOM Control 1: Voltage Setting
VMOFCTR = 0xc7; // VCOM Offset Control
GMCTRP1 = 0xe0; // Gamma '+'Polarity Correction Characteristics Setting
GMCTRN1 = 0xe1; // Gamma '-'Polarity Correction Characteristics Setting

DELAY   = "delay";

module.exports.init = function(spi, DC, CS, W, H, RST, callback)
{

    this.W      = W;
    this.H      = H;
    this.DC     = DC;
    this.spi    = spi;
    this.CS     = CS;
    this.CS     = RST;
    this.callback = callback;
    that        = this;

    function send(cmd, data)
    {
        DC.reset();
        spi.write(cmd, CS);
        DC.set();
        spi.write(data, CS);
    }

    function F(cmdList)
    {
        if(cmdList.length == 0)
        {
            console.log("DONE. Call back ", that.callback);
            that.callback && that.callback();
            return true;
        }

        let x   = cmdList.shift();
        cmd     = x[0];
        data    = x[1];

        console.log("CMD: ", cmd, data);
        
        if(cmd == DELAY)
        {
            setTimeout(_ => F(cmdList), data);
        }
        else
        {
            send(cmd, data);
            setTimeout(_ => F(cmdList), 10);
        }
    }
    
    // RESET
    digitalPulse(RST, 0, 10);

    let cmdList = 
    [
        [DELAY,     200],
        [SLPOUT,    []],
        [FRMCTR1,   [1, 44, 45]],
        [FRMCTR2,   [1, 44, 45]],
        [FRMCTR3,   [1, 44, 45, 1 ,44 ,45]],
        [INVCTR,    [7]],
        [PWCTR1,    [162 ,2 ,132]],
        [PWCTR2,    [197]],
        [PWCTR3,    [10, 0]],
        [PWCTR4,    [138, 42]],
        [PWCTR5,    [138, 238]],
        [VMCTR1,    [14]],
        [VMOFCTR,   [0]],
        [INVOFF,    []],
        [MADCTL,    0b01101000],
        [COLMOD,    5],
        [CASET,     [0 ,1 , 0 ,W-1+1]],
        [RASET,     [0 ,26, 0 ,H-1+26]],
        [INVON,     []],
        [VMOFCTR,   0b00000],
        [GMCTRP1,   [0x02,0x1c,0x07,0x12,0x37,0x32,0x29,0x2d,0x29,0x25,0x2B,0x39,0x00,0x01,0x03,0x10]],
        [GMCTRN1,   [0x03,0x1d,0x07,0x06,0x2E,0x2C,0x29,0x2D,0x2E,0x2E,0x37,0x3F,0x00,0x00,0x02,0x10]],
        [DELAY,     200],
        [NORON,     []],
        [DELAY,     200],
        [DISPON,    []]
    ];

    F(cmdList);


}


module.exports.paint = function(buffer, bits)
{
    CS.reset();
    spi.write(RAMWR, DC);
    let k = 16;
    let tmp = new Uint16Array(W*k);
    
    for (var y = 0; y < H; y += k)
    {
        E.mapInPlace(new Uint8Array(buffer, y*W*bits/8, tmp.length), tmp, [0x0000, 0xff00], bits);
        this.spi.write(tmp.buffer);
    }
    CS.set();
}
