export default {
  id: '',
  title: '',
  topic: '',
}

export const getTitle = ({ title, members } = this.props) =>
  (title && title !== '' && title) ||
  members
    .map((m, index) => {
      const displayName =
        m.contact && m.contact.status === 42
          ? 'Myself'
          : (m.contact &&
              (m.contact.overrideDisplayName || m.contact.displayName)) ||
            '?????'
      const before =
        index === 0 ? '' : index === members.length - 1 ? ' and ' : ', '
      return `${before}${displayName}`
    })
    .join('')
