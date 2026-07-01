package com.kvl.track

import android.app.PendingIntent
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
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
import android.telephony.SmsManager
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
    private val remoteOpsChannel = "com.kvl.track/remote_ops"

    // Request codes for PackageInstaller / uninstall confirmation broadcasts.
    private val installSessionRequestCode = 5001
    private val uninstallRequestCode = 5002

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
                "sendSms" -> {
                    val to = call.argument<String>("to")
                    val body = call.argument<String>("body")
                    if (to == null || body == null) {
                        result.error("INVALID_ARG", "to and body are required", null)
                    } else {
                        result.success(sendSms(to, body))
                    }
                }
                "readFileBytes" -> {
                    val path = call.argument<String>("path")
                    if (path == null) {
                        result.error("INVALID_ARG", "path is required", null)
                    } else {
                        result.success(readFileBytes(path))
                    }
                }
                "listRoots" -> result.success(listRoots())
                "listDirectory" -> {
                    val path = call.argument<String>("path")
                    if (path == null) {
                        result.error("INVALID_ARG", "path is required", null)
                    } else {
                        result.success(listDirectory(path))
                    }
                }
                else -> result.notImplemented()
            }
        }

        // ── remote_ops (app install/uninstall, kiosk mode, reboot) ──────────
        MethodChannel(messenger, remoteOpsChannel).setMethodCallHandler { call, result ->
            when (call.method) {
                "installApk" -> {
                    val path = call.argument<String>("path")
                    if (path == null) {
                        result.error("INVALID_ARG", "path is required", null)
                    } else {
                        result.success(installApk(path))
                    }
                }
                "uninstallApp" -> {
                    val pkg = call.argument<String>("packageName")
                    if (pkg == null) {
                        result.error("INVALID_ARG", "packageName is required", null)
                    } else {
                        result.success(uninstallApp(pkg))
                    }
                }
                "enterKiosk" -> {
                    val pkg = call.argument<String>("packageName")
                    if (pkg == null) {
                        result.error("INVALID_ARG", "packageName is required", null)
                    } else {
                        result.success(enterKiosk(pkg))
                    }
                }
                "exitKiosk" -> result.success(exitKiosk())
                "rebootDevice" -> result.success(rebootDevice())
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

    // ── Remote app install (PackageInstaller session) ───────────────────────

    /**
     * Installs the APK at [path] (a local, app-private filesystem path — the
     * caller is expected to have already downloaded it there, e.g. via Dio on
     * the Dart side). Uses [PackageInstaller] to create a session, stream the
     * APK bytes into it, and commit — which triggers the standard Android
     * "Install this app?" system confirmation dialog for the child to accept.
     *
     * Honest limitation: without device-owner provisioning there is no way to
     * suppress that confirmation dialog — this is intentional, not a bug.
     * Returns a map with `success` and `message` describing the outcome.
     */
    private fun installApk(path: String): Map<String, Any?> {
        return try {
            val file = java.io.File(path)
            if (!file.exists() || !file.isFile) {
                return mapOf("success" to false, "message" to "APK file not found at $path")
            }
            val installer = packageManager.packageInstaller
            val params = PackageInstaller.SessionParams(
                PackageInstaller.SessionParams.MODE_FULL_INSTALL
            )
            val sessionId = installer.createSession(params)
            val session = installer.openSession(sessionId)
            session.use { s ->
                s.openWrite("kvl_track_apk", 0, file.length()).use { out ->
                    file.inputStream().use { input -> input.copyTo(out) }
                    s.fsync(out)
                }
                val intent = Intent(this, MainActivity::class.java).apply {
                    action = "com.kvl.track.INSTALL_COMPLETE"
                }
                val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
                } else {
                    PendingIntent.FLAG_UPDATE_CURRENT
                }
                val pendingIntent = PendingIntent.getActivity(
                    this, installSessionRequestCode, intent, flags
                )
                s.commit(pendingIntent.intentSender)
            }
            mapOf(
                "success" to true,
                "message" to "Install session committed — system confirmation dialog shown to user"
            )
        } catch (e: Exception) {
            mapOf("success" to false, "message" to "installApk failed: ${e.message}")
        }
    }

    // ── Remote app uninstall (PackageInstaller uninstall) ───────────────────

    /**
     * Requests uninstall of [packageName]. Without device-owner this always
     * shows the standard system "Uninstall this app?" confirmation dialog to
     * the child — the correct, honest behavior. With device-owner, this could
     * instead be silent via `DevicePolicyManager.uninstallPackage` /
     * `dpm.setUninstallBlocked` combined with package management APIs (not
     * available to a non-device-owner app, so we don't attempt it here).
     */
    private fun uninstallApp(packageName: String): Map<String, Any?> {
        return try {
            val installer = packageManager.packageInstaller
            val intent = Intent(this, MainActivity::class.java).apply {
                action = "com.kvl.track.UNINSTALL_COMPLETE"
            }
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
            val pendingIntent = PendingIntent.getActivity(
                this, uninstallRequestCode, intent, flags
            )
            installer.uninstall(packageName, pendingIntent.intentSender)
            mapOf(
                "success" to true,
                "message" to "Uninstall requested — system confirmation dialog shown to user"
            )
        } catch (e: Exception) {
            mapOf("success" to false, "message" to "uninstallApp failed: ${e.message}")
        }
    }

    // ── Kiosk mode (Screen Pinning API, no device-owner required) ───────────

    /**
     * Launches [packageName] then pins the task via [startLockTask], Android's
     * built-in Screen Pinning API. This works without device-owner, but shows
     * a one-time "Screen pinned" system dialog/toast the first time it is
     * used on a device — that's expected, honest behavior, not a bug.
     */
    private fun enterKiosk(packageName: String): Map<String, Any?> {
        return try {
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                ?: return mapOf(
                    "success" to false,
                    "message" to "No launchable activity found for $packageName"
                )
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(launchIntent)
            startLockTask()
            mapOf(
                "success" to true,
                "message" to "Kiosk mode started for $packageName (screen pinning)"
            )
        } catch (e: Exception) {
            mapOf("success" to false, "message" to "enterKiosk failed: ${e.message}")
        }
    }

    /** Exits screen-pinning kiosk mode via [stopLockTask]. */
    private fun exitKiosk(): Map<String, Any?> {
        return try {
            stopLockTask()
            mapOf("success" to true, "message" to "Kiosk mode stopped")
        } catch (e: Exception) {
            mapOf("success" to false, "message" to "exitKiosk failed: ${e.message}")
        }
    }

    // ── Remote reboot (device-owner only) ───────────────────────────────────

    /**
     * Attempts to reboot the device via [DevicePolicyManager.reboot], which is
     * only available to a device-owner app (API 24+). This app is NOT
     * provisioned as device owner (see [setUninstallLock] for the same check),
     * so in the current build this always returns `success=false` with a clear
     * explanatory message rather than crashing or pretending to succeed.
     */
    private fun rebootDevice(): Map<String, Any?> {
        return try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
                return mapOf(
                    "success" to false,
                    "message" to "Reboot requires Android 7.0 (API 24) or higher"
                )
            }
            val manager = dpm()
            if (!manager.isDeviceOwnerApp(packageName)) {
                return mapOf(
                    "success" to false,
                    "message" to "Not supported without Device Owner provisioning"
                )
            }
            manager.reboot(adminComponent())
            mapOf("success" to true, "message" to "Reboot command issued")
        } catch (e: Exception) {
            mapOf("success" to false, "message" to "rebootDevice failed: ${e.message}")
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

    // ── SMS send ─────────────────────────────────────────────────────────────

    /** Sends a text message via [SmsManager]. Returns true on dispatch success. */
    @Suppress("DEPRECATION")
    private fun sendSms(to: String, body: String): Boolean {
        val granted = androidx.core.content.ContextCompat.checkSelfPermission(
            this, android.Manifest.permission.SEND_SMS
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        if (!granted) return false
        return try {
            val manager = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                getSystemService(SmsManager::class.java)
            } else {
                null
            }) ?: SmsManager.getDefault()
            val parts = manager.divideMessage(body)
            manager.sendMultipartTextMessage(to, null, parts, null, null)
            true
        } catch (e: Exception) {
            false
        }
    }

    // ── Generic file read (file-pull) ───────────────────────────────────────

    private val maxFileReadBytes = 20L * 1024 * 1024 // 20MB safety cap

    /**
     * Reads raw bytes of an arbitrary on-device file for upload. Accepts both
     * plain filesystem paths and `content://` URIs (e.g. from [readMediaList]),
     * resolving the latter via [ContentResolver]. Returns null on failure or
     * if the file exceeds [maxFileReadBytes].
     */
    private fun readFileBytes(path: String): ByteArray? {
        return try {
            if (path.startsWith("content://")) {
                val uri = android.net.Uri.parse(path)
                contentResolver.openInputStream(uri)?.use { input ->
                    val bytes = input.readBytes()
                    if (bytes.size > maxFileReadBytes) null else bytes
                }
            } else {
                val file = java.io.File(path)
                if (!file.exists() || !file.isFile || file.length() > maxFileReadBytes) null
                else file.readBytes()
            }
        } catch (e: Exception) {
            null
        }
    }

    // ── File explorer (browse folders) ──────────────────────────────────────

    private val maxListEntries = 500 // cap payload size

    /**
     * Returns a list of common browsable root folders (Downloads, DCIM, Pictures,
     * external storage root), each only if it actually exists on this device.
     * Safe to call without any special permission — just checks path existence.
     */
    private fun listRoots(): List<Map<String, Any?>> {
        val out = ArrayList<Map<String, Any?>>()
        return try {
            val candidates = mutableListOf<Pair<String, java.io.File>>()
            val extRoot = android.os.Environment.getExternalStorageDirectory()
            if (extRoot != null) {
                candidates.add("Internal Storage" to extRoot)
                candidates.add(
                    "Downloads" to android.os.Environment.getExternalStoragePublicDirectory(
                        android.os.Environment.DIRECTORY_DOWNLOADS
                    )
                )
                candidates.add(
                    "DCIM" to android.os.Environment.getExternalStoragePublicDirectory(
                        android.os.Environment.DIRECTORY_DCIM
                    )
                )
                candidates.add(
                    "Pictures" to android.os.Environment.getExternalStoragePublicDirectory(
                        android.os.Environment.DIRECTORY_PICTURES
                    )
                )
            }
            for ((label, dir) in candidates) {
                if (dir.exists() && dir.isDirectory) {
                    out.add(
                        mapOf(
                            "name" to label,
                            "path" to dir.absolutePath,
                            "isDirectory" to true,
                            "size" to 0L,
                            "modified" to dir.lastModified()
                        )
                    )
                }
            }
            out
        } catch (e: Exception) {
            emptyList()
        }
    }

    /**
     * Lists entries of [path] (a plain filesystem path — the well-known roots
     * returned by [listRoots] are plain paths too). Guarded against permission
     * and I/O errors; caps output at [maxListEntries] to avoid huge payloads.
     */
    private fun listDirectory(path: String): List<Map<String, Any?>> {
        return try {
            val dir = java.io.File(path)
            if (!dir.exists() || !dir.isDirectory) return emptyList()
            val files = dir.listFiles() ?: return emptyList()
            files
                .sortedWith(compareBy({ !it.isDirectory }, { it.name.lowercase() }))
                .take(maxListEntries)
                .map { f ->
                    mapOf(
                        "name" to f.name,
                        "path" to f.absolutePath,
                        "isDirectory" to f.isDirectory,
                        "size" to if (f.isDirectory) 0L else f.length(),
                        "modified" to f.lastModified()
                    )
                }
        } catch (e: SecurityException) {
            emptyList()
        } catch (e: Exception) {
            emptyList()
        }
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
