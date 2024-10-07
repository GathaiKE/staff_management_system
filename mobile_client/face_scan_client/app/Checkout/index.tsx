import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
  Button,
  Modal,
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

import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../components/BackButton";
import { BlurView } from "expo-blur";
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
  minY: 50,
  width: PREVIEW_SIZE,
  height: PREVIEW_SIZE,
};

const THRESHOLD = 0.8; // the ratio of face area to preview area to take an image
const FILL_DURATION = 500; // duration of the fill animation in milliseconds

export default function FaceDetection() {
  const [type, setType] = useState(CameraType.front);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [faces, setFaces] = useState([]);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [fillAnimation, setFillAnimation] = useState(0);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [isloading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    // get current timestamp when component mounts
    const timestamp = new Date().toISOString();
    setCurrentTimestamp(timestamp);
    console.log("Current checkout time", currentTimestamp);
  }, []);

  // const [showBlur,setShowBlur] = useState(false)
  const cameraRef = useRef(null);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  // const apiUrl = `https://api.cintelcoreams.com`; // `https://api.cintelcoreams.com`// process.env.EXPO_PUBLIC_API_URL;
  //`https://staging--api.cintelcoreams.com`

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
        <Text style={{ textAlign: "center" }}>
          We need your permission to access the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleFacesDetected = async ({ faces }) => {
    if (faces.length > 0 && !isRequestInProgress) {
      try {
        const face = faces[0]; // assume only one face is detected
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
        let fillAnimationPercentage = fillPercentage;

        // check if face is within bounds
        // const isFaceWithinBounds = face.bounds.origin.x >= PREVIEW_RECT.minX &&
        //   face.bounds.origin.y >= PREVIEW_RECT.minY
        // &&
        // face.bounds.origin.x + faceWidth <= PREVIEW_RECT.minX + PREVIEW_RECT.width &&
        // face.bounds.origin.y + faceHeight <= PREVIEW_RECT.minY + PREVIEW_RECT.height;

        // if (fillPercentage >= 45) {
        //   // Calculate the fill animation percentage based on the face area ratio

        //   // Gradually increase fillAnimationPercentage to 100% over time
        //   fillAnimationPercentage = 45 + (fillPercentage - 45) * 2;
        // }
        // setFillAnimation(fillAnimationPercentage); // Set the fill animation based on the face area ratio
        if (isFaceWithinBounds) {
          await capturePhotoAndNavigate(); // Capture photo when face fills 100% of the mask
          // console.log("Face within bounds.Image taken!");
        } else {
          // console.log("face is not within bounds", isFaceWithinBounds);
          setIsFaceDetected(false);
          setFaces([]);
          setFillAnimation(0); // Reset the fill animation if no face is detected
        }
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
    try {
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
        await FileSystem.copyAsync({
          from: resizedPhoto.uri, // photo.uri,
          to: localUri,
        });

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
        // https://sataging--api.cintelcoreams.com + "/checkout/"
        //
        // await axios.post(`https://staging--api.cintelcoreams.com` + "/checkout/", form, config);
        try {
          setIsLoading(true);
          const response = await axios.post(
            apiUrl + `/checkout/`,
            form,
            config
          );
          console.log(
            `Response Exists: ${JSON.stringify(response.data, null, 2)}`
          );
          console.log("responze", response.data);
          // response && response.data
          if (response.data !== false) {
            // updating checkout time
            const visitId = await AsyncStorage.getItem("visitId");
            if (visitId) {
              try {
                const token = await AsyncStorage.getItem("token");
                const visId = visitId.toString();
                const timestamp = new Date().toISOString();
                console.log("current timestamp", timestamp);
                console.log("visit id", visId);
                // fetch data from asynchronous storage
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
                    console.log("payload", payload);

                    axios
                      .put(apiUrl + `/visit/${visId}/`, payload, config)
                      .then((response) => {
                        console.log(
                          "updating checkout time in visits: ",
                          response.data
                        );
                        setIsLoading(false);
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
            } else {
              console.log("visiorId: ", visitId);
            }

            // router.push("/goodbye");
          }
        } catch (error) {
          if (error.response) {
            if (error.response.status === 404) {
              console.log("Error: ", error.response.status);
              setIsLoading(false);
              navigation.navigate("Welcome");
              Alert.alert("New visitor!!, Please checkin first!");
            } else if (error.response.status === 400) {
              setIsLoading(false);
              navigation.navigate("Welcome");

              Alert.alert("Please Check-in first before Checking out!");
            } else {
              // console.error("Server Error Data:", error.response.data);
              console.error("Server Error Status Code:", error.response.status);
              // console.error("Server Error Headers:", error.response.headers);
            }
          } else {
            console.error("Server Error Data:", error.response.data);
            console.error("Server Error Status Code:", error.response.status);
            console.error("Server Error Headers:", error.response.headers);
          }
        } finally {
          setIsLoading(false);
          setIsRequestInProgress(false);
        }
      }
    } catch (error) {
      console.error("Error in handleFacesDetected:", error);
    } finally {
      setIsLoading(false);
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
              style={{ ...StyleSheet.absoluteFill }}
              ratio="16:9"
              quality={1}
              exposureCompensation={0.8}
              type={type}
              onFacesDetected={handleFacesDetected}
              faceDetectorSettings={{
                mode: FaceDetector.FaceDetectorMode.accurate,
                detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                runClassifications:
                  FaceDetector.FaceDetectorClassifications.none,
                minDetectionInterval: 100,
                tracking: true,
              }}
            >
              <AnimatedCircularProgress
                style={styles.circularProgress}
                size={PREVIEW_SIZE}
                width={10}
                backgroundWidth={7}
                fill={fillAnimation}
                tintColor="#010089"
                backgroundColor="#e8e8e8"
              />
            </Camera>
          </MaskedView>

          <View>
            <BackButton />
          </View>
        </>
      )}
      {/* { showBlur && (
        <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={10} reducedTransparencyFallbackColor="white" />
      )} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  alertContainer: {
    width: 250, // Adjust width as needed
    height: 150, // Adjust height as needed
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    backgroundColor: "white",
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
  spinnerIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
