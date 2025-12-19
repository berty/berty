package tech.berty.bertybridgeexpo.notification

object FcmBus {
    interface Listener { fun onMessage(data: Map<String, String>) }

    @Volatile private var listener: Listener? = null
    private val pending = mutableListOf<Map<String, String>>()

    fun setListener(l: Listener?) {
        listener = l
        // flush any pending events after JS starts observing
        if (l != null) synchronized(pending) {
            pending.forEach { l.onMessage(it) }
            pending.clear()
        }
    }

    fun emit(data: Map<String, String>) {
        val l = listener
        if (l != null) l.onMessage(data)
        else synchronized(pending) { pending.add(data) }
    }
}
