import { router } from "expo-router";
import { Field, Formik } from "formik";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@react-native-material/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomInput from "../components/CustomInput";

import AwesomeButton from "react-native-really-awesome-button";

import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import BackButton from "../components/BackButton";
import { useNavigation } from "@react-navigation/native";

import axios from "axios";

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

  const _submit = async ({ id_number, phone_number }, { resetForm }) => {
    playSoundAndVibrate();
    const formattedPhoneNumber = `254${phone_number.slice(1)}`;

    await AsyncStorage.setItem("phoneNumber", formattedPhoneNumber);

    // Save the input Value in AsyncStorage
    try {
      await AsyncStorage.setItem("tempID", id_number);

      const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      const storedId = await AsyncStorage.getItem("tempID");
      console.log();
      const token = await AsyncStorage.getItem("token");

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      };

      const response = await axios.get(
        apiUrl + `/visitor/?id_number=${storedId}`,
        config
      );
      const response_object = response.data;
      console.log("retreiving response,", response_object);

      if (response.data && response.data.length === 0) {
        resetForm({ id_number: "", phone_number: "" });
        navigation.navigate("NamesForm");
        // router.push("/details/names"); // Proceed to details/names if the response is an empty list
      } else {
        // Update the image field (assuming you're updating the image in AsyncStorage)
        const response_object = response.data[0];
        const visitorId = response_object.id.toString();
        console.log("visitor id", visitorId);
        postImage(visitorId);
        resetForm({ id_number: "", phone_number: "" });
        AsyncStorage.setItem("FirstName", response_object.first_name);
        AsyncStorage.setItem("LastName", response_object.last_name);
        AsyncStorage.setItem("visitorId", visitorId);
        navigation.navigate("Floor");
        // router.push("/floor"); // Proceed to floor after updating the image
      }
    } catch (error) {
      console.log("Error saving input value");
    } finally {
      resetForm({ id_number: "", phone_number: "" });
      // router.push("/details/telephone");
    }
  };

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

      console.log(`115 Posting the image`);
      await axios.put(apiUrl + `/visitor/${id}/`, newForm, newConfig);
      await AsyncStorage.removeItem("localPhotoUri");
    } catch (error) {
      console.log(
        " idform Error posting image or retrieving saved URI: ",
        error
      );
      // console.error("Error making POST response:", error.response);
      // console.error("Error making POST response data:", error.response.data);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.main}>
        <View style={styles.content}>
          <Formik
            initialValues={{ id_number: "", phone_number: "" }}
            validate={(values) => {
              const errors = {};
              if (values.id_number == "") {
                errors.id_number = "ID number is required";
              }
              if (values.phone_number == "") {
                errors.phone_number = "Phone number is required";
              }
              return errors;
            }}
            onSubmit={_submit}
          >
            {({ handleSubmit, isValid, errors, touched }) => (
              <View className="flex flex-col items-center justify-center gap-5">
                <View className="flex flex-row gap-4 items-center justify-center">
                  <Text className="text-3xl font-medium">ID Number:</Text>
                  <Field
                    component={CustomInput}
                    name="id_number"
                    label="ID Number"
                    keyboardType="numeric"
                    autoFocus
                    style={styles.input}
                  />
                </View>

                <View className="flex flex-row gap-4 items-center justify-center">
                  <Text className="text-3xl font-medium">
                    Telephone Number:
                  </Text>
                  <Field
                    component={CustomInput}
                    name="phone_number"
                    label="Phone Number"
                    keyboardType="numeric"
                    autoFocus
                    style={styles.input}
                  />
                </View>

                <View className="w-[120px] h-[55px] justify-center ml-[20px] mt-[50px]">
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
      </View>
      <View>
        <BackButton />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 76,
    alignItems: "center",
  },
  main: {
    flex: 1,
    flexDirection: "row",
    gap: 120,
    width: 800,
  },
  content: {
    flex: 1,
    paddingTop: 130,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  outlinedBtn: {
    borderColor: "#010089",
    borderRadius: 100,
    borderWidth: 2,
    color: "#010089",
    fontSize: 20,
  },
  nextButton: {
    width: 120,
    height: 55,
    justifyContent: "center",
    marginTop: 41,
    marginLeft: 20,
  },
  id: {
    width: 300,
    gap: 10,
  },
  btn: {
    // position: 'absolute',
    // alignSelf: 'center',
    // right: 20,
    // bottom: 0
  },
});
