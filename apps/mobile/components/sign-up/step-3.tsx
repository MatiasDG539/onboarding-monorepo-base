import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { SignUpData } from '../../lib/forms/schemas';
import TextInputField from '../forms/text-input-field';

type Step3Props = {
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export const Step3: React.FC<Step3Props> = ({ 
  showDatePicker, 
  setShowDatePicker, 
  selectedDate, 
  onDateSelect 
}) => {
  const { control, watch, formState: { errors } } = useFormContext<SignUpData>();

  const formatDateForDisplay = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const DatePickerModal = () => {
    const [tempDate, setTempDate] = useState(selectedDate || new Date(2000, 0, 1));
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - 13 - i);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const getDaysInMonth = (year: number, month: number) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const days = Array.from({ length: getDaysInMonth(tempDate.getFullYear(), tempDate.getMonth()) }, (_, i) => i + 1);

    const WheelPicker = ({
      data,
      selectedValue,
      onValueChange,
      itemHeight = 50
    }: {
      data: (string | number)[],
      selectedValue: string | number,
      onValueChange: (value: string | number) => void,
      itemHeight?: number
    }) => {
      const scrollViewRef = React.useRef<ScrollView>(null);
      const [initialized, setInitialized] = React.useState(false);

      React.useEffect(() => {
        if (scrollViewRef.current && !initialized) {
          const selectedIndex = data.findIndex(item => item === selectedValue);
          if (selectedIndex !== -1) {
            setTimeout(() => {
              scrollViewRef.current?.scrollTo({
                y: selectedIndex * itemHeight,
                animated: false,
              });
              setInitialized(true);
            }, 100);
          }
        }
      }, [data, selectedValue, itemHeight, initialized]);

      const handleScroll = (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / itemHeight);
        const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
        if (data[clampedIndex] !== selectedValue) {
          onValueChange(data[clampedIndex]);
        }
      };

      return (
        <View className="flex-1" style={{ height: itemHeight * 5, position: 'relative' }}>
          <View
            className="absolute left-0 right-0 z-10"
            style={{
              top: itemHeight * 2,
              height: itemHeight,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#00AAEC',
              backgroundColor: 'transparent',
              shadowColor: '#00AAEC',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
            pointerEvents="none"
          />
          
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={{
              paddingVertical: itemHeight * 2,
            }}
          >
            {data.map((item, index) => (
              <View
                key={index}
                style={{ height: itemHeight }}
                className="justify-center items-center"
              >
                <Text className="text-lg text-gray-900">{item}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    };

    return (
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl">
            <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text className="text-gray-500 text-lg">Cancel</Text>
              </TouchableOpacity>
              
              <Text className="text-lg font-semibold text-gray-900">Select Birth Date</Text>
              
              <TouchableOpacity onPress={() => onDateSelect(tempDate)}>
                <Text className="text-[#00AAEC] text-lg font-semibold">Done</Text>
              </TouchableOpacity>
            </View>

            <View className="px-5 py-4">
              <View className="flex-row h-64">
                <View className="flex-1">
                  <WheelPicker
                    data={months}
                    selectedValue={months[tempDate.getMonth()]}
                    onValueChange={(value) => {
                      const monthIndex = months.indexOf(value as string);
                      setTempDate(new Date(tempDate.getFullYear(), monthIndex, Math.min(tempDate.getDate(), getDaysInMonth(tempDate.getFullYear(), monthIndex))));
                    }}
                  />
                </View>
                
                <View className="flex-1">
                  <WheelPicker
                    data={days}
                    selectedValue={tempDate.getDate()}
                    onValueChange={(value) => {
                      setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth(), value as number));
                    }}
                  />
                </View>
                
                <View className="flex-1">
                  <WheelPicker
                    data={years}
                    selectedValue={tempDate.getFullYear()}
                    onValueChange={(value) => {
                      setTempDate(new Date(value as number, tempDate.getMonth(), Math.min(tempDate.getDate(), getDaysInMonth(value as number, tempDate.getMonth()))));
                    }}
                  />
                </View>
              </View>

              <View className="h-4" />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <View className="items-center mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Tell us about yourself</Text>
        <Text className="text-base text-gray-500 text-center mb-8">Complete your profile</Text>

        <View className="w-full">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <TextInputField
                control={control}
                name="firstName"
                placeholder="First name"
                autoCapitalize="words"
              />
            </View>
            
            <View className="flex-1">
              <TextInputField
                control={control}
                name="lastName"
                placeholder="Last name"
                autoCapitalize="words"
              />
            </View>
          </View>

          <TextInputField
            control={control}
            name="username"
            placeholder="@yourusername"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInputField
            control={control}
            name="phoneNumber"
            placeholder="+1 234 567 8900"
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 flex-row justify-between items-center"
          >
            <Text className={`text-base ${watch("birthdate") ? 'text-gray-900' : 'text-gray-400'}`}>
              {selectedDate ? formatDateForDisplay(selectedDate) : "Select birth date"}
            </Text>
            <Text className="text-gray-400">📅</Text>
          </TouchableOpacity>
          
          {errors.birthdate && (
            <Text className="text-red-500 text-xs mb-2">{errors.birthdate.message}</Text>
          )}
        </View>
      </View>
      
      <DatePickerModal />
    </>
  );
};
