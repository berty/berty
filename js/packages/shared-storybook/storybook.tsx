import React, { Fragment } from 'react'
import { storiesOf } from '@storybook/react'
import Example from './Example'

storiesOf('Shared Library', module).add('Example', () => (
	<Fragment>
		<Example name='World' />
		<Example name=':)' />
	</Fragment>
))
