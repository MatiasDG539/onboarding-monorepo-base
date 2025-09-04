import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import TwitterIcon from '@/components/ui/TwitterIcon';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { SignInSchema, SignInData } from '../../components/forms/schemas';
import { trpc } from '../../lib/trpc';
import { useAuthStore } from '../../lib/auth-store';

const SignInScreen = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const { login } = useAuthStore();

    const loginMutation = trpc.auth.login.useMutation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitle: 'Back',
        });
    }, [navigation]);
    
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInData>({
        resolver: zodResolver(SignInSchema),
        mode: 'onTouched',
    });

    const onSubmit: SubmitHandler<SignInData> = async (data) => {
        try {
            const result = await loginMutation.mutateAsync(data);
            
            if (!result.success) {
                Alert.alert("Error", 'error' in result ? result.error : "Login failed");
                return;
            }

            if ('user' in result && result.user) {
                login(result.user);
                router.push('/home-screen');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert("Error", "Login failed. Please try again.");
        }
    };

    return (
        <View className="flex-1 bg-gradient-to-b from-slate-50 to-white">
            <View className="h-14" />
            <View style={{ height: 16 }} />
            <View className="items-center mb-4">
                <TwitterIcon width={72} height={72} />
            </View>
            <View className="flex-1 justify-center items-center px-8">
                <View className="items-center mb-10">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">Sign In</Text>
                    <Text className="text-base text-gray-500 text-center">Welcome back! Please sign in to continue.</Text>
                </View>
                <View className="w-full max-w-sm mb-8">
                    <Controller
                        control={control}
                        name="emailOrPhone"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base text-gray-900"
                                style={{ minHeight: 48, paddingVertical: 10 }}
                                placeholder="Email or phone number"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onChangeText={onChange}
                                value={value}
                                placeholderTextColor="#A0AEC0"
                            />
                        )}
                    />
                    {errors.emailOrPhone && (
                        <Text className="text-red-500 text-xs mb-2">{errors.emailOrPhone.message}</Text>
                    )}
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base text-gray-900"
                                style={{ minHeight: 48, paddingVertical: 10 }}
                                placeholder="Password"
                                secureTextEntry
                                autoCapitalize="none"
                                onChangeText={onChange}
                                value={value}
                                placeholderTextColor="#A0AEC0"
                            />
                        )}
                    />
                    {errors.password && (
                        <Text className="text-red-500 text-xs mb-2">{errors.password.message}</Text>
                    )}
                    <TouchableOpacity
                        className="bg-[#00AAEC] py-4 px-8 rounded-full shadow-lg mt-2"
                        onPress={handleSubmit(onSubmit)}
                        activeOpacity={0.9}
                        disabled={isSubmitting || loginMutation.isPending}
                    >
                        {(isSubmitting || loginMutation.isPending) ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold text-lg text-center">Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    className="mb-8"
                    onPress={() => router.push('/sign-up')}
                    activeOpacity={0.8}
                >
                    <Text className="text-gray-500 text-base text-center">
                        Don&apos;t have an account?{' '}
                        <Text className="text-[#00AAEC] font-semibold">Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
            <View className="pb-8 px-8">
                <Text className="text-center text-gray-400 text-sm">
                    © 2025 TwitterClone.
                </Text>
            </View>
        </View>
    );
};

export default SignInScreen;
