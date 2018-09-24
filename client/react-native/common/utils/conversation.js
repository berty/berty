export const getTitle = ({ title, members } = this.props) =>
  title ||
  members
    .map((m, index) => {
      const displayName =
        m.contact.status === 'Myself'
          ? m.contact.status
          : m.contact.overrideDisplayName || m.contact.displayName
      const before =
        index === 0 ? '' : index === members.length - 1 ? ' and ' : ', '
      return `${before}${displayName}`
    })
    .join('')
