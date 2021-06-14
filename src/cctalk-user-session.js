/**
 * This flow trys to Autodetect a billReader coinDetector Pair on same bus
 * Starts a readBuffered Credit Bill
 * parses with the user-session parser
 */
const state = {};
const startUserSession = () => {
    /**
    3.45 Header 211 - Power management control Received data : ACK
    This command can be used to switch slave devices in and out of low power modes 
    if they support power management.
    [211, Uint8Array.from([])]
    0 - normal operation ( automatic power switching if supported )
    1 - switch to low power mode
    2 - switch to full power mode
    3 - shutdown A shutdown normally requires an external reset or a power-down cycle to recover 
    */
}