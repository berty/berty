import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useThemeColor } from '@berty/hooks'

const OnboardingWrapper = ({ children } : React.PropsWithChildren) => {
	const colors = useThemeColor()

	return (
		<SafeAreaView style={[{ flex: 1, backgroundColor: colors['background-header'] }]}>
			{children}
		</SafeAreaView>
	)
}

export default OnboardingWrapper
