package com.kvl.track

import android.app.admin.DevicePolicyManager
import android.content.ClipData
import android.content.ClipboardManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import io.flutter.plugin.common.BinaryMessenger
import io.flutter.plugin.common.MethodChannel

/**
 * Registers native MethodChannels for system-level features that back the
 * Flutter services added in the AirDroid feature set:
 *
 *  - `com.kvl.track/clipboard`          → ClipboardService.dart
 *  - `com.kvl.track/data_wipe`          → DataWipeService.dart
 *  - `com.kvl.track/notification_mirror` → NotificationMirrorService.dart
 *
 * Instantiate once from [MainActivity.configureFlutterEngine] and call
 * [register] with the engine's [BinaryMessenger].
 */
class SystemServicesHandler(private val context: Context) {

    fun register(messenger: BinaryMessenger) {

        // ── Clipboard ──────────────────────────────────────────────────────
        MethodChannel(messenger, "com.kvl.track/clipboard")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "getClipboard" -> {
                        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE)
                                as ClipboardManager
                        val text = cm.primaryClip?.getItemAt(0)?.text?.toString()
                        result.success(text)
                    }
                    "setClipboard" -> {
                        val text = call.argument<String>("text") ?: ""
                        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE)
                                as ClipboardManager
                        cm.setPrimaryClip(ClipData.newPlainText("kvl_track", text))
                        result.success(true)
                    }
                    else -> result.notImplemented()
                }
            }

        // ── Data wipe (Device Policy Manager) ─────────────────────────────
        MethodChannel(messenger, "com.kvl.track/data_wipe")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "isAdminActive" -> {
                        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE)
                                as DevicePolicyManager
                        val admin = ComponentName(context, AdminReceiver::class.java)
                        result.success(dpm.isAdminActive(admin))
                    }
                    "wipeDevice" -> {
                        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE)
                                as DevicePolicyManager
                        try {
                            @Suppress("DEPRECATION")
                            dpm.wipeData(DevicePolicyManager.WIPE_EXTERNAL_STORAGE)
                            result.success(true)
                        } catch (e: Exception) {
                            result.error("WIPE_ERROR", e.message, null)
                        }
                    }
                    else -> result.notImplemented()
                }
            }

        // ── Notification mirror (permission / settings) ────────────────────
        MethodChannel(messenger, "com.kvl.track/notification_mirror")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "isListenerEnabled" -> {
                        val flat = Settings.Secure.getString(
                            context.contentResolver,
                            "enabled_notification_listeners"
                        ) ?: ""
                        result.success(flat.contains(context.packageName))
                    }
                    "openListenerSettings" -> {
                        context.startActivity(
                            Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
                                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        )
                        result.success(true)
                    }
                    else -> result.notImplemented()
                }
            }
    }
}
