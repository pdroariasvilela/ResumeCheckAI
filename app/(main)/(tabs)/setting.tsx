import { Pressable, StyleSheet, Text, View } from "react-native";

import { useLogoutMutation } from "@/features/auth/api";

export default function SettingScreen() {
  const logoutMutation = useLogoutMutation()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setting</Text>
      <Text style={styles.subtitle}>Configuracion</Text>

      <Pressable onPress={()=>logoutMutation.mutateAsync()} style={styles.button}>
        <Text style={styles.buttonText}>Cerrar sesion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
