import React from 'react'
import { ActivityIndicator, View, Image, StatusBar } from 'react-native'

import source from '@berty/assets/images/loader_dots.gif'
import { useIsDarkTheme, useThemeColor } from '@berty/hooks'

export const LoaderDots: React.FC = () => {
	const colors = useThemeColor()
	const isDark = useIsDarkTheme()

	return (
		<View
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				width: '100%',
				backgroundColor: colors['main-background'],
			}}
		>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
			{isDark ? (
				// the animated image has an opaque white background, so it can't be used on dark themes
				<ActivityIndicator size='large' color={colors['main-text']} />
			) : (
				<Image
					source={source}
					style={{ width: '80%', height: '40%', maxWidth: 170, maxHeight: 80 }}
				/>
			)}
		</View>
	)
}
