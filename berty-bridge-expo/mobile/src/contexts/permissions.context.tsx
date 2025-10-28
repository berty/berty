import React, { createContext, useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { PermissionStatus, RESULTS } from "react-native-permissions";

import {
	defaultPermissionStatus,
	PermissionType,
	Permissions,
	getPermissions,
	acquirePermission,
} from "@berty/utils/permissions/permissions";

const PermissionsContext = createContext<{
	permissions: Permissions;
	refreshPermissions: () => Promise<void>;
	acquirePermission: (_: PermissionType) => Promise<PermissionStatus>;
}>({
	permissions: defaultPermissionStatus,
	refreshPermissions: async () => {},
	acquirePermission: async (_: PermissionType) => RESULTS.BLOCKED,
});

interface PermissionsProviderProps {
	children: React.ReactNode;
}

export const PermissionsProvider = ({ children }: PermissionsProviderProps) => {
	const [state, setState] = useState(defaultPermissionStatus);

	const refreshPermissions = useCallback(async () => {
		const permissions = await getPermissions();
		setState(permissions);
	}, [getPermissions]);

	const acquirePermissionCB = useCallback(
		async (permissionType: PermissionType): Promise<PermissionStatus> => {
			const result = await acquirePermission(permissionType);

			refreshPermissions();

			return result;
		},
		[acquirePermission, refreshPermissions]
	);

	useEffect(() => {
		refreshPermissions();
		const sub = AppState.addEventListener("change", refreshPermissions);
		return () => sub.remove();

		// const listener = AppState.addEventListener('change', refreshPermissions)
		// return () => listener.remove()
	}, [refreshPermissions]);

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
	);
};

export default PermissionsContext;
