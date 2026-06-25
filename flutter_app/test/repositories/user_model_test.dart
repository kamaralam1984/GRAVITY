import 'package:flutter_test/flutter_test.dart';
import 'package:kvl_track/models/user_model.dart';

void main() {
  group('User model', () {
    final sampleJson = {
      'id': 42,
      'name': 'John Doe',
      'email': 'john@example.com',
      'phone': '+60123456789',
      'avatar_url': 'https://example.com/avatar.jpg',
      'is_active': true,
      'role': 'user',
      'family_role': 'parent',
      'created_at': '2026-01-15T10:30:00Z',
    };

    test('fromJson parses all fields correctly', () {
      final user = User.fromJson(sampleJson);
      expect(user.id, 42);
      expect(user.name, 'John Doe');
      expect(user.email, 'john@example.com');
      expect(user.phone, '+60123456789');
      expect(user.avatarUrl, 'https://example.com/avatar.jpg');
      expect(user.isActive, isTrue);
      expect(user.role, 'user');
      expect(user.familyRole, 'parent');
      expect(user.createdAt, isNotNull);
    });

    test('initials returns first letters of first and last name', () {
      final user = User.fromJson(sampleJson);
      expect(user.initials, 'JD');
    });

    test('initials with single word name', () {
      final user = User.fromJson({...sampleJson, 'name': 'Madonna'});
      expect(user.initials, 'M');
    });

    test('isParent returns true for parent family_role', () {
      final user = User.fromJson(sampleJson);
      expect(user.isParent, isTrue);
      expect(user.isChild, isFalse);
    });

    test('toJson round-trips correctly', () {
      final user = User.fromJson(sampleJson);
      final json = user.toJson();
      expect(json['id'], 42);
      expect(json['email'], 'john@example.com');
      expect(json['family_role'], 'parent');
    });

    test('copyWith preserves unchanged fields', () {
      final user = User.fromJson(sampleJson);
      final updated = user.copyWith(name: 'Jane Doe');
      expect(updated.name, 'Jane Doe');
      expect(updated.email, user.email);
      expect(updated.id, user.id);
    });
  });
}
