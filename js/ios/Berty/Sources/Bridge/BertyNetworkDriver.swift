import Foundation
import Network

// MARK: - Network Interface Protocol
protocol BertyNetworkDriverProtocol {
    func getAvailableInterfaces() -> [BertyNetworkInterface]
    func startNetworkMonitoring()
    func stopNetworkMonitoring()
    func isNetworkAvailable() -> Bool
    func getCurrentConnectionType() -> BertyConnectionType
    func getMDNSCapability() -> Bool
}

// MARK: - Network Interface Model
struct BertyNetworkInterface {
    let name: String
    let displayName: String
    let type: BertyInterfaceType
    let isActive: Bool
    let ipv4Address: String?
    let ipv6Address: String?
    let mtu: Int
    let supportsMDNS: Bool
}

// MARK: - Network Types
enum BertyInterfaceType {
    case wifi
    case cellular
    case ethernet
    case loopback
    case other
}

enum BertyConnectionType {
    case none
    case wifi
    case cellular
    case ethernet
    case unknown
}

// MARK: - Network Driver
class BertyNetworkDriver: NSObject, BertyNetworkDriverProtocol {
    static let shared = BertyNetworkDriver()

    private var networkMonitor: NWPathMonitor?
    private var monitorQueue: DispatchQueue
    private var currentPath: NWPath?
    private var networkStatusCallback: ((BertyConnectionType, Bool) -> Void)?

    private var interfaces: [BertyNetworkInterface] = []
    private var isMonitoring = false

    override init() {
        self.monitorQueue = DispatchQueue(label: "BertyNetworkMonitor", qos: .utility)
        super.init()
        updateNetworkInterfaces()
    }

    deinit {
        stopNetworkMonitoring()
    }

    // MARK: - Public Interface

    func getAvailableInterfaces() -> [BertyNetworkInterface] {
        updateNetworkInterfaces()
        return interfaces
    }

    func startNetworkMonitoring() {
        guard !isMonitoring else { return }

        networkMonitor = NWPathMonitor()
        networkMonitor?.pathUpdateHandler = { [weak self] path in
            self?.handleNetworkPathUpdate(path)
        }
        networkMonitor?.start(queue: monitorQueue)
        isMonitoring = true

        print("BertyNetworkDriver: Started network monitoring")
    }

    func stopNetworkMonitoring() {
        networkMonitor?.cancel()
        networkMonitor = nil
        isMonitoring = false

        print("BertyNetworkDriver: Stopped network monitoring")
    }

    func isNetworkAvailable() -> Bool {
        return currentPath?.status == .satisfied
    }

    func getCurrentConnectionType() -> BertyConnectionType {
        guard let path = currentPath, path.status == .satisfied else {
            return .none
        }

        if path.usesInterfaceType(.wifi) {
            return .wifi
        } else if path.usesInterfaceType(.cellular) {
            return .cellular
        } else if path.usesInterfaceType(.wiredEthernet) {
            return .ethernet
        } else {
            return .unknown
        }
    }

    func getMDNSCapability() -> Bool {
        // MDNS is generally available on iOS except in some restricted network environments
        let connectionType = getCurrentConnectionType()

        switch connectionType {
        case .wifi, .ethernet:
            return true
        case .cellular:
            // Cellular networks typically don't support mDNS properly
            return false
        case .none, .unknown:
            return false
        }
    }

    // MARK: - Network Path Handling

    private func handleNetworkPathUpdate(_ path: NWPath) {
        currentPath = path
        updateNetworkInterfaces()

        let connectionType = getCurrentConnectionType()
        let isAvailable = path.status == .satisfied

        print("BertyNetworkDriver: Network changed - Type: \(connectionType), Available: \(isAvailable)")

        // Notify callback if set
        DispatchQueue.main.async { [weak self] in
            self?.networkStatusCallback?(connectionType, isAvailable)
        }
    }

    // MARK: - Interface Discovery

    private func updateNetworkInterfaces() {
        var newInterfaces: [BertyNetworkInterface] = []

        // Get system network interfaces
        var ifaddrs: UnsafeMutablePointer<ifaddrs>?

        guard getifaddrs(&ifaddrs) == 0 else {
            print("BertyNetworkDriver: Failed to get network interfaces")
            return
        }

        defer {
            freeifaddrs(ifaddrs)
        }

        var currentInterface = ifaddrs
        while currentInterface != nil {
            defer {
                currentInterface = currentInterface?.pointee.ifa_next
            }

            guard let interface = currentInterface?.pointee else { continue }

            let name = String(cString: interface.ifa_name)
            let flags = interface.ifa_flags

            // Skip if interface is not up
            guard (flags & UInt32(IFF_UP)) != 0 else { continue }

            let interfaceType = determineInterfaceType(name: name)
            let isActive = (flags & UInt32(IFF_RUNNING)) != 0

            var ipv4Address: String?
            var ipv6Address: String?
            var mtu = 0

            // Get IP addresses
            if let addr = interface.ifa_addr {
                switch addr.pointee.sa_family {
                case UInt8(AF_INET):
                    var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
                    if getnameinfo(addr, socklen_t(addr.pointee.sa_len),
                                   &hostname, socklen_t(hostname.count),
                                   nil, 0, NI_NUMERICHOST) == 0 {
                        ipv4Address = String(cString: hostname)
                    }
                case UInt8(AF_INET6):
                    var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
                    if getnameinfo(addr, socklen_t(addr.pointee.sa_len),
                                   &hostname, socklen_t(hostname.count),
                                   nil, 0, NI_NUMERICHOST) == 0 {
                        ipv6Address = String(cString: hostname)
                    }
                default:
                    break
                }
            }

            // Get MTU (simplified - would need additional system calls for accurate MTU)
            mtu = getMTUForInterface(name: name)

            let networkInterface = BertyNetworkInterface(
                name: name,
                displayName: getDisplayName(for: name),
                type: interfaceType,
                isActive: isActive,
                ipv4Address: ipv4Address,
                ipv6Address: ipv6Address,
                mtu: mtu,
                supportsMDNS: supportsMDNS(interfaceType: interfaceType, name: name)
            )

            newInterfaces.append(networkInterface)
        }

        interfaces = newInterfaces
    }

    private func determineInterfaceType(name: String) -> BertyInterfaceType {
        switch name {
        case let n where n.hasPrefix("en"):
            // en0 is typically WiFi, en1+ can be ethernet
            return name == "en0" ? .wifi : .ethernet
        case let n where n.hasPrefix("pdp_ip"):
            return .cellular
        case let n where n.hasPrefix("lo"):
            return .loopback
        case let n where n.hasPrefix("utun") || n.hasPrefix("ipsec"):
            return .other // VPN interfaces
        default:
            return .other
        }
    }

    private func getDisplayName(for interfaceName: String) -> String {
        switch interfaceName {
        case "en0":
            return "Wi-Fi"
        case "lo0":
            return "Loopback"
        case let name where name.hasPrefix("pdp_ip"):
            return "Cellular"
        case let name where name.hasPrefix("en"):
            return "Ethernet"
        case let name where name.hasPrefix("utun"):
            return "VPN"
        default:
            return interfaceName.capitalized
        }
    }

    private func getMTUForInterface(name: String) -> Int {
        // Simplified MTU detection - in a full implementation,
        // you'd use ioctl with SIOCGIFMTU to get actual MTU
        switch name {
        case let n where n.hasPrefix("en"):
            return 1500 // Standard Ethernet MTU
        case let n where n.hasPrefix("lo"):
            return 16384 // Loopback typically has larger MTU
        case let n where n.hasPrefix("pdp_ip"):
            return 1280 // Conservative cellular MTU
        default:
            return 1500
        }
    }

    private func supportsMDNS(interfaceType: BertyInterfaceType, name: String) -> Bool {
        switch interfaceType {
        case .wifi, .ethernet:
            return true
        case .cellular:
            return false // Cellular networks typically don't support mDNS
        case .loopback:
            return true
        case .other:
            return name.hasPrefix("utun") ? false : true // VPN might not support mDNS
        }
    }

    // MARK: - Network Quality Assessment

    func getNetworkQuality() -> BertyNetworkQuality {
        guard let path = currentPath, path.status == .satisfied else {
            return .none
        }

        // Basic quality assessment based on interface type
        if path.usesInterfaceType(.wifi) {
            return .good
        } else if path.usesInterfaceType(.wiredEthernet) {
            return .excellent
        } else if path.usesInterfaceType(.cellular) {
            return .fair // Could be enhanced with signal strength detection
        } else {
            return .poor
        }
    }

    // MARK: - Callback Registration

    func setNetworkStatusCallback(_ callback: @escaping (BertyConnectionType, Bool) -> Void) {
        networkStatusCallback = callback
    }

    // MARK: - P2P Network Support

    func canSupportP2PConnections() -> Bool {
        let connectionType = getCurrentConnectionType()

        switch connectionType {
        case .wifi:
            return true // WiFi typically allows P2P
        case .ethernet:
            return true // Ethernet allows P2P
        case .cellular:
            return false // Cellular networks typically use NAT
        case .none, .unknown:
            return false
        }
    }

    func getLocalNetworkAddresses() -> [String] {
        return interfaces.compactMap { interface in
            guard interface.isActive && interface.type != .loopback else { return nil }
            return interface.ipv4Address
        }.compactMap { $0 }
    }

    // MARK: - Debug Information

    func getNetworkDebugInfo() -> [String: Any] {
        var info: [String: Any] = [:]

        info["isMonitoring"] = isMonitoring
        info["isNetworkAvailable"] = isNetworkAvailable()
        info["connectionType"] = String(describing: getCurrentConnectionType())
        info["networkQuality"] = String(describing: getNetworkQuality())
        info["mdnsCapable"] = getMDNSCapability()
        info["p2pCapable"] = canSupportP2PConnections()

        let interfaceInfo = interfaces.map { interface in
            [
                "name": interface.name,
                "displayName": interface.displayName,
                "type": String(describing: interface.type),
                "isActive": interface.isActive,
                "ipv4": interface.ipv4Address ?? "none",
                "ipv6": interface.ipv6Address ?? "none",
                "mtu": interface.mtu,
                "supportsMDNS": interface.supportsMDNS
            ]
        }
        info["interfaces"] = interfaceInfo

        return info
    }
}

// MARK: - Network Quality Enum
enum BertyNetworkQuality {
    case none
    case poor
    case fair
    case good
    case excellent
}

// MARK: - Berty Native Net Driver Bridge
// This class implements the BertybridgeNativeNetDriver protocol from the framework
@objc class BertyNativeNetDriverBridge: NSObject {
    private let driver = BertyNetworkDriver.shared

    @objc func updateAddr(_ addrs: [String]) {
        // Implementation would update network addresses for the bridge
        print("BertyNativeNetDriverBridge: updateAddr called with \(addrs)")
    }

    @objc func getInterfaceAddrs() -> [String] {
        return driver.getLocalNetworkAddresses()
    }

    @objc func isConnected() -> Bool {
        return driver.isNetworkAvailable()
    }
}
