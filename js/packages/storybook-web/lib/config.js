import { configure, storiesOf } from '@storybook/react'

// import stories
configure(() => {
	require.context(__dirname + '/..', true, /.*-storybook\/storybook.tsx$/)
}, module)
