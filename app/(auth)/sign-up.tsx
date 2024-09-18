/* eslint-disable prettier/prettier */
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, SafeAreaView, ScrollView, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";

const SignUp = () => {
   const { isLoaded, signUp, setActive } = useSignUp()
   const [showSuccessModel, setShowSuccessModal] = useState(false)
  const [form, setFrom]= useState({
    name:"",
    email:"",
    password:""
  })
  const [verifiacation, setVerification] = useState({
    state : "default",
    error: "",
    code : ""
  })
   const onSignUpPress = async () => {
    if (!isLoaded) {
      return
    }

    try {
      await signUp.create({
        emailAddress:form.email,  
        password: form.password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      setVerification({
        ...verifiacation,
        state:"pending"
      })
    } catch (err: any) {
      Alert.alert("Error:", err.errors[0].longMessage)
    }
  }

  const onPressVerify = async () => {
    if (!isLoaded)  return
    

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code : verifiacation.code,
      })

      if (completeSignUp.status === 'complete') {
       await fetchAPI('/(api)/user', {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          clerkId: completeSignUp.createdUserId
        })
       })
        await setActive({ session: completeSignUp.createdSessionId })
        setVerification({...verifiacation,state:"success"})
      } else {
        setVerification({...verifiacation,
          state:"failed",
          error:"verification Failed"
        })
        console.error(JSON.stringify(completeSignUp, null, 2))
      }
    } catch (err: any) {
      setVerification({...verifiacation,
          state:"failed",
          error:err.error[0].longMessage
        })
    }
  }
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
          <View className="relative w-full h-[250px]">
            <Image source={images.signUpCar} className="z-0 w-full h-[250px]"/>
            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
              Create Your Account
            </Text>
          </View>
          <View className="p-5">
            <InputField 
            label="Name"
            placeholder="Enter Your Name"
            icon= {icons.person}
            value={form.name}
            onChangeText = {(value)=>
              setFrom({
                ...form,
                name:value,
              })
            }
            />
            <InputField 
            label="Email"
            placeholder="Enter Your Email"
            icon= {icons.email}
            value={form.email}
            onChangeText = {(value)=>
              setFrom({
                ...form,
                email:value,
              })
            }
            />
            <InputField 
            label="Password"
            placeholder="Enter Your Password"
            icon= {icons.lock}
            value={form.password}
            onChangeText = {(value)=>
              setFrom({
                ...form,
                password:value,
              })
            }
            />
            <CustomButton title="Sign Up" onPress={onSignUpPress} className="mt-6"/> 
            <OAuth/>
            <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
            >
              <Text>Alreday have an account?</Text>
              <Text className="text-primary-500">Login in </Text>
            </Link>
          </View>

          {/* verificatiom modal */}
            <ReactNativeModal 
            isVisible={verifiacation.state === 'pending'}
            onModalHide={()=>{
              if(verifiacation.state === 'success') setShowSuccessModal(true)
            }}
            >
              <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                <Text className="font-2xl font-JakartaExtraBold mb-2">
                  Verification
                </Text>
                <Text className="font-Jakrta mb-5">
                  We've send a verifiacation code to {form.email}
                </Text>
                <InputField
                label="Code"
                icon={icons.lock}
                placeholder="12345"
                value={verifiacation.code}
                keyboardType="numeric"
                onChangeText={(code)=>
                  setVerification({...verifiacation, code})
                }
                />
                {verifiacation.error && (
                  <Text className="text-red-500 text-sm mt-1">
                    {verifiacation.error}
                  </Text>
                )}
                <CustomButton
                title="Verify Email"
                onPress={onPressVerify}
                className="mt-5 bg-success-500"
                />
              </View>

            </ReactNativeModal>
          <ReactNativeModal isVisible={showSuccessModel}>
            <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
              <Image 
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
              />
              <Text className="text-3xl font-JakartaBold text-center">
                Verified
              </Text>
              <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                You have successfully verified your Account
              </Text>
              <CustomButton title="Browse Home" 
              onPress={()=> {
                setShowSuccessModal(false)
                router.push('/(root)/(tabs)/home')}}
              className="mt-5"
              />
            </View>
          </ReactNativeModal>
      </View>
    </ScrollView>
  );
};
export default SignUp;
