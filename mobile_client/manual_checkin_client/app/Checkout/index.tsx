import { router } from "expo-router";
import { Field, Formik } from "formik";
import { ScrollView, StyleSheet, View, Alert } from "react-native";
import { Button, Text } from "@react-native-material/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import CustomInput from "../components/CustomInput";
import AwesomeButton from "react-native-really-awesome-button";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import axios from "axios";
import BackButton from "../components/BackButton";

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
  const _submit = async (
    { phone_number, otp_number, id_number },
    { resetForm }
  ) => {
    try {
      playSoundAndVibrate();
      phone_number = phone_number.replace(/[^0-9]/g, "");
      const formattedPhoneNumber = `254${phone_number.slice(1)}`;

      otp_number = otp_number.replace(/[^0-9]/g, "");
      id_number = id_number.replace(/[^0-9]/g, "");
      const visitOtpNumber = otp_number;
      const visitIdNumber = id_number;

      // Save the input values in AsyncStorage
      await AsyncStorage.setItem("visitphoneNumber", formattedPhoneNumber);
      await AsyncStorage.setItem("visitOtpNumber", otp_number);
      const token = await AsyncStorage.getItem("token");

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      };
      // check if otp & phone exits in visitotp
      const get_response = await axios.get(
        apiUrl +
          `/checkin-nonfacial/?otp=${visitOtpNumber}&phone_number=${formattedPhoneNumber}&id_number=${visitIdNumber}`,
        config
      );

      console.log("get_response.data", get_response.data);
      if (get_response.data.length == 0) {
        //   // not found
        setTimeout(() => {
          Alert.alert(
            "User not found",
            "The provided details are not valid",
            [
              {
                text: "Try Again",
                onPress: () => {
                  // Close the alert first
                  setTimeout(() => {
                    // Navigate to the checkout screen after pressing OK and after the alert is closed
                  }, 200);
                },
              },
            ],
            { cancelable: false }
          );
        });
      } else if (get_response.data.length > 0) {
        console.log("not in 101");
        try {
          const data = {
            id_number: visitIdNumber,
            otp: visitOtpNumber,
            phone_number: formattedPhoneNumber,
          };
          const response_out = await axios.post(
            apiUrl + `/checkout-nonfacial/`,
            data,
            config
          );
          console.log("checkout non-facial post response", response_out.data);
          if (response_out.data !== false) {
            //       // updating checkout time
            const visitId = await AsyncStorage.getItem("visitId");
            if (visitId) {
              try {
                const token = await AsyncStorage.getItem("token");
                const visId = visitId.toString();
                const timestamp = new Date().toISOString();
                console.log("current timestamp", timestamp);
                console.log("visit id", visId);
                //           // fetch data from asynchronous storage
                AsyncStorage.multiGet(["buildingId", "visitorId"])
                  .then((values) => {
                    const buildingId = values[0][1].toString();
                    const visitorId = values[1][1].toString();
                    const payload = {
                      is_checked_in: false,
                      checkout_time: timestamp,
                    };
                    const config = {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                      },
                    };
                    //               console.log("payload", payload);
                    axios
                      .put(apiUrl + `/visit/${visId}/`, payload, config)
                      .then((response) => {
                        console.log(
                          "updating checkout time in visits: ",
                          response.data
                        );
                        navigation.navigate("Goodbye");
                      })
                      .catch((error) => {
                        console.error("error making update request:", error);
                      });
                  })
                  .catch((error) => {
                    console.error(
                      "error fetching data from asynchronous storage: ",
                      error
                    );
                  });
              } catch (error) {
                console.error("error updating checkout time ", error);
              }
            }
          }
        } catch (error) {
          if (error.response) {
            if (error.response.status === 404) {
              Alert.alert("New visitor!!, Please checkin first!");
              navigation.navigate("Welcome");
            } else if (error.response.status === 400) {
              Alert.alert("You have not checked in. Please Check-in first.");
              navigation.navigate("Welcome");
            } else {
              console.error("failed to checkout with otp");
              console.error("Server Error Data:", error.response.data);
              console.error("Server Error Status Code:", error.response.status);
              console.error("Server Error Headers:", error.response.headers);
            }
          }
        }
      }
    } catch (error) {
      console.error("failed to search otp & phone number", error);
      console.error("Server Error Data:", error.response.data);
      console.error("Server Error Status Code:", error.response.status);
      console.error("Server Error Headers:", error.response.headers);
    } finally {
      resetForm({ phone_number: "", otp_number: "", id_number: "" });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Enter Details to checkout</Text>

      <View style={styles.main}>
        <View style={styles.content}>
          <Formik
            initialValues={{ phone_number: "", otp_number: "", id_number: "" }}
            onSubmit={_submit}
          >
            {({ handleSubmit, isValid }) => (
              <View style={styles.inputContainer}>
                <View style={styles.phone}>
                  <Text variant="h6">ID Number</Text>
                  <Field
                    component={CustomInput}
                    name="id_number"
                    label="ID Number"
                    keyboardType="numeric"
                    autoFocus
                    style={styles.input}
                  />
                </View>

                <View style={styles.phone}>
                  <Text variant="h6">Tel Number</Text>
                  <Field
                    component={CustomInput}
                    name="phone_number"
                    label="Phone Number"
                    keyboardType="numeric"
                    // autoFocus
                    style={styles.input}
                  />
                </View>

                <View style={styles.phone}>
                  <Text variant="h6">Visit{"   "}OTP</Text>
                  <Field
                    component={CustomInput}
                    name="otp_number"
                    label="Visit OTP"
                    keyboardType="numeric"
                    // autoFocus
                    style={styles.input}
                  />
                </View>

                <View style={styles.nextButton}>
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

      <BackButton />
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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
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
  phone: {
    display: "flex",
    flexDirection: "row",
    width: 700,
    gap: 70,
  },
  heading: {
    fontSize: 30,
  },
});
