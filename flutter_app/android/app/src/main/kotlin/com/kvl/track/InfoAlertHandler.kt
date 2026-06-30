package com.kvl.track

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Environment
import android.os.StatFs
import android.provider.CallLog
import android.telephony.TelephonyManager
import io.flutter.plugin.common.BinaryMessenger
import io.flutter.plugin.common.MethodChannel

class InfoAlertHandler(private val context: Context) {

    fun register(messenger: BinaryMessenger) {
        registerCallLog(messenger)
        registerDeviceInfo(messenger)
        registerSimAlert(messenger)
        registerBattery(messenger)
        registerWrongPassword(messenger)
    }

    private fun registerCallLog(messenger: BinaryMessenger) {
        MethodChannel(messenger, "com.kvl.track/call_log").setMethodCallHandler { call, result ->
            if (call.method == "getCallLogs") {
                val limit = call.argument<Int>("limit") ?: 100
                try { result.success(readCallLogs(limit)) }
                catch (e: Exception) { result.error("CALL_LOG_ERROR", e.message, null) }
            } else result.notImplemented()
        }
    }

    private fun readCallLogs(limit: Int): List<Map<String, Any?>> {
        val out = ArrayList<Map<String, Any?>>()
        val projection = arrayOf(CallLog.Calls.NUMBER, CallLog.Calls.CACHED_NAME, CallLog.Calls.TYPE, CallLog.Calls.DURATION, CallLog.Calls.DATE)
        context.contentResolver.query(CallLog.Calls.CONTENT_URI, projection, null, null, "${CallLog.Calls.DATE} DESC LIMIT $limit")?.use { c ->
            val iNum = c.getColumnIndex(CallLog.Calls.NUMBER)
            val iName = c.getColumnIndex(CallLog.Calls.CACHED_NAME)
            val iType = c.getColumnIndex(CallLog.Calls.TYPE)
            val iDur = c.getColumnIndex(CallLog.Calls.DURATION)
            val iDate = c.getColumnIndex(CallLog.Calls.DATE)
            while (c.moveToNext()) {
                val type = when (if (iType >= 0) c.getInt(iType) else 0) {
                    CallLog.Calls.INCOMING_TYPE -> "incoming"
                    CallLog.Calls.OUTGOING_TYPE -> "outgoing"
                    CallLog.Calls.MISSED_TYPE -> "missed"
                    else -> "unknown"
                }
                out.add(mapOf(
                    "number" to (if (iNum >= 0) c.getString(iNum) else ""),
                    "name" to (if (iName >= 0) c.getString(iName) ?: "" else ""),
                    "type" to type,
                    "duration" to (if (iDur >= 0) c.getInt(iDur) else 0),
                    "timestamp" to (if (iDate >= 0) c.getLong(iDate) else 0L)
                ))
            }
        }
        return out
    }

    private fun registerDeviceInfo(messenger: BinaryMessenger) {
        MethodChannel(messenger, "com.kvl.track/device_info").setMethodCallHandler { call, result ->
            if (call.method == "getStorageInfo") {
                try {
                    val internal = StatFs(Environment.getDataDirectory().path)
                    val external = StatFs(Environment.getExternalStorageDirectory().path)
                    val mi = android.app.ActivityManager.MemoryInfo()
                    (context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager).getMemoryInfo(mi)
                    val batteryIntent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
                    val level = batteryIntent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
                    val scale = batteryIntent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
                    val battPct = if (level >= 0 && scale > 0) (level * 100 / scale) else 0
                    result.success(mapOf(
                        "internalTotal" to internal.totalBytes,
                        "internalFree" to internal.availableBytes,
                        "internalUsed" to (internal.totalBytes - internal.availableBytes),
                        "externalTotal" to external.totalBytes,
                        "externalFree" to external.availableBytes,
                        "ramTotal" to mi.totalMem,
                        "ramAvailable" to mi.availMem,
                        "batteryLevel" to battPct
                    ))
                } catch (e: Exception) { result.error("STORAGE_ERROR", e.message, null) }
            } else result.notImplemented()
        }
    }

    private fun registerSimAlert(messenger: BinaryMessenger) {
        val channel = MethodChannel(messenger, "com.kvl.track/sim_alert")
        var prevOperator = ""
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                if (intent.action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) return
                val tm = ctx.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
                val currentOp = tm.networkOperatorName ?: ""
                if (currentOp != prevOperator && prevOperator.isNotEmpty()) {
                    channel.invokeMethod("onSimChanged", mapOf("oldOperator" to prevOperator, "newOperator" to currentOp))
                }
                prevOperator = currentOp
            }
        }
        val filter = IntentFilter("android.intent.action.SIM_STATE_CHANGED")
        context.registerReceiver(receiver, filter)
        val tm = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        prevOperator = tm.networkOperatorName ?: ""
    }

    private fun registerBattery(messenger: BinaryMessenger) {
        val channel = MethodChannel(messenger, "com.kvl.track/battery")
        channel.setMethodCallHandler { call, result ->
            if (call.method == "startBatteryMonitoring") {
                val receiver = object : BroadcastReceiver() {
                    override fun onReceive(ctx: Context, intent: Intent) {
                        val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                        val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                        val pct = if (scale > 0) (level * 100 / scale) else 0
                        val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
                        val charging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL
                        channel.invokeMethod("onBatteryChanged", mapOf("level" to pct, "charging" to charging))
                    }
                }
                context.registerReceiver(receiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
                result.success(true)
            } else result.notImplemented()
        }
    }

    private fun registerWrongPassword(messenger: BinaryMessenger) {
        val channel = MethodChannel(messenger, "com.kvl.track/wrong_password")
        channel.setMethodCallHandler { call, result ->
            if (call.method == "startMonitoring") {
                // Poll SharedPreferences written by AdminReceiver.onPasswordFailed
                val prefs = context.getSharedPreferences("kvl_track_prefs", Context.MODE_PRIVATE)
                var lastCount = prefs.getInt("wrong_password_count", 0)
                val timer = java.util.Timer()
                timer.scheduleAtFixedRate(object : java.util.TimerTask() {
                    override fun run() {
                        val count = prefs.getInt("wrong_password_count", 0)
                        if (count > lastCount) {
                            lastCount = count
                            channel.invokeMethod("onPasswordFailed", mapOf("count" to count))
                        }
                    }
                }, 0, 5000)
                result.success(true)
            } else result.notImplemented()
        }
    }
}
