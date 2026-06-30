package com.kvl.track

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.AlertDialog
import android.content.Context
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import io.flutter.plugin.common.EventChannel

/**
 * Accessibility service for KVL Track.
 *
 * Responsibilities:
 *  1. App locking – when TYPE_WINDOW_STATE_CHANGED fires and the foreground
 *     package is in the "locked_apps" SharedPreferences list, a PIN-entry
 *     overlay is shown over the app.  The user must enter the correct PIN
 *     (stored in "lock_pin") to proceed; pressing Back returns the user to
 *     the home screen.
 *
 *  2. Web filtering – when TYPE_VIEW_TEXT_CHANGED fires inside a browser, the
 *     event text is inspected against the "blocked_urls" list.  On a match
 *     the service performs GLOBAL_ACTION_BACK and shows a Toast.
 *
 * Registration in AndroidManifest.xml:
 *   <service android:name=".KvlAccessibilityService"
 *            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
 *            android:exported="true">
 *       <intent-filter>
 *           <action android:name="android.accessibilityservice.AccessibilityService" />
 *       </intent-filter>
 *       <meta-data android:name="android.accessibilityservice"
 *                  android:resource="@xml/accessibility_service_config" />
 *   </service>
 */
class KvlAccessibilityService : AccessibilityService() {

    companion object {
        /** EventSink used by agent-5 (screenshot / screen-control) to push events to Flutter. */
        var sink: EventChannel.EventSink? = null

        // Known browser package prefixes for URL detection.
        private val BROWSER_PACKAGES = setOf(
            "com.android.chrome",
            "org.mozilla.firefox",
            "com.microsoft.emmx",
            "com.opera.browser",
            "com.brave.browser",
            "com.sec.android.app.sbrowser",
            "com.UCMobile.intl"
        )
    }

    // Guard to prevent re-showing the overlay while one is already displayed.
    private var overlayShown = false
    private var overlayView: View? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    // ── AccessibilityService lifecycle ────────────────────────────────────────

    override fun onServiceConnected() {
        super.onServiceConnected()
        val info = AccessibilityServiceInfo().apply {
            eventTypes = (
                AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED or
                AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            )
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = (
                AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS or
                AccessibilityServiceInfo.DEFAULT
            )
            notificationTimeout = 100L
            // Monitor all packages.
            packageNames = null
        }
        serviceInfo = info
    }

    override fun onInterrupt() {
        // No-op: required by interface.
    }

    // ── Event dispatch ────────────────────────────────────────────────────────

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> handleWindowStateChanged(event)

            AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED,
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> handleBrowserContentChange(event)
        }
    }

    // ── App lock ──────────────────────────────────────────────────────────────

    private fun handleWindowStateChanged(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return

        // Ignore our own overlay or the system launcher.
        if (packageName == applicationContext.packageName) return

        val lockedApps = AppControlHandler.getLockedApps(applicationContext)
        if (lockedApps.contains(packageName) && !overlayShown) {
            mainHandler.post { showPinOverlay(packageName) }
        }
    }

    private fun showPinOverlay(lockedPackage: String) {
        if (overlayShown) return
        overlayShown = true

        val wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        // Build a simple PIN-entry overlay view programmatically to avoid
        // requiring a layout XML resource in this file.
        val ctx = applicationContext

        // Root layout
        val container = android.widget.LinearLayout(ctx).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setBackgroundColor(0xDD000000.toInt())
            setPadding(64, 64, 64, 64)
        }

        val title = TextView(ctx).apply {
            text = "App Locked"
            textSize = 20f
            setTextColor(0xFFFFFFFF.toInt())
            gravity = android.view.Gravity.CENTER
        }

        val subtitle = TextView(ctx).apply {
            text = "Enter PIN to continue"
            textSize = 14f
            setTextColor(0xFFCCCCCC.toInt())
            gravity = android.view.Gravity.CENTER
            setPadding(0, 16, 0, 32)
        }

        val pinField = EditText(ctx).apply {
            hint = "PIN"
            inputType = (
                android.text.InputType.TYPE_CLASS_NUMBER or
                android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD
            )
            gravity = android.view.Gravity.CENTER
            setTextColor(0xFFFFFFFF.toInt())
            setHintTextColor(0xFF888888.toInt())
        }

        val btnRow = android.widget.LinearLayout(ctx).apply {
            orientation = android.widget.LinearLayout.HORIZONTAL
            setPadding(0, 24, 0, 0)
        }

        val btnBack = Button(ctx).apply {
            text = "Go Back"
            layoutParams = android.widget.LinearLayout.LayoutParams(
                0, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, 1f
            )
        }

        val btnUnlock = Button(ctx).apply {
            text = "Unlock"
            layoutParams = android.widget.LinearLayout.LayoutParams(
                0, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, 1f
            )
        }

        btnRow.addView(btnBack)
        btnRow.addView(btnUnlock)
        container.addView(title)
        container.addView(subtitle)
        container.addView(pinField)
        container.addView(btnRow)

        val overlayType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_SYSTEM_ALERT
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            overlayType,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        )

        overlayView = container
        wm.addView(container, params)

        btnBack.setOnClickListener {
            dismissOverlay(wm)
            performGlobalAction(GLOBAL_ACTION_HOME)
        }

        btnUnlock.setOnClickListener {
            val enteredPin = pinField.text.toString()
            val correctPin = AppControlHandler.getLockPin(applicationContext)
            if (enteredPin == correctPin) {
                dismissOverlay(wm)
            } else {
                Toast.makeText(applicationContext, "Incorrect PIN", Toast.LENGTH_SHORT).show()
                pinField.setText("")
            }
        }
    }

    private fun dismissOverlay(wm: WindowManager) {
        overlayView?.let {
            try {
                wm.removeView(it)
            } catch (_: Exception) {}
        }
        overlayView = null
        overlayShown = false
    }

    // ── Web filter ────────────────────────────────────────────────────────────

    private fun handleBrowserContentChange(event: AccessibilityEvent) {
        val pkg = event.packageName?.toString() ?: return
        if (!BROWSER_PACKAGES.contains(pkg)) return
        if (!AppControlHandler.isWebFilterEnabled(applicationContext)) return

        val blockedUrls = AppControlHandler.getBlockedUrls(applicationContext)
        if (blockedUrls.isEmpty()) return

        // Collect all text in this event.
        val texts = event.text.map { it.toString() }
        for (text in texts) {
            val lowerText = text.lowercase()
            for (blocked in blockedUrls) {
                if (lowerText.contains(blocked.lowercase())) {
                    performGlobalAction(GLOBAL_ACTION_BACK)
                    mainHandler.post {
                        Toast.makeText(
                            applicationContext,
                            "Website blocked by KVL Track",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                    return
                }
            }
        }
    }
}
