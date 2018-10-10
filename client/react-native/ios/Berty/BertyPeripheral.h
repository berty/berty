//
//  BertyPeripheral.h
//  bluetooth
//
//  Created by sacha on 14/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

NS_ASSUME_NONNULL_BEGIN

@interface BertyPeripheral : NSObject <CBPeripheralDelegate>

@property (strong, nonatomic) CBPeripheral *me;

- (instancetype)initWithPeripheral:(CBPeripheral*)me;

@end

NS_ASSUME_NONNULL_END
