# Entropy pool

Date: 2019-05-24  
Author: Manfred Touron (moul)

## Description

The idea would be to add to a pool random data blocks generated when the level of entropy provided by the OS or by dedicated hardware is at its highest.
Random data added to the pool could be reused later to generate new cryptographic materials.

We could ensure that the pool is built when the device is idle and its battery is fully charged.
For example, in the case of a phone: when it charges during the night.


## Why?

An attacker could lower the entropy level at some point and make the numbers generated predictable.


## To be considered

We don't know enough about the subject to assess whether it's a bad practice to do this kind of thing.
