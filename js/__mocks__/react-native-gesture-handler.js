import { View, ScrollView } from 'react-native'

export default {
	ScrollView,
	PanGestureHandler: View,
	attachGestureHandler: () => {},
	createGestureHandler: () => {},
	dropGestureHandler: () => {},
	updateGestureHandler: () => {},
	Direction: {
		RIGHT: 1,
		LEFT: 2,
		UP: 4,
		DOWN: 8,
	},
	State: {
		BEGAN: 'BEGAN',
		FAILED: 'FAILED',
		ACTIVE: 'ACTIVE',
		END: 'END',
		UNDETERMINED: 'UNDETERMINED',
	},
}
