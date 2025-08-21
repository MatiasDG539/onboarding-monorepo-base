import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import type { FC } from 'react';
import { useRouter } from 'expo-router';

const LandingPage: FC = () => {

  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="h-12"></View>
      
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 mt-4">
        <View className="flex-row items-center gap-2">
          <Svg width={28} height={28} viewBox="0 -4 48 48">
            <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <G transform="translate(-300, -164)" fill="#00AAEC">
                <Path d="M348,168.735283 C346.236309,169.538462 344.337383,170.081618 342.345483,170.324305 C344.379644,169.076201 345.940482,167.097147 346.675823,164.739617 C344.771263,165.895269 342.666667,166.736006 340.418384,167.18671 C338.626519,165.224991 336.065504,164 333.231203,164 C327.796443,164 323.387216,168.521488 323.387216,174.097508 C323.387216,174.88913 323.471738,175.657638 323.640782,176.397255 C315.456242,175.975442 308.201444,171.959552 303.341433,165.843265 C302.493397,167.339834 302.008804,169.076201 302.008804,170.925244 C302.008804,174.426869 303.747139,177.518238 306.389857,179.329722 C304.778306,179.280607 303.256911,178.821235 301.9271,178.070061 L301.9271,178.194294 C301.9271,183.08848 305.322064,187.17082 309.8299,188.095341 C309.004402,188.33225 308.133826,188.450704 307.235077,188.450704 C306.601162,188.450704 305.981335,188.390033 305.381229,188.271578 C306.634971,192.28169 310.269414,195.2026 314.580032,195.280607 C311.210424,197.99061 306.961789,199.605634 302.349709,199.605634 C301.555203,199.605634 300.769149,199.559408 300,199.466956 C304.358514,202.327194 309.53689,204 315.095615,204 C333.211481,204 343.114633,188.615385 343.114633,175.270495 C343.114633,174.831347 343.106181,174.392199 343.089276,173.961719 C345.013559,172.537378 346.684275,170.760563 348,168.735283" />
              </G>
            </G>
          </Svg>
          <Text className="text-lg font-bold text-gray-900">TwitterClone</Text>
        </View>
        <TouchableOpacity>
          <Text className="text-[#00AAEC] font-medium text-sm">I have an account</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View className="px-4 py-8">

        {/* Main Content */}
        <View className="mb-8">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 leading-tight mb-3 text-center">
              Connect with the world in{' '}
              <Text className="text-[#00AAEC]">real time</Text>
            </Text>
            <Text className="text-base text-gray-600 text-center leading-relaxed px-2">
              Join millions of people sharing thoughts, ideas, and moments that matter to them.
            </Text>
          </View>
          
            <View className="mb-4 px-4">
            <TouchableOpacity 
              className="bg-[#00AAEC] py-3 px-6 rounded-full"
              onPress={() => router.push('/sign-up')}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base text-center">
              Get Started
              </Text>
            </TouchableOpacity>
            </View>
          
        </View>

        {/* Mock Tweet Cards */}
        <View className="gap-3 px-2">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-10 h-10 bg-[#00AAEC] rounded-full items-center justify-center">
                <Text className="text-white font-bold text-sm">A</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-sm">Alex Chen</Text>
                <Text className="text-gray-500 text-xs">@alexc</Text>
              </View>
            </View>
            <Text className="text-gray-700 mb-3 text-sm leading-relaxed">
              Just shipped a new feature! The community response has been incredible 🚀
            </Text>
            <View className="flex-row gap-4">
              <Text className="text-gray-400 text-xs">💬 12</Text>
              <Text className="text-gray-400 text-xs">🔄 8</Text>
              <Text className="text-gray-400 text-xs">❤️ 24</Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm ml-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-10 h-10 bg-purple-500 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-sm">M</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-sm">Maria Rodriguez</Text>
                <Text className="text-gray-500 text-xs">@maria_dev</Text>
              </View>
            </View>
            <Text className="text-gray-700 mb-3 text-sm leading-relaxed">
              Love how this platform brings developers together! 💻✨
            </Text>
            <View className="flex-row gap-4">
              <Text className="text-gray-400 text-xs">💬 5</Text>
              <Text className="text-gray-400 text-xs">🔄 15</Text>
              <Text className="text-gray-400 text-xs">❤️ 32</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="mt-8 mb-6 px-4">
        <Text className="text-center text-gray-400 text-xs">
          © 2025 TwitterClone.
        </Text>
      </View>
    </ScrollView>
  );
};

export default LandingPage;
