import { Ionicons } from "@expo/vector-icons";
import { useForm } from "@tanstack/react-form";
import { Link } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { useLoginMutation } from "@/features/auth/api/auth.mutations";

export function LoginForm() {
  const loginMutation = useLoginMutation();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        if (!value.email.includes("@")) {
          return "Ingresa un email valido";
        }
        if (value.password.length < 6) {
          return "La contrasena debe tener al menos 6 caracteres";
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value);
    },
  });

  return (
    <View className="flex-1 bg-zinc-50 px-5 py-10">
      <View className="mx-auto w-full max-w-md flex-1 justify-center">
        <View className="mb-10 items-center">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
            <Ionicons name="bag-outline" size={24} color="#ffffff" />
          </View>
          <Text className="text-3xl font-extrabold text-zinc-900">Iniciar sesion</Text>
          <Text className="mt-2 text-sm text-zinc-500">Accede a tu tienda virtual</Text>
        </View>

        <View className="gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Usuario</Text>
            <View className="flex-row items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3">
              <Ionicons name="person-outline" size={20} color="#a1a1aa" />
              <form.Field name="email">
                {(field) => (
                  <TextInput
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="correo@tienda.com"
                    placeholderTextColor="#a1a1aa"
                    className="ml-2 h-12 flex-1 text-zinc-900"
                  />
                )}
              </form.Field>
            </View>
          </View>

          <View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Contrasena</Text>
            <View className="flex-row items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3">
              <Ionicons name="lock-closed-outline" size={20} color="#a1a1aa" />
              <form.Field name="password">
                {(field) => (
                  <TextInput
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor="#a1a1aa"
                    className="ml-2 h-12 flex-1 text-zinc-900"
                  />
                )}
              </form.Field>
            </View>
          </View>

          {loginMutation.error ? (
            <Text className="text-sm text-red-500">{loginMutation.error.message}</Text>
          ) : null}

          <form.Subscribe
            selector={(state) =>
              [state.canSubmit, state.isSubmitting] as const
            }
          >
            {([canSubmit, isSubmitting]) => (
              <Pressable
                onPress={() => void form.handleSubmit()}
                disabled={!canSubmit || isSubmitting || loginMutation.isPending}
                className="mt-2 rounded-xl bg-zinc-900 px-4 py-3 disabled:opacity-60"
              >
                <Text className="text-center text-sm font-semibold text-white">
                  {isSubmitting || loginMutation.isPending
                    ? "Ingresando..."
                    : "Iniciar sesion"}
                </Text>
              </Pressable>
            )}
          </form.Subscribe>
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-zinc-500">No tienes cuenta?</Text>
          <Link href="/(auth)/register" className="text-sm font-semibold text-zinc-900">
            Registrarme
          </Link>
        </View>
      </View>
    </View>
  );
}
