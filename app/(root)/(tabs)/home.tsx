import * as Location from 'expo-location'
import GoogleTextInput from '@/components/GoogleTextInput'
import Map from '@/components/Map'
import RideCard from '@/components/RideCard'
import { icons, images } from '@/constants'
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo'
import { useEffect, useState } from 'react'
import { FlatList, SafeAreaView, Text, View,Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useLocationStore } from '@/store'
import { router } from 'expo-router'
import { useFetch } from '@/lib/fetch'

export default function Page() {
  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const [hasPermissions, setHasPermissions] = useState(false)
  const { user } = useUser()
  const {signOut} = useAuth()
  const {data : recentRides, loading} = useFetch(`/(api)/ride/${user?.id}`)

  const handleSignOut = () =>{
    signOut();
    router.replace('/(auth)/sign-in')
  }
  const handleDestinationPress = (loaction: {
    latitude: number, 
    longitude : number, 
    address: string})=>{
    setDestinationLocation(loaction);
   router.push("/(root)/find-ride")
  }

  useEffect(()=>{
    const requestLocation = async () =>{
      let {status } = await Location.requestForegroundPermissionsAsync();

      if(status === 'granted') {
        setHasPermissions(false)
        return;
      }
      
      let location = await Location.getCurrentPositionAsync()

      const addresss = await Location.reverseGeocodeAsync({
        latitude : location.coords?.latitude,
        longitude : location.coords?.longitude
      })

      setUserLocation({
        // latitude: location.coords.latitude,
        // longitude : location.coords?.longitude,
        latitude: 37.78825,
            longitude: -122.4324,
        address: `${addresss[0].name}, ${addresss[0].region}`,
      })
    };
    requestLocation()
  }, [])
  return (
     <SafeAreaView style={{ flex: 1,}}>
    <FlatList 
      data={recentRides?.slice(0, 5)}
      renderItem={({ item }) => <RideCard ride={item} />}
      className='px-5'
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 100 }}
      ListEmptyComponent={() => (
        <View className='flex flex-col items-center justify-center'>
          {!loading ? (
            <>
              <Image 
                source={images.noResult} 
                className='w-40 h-40' 
                alt='No recent rides found'
                resizeMode='contain'
              />
              <Text className='text-sm'>No recent rides found</Text>
            </>
          ) : (
            <ActivityIndicator
              size="small"
              color="#0000"
            />
          )}
        </View>
      )}
      ListHeaderComponent={() => (
        <>
        <View className='flex flex-row items-center justify-between my-5'>
          <Text className='text-xl font-JakartaExtraBold'>Welome,{user?.firstName || user?.emailAddresses[0].emailAddress.split("@")[0]} {""}👋</Text>
          <TouchableOpacity onPress={handleSignOut}
          className='justify-center items-center w-10 h-10 rounded-full bg-white'>
            <Image source={icons.out} className='w-4 h-4'/>
          </TouchableOpacity>
        </View>
        
        <GoogleTextInput
        icon= {icons.search}
        containerStyle="bg-white shadow-md shadow-neutral-300"
        handlePress={handleDestinationPress}/>

        <>
        <Text className='text-xl font-JakartaBold mt-5 mb-3'>
            Your Current Location
        </Text>
        <View className='flex flex-row items-center bg-transperent h-[300px]'>
          <Map/>
        </View>
        </>
        <Text className='text-xl font-JakartaBold mt-5 mb-3'>
             Recent Rides
        </Text>
        </>
        
      )}
    />
  </SafeAreaView>
  )
}


