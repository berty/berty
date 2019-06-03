import { Mutex } from 'async-mutex'
import { debounce, throttle } from 'throttle-debounce'
import { Component } from 'react'
import objectHash from 'object-hash'

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

    stream.on('data', response => {
      this.props.response(queue, response)
      this.setStateDebounce({ queue })
    })
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
  cursor = ''
  count = 0
  loading = true

  retry = () => {
    this.loading = true
    this.forceUpdate()
    this.cursor = ''
    this.queue = []
    this.invokeHashTable = {}
    this.invoke()
  }

  add = change => {
    const { newValue } = change

    // delete item from list if not equal with filter
    if (!deepFilterEqual(this.filter, newValue)) {
      this.delete({ ...change, oldValue: newValue })
      return
    }

    // if item exist, update it
    const index = this.queue.findIndex(item => newValue.id === item.id)
    if (index !== -1) {
      this.queue.splice(index, 1, newValue)
      return
    }

    // else find where to put the new item
    const cursorField = this.paginate.sortedBy || 'id'
    const cursor = newValue[cursorField]

    for (let topIndex in this.queue) {
      let itemTop = this.queue[topIndex]
      let infTop = cursor <= itemTop[cursorField]
      if (infTop) {
        this.queue.splice(topIndex, 0, newValue)
        return
      }
      let bottomIndex = this.queue.length - topIndex - 1
      let itemBottom = this.queue[bottomIndex]
      let infBottom = cursor <= itemBottom[cursorField]
      if (infBottom) {
        this.queue.splice(bottomIndex, 0, newValue)
        return
      }
    }

    // if forced to add, push it
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

  observe = async change => {
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
    this.smartForceUpdate()
  }

  smartForceUpdateMutex = new Mutex()
  smartForceUpdate = async () => {
    if (this.smartForceUpdateMutex.isLocked()) {
      return
    }
    const release = await this.smartForceUpdateMutex.acquire()
    this.forceUpdateDebounced(release)
  }
  forceUpdateDebounced = debounce(16, this.forceUpdate)

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
      return this.props.paginate({
        cursor: this.cursor,
        count: this.queue.length,
      })
    }
    return {
      first: 10,
      after: this.cursor,
    }
  }

  invokeHashTable = {}
  invoke = async () => {
    const queue = []

    const request = this.request
    const requestHash = objectHash(request)
    if (this.invokeHashTable[requestHash]) {
      return
    }
    this.invokeHashTable[requestHash] = true

    this.loading = true
    const stream = await this.service(request)

    stream.on('data', response => {
      queue.push(response)
      this.observe({
        type: 'add',
        newValue: response,
        name: response.id,
        force: true,
      })
    })

    stream.on('end', () => {
      this.loading = false
      if (queue.length !== 0) {
        this.cursor = queue[queue.length - 1][this.paginate.sortedBy || 'id']
      }
      this.smartForceUpdate()
    })
  }

  render () {
    if (this.props.fallback && this.loading && this.queue.length === 0) {
      return this.props.fallback
    }
    return this.props.children({
      queue: this.queue,
      paginate: this.invoke,
      count: this.queue.length,
      loading: this.loading,
      retry: this.retry,
    })
  }
}

export default Stream
