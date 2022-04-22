import React, { useState, useCallback, useEffect } from 'react'
import { AppState } from 'react-native'
import PermissionsContext from '@berty/contexts/permissions.context'
import { PermissionStatus } from 'react-native-permissions'
import {
	defaultPermissionStatus,
	acquirePermission,
	getPermissions,
	PermissionType,
} from '@berty/rnutil/permissions'

const PermissionsProvider: React.FC = ({ children }) => {
	const [state, setState] = useState(defaultPermissionStatus)

	const refreshPermissions = useCallback(async () => {
		const permissions = await getPermissions()
		setState(permissions)
	}, [])

	const acquirePermissionCB = useCallback(
		async (permissionType: PermissionType): Promise<PermissionStatus> => {
			const result = await acquirePermission(permissionType)

			refreshPermissions()

			return result
		},
		[refreshPermissions],
	)

	useEffect(() => {
		refreshPermissions()
		AppState.addEventListener('change', refreshPermissions)
		return () => AppState.removeEventListener('change', refreshPermissions)

		// const listener = AppState.addEventListener('change', refreshPermissions)
		// return () => listener.remove()
	}, [refreshPermissions])

	return (
		<PermissionsContext.Provider
			value={{
				permissions: state,
				refreshPermissions: refreshPermissions,
				acquirePermission: acquirePermissionCB,
			}}
		>
			{children}
		</PermissionsContext.Provider>
	)
}

export default PermissionsProvider
