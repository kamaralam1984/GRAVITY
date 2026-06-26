import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../services/fake_call_service.dart';

/// Fully client-side "fake call" tool. Lets the user pick a caller and a
/// delay, then plays a ringing incoming-call screen so they can excuse
/// themselves from an uncomfortable situation. No backend involved.
class FakeCallScreen extends StatefulWidget {
  const FakeCallScreen({super.key});

  @override
  State<FakeCallScreen> createState() => _FakeCallScreenState();
}

enum _CallPhase { setup, ringing, inCall }

class _FakeCallScreenState extends State<FakeCallScreen> {
  final _service = FakeCallService.instance;
  final _nameCtrl = TextEditingController(text: 'Mom');
  final _numberCtrl = TextEditingController(text: '+1 (555) 0142');

  _CallPhase _phase = _CallPhase.setup;
  String _delayKey = 'Now';
  Duration _callDuration = Duration.zero;
  Timer? _callTimer;

  @override
  void dispose() {
    _service.dispose();
    _callTimer?.cancel();
    _nameCtrl.dispose();
    _numberCtrl.dispose();
    super.dispose();
  }

  void _selectPreset(FakeCaller caller) {
    setState(() {
      _nameCtrl.text = caller.name;
      _numberCtrl.text = caller.number;
    });
  }

  void _startSchedule() {
    final delay = FakeCallService.delays[_delayKey] ?? Duration.zero;
    _service.schedule(delay, _beginRinging);
    if (delay == Duration.zero) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Fake call scheduled in $_delayKey'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _beginRinging() {
    if (!mounted) return;
    _service.startRinging();
    setState(() => _phase = _CallPhase.ringing);
  }

  void _accept() {
    _service.stopRinging();
    setState(() {
      _phase = _CallPhase.inCall;
      _callDuration = Duration.zero;
    });
    _callTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _callDuration += const Duration(seconds: 1));
    });
  }

  void _endCall() {
    _service.stopRinging();
    _service.cancelSchedule();
    _callTimer?.cancel();
    setState(() => _phase = _CallPhase.setup);
  }

  @override
  Widget build(BuildContext context) {
    switch (_phase) {
      case _CallPhase.setup:
        return _buildSetup(context);
      case _CallPhase.ringing:
        return _buildCall(context, ringing: true);
      case _CallPhase.inCall:
        return _buildCall(context, ringing: false);
    }
  }

  // ── Setup ─────────────────────────────────────────────────────────────────

  Widget _buildSetup(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        leading: BackButton(color: context.textPrimary),
        title: Text('Fake Call', style: AppTextStyles.headline3(context)),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: context.primaryColor.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: context.primaryColor.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Icon(Icons.shield_rounded,
                      color: context.primaryColor, size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Trigger a realistic incoming call to gracefully '
                      'exit any situation.',
                      style: AppTextStyles.body2(context),
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 350.ms),
            const SizedBox(height: 24),

            Text('Caller', style: AppTextStyles.subtitle2(context)),
            const SizedBox(height: 12),
            _field(context, _nameCtrl, 'Caller name', Icons.person_rounded),
            const SizedBox(height: 10),
            _field(context, _numberCtrl, 'Phone number', Icons.phone_rounded,
                keyboard: TextInputType.phone),
            const SizedBox(height: 16),

            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final p in FakeCallService.presets)
                  GestureDetector(
                    onTap: () => _selectPreset(p),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: _nameCtrl.text == p.name
                            ? context.primaryColor
                            : context.surface2Color,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        p.name,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: _nameCtrl.text == p.name
                              ? Colors.white
                              : context.textSecondary,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 28),

            Text('Ring after', style: AppTextStyles.subtitle2(context)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final key in FakeCallService.delays.keys)
                  GestureDetector(
                    onTap: () => setState(() => _delayKey = key),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: _delayKey == key
                            ? context.accentColor
                            : context.surface2Color,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Text(
                        key,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: _delayKey == key
                              ? Colors.white
                              : context.textSecondary,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 36),

            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton.icon(
                onPressed: _startSchedule,
                icon: const Icon(Icons.call_rounded, size: 20),
                label: Text(
                  _delayKey == 'Now' ? 'Start Fake Call' : 'Schedule Fake Call',
                  style: AppTextStyles.buttonWhite(context),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: context.safeColor,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ).animate().fadeIn(duration: 300.ms).scale(
                begin: const Offset(0.97, 0.97),
                end: const Offset(1, 1),
                curve: Curves.easeOut),
          ],
        ),
      ),
    );
  }

  Widget _field(
    BuildContext context,
    TextEditingController ctrl,
    String hint,
    IconData icon, {
    TextInputType? keyboard,
  }) {
    return TextField(
      controller: ctrl,
      keyboardType: keyboard,
      onChanged: (_) => setState(() {}),
      style: AppTextStyles.body1(context),
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, color: context.textMuted, size: 20),
        filled: true,
        fillColor: context.surfaceColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: context.borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: context.borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: context.primaryColor, width: 1.5),
        ),
      ),
    );
  }

  // ── Incoming / Active Call ──────────────────────────────────────────────────

  String _formatDuration(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  Widget _buildCall(BuildContext context, {required bool ringing}) {
    final name = _nameCtrl.text.trim().isEmpty ? 'Unknown' : _nameCtrl.text;
    final number = _numberCtrl.text;
    final initials = name.isNotEmpty ? name[0].toUpperCase() : '?';

    return WillPopScope(
      onWillPop: () async {
        _endCall();
        return false;
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0B0D13),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
            child: Column(
              children: [
                const SizedBox(height: 24),
                Text(
                  ringing ? 'Incoming call' : _formatDuration(_callDuration),
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFFA8A29E),
                  ),
                ),
                const SizedBox(height: 40),
                _avatar(initials, ringing),
                const SizedBox(height: 28),
                Text(
                  name,
                  style: const TextStyle(
                    fontFamily: 'PlusJakartaSans',
                    fontSize: 30,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFF0EDE8),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  number,
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 16,
                    color: Color(0xFFA8A29E),
                  ),
                ),
                const Spacer(),
                if (ringing)
                  _ringingControls(context)
                else
                  _activeControls(context),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _avatar(String initials, bool ringing) {
    final core = Container(
      width: 128,
      height: 128,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [Color(0xFF4B80F0), Color(0xFF9B6BF5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: const TextStyle(
          fontFamily: 'PlusJakartaSans',
          fontSize: 48,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    );
    if (!ringing) return core;
    return core
        .animate(onPlay: (c) => c.repeat())
        .scale(
          duration: 900.ms,
          begin: const Offset(1, 1),
          end: const Offset(1.06, 1.06),
          curve: Curves.easeInOut,
        )
        .then()
        .scale(
          duration: 900.ms,
          begin: const Offset(1.06, 1.06),
          end: const Offset(1, 1),
          curve: Curves.easeInOut,
        );
  }

  Widget _ringingControls(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _callButton(
          color: const Color(0xFFEF4444),
          icon: Icons.call_end_rounded,
          label: 'Decline',
          onTap: _endCall,
        ),
        _callButton(
          color: const Color(0xFF10B981),
          icon: Icons.call_rounded,
          label: 'Accept',
          onTap: _accept,
        ).animate(onPlay: (c) => c.repeat(reverse: true)).shimmer(
            duration: 1200.ms, color: Colors.white.withOpacity(0.4)),
      ],
    );
  }

  Widget _activeControls(BuildContext context) {
    return Column(
      children: [
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _MiniAction(icon: Icons.mic_off_rounded, label: 'Mute'),
            _MiniAction(icon: Icons.dialpad_rounded, label: 'Keypad'),
            _MiniAction(icon: Icons.volume_up_rounded, label: 'Speaker'),
          ],
        ),
        const SizedBox(height: 32),
        _callButton(
          color: const Color(0xFFEF4444),
          icon: Icons.call_end_rounded,
          label: 'End',
          onTap: _endCall,
        ),
      ],
    );
  }

  Widget _callButton({
    required Color color,
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.4),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 32),
          ),
        ),
        const SizedBox(height: 10),
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            color: Color(0xFFA8A29E),
          ),
        ),
      ],
    );
  }
}

class _MiniAction extends StatelessWidget {
  const _MiniAction({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: const BoxDecoration(
            color: Color(0xFF1F2435),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: const Color(0xFFF0EDE8), size: 26),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 12,
            color: Color(0xFF857970),
          ),
        ),
      ],
    );
  }
}
