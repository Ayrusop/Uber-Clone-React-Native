import { data, icons } from '@/constants'
import React, { useState } from 'react'
import { Image, TextInput, FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native'

// Define the props for GoogleTextInput component
type GoogleInputProps = {
    icon?: any;
    initialLocation?: string;
    containerStyle?: string;
    handlePress: (location: { latitude: number; longitude: number; address: string }) => void;
    textInputBackgroundColor?: string;
}

const olaPlacesApiKey = process.env.EXPO_PUBLIC_OLA_API_KEY;

const GoogleTextInput: React.FC<GoogleInputProps> = ({
    icon,
    initialLocation,
    containerStyle,
    handlePress,
    textInputBackgroundColor    
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

const fetchOlaAutocomplete = async (input: string) => {
  try {
    const response = await fetch(
        `https://api.olamaps.io/places/v1/autocomplete?input=${input}&api_key=${olaPlacesApiKey}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    setSuggestions(data.predictions); // Corrected to 'predictions'
  } catch (error) {
    console.error('Error fetching Ola suggestions:', error.message);
  }
};




    return (
        <View style={[styles.container,]}>
            <View style={{ flex: 1 }}>
                <TextInput
                    placeholder={initialLocation ?? "Where do you want to go?"}
                    placeholderTextColor="gray"
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        if (text.length > 2) { // Fetch suggestions after typing 3 characters
                            fetchOlaAutocomplete(text);
                        }
                    }}
                    style={{
                        backgroundColor: textInputBackgroundColor || 'white',
                        fontSize: 16,
                        marginHorizontal: 20,
                        padding: 10,
                        borderRadius: 20
                    }}
                />
                {/* Render the autocomplete suggestions */}
                {suggestions.length > 0 && (
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.place_id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => {
                        handlePress({
                            latitude: item.geometry.location[0],  // Adjust based on actual structure
                            longitude: item.geometry.location[1], // Adjust based on actual structure
                            address: item.description,
                        });
                        setQuery(item.description);
                        setSuggestions([]);
                    }}>
                            <Text style={{ padding: 10, backgroundColor: 'white' }}>{item.description}</Text>
                        </TouchableOpacity>

                        )}
                    />
                )}
            </View>
            <View className='justify-center items-center w-6 h-5'>
                <Image 
                    source={icon ? icon : icons.search} 
                    className='w-6 h-6'
                    resizeMode='contain'
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        borderRadius: 20,
        marginBottom: 20,
    }
});

export default GoogleTextInput;
