package com.kvl.track

import android.os.Handler
import android.os.Looper
import android.service.notification.NotificationListenerService as NLS
import android.service.notification.StatusBarNotification
import io.flutter.plugin.common.EventChannel

/**
 * Android [NotificationListenerService] that captures every notification posted
 * on the device and forwards it to Flutter via an [EventChannel] sink.
 *
 * The [sink] companion is populated in [MainActivity.configureFlutterEngine]:
 *
 * ```kotlin
 * EventChannel(messenger, "com.kvl.track/notification_events")
 *     .setStreamHandler(object : EventChannel.StreamHandler {
 *         override fun onListen(args: Any?, s: EventChannel.EventSink) {
 *             KvlNotificationListenerService.sink = s
 *         }
 *         override fun onCancel(args: Any?) {
 *             KvlNotificationListenerService.sink = null
 *         }
 *     })
 * ```
 *
 * The service must be declared in AndroidManifest.xml with:
 * ```xml
 * <service
 *     android:name=".KvlNotificationListenerService"
 *     android:label="KVL Track Notification Listener"
 *     android:exported="true"
 *     android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE">
 *     <intent-filter>
 *         <action android:name="android.service.notification.NotificationListenerService" />
 *     </intent-filter>
 * </service>
 * ```
 *
 * The user must also grant "Notification access" in system settings. Use
 * [NotificationMirrorService.isListenerEnabled] / [openListenerSettings] from
 * the Flutter layer to check and guide them there.
 */
class KvlNotificationListenerService : NLS() {

    companion object {
        /** Set by MainActivity's EventChannel stream handler. Nullable — the
         *  EventChannel may not be ready yet when the first notification fires. */
        @Volatile
        var sink: EventChannel.EventSink? = null
    }

    private val mainHandler = Handler(Looper.getMainLooper())

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        super.onNotificationPosted(sbn)
        try {
            val extras = sbn.notification.extras
            val title = extras.getString(android.app.Notification.EXTRA_TITLE) ?: ""
            val text = extras.getCharSequence(android.app.Notification.EXTRA_TEXT)
                ?.toString() ?: ""
            val pkg = sbn.packageName

            // Resolve a human-readable app name (best-effort; falls back to
            // package name if the package info is unavailable).
            val appName: String = try {
                packageManager
                    .getApplicationLabel(packageManager.getApplicationInfo(pkg, 0))
                    .toString()
            } catch (_: Exception) {
                pkg
            }

            val data: Map<String, Any> = mapOf(
                "packageName" to pkg,
                "appName" to appName,
                "title" to title,
                "text" to text,
                "timestamp" to System.currentTimeMillis()
            )

            // EventSink must be called on the main thread.
            mainHandler.post {
                sink?.success(data)
            }
        } catch (_: Exception) {
            // Swallow — a single bad notification must not crash the listener.
        }
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
    }
}
