import { router } from "expo-router";
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView,
  Text,
} from "react-native";
import { Stack, Button } from "@react-native-material/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedButton } from "react-native-really-awesome-button";
// import { useNavigation } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol,
} from "react-native-responsive-screen";

async function playSoundAndVibrate() {
  const sound = new Audio.Sound();

  try {
    console.log("Loading Sound");
    await sound.loadAsync(require("../../assets/sounds/arp-03-83545.mp3"));
    await sound.playAsync();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        // The sound has finished playing, unload it
        await sound.unloadAsync();
      }
    });
  } catch (error) {
    // Handle errors here
    console.error("Error:", error);
  }
}

export default function Index() {
  const [buildingName, setBuildingName] = useState("");
  const navigation = useNavigation();
  useEffect(() => {
    // Fetch the buildingName from AsyncStorage or any other storage mechanism.
    // For example, you can replace 'your_storage_key' with your actual key.
    AsyncStorage.getItem("buildingName")
      .then((value) => {
        if (value) {
          console.log("Fetched buildingName from storage:", value);

          setBuildingName(value);
        } else {
          console.log("buildingName not found in storage.");
        }
      })
      .catch((error) => {
        console.error("Error fetching buildingName from storage:", error);
      });
  }, []);

  console.log("buildingName", buildingName);

  const handleCheckIn = () => {
    playSoundAndVibrate();
    // Delay the navigation to the next screen by 1 second (adjust the delay duration as needed)
    setTimeout(() => {
      navigation.navigate("Face");
      // router.push("/face");
    }, 100); // Delay in milliseconds (1 second in this case)
  };

  const handleCheckOut = () => {
    playSoundAndVibrate();
    // Delay the navigation to the next screen by 1 second (adjust the delay duration as needed)
    setTimeout(() => {
      navigation.navigate("Checkout");
      // router.push("/checkout");
    }, 100); // Delay in milliseconds (1 second in this case)
  };

  return (
    <SafeAreaView className="flex flex-1 mt-8">
      <View className="flex flex-row justify-center items-center gap-10 w-full px-24">
        <View className="w-1/2 flex flex-col items-center justify-center ml-45">
          <Stack spacing={15}>
            <View className="flex items-center justify-center">
              <View>
                <Text className="text-black text-7xl  text-center font-bold leading-[100px] tracking-[10px]">
                  Hello,
                </Text>
                <Text className="text-[#000080] text-[100px] text-center font-bold leading-[110px]">
                  You.
                </Text>
              </View>

              <View className="mt-10 mb-5">
                <Text className="leading-[200px] text-center text-2xl font-medium text-gray-600">
                  Welcome to:
                  <Text className="font-black tracking-wider text-4xl">
                    {" " + buildingName + "    "}
                  </Text>
                  Proceed to check in or check out below.
                </Text>
              </View>

              <View className="flex flex-row items-center justify-center  gap-16 mt-5">
                <ThemedButton
                  name="rick"
                  backgroundColor="#08154A"
                  type="primary"
                  textSize={20}
                  springRelease={true}
                  height={56}
                  onPress={handleCheckIn}
                >
                  CHECK-IN
                </ThemedButton>
                <ThemedButton
                  name="rick"
                  backgroundColor="#fff"
                  textSize={20}
                  height={56}
                  onPress={handleCheckOut}
                >
                  CHECK-OUT
                </ThemedButton>
              </View>
            </View>
          </Stack>
        </View>
        <View className="w-1/2 flex flex-col items-center justify-center border-blue-500">
          {/* <Text className="text-blue-500">fdfhsfsdfsd</Text> */}

          <Image
            source={require("../../assets/welcome.png")}
            className="object-contain"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
