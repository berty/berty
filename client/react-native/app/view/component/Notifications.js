import React, { PureComponent } from 'react'
import { withStoreContext } from '@berty/store/context'
import { Store } from '@berty/container'
import { deepFilterEqual } from '@berty/container/helper'
import Kind from '@berty/bridge/service/entity/kind'
import Event from '@berty/bridge/service/entity/event'
import Case from 'case'
import { Mutex } from 'async-mutex'
import { debounce } from 'throttle-debounce'
import tDate from '@berty/common/helpers/timestampDate'
import { conversation } from '@berty/common/helpers/entity'

@withStoreContext
export class Notifications extends PureComponent {
  static defaultProps = {
    target: null, // id of specific target
    entity: null, // 'contact' or 'conversation'
    kind: null, // event kind name
    reduce: (queue, data) => [...queue, data],
    children: () => null,
  }

  queue = []

  smartForceUpdateMutex = new Mutex()
  smartForceUpdate = async () => {
    if (this.smartForceUpdateMutex.isLocked()) {
      return
    }
    const release = await this.smartForceUpdateMutex.acquire()
    this.forceUpdateDebounced(release)
  }
  forceUpdateDebounced = debounce(16, this.forceUpdate)

  update = (_, data) => {
    this.queue = this.props.reduce(this.queue, data)
    this.smartForceUpdate()
  }

  render() {
    const { children, target, entity, kind } = this.props

    const filter = {
      direction: Event.Direction.Incoming,
      targetAddr: target,
      targetType: entity
        ? Event.TargetType[`ToSpecific${Case.pascal(entity)}`]
        : null,
      kind: Kind.values[kind],
    }
    return (
      <>
        <Store.Node.Service.EventList
          request={{
            filter,
            paginate: {
              first: 99,
            },
          }}
          response={this.update}
        />
        <Store.Node.Service.CommitLogStream
          response={(_, data) => {
            data = data.entity.event
            if (
              data &&
              this.queue.length !== 99 &&
              deepFilterEqual(filter, data)
            ) {
              this.update(_, data)
            }
            return _
          }}
        />
        {children(this.queue, this.queue.length)}
      </>
    )
  }
}

@withStoreContext
export class ContactsNotifications extends PureComponent {
  static defaultProps = {
    kind: null,
    children: () => null,
  }

  render() {
    const { children, kind } = this.props
    return (
      <Notifications
        entity={'contact'}
        kind={kind}
        reduce={(queue, data) => {
          // remove duplicates
          queue = queue.filter(
            _ =>
              _.sourceContactID !== data.sourceContactID && _.kind !== data.kind
          )
          queue.push(data)
          return queue
        }}
      >
        {children}
      </Notifications>
    )
  }
}
Notifications.Contacts = ContactsNotifications

@withStoreContext
export class ConversationsNotifications extends PureComponent {
  static defaultProps = {
    children: () => null,
  }

  render() {
    const { children } = this.props
    return (
      <Store.Node.Service.ConversationList.Pagination
        paginate={({ cursor }) => ({
          first: 1000,
          after: cursor
            ? tDate(cursor).toISOString()
            : new Date(Date.now()).toISOString(),
          orderBy: 'wrote_at',
          orderDesc: true,
        })}
        cursorExtractor={item => tDate(item.wroteAt).getTime()}
      >
        {({ queue, paginate }) => {
          const notifications = queue.filter(_ => !conversation.isReadByMe(_))
          return children(notifications, notifications.length)
        }}
      </Store.Node.Service.ConversationList.Pagination>
    )
  }
}
Notifications.Conversations = ConversationsNotifications

export default Notifications
