import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Text, TextInput, View } from "react-native";

export function RegisterForm() {
  return (
    <View className="flex-1 bg-zinc-50 px-5 py-10">
      <View className="mx-auto w-full max-w-md flex-1 justify-center">
        <View className="mb-10 items-center">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
            <Ionicons name="bag-outline" size={24} color="#ffffff" />
          </View>
          <Text className="text-3xl font-extrabold text-zinc-900">Crear cuenta</Text>
          <Text className="mt-2 text-sm text-zinc-500">Registrate para empezar a comprar</Text>
        </View>

        <View className="gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Usuario</Text>
            <View className="flex-row items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3">
              <Ionicons name="person-outline" size={20} color="#a1a1aa" />
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="correo@tienda.com"
                placeholderTextColor="#a1a1aa"
                className="ml-2 h-12 flex-1 text-zinc-900"
              />
            </View>
          </View>

          <View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Contrasena</Text>
            <View className="flex-row items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3">
              <Ionicons name="lock-closed-outline" size={20} color="#a1a1aa" />
              <TextInput
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#a1a1aa"
                className="ml-2 h-12 flex-1 text-zinc-900"
              />
            </View>
          </View>

          <View className="mt-2 rounded-xl bg-zinc-900 px-4 py-3">
            <Text className="text-center text-sm font-semibold text-white">Registrarme</Text>
          </View>
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-zinc-500">Ya tienes cuenta?</Text>
          <Link href="/(auth)/login" className="text-sm font-semibold text-zinc-900">
            Iniciar sesion
          </Link>
        </View>
      </View>
    </View>
  );
}
