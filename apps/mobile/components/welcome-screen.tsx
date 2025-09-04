import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import TwitterIcon from './ui/TwitterIcon';
import { useRouter } from 'expo-router';

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gradient-to-b from-slate-50 to-white">
      <View className="h-14"></View>
      
      {/* Header */}
      <View className="flex-1 justify-center items-center px-8">
        
        <View className="items-center mb-12">
          <View className="mb-6">
            <TwitterIcon width={72} height={72} />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">TwitterClone</Text>
        </View>

        <View className="items-center mb-16">
          <Text className="text-3xl font-bold text-gray-900 text-center leading-tight mb-6">
            Connect with the world in{' '}
            <Text className="text-[#00AAEC]">real time</Text>
          </Text>
          <Text className="text-lg text-gray-600 text-center leading-relaxed max-w-sm">
            Join millions of people sharing thoughts, ideas, and moments that matter to them.
          </Text>
        </View>

        <View className="w-full max-w-sm mb-8">
          <TouchableOpacity 
            className="bg-[#00AAEC] py-4 px-8 rounded-full shadow-lg"
            onPress={() => router.push('/sign-up')}
            activeOpacity={0.9}
          >
            <Text className="text-white font-bold text-lg text-center">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="mb-12"
          onPress={() => router.push('/sign-in')}
          activeOpacity={0.8}
        >
          <Text className="text-gray-500 text-base text-center">
            Already have an account?{' '}
            <Text className="text-[#00AAEC] font-semibold">Sign In</Text>
          </Text>
        </TouchableOpacity>

      </View>

      {/* Footer */}
      <View className="pb-8 px-8">
        <Text className="text-center text-gray-400 text-sm">
          © 2025 TwitterClone.
        </Text>
      </View>
    </View>
  );
};

export default WelcomeScreen;
