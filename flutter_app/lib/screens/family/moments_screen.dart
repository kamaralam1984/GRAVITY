import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/app_date_utils.dart';
import '../../providers/family_provider.dart';
import '../../providers/moments_provider.dart';
import '../../repositories/chat_repository.dart';
import '../../repositories/moments_repository.dart';
import '../../widgets/common/avatar_widget.dart';

/// Resolves a possibly-relative media URL (e.g. `/chat/upload/3/download`,
/// as returned by the attachment upload endpoint) into a fully qualified
/// network URL. Absolute `http(s)://` URLs are returned unchanged.
String _resolveMediaUrl(String url) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return '${AppConfig.baseUrl}$url';
}

/// Family Moments — a premium social feed where family members share photos
/// and captions with each other.
class MomentsScreen extends ConsumerStatefulWidget {
  const MomentsScreen({super.key});

  @override
  ConsumerState<MomentsScreen> createState() => _MomentsScreenState();
}

class _MomentsScreenState extends ConsumerState<MomentsScreen> {
  int get _familyId => ref.read(familyProvider).selectedFamily?.id ?? 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final fid = _familyId;
    if (fid == 0) return;
    await ref.read(momentsProvider.notifier).loadMoments(fid);
  }

  Future<void> _openComposer() async {
    final fid = _familyId;
    if (fid == 0) {
      _toast('Select a family first');
      return;
    }
    final posted = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ComposerSheet(familyId: fid),
    );
    if (posted == true && mounted) {
      _toast('Moment shared with your family');
    }
  }

  void _toast(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(msg, style: AppTextStyles.body2(context)
              .copyWith(color: Colors.white)),
          backgroundColor: context.primaryColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14)),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(momentsProvider);
    final family = ref.watch(selectedFamilyProvider);
    final fid = family?.id ?? 0;
    final moments = state.momentsFor(fid);

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        titleSpacing: 16,
        leading: BackButton(color: context.textPrimary),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Family Moments',
              style: AppTextStyles.subtitle1(context)
                  .copyWith(color: context.textPrimary),
            ),
            if (family != null)
              Text(
                family.name,
                style: AppTextStyles.caption(context)
                    .copyWith(color: context.textMuted),
              ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      floatingActionButton: _ComposeFab(onTap: _openComposer),
      body: RefreshIndicator(
        color: context.primaryColor,
        backgroundColor: context.surfaceColor,
        onRefresh: _load,
        child: _buildBody(state, moments, fid),
      ),
    );
  }

  Widget _buildBody(MomentsState state, List<Moment> moments, int fid) {
    if (fid == 0) {
      return _EmptyState(
        icon: Icons.group_outlined,
        title: 'No family selected',
        subtitle: 'Join or create a family to start sharing moments.',
      );
    }
    if (state.isLoading && moments.isEmpty) {
      return Center(
        child: CircularProgressIndicator(color: context.primaryColor),
      );
    }
    if (moments.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.18),
          _EmptyState(
            icon: Icons.auto_awesome_rounded,
            title: 'No moments yet',
            subtitle:
                'Share a photo or a thought to start your family feed.',
          ),
        ],
      );
    }
    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 96),
      itemCount: moments.length,
      itemBuilder: (ctx, i) {
        final m = moments[i];
        return _MomentCard(moment: m)
            .animate()
            .fadeIn(duration: 350.ms, delay: (40 * i).ms)
            .slideY(begin: 0.06, end: 0, curve: Curves.easeOut);
      },
    );
  }
}

// ── Compose FAB ───────────────────────────────────────────────────────────────

class _ComposeFab extends StatelessWidget {
  const _ComposeFab({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          gradient: context.primaryGradient,
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: context.primaryColor.withOpacity(0.4),
              blurRadius: 18,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.add_a_photo_rounded,
                color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(
              'Share',
              style: AppTextStyles.button(context)
                  .copyWith(color: Colors.white),
            ),
          ],
        ),
      ),
    ).animate().scale(
          duration: 300.ms,
          begin: const Offset(0.85, 0.85),
          end: const Offset(1, 1),
          curve: Curves.easeOut,
        );
  }
}

// ── Moment Card ───────────────────────────────────────────────────────────────

class _MomentCard extends StatelessWidget {
  const _MomentCard({required this.moment});
  final Moment moment;

  @override
  Widget build(BuildContext context) {
    final name = moment.authorName ?? 'Family member';
    final hasImage =
        moment.imageUrl != null && moment.imageUrl!.isNotEmpty;
    final hasCaption = moment.caption.isNotEmpty;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: context.borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(context.isDark ? 0.25 : 0.05),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
            child: Row(
              children: [
                AvatarWidget(
                  name: name,
                  imageUrl: moment.authorAvatar,
                  size: 42,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: AppTextStyles.subtitle2(context)
                            .copyWith(color: context.textPrimary),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(Icons.schedule_rounded,
                              size: 12, color: context.textMuted),
                          const SizedBox(width: 4),
                          Text(
                            moment.createdAt.timeAgo,
                            style: AppTextStyles.caption(context)
                                .copyWith(color: context.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Image
          if (hasImage)
            ClipRRect(
              borderRadius: hasCaption
                  ? BorderRadius.zero
                  : const BorderRadius.vertical(
                      bottom: Radius.circular(22)),
              child: _MomentImage(url: moment.imageUrl!),
            ),

          // Caption
          if (hasCaption)
            Padding(
              padding: EdgeInsets.fromLTRB(
                  16, hasImage ? 14 : 0, 16, 16),
              child: Text(
                moment.caption,
                style: AppTextStyles.body1(context).copyWith(
                  color: context.textPrimary,
                  height: 1.45,
                ),
              ),
            )
          else if (!hasImage)
            const SizedBox(height: 4),
        ],
      ),
    );
  }
}

class _MomentImage extends StatelessWidget {
  const _MomentImage({required this.url});
  final String url;

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) {
      // No image to show (defensive — callers should already guard on this).
      return Container(
        height: 220,
        width: double.infinity,
        color: context.surface2Color,
        child: Icon(Icons.image_rounded,
            color: context.textMuted, size: 40),
      );
    }
    return CachedNetworkImage(
      imageUrl: _resolveMediaUrl(url),
      width: double.infinity,
      fit: BoxFit.cover,
      placeholder: (_, __) => Container(
        height: 220,
        color: context.surface2Color,
        child: Center(
          child: CircularProgressIndicator(
              color: context.primaryColor, strokeWidth: 2),
        ),
      ),
      errorWidget: (_, __, ___) => Container(
        height: 120,
        color: context.surface2Color,
        child: Icon(Icons.broken_image_rounded,
            color: context.textMuted),
      ),
    );
  }
}

// ── Empty State ───────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 84,
            height: 84,
            decoration: BoxDecoration(
              gradient: context.primaryGradient,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: context.primaryColor.withOpacity(0.35),
                  blurRadius: 24,
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 38),
          ),
          const SizedBox(height: 18),
          Text(title, style: AppTextStyles.headline3(context)),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 48),
            child: Text(
              subtitle,
              style: AppTextStyles.body2(context),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      )
          .animate()
          .fadeIn(duration: 400.ms)
          .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
    );
  }
}

// ── Composer Bottom Sheet ─────────────────────────────────────────────────────

class _ComposerSheet extends ConsumerStatefulWidget {
  const _ComposerSheet({required this.familyId});
  final int familyId;

  @override
  ConsumerState<_ComposerSheet> createState() => _ComposerSheetState();
}

class _ComposerSheetState extends ConsumerState<_ComposerSheet> {
  final TextEditingController _captionCtrl = TextEditingController();
  final TextEditingController _imageUrlCtrl = TextEditingController();
  bool _showImageField = false;
  File? _pickedImage;
  bool _isUploading = false;

  @override
  void dispose() {
    _captionCtrl.dispose();
    _imageUrlCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final XFile? img =
        await picker.pickImage(source: source, imageQuality: 80);
    if (img == null || !mounted) return;
    setState(() {
      _pickedImage = File(img.path);
      _showImageField = false;
      _imageUrlCtrl.clear();
    });
  }

  Future<void> _showImageSourcePicker() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => SafeArea(
        child: Container(
          decoration: BoxDecoration(
            color: context.surfaceColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: Icon(Icons.photo_camera_rounded,
                    color: context.primaryColor),
                title: const Text('Take a photo'),
                onTap: () => Navigator.pop(sheetContext, ImageSource.camera),
              ),
              ListTile(
                leading: Icon(Icons.photo_library_rounded,
                    color: context.primaryColor),
                title: const Text('Choose from gallery'),
                onTap: () => Navigator.pop(sheetContext, ImageSource.gallery),
              ),
            ],
          ),
        ),
      ),
    );
    if (source != null) {
      await _pickImage(source);
    }
  }

  Future<void> _submit() async {
    final caption = _captionCtrl.text.trim();
    final pastedUrl = _imageUrlCtrl.text.trim();
    if (caption.isEmpty && pastedUrl.isEmpty && _pickedImage == null) return;

    String? imageUrl = pastedUrl.isEmpty ? null : pastedUrl;

    if (_pickedImage != null) {
      setState(() => _isUploading = true);
      try {
        imageUrl = await ChatRepository.instance.uploadImage(
          familyId: widget.familyId,
          filePath: _pickedImage!.path,
        );
      } catch (e) {
        if (!mounted) return;
        setState(() => _isUploading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to upload photo: $e'),
            backgroundColor: context.sosColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
        return;
      }
      if (!mounted) return;
      setState(() => _isUploading = false);
    }

    final ok = await ref.read(momentsProvider.notifier).postMoment(
          widget.familyId,
          caption: caption,
          imageUrl: imageUrl,
        );
    if (!mounted) return;
    if (ok) {
      Navigator.pop(context, true);
    } else {
      final err = ref.read(momentsProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(err ?? 'Could not share moment'),
          backgroundColor: context.sosColor,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPosting = ref.watch(momentsProvider).isPosting;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius:
              const BorderRadius.vertical(top: Radius.circular(26)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 5,
                decoration: BoxDecoration(
                  color: context.dividerColor,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
            const SizedBox(height: 18),
            Text('Share a Moment',
                style: AppTextStyles.headline3(context)),
            const SizedBox(height: 4),
            Text(
              'Post a photo or a thought to your family feed.',
              style: AppTextStyles.body2(context),
            ),
            const SizedBox(height: 18),
            TextField(
              controller: _captionCtrl,
              maxLines: 4,
              minLines: 2,
              autofocus: true,
              textCapitalization: TextCapitalization.sentences,
              style: AppTextStyles.body1(context)
                  .copyWith(color: context.textPrimary),
              decoration: InputDecoration(
                hintText: "What's happening?",
                hintStyle: AppTextStyles.body2(context),
                filled: true,
                fillColor: context.surface2Color,
                contentPadding: const EdgeInsets.all(16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(
                    color: context.primaryColor.withOpacity(0.5),
                    width: 1.5,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            if (_pickedImage != null) ...[
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.file(
                      _pickedImage!,
                      width: double.infinity,
                      height: 180,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () => setState(() => _pickedImage = null),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.black54,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close_rounded,
                            color: Colors.white, size: 18),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ] else if (_showImageField) ...[
              TextField(
                controller: _imageUrlCtrl,
                keyboardType: TextInputType.url,
                style: AppTextStyles.body2(context)
                    .copyWith(color: context.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Image URL (optional)',
                  hintStyle: AppTextStyles.body2(context),
                  prefixIcon: Icon(Icons.link_rounded,
                      color: context.textMuted, size: 20),
                  filled: true,
                  fillColor: context.surface2Color,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(
                      color: context.primaryColor.withOpacity(0.5),
                      width: 1.5,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
            Align(
              alignment: Alignment.centerLeft,
              child: Wrap(
                spacing: 4,
                children: [
                  TextButton.icon(
                    onPressed: _showImageSourcePicker,
                    icon: Icon(Icons.add_photo_alternate_rounded,
                        color: context.primaryColor, size: 20),
                    label: Text(
                      _pickedImage != null ? 'Change photo' : 'Add a photo',
                      style: AppTextStyles.button(context)
                          .copyWith(color: context.primaryColor),
                    ),
                  ),
                  if (_pickedImage == null && !_showImageField)
                    TextButton(
                      onPressed: () =>
                          setState(() => _showImageField = true),
                      child: Text(
                        'or paste a URL',
                        style: AppTextStyles.body2(context)
                            .copyWith(color: context.textMuted),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 6),
            SizedBox(
              width: double.infinity,
              child: GestureDetector(
                onTap: (isPosting || _isUploading) ? null : _submit,
                child: Container(
                  height: 52,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    gradient: context.primaryGradient,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: context.primaryColor.withOpacity(0.35),
                        blurRadius: 14,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: (isPosting || _isUploading)
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Text(
                          'Share Moment',
                          style: AppTextStyles.button(context)
                              .copyWith(color: Colors.white),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
