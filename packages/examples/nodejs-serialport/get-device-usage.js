import getDevices from 'esnext-cctalk/modules/device-detection.js';
import { getEventData,getEventsAsArrays,isValidEventPayload } from 'esnext-cctalk/modules/parser/on-valid-event-message.js'

const devices = await getDevices();
for (const device of devices) {
    await device.write(254);
    await device.write(231, Uint8Array.from([255, 1]));
    await device.write(228, Uint8Array.from([0xFF]));
    // Enter Loop
}
