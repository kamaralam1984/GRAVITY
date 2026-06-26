import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';
import '../../widgets/common/avatar_widget.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl;
  late final TextEditingController _phoneCtrl;
  File? _pendingAvatar;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProvider);
    _nameCtrl = TextEditingController(text: user?.name ?? '');
    _phoneCtrl = TextEditingController(text: user?.phone ?? '');
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final picker = ImagePicker();
    final img =
        await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (img != null && mounted) {
      setState(() => _pendingAvatar = File(img.path));
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    String? avatarUrl;
    if (_pendingAvatar != null) {
      // In a real implementation, upload _pendingAvatar to server and get URL
      avatarUrl = null; // placeholder
    }

    final ok = await ref.read(authProvider.notifier).updateProfile(
          name: _nameCtrl.text.trim(),
          phone: _phoneCtrl.text.trim().isEmpty
              ? null
              : _phoneCtrl.text.trim(),
        );

    if (!mounted) return;
    setState(() => _saving = false);

    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Profile updated successfully'),
          backgroundColor: context.safeColor,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      Navigator.pop(context);
    } else {
      final error = ref.read(authProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error ?? 'Failed to update profile'),
          backgroundColor: context.sosColor,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        leading: BackButton(color: context.textPrimary),
        title: Text('Edit Profile',
            style: AppTextStyles.headline3(context)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Avatar picker
              Center(
                child: GestureDetector(
                  onTap: _pickAvatar,
                  child: Stack(
                    children: [
                      _pendingAvatar != null
                          ? CircleAvatar(
                              radius: 52,
                              backgroundImage: FileImage(_pendingAvatar!),
                            )
                          : AvatarWidget(
                              name: user?.name ?? 'User',
                              imageUrl: user?.avatarUrl,
                              size: 104,
                            ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: context.primaryColor,
                            shape: BoxShape.circle,
                            border: Border.all(
                                color: context.bgColor, width: 2),
                          ),
                          child: const Icon(Icons.camera_alt_rounded,
                              color: Colors.white, size: 16),
                        ),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(duration: 400.ms).scale(
                    begin: const Offset(0.9, 0.9),
                    end: const Offset(1, 1),
                    curve: Curves.easeOut,
                  ),

              const SizedBox(height: 8),

              Text(
                'Tap to change photo',
                style: AppTextStyles.caption(context),
              ),

              const SizedBox(height: 28),

              // Name
              AppTextField(
                controller: _nameCtrl,
                label: 'Full Name',
                hint: 'Enter your name',
                prefixIcon: Icons.person_outline_rounded,
                validator: (v) {
                  if (v == null || v.trim().isEmpty) {
                    return 'Name is required';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Phone
              AppTextField(
                controller: _phoneCtrl,
                label: 'Phone Number',
                hint: '+1 234 567 8900',
                prefixIcon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
                validator: (_) => null,
              ),

              const SizedBox(height: 16),

              // Email (read-only)
              AppTextField(
                controller: TextEditingController(text: user?.email ?? ''),
                label: 'Email',
                hint: '',
                prefixIcon: Icons.email_outlined,
                readOnly: true,
                validator: (_) => null,
              ),

              const SizedBox(height: 8),

              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Email cannot be changed',
                  style:
                      AppTextStyles.caption(context).copyWith(fontSize: 11),
                ),
              ),

              const SizedBox(height: 32),

              AppButton.primary(
                label: 'Save Changes',
                isLoading: _saving,
                icon: Icons.check_rounded,
                width: double.infinity,
                onPressed: _save,
              ).animate(delay: 200.ms).fadeIn(duration: 400.ms).slideY(
                    begin: 0.1, end: 0, curve: Curves.easeOut),
            ],
          ),
        ),
      ),
    );
  }
}
