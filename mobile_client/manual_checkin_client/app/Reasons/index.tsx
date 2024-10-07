import React, { useState } from "react";
import axios from "axios";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import BackButton from "../components/BackButton";
import { useNavigation } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol,
} from "react-native-responsive-screen";

const Index = () => {
  const [floorId, setFloorId] = useState("");
  const [offices, setOffices] = useState([]);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const navigation = useNavigation();

  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    { id: 1, label: "OFFICIAL", value: "Official" },
    { id: 2, label: "SERVICE PROVIDER", value: "Service provider" },
    { id: 3, label: "NON-OFFICIAL", value: "Non-official" },
    { id: 4, label: "VISITATION", value: "Visitation" },
  ];

  // posting into backend
  const postingBDB = async (optioned) => {
    const token = await AsyncStorage.getItem("token");
    const visitId = await AsyncStorage.getItem("visitId");
    // fetch data from asynchronous storage
    AsyncStorage.multiGet([
      "buildingId",
      "visitorId",
      "selectedFloorId",
      "selectedOfficeId",
    ])
      .then((values) => {
        const buildingId = values[0][1].toString();
        const visitorId = values[1][1].toString();
        const floorId = values[2][1].toString();
        const officeId = values[3][1].toString();
        // visitor_id:visitorId,
        // building_id: buildingId,
        // floor_id: floorId,
        // office_id: officeId,
        const payload = {
          reasons: optioned.toString(),
        };

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        };
        axios
          .put(apiUrl + `/visit/${visitId}/`, payload, config)
          .then((response) => {
            console.log("Post response: ", response.data);
            navigation.navigate("Final");
            // router.push("/final");
          })
          .catch((error) => {
            console.error("error making post request:", error);
          });
      })
      .catch((error) => {
        console.error("error fetching data from asynchronous storage: ", error);
      });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        width: "70%",
        alignSelf: "center",
        // justifyContent: "center",
        marginTop: "1.5%",
        borderRadius: wp("55%"),
        padding: 30,
        borderWidth: wp("0.15%"),
        borderColor: "#000099",
        backgroundColor: selectedOption === item.id ? "#000" : "#fff", //#002D62
        opacity: 0.6,
        flexDirection: "row",
        alignItems: "center",
      }}
      onPress={() => {
        setSelectedOption(item.id);
        postingBDB(item.value);
      }}
    >
      <View
        style={{
          height: hp("3.5%"), // Adjust size as needed
          width: hp("3.5%"), // Adjust size as needed
          borderRadius: hp("1.75%"), // Make it a circle
          borderWidth: 2,
          borderColor: "black",
          backgroundColor: selectedOption === item.id ? "#00308F" : "#fff",
          marginRight: 10, // Add some space between the circle and text
        }}
      />
      <Text style={{ color: "black", fontWeight: 600, fontSize: hp("3.5%") }}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <Text
        style={{
          justifyContent: "center",
          alignContent: "center",
          alignSelf: "center",
          fontSize: 50,
          color: "#4d4d4d", //"#06062a",
          marginTop: "1%",
          marginBottom: "2%",
        }}
      >
        Reason for visit
      </Text>
      <FlatList
        data={options}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <View>
        <BackButton />
      </View>
    </View>
  );
};

export default Index;
