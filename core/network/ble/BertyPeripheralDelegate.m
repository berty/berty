// +build darwin
//
//  BertyPeripheralDelegate.m
//  ble
//
//  Created by sacha on 28/11/2018.
//  Copyright © 2018 berty. All rights reserved.
//

#import "BertyPeripheralDelegate.h"

@implementation BertyPeripheralDelegate

/*!
 *  @method peripheralDidUpdateName:
 *
 *  @param peripheral    The peripheral providing this update.
 *
 *  @discussion            This method is invoked when the @link name @/link of <i>peripheral</i> changes.
 */
- (void)peripheralDidUpdateName:(CBPeripheral *)peripheral NS_AVAILABLE(10_9, 6_0) {
    NSLog(@"peripheralDidUpdateName: %@ name: %@", [peripheral.identifier UUIDString], peripheral.name);
}

/*!
 *  @method peripheral:didModifyServices:
 *
 *  @param peripheral            The peripheral providing this update.
 *  @param invalidatedServices    The services that have been invalidated
 *
 *  @discussion            This method is invoked when the @link services @/link of <i>peripheral</i> have been changed.
 *                        At this point, the designated <code>CBService</code> objects have been invalidated.
 *                        Services can be re-discovered via @link discoverServices: @/link.
 */
- (void)peripheral:(CBPeripheral *)peripheral didModifyServices:(NSArray<CBService *> *)invalidatedServices NS_AVAILABLE(10_9, 7_0) {
    NSLog(@"peripheral: %@ didModifyServices: %@", [peripheral.identifier UUIDString], [BertyUtils arrayServiceToSting:invalidatedServices]);
}

/*!
 *  @method peripheral:didDiscoverServices:
 *
 *  @param peripheral    The peripheral providing this information.
 *    @param error        If an error occurred, the cause of the failure.
 *
 *  @discussion            This method returns the result of a @link discoverServices: @/link call. If the service(s) were read successfully, they can be retrieved via
 *                        <i>peripheral</i>'s @link services @/link property.
 *
 */
- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(nullable NSError *)error {
    NSLog(@"peripheral: %@ didDiscoverServices: %@", [peripheral.identifier UUIDString], [BertyUtils arrayServiceToSting:peripheral.services]);
    BertyDevice *bDevice = [BertyUtils getDevice:peripheral];
    if (bDevice == nil) {
        NSLog(@"peripheral: didDiscoverServices error unknown peripheral connected");
        return;
    }
    for (CBService *svc in peripheral.services) {
        if ([svc.UUID isEqual:[BertyUtils sharedUtils].serviceUUID]) {
            bDevice.svc = svc;
            dispatch_semaphore_signal(bDevice.svcSema);
            NSLog(@"peripheral: didDiscoverServices success");
            return;
        }
    }
    NSLog(@"peripheral: didDiscoverServices error peripheral doesn't have the Berty service");
}

/*!
 *  @method peripheral:didDiscoverIncludedServicesForService:error:
 *
 *  @param peripheral    The peripheral providing this information.
 *  @param service        The <code>CBService</code> object containing the included services.
 *    @param error        If an error occurred, the cause of the failure.
 *
 *  @discussion            This method returns the result of a @link discoverIncludedServices:forService: @/link call. If the included service(s) were read successfully,
 *                        they can be retrieved via <i>service</i>'s <code>includedServices</code> property.
 */
- (void)peripheral:(CBPeripheral *)peripheral didDiscoverIncludedServicesForService:(CBService *)service error:(nullable NSError *)error {
    NSLog(@"peripheral: %@ didDiscoverIncludedServicesForService: %@ services: %@", [peripheral.identifier UUIDString], [service.UUID UUIDString], [BertyUtils arrayServiceToSting:service.includedServices]);
}

/*!
 *  @method peripheral:didDiscoverCharacteristicsForService:error:
 *
 *  @param peripheral    The peripheral providing this information.
 *  @param service        The <code>CBService</code> object containing the characteristic(s).
 *    @param error        If an error occurred, the cause of the failure.
 *
 *  @discussion            This method returns the result of a @link discoverCharacteristics:forService: @/link call. If the characteristic(s) were read successfully,
 *                        they can be retrieved via <i>service</i>'s <code>characteristics</code> property.
 */
- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(nullable NSError *)error {
    NSLog(@"peripheral: %@ didDiscoverCharacteristicsForService: %@ characteristics: %@", [peripheral.identifier UUIDString], [service.UUID UUIDString], [BertyUtils arrayCharacteristicToSting:service.characteristics]);
    BertyDevice *bDevice = [BertyUtils getDevice:peripheral];
    if (bDevice == nil) {
        NSLog(@"peripheral: didDiscoverServices error unknown peripheral connected");
        return;
    }
    BertyUtils *utils = [BertyUtils sharedUtils];
    for (CBCharacteristic *characteristic in service.characteristics) {
        if ([characteristic.UUID isEqual:utils.writerUUID]) {
            NSLog(@"writerUUID latch down");
            [bDevice.latchChar countDown];
            bDevice.writer = characteristic;
        } else if ([characteristic.UUID isEqual:utils.closerUUID]) {
            NSLog(@"closerUUID latch down");
            [bDevice.latchChar countDown];
            bDevice.closer = characteristic;
        } else if ([characteristic.UUID isEqual:utils.maUUID]) {
            NSLog(@"maUUID latch down");
            [bDevice.latchChar countDown];
            bDevice.maChar = characteristic;
        } else if ([characteristic.UUID isEqual:utils.peerUUID]) {
            NSLog(@"peerID latch down");
            [bDevice.latchChar countDown];
            bDevice.peerIDChar = characteristic;
        }
    }
}

/*!
 *  @method peripheral:didUpdateValueForCharacteristic:error:
 *
 *  @param peripheral        The peripheral providing this information.
 *  @param characteristic    A <code>CBCharacteristic</code> object.
 *    @param error            If an error occurred, the cause of the failure.
 *
 *  @discussion                This method is invoked after a @link readValueForCharacteristic: @/link call, or upon receipt of a notification/indication.
 */
- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(nullable NSError *)error {
    NSLog(@"peripheral: %@ didUpdateValueForCharacteristic: %@", [peripheral.identifier UUIDString], [characteristic.UUID UUIDString]);
    BertyDevice *bDevice = [BertyUtils getDevice:peripheral];
    BertyUtils *utils = [BertyUtils sharedUtils];
    if (bDevice == nil) {
        NSLog(@"peripheral: didUpdateValueForCharacteristic error unknown peripheral connected");
        return;
    }
    if (error != nil) {
        if ([characteristic.UUID isEqual:utils.maUUID] || [characteristic.UUID isEqual:utils.peerUUID]) {
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
                [NSThread sleepForTimeInterval:10.0];
                NSLog(@"Laucmhign new read");
                [peripheral readValueForCharacteristic:characteristic];
            });
        }
        NSLog(@"peripheral: %@ didUpdateValueForCharacteristic: %@ error: %@", [peripheral.identifier UUIDString], [characteristic.UUID UUIDString], error);
        return ;
    }

    if ([characteristic.UUID isEqual:utils.maUUID]) {
        bDevice.ma = [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding];
        [bDevice.latchRead countDown];
    } else if ([characteristic.UUID isEqual:utils.peerUUID]) {
        bDevice.peerID = [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding];
        [bDevice.latchRead countDown];
    }
}

/*!
 *  @method peripheral:didWriteValueForCharacteristic:error:
 *
 *  @param peripheral        The peripheral providing this information.
 *  @param characteristic    A <code>CBCharacteristic</code> object.
 *    @param error            If an error occurred, the cause of the failure.
 *
 *  @discussion                This method returns the result of a {@link writeValue:forCharacteristic:type:} call, when the <code>CBCharacteristicWriteWithResponse</code> type is used.
 */
- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(nullable NSError *)error {
    NSLog(@"peripheral: %@ didWriteValueForCharacteristic: %@", [peripheral.identifier UUIDString], [characteristic.UUID UUIDString]);
    BertyDevice *bDevice = [BertyUtils getDevice:peripheral];
    BertyUtils *utils = [BertyUtils sharedUtils];
    if (bDevice == nil) {
        NSLog(@"peripheral: didWriteValueForCharacteristic error unknown peripheral connected");
        return;
    }
    if (error != nil) {
//        if ([characteristic.UUID isEqual:utils.isRdyUUID]) {
//            NSLog(@"DISPATCHING");
//            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(10 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
//                NSLog(@"DISPATCHING RUNNING");
//                [[BertyUtils getDevice:peripheral] writeIsRdy];
//            });
//        }
        NSLog(@"error didWriteValueForCharacteristic: %@", error);
        return;
    }
    if ([characteristic.UUID isEqual:utils.writerUUID]) {
        [bDevice popToSend];
        [bDevice checkAndWrite];
    } else if ([characteristic.UUID isEqual:utils.peerUUID] || [characteristic.UUID isEqual:utils.maUUID]) {
        dispatch_semaphore_signal(bDevice.writeWaiter);
    }
}

/*!
 *  @method peripheral:didUpdateNotificationStateForCharacteristic:error:
 *
 *  @param peripheral        The peripheral providing this information.
 *  @param characteristic    A <code>CBCharacteristic</code> object.
 *    @param error            If an error occurred, the cause of the failure.
 *
 *  @discussion                This method returns the result of a @link setNotifyValue:forCharacteristic: @/link call.
 */
- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(nullable NSError *)error {
    NSLog(@"peripheral: %@ didUpdateNotificationStateForCharacteristic: %@", [peripheral.identifier UUIDString], [characteristic.UUID UUIDString]);
}

/*!
 *  @method peripheralIsReadyToSendWriteWithoutResponse:
 *
 *  @param peripheral   The peripheral providing this update.
 *
 *  @discussion         This method is invoked after a failed call to @link writeValue:forCharacteristic:type: @/link, when <i>peripheral</i> is again
 *                      ready to send characteristic value updates.
 *
 */
- (void)peripheralIsReadyToSendWriteWithoutResponse:(CBPeripheral *)peripheral {
    NSLog(@"peripheralIsReadyToSendWriteWithoutResponse: %@", [peripheral.identifier UUIDString]);
}

/*!
 *  @method peripheral:didOpenL2CAPChannel:error:
 *
 *  @param peripheral        The peripheral providing this information.
 *  @param channel            A <code>CBL2CAPChannel</code> object.
 *    @param error            If an error occurred, the cause of the failure.
 *
 *  @discussion                This method returns the result of a @link openL2CAPChannel: @link call.
 */
- (void)peripheral:(CBPeripheral *)peripheral didOpenL2CAPChannel:(nullable CBL2CAPChannel *)channel error:(nullable NSError *)error {
    NSLog(@"peripheral: %@ didOpenL2CAPChannel", [peripheral.identifier UUIDString]);
}


@end
