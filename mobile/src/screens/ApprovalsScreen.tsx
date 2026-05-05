import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";

import { api, MfaApprovalRequest } from "../services/api";
import { colors, spacing, radius, fontSize } from "../theme";

export default function ApprovalsScreen() {
  const [requests, setRequests] = useState<MfaApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const data = await api.listMfaRequests();
      setRequests(data);
      setFeedback(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao carregar solicitações.";
      setFeedback(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const handleDecision = async (
    requestId: number,
    action: "approve" | "deny"
  ) => {
    setProcessingId(requestId);
    try {
      if (action === "approve") {
        await api.approveMfaRequest(requestId);
      } else {
        await api.denyMfaRequest(requestId);
      }
      await loadRequests();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao processar.";
      setFeedback(message);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending").slice(0, 10);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Sincronizando MFA...</Text>
      </View>
    );
  }

  const renderPendingItem = ({ item }: { item: MfaApprovalRequest }) => (
    <View style={styles.pendingCard}>
      <View style={styles.pendingHeader}>
        <View style={styles.pendingIconWrap}>
          <Text style={styles.pendingIcon}>🛡️</Text>
        </View>
        <View style={styles.pendingInfo}>
          <Text style={styles.pendingTitle} numberOfLines={1}>
            {item.secret_title}
          </Text>
          <Text style={styles.pendingVault} numberOfLines={1}>
            {item.vault_name}
          </Text>
          <Text style={styles.pendingMeta}>
            Solicitado por {item.requested_by_display_name}
          </Text>
          <View style={styles.pendingTimerRow}>
            <Text style={styles.pendingTimer}>
              ⏱ Expira {formatTime(item.expires_at)}
            </Text>
          </View>
        </View>
      </View>

      {item.requested_ip && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>IP de origem:</Text>
          <Text style={styles.detailValue}>{item.requested_ip}</Text>
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.denyBtn]}
          onPress={() => handleDecision(item.id, "deny")}
          disabled={processingId === item.id}
          activeOpacity={0.7}
        >
          {processingId === item.id ? (
            <ActivityIndicator color={colors.danger} size="small" />
          ) : (
            <>
              <Text style={styles.denyIcon}>✕</Text>
              <Text style={styles.denyText}>Negar</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => handleDecision(item.id, "approve")}
          disabled={processingId === item.id}
          activeOpacity={0.7}
        >
          {processingId === item.id ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <>
              <Text style={styles.approveIcon}>✓</Text>
              <Text style={styles.approveText}>Aprovar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: MfaApprovalRequest }) => (
    <View style={styles.historyRow}>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle} numberOfLines={1}>
          {item.secret_title}
        </Text>
        <Text style={styles.historyVault} numberOfLines={1}>
          {item.vault_name}
        </Text>
      </View>
      <View
        style={[styles.statusBadge, statusStyle(item.status).badge]}
      >
        <Text style={[styles.statusText, statusStyle(item.status).text]}>
          {statusLabel(item.status)}
        </Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      {/* Page Title */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Aprovações MFA</Text>
        <Text style={styles.pageSubtitle}>
          Gerencie solicitações de acesso em tempo real
        </Text>
      </View>

      {/* Feedback */}
      {feedback && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* Pending Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pendentes</Text>
        {pendingRequests.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingRequests.length}</Text>
          </View>
        )}
      </View>

      {pendingRequests.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>
            Nenhuma solicitação pendente
          </Text>
          <Text style={styles.emptyHint}>
            Novas solicitações aparecerão aqui automaticamente
          </Text>
        </View>
      )}
    </View>
  );

  const ListSeparator = () => (
    <View>
      {/* History Section */}
      <View style={[styles.sectionHeader, { marginTop: spacing.xxl }]}>
        <Text style={styles.sectionTitle}>Histórico</Text>
      </View>

      {history.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Sem decisões recentes</Text>
        </View>
      )}
    </View>
  );

  // We use a single FlatList for the whole screen
  // Pending items come first, then history
  const allData = [
    ...pendingRequests.map((r) => ({ ...r, _section: "pending" as const })),
    { _section: "separator" as const, id: -1 } as unknown as MfaApprovalRequest & { _section: string },
    ...history.map((r) => ({ ...r, _section: "history" as const })),
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />
      <FlatList
        data={allData}
        keyExtractor={(item, index) =>
          item._section === "separator" ? "sep" : `${item._section}-${item.id}-${index}`
        }
        renderItem={({ item }) => {
          const typed = item as MfaApprovalRequest & { _section: string };
          if (typed._section === "separator") return <ListSeparator />;
          if (typed._section === "pending") return renderPendingItem({ item: typed });
          return renderHistoryItem({ item: typed });
        }}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: MfaApprovalRequest["status"]) {
  switch (status) {
    case "approved":
      return "Aprovado";
    case "denied":
      return "Negado";
    case "expired":
      return "Expirado";
    default:
      return "Pendente";
  }
}

function statusStyle(status: MfaApprovalRequest["status"]) {
  switch (status) {
    case "approved":
      return {
        badge: {
          backgroundColor: colors.successBg,
          borderColor: colors.successBorder,
        },
        text: { color: colors.success },
      };
    case "denied":
      return {
        badge: {
          backgroundColor: colors.dangerBg,
          borderColor: colors.dangerBorder,
        },
        text: { color: colors.danger },
      };
    case "expired":
      return {
        badge: {
          backgroundColor: colors.warningBg,
          borderColor: colors.warningBorder,
        },
        text: { color: colors.warning },
      };
    default:
      return {
        badge: {
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
        },
        text: { color: colors.textSecondary },
      };
  }
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.lg,
    fontSize: fontSize.md,
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl * 2,
  },
  pageHeader: {
    marginBottom: spacing.xxl,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  feedbackBox: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  feedbackText: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.danger,
    borderRadius: radius.full,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  badgeText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: "800",
  },
  // Pending card
  pendingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  pendingHeader: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  pendingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.warningBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  pendingIcon: {
    fontSize: 22,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  pendingVault: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pendingMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  pendingTimerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  pendingTimer: {
    fontSize: fontSize.xs,
    color: colors.warning,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
  detailValue: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: "monospace",
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md + 2,
    borderRadius: radius.sm,
    gap: spacing.sm,
  },
  denyBtn: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  approveBtn: {
    backgroundColor: colors.primary,
  },
  denyIcon: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.danger,
  },
  denyText: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.danger,
  },
  approveIcon: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.text,
  },
  approveText: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
  },
  // Empty states
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  emptyHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  // History
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  historyInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  historyTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
  },
  historyVault: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
});
