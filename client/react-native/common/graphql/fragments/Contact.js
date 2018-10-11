import { graphql, createFragmentContainer } from 'react-relay'

export default component =>
  createFragmentContainer(
    component,
    graphql`
      fragment Contact on BertyEntityContact {
        id
        createdAt
        updatedAt
        deletedAt
        sigchain
        status
        devices {
          id
          createdAt
          updatedAt
          deletedAt
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
