import Foundation

/// Singleton class to manage activity background state for iOS
/// Coordinates with the app's background persistence needs
class ActivityBackgroundState {
    static let shared = ActivityBackgroundState()

    // State tracking
    private(set) var isActivityActive = false
    private var activityId: String?
    private var activityName: String?

    private init() {
        // Private initializer for singleton
    }

    /// Start activity background mode
    /// Called when an active activity is detected that requires background persistence
    func startActivityBackgroundMode(activityId: String, activityName: String) {
        self.isActivityActive = true
        self.activityId = activityId
        self.activityName = activityName

        print("ActivityBackgroundState: Started background mode for activity \(activityId)")
    }

    /// Stop activity background mode
    /// Called when activity becomes inactive
    func stopActivityBackgroundMode() {
        self.isActivityActive = false
        self.activityId = nil
        self.activityName = nil

        print("ActivityBackgroundState: Stopped background mode")
    }

    /// Get current activity ID if active
    func getCurrentActivityId() -> String? {
        return activityId
    }

    /// Get current activity name if active
    func getCurrentActivityName() -> String? {
        return activityName
    }
}

/// Bridge class for native communication
@objc class ActivityBackgroundStateBridge: NSObject {
    private let activityState = ActivityBackgroundState.shared

    @objc func startActivityBackgroundMode(activityId: String, activityName: String) {
        activityState.startActivityBackgroundMode(activityId: activityId, activityName: activityName)
    }

    @objc func stopActivityBackgroundMode() {
        activityState.stopActivityBackgroundMode()
    }

    @objc func isActivityActive() -> Bool {
        return activityState.isActivityActive
    }
}
