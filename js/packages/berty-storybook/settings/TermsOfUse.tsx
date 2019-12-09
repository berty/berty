import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { styles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'

//
// TermsOfUse
//

// Types
type BodyTermsOfUseItemProps = {
	text: string
	title?: string
}

// Styles
const _termsOfUseStyles = StyleSheet.create({
	itemTitleText: {
		fontSize: 15,
	},
	itemText: {
		fontSize: 12,
	},
})

const BodyTermsOfUseItem: React.FC<BodyTermsOfUseItemProps> = ({ text, title = null }) => (
	<View style={[styles.bigMarginTop]}>
		{title && <Text style={[styles.textBold, _termsOfUseStyles.itemTitleText]}>{title}</Text>}
		<Text style={[styles.fontFamily, _termsOfUseStyles.itemText]}>{text}</Text>
	</View>
)

const BodyTermsOfUse: React.FC<{}> = () => (
	<View
		style={[
			styles.padding,
			styles.flex,
			styles.littleMarginBottom,
			styles.marginLeft,
			styles.marginTop,
			styles.marginRight,
		]}
	>
		<BodyTermsOfUseItem
			text='Berty Technologies (“Berty”) utilizes state-of-the-art security and end-to-end encryption to
			provide private messaging, Internet calling, and other services to users worldwide. You agree
			to our Terms of Service (“Terms”) by installing or using our apps, services, or website
			(together, “Services”).'
		/>
		<BodyTermsOfUseItem
			title='Minimum Age'
			text='You must be at least 13 years old to use our Services. The minimum age to use our Services
            without parental approval may be higher in your home country.'
		/>
		<BodyTermsOfUseItem
			title='Privacy of user data'
			text='Berty does not sell, rent or monetize your personal data or content in any way – ever.'
		/>
		<BodyTermsOfUseItem
			text='Please read our Privacy Policy to understand how we safeguard the information you provide
            when using our Services. For the purpose of operating our Services, you agree to our data
            practices as described in our Privacy Policy.'
		/>
		<BodyTermsOfUseItem
			title='Software'
			text='In order to enable new features and enhanced functionality, you consent to downloading and
            installing updates to our Services.'
		/>
		<BodyTermsOfUseItem
			title='Fees and Taxes'
			text='You are responsible for data and mobile carrier fees and taxes associated with the devices
            on which you use our Services.'
		/>
	</View>
)

export const TermsOfUse: React.FC<{}> = () => (
	<Layout style={[styles.flex, styles.bgWhite]}>
		<ScrollView>
			<HeaderSettings title='Terms of use' desc='Last updated: August 29th 2019' />
			<BodyTermsOfUse />
		</ScrollView>
	</Layout>
)
