import React from 'react'
import { NavigationAction } from '@react-navigation/routers'
import { NavigationContainerRef } from '@react-navigation/native'

import { ScreensParams } from './types'

// https://reactnavigation.org/docs/navigating-without-navigation-prop/#handling-initialization

export const isReadyRef: React.MutableRefObject<any> = React.createRef()

export const navigationRef = React.createRef<NavigationContainerRef<ScreensParams>>()

export const navigate = <T extends keyof ScreensParams>(name: T, params: ScreensParams[T]) => {
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
