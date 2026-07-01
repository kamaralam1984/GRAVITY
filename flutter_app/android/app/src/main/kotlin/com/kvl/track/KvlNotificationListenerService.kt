package com.kvl.track

import android.app.Notification
import android.app.PendingIntent
import android.content.Intent
import android.app.RemoteInput
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.service.notification.NotificationListenerService as NLS
import android.service.notification.StatusBarNotification
import io.flutter.plugin.common.EventChannel
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

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
 *
 * ── Reply support ──────────────────────────────────────────────────────────
 * When a posted notification exposes an [Notification.Action] with non-null
 * [Notification.Action.remoteInputs] (the "Reply" action most messaging apps
 * expose), the relevant [PendingIntent] and [RemoteInput] set are stashed in
 * [replyableActions] keyed by a generated id. That id is included in the
 * mirrored payload as `replyId` (`replyable: true`) so a parent can trigger
 * [sendReply] later via the `com.kvl.track/notification_mirror` method
 * channel's `sendNotificationReply` call — without ever opening the source
 * app on the child device.
 */
class KvlNotificationListenerService : NLS() {

    /** A stashed reply action captured from a posted notification. */
    data class ReplyAction(
        val actionIntent: PendingIntent,
        val remoteInputs: Array<RemoteInput>,
    )

    companion object {
        /** Set by MainActivity's EventChannel stream handler. Nullable — the
         *  EventChannel may not be ready yet when the first notification fires. */
        @Volatile
        var sink: EventChannel.EventSink? = null

        /** replyId -> captured reply action, in-memory (cleared on process death). */
        val replyableActions = ConcurrentHashMap<String, ReplyAction>()
    }

    private val mainHandler = Handler(Looper.getMainLooper())

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        super.onNotificationPosted(sbn)
        try {
            val extras = sbn.notification.extras
            val title = extras.getString(Notification.EXTRA_TITLE) ?: ""
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)
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

            // Look for a "Reply" action exposing RemoteInput(s).
            var replyId: String? = null
            val actions = sbn.notification.actions
            if (actions != null) {
                for (action in actions) {
                    val remoteInputs = action.remoteInputs
                    if (remoteInputs != null && remoteInputs.isNotEmpty()) {
                        val id = UUID.randomUUID().toString()
                        replyableActions[id] = ReplyAction(
                            actionIntent = action.actionIntent,
                            remoteInputs = remoteInputs,
                        )
                        replyId = id
                        break
                    }
                }
            }

            val data: MutableMap<String, Any> = mutableMapOf(
                "packageName" to pkg,
                "appName" to appName,
                "title" to title,
                "text" to text,
                "timestamp" to System.currentTimeMillis(),
                "replyable" to (replyId != null)
            )
            if (replyId != null) {
                data["replyId"] = replyId
            }

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
