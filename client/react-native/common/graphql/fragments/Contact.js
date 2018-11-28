import { graphql, createFragmentContainer } from 'react-relay'

export default component =>
  createFragmentContainer(
    component,
    graphql`
      fragment Contact on BertyEntityContact {
        id
        createdAt
        updatedAt
        sigchain
        status
        devices {
          id
          createdAt
          updatedAt
          name
          status
          apiVersion
          contactId
        }
        displayName
        displayStatus
        overrideDisplayName
        overrideDisplayStatus
      }
    `
  )
