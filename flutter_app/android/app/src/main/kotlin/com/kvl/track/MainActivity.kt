package com.kvl.track

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.ContactsContract
import android.provider.MediaStore
import android.provider.Telephony
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel

/**
 * Main activity for KVL Track.
 *
 * Uses FlutterFragmentActivity (instead of FlutterActivity) to keep support for
 * local_auth (biometric) and other fragment-based plugins. It registers three
 * native MethodChannels per the shared contract:
 *   - com.kvl.track/admin   : device-admin / uninstall-lock
 *   - com.kvl.track/ring     : loud alarm ring that overrides silent mode
 *   - com.kvl.track/monitor  : transparent parental monitoring via ContentResolver
 */
class MainActivity : FlutterFragmentActivity() {

    private val adminChannel = "com.kvl.track/admin"
    private val ringChannel = "com.kvl.track/ring"
    private val monitorChannel = "com.kvl.track/monitor"

    private var ringPlayer: MediaPlayer? = null
    private var ringVibrator: Vibrator? = null
    private var prevAlarmVolume: Int = -1

    // ── AirDroid screen handler (holds MediaProjection reference) ─────────────
    private var screenHandler: ScreenHandler? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        val messenger = flutterEngine.dartExecutor.binaryMessenger

        // ── Info / alert channels (call log, device info, SIM, battery, wrong-pwd)
        InfoAlertHandler(this).register(messenger)

        // ── App-control channels (screen time, app manager, app lock, web filter)
        AppControlHandler.register(applicationContext, flutterEngine)

        // ── System services (clipboard, data wipe, notification mirror) ────
        SystemServicesHandler(applicationContext).register(messenger)

        // ── Streaming channels (live camera frames, live audio, flashlight)
        StreamingHandler(applicationContext).register(messenger)

        // ── Screen channels (MediaProjection mirror, screenshot, screen control)
        val sh = ScreenHandler(this, this)
        screenHandler = sh
        sh.register(messenger)

        // ── Notification event stream (KvlNotificationListenerService) ─────
        EventChannel(messenger, "com.kvl.track/notification_events")
            .setStreamHandler(object : EventChannel.StreamHandler {
                override fun onListen(args: Any?, s: EventChannel.EventSink) {
                    KvlNotificationListenerService.sink = s
                }
                override fun onCancel(args: Any?) {
                    KvlNotificationListenerService.sink = null
                }
            })

        // ── admin ──────────────────────────────────────────────────────────
        MethodChannel(messenger, adminChannel).setMethodCallHandler { call, result ->
            when (call.method) {
                "requestAdmin" -> {
                    try {
                        val intent = android.content.Intent(
                            DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN
                        ).apply {
                            putExtra(
                                DevicePolicyManager.EXTRA_DEVICE_ADMIN,
                                adminComponent()
                            )
                            putExtra(
                                DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                                "Enable to keep KVL Track protected for your family."
                            )
                        }
                        startActivity(intent)
                        result.success(true)
                    } catch (e: Exception) {
                        result.success(false)
                    }
                }
                "isAdminActive" -> result.success(dpm().isAdminActive(adminComponent()))
                "setUninstallLock" -> {
                    val enable = call.argument<Boolean>("enable") ?: false
                    result.success(setUninstallLock(enable))
                }
                else -> result.notImplemented()
            }
        }

        // ── ring ───────────────────────────────────────────────────────────
        MethodChannel(messenger, ringChannel).setMethodCallHandler { call, result ->
            when (call.method) {
                "ring" -> {
                    try {
                        startRing()
                        result.success(true)
                    } catch (e: Exception) {
                        result.error("RING_ERROR", e.message, null)
                    }
                }
                "stopRing" -> {
                    stopRing()
                    result.success(true)
                }
                else -> result.notImplemented()
            }
        }

        // ── monitor ────────────────────────────────────────────────────────
        MethodChannel(messenger, monitorChannel).setMethodCallHandler { call, result ->
            when (call.method) {
                "readSms" -> result.success(guardedRead(android.Manifest.permission.READ_SMS, ::readSms))
                "readContacts" -> result.success(guardedRead(android.Manifest.permission.READ_CONTACTS, ::readContacts))
                "readMediaList" -> result.success(guardedRead(readMediaListPermission(), ::readMediaList))
                else -> result.notImplemented()
            }
        }
    }

    /**
     * Runs [read] only if [permission] is currently granted, and swallows any
     * SecurityException from the underlying ContentResolver query — a denied
     * or revoked permission must never crash the whole process.
     */
    private fun guardedRead(
        permission: String,
        read: () -> List<Map<String, Any?>>
    ): List<Map<String, Any?>> {
        val granted = androidx.core.content.ContextCompat.checkSelfPermission(
            this, permission
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        if (!granted) return emptyList()
        return try {
            read()
        } catch (e: SecurityException) {
            emptyList()
        }
    }

    private fun readMediaListPermission(): String =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            android.Manifest.permission.READ_MEDIA_IMAGES
        } else {
            android.Manifest.permission.READ_EXTERNAL_STORAGE
        }

    // ── Device admin helpers ────────────────────────────────────────────────
    private fun dpm(): DevicePolicyManager =
        getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager

    private fun adminComponent(): ComponentName =
        ComponentName(this, AdminReceiver::class.java)

    /**
     * Blocks/unblocks self-uninstall. Only works when KVL Track is provisioned
     * as device owner; otherwise this is a no-op that returns false.
     */
    private fun setUninstallLock(enable: Boolean): Boolean {
        return try {
            val manager = dpm()
            if (manager.isDeviceOwnerApp(packageName)) {
                manager.setUninstallBlocked(adminComponent(), packageName, enable)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    // ── Ring helpers ────────────────────────────────────────────────────────
    private fun startRing() {
        val audio = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        prevAlarmVolume = audio.getStreamVolume(AudioManager.STREAM_ALARM)
        audio.setStreamVolume(
            AudioManager.STREAM_ALARM,
            audio.getStreamMaxVolume(AudioManager.STREAM_ALARM),
            0
        )

        stopRing() // release any previous instance (keeps prevAlarmVolume set above)

        val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        ringPlayer = MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )
            setDataSource(this@MainActivity, uri)
            isLooping = true
            prepare()
            start()
        }

        val vibrator = vibrator()
        ringVibrator = vibrator
        val pattern = longArrayOf(0, 800, 400)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(pattern, 0)
        }
    }

    private fun stopRing() {
        ringPlayer?.let {
            try {
                if (it.isPlaying) it.stop()
            } catch (_: Exception) {
            }
            it.release()
        }
        ringPlayer = null

        ringVibrator?.cancel()
        ringVibrator = null

        if (prevAlarmVolume >= 0) {
            try {
                val audio = getSystemService(Context.AUDIO_SERVICE) as AudioManager
                audio.setStreamVolume(AudioManager.STREAM_ALARM, prevAlarmVolume, 0)
            } catch (_: Exception) {
            }
            prevAlarmVolume = -1
        }
    }

    private fun vibrator(): Vibrator {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vm = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vm.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    // ── Monitor helpers (ContentResolver) ───────────────────────────────────
    private fun readSms(): List<Map<String, Any?>> {
        val out = ArrayList<Map<String, Any?>>()
        val projection = arrayOf(
            Telephony.Sms.ADDRESS,
            Telephony.Sms.BODY,
            Telephony.Sms.DATE,
            Telephony.Sms.TYPE
        )
        contentResolver.query(
            Telephony.Sms.CONTENT_URI,
            projection,
            null,
            null,
            "${Telephony.Sms.DATE} DESC"
        )?.use { c ->
            val iAddr = c.getColumnIndex(Telephony.Sms.ADDRESS)
            val iBody = c.getColumnIndex(Telephony.Sms.BODY)
            val iDate = c.getColumnIndex(Telephony.Sms.DATE)
            val iType = c.getColumnIndex(Telephony.Sms.TYPE)
            while (c.moveToNext()) {
                val type = if (iType >= 0) c.getInt(iType) else 0
                val kind = when (type) {
                    Telephony.Sms.MESSAGE_TYPE_SENT -> "sent"
                    Telephony.Sms.MESSAGE_TYPE_INBOX -> "inbox"
                    else -> "other"
                }
                out.add(
                    mapOf(
                        "address" to if (iAddr >= 0) c.getString(iAddr) else null,
                        "body" to if (iBody >= 0) c.getString(iBody) else null,
                        "ts" to if (iDate >= 0) c.getLong(iDate) else 0L,
                        "kind" to kind
                    )
                )
            }
        }
        return out
    }

    private fun readContacts(): List<Map<String, Any?>> {
        val out = ArrayList<Map<String, Any?>>()
        val projection = arrayOf(
            ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
            ContactsContract.CommonDataKinds.Phone.NUMBER
        )
        contentResolver.query(
            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
            projection,
            null,
            null,
            "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME} ASC"
        )?.use { c ->
            val iName = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)
            val iNum = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)
            while (c.moveToNext()) {
                out.add(
                    mapOf(
                        "name" to if (iName >= 0) c.getString(iName) else null,
                        "number" to if (iNum >= 0) c.getString(iNum) else null
                    )
                )
            }
        }
        return out
    }

    private fun readMediaList(): List<Map<String, Any?>> {
        val out = ArrayList<Map<String, Any?>>()
        val collection = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
        val projection = arrayOf(
            MediaStore.Images.Media._ID,
            MediaStore.Images.Media.DATE_ADDED
        )
        contentResolver.query(
            collection,
            projection,
            null,
            null,
            "${MediaStore.Images.Media.DATE_ADDED} DESC"
        )?.use { c ->
            val iId = c.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
            val iDate = c.getColumnIndex(MediaStore.Images.Media.DATE_ADDED)
            while (c.moveToNext()) {
                val id = c.getLong(iId)
                val uri = android.content.ContentUris.withAppendedId(collection, id)
                out.add(
                    mapOf(
                        "uri" to uri.toString(),
                        // DATE_ADDED is seconds since epoch -> normalize to millis
                        "ts" to if (iDate >= 0) c.getLong(iDate) * 1000L else 0L,
                        "kind" to "image"
                    )
                )
            }
        }
        return out
    }

    // ── Activity result: forward MediaProjection consent to ScreenHandler ──────
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: android.content.Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        screenHandler?.onActivityResult(requestCode, resultCode, data)
    }

    override fun onDestroy() {
        stopRing()
        super.onDestroy()
    }
}
