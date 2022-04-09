import { Rationale } from 'react-native'

export enum Permission {}
export interface PermissionStatus {}
export interface LocationAccuracy {}
export interface NotificationsResponse {}
export interface NotificationOption {}
export interface LocationAccuracyOptions {}

export const RESULTS = Object.freeze({
	UNAVAILABLE: 'unavailable',
	BLOCKED: 'blocked',
	DENIED: 'denied',
	GRANTED: 'granted',
	LIMITED: 'limited',
} as const)
export const PERMISSIONS = {}

export const check = async (_: Permission): Promise<PermissionStatus> => {
	return RESULTS.BLOCKED
}
export const checkLocationAccuracy = async (): Promise<LocationAccuracy> => {
	return 'reduced'
}
export const checkMultiple = async (_: Permission[]): Promise<PermissionStatus[]> => {
	return []
}
export const openLimitedPhotoLibraryPicker = async (): Promise<void> => {}
export const openSettings = async (): Promise<void> => {}
export const request = async (
	_: Permission,
	__?: Rationale | undefined,
): Promise<PermissionStatus> => {
	return RESULTS.BLOCKED
}
export const requestLocationAccuracy = async (
	_: LocationAccuracyOptions,
): Promise<LocationAccuracy> => {
	return 'reduced'
}
// requestMultiple: async <P_1 extends import("./types").Permission[]>(permissions: P_1) => Promise<Record<P_1[number], import("./types").PermissionStatus>> => {},
export const requestNotifications = async (
	_: NotificationOption[],
): Promise<NotificationsResponse> => {
	return {
		status: RESULTS.GRANTED,
		settings: {},
	}
}

export const checkNotifications = async (): Promise<NotificationsResponse> => {
	return {
		status: RESULTS.GRANTED,
		settings: {},
	}
}
