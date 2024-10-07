import { router } from "expo-router";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, Button } from "@react-native-material/core";

import axios from "axios";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AwesomeButton from "react-native-really-awesome-button";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import BackButton from "../components/BackButton";

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
  const [buildingId, setBuildingId] = useState("");
  const [floors, setFloors] = useState([]);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const navigation = useNavigation();
  // const apiUrl = `https://api.cintelcoreams.com`; //process.env.EXPO_PUBLIC_API_URL;
  //`https://staging--api.cintelcoreams.com`

  useEffect(() => {
    AsyncStorage.getItem("buildingId").then((value) => {
      if (value) {
        console.log("Fetched buildingId : ", value);

        const parsedBuildingId = parseInt(value, 10);
        console.log("parsedid: ", parsedBuildingId);
        setBuildingId(value);
        fetchFloors(value);
      }
    });
    //const bID = AsyncStorage.getItem("buildingId")

    //fetchFloors(bID)
  }, []);

  const fetchFloors = async (buildingId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      };

      //http://13.48.26.215:8000/floor/?building=031ee99b-9f15-4857-8508-21d88862d380
      // 'https://staging--api.cintelcoreams.com'
      const response = await axios.get(
        apiUrl + `/floor/?building=${buildingId}`,
        config
      );
      console.log("Response: ", response.data);

      // Extract floor numbers with associated IDs
      const floorData = response.data.map((floorData) => ({
        id: floorData.id,
        floor_number: floorData.floor_number,
      }));

      setFloors(floorData);
    } catch (error) {}
  };

  const selectFloor = (floor) => {
    // Set the selected floor ID in AsyncStorage
    AsyncStorage.setItem("selectedFloorId", floor.id.toString());
    console.log("Floor Id", floor.id);
  };

  const _onPress = (floor) => {
    playSoundAndVibrate();
    selectFloor(floor);
    // Delay the navigation to the next screen by 1 second (adjust the delay duration as needed)
    setTimeout(() => {
      navigation.navigate("Office");
      // router.push("/office");
    }, 1000); // Delay in milliseconds (1 second in this case)
  };

  const renderFloorButtons = () => {
    const rows = Math.ceil(floors.length / 5); // Calculate the number of rows needed

    const floorButtons = [];
    let floorIndex = 0;

    for (let i = 0; i < rows; i++) {
      const row = [];

      for (let j = 0; j < 5; j++) {
        if (floorIndex < floors.length) {
          const floor = floors[floorIndex];
          row.push(
            <View style={styles.floorButton} key={`floor-${floor.id}`}>
              <AwesomeButton
                backgroundColor="#08154A"
                onPress={() => _onPress(floor)}
                stretch
                borderRadius={50}
                key={`button-${floor.id}`}
                textSize={20}
                backgroundDarker="#fff"
                style={{ width: "100%" }}
              >
                {floor.floor_number.toString()}
              </AwesomeButton>
            </View>
          );
          floorIndex++;
        }
      }

      floorButtons.push(
        <View key={i} style={styles.row}>
          {row}
        </View>
      );
    }

    return floorButtons;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.main}>
        <Text variant="h4" style={styles.title}>
          SELECT FLOOR
        </Text>
        <View style={styles.content}>{renderFloorButtons()}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  main: {
    flex: 1,
    alignItems: "center",
    marginLeft: 60,
  },
  content: {
    width: 900,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    textAlign: "center",
    color: "#010089",
    marginTop: 70,
  },
  floorButton: {
    width: 120,
    justifyContent: "center",
    marginTop: 36,
    marginLeft: 10,
  },
});
