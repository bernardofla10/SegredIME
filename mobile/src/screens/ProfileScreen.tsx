import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";

import { useAuth } from "../contexts/AuthContext";
import { colors, spacing, radius, fontSize } from "../theme";
import { getApiUrl } from "../services/api";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Deseja encerrar a sessão mobile?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (!user) return null;

  const initials = (
    (user.first_name?.[0] || "") + (user.last_name?.[0] || user.username[0])
  ).toUpperCase();

  const roleLabel = {
    admin: "Administrador",
    editor: "Editor",
    viewer: "Visualizador",
  }[user.role];

  const roleBg = {
    admin: colors.danger,
    editor: colors.warning,
    viewer: colors.info,
  }[user.role];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: roleBg }]}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        <Text style={styles.userName}>{user.full_name}</Text>
        <Text style={styles.userUsername}>@{user.username}</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Informações da Conta</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user.email || "—"}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cofres Acessados</Text>
          <Text style={styles.infoValue}>{user.vaults_access}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Último Login</Text>
          <Text style={styles.infoValue}>
            {user.last_login
              ? new Date(user.last_login).toLocaleString("pt-BR")
              : "—"}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membro desde</Text>
          <Text style={styles.infoValue}>
            {new Date(user.date_joined).toLocaleDateString("pt-BR")}
          </Text>
        </View>
      </View>

      {/* Connection Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Conexão</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Servidor API</Text>
          <Text style={[styles.infoValue, styles.mono]}>{getApiUrl()}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Autenticação</Text>
          <View style={styles.connectedBadge}>
            <View style={styles.connectedDot} />
            <Text style={styles.connectedText}>Token ativo</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Encerrar Sessão</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>SegredIME Mobile v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl * 2,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "30",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.primaryLight,
  },
  roleBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  roleText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
  },
  userUsername: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: fontSize.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },
  mono: {
    fontFamily: "monospace",
    fontSize: fontSize.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  connectedText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.danger,
  },
  versionText: {
    textAlign: "center",
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xxl,
    opacity: 0.5,
  },
});
