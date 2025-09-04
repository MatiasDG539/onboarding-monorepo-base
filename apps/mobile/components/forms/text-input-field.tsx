import React from 'react';
import { TextInput, Text, View, TextInputProps } from 'react-native';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

type TextInputFieldProps<T extends FieldValues> = Omit<TextInputProps, 'onChangeText' | 'value'> & {
    control: Control<T>;
    name: FieldPath<T>;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: TextInputProps['keyboardType'];
    autoCapitalize?: TextInputProps['autoCapitalize'];
}

const TextInputField = <T extends FieldValues>({
    control,
    name,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    ...props
}: TextInputFieldProps<T>) => {
    return (
        <View>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <>
                        <TextInput
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base text-gray-900"
                            style={{ minHeight: 48, paddingVertical: 10 }}
                            placeholder={placeholder}
                            autoCapitalize={autoCapitalize}
                            keyboardType={keyboardType}
                            secureTextEntry={secureTextEntry}
                            onChangeText={onChange}
                            value={value}
                            placeholderTextColor="#A0AEC0"
                            {...props}
                        />
                        {error && (
                            <Text className="text-red-500 text-xs mb-2">{error.message}</Text>
                        )}
                    </>
                )}
            />
        </View>
    );
};

export default TextInputField;
