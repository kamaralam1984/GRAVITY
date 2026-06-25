import 'package:flutter/material.dart';

/// Renders [text] with a horizontal linear gradient applied as a shader mask.
///
/// The [colors] list must contain at least two colours.  If no [style] is
/// given a 16 sp regular style is used.  The actual `color` on the [TextStyle]
/// is overridden internally — only the other style attributes are preserved.
///
/// Example:
/// ```dart
/// GradientText(
///   'KVL Track',
///   colors: [Color(0xFF1A56DB), Color(0xFF6D28D9)],
///   style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700),
/// )
/// ```
class GradientText extends StatelessWidget {
  const GradientText(
    this.text, {
    super.key,
    required this.colors,
    this.style,
    this.textAlign,
    this.maxLines,
    this.overflow,
  }) : assert(colors.length >= 2, 'GradientText requires at least 2 colors');

  /// The string to display.
  final String text;

  /// Gradient colour stops — minimum 2.
  final List<Color> colors;

  /// Base text style.  The [TextStyle.color] is ignored and replaced by the
  /// gradient shader.
  final TextStyle? style;

  /// Horizontal text alignment.
  final TextAlign? textAlign;

  /// Maximum number of lines.
  final int? maxLines;

  /// Overflow behaviour.
  final TextOverflow? overflow;

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (Rect bounds) {
        return LinearGradient(
          colors: colors,
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ).createShader(
          Rect.fromLTWH(0, 0, bounds.width, bounds.height),
        );
      },
      blendMode: BlendMode.srcIn,
      child: Text(
        text,
        style: (style ?? const TextStyle()).copyWith(
          // Colour must be white so the ShaderMask blends correctly.
          color: Colors.white,
        ),
        textAlign: textAlign,
        maxLines: maxLines,
        overflow: overflow,
      ),
    );
  }
}
