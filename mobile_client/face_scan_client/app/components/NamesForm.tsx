import { router } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Field, Formik } from "formik";
import { Text } from "@react-native-material/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

import CustomInput from "../components/CustomInput";
import AwesomeButton from "react-native-really-awesome-button";
import axios from "axios";
import BackButton from "../components/BackButton";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
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
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const navigation = useNavigation();

  const NamesSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("first name is required"),
    lastName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("last name is required"),
  });

  const postImage = async (id) => {
    try {
      const savedLocalUri = await AsyncStorage.getItem("localPhotoUri");
      const token = await AsyncStorage.getItem("token");
      if (!savedLocalUri) {
        console.log("No saved image URI found.");
        return;
      }

      let newForm = new FormData();
      newForm.append("image", {
        uri: savedLocalUri,
        name: "image.jpg",
        type: "image/jpg",
      });

      const newConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      };
      // https://staging--api.cintelcoreams.com
      console.log(`Posting the image`);
      await axios.put(apiUrl + `/visitor/${id}/`, newForm, newConfig);
      await AsyncStorage.removeItem("localPhotoUri");
    } catch (error) {
      console.log(
        "namesform Error posting image or retrieving saved URI: ",
        error
      );
    }
  };

  const _submit = async ({ first_name, last_name }, { resetForm }) => {
    // const { first_name, last_name } = values;
    playSoundAndVibrate();

    try {
      const id = await AsyncStorage.getItem("tempID");
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      const token = await AsyncStorage.getItem("token");

      const data = {
        first_name: first_name,
        last_name: last_name,
        id_number: id,
        phone_number: phoneNumber,
      };
      //await axios.post(apiUrl + "/checkout/", form, config);
      console.log("Data being sent:", data);
      // https://staging--api.cintelcoreams.com
      const response = await axios.post(apiUrl + "/visitor/", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      console.log("Namesform POST request successful:", response.data);
      AsyncStorage.setItem("FirstName", first_name);
      AsyncStorage.setItem("LastName", last_name);
      AsyncStorage.setItem("visitorId", response.data.id.toString());

      // Post the image
      const image_id = await response.data.id;

      postImage(image_id);
    } catch (error) {
      console.log("Error making the POST request:", error);
      if (error.response) {
        console.log("Server Error Response Data:", error.response.headers);
      }
    } finally {
      resetForm({ first_name: "", last_name: "" });
      navigation.navigate("OtpForm");
      // router.push("/details/otp");
    }
  };

  return (
    <View className="flex flex-1 justify-center items-center align-middle mt-10">
      <View className="flex-1 items-center justify-center">
        <Formik
          initialValues={{ first_name: "", last_name: "" }}
          validate={(values) => {
            const errors = {};
            if (values.first_name == "") {
              errors.first_name = "First Name is required";
            }
            if (values.last_name == "") {
              errors.last_name = "Last Name is required";
            }
            return errors;
          }}
          onSubmit={_submit}
        >
          {({ handleSubmit, isValid, errors, touched }) => (
            <View className="flex-col gap-10 items-center justify-center">
              <View className="flex flex-row gap-2.5 w-7/12">
                <Text variant="h4">First Name</Text>
                <Field
                  component={CustomInput}
                  name="first_name"
                  label="First Name"
                  autoFocus
                  labelStyle={{ fontSize: hp("3%") }} // add this line
                  style={styles.input}
                />
              </View>
              <View className="flex flex-row gap-2.5 w-7/12">
                <Text variant="h4">Last Name</Text>
                <Field
                  component={CustomInput}
                  name="last_name"
                  label="Last Name"
                  style={styles.input}
                  labelStyle={{ fontSize: 32 }}
                />
              </View>
              <View className="w-[120px] mt-96 ml-10">
                <AwesomeButton
                  backgroundColor="#010089"
                  onPress={handleSubmit}
                  stretch
                  textSize={20}
                >
                  Next
                </AwesomeButton>
              </View>
            </View>
          )}
        </Formik>
      </View>
      <View>
        <BackButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    paddingTop: 20,
    gap: 40,
  },
  errorTxt: {
    fontSize: 12,
    color: "#FF0D10",
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
});
