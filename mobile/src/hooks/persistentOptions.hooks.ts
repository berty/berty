import { useSelector } from 'react-redux'

import {
	PersistentOptionsKeys,
	selectPersistentOptions,
	UpdatesProfileNotification,
} from '@berty/redux/reducers/persistentOptions.reducer'

export const useProfileNotification = () => {
	const persistentOptions = useSelector(selectPersistentOptions)
	const profileNotifs = persistentOptions[PersistentOptionsKeys.ProfileNotification]
	return profileNotifs[UpdatesProfileNotification]
}
