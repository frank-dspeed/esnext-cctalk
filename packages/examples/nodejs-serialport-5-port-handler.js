// Case 1 we send a write command and expect proper response in time
// We do not Accept a secund Write request what can happen?
// Case 1.1 We get the right response and fullFill
// Case 1.3 We get no response and timeout
// The following cases are bad
// Case 1.2 We get the right response and there comes additional data (so not really valid response eg: 253
// Case 1.4 We get somehow a command that got send by a device eg master to slave 

// Case 1.5 Not tested but expected we 
// We write to the port and wait 50ms if something came back 
    // if yes we wait again 50ms 
    // if not we resolve 
        // if there is data we resolve with that data and clean up 
        // if not reject timeout if nothing got resolved

// Case 1.6 If there is no waiting command we emit the data.


