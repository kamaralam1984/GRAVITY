package com.kvl.track

import android.accessibilityservice.AccessibilityService as AS
import android.accessibilityservice.GestureDescription
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Path
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.Image
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.DisplayMetrics
import android.view.WindowManager
import io.flutter.plugin.common.BinaryMessenger
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel
import java.io.ByteArrayOutputStream
import java.io.File

/**
 * Handles three screen-control platform channels for KVL Track:
 *
 *  1. `com.kvl.track/screen_mirror_events` — EventChannel that pushes JPEG
 *     frames captured via MediaProjection to Flutter / WebSocket.
 *  2. `com.kvl.track/screen_mirror`        — MethodChannel for permission
 *     acquisition and capture lifecycle (start / stop).
 *  3. `com.kvl.track/screenshot`           — MethodChannel that triggers a
 *     full-screen screenshot via the accessibility service and returns the
 *     path of the saved image.
 *  4. `com.kvl.track/screen_control`       — MethodChannel for accessibility
 *     status, settings navigation, and gesture dispatch.
 */
class ScreenHandler(private val context: Context, private val activity: Activity?) {

    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null
    private var capturing = false
    private var screenEventSink: EventChannel.EventSink? = null

    companion object {
        const val MEDIA_PROJECTION_REQUEST_CODE = 1001

        /** Callback invoked once the user responds to the MediaProjection permission dialog. */
        var pendingProjectionResult: ((MediaProjection?) -> Unit)? = null
    }

    // ── Channel registration ──────────────────────────────────────────────────

    fun register(messenger: BinaryMessenger) {
        // ── 1. Screen mirror event channel ────────────────────────────────────
        EventChannel(messenger, "com.kvl.track/screen_mirror_events")
            .setStreamHandler(object : EventChannel.StreamHandler {
                override fun onListen(args: Any?, sink: EventChannel.EventSink) {
                    screenEventSink = sink
                }
                override fun onCancel(args: Any?) {
                    screenEventSink = null
                }
            })

        // ── 2. Screen mirror method channel ───────────────────────────────────
        MethodChannel(messenger, "com.kvl.track/screen_mirror")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "requestScreenCapturePermission" -> {
                        val pm = context.getSystemService(Context.MEDIA_PROJECTION_SERVICE)
                                as MediaProjectionManager
                        activity?.startActivityForResult(
                            pm.createScreenCaptureIntent(),
                            MEDIA_PROJECTION_REQUEST_CODE
                        )
                        result.success(true)
                    }
                    "hasScreenCapturePermission" -> result.success(mediaProjection != null)
                    "startScreenCapture"        -> { startCapture(); result.success(true) }
                    "stopScreenCapture"         -> { stopCapture(); result.success(true) }
                    else                        -> result.notImplemented()
                }
            }

        // ── 3. Screenshot method channel ──────────────────────────────────────
        MethodChannel(messenger, "com.kvl.track/screenshot")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "takeScreenshot" -> {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                            KvlAccessibilityService.instance
                                ?.performGlobalAction(AS.GLOBAL_ACTION_TAKE_SCREENSHOT)
                            // Wait for the system to write the image before querying MediaStore.
                            Handler(Looper.getMainLooper()).postDelayed({
                                result.success(getLatestScreenshotPath())
                            }, 800)
                        } else {
                            result.error("API_LEVEL", "Requires Android 9+", null)
                        }
                    }
                    else -> result.notImplemented()
                }
            }

        // ── 4. Screen control method channel ──────────────────────────────────
        MethodChannel(messenger, "com.kvl.track/screen_control")
            .setMethodCallHandler { call, result ->
                val svc = KvlAccessibilityService.instance
                when (call.method) {
                    "isAccessibilityEnabled" -> {
                        val am = context.getSystemService(Context.ACCESSIBILITY_SERVICE)
                                as android.view.accessibility.AccessibilityManager
                        result.success(am.isEnabled && svc != null)
                    }
                    "openAccessibilitySettings" -> {
                        context.startActivity(
                            Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS)
                                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        )
                        result.success(true)
                    }
                    "dispatchTap" -> {
                        val x = call.argument<Double>("x") ?: 0.0
                        val y = call.argument<Double>("y") ?: 0.0
                        val metrics = context.resources.displayMetrics
                        val px = (x * metrics.widthPixels).toFloat()
                        val py = (y * metrics.heightPixels).toFloat()
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            val path = Path().apply { moveTo(px, py) }
                            val stroke = GestureDescription.StrokeDescription(path, 0L, 50L)
                            val gesture = GestureDescription.Builder().addStroke(stroke).build()
                            svc?.dispatchGesture(gesture, null, null)
                        }
                        result.success(true)
                    }
                    "dispatchSwipe" -> {
                        val metrics = context.resources.displayMetrics
                        val x1 = ((call.argument<Double>("x1") ?: 0.0) * metrics.widthPixels).toFloat()
                        val y1 = ((call.argument<Double>("y1") ?: 0.0) * metrics.heightPixels).toFloat()
                        val x2 = ((call.argument<Double>("x2") ?: 0.0) * metrics.widthPixels).toFloat()
                        val y2 = ((call.argument<Double>("y2") ?: 0.0) * metrics.heightPixels).toFloat()
                        val dur = (call.argument<Int>("duration") ?: 300).toLong()
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            val path = Path().apply { moveTo(x1, y1); lineTo(x2, y2) }
                            val stroke = GestureDescription.StrokeDescription(path, 0L, dur)
                            val gesture = GestureDescription.Builder().addStroke(stroke).build()
                            svc?.dispatchGesture(gesture, null, null)
                        }
                        result.success(true)
                    }
                    "performGlobalAction" -> {
                        val action = when (call.argument<String>("action")) {
                            "back"    -> AS.GLOBAL_ACTION_BACK
                            "home"    -> AS.GLOBAL_ACTION_HOME
                            "recents" -> AS.GLOBAL_ACTION_RECENTS
                            else      -> AS.GLOBAL_ACTION_BACK
                        }
                        svc?.performGlobalAction(action)
                        result.success(true)
                    }
                    else -> result.notImplemented()
                }
            }
    }

    // ── Activity result ───────────────────────────────────────────────────────

    /** Must be called from [MainActivity.onActivityResult] to receive the MediaProjection token. */
    fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == MEDIA_PROJECTION_REQUEST_CODE) {
            val pm = context.getSystemService(Context.MEDIA_PROJECTION_SERVICE)
                    as MediaProjectionManager
            mediaProjection = if (resultCode == Activity.RESULT_OK && data != null) {
                pm.getMediaProjection(resultCode, data)
            } else {
                null
            }
            pendingProjectionResult?.invoke(mediaProjection)
        }
    }

    // ── MediaProjection capture ───────────────────────────────────────────────

    private fun startCapture() {
        val mp = mediaProjection ?: return
        val metrics = context.resources.displayMetrics
        // Capture at half resolution to reduce bandwidth.
        val width  = metrics.widthPixels  / 2
        val height = metrics.heightPixels / 2

        imageReader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
        virtualDisplay = mp.createVirtualDisplay(
            "kvl_mirror",
            width,
            height,
            metrics.densityDpi,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            imageReader!!.surface,
            null,
            null
        )
        capturing = true

        Thread {
            while (capturing) {
                try {
                    val image: Image = imageReader!!.acquireLatestImage() ?: continue
                    val planes      = image.planes
                    val buffer      = planes[0].buffer
                    val pixelStride = planes[0].pixelStride
                    val rowStride   = planes[0].rowStride
                    val rowPadding  = rowStride - pixelStride * width

                    val bmp = Bitmap.createBitmap(
                        width + rowPadding / pixelStride,
                        height,
                        Bitmap.Config.ARGB_8888
                    )
                    bmp.copyPixelsFromBuffer(buffer)
                    image.close()

                    val out = ByteArrayOutputStream()
                    bmp.compress(Bitmap.CompressFormat.JPEG, 50, out)
                    val b64 = android.util.Base64.encodeToString(
                        out.toByteArray(), android.util.Base64.NO_WRAP
                    )

                    val frameData = mapOf("data" to b64, "w" to width, "h" to height)
                    Handler(Looper.getMainLooper()).post {
                        screenEventSink?.success(frameData)
                    }
                    Thread.sleep(200) // ~5 fps
                } catch (_: Exception) {
                    Thread.sleep(500)
                }
            }
        }.start()
    }

    private fun stopCapture() {
        capturing = false
        virtualDisplay?.release(); virtualDisplay = null
        imageReader?.close();      imageReader    = null
    }

    // ── Screenshot path ───────────────────────────────────────────────────────

    private fun getLatestScreenshotPath(): String? {
        val projection = arrayOf(
            MediaStore.Images.Media.DATA,
            MediaStore.Images.Media.DATE_ADDED
        )
        context.contentResolver.query(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            projection,
            null,
            null,
            "${MediaStore.Images.Media.DATE_ADDED} DESC"
        )?.use { cursor ->
            if (cursor.moveToFirst()) {
                val idx = cursor.getColumnIndex(MediaStore.Images.Media.DATA)
                return if (idx >= 0) cursor.getString(idx) else null
            }
        }
        return null
    }
}
