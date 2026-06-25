import '../constants/app_constants.dart';

/// Form field validators — each returns null on success, error string on fail.
class Validators {
  Validators._();

  // ── Email ─────────────────────────────────────────────────────────────────

  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Email address is required.';
    }
    final trimmed = value.trim();
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$',
    );
    if (!emailRegex.hasMatch(trimmed)) {
      return 'Enter a valid email address.';
    }
    return null;
  }

  // ── Password ──────────────────────────────────────────────────────────────

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required.';
    }
    if (value.length < AppConstants.minPasswordLength) {
      return 'Password must be at least ${AppConstants.minPasswordLength} characters.';
    }
    if (!RegExp(r'[A-Z]').hasMatch(value)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!RegExp(r'[0-9]').hasMatch(value)) {
      return 'Password must contain at least one number.';
    }
    return null;
  }

  static String? validateConfirmPassword(String? value, String original) {
    final base = validatePassword(value);
    if (base != null) return base;
    if (value != original) return 'Passwords do not match.';
    return null;
  }

  // ── Phone ─────────────────────────────────────────────────────────────────

  static String? validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) return null; // Optional field
    final digits = value.replaceAll(RegExp(r'[\s\-\(\)\+]'), '');
    if (digits.length < 7 || digits.length > 15) {
      return 'Enter a valid phone number.';
    }
    if (!RegExp(r'^\d+$').hasMatch(digits)) {
      return 'Phone number must contain only digits.';
    }
    return null;
  }

  static String? validatePhoneRequired(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Phone number is required.';
    }
    return validatePhone(value);
  }

  // ── Required ──────────────────────────────────────────────────────────────

  static String? validateRequired(String? value, String field) {
    if (value == null || value.trim().isEmpty) {
      return '$field is required.';
    }
    return null;
  }

  static String? validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Name is required.';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters.';
    }
    if (value.trim().length > 100) {
      return 'Name must not exceed 100 characters.';
    }
    return null;
  }

  // ── OTP ───────────────────────────────────────────────────────────────────

  static String? validateOtp(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'OTP code is required.';
    }
    final clean = value.trim();
    if (clean.length != AppConstants.otpLength) {
      return 'OTP must be ${AppConstants.otpLength} digits.';
    }
    if (!RegExp(r'^\d+$').hasMatch(clean)) {
      return 'OTP must contain only digits.';
    }
    return null;
  }

  // ── URL ───────────────────────────────────────────────────────────────────

  static String? validateUrl(String? value) {
    if (value == null || value.trim().isEmpty) return null;
    final uri = Uri.tryParse(value.trim());
    if (uri == null || !uri.hasScheme || !uri.hasAuthority) {
      return 'Enter a valid URL.';
    }
    return null;
  }

  // ── Geofence ──────────────────────────────────────────────────────────────

  static String? validateRadius(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Radius is required.';
    }
    final radius = double.tryParse(value.trim());
    if (radius == null) return 'Radius must be a number.';
    if (radius < 50) return 'Radius must be at least 50 metres.';
    if (radius > 50000) return 'Radius must not exceed 50 km.';
    return null;
  }

  // ── Health ────────────────────────────────────────────────────────────────

  static String? validateSteps(String? value) {
    if (value == null || value.trim().isEmpty) return null;
    final v = int.tryParse(value.trim());
    if (v == null || v < 0 || v > 100000) return 'Enter a valid step count.';
    return null;
  }

  static String? validateHeartRate(String? value) {
    if (value == null || value.trim().isEmpty) return null;
    final v = int.tryParse(value.trim());
    if (v == null || v < 30 || v > 300) return 'Enter a valid heart rate (30–300).';
    return null;
  }

  static String? validateSleepHours(String? value) {
    if (value == null || value.trim().isEmpty) return null;
    final v = double.tryParse(value.trim());
    if (v == null || v < 0 || v > 24) return 'Sleep hours must be between 0 and 24.';
    return null;
  }

  // ── Composite ─────────────────────────────────────────────────────────────

  /// Chain multiple validators, returning the first error found.
  static String? compose(
    String? value,
    List<String? Function(String?)> validators,
  ) {
    for (final v in validators) {
      final error = v(value);
      if (error != null) return error;
    }
    return null;
  }
}
