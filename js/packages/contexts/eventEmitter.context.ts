import { createContext } from 'react'
import { EventEmitter } from 'events'

export const EventEmitterContext = createContext(new EventEmitter())
