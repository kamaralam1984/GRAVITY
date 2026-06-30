package com.kvl.track

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Build
import android.provider.Settings
import android.util.Base64
import android.view.accessibility.AccessibilityManager
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.ByteArrayOutputStream
import java.util.Calendar

/**
 * Registers the four native MethodChannels required by the Dart app-control
 * services and wires them up to Android system APIs / SharedPreferences.
 *
 * Call [register] from [MainActivity.configureFlutterEngine].
 */
object AppControlHandler {

    private const val PREFS_NAME = "kvl_track_prefs"
    private const val KEY_BLOCKED_APPS = "blocked_apps"
    private const val KEY_LOCKED_APPS = "locked_apps"
    private const val KEY_LOCK_PIN = "lock_pin"
    private const val KEY_BLOCKED_URLS = "blocked_urls"
    private const val KEY_WEB_FILTER_ENABLED = "web_filter_enabled"

    fun register(context: Context, flutterEngine: FlutterEngine) {
        val messenger = flutterEngine.dartExecutor.binaryMessenger
        registerScreenTime(context, messenger)
        registerAppManager(context, messenger)
        registerAppLock(context, messenger)
        registerWebFilter(context, messenger)
    }

    // ── Screen Time ───────────────────────────────────────────────────────────

    private fun registerScreenTime(context: Context, messenger: io.flutter.plugin.common.BinaryMessenger) {
        MethodChannel(messenger, "com.kvl.track/screen_time")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "hasUsagePermission" -> result.success(hasUsagePermission(context))

                    "openUsageSettings" -> {
                        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(intent)
                        result.success(null)
                    }

                    "getUsageStats" -> {
                        val daysBack = call.argument<Int>("daysBack") ?: 7
                        result.success(queryUsageStats(context, daysBack))
                    }

                    else -> result.notImplemented()
                }
            }
    }

    private fun hasUsagePermission(context: Context): Boolean {
        return try {
            val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    context.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    context.packageName
                )
            }
            mode == AppOpsManager.MODE_ALLOWED
        } catch (_: Exception) {
            false
        }
    }

    private fun queryUsageStats(context: Context, daysBack: Int): List<Map<String, Any?>> {
        if (!hasUsagePermission(context)) return emptyList()

        val usageManager =
            context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val pm = context.packageManager

        val cal = Calendar.getInstance()
        val endMs = cal.timeInMillis
        cal.add(Calendar.DAY_OF_YEAR, -daysBack)
        val beginMs = cal.timeInMillis

        // Query daily buckets and aggregate by package.
        val rawStats = usageManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            beginMs,
            endMs
        ) ?: emptyList()

        // Aggregate: sum totalTimeInForeground, keep latest lastTimeUsed.
        data class Agg(var totalTimeMs: Long = 0L, var lastUsed: Long = 0L)

        val agg = LinkedHashMap<String, Agg>()
        for (stat in rawStats) {
            if (stat.totalTimeInForeground <= 0L) continue
            val entry = agg.getOrPut(stat.packageName) { Agg() }
            entry.totalTimeMs += stat.totalTimeInForeground
            if (stat.lastTimeUsed > entry.lastUsed) {
                entry.lastUsed = stat.lastTimeUsed
            }
        }

        val out = ArrayList<Map<String, Any?>>()
        for ((pkg, data) in agg) {
            val appName = try {
                pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
            } catch (_: Exception) {
                pkg
            }
            val iconB64 = appIconBase64(pm, pkg)
            out.add(
                mapOf(
                    "packageName" to pkg,
                    "appName" to appName,
                    "totalTimeMs" to data.totalTimeMs,
                    "lastUsed" to data.lastUsed,
                    "iconBase64" to iconB64
                )
            )
        }
        // Sort descending by total time.
        out.sortByDescending { (it["totalTimeMs"] as? Long) ?: 0L }
        return out
    }

    // ── App Manager ───────────────────────────────────────────────────────────

    private fun registerAppManager(context: Context, messenger: io.flutter.plugin.common.BinaryMessenger) {
        MethodChannel(messenger, "com.kvl.track/app_manager")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "getInstalledApps" -> {
                        val includeSystem = call.argument<Boolean>("includeSystem") ?: false
                        result.success(getInstalledApps(context, includeSystem))
                    }

                    "blockApp" -> {
                        val pkg = call.argument<String>("package") ?: ""
                        result.success(modifyBlockedApps(context, pkg, add = true))
                    }

                    "unblockApp" -> {
                        val pkg = call.argument<String>("package") ?: ""
                        result.success(modifyBlockedApps(context, pkg, add = false))
                    }

                    "getBlockedApps" -> result.success(getBlockedApps(context))

                    else -> result.notImplemented()
                }
            }
    }

    private fun getInstalledApps(
        context: Context,
        includeSystem: Boolean
    ): List<Map<String, Any?>> {
        val pm = context.packageManager
        val blocked = getBlockedApps(context).toSet()

        @Suppress("DEPRECATION")
        val packages: List<PackageInfo> = pm.getInstalledPackages(0)

        val out = ArrayList<Map<String, Any?>>()
        for (pkg in packages) {
            val appInfo = pkg.applicationInfo ?: continue
            val isSystem =
                (appInfo.flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM) != 0
            if (!includeSystem && isSystem) continue

            val appName = try {
                pm.getApplicationLabel(appInfo).toString()
            } catch (_: Exception) {
                pkg.packageName
            }

            out.add(
                mapOf(
                    "packageName" to pkg.packageName,
                    "appName" to appName,
                    "version" to (pkg.versionName ?: ""),
                    "isSystem" to isSystem,
                    "isBlocked" to blocked.contains(pkg.packageName),
                    "iconBase64" to appIconBase64(pm, pkg.packageName)
                )
            )
        }
        out.sortBy { it["appName"] as? String }
        return out
    }

    private fun modifyBlockedApps(context: Context, packageName: String, add: Boolean): Boolean {
        if (packageName.isBlank()) return false
        return try {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val current = prefs.getString(KEY_BLOCKED_APPS, "") ?: ""
            val set = current.split(",").filter { it.isNotBlank() }.toMutableSet()
            if (add) set.add(packageName) else set.remove(packageName)
            prefs.edit().putString(KEY_BLOCKED_APPS, set.joinToString(",")).apply()
            true
        } catch (_: Exception) {
            false
        }
    }

    private fun getBlockedApps(context: Context): List<String> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val raw = prefs.getString(KEY_BLOCKED_APPS, "") ?: ""
        return raw.split(",").filter { it.isNotBlank() }
    }

    // ── App Lock ──────────────────────────────────────────────────────────────

    private fun registerAppLock(context: Context, messenger: io.flutter.plugin.common.BinaryMessenger) {
        MethodChannel(messenger, "com.kvl.track/app_lock")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "isAccessibilityEnabled" ->
                        result.success(isAccessibilityServiceEnabled(context))

                    "openAccessibilitySettings" -> {
                        val intent =
                            Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                        context.startActivity(intent)
                        result.success(null)
                    }

                    "setLockedApps" -> {
                        val packages =
                            call.argument<List<String>>("packages") ?: emptyList()
                        val pin = call.argument<String>("pin") ?: "0000"
                        setLockedApps(context, packages, pin)
                        result.success(null)
                    }

                    "getLockedApps" -> result.success(getLockedApps(context))

                    "unlockApp" -> {
                        val pkg = call.argument<String>("package") ?: ""
                        unlockApp(context, pkg)
                        result.success(null)
                    }

                    else -> result.notImplemented()
                }
            }
    }

    private fun isAccessibilityServiceEnabled(context: Context): Boolean {
        val am = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
        if (!am.isEnabled) return false

        // Check whether KvlAccessibilityService is in the enabled-services list.
        val enabledServices = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false

        val componentName =
            "${context.packageName}/${KvlAccessibilityService::class.java.canonicalName}"
        return enabledServices
            .split(":")
            .any { it.equals(componentName, ignoreCase = true) }
    }

    internal fun setLockedApps(context: Context, packages: List<String>, pin: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putString(KEY_LOCKED_APPS, packages.filter { it.isNotBlank() }.joinToString(","))
            .putString(KEY_LOCK_PIN, pin)
            .apply()
    }

    internal fun getLockedApps(context: Context): List<String> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val raw = prefs.getString(KEY_LOCKED_APPS, "") ?: ""
        return raw.split(",").filter { it.isNotBlank() }
    }

    internal fun getLockPin(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_LOCK_PIN, "0000") ?: "0000"
    }

    internal fun unlockApp(context: Context, packageName: String) {
        // Temporarily remove from locked list for this session.
        // The parent can re-lock by calling setLockedApps again.
        val current = getLockedApps(context).toMutableList()
        current.remove(packageName)
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_LOCKED_APPS, current.joinToString(",")).apply()
    }

    // ── Web Filter ────────────────────────────────────────────────────────────

    private fun registerWebFilter(context: Context, messenger: io.flutter.plugin.common.BinaryMessenger) {
        MethodChannel(messenger, "com.kvl.track/web_filter")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "addBlockedUrl" -> {
                        val url = call.argument<String>("url") ?: ""
                        modifyBlockedUrls(context, url, add = true)
                        result.success(null)
                    }

                    "removeBlockedUrl" -> {
                        val url = call.argument<String>("url") ?: ""
                        modifyBlockedUrls(context, url, add = false)
                        result.success(null)
                    }

                    "getBlockedUrls" -> result.success(getBlockedUrls(context))

                    "setEnabled" -> {
                        val enabled = call.argument<Boolean>("enabled") ?: true
                        setWebFilterEnabled(context, enabled)
                        result.success(null)
                    }

                    "isEnabled" -> result.success(isWebFilterEnabled(context))

                    else -> result.notImplemented()
                }
            }
    }

    private fun modifyBlockedUrls(context: Context, url: String, add: Boolean) {
        if (url.isBlank()) return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val current = prefs.getString(KEY_BLOCKED_URLS, "") ?: ""
        val set = current.split(",").filter { it.isNotBlank() }.toMutableSet()
        if (add) set.add(url.lowercase().trim()) else set.remove(url.lowercase().trim())
        prefs.edit().putString(KEY_BLOCKED_URLS, set.joinToString(",")).apply()
    }

    internal fun getBlockedUrls(context: Context): List<String> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val raw = prefs.getString(KEY_BLOCKED_URLS, "") ?: ""
        return raw.split(",").filter { it.isNotBlank() }
    }

    private fun setWebFilterEnabled(context: Context, enabled: Boolean) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putBoolean(KEY_WEB_FILTER_ENABLED, enabled).apply()
    }

    internal fun isWebFilterEnabled(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getBoolean(KEY_WEB_FILTER_ENABLED, false)
    }

    // ── Icon helper ───────────────────────────────────────────────────────────

    private fun appIconBase64(pm: PackageManager, packageName: String): String? {
        return try {
            val drawable = pm.getApplicationIcon(packageName)
            val bmp = Bitmap.createBitmap(
                drawable.intrinsicWidth.coerceAtLeast(1),
                drawable.intrinsicHeight.coerceAtLeast(1),
                Bitmap.Config.ARGB_8888
            )
            val canvas = Canvas(bmp)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)
            val baos = ByteArrayOutputStream()
            bmp.compress(Bitmap.CompressFormat.PNG, 85, baos)
            Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP)
        } catch (_: Exception) {
            null
        }
    }
}
