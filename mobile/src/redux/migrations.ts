import { initialNode, sliceName as networkConfigSliceName } from './reducers/networkConfig.reducer'

export const reduxPersistMigrations = {
	// any must be replaced by RootState
	// needs a refacto to avoid circular dependencies
	0: (state: any) => {
		return {
			...state,
			networkConfigSliceName: {
				...state[networkConfigSliceName],
				bootstrap: initialNode,
				rendezvous: initialNode,
				staticRelay: initialNode,
				hello: "comment ca va l'ami?",
			},
		}
	},
}
