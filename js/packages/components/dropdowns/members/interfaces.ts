export interface IMemberUserTypes {
	memberUserType: 'replication' | 'user'
}
export interface IMemberTransports {
	memberTransport: 'wifi' | '4g' | 'node' | 'ble' // TODO replace by proto GroupDevicesStatus.Transport enum
}
export interface IMemberStatus {
	memberStatus: 'connected' | 'disconnected' | 'reconnecting' // TODO replace by proto GroupDevicesStatus.Type enum
}
