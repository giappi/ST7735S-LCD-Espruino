'use strict';

let T      = require('Storage');
let wifi   = require('Wifi');
Modules.addCached("ST7735S.mod.js", require('Storage').read("ST7735S.mod.js"));
let LCD    = require('ST7735S.mod.js');
//let LCD    = require('http://127.0.0.1:8000/ST7735S.mod.js');


let t = 0;

const W = 160;
const H = 80;
const B = 1;

let net    = {};
net.IP     = "N/A";
net.SSID   = "N/A";


D5.set(); // Backlight On

let spi = new SPI();
spi.setup({mosi:NodeMCU.D3, sck:NodeMCU.D2});

CS   =  NodeMCU.D0;
DC   =  NodeMCU.D1;
RST  =  NodeMCU.D4;

let g = Graphics.createArrayBuffer(W, H, B, { msb:true });

function onLoad()
{
    setInterval(function () {update(); paint(g);}, 1000);
}

LCD.init(spi, DC, CS, W, H, RST, onLoad);


function update()
{
    let ips = wifi.getIP();
    let inf = wifi.getDetails();

    net.IP     = ips && ips.ip;
    net.SSID   = inf && inf.ssid;
    net.STATUS = inf && inf.status;
}

function paint(g)
{
    g.clear();
    g.setFontVector(10);
    g.setColor(1);
    g.drawString(`IP:    ${net.IP}`, 0, 0);
    g.drawString(`SSID:  ${net.SSID}`, 0, 16);
    g.drawString(`STATUS ${net.STATUS}`, 0, 32);
    LCD.paint(g.buffer, B);
}


