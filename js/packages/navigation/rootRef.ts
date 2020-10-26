/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as React from 'react'
import { NavigationAction } from '@react-navigation/routers'

// https://reactnavigation.org/docs/navigating-without-navigation-prop/#handling-initialization

export const isReadyRef: React.MutableRefObject<any> = React.createRef()

export const navigationRef: any = React.createRef()

export function navigate(name: string, params: any): void {
	if (isReadyRef.current && navigationRef.current) {
		// Perform navigation if the app has mounted
		navigationRef.current.navigate(name, params)
	} else {
		// You can decide what to do if the app hasn't mounted
		// You can ignore this, or add these actions to a queue you can call later
	}
}

export function dispatch(action: NavigationAction): void {
	if (isReadyRef.current && navigationRef.current) {
		// Perform navigation if the app has mounted
		navigationRef.current.dispatch(action)
	} else {
		// You can decide what to do if the app hasn't mounted
		// You can ignore this, or add these actions to a queue you can call later
	}
}
