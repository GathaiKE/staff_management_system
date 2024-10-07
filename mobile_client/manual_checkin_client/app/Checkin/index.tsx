import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Field, Formik } from "formik";
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Modal,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Button, Text } from "@react-native-material/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomInput from "../components/CustomInput";

import AwesomeButton from "react-native-really-awesome-button";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import axios from "axios";
import BackButton from "../components/BackButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol,
} from "react-native-responsive-screen";

import { useNavigation } from "@react-navigation/native";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [supplied_otp, setSuppliedOtp] = useState("");
  const [suppliedPhoneNumber, setSuppliedPhoneNumber] = useState("");
  const [suppliedIDNumber, setSuppliedIDNumber] = useState("");
  const [suppliedOtpError, setSuppliedOtpError] = useState("");

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const navigation = useNavigation();
  // const apiUrl = `https://api.cintelcoreams.com`;
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const ModalProceed = async () => {
    if (supplied_otp.trim() == "") {
      setSuppliedOtpError("OTP is required");
      return;
    }
    setSuppliedOtpError("");
    const suppliedOTP = supplied_otp.replace(/[^0-9]/g, "");

    console.log(suppliedOTP);
    console.log("phone_number", suppliedPhoneNumber);
    console.log("id_number", suppliedIDNumber);
    const token = await AsyncStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    };
    // check if otp is in record
    try {
      const get_response = await axios.get(
        apiUrl +
          `/checkin-nonfacial/?otp=${suppliedOTP}&phone_number=${suppliedPhoneNumber}&id_number=${suppliedIDNumber}`,
        config
      );
      if (get_response.data.length > 0) {
        setModalVisible(!modalVisible);

        setTimeout(() => {
          navigation.navigate("Floor");
          Alert.alert(JSON.stringify(welcomeMsg));
        }, 1000);
      }
    } catch (error) {
      console.error("failed:Error is:", error);
      console.error("Server Error Data:", error.response.data);
      console.error("Server Error Status Code:", error.response.status);
      console.error("Server Error Headers:", error.response.headers);
    }
  };
  const _submit = async ({ phone_number, id_number }, { resetForm }) => {
    try {
      console.log("started");
      playSoundAndVibrate();
      console.log("not in 47");
      const formattedPhoneNumber = `254${phone_number.slice(1)}`;

      id_number = id_number.replace(/[^0-9]/g, "");
      const visitIdNumber = id_number;
      // Save the input values in AsyncStorage
      await AsyncStorage.setItem("visitphoneNumber", formattedPhoneNumber);
      await AsyncStorage.setItem("visitIdNumber", id_number);
      console.log("not in 55");
      const token = await AsyncStorage.getItem("token");
      console.log("not in 57");

      console.log("not in 60");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      };
      console.log("not in 67");
      // check if visitor exits in db
      setSuppliedIDNumber(visitIdNumber);
      setSuppliedPhoneNumber(formattedPhoneNumber);
      const get_response = await axios.get(
        apiUrl + `/visitor/?id_number=${visitIdNumber}`,
        config
      );
      console.log("not in 73");

      if (get_response.data.length > 0) {
        console.log("not in 76");
        console.log("get_response.data", get_response.data);
        //   // visitor exists
        response_data = get_response.data[0];
        AsyncStorage.setItem("visitorId", response_data.id.toString());
        AsyncStorage.setItem("FirstName", response_data.first_name);
        AsyncStorage.setItem("LastName", response_data.last_name);
        visitor_already_in = response_data.is_checked_in;
        fname = response_data.first_name;
        lname = response_data.last_name;
        welcomeMsg = "Welcome back: " + fname + " " + lname;
        console.log("not in 83");
        // console.log("get_response_data", response_data);
        console.log("visitor_already_in", visitor_already_in);
        if (visitor_already_in == true) {
          console.log("not in 84");
          //
          //     // alert already in
          setTimeout(() => {
            Alert.alert(
              "Already Checked In",
              "You're already Checked In.Checkout first!",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Close the alert first
                    setTimeout(() => {
                      // Navigate to the checkout screen after pressing OK and after the alert is closed

                      navigation.navigate("Welcome");
                    }, 200);
                  },
                },
              ],
              { cancelable: false }
            );
          }, 1000);
        } else if (visitor_already_in == false) {
          //     // nonfacial-checkin
          console.log("not in 109");
          try {
            const data = {
              id_number: visitIdNumber,
              phone_number: formattedPhoneNumber,
            };
            const response = await axios.post(
              apiUrl + `/checkin-nonfacial/`,
              data,
              config
            );
            if (response.data !== false) {
              console.log("not in 125");

              // display modal with form to supply otp received
              toggleModal();
            }
          } catch (error) {
            if (error.response) {
              console.log("not in 135");
              if (error.response.status === 404) {
                navigation.navigate("IdForm");
              } else if (error.response.status === 400) {
                setTimeout(() => {
                  Alert.alert(
                    "Already Checked In",
                    "You're already Checked In. Checkout first!",
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          // Close the alert first
                          setTimeout(() => {
                            // Navigate to the checkout screen after pressing OK and after the alert is closed

                            navigation.navigate("Welcome");
                          }, 200);
                        },
                      },
                    ],
                    { cancelable: false }
                  );
                }, 1000);
              } else {
                console.error("Server Error Data:", error.response.data);
                console.error(
                  "Server Error Status Code:",
                  error.response.status
                );
                console.error("Server Error Headers:", error.response.headers);
              }
            } else if (error.request) {
              console.log("not in 168");
              console.error("No response received:", error.request);
            } else {
              console.log("not in 171");
              console.error("Axios error message:", error.message);
            }
          }
        }
      } else if (get_response.data.length == 0) {
        // visitor  does not exists
        // try again
        // capture details
        // console.log("not in 170");
        setTimeout(() => {
          Alert.alert(
            "User not found",
            "The provided details are not registered",
            [
              {
                text: "Register",
                onPress: () => {
                  navigation.navigate("IdForm");
                },
              },
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
      }
    } catch (error) {
      console.error("failed:Error is:", error);
      console.error("Server Error Data:", error.response.data);
      console.error("Server Error Status Code:", error.response.status);
      console.error("Server Error Headers:", error.response.headers);
    } finally {
      resetForm({ phone_number: "", id_number: "" });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Enter Details to receive OTP</Text>
      <View style={styles.main}>
        <View style={styles.content}>
          <Formik
            initialValues={{ phone_number: "", id_number: "" }}
            onSubmit={_submit}
          >
            {({ handleSubmit, isValid }) => (
              <View style={styles.inputContainer}>
                <View style={styles.phone}>
                  <Text variant="h5">ID Number</Text>
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
                  <Text variant="h5">Telephone Number</Text>
                  <Field
                    component={CustomInput}
                    name="phone_number"
                    label="Telephone Number"
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
      {modalVisible ? (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal} // Close modal on back button press
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* <Image source={require("../../assets/Alert.png")} /> */}
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginVertical: hp("1%"),

                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: hp("2%"),
                    color: "#004080",
                    fontWeight: "900",
                    textTransform: "uppercase",
                  }}
                >
                  Enter the OTP Received
                </Text>
                {/* <Text style={styles.modalText}>You are already checked in</Text>
                <Text style={styles.modalText}>Proceed to checkout</Text> */}
                <TextInput
                  style={styles.textInput}
                  placeholder="Visit OTP"
                  onChangeText={(supplied_otp) => setSuppliedOtp(supplied_otp)}
                />
                {suppliedOtpError ? (
                  <Text style={{ color: "red", marginTop: hp("1%") }}>
                    {suppliedOtpError}
                  </Text>
                ) : null}
              </View>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={toggleModal} // Close modal on button press
                  style={styles.modalButton1}
                >
                  <Text style={styles.modalButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={ModalProceed} // Close modal on button press
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Proceed</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        <View>{/* <Text>Press Cancel</Text> */}</View>
      )}
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
  phone: {
    width: 300,
    gap: 10,
  },
  heading: {
    fontSize: 30,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    width: wp("100%"),
    // height: hp("100%"),
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: wp("35%"),
    height: hp("35%"),
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    // marginRight: "1%",
  },

  modalButton: {
    backgroundColor: "#001a00",
    opacity: 0.7,
    padding: 10,
    borderRadius: 5,
    marginLeft: 12,
  },
  modalButton1: {
    backgroundColor: "#1a0d00",
    opacity: 0.7,
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: hp("2.3%"),
  },

  textInput: {
    lineHeight: 40,
    borderBottomWidth: 2,
    // height: 70,
    width: wp("17%"),
    height: hp("11%"),
    marginBottom: hp("3%"),
  },
});
