import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Button,
  TouchableOpacity,
  ImageBackground,
  ToastAndroid,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FaceDetector from "expo-face-detector";
import { Camera, CameraType } from "expo-camera/legacy";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "expo-linear-gradient";
import BackButton from "../components/BackButton";
import { manipulateAsync } from "expo-image-manipulator";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol,
} from "react-native-responsive-screen";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const PREVIEW_SIZE = 550;
const PREVIEW_RECT = {
  minX: (windowWidth - PREVIEW_SIZE) / 2,
  minY: 50, //(windowHeight - PREVIEW_SIZE) / 2,
  width: PREVIEW_SIZE,
  height: PREVIEW_SIZE,
};
const circular_area_center = {
  x: windowWidth / 2,
  y: windowHeight / 2,
};
const circular_area_radius = PREVIEW_SIZE / 2;
const THRESHOLD = 0.8; // the ratio of face area to preview area to take an image
const FILL_DURATION = 500; // duration of the fill animation in milliseconds

export default function Index() {
  const [modalVisible, setModalVisible] = useState(false);

  const [type, setType] = useState(CameraType.front);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [faces, setFaces] = useState([]);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [fillAnimation, setFillAnimation] = useState(0);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const cameraRef = useRef(null);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const [isloading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    if (isFaceDetected) {
      setFillAnimation(100);
    } else if (!isFaceDetected) {
      setFillAnimation(0);
    }
  }, [isFaceDetected]);

  if (!permission) {
    // Camera permissions are still loading

    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet

    return (
      <View style={styles.container}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: "600",
            padding: 12,
          }}
        >
          We need your permission to access the camera
        </Text>
        <TouchableOpacity
          style={{
            elevation: 8,
            backgroundColor: "#1966a5",
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 12,
          }}
          onPress={requestPermission}
          title="Grant Permission"
        >
          <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleFacesDetected = async ({ faces }) => {
    if (faces.length > 0 && !isRequestInProgress) {
      try {
        const face = faces[0]; // assume only one face is detected

        const faceCenterX = face.bounds.origin.x + face.bounds.size.width / 2;
        const faceCenterY = face.bounds.origin.y + face.bounds.size.height / 2;

        const faceWidth = face.bounds.size.width;
        const faceHeight = face.bounds.size.height;
        const faceArea = faceWidth * faceHeight;
        const previewArea = PREVIEW_SIZE * PREVIEW_SIZE;
        const ratio = Math.min(1, faceArea / previewArea); // Ensure the ratio does not exceed 1
        const fillPercentage = ratio * 100;

        const isFaceWithinBounds =
          face.bounds.origin.x >= PREVIEW_RECT.minX &&
          face.bounds.origin.y >= PREVIEW_RECT.minY &&
          face.bounds.origin.x + faceWidth <=
            PREVIEW_RECT.minX + PREVIEW_RECT.width &&
          face.bounds.origin.y + faceHeight <=
            PREVIEW_RECT.minY + PREVIEW_RECT.height;

        setIsFaceDetected(true);
        setFaces(faces);

        //Calculate the fill animation percentage based on the face area ratio
        let fillAnimationPercentage = fillPercentage;

        // if (fillPercentage >= 45) {
        //   // Gradually increase fillAnimationPercentage to 100% over time
        //   fillAnimationPercentage = 45 + (fillPercentage - 45) * 2;
        // }
        setFillAnimation(fillAnimationPercentage); // Set the fill animation based on the face area ratio

        if (isFaceWithinBounds) {
          await capturePhotoAndNavigate(); // Capture photo when face fills 100% of the mask
          // console.log("Face within bounds.Image taken!");
        } else {
          // console.log("face is not within bounds", isFaceWithinBounds);
          setIsFaceDetected(false);
          setFaces([]);
          setFillAnimation(0);
        }
        // if (fillAnimationPercentage >= 100) {
        //   capturePhotoAndNavigate(); // Capture photo when face fills 100% of the mask
        //   console.log("Image taken!");
        // }
      } catch (error) {
        throw error;
      }
    } else {
      setIsFaceDetected(false);
      setFaces([]);
      setFillAnimation(0); // Reset the fill animation if no face is detected
    }
  };

  const capturePhotoAndNavigate = async () => {
    if (cameraRef.current && isFaceDetected && !isRequestInProgress) {
      setIsRequestInProgress(true);
      const photo = await cameraRef.current.takePictureAsync();

      const localUri = `${FileSystem.documentDirectory}${Date.now()}.jpg`;

      // Resize the image
      const resizedPhoto = await manipulateAsync(
        photo.uri,
        [{ resize: { width: 800, height: 800 } }], // Adjust the width and height as needed
        { compress: 1, format: "jpeg" }
      );

      // Copying the captured image to the app's local directory
      await FileSystem.copyAsync({
        from: resizedPhoto.uri,
        to: localUri,
      });

      // Store the local URI in AsyncStorage for future reference
      await AsyncStorage.setItem("localPhotoUri", localUri);
      const token = await AsyncStorage.getItem("token");
      let form = new FormData();
      form.append("image", {
        uri: localUri,
        name: "image.jpg",
        type: "image/jpg",
      });

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      };
      // try {
      //   setIsLoading(true);
      //   const response = await axios.post(apiUrl + `/checkin/`, form, config);
      //   console.log("checkin response", response.data);
      // } catch (error) {
      //   setIsLoading(false);
      //   console.error("Server Error Data:", error.response.data);
      //   console.error("Server Error Status Code:", error.response.status);
      //   console.error("Server Error Headers:", error.response.headers);
      // } finally {
      //   setIsLoading(false);
      //   setIsRequestInProgress(false);
      //   // console.log("Request Status: ", isRequestInProgress);
      // }
      try {
        setIsLoading(true);
        const response = await axios.post(apiUrl + `/checkin/`, form, config);
        // console.log(
        //   `Response Exists: ${JSON.stringify(response.data, null, 2)}`
        // );

        if (response.data !== false) {
          AsyncStorage.setItem("FirstName", response.data.first_name);
          AsyncStorage.setItem("LastName", response.data.last_name);
          AsyncStorage.setItem("visitorId", response.data.id.toString());

          const fullnamez =
            response.data.first_name + " " + response.data.last_name;
          const welcomeMsg = "Welcome back: " + fullnamez;

          console.log(welcomeMsg);
          // // confirmation message

          if (welcomeMsg) {
            setIsLoading(false);
            setTimeout(() => {
              // router.push("/floor");
              navigation.navigate("Floor");
              console.log("231 welcome", welcomeMsg);

              Alert.alert(JSON.stringify(welcomeMsg));
            }, 1000);
          }
        } else if (response.data == true) {
          setIsLoading(false);
          console.log("237 Checking responze", response.data);
          // router.push("/details");
          // navigation.navigate("IdForm");
          // The image URI is stored locally. You can submit it later.
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            setIsLoading(false);
            // router.push("/details");
            navigation.navigate("IdForm");
            // console.log("245 error response", error.response);
          } else if (error.response.status === 400) {
            // console.log("247 error response", error.response);
            setIsLoading(false);
            setTimeout(() => {
              // router.push("/welcome");
              console.log("258 Already Checked In");

              navigation.navigate("Welcome");
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
                        // router.push("/checkout");
                      }, 200);
                    },
                  },
                ],
                { cancelable: false }
              );
            }, 1000);
          } else {
            setIsLoading(false);
            console.error("Server Error Data:", error.response.data);
            console.error("Server Error Status Code:", error.response.status);
            console.error("Server Error Headers:", error.response.headers);
          }
        } else if (error.request) {
          // The request was made but no response was received.
          setIsLoading(false);
          console.error("No Response Received:", error.request);
        } else {
          setIsLoading(false);
          // Something happened in setting up the request that triggered an Error.
          console.error("Axios Error Message:", error.message);
        }
      } finally {
        setIsLoading(false);
        setIsRequestInProgress(false);
        // console.log("Request Status: ", isRequestInProgress);
      }
    }
  };

  return (
    <SafeAreaView className="flex flex-1 -mt-8">
      {isloading ? (
        <View style={styles.spinnerIndicator}>
          <ActivityIndicator size={wp("10%")} color="#08154A" />
          <Text style={{ color: "#3385ff" }}>Processing...</Text>
        </View>
      ) : (
        <>
          <View style={styles.instructionsContainer}>
            <Text style={styles.action}>
              Move Closer to the Camera Until the Circle is Fully Filled!
            </Text>
          </View>
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={<View style={styles.mask} />}
          >
            <Camera
              ref={cameraRef}
              style={{
                ...StyleSheet.absoluteFillObject,
              }}
              ratio="16:9"
              type={type}
              faceDetectorSettings={{
                mode: FaceDetector.FaceDetectorMode.fast,
                detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                runClassifications:
                  FaceDetector.FaceDetectorClassifications.none,
                minDetectionInterval: 100,
                tracking: true,
              }}
              onFacesDetected={handleFacesDetected}
            >
              <AnimatedCircularProgress
                style={styles.circularProgress}
                size={PREVIEW_SIZE}
                width={10}
                backgroundWidth={7}
                fill={fillAnimation}
                tintColor="#08154A"
                backgroundColor="#e8e8e8"
              />
            </Camera>
          </MaskedView>

          <View>
            <BackButton />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mask: {
    borderRadius: PREVIEW_SIZE / 2,
    height: PREVIEW_SIZE,
    width: PREVIEW_SIZE,
    marginTop: PREVIEW_RECT.minY,
    alignSelf: "center",
    backgroundColor: "white",
  },
  circularProgress: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    marginTop: PREVIEW_RECT.minY,
    marginLeft: PREVIEW_RECT.minX,
  },
  instructions: {
    fontSize: 20,
    textAlign: "center",
    top: 25,
    position: "absolute",
  },
  instructionsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: PREVIEW_RECT.minY + PREVIEW_SIZE,
  },
  action: {
    fontSize: hp("3%"),
    textAlign: "center",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    width: wp("30%"),
    height: hp("20%"),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    alignContent: "center",
    // padding: 30,
    borderWidth: 5,
    borderRadius: 40,
    borderColor: "black",
    marginBottom: 80,
  },
  backgroundImg: {
    flex: 1,
    resizeMode: "contain",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  spinnerIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
