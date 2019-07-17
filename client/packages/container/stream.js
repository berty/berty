import { Mutex } from 'async-mutex'
import { debounce } from 'throttle-debounce'
import { Component } from 'react'
import objectHash from 'object-hash'
import { deepFilterEqual, deepEqual } from './helper'
import Case from 'case'

export class Stream extends Component {
  get method() {
    return this.props.method || function() {}
  }

  get request() {
    return this.props.request || {}
  }

  get response() {
    return this.props.response ? this.props.response : (queue, data) => [data]
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

  queue = []

  componentDidMount() {
    this.invoke()
  }

  componentWillUnmount() {}

  invoke = async () => {
    this.loading = true
    const stream = await this.method(this.request)

    stream.on('data', response => {
      this.setStateDebounce({
        queue: this.response(this.queue, response),
      })
    })
    stream.on('end', () => {
      this.loading = false
      this.forceUpdate()
    })
  }

  setStateDebounce = debounce(16, this.setState)

  retry = () => {
    this.queue = []
    this.forceUpdate(this.invoke)
  }

  render() {
    if (this.props.fallback && this.loading && this.queue.length === 0) {
      return this.props.fallback
    }
    return this.props.children({
      queue: this.queue,
      count: this.queue.length,
      loading: this.loading,
      retry: this.retry,
    })
  }
}

export class StreamPagination extends Stream {
  queue = []

  cursor = ''

  count = 0

  loading = true

  disposeMap = {}

  componentDidMount() {
    super.componentDidMount()
    this.dispose = this.store.observe(this.observe)
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    this.dispose()
  }

  componentWillReceiveProps(props) {
    if (!deepEqual(props, this.props)) {
      this.retry()
    }
  }

  retry = () => {
    this.loading = true
    this.cursor = ''
    this.queue = []
    this.invokeHashTable = {}
    this.forceUpdate(this.invoke)
  }

  cursorExtractor = item =>
    this.props.cursorExtractor
      ? this.props.cursorExtractor(item)
      : item[Case.camel(this.paginate.orderBy || 'id')]

  compareInf = (a, b) => (this.paginate.orderDesc ? a >= b : a <= b)

  compareSup = (a, b) => (this.paginate.orderDesc ? a < b : a > b)

  change = change => {
    const { newValue, oldValue, type } = change

    const item = newValue || oldValue
    const index = this.queue.findIndex(_ => _.id === item.id)

    // delete item from list if not equal with filter
    if (type === 'delete' || !deepFilterEqual(this.filter, item)) {
      if (index !== -1) {
        this.queue.splice(index, 1)
      }
      return
    }

    // get the item cursor
    const cursor = this.cursorExtractor(item)

    // if item exist and cursor has not changed, just update it
    if (index !== -1 && cursor === this.cursorExtractor(this.queue[index])) {
      this.queue.splice(index, 1, item)
      return
    }

    // else find new index of item
    let newIndex = this.queue.length ? -1 : 0
    for (let topIndex in this.queue) {
      let itemTop = this.queue[topIndex]
      let infTop = this.compareInf(cursor, this.cursorExtractor(itemTop))
      if (infTop) {
        newIndex = topIndex
        break
      }
      let bottomIndex = this.queue.length - topIndex - 1
      let itemBottom = this.queue[bottomIndex]
      let supBottom = this.compareSup(cursor, this.cursorExtractor(itemBottom))
      if (supBottom) {
        newIndex = bottomIndex + 1
        break
      }
    }

    // if no position has been found, quit
    if (newIndex === -1) {
      console.warn('no position found for item', this.queue, item)
      return
    }

    // if item must be at end check that it has been forced
    if (!change.force && newIndex === this.queue.length) {
      if (this.queue.length < this.paginate.first) {
        this.invoke()
      }
      return
    }

    // if item is not in queue, add it
    if (index === -1) {
      this.queue.splice(newIndex, 0, item)
      return
    }

    // else update the queue
    const min = Math.min(index, newIndex)
    const max = Math.max(index, newIndex)

    if (index === min) {
      this.queue.slice(
        min,
        max - min + 1,
        ...this.queue.slice(min + 1, max + 1),
        item
      )
    } else {
      this.queue.slice(min, max - min + 1, item, ...this.queue.slice(min, max))
    }
  }

  observe = change => {
    this.change(change)
    if (this.queue.length) {
      if (this.queue[this.queue.length - 1] % this.paginate.first === 0) {
        this.cursor = this.queue[this.queue.length - 1][
          Case.camel(this.paginate.orderBy || 'id')
        ]
      }
    } else {
      this.cursor = ''
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

  get request() {
    const {
      fallback,
      children,
      context,
      request,
      response,
      filter,
      paginate,
      cursorExtractor,
      ...props
    } = this.props
    return { filter: this.filter, paginate: this.paginate, ...props }
  }

  get filter() {
    if (this.props.filter) {
      return this.props.filter
    }
    return {}
  }

  get paginate() {
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
    const stream = await this.method(request)

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
      this.cursor = this.queue.length
        ? this.queue[this.queue.length - 1][
            Case.camel(this.paginate.orderBy || 'id')
          ]
        : ''
      this.smartForceUpdate()
      this.invokeHashTable[requestHash] = false
    })
  }

  render() {
    if (this.props.fallback && this.loading && this.queue.length === 0) {
      return this.props.fallback
    }
    return this.props.children({
      queue: this.queue,
      paginate: this.invoke,
      count: this.queue.length,
      cursor: this.cursor,
      loading: this.loading,
      retry: this.retry,
    })
  }
}

export default Stream
