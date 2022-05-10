import { createContext } from 'react'
import { PermissionStatus, RESULTS } from 'react-native-permissions'

import {
	defaultPermissionStatus,
	PermissionType,
	Permissions,
} from '@berty/utils/react-native/permissions'

const PermissionsContext = createContext<{
	permissions: Permissions
	refreshPermissions: () => Promise<void>
	acquirePermission: (_: PermissionType) => Promise<PermissionStatus>
}>({
	permissions: defaultPermissionStatus,
	refreshPermissions: async () => {},
	acquirePermission: async (_: PermissionType) => RESULTS.BLOCKED,
})

export default PermissionsContext
