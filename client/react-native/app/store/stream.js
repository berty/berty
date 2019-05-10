import { Mutex } from 'async-mutex'
import { debounce, throttle } from 'throttle-debounce'

import { Component } from 'react'

export class Stream extends Component {
  get service () {
    return this.props.service || async function * () {}
  }
  get request () {
    return this.props.request
  }
  get response () {
    return this.props.response
  }

  static defaultProps = {
    request: {},
    response: (queue, data) => {
      queue.length = 0
      queue.push(data)
    },
    fallback: null,
    children: (data, index) => null,
  }

  state = {
    queue: null,
  }

  componentDidMount () {
    this.invoke()
  }

  invoke = async () => {
    const stream = await this.service(this.request)
    const queue = []

    for await (const response of stream) {
      this.props.response(queue, response)
      this.setStateDebounce({ queue })
    }
  }

  setStateDebounce = debounce(50, this.setState)
  setStateDebounce = throttle(50, this.setState)

  render () {
    if (this.state.queue == null) {
      return this.props.fallback
    }
    return this.state.queue.map(this.props.children)
  }
}

const deepFilterEqual = (a, b) => {
  if (!a) {
    return true
  }
  if (typeof a !== typeof b) {
    return false
  }
  switch (typeof a) {
    case 'object':
      if (Array.isArray(a)) {
        return a.every(av => b.some(bv => deepFilterEqual(av, bv)))
      }
      return Object.keys(a).every(k => deepFilterEqual(a[k], b[k]))
    default:
      return a === b
  }
}

export class StreamPagination extends Stream {
  queue = []
  queueMutex = new Mutex()
  cursor = ''
  count = 0
  loading = true

  retry = () => {
    this.queue = []
    this.cursor = ''
    this.count = 0
    this.loading = true
    this.forceUpdate()
  }

  add = change => {
    const { newValue } = change
    // compare with filter
    if (!deepFilterEqual(this.filter, newValue)) {
      this.delete({ ...change, oldValue: newValue })
      return
    }

    const index = this.queue.findIndex(item => item.id === newValue.id)
    if (index !== -1) {
      this.queue.splice(index, 1, newValue)
      return
    }

    const cursorField = this.paginate.sortedBy || 'id'
    const cursor = newValue[cursorField]

    for (const index in this.queue) {
      const item = this.queue[index]
      const inf = cursor <= item[cursorField]
      if (inf) {
        this.queue.splice(index, 0, newValue)
        return
      }
    }

    if (change.force) {
      this.queue.push(newValue)
    }
  }

  update = change => {
    this.add(change)
  }

  delete = change => {
    const { oldValue } = change

    const index = this.queue.findIndex(item => item.id === oldValue.id)
    if (index === -1) {
      return
    }
    this.queue.splice(index, 1)
  }

  forceUpdateDebounce = debounce(50, this.forceUpdate)

  observe = async change => {
    const release = await this.queueMutex.acquire()
    const { type } = change
    switch (type) {
      case 'add':
        this.add(change)
        break
      case 'update':
        this.update(change)
        break
      case 'delete':
        this.delete(change)
        break
      default:
    }
    this.count = this.queue.length
    release()
    this.forceUpdateDebounce()
  }

  get request () {
    return { filter: this.filter, paginate: this.paginate }
  }

  get filter () {
    if (this.props.filter) {
      return this.props.filter
    }
    return {}
  }

  get paginate () {
    if (this.props.paginate) {
      return this.props.paginate({ cursor: this.cursor, count: this.count })
    }
    return {
      first: 10,
      after: this.cursor,
    }
  }

  invokeMutex = new Mutex()
  invoke = async () => {
    const queue = []

    let release = await this.invokeMutex.acquire()
    this.loading = true
    for await (const response of await this.service(this.request)) {
      queue.push(response)
      this.observe({
        type: 'add',
        newValue: response,
        name: response.id,
        force: true,
      })
    }
    this.loading = false
    if (queue.length === 0) {
      release()
      return
    }
    this.cursor = queue[queue.length - 1][this.paginate.sortedBy || 'id']
    release()
  }

  render () {
    if (this.loading && this.count === 0) {
      return this.props.fallback
    }
    return this.props.children({
      queue: this.queue,
      paginate: this.invoke,
      count: this.count,
      loading: this.loading,
      retry: this.retry,
    })
  }
}

export default Stream
