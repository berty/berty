import Foundation

// MARK: - Queue Manager

class BertyQueueManager {
    static let shared = BertyQueueManager()

    // Dedicated queues for different operations
    let bridgeQueue = DispatchQueue(label: "tech.berty.bridge", qos: .userInitiated)
    let streamQueue = DispatchQueue(label: "tech.berty.stream", qos: .userInitiated)
    let promiseQueue = DispatchQueue(label: "tech.berty.promise", qos: .userInitiated)
    let eventQueue = DispatchQueue(label: "tech.berty.event", qos: .utility)
    let backgroundQueue = DispatchQueue(label: "tech.berty.background", qos: .background)
    let keystoreQueue = DispatchQueue(label: "tech.berty.keystore", qos: .userInitiated)
    let bleQueue = DispatchQueue(label: "tech.berty.ble", qos: .userInitiated)

    // Serial queues for critical sections
    let stateQueue = DispatchQueue(label: "tech.berty.state")
    let memoryQueue = DispatchQueue(label: "tech.berty.memory")

    // Concurrent queue for read operations
    let readQueue = DispatchQueue(label: "tech.berty.read", attributes: .concurrent)

    // High priority queue for time-sensitive operations
    let priorityQueue = DispatchQueue(label: "tech.berty.priority", qos: .userInteractive)

    private init() {}

    // MARK: - Queue Operations

    func executeOnBridge<T>(_ block: @escaping () throws -> T, completion: @escaping (Result<T, Error>) -> Void) {
        bridgeQueue.async {
            do {
                let result = try block()
                DispatchQueue.main.async {
                    completion(.success(result))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
    }

    func executeOnStream<T>(_ block: @escaping () throws -> T, completion: @escaping (Result<T, Error>) -> Void) {
        streamQueue.async {
            do {
                let result = try block()
                DispatchQueue.main.async {
                    completion(.success(result))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
    }

    func executeOnPriority<T>(_ block: @escaping () throws -> T, completion: @escaping (Result<T, Error>) -> Void) {
        priorityQueue.async {
            do {
                let result = try block()
                DispatchQueue.main.async {
                    completion(.success(result))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
    }

    // MARK: - Synchronous Operations

    func synchronouslyOnState<T>(_ block: () throws -> T) rethrows -> T {
        return try stateQueue.sync {
            try block()
        }
    }

    func synchronouslyOnMemory<T>(_ block: () throws -> T) rethrows -> T {
        return try memoryQueue.sync {
            try block()
        }
    }

    // MARK: - Barrier Operations

    func barrierOnRead(_ block: @escaping () -> Void) {
        readQueue.async(flags: .barrier) {
            block()
        }
    }

    // MARK: - Delayed Operations

    func executeAfterDelay(on queue: DispatchQueue? = nil, delay: TimeInterval, block: @escaping () -> Void) {
        let targetQueue = queue ?? DispatchQueue.main
        targetQueue.asyncAfter(deadline: .now() + delay) {
            block()
        }
    }
}

// MARK: - Thread-Safe Collections

class ThreadSafeArray<Element> {
    private var array: [Element] = []
    private let queue = DispatchQueue(label: "tech.berty.array", attributes: .concurrent)

    var count: Int {
        queue.sync { array.count }
    }

    func append(_ element: Element) {
        queue.async(flags: .barrier) {
            self.array.append(element)
        }
    }

    func remove(at index: Int) -> Element? {
        queue.sync(flags: .barrier) {
            guard index < array.count else { return nil }
            return array.remove(at: index)
        }
    }

    func removeAll(where predicate: @escaping (Element) -> Bool) {
        queue.async(flags: .barrier) {
            self.array.removeAll(where: predicate)
        }
    }

    func first(where predicate: (Element) -> Bool) -> Element? {
        queue.sync {
            array.first(where: predicate)
        }
    }

    func forEach(_ body: (Element) -> Void) {
        queue.sync {
            array.forEach(body)
        }
    }

    func map<T>(_ transform: (Element) -> T) -> [T] {
        queue.sync {
            array.map(transform)
        }
    }

    subscript(index: Int) -> Element? {
        get {
            queue.sync {
                guard index < array.count else { return nil }
                return array[index]
            }
        }
        set {
            queue.async(flags: .barrier) {
                guard index < self.array.count, let newValue = newValue else { return }
                self.array[index] = newValue
            }
        }
    }
}

class ThreadSafeDictionary<Key: Hashable, Value> {
    private var dictionary: [Key: Value] = [:]
    private let queue = DispatchQueue(label: "tech.berty.dictionary", attributes: .concurrent)

    var count: Int {
        queue.sync { dictionary.count }
    }

    var keys: [Key] {
        queue.sync { Array(dictionary.keys) }
    }

    var values: [Value] {
        queue.sync { Array(dictionary.values) }
    }

    func set(_ value: Value?, for key: Key) {
        queue.async(flags: .barrier) {
            self.dictionary[key] = value
        }
    }

    func get(_ key: Key) -> Value? {
        queue.sync { dictionary[key] }
    }

    func removeValue(for key: Key) -> Value? {
        queue.sync(flags: .barrier) {
            dictionary.removeValue(forKey: key)
        }
    }

    func removeAll() {
        queue.async(flags: .barrier) {
            self.dictionary.removeAll()
        }
    }

    subscript(key: Key) -> Value? {
        get { get(key) }
        set { set(newValue, for: key) }
    }
}

// MARK: - Atomic Properties

@propertyWrapper
class Atomic<Value> {
    private var value: Value
    private let queue = DispatchQueue(label: "tech.berty.atomic", attributes: .concurrent)

    init(wrappedValue value: Value) {
        self.value = value
    }

    var wrappedValue: Value {
        get { queue.sync { value } }
        set { queue.async(flags: .barrier) { self.value = newValue } }
    }

    func mutate(_ mutation: @escaping (inout Value) -> Void) {
        queue.async(flags: .barrier) {
            mutation(&self.value)
        }
    }
}
