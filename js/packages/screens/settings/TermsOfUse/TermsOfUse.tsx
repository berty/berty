import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from '@ui-kitten/components'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store/hooks'
import { ScreenFC } from '@berty/navigation'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

//
// TermsOfUse
//

// Types
type BodyTermsOfUseItemProps = {
	textProps: string
	title?: string
}

const BodyTermsOfUseItem: React.FC<BodyTermsOfUseItemProps> = ({ textProps, title = null }) => {
	const { margin, text } = useStyles()
	return (
		<View style={[margin.top.big]}>
			{title && <UnifiedText style={[text.bold]}>{title}</UnifiedText>}
			<UnifiedText style={[text.size.small]}>{textProps}</UnifiedText>
		</View>
	)
}

const BodyTermsOfUse: React.FC<{}> = () => {
	const { padding, flex, margin } = useStyles()
	return (
		<View
			style={[
				padding.medium,
				flex.tiny,
				margin.bottom.small,
				margin.top.medium,
				margin.horizontal.medium,
			]}
		>
			<BodyTermsOfUseItem
				textProps='Berty Technologies (“Berty”) utilizes state-of-the-art security and end-to-end encryption to
			provide private messaging, Internet calling, and other services to users worldwide. You agree
			to our Terms of Service (“Terms”) by installing or using our apps, services, or website
			(together, “Services”).'
			/>
			<BodyTermsOfUseItem
				title='Minimum Age'
				textProps='You must be at least 13 years old to use our Services. The minimum age to use our Services
            without parental approval may be higher in your home country.'
			/>
			<BodyTermsOfUseItem
				title='Privacy of user data'
				textProps='Berty does not sell, rent or monetize your personal data or content in any way – ever.'
			/>
			<BodyTermsOfUseItem
				textProps='Please read our Privacy Policy to understand how we safeguard the information you provide
            when using our Services. For the purpose of operating our Services, you agree to our data
            practices as described in our Privacy Policy.'
			/>
			<BodyTermsOfUseItem
				title='Software'
				textProps='In order to enable new features and enhanced functionality, you consent to downloading and
            installing updates to our Services.'
			/>
			<BodyTermsOfUseItem
				title='Fees and Taxes'
				textProps='You are responsible for data and mobile carrier fees and taxes associated with the devices
            on which you use our Services.'
			/>
		</View>
	)
}

export const TermsOfUse: ScreenFC<'Settings.TermsOfUse'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<ScrollView bounces={false}>
				<BodyTermsOfUse />
			</ScrollView>
		</Layout>
	)
}
