import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../repositories/ai_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class AiMessage {
  const AiMessage({required this.role, required this.content});
  final String role; // 'user' | 'assistant'
  final String content;

  bool get isUser => role == 'user';
  bool get isAssistant => role == 'assistant';
}

class AiState {
  const AiState({
    this.messages = const [],
    this.isLoading = false,
    this.safetyTips = const [],
    this.tipsLoading = false,
    this.error,
    this.riskScore,
    this.insights = const [],
  });

  final List<AiMessage> messages;
  final bool isLoading;
  final List<Map<String, dynamic>> safetyTips;
  final bool tipsLoading;
  final String? error;
  final int? riskScore;
  final List<String> insights;

  AiState copyWith({
    List<AiMessage>? messages,
    bool? isLoading,
    List<Map<String, dynamic>>? safetyTips,
    bool? tipsLoading,
    String? error,
    bool clearError = false,
    int? riskScore,
    List<String>? insights,
  }) =>
      AiState(
        messages: messages ?? this.messages,
        isLoading: isLoading ?? this.isLoading,
        safetyTips: safetyTips ?? this.safetyTips,
        tipsLoading: tipsLoading ?? this.tipsLoading,
        error: clearError ? null : (error ?? this.error),
        riskScore: riskScore ?? this.riskScore,
        insights: insights ?? this.insights,
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class AiNotifier extends StateNotifier<AiState> {
  AiNotifier(this._repo) : super(const AiState());

  final AiRepository _repo;

  Future<void> sendMessage(String msg, {String? context}) async {
    if (msg.trim().isEmpty) return;

    state = state.copyWith(
      messages: [
        ...state.messages,
        AiMessage(role: 'user', content: msg.trim()),
      ],
      isLoading: true,
      clearError: true,
    );

    try {
      final response = await _repo.chat(msg, context: context);
      state = state.copyWith(
        messages: [
          ...state.messages,
          AiMessage(role: 'assistant', content: response),
        ],
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        messages: [
          ...state.messages,
          AiMessage(
            role: 'assistant',
            content:
                'I encountered an error. Please check your connection and try again.',
          ),
        ],
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadSafetyTips() async {
    if (state.safetyTips.isNotEmpty) return;
    state = state.copyWith(tipsLoading: true);
    try {
      final tips = await _repo.getSafetyTips();
      state = state.copyWith(tipsLoading: false, safetyTips: tips);
    } catch (e) {
      state = state.copyWith(tipsLoading: false, error: e.toString());
    }
  }

  Future<void> analyzeRoutine(int userId) async {
    try {
      final data = await _repo.analyzeRoutine(userId);
      final score = data['risk_score'] as int? ?? data['score'] as int?;
      final rawInsights = data['insights'];
      final insights = rawInsights is List
          ? rawInsights.map((e) => e.toString()).toList()
          : <String>[];
      state = state.copyWith(riskScore: score, insights: insights);
    } catch (_) {}
  }

  void clearChat() => state = state.copyWith(messages: []);
  void clearError() => state = state.copyWith(clearError: true);
}

// ── Provider ──────────────────────────────────────────────────────────────────

final aiProvider = StateNotifierProvider<AiNotifier, AiState>((ref) {
  return AiNotifier(AiRepository.instance);
});
