import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../repositories/emergency_repository.dart';
import '../../widgets/common/app_button.dart';

/// Lets the user store medical / emergency information surfaced during an SOS.
class EmergencyProfileScreen extends ConsumerStatefulWidget {
  const EmergencyProfileScreen({super.key});

  @override
  ConsumerState<EmergencyProfileScreen> createState() =>
      _EmergencyProfileScreenState();
}

class _EmergencyProfileScreenState
    extends ConsumerState<EmergencyProfileScreen> {
  final _bloodType = TextEditingController();
  final _allergies = TextEditingController();
  final _medications = TextEditingController();
  final _conditions = TextEditingController();
  final _contactName = TextEditingController();
  final _contactPhone = TextEditingController();
  final _insurance = TextEditingController();
  final _notes = TextEditingController();

  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final profile = await EmergencyRepository.instance.getMyProfile();
    if (!mounted) return;
    if (profile != null) {
      _bloodType.text = profile.bloodType ?? '';
      _allergies.text = profile.allergies ?? '';
      _medications.text = profile.medications ?? '';
      _conditions.text = profile.conditions ?? '';
      _contactName.text = profile.emergencyContactName ?? '';
      _contactPhone.text = profile.emergencyContactPhone ?? '';
      _insurance.text = profile.insuranceProvider ?? '';
      _notes.text = profile.notes ?? '';
    }
    setState(() => _loading = false);
  }

  String? _v(TextEditingController c) =>
      c.text.trim().isEmpty ? null : c.text.trim();

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await EmergencyRepository.instance.saveProfile(
        EmergencyProfile(
          bloodType: _v(_bloodType),
          allergies: _v(_allergies),
          medications: _v(_medications),
          conditions: _v(_conditions),
          emergencyContactName: _v(_contactName),
          emergencyContactPhone: _v(_contactPhone),
          insuranceProvider: _v(_insurance),
          notes: _v(_notes),
        ),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Emergency profile saved'),
          backgroundColor: context.safeColor,
        ),
      );
      Navigator.of(context).maybePop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not save: $e'),
          backgroundColor: context.sosColor,
        ),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  void dispose() {
    _bloodType.dispose();
    _allergies.dispose();
    _medications.dispose();
    _conditions.dispose();
    _contactName.dispose();
    _contactPhone.dispose();
    _insurance.dispose();
    _notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        title: Text('Emergency Profile',
            style: AppTextStyles.headline3(context)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _Banner()
                    .animate()
                    .fadeIn(duration: 350.ms)
                    .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
                const SizedBox(height: 20),
                _section(context, 'MEDICAL'),
                _field(context,
                    label: 'Blood type',
                    hint: 'e.g. O+',
                    controller: _bloodType,
                    icon: Icons.bloodtype_rounded),
                _field(context,
                    label: 'Allergies',
                    hint: 'Penicillin, peanuts…',
                    controller: _allergies,
                    icon: Icons.warning_amber_rounded,
                    maxLines: 2),
                _field(context,
                    label: 'Current medications',
                    hint: 'Names & dosages',
                    controller: _medications,
                    icon: Icons.medication_rounded,
                    maxLines: 2),
                _field(context,
                    label: 'Medical conditions',
                    hint: 'Diabetes, asthma…',
                    controller: _conditions,
                    icon: Icons.monitor_heart_rounded,
                    maxLines: 2),
                const SizedBox(height: 20),
                _section(context, 'EMERGENCY CONTACT'),
                _field(context,
                    label: 'Contact name',
                    hint: 'Full name',
                    controller: _contactName,
                    icon: Icons.person_rounded),
                _field(context,
                    label: 'Contact phone',
                    hint: 'Phone number',
                    controller: _contactPhone,
                    icon: Icons.phone_rounded,
                    keyboardType: TextInputType.phone),
                _field(context,
                    label: 'Insurance provider',
                    hint: 'Provider / policy no.',
                    controller: _insurance,
                    icon: Icons.shield_rounded),
                const SizedBox(height: 20),
                _section(context, 'OTHER'),
                _field(context,
                    label: 'Additional notes',
                    hint: 'Anything responders should know',
                    controller: _notes,
                    icon: Icons.notes_rounded,
                    maxLines: 4),
                const SizedBox(height: 28),
                AppButton.primary(
                  label: 'Save Profile',
                  icon: Icons.check_rounded,
                  isLoading: _saving,
                  onPressed: _save,
                ),
                SizedBox(
                    height: MediaQuery.of(context).padding.bottom + 24),
              ],
            ),
    );
  }

  Widget _section(BuildContext context, String title) => Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 10),
        child: Text(title, style: AppTextStyles.overline(context)),
      );

  Widget _field(
    BuildContext context, {
    required String label,
    required String hint,
    required TextEditingController controller,
    required IconData icon,
    int maxLines = 1,
    TextInputType? keyboardType,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        style: AppTextStyles.body2(context)
            .copyWith(color: context.textPrimary),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: AppTextStyles.caption(context),
          hintText: hint,
          hintStyle: AppTextStyles.caption(context)
              .copyWith(color: context.textMuted),
          prefixIcon: Icon(icon, color: context.primaryColor, size: 20),
          filled: true,
          fillColor: context.surfaceColor,
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: context.borderColor),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: context.primaryColor, width: 1.5),
          ),
        ),
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.sosColor.withOpacity(0.10),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.sosColor.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Icon(Icons.medical_information_rounded,
              color: context.sosColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'This information is shared with your family and first responders when you trigger an SOS.',
              style: AppTextStyles.caption(context)
                  .copyWith(color: context.textSecondary, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
