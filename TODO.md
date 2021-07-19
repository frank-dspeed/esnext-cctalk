## A List of things that i would love to add
- Handling Power Safe Mode
- Auto Poll and readBuffered* configuration
- More easy Reconfiguration and Acceptance Enable commands also reset
- a web Repl mode already exists via dev tools a nodejs one would be nice.

## Known Bugs
deviceWriter can not send Array Commands :(

write(40,254)=>NotDest=>addpair
write(40,254)=>NotDest=>adddpair


    fnWrite() => Promise => writeToPort => ParserGets {
        // add to pair
        if (completPair) {
            // resolve the
            if (dest) {

            }
            If (notDestt) {
                Complet Pair of nonesense
                // we remove the Pair
                Error
            }
        }
    }

    Promise fullFill on secund parserMessage


# Wirred Edge case when writing 244
//()=> writer(244),

## Writing
When we write we can get a answer and should get a answer
if we get no answer for what ever reason