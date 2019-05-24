# Distributed entropy

Date: 2019-05-24  
Author: Antoine Eddi (aeddi)

## Description

The idea would be to exchange random data blocks between trusted devices (owned by the same account or by different contacts).
The exchange will take place during device-to-device handshakes, we could add a step to our handshake protocol to exchange 64 bytes of random data.
All the random data collected from different sources could be mixed up and stored securely so that it could be reused later to generate new cryptographic materials.

NB: It is obviously out of the question to use the data provided by a single peer without mixing it with data from other sources to generate secrets.


## Why?

A particular device could have an unsafe PRNG for some reason. Mixing random data provided by different devices should prevent an attack baased on PNRG weaknesses specific to a particular device.


## To be considered

We don't know enough about the subject to assess whether it's a bad practice to do this kind of thing.
