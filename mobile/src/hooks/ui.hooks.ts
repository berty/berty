import { selectMessengerClient, selectProtocolClient } from '@berty/redux/reducers/ui.reducer'

import { useAppSelector } from './core.hooks'

export const useMessengerClient = () => {
	return useAppSelector(selectMessengerClient)
}

export const useProtocolClient = () => {
	return useAppSelector(selectProtocolClient)
}
