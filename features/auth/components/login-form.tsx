import { useLoginMutation } from "@/features/auth/api/auth.mutations";
import { Ionicons } from "@expo/vector-icons";
import { useForm } from "@tanstack/react-form";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export function LoginForm() {
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
        <View className="mb-8 items-center">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
            <Ionicons name="sparkles" size={24} color="#ffffff" />
          </View>
          <Text className="text-center text-3xl font-extrabold text-zinc-900">Log in to your account</Text>
          <Text className="mt-2 text-sm text-zinc-500">Welcome back! Please enter your details.</Text>
        </View>

        <View className="gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <View>
            <Text className="mb-2 text-base font-medium text-zinc-800">Email</Text>
            <View className="flex-row items-center rounded-xl border border-zinc-300 bg-white px-3">
              <form.Field name="email">
                {(field) => (
                  <TextInput
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="name@company.com"
                    placeholderTextColor="#a1a1aa"
                    className="h-12 flex-1 text-base text-zinc-900"
                  />
                )}
              </form.Field>
            </View>
          </View>

          <View>
            <Text className="mb-2 text-base font-medium text-zinc-800">Password</Text>
            <View className="flex-row items-center rounded-xl border border-zinc-300 bg-white px-3">
              <form.Field name="password">
                {(field) => (
                  <TextInput
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    secureTextEntry={!showPassword}
                    placeholder="Min. 8 characters"
                    placeholderTextColor="#a1a1aa"
                    className="h-12 flex-1 text-base text-zinc-900"
                  />
                )}
              </form.Field>
              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                className="pl-2"
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#71717a"
                />
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <Pressable
              className="flex-row items-center"
              onPress={() => setRememberMe((current) => !current)}
            >
              <Ionicons
                name={rememberMe ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={rememberMe ? "#18181b" : "#a1a1aa"}
              />
              <Text className="ml-2 text-sm text-zinc-600">Remember me</Text>
            </Pressable>
            <Pressable>
              <Text className="text-sm font-semibold text-zinc-900">Forgot password?</Text>
            </Pressable>
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
                className="mt-1 rounded-xl bg-zinc-900 px-4 py-3 disabled:opacity-60"
              >
                <Text className="text-center text-lg font-semibold text-white">
                  {isSubmitting || loginMutation.isPending ? "Ingresando..." : "Log In"}
                </Text>
              </Pressable>
            )}
          </form.Subscribe>

          <View className="my-1 flex-row items-center">
            <View className="h-px flex-1 bg-zinc-200" />
            <Text className="mx-3 text-xs font-semibold uppercase tracking-[2px] text-zinc-400">Or</Text>
            <View className="h-px flex-1 bg-zinc-200" />
          </View>

          <View className="gap-3">
            <Pressable className="h-12 flex-row items-center justify-center rounded-xl border border-zinc-300 bg-white px-4">
              <View className="h-6 w-6 items-center justify-center rounded bg-white">
                <Text className="text-base font-bold" style={{ color: "#4285F4" }}>
                  G
                </Text>
              </View>
              <Text className="ml-3 text-base font-semibold text-zinc-900">Continue with Google</Text>
            </Pressable>

            <Pressable className="h-12 flex-row items-center justify-center rounded-xl border border-zinc-300 bg-white px-4">
              <View className="h-6 w-6 items-center justify-center rounded bg-[#0A66C2]">
                <Text className="text-xs font-bold text-white">in</Text>
              </View>
              <Text className="ml-3 text-base font-semibold text-zinc-900">Continue with LinkedIn</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-zinc-500">Don&apos;t have an account?</Text>
          <Link href="/(auth)/register" className="text-sm font-semibold text-zinc-900">
            Sign up
          </Link>
        </View>
      </View>
    </View>
  );
}
