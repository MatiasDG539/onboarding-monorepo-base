import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
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
                router.push('/');
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
                <Svg width={72} height={72} viewBox="0 -4 48 48">
                    <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <G transform="translate(-300, -164)" fill="#00AAEC">
                            <Path d="M348,168.735283 C346.236309,169.538462 344.337383,170.081618 342.345483,170.324305 C344.379644,169.076201 345.940482,167.097147 346.675823,164.739617 C344.771263,165.895269 342.666667,166.736006 340.418384,167.18671 C338.626519,165.224991 336.065504,164 333.231203,164 C327.796443,164 323.387216,168.521488 323.387216,174.097508 C323.387216,174.88913 323.471738,175.657638 323.640782,176.397255 C315.456242,175.975442 308.201444,171.959552 303.341433,165.843265 C302.493397,167.339834 302.008804,169.076201 302.008804,170.925244 C302.008804,174.426869 303.747139,177.518238 306.389857,179.329722 C304.778306,179.280607 303.256911,178.821235 301.9271,178.070061 L301.9271,178.194294 C301.9271,183.08848 305.322064,187.17082 309.8299,188.095341 C309.004402,188.33225 308.133826,188.450704 307.235077,188.450704 C306.601162,188.450704 305.981335,188.390033 305.381229,188.271578 C306.634971,192.28169 310.269414,195.2026 314.580032,195.280607 C311.210424,197.99061 306.961789,199.605634 302.349709,199.605634 C301.555203,199.605634 300.769149,199.559408 300,199.466956 C304.358514,202.327194 309.53689,204 315.095615,204 C333.211481,204 343.114633,188.615385 343.114633,175.270495 C343.114633,174.831347 343.106181,174.392199 343.089276,173.961719 C345.013559,172.537378 346.684275,170.760563 348,168.735283" />
                        </G>
                    </G>
                </Svg>
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
