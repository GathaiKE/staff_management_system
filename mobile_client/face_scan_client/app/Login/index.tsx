import { useState, useRef, forwardRef, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ImageBackground,
  Text,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Stack,
  TextInput,
  IconButton,
} from "@react-native-material/core";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { Formik } from "formik";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AwesomeButton from "react-native-really-awesome-button";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useWindowDimensions, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toastnotify from "../ToastNotify";

async function playSoundAndVibrate() {
  const sound = new Audio.Sound();

  try {
    console.log("Loading Sound");
    await sound.loadAsync(require("../../assets/sounds/arp-03-83545.mp3"));
    // await sound.loadAsync(require("../assets/sounds/arp-03-83545.mp3"));
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const navigation = useNavigation();
  // const apiUrl = `https://api.cintelcoreams.com`; // `https://api.cintelcoreams.com`//  process.env.EXPO_PUBLIC_API_URL;
  //

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      // .email("Invalid email address")
      // .min(11, "too short of an email")
      // .max(50, "too long of an email")
      .required("please enter your email"),
    password: Yup.string()
      .min(6, "password too short")
      .required("password is required"),
  });

  const handleLogin = async ({ email, password }, { resetForm }) => {
    try {
      playSoundAndVibrate();
      console.log("Email: ", email);
      console.log("Password: ", password);
      const data = {
        username: email,
        password: password,
      };
      //setEmail(email)
      const response = await axios.post(apiUrl + `/login/`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const logged_user = response.data.user;
      const logged_token = response.data.token;
      console.log("logged user", logged_user);
      console.log("logged token", logged_token);

      await AsyncStorage.setItem(
        "buildingId",
        logged_user.building.id.toString()
      );
      await AsyncStorage.setItem(
        "buildingName",
        logged_user.building.building_name
      );
      await AsyncStorage.setItem("token", logged_token);

      await AsyncStorage.setItem("username", logged_user.username);
      await AsyncStorage.setItem("email", logged_user.email);

      Toastnotify("success", "Login successful", "");
      navigation.navigate("Welcome");
      // router.push("/welcome");
      // Handle the response here (e.g., store authentication token, navigate to another screen)
      //   console.log(response.data);
    } catch (error) {
      Toastnotify("error", "Login failed", "Try again");
    } finally {
      resetForm({ email: "", password: "" });
    }
  };

  return (
    <ScrollView>
      <View className="flex bg-transparent flex-col justify-center items-center mt-16">
        <View className="flex mb-16 ">
          <Text className="text-black text-[33px] font-bold leading-[50px] customshadow text-center">
            Login Here
          </Text>
          <Text className="text-gray-500 text-lg font-medium customshadow text-center">
            Sign in below to activate the check in system
          </Text>
        </View>

        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={handleLogin}
          validationSchema={LoginSchema}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isValid,
            setFieldTouched,
          }) => (
            <View className="w-1/2 gap-11">
              <View>
                <TextInput
                  onChangeText={handleChange("email")}
                  onBlur={() => setFieldTouched("email")}
                  value={values.email}
                  label="Email"
                  variant="outlined"
                  trailing={(props) => (
                    <IconButton
                      icon={(props) => <Icon name="email" {...props} />}
                      {...props}
                    />
                  )}
                />
                {touched.email && errors.email && (
                  <Text className="text-errorRed text-xs">{errors.email}</Text>
                )}
              </View>
              <View>
                <TextInput
                  onChangeText={handleChange("password")}
                  onBlur={() => setFieldTouched("password")}
                  value={values.password}
                  label="Password"
                  variant="outlined"
                  secureTextEntry={secureTextEntry}
                  trailing={(props) => (
                    <IconButton
                      icon={(props) => <Icon name="eye" {...props} />}
                      {...props}
                      onPress={toggleSecureTextEntry}
                    />
                  )}
                />
                {touched.password && errors.password && (
                  <Text className="text-errorRed text-xs">
                    {errors.password}
                  </Text>
                )}
              </View>
              <View>
                <AwesomeButton
                  backgroundColor="#08154A"
                  onPress={handleSubmit}
                  stretch
                  borderRadius={50}
                  backgroundDarker="#fff"
                  disabled={!isValid}
                >
                  SUBMIT
                </AwesomeButton>
              </View>
            </View>
          )}
        </Formik>
        {/* toast component*/}
      </View>
    </ScrollView>
  );
}
