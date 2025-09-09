import { useState } from "react"
import { View, Text, TouchableOpacity, Platform, Modal, Alert, ActivityIndicator } from "react-native"
import { useFormContext, Controller } from "react-hook-form"
import DateTimePicker from "@react-native-community/datetimepicker"
import type { SignUpData } from "../../lib/forms/schemas"
import { stepSchemas } from "../../lib/forms/schemas"
import TextInputField from "../forms/text-input-field"
import { trpc } from "../../lib/trpc"
import { useRouter } from "expo-router"

type Step3Props = {
  useEmail: boolean;
  setUseEmail: (useEmail: boolean) => void;
  onBack: () => void;
};

export const Step3 = ({ useEmail, setUseEmail, onBack }: Step3Props) => {
  const {
    control,
    formState: { errors },
    setValue,
    trigger,
    getValues,
  } = useFormContext<SignUpData>()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1))
  const [tempDate, setTempDate] = useState(new Date(2000, 0, 1))
  
  const router = useRouter()
  const sendEmailMutation = trpc.email.sendActivationEmail.useMutation()
  const registerMutation = trpc.auth.register.useMutation()

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "Select birth date"
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return date.toLocaleDateString("en-US", options)
  }

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
      if (event.type === "set" && date) {
        setSelectedDate(date)
        const formattedDate = date.toISOString().split("T")[0]
        setValue("birthdate", formattedDate, { shouldValidate: true })
      }
    } else {
      if (date) {
        setTempDate(date)
      }
    }
  }

  const handleDatePickerPress = (currentValue: string) => {
    if (currentValue) {
      const date = new Date(currentValue)
      setSelectedDate(date)
      setTempDate(date)
    } else {
      setTempDate(selectedDate)
    }
    setShowDatePicker(true)
  }

  const handleDateConfirm = () => {
    setSelectedDate(tempDate)
    const formattedDate = tempDate.toISOString().split("T")[0]
    setValue("birthdate", formattedDate, { shouldValidate: true })
    setShowDatePicker(false)
  }

  const handleCreateAccount = async () => {
    const isValid = await trigger(['firstName', 'lastName', 'username', 'phoneNumber', 'birthdate'])

    if (isValid) {
      const userData = getValues()
      try {
        const result = await registerMutation.mutateAsync(userData)

        if (useEmail && result.user) {
          const email = getValues("emailOrPhone")
          try {
            await sendEmailMutation.mutateAsync({ to: email })
            router.push(`/verify-email?email=${encodeURIComponent(email)}&userId=${result.user.id}`)
          } catch (emailError) {
            Alert.alert("Error", emailError instanceof Error ? emailError.message : "Error sending verification code")
          }
        } else {
          Alert.alert(
            "Phone verification not available",
            "Phone verification is not implemented yet. Please use email instead.",
            [
              {
                text: "Use Email",
                onPress: () => {
                  setUseEmail(true)
                  onBack()
                  setValue("emailOrPhone", "")
                }
              }
            ]
          )
        }
      } catch (error) {
        Alert.alert("Error", error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")
      }
    }
  }

  // Check if current step is valid
  const isStepValid = () => {
    const currentData = {
      firstName: getValues('firstName'),
      lastName: getValues('lastName'),
      username: getValues('username'),
      phoneNumber: getValues('phoneNumber'),
      birthdate: getValues('birthdate'),
      profilePicture: getValues('profilePicture')
    }
    try {
      stepSchemas.step3.parse(currentData)
      return true
    } catch {
      return false
    }
  }

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
                error={errors.firstName}
              />
            </View>

            <View className="flex-1">
              <TextInputField
                control={control}
                name="lastName"
                placeholder="Last name"
                autoCapitalize="words"
                error={errors.lastName}
              />
            </View>
          </View>

          <TextInputField
            control={control}
            name="username"
            placeholder="@yourusername"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.username}
          />

          <TextInputField
            control={control}
            name="phoneNumber"
            placeholder="+1 234 567 8900"
            keyboardType="phone-pad"
            error={errors.phoneNumber}
          />

          <Controller
            control={control}
            name="birthdate"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  onPress={() => handleDatePickerPress(value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 flex-row justify-between items-center"
                  style={{ minHeight: 48 }}
                >
                  <Text className={`text-base ${value ? "text-gray-900" : "text-gray-400"}`}>
                    {formatDateForDisplay(value)}
                  </Text>
                  <Text className="text-gray-400">📅</Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <View>
                    {Platform.OS === "ios" ? (
                      <Modal
                        transparent={true}
                        animationType="slide"
                        visible={showDatePicker}
                        onRequestClose={() => setShowDatePicker(false)}
                      >
                        <View className="flex-1 justify-end bg-black/50">
                          <View className="bg-white rounded-t-3xl p-6">
                            <View className="flex-row justify-between items-center mb-6">
                              <TouchableOpacity 
                                onPress={() => setShowDatePicker(false)}
                                className="px-4 py-2"
                              >
                                <Text className="text-[#00AAEC] text-base font-medium">Cancel</Text>
                              </TouchableOpacity>
                              <Text className="text-lg font-semibold text-gray-900">Select Date</Text>
                              <TouchableOpacity 
                                onPress={handleDateConfirm}
                                className="px-4 py-2"
                              >
                                <Text className="text-[#00AAEC] text-base font-semibold">Done</Text>
                              </TouchableOpacity>
                            </View>
                            
                            <DateTimePicker
                              value={tempDate}
                              mode="date"
                              display="spinner"
                              onChange={handleDateChange}
                              maximumDate={new Date()}
                              minimumDate={new Date(1900, 0, 1)}
                              textColor="#000000"
                              style={{ height: 200 }}
                            />
                          </View>
                        </View>
                      </Modal>
                    ) : (
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                        textColor="#000000"
                        accentColor="#00AAEC"
                      />
                    )}
                  </View>
                )}
              </>
            )}
          />

          {errors.birthdate && <Text className="text-red-500 text-xs mb-2">{errors.birthdate.message}</Text>}
        </View>

        <TouchableOpacity
          className={`py-4 px-8 rounded-full shadow-lg mt-4 w-full ${isStepValid() ? 'bg-[#00AAEC]' : 'bg-gray-300'}`}
          onPress={handleCreateAccount}
          activeOpacity={0.9}
          disabled={!isStepValid() || registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg text-center">
              Create Account
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  )
}