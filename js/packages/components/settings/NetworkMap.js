import React from 'react'
import { ScrollView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { HeaderSettings } from '../shared-components/Header'
import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/navigation'

//
// IpfsWebUI
//

export const NetworkMap = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings title='Network Map' bgColor={color.dark.grey} undo={goBack} />
			</ScrollView>
		</Layout>
	)
}
