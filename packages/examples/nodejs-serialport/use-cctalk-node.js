import { getConnection } from '../../src/cctalk-node.js';
import SerialPort from 'serialport';
//const SerialPort = require('serialport')
const port = new SerialPort('/dev/ttyUSB0')
const { getDeviceWriter } = getConnection(port);
const billReader = getDeviceWriter( 40, 'crc16xmodem' )