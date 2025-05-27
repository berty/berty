import { EventEmitter } from 'events'
import { createContext } from 'react'

export const EventEmitterContext = createContext(new EventEmitter())
