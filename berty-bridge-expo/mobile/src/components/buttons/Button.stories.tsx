import { storiesOf } from '@storybook/react-native'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { AppDecorator, Spacer, ScroolViewDecorator } from '../../../.storybook/preview'
import {
	ErrorButtonIconLeft,
	PrimaryButton,
	SecondaryAltButton,
	SecondaryButton,
	SecondaryButtonIconLeft,
	PrimaryFloatingButton,
	SecondaryButtonIconRight,
	PrimaryAltButton,
	TertiaryButtonIconLeft,
	TertiaryAltButton,
} from '../buttons'
// the buttons below are not yet being used in the APP and need to be imported directly:
import { ErrorButton } from './error/ErrorButton'
import { ErrorButtonIconRight } from './error/ErrorButtonIconRight'
import { SecondaryFloatingButton } from './floating-buttons/secondary/SecondaryFloatingButton'
import { PrimaryButtonIconLeft } from './primary/PrimaryButtonIconLeft'
import { PrimaryButtonIconRight } from './primary/PrimaryButtonIconRight'
import { TertiaryButton } from './tertiary/TertiaryButton'
import { TertiaryButtonIconRight } from './tertiary/TertiaryButtonIconRight'
import { VerticalButtons } from './vertical/VerticalButtons'

const onPress = () => console.log('onPress')

const PrimaryButtons = () => (
	<>
		<PrimaryButton onPress={onPress}>{'Primary'}</PrimaryButton>
		<Spacer />
		<PrimaryAltButton onPress={onPress}>{'Primary Alt Button'}</PrimaryAltButton>
		<Spacer />
		<PrimaryButtonIconLeft onPress={onPress}>{'Primary Button Icon Left'}</PrimaryButtonIconLeft>
		<Spacer />
		<PrimaryButtonIconRight onPress={onPress}>{'Primary Button Icon Right'}</PrimaryButtonIconRight>
		<Spacer />
	</>
)

const SecondaryButtons = () => (
	<>
		<SecondaryButton onPress={onPress}>{'Secondary'}</SecondaryButton>
		<Spacer />
		<SecondaryAltButton onPress={onPress}>{'Secondary Alt Button'}</SecondaryAltButton>
		<Spacer />
		<SecondaryButtonIconLeft onPress={onPress}>
			{'Secondary Button Icon Left'}
		</SecondaryButtonIconLeft>
		<Spacer />
		<SecondaryButtonIconRight onPress={onPress}>
			{'Secondary Button Icon Right'}
		</SecondaryButtonIconRight>
		<Spacer />
	</>
)

const TertiaryButtons = () => (
	<>
		<TertiaryButton onPress={onPress}>{'Tertiary Button'}</TertiaryButton>
		<Spacer />
		<TertiaryAltButton onPress={onPress}>{'Tertiary Alt Button'}</TertiaryAltButton>
		<Spacer />
		<TertiaryButtonIconLeft onPress={onPress}>
			{'Tertiary Button Icon Right'}
		</TertiaryButtonIconLeft>
		<Spacer />
		<TertiaryButtonIconRight onPress={onPress}>
			{'Tertiary Button Icon Right'}
		</TertiaryButtonIconRight>
		<Spacer />
	</>
)

const ErrorButtons = () => (
	<>
		<ErrorButton onPress={onPress}>{'Error Button'}</ErrorButton>
		<Spacer />
		<ErrorButtonIconLeft onPress={onPress}>{'Error Button Icon Left'}</ErrorButtonIconLeft>
		<Spacer />
		<ErrorButtonIconRight onPress={onPress}>{'Error Button Icon Left'}</ErrorButtonIconRight>
		<Spacer />
	</>
)

const FloatingButtons = () => (
	<>
		<PrimaryFloatingButton onPress={onPress} />
		<View style={styles.floatingButton}>
			<SecondaryFloatingButton onPress={onPress} />
		</View>
	</>
)

storiesOf('Components', module)
	.addDecorator(AppDecorator)
	.addDecorator(ScroolViewDecorator)
	.add('Buttons', () => (
		<>
			<PrimaryButtons />
			<Spacer />

			<SecondaryButtons />
			<Spacer />

			<TertiaryButtons />
			<Spacer />

			<ErrorButtons />
			<Spacer />

			<VerticalButtons
				children={['Vertical Buttons 1', 'Vertical Buttons 2']}
				onPressTop={onPress}
				onPressBottom={onPress}
			/>

			<FloatingButtons />
		</>
	))
	.add('Buttons Primary', () => <PrimaryButtons />)
	.add('Buttons Secondary', () => <SecondaryButtons />)
	.add('Buttons Tertiary', () => <TertiaryButtons />)
	.add('Buttons Error', () => <ErrorButtons />)
	.add('Buttons Floating', () => <FloatingButtons />)

const styles = StyleSheet.create({ floatingButton: { marginRight: 60, marginTop: 120 } })
