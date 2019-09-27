import { configure, storiesOf } from '@storybook/react'
import bertyStories from '@berty-tech/berty-storybook'
import sharedStories from '@berty-tech/shared-storybook'

configure(
  () =>
    [bertyStories, sharedStories].forEach((storybook) =>
      storybook({ storiesOf })
    ),
  module
)
