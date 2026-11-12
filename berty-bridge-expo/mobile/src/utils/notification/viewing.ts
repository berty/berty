import { AppState } from 'react-native'

import { navigationRef } from '@berty/navigation/rootRef'

// True when the user is currently looking at the given conversation.
//
// The navigation state alone is not enough: when the app goes to the background
// (home button, recent apps, another app on top) the conversation screen stays mounted
// and is still the "current route". Without checking the app state, notifications for
// the conversation that was open when the app was backgrounded were silently dropped.
// Shared by Android and iOS.
export const isViewingConversation = (convPK: string | undefined): boolean => {
	if (!convPK) {
		return false
	}

	// 'background' is the only state in which the screen is certainly not being looked at.
	// 'inactive' (iOS only: notification shade, app switcher, call banner...) is transient
	// and the conversation can still be on screen, so it keeps counting as viewing.
	if (AppState.currentState === 'background') {
		return false
	}

	const route = navigationRef.current?.getCurrentRoute()
	return (
		(route?.name === 'Chat.OneToOne' || route?.name === 'Chat.MultiMember') &&
		(route?.params as { convId?: string } | undefined)?.convId === convPK
	)
}
