import { useUser } from "@clerk/clerk-expo";
import { Image, Text, View } from "react-native";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { formatTime } from "@/lib/utils";
import { userDriverStore, useLocationStore } from "@/store";
import Payment from "@/components/Payment";
import { StripeProvider } from '@stripe/stripe-react-native';

const BookRide = () => {
  const { user } = useUser();
  const { userAddress, destinationAddress } = useLocationStore();
  const { drivers, selectedDriver } = userDriverStore();

    console.log('Drivers:' , drivers);

  // Filter out the selected driver
  const driverDetails = drivers?.filter(
    (driver) => +driver.id === +selectedDriver // Ensure both are numbers
  )[0];

  // Check if driverDetails exists before rendering content
  if (!driverDetails) {
    return (
      <RideLayout title="Book Ride">
        <Text>No driver selected or driver information not available.</Text>
      </RideLayout>
    );
  }

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.uber.com" // required for Apple Pay
      urlScheme="myapp" // required for 3D Secure and bank redirects
    >

    <RideLayout title="Book Ride">
      <>
        <Text className="text-xl font-JakartaSemiBold mb-3">
          Ride Information
        </Text>

        {/* Driver Profile */}
        <View className="flex flex-col w-full items-center justify-center mt-10">
          <Image
            source={{ uri: driverDetails?.profile_image_url }}
            className="w-28 h-28 rounded-full"
          />

          <View className="flex flex-row items-center justify-center mt-5 space-x-2">
            <Text className="text-lg font-JakartaSemiBold">
              {`${driverDetails?.first_name} ${driverDetails?.last_name}`}
            </Text>

            <View className="flex flex-row items-center space-x-0.5">
              <Image
                source={icons.star}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-lg font-JakartaRegular">
                {driverDetails?.rating}
              </Text>
            </View>
          </View>
        </View>

        {/* Ride Details */}
        <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
          <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
            <Text className="text-lg font-JakartaRegular">Ride Price</Text>
            <Text className="text-lg font-JakartaRegular text-[#0CC25F]">
              ${driverDetails?.price ?? "N/A"}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
            <Text className="text-lg font-JakartaRegular">Pickup Time</Text>
            <Text className="text-lg font-JakartaRegular">
              {formatTime(parseInt(`${driverDetails.time!}`))}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between w-full py-3">
            <Text className="text-lg font-JakartaRegular">Car Seats</Text>
            <Text className="text-lg font-JakartaRegular">
              {driverDetails?.car_seats ?? "N/A"}
            </Text>
          </View>
        </View>

        {/* Addresses */}
        {/* <View className="flex flex-col w-full items-start justify-center mt-5">
          <View className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
            <Image source={icons.to} className="w-6 h-6" />
            <Text className="text-lg font-JakartaRegular ml-2">
              {userAddress ?? "No Address Available"}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
            <Image source={icons.point} className="w-6 h-6" />
            <Text className="text-lg font-JakartaRegular ml-2">
              {destinationAddress ?? "No Destination Selected"}
            </Text>
          </View>
        </View> */}
        <Payment 
        fullName={user?.fullName!}
        email={user?.emailAddresses[0].emailAddress!}
        driverId= {driverDetails?.id!}
        rideTime={driverDetails?.time!}
        />
      </>
    </RideLayout>
    </StripeProvider>
  );
};

export default BookRide;
