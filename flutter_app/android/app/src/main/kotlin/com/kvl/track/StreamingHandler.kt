package com.kvl.track

import android.content.Context
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Handler
import android.os.Looper
import io.flutter.plugin.common.BinaryMessenger
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel

/**
 * Registers platform channels for live audio streaming and flashlight control.
 *
 * Channels exposed:
 *   - EventChannel  "com.kvl.track/audio_stream_events"  — raw PCM chunks (ByteArray)
 *   - MethodChannel "com.kvl.track/audio_stream"          — startAudioCapture / stopAudioCapture
 *   - MethodChannel "com.kvl.track/flashlight"            — setTorch(enable) / isTorchOn
 *
 * Register this from [MainActivity.configureFlutterEngine] by calling
 *   StreamingHandler(applicationContext).register(messenger)
 */
class StreamingHandler(private val context: Context) {

    private var audioRecord: AudioRecord? = null
    private var audioCapturing = false
    private var audioEventSink: EventChannel.EventSink? = null

    private var mediaRecorder: MediaRecorder? = null
    private var isFileRecording = false
    private var _filePath: String? = null

    // ── Public registration ───────────────────────────────────────────────────

    fun register(messenger: BinaryMessenger) {
        registerAudioEventChannel(messenger)
        registerAudioControlChannel(messenger)
        registerFlashlightChannel(messenger)
        registerRemoteAudioChannel(messenger)
    }

    // ── Audio EventChannel ────────────────────────────────────────────────────

    private fun registerAudioEventChannel(messenger: BinaryMessenger) {
        EventChannel(messenger, "com.kvl.track/audio_stream_events")
            .setStreamHandler(object : EventChannel.StreamHandler {
                override fun onListen(args: Any?, sink: EventChannel.EventSink) {
                    audioEventSink = sink
                }

                override fun onCancel(args: Any?) {
                    audioEventSink = null
                }
            })
    }

    // ── Audio MethodChannel ───────────────────────────────────────────────────

    private fun registerAudioControlChannel(messenger: BinaryMessenger) {
        MethodChannel(messenger, "com.kvl.track/audio_stream")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "startAudioCapture" -> {
                        startAudioCapture()
                        result.success(true)
                    }
                    "stopAudioCapture" -> {
                        stopAudioCapture()
                        result.success(true)
                    }
                    else -> result.notImplemented()
                }
            }
    }

    // ── Flashlight MethodChannel ──────────────────────────────────────────────

    private fun registerFlashlightChannel(messenger: BinaryMessenger) {
        MethodChannel(messenger, "com.kvl.track/flashlight")
            .setMethodCallHandler { call, result ->
                val cm = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
                val cameraId = cm.cameraIdList.firstOrNull { id ->
                    cm.getCameraCharacteristics(id)
                        .get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
                }

                when (call.method) {
                    "setTorch" -> {
                        val enable = call.argument<Boolean>("enable") ?: false
                        if (cameraId != null) {
                            try {
                                cm.setTorchMode(cameraId, enable)
                                result.success(true)
                            } catch (e: Exception) {
                                result.error("TORCH_ERROR", e.message, null)
                            }
                        } else {
                            result.error("NO_CAMERA", "No flash-capable camera found", null)
                        }
                    }
                    "isTorchOn" -> {
                        // Camera2 does not provide a direct torch-state query.
                        // Return false as a safe default; the Flutter side tracks
                        // state via the cached _isOn field after each setTorch call.
                        result.success(false)
                    }
                    else -> result.notImplemented()
                }
            }
    }

    // ── Audio capture ─────────────────────────────────────────────────────────

    private fun startAudioCapture() {
        if (audioCapturing) return

        val sampleRate = 16000
        val minBuffer = AudioRecord.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
        )
        val bufferSize = minBuffer * 4

        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize,
        )

        audioCapturing = true
        audioRecord?.startRecording()

        Thread {
            val buffer = ByteArray(bufferSize)
            val mainHandler = Handler(Looper.getMainLooper())
            while (audioCapturing) {
                val read = audioRecord?.read(buffer, 0, bufferSize) ?: -1
                if (read > 0) {
                    val chunk = buffer.copyOf(read)
                    mainHandler.post { audioEventSink?.success(chunk) }
                }
            }
        }.start()
    }

    private fun stopAudioCapture() {
        audioCapturing = false
        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null
    }

    // ── Remote audio file recording ───────────────────────────────────────────

    private fun registerRemoteAudioChannel(messenger: BinaryMessenger) {
        MethodChannel(messenger, "com.kvl.track/remote_audio")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "startRecording" -> {
                        val path = call.argument<String>("path")
                        if (path == null) {
                            result.error("INVALID_ARG", "path is required", null)
                            return@setMethodCallHandler
                        }
                        startFileRecording(path)
                        result.success(true)
                    }
                    "stopRecording" -> {
                        stopFileRecording()
                        result.success(_filePath)
                    }
                    else -> result.notImplemented()
                }
            }
    }

    @Suppress("DEPRECATION")
    private fun startFileRecording(path: String) {
        if (isFileRecording) return
        _filePath = path
        mediaRecorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setOutputFile(path)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setAudioSamplingRate(16000)
            setAudioEncodingBitRate(64000)
            try { prepare() } catch (e: Exception) { return@apply }
            start()
        }
        isFileRecording = true
    }

    private fun stopFileRecording() {
        if (!isFileRecording) return
        isFileRecording = false
        try { mediaRecorder?.stop() } catch (_: Exception) {}
        mediaRecorder?.release()
        mediaRecorder = null
    }
}
