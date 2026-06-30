package com.kvl.track

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent

/**
 * Device administrator receiver for KVL Track.
 *
 * Transparent (the app icon stays visible): granting this admin lets the app
 * use force-lock and — when KVL Track is provisioned as device owner — block
 * its own uninstall via DevicePolicyManager.setUninstallBlocked.
 *
 * Policies are declared in res/xml/device_admin.xml (force-lock, watch-login).
 */
class AdminReceiver : DeviceAdminReceiver() {

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
    }

    override fun onDisableRequested(context: Context, intent: Intent): CharSequence {
        return "Disabling device admin will turn off family protection for KVL Track."
    }

    override fun onPasswordFailed(context: Context, intent: Intent) {
        super.onPasswordFailed(context, intent)
        val prefs = context.getSharedPreferences("kvl_track_prefs", Context.MODE_PRIVATE)
        val current = prefs.getInt("wrong_password_count", 0)
        prefs.edit().putInt("wrong_password_count", current + 1).apply()
    }
}
