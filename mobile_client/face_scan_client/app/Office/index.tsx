import { router } from "expo-router";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, Button } from "@react-native-material/core";

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
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
  const [floorId, setFloorId] = useState("");
  const [offices, setOffices] = useState([]);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const navigation = useNavigation();

  useEffect(() => {
    AsyncStorage.getItem("selectedFloorId").then((value) => {
      if (value) {
        console.log("Fetched floorId: ", value);

        setFloorId(value);
        fetchOffices(value);
      }
    });
  }, []);

  const fetchOffices = async (floorId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      };
      // 'https://staging--api.cintelcoreams.com'
      const response = await axios.get(
        apiUrl + `/office/?floor=${floorId}`,
        config
      );
      console.log("Office Response: ", response.data);

      // Extract floor numbers with associated IDs
      const officeData = response.data.map((officeData) => ({
        id: officeData.id,
        office_name: officeData.office_name,
      }));

      setOffices(officeData);
    } catch (error) {
      console.error("Error fetching offices:", error);
    }
  };

  const selectoffice = (office) => {
    AsyncStorage.setItem("selectedOfficeId", office.id.toString());
    console.log("Office Id", office.id);
  };

  const _onPress = async (office) => {
    playSoundAndVibrate();
    selectoffice(office);

    const token = await AsyncStorage.getItem("token");

    // Fetch buildingId, visitorId, and other data from AsyncStorage
    AsyncStorage.multiGet([
      "buildingId",
      "visitorId",
      "selectedFloorId",
      "token",
    ])
      .then((values) => {
        const buildingId = values[0][1].toString(); // Convert to string
        const visitorId = values[1][1].toString(); // Convert to string
        const floorId = values[2][1].toString(); // Convert to string

        const truth = "True".toString();
        // Create the payload with the required data
        const payload = {
          visitor: visitorId,
          building: buildingId,
          floor: floorId,
          office: office.id.toString(), // Convert to string
          is_checked_in: true,
        };

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        };

        //Make a POST request to your backend server
        // 'https://api.cintelcoreams.com'
        axios
          .post(apiUrl + "/visit/", payload, config)
          .then((response) => {
            // Handle the response as needed
            console.log("VISIT POST Response: ", response.data);
            AsyncStorage.setItem("visitId", response.data.id.toString());
            //console.log("visitor_id"response.data.id.toString());
            //router.push("/final");
            navigation.navigate("Reasons");
          })
          .catch((error) => {
            console.error("Error making POST request:", error);
            console.error("Error making POST response:", error.response);
            console.error(
              "Error making POST response data:",
              error.response.data
            );
          });
      })
      .catch((error) => {
        console.error("Error fetching data from AsyncStorage:", error);
      });
  };

  const renderofficeButtons = () => {
    const rows = Math.ceil(offices.length / 3); // Calculate the number of rows needed

    const officeButtons = [];
    let officeIndex = 0;

    for (let i = 0; i < rows; i++) {
      const row = [];

      for (let j = 0; j < 4; j++) {
        // Change the loop condition to j < 3
        if (officeIndex < offices.length) {
          const office = offices[officeIndex];
          row.push(
            <View style={styles.officeButton} key={`office-${office.id}`}>
              <AwesomeButton
                backgroundColor="#08154A"
                backgroundDarker="#fff"
                onPress={() => _onPress(office)}
                stretch
                borderRadius={50}
                key={`button-${office.id}`}
                textSize={20}
                style={{ width: "150%" }}
              >
                {office.office_name}
              </AwesomeButton>
            </View>
          );
          officeIndex++;
        }
      }

      officeButtons.push(
        <View key={i} style={styles.row}>
          {row}
        </View>
      );
    }

    return officeButtons;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.main}>
        <Text variant="h4" style={styles.title}>
          Select Office
        </Text>
        <View style={styles.content}>{renderofficeButtons()}</View>
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
  },
  main: {
    flex: 1,
    alignItems: "center",
    marginTop: 140,
  },
  content: {
    width: 600,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    color: "#010089",
    paddingBottom: 40,
  },
  officeButton: {
    width: 120,
    justifyContent: "center",
    marginTop: 36,
    marginLeft: 10,
  },
});
