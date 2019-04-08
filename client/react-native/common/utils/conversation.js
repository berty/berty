import { btoa, atob } from 'b64-lite'

import { BertyEntityContactInputStatus } from '../graphql/enums.gen'

export default {
  id: '',
  title: '',
  topic: '',
  infos: '',
}

export const getTitle = ({ title, members }) =>
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

export const isReadByMe = ({ wroteAt, members }) => {
  const myself = members.find(
    _ => _.contact && _.contact.status === BertyEntityContactInputStatus.Myself
  )
  if (myself == null) {
    return true
  }
  return new Date(myself.readAt).getTime() >= new Date(wroteAt).getTime()
}

export const isMessageReadByMe = ({ members }, { createdAt }) => {
  const myself = members.find(
    _ => _.contact && _.contact.status === BertyEntityContactInputStatus.Myself
  )
  if (myself == null) {
    return true
  }
  return new Date(myself.readAt).getTime() >= new Date(createdAt).getTime()
}

export const isReadByOthers = message =>
  message.dispatches &&
  message.dispatches.some(_ => new Date(_.ackedAt).getTime() > 0)
