import { btoa, atob } from 'b64-lite'

export default {
  id: '',
  title: '',
  topic: '',
  infos: '',
}

export const getTitle = ({ title, members } = this.props) =>
  (title && title !== '' && title) ||
  (members &&
    members
      .filter(m => m.contact && m.contact.status !== 42)
      .map((m, index) => {
        const displayName =
          m.contact &&
          (m.contact.overrideDisplayName || m.contact.displayName || '?????')
        const before =
          index === 0 ? '' : index === members.length - 1 ? ' and ' : ', '
        return `${before}${displayName}`
      })
      .join('')) ||
  'No name'

export const getRelayID = id => btoa(`conversation:${id}`)
export const getCoreID = id => atob(id).match(/:(.*)$/)[1]
