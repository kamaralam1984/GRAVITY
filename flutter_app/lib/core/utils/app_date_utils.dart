import 'package:intl/intl.dart';

/// DateTime extension providing human-friendly formatting helpers.
extension DateTimeExt on DateTime {
  // ── Relative time ─────────────────────────────────────────────────────────

  /// Returns strings like "2 min ago", "Yesterday", or "Jun 25".
  String get timeAgo {
    final now = DateTime.now();
    final diff = now.difference(this);

    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) {
      final mins = diff.inMinutes;
      return '$mins min${mins == 1 ? '' : 's'} ago';
    }
    if (diff.inHours < 24 && isToday) {
      final hrs = diff.inHours;
      return '$hrs hr${hrs == 1 ? '' : 's'} ago';
    }
    if (isYesterday) return 'Yesterday';
    if (diff.inDays < 7) {
      return DateFormat('EEEE').format(this); // "Monday"
    }
    return shortDate;
  }

  /// "2:30 PM"
  String get shortTime => DateFormat('h:mm a').format(this);

  /// "Jun 25, 2026"
  String get shortDate => DateFormat('MMM d, y').format(this);

  /// "Jun 25"
  String get monthDay => DateFormat('MMM d').format(this);

  /// "Jun 25, 2:30 PM"
  String get fullDateTime => DateFormat('MMM d, h:mm a').format(this);

  /// "Wednesday, June 25, 2026"
  String get longDate => DateFormat('EEEE, MMMM d, y').format(this);

  /// "2026-06-25" (ISO date only)
  String get isoDate => DateFormat('yyyy-MM-dd').format(this);

  /// "09:30" (24h HH:mm)
  String get time24 => DateFormat('HH:mm').format(this);

  // ── Boolean checks ────────────────────────────────────────────────────────

  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  bool get isTomorrow {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return year == tomorrow.year &&
        month == tomorrow.month &&
        day == tomorrow.day;
  }

  bool get isThisWeek {
    final now = DateTime.now();
    return now.difference(this).inDays.abs() < 7;
  }

  bool get isThisYear => year == DateTime.now().year;

  // ── Chat-specific ─────────────────────────────────────────────────────────

  /// Smart chat timestamp: "2:30 PM" today, "Yesterday", weekday, or date.
  String get chatTimestamp {
    if (isToday) return shortTime;
    if (isYesterday) return 'Yesterday';
    if (isThisWeek) return DateFormat('EEE').format(this); // "Mon"
    return monthDay;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  DateTime get startOfDay => DateTime(year, month, day);

  DateTime get endOfDay =>
      DateTime(year, month, day, 23, 59, 59, 999);

  DateTime get startOfWeek {
    final diff = weekday - DateTime.monday;
    return subtract(Duration(days: diff)).startOfDay;
  }

  /// Whether two DateTimes fall on the same calendar day.
  bool isSameDay(DateTime other) =>
      year == other.year && month == other.month && day == other.day;
}

/// Static helpers that do not need an instance.
class AppDateUtils {
  AppDateUtils._();

  static String formatDuration(Duration duration) {
    if (duration.inSeconds < 60) return '${duration.inSeconds}s';
    if (duration.inMinutes < 60) return '${duration.inMinutes}m';
    final h = duration.inHours;
    final m = duration.inMinutes.remainder(60);
    return m == 0 ? '${h}h' : '${h}h ${m}m';
  }

  static String formatCountdown(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds.remainder(60);
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  /// Parse ISO 8601 string safely, returning null on failure.
  static DateTime? tryParse(String? raw) {
    if (raw == null) return null;
    return DateTime.tryParse(raw);
  }

  /// Humanize a date relative to now, e.g. for activity feeds.
  static String relative(DateTime dt) => dt.timeAgo;
}
