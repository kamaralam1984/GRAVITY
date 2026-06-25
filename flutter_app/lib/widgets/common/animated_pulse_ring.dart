import 'package:flutter/material.dart';

/// Animated concentric pulsing rings radiating outward from a centre widget.
///
/// Typically placed inside a [Stack] behind a marker or button.  Three rings
/// animate simultaneously with staggered opacity, giving a sonar / heartbeat
/// effect.
///
/// [color]       — ring colour (usually the brand primary or SOS red).
/// [size]        — diameter of the innermost (non-animated) circle.
/// [ringCount]   — number of concentric rings to render (default 3).
/// [ringSpacing] — additional diameter added per ring step (default 20 px).
/// [child]       — optional widget drawn at the centre.
///
/// Example:
/// ```dart
/// AnimatedPulseRing(
///   color: Color(0xFFDC2626), // SOS red
///   size: 56,
///   child: Icon(Icons.warning_rounded, color: Colors.white),
/// )
/// ```
class AnimatedPulseRing extends StatefulWidget {
  const AnimatedPulseRing({
    super.key,
    required this.color,
    required this.size,
    this.ringCount = 3,
    this.ringSpacing = 20.0,
    this.duration = const Duration(seconds: 2),
    this.child,
  }) : assert(ringCount > 0, 'ringCount must be at least 1');

  final Color color;
  final double size;
  final int ringCount;
  final double ringSpacing;
  final Duration duration;
  final Widget? child;

  @override
  State<AnimatedPulseRing> createState() => _AnimatedPulseRingState();
}

class _AnimatedPulseRingState extends State<AnimatedPulseRing>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..repeat();

    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (_, __) {
        return Stack(
          alignment: Alignment.center,
          children: [
            // Render rings from outermost to innermost.
            for (int i = widget.ringCount - 1; i >= 0; i--)
              _buildRing(i),
            // Centre widget (innermost circle or child).
            if (widget.child != null)
              SizedBox(
                width: widget.size,
                height: widget.size,
                child: widget.child,
              )
            else
              SizedBox(width: widget.size, height: widget.size),
          ],
        );
      },
    );
  }

  Widget _buildRing(int index) {
    final progress = _animation.value;
    final ringDiameter = widget.size + (index + 1) * widget.ringSpacing;

    // Each ring starts fading out as the animation progresses.
    // Outer rings (higher index) start fading earlier.
    final opacityBase = (1.0 - progress) * 0.35 / (index + 1);
    final opacity = opacityBase.clamp(0.0, 0.35);

    return Container(
      width: ringDiameter,
      height: ringDiameter,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: widget.color.withOpacity(opacity),
      ),
    );
  }
}
