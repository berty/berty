import { BertyEntityContactInputStatus } from '../../enums.gen'
import tDate from '../timestampDate'

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

export const isReadByMe = ({ wroteAt, members }) => {
  const myself = members.find(
    _ => _.contact && _.contact.status === BertyEntityContactInputStatus.Myself
  )
  if (myself == null) {
    return true
  }
  return tDate(myself.readAt).getTime() >= tDate(wroteAt).getTime()
}

export const isMessageReadByMe = ({ members }, { createdAt }) => {
  const myself = members.find(
    _ => _.contact && _.contact.status === BertyEntityContactInputStatus.Myself
  )
  if (myself == null) {
    return true
  }
  return tDate(myself.readAt).getTime() >= tDate(createdAt).getTime()
}

export const isReadByOthers = message =>
  message.dispatches &&
  message.dispatches.some(_ => tDate(_.ackedAt).getTime() > 0)

export const messageHasError = message =>
  message.dispatches.some(
    _ => _.sendErrorMessage != null && _.sendErrorMessage !== ''
  )
