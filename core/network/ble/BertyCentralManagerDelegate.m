// +build darwin
//
//  BertyCentralDelegate.m
//  ble
//
//  Created by sacha on 28/11/2018.
//  Copyright © 2018 berty. All rights reserved.
//

#import "BertyCentralManagerDelegate.h"

@implementation BertyCentralManagerDelegate

- (instancetype)initWithPeripheralDelegate:(BertyPeripheralDelegate *)delegate {
    self = [super init];
    
    self.peripheralDelegate = delegate;
    NSLog(@"BertyCentralManagerDelegate init");
    return self;
}

/*!
 *  @method centralManagerDidUpdateState:
 *
 *  @param central  The central manager whose state has changed.
 *
 *  @discussion     Invoked whenever the central manager's state has been updated. Commands should only be issued when the state is
 *                  <code>CBCentralManagerStatePoweredOn</code>. A state below <code>CBCentralManagerStatePoweredOn</code>
 *                  implies that scanning has stopped and any connected peripherals have been disconnected. If the state moves below
 *                  <code>CBCentralManagerStatePoweredOff</code>, all <code>CBPeripheral</code> objects obtained from this central
 *                  manager become invalid and must be retrieved or discovered again.
 *
 *  @see            state
 *
 */
- (void)centralManagerDidUpdateState:(nonnull CBCentralManager *)central {
    NSString *stateString = nil;
    switch(central.state)
    {
        case CBManagerStateResetting: {
            break;
        }
        case CBManagerStateUnsupported: {
            break;
        }
        case CBManagerStateUnauthorized: {
            break;
        }
        case CBManagerStatePoweredOff: {
            stateString = @"Bluetooth is currently powered off.";
            break;
        }
        case CBManagerStatePoweredOn: {
            stateString = @"Bluetooth is currently powered on and available to use.";
            [BertyUtils sharedUtils].CentralIsOn = true;
//            dispatch_async(self.dispatch_queue, ^{
//                dispatch_semaphore_signal(self.centralWaiter);
//            });
            break;
        }
        default: {
            stateString = @"State unknown, update imminent.";
            break;
        }
    }

    NSLog(@"centralManagerDidUpdateState: %@", stateString);
}

/*!
 *  @method centralManager:willRestoreState:
 *
 *  @param central      The central manager providing this information.
 *  @param dict			A dictionary containing information about <i>central</i> that was preserved by the system at the time the app was terminated.
 *
 *  @discussion			For apps that opt-in to state preservation and restoration, this is the first method invoked when your app is relaunched into
 *						the background to complete some Bluetooth-related task. Use this method to synchronize your app's state with the state of the
 *						Bluetooth system.
 *
 *  @seealso            CBCentralManagerRestoredStatePeripheralsKey;
 *  @seealso            CBCentralManagerRestoredStateScanServicesKey;
 *  @seealso            CBCentralManagerRestoredStateScanOptionsKey;
 *
 */
- (void)centralManager:(CBCentralManager *)central willRestoreState:(NSDictionary<NSString *, id> *)dict {
    NSLog(@"centralManger: central willRestoreState: %@", dict);
}

/*!
 *  @method centralManager:didDiscoverPeripheral:advertisementData:RSSI:
 *
 *  @param central              The central manager providing this update.
 *  @param peripheral           A <code>CBPeripheral</code> object.
 *  @param advertisementData    A dictionary containing any advertisement and scan response data.
 *  @param RSSI                 The current RSSI of <i>peripheral</i>, in dBm. A value of <code>127</code> is reserved and indicates the RSSI
 *								was not available.
 *
 *  @discussion                 This method is invoked while scanning, upon the discovery of <i>peripheral</i> by <i>central</i>. A discovered peripheral must
 *                              be retained in order to use it; otherwise, it is assumed to not be of interest and will be cleaned up by the central manager. For
 *                              a list of <i>advertisementData</i> keys, see {@link CBAdvertisementDataLocalNameKey} and other similar constants.
 *
 *  @seealso                    CBAdvertisementData.h
 *
 */
- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary<NSString *, id> *)advertisementData RSSI:(NSNumber *)RSSI {
    if (![BertyUtils inDevices:peripheral]) {
        NSLog(@"centralManger: central didDiscoverPeripheral: %@ RSSI %@ advertisementData: %@", [peripheral.identifier UUIDString], [RSSI stringValue], advertisementData);
        [peripheral setDelegate:self.peripheralDelegate];
        BertyDevice *device = [[BertyDevice alloc] initWithPeripheral:peripheral withCentralManager:central];
        [BertyUtils addDevice:device];
        [central connectPeripheral:peripheral options:nil];
    }
} 

/*!
 *  @method centralManager:didConnectPeripheral:
 *
 *  @param central      The central manager providing this information.
 *  @param peripheral   The <code>CBPeripheral</code> that has connected.
 *
 *  @discussion         This method is invoked when a connection initiated by {@link connectPeripheral:options:} has succeeded.
 *
 */
- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral {
    NSLog(@"centralManger: central didConnectPeripheral: %@ %@", [peripheral.identifier UUIDString], peripheral.delegate);
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
        BertyDevice *bDevice = [BertyUtils getDevice:peripheral];
        if (bDevice == nil) {
            NSLog(@"centralManger: central didConnectPeripheral error unknown peripheral connected");
            return;
        }
        dispatch_semaphore_signal(bDevice.connSema);
    });
}

/*!
 *  @method centralManager:didFailToConnectPeripheral:error:
 *
 *  @param central      The central manager providing this information.
 *  @param peripheral   The <code>CBPeripheral</code> that has failed to connect.
 *  @param error        The cause of the failure.
 *
 *  @discussion         This method is invoked when a connection initiated by {@link connectPeripheral:options:} has failed to complete. As connection attempts do not
 *                      timeout, the failure of a connection is atypical and usually indicative of a transient issue.
 *
 */
- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(nullable NSError *)error {
    NSLog(@"centralManger: central didFailToConnectPeripheral: %@", [peripheral.identifier UUIDString]);
}

/*!
 *  @method centralManager:didDisconnectPeripheral:error:
 *
 *  @param central      The central manager providing this information.
 *  @param peripheral   The <code>CBPeripheral</code> that has disconnected.
 *  @param error        If an error occurred, the cause of the failure.
 *
 *  @discussion         This method is invoked upon the disconnection of a peripheral that was connected by {@link connectPeripheral:options:}. If the disconnection
 *                      was not initiated by {@link cancelPeripheralConnection}, the cause will be detailed in the <i>error</i> parameter. Once this method has been
 *                      called, no more methods will be invoked on <i>peripheral</i>'s <code>CBPeripheralDelegate</code>.
 *
 */
- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(nullable NSError *)error {
    NSLog(@"centralManger: central didDisconnectPeripheral: %@ %@", [peripheral.identifier UUIDString], error);
    BertyDevice *bDevice = [BertyUtils getDevice:peripheral];
    [BertyUtils removeDevice:bDevice];
    setConnClosed([bDevice.ma UTF8String]);
    bDevice.peripheral = nil;
    bDevice = nil;
    NSLog(@"FINISHED disco");
}

@end

