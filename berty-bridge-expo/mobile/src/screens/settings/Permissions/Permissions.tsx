import React, { useEffect } from 'react'
import { AppState, AppStateStatus, Platform } from 'react-native'
import { openSettings, PermissionStatus, RESULTS } from 'react-native-permissions'
import { useDispatch } from 'react-redux'

import { Permission } from '@berty/components/permissions/Permission'
import { useAppSelector } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	selectEditedNetworkConfig,
	setBlePerm,
	setCurrentNetworkConfig,
} from '@berty/redux/reducers/networkConfig.reducer'
import {
	checkPermission,
	checkProximityPermission,
} from '@berty/utils/permissions/checkPermissions'
import { acquirePermission, PermissionType } from '@berty/utils/permissions/permissions'

export const Permissions: ScreenFC<'Settings.Permissions'> = ({ route: { params } }) => {
	const { accept, deny, status, permissionType } = params
	const { goBack, navigate } = useNavigation()
	const appState = React.useRef(AppState.currentState)

	const [listenerAvailable, setListenerAvailable] = React.useState<boolean>(false)

	const dispatch = useDispatch()
	const networkConfig = useAppSelector(selectEditedNetworkConfig)

	const handleOnPressPrimary = React.useCallback(async () => {
		// enable listener
		setListenerAvailable(true)

		// openSettings if status is blocked
		if (status === RESULTS.BLOCKED) {
			await openSettings()
		} else {
			try {
				// request the permission
				const status = await acquirePermission(permissionType)

				if (permissionType === PermissionType.proximity) {
					// set new Ble status for toggle's condition in settings
					dispatch(setBlePerm(status))
				}

				// check status
				if (status === RESULTS.GRANTED) {
					await accept()
					goBack()
				}
			} catch (err) {
				console.warn('Camera handleRequestPermission error:', err)
			}
		}
	}, [accept, dispatch, goBack, permissionType, status])

	const handleOnPressSecondary = React.useCallback(async () => {
		await deny()
		goBack()
	}, [deny, goBack])

	// this callback is called in the listener below to handle the change of the app state
	const handleAppStateChange = React.useCallback(
		async (nextAppState: AppStateStatus) => {
			// this condition is valid when the OS settings is open (so permission is BLOCKED)
			// and we return to the app (with or without changes)
			if (
				appState.current.match(/inactive|background/) &&
				nextAppState === 'active' &&
				listenerAvailable
			) {
				let status: PermissionStatus = RESULTS.DENIED

				// get permission status
				if (permissionType === PermissionType.proximity) {
					status = await checkProximityPermission({
						setNetworkConfig: async newConfig => {
							dispatch(setCurrentNetworkConfig(newConfig))
						},
						networkConfig,
						changedKey:
							Platform.OS === 'ios'
								? ['bluetoothLe', 'appleMultipeerConnectivity']
								: ['bluetoothLe', 'androidNearby'],
						navigate,
						accept,
						deny,
					})
				} else {
					status = await checkPermission({
						permissionType: PermissionType.audio,
						navigate,
						accept,
						deny,
					})
				}

				// this is the check of the permission status after having gone to the settings
				status === RESULTS.GRANTED ? await accept() : await deny()
				goBack()
			}

			appState.current = nextAppState
		},
		[listenerAvailable, permissionType, accept, deny, goBack, networkConfig, navigate, dispatch],
	)

	// listener to handle the change of the app state
	// (the app state change when we go to the OS settings of the app, so when you come back in the app, we can detect it)
	useEffect(() => {
		if (listenerAvailable) {
			AppState.addEventListener('change', handleAppStateChange)
		}
		return () => {
			AppState.removeEventListener('change', handleAppStateChange)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Permission
			permissionType={permissionType}
			permissionStatus={status}
			onPressPrimary={handleOnPressPrimary}
			onPressSecondary={handleOnPressSecondary}
		/>
	)
}
