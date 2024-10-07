import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Image } from "react-native";
import { Text } from "@react-native-material/core";

import * as Speech from "expo-speech";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol,
} from "react-native-responsive-screen";

export default function Index() {
  // const { first_name, last_name } = useUser();

  const [fullName, setFullName] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserNames = async () => {
      const first_name = await AsyncStorage.getItem("FirstName");
      const last_name = await AsyncStorage.getItem("LastName");
      const welcomeSpeech = "Welcome" + first_name + "Please Proceed";
      const fullNamedetails = first_name + " " + last_name;
      setFullName(fullNamedetails);

      const options = {
        voice: "en-au-x-aua-local",
      };
      Speech.speak(welcomeSpeech, options);

      const timer = setTimeout(() => {
        navigation.navigate("Welcome");
        // router.push("/welcome");
      }, 5500);

      return () => clearTimeout(timer);
    };

    // Speak the welcome speech immediately when the component mounts

    fetchUserNames();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.main}>
        {/* <MaterialCommunityIcons name="check-bold" size={120} color="#FFFFF0" /> */}
        <Image
          style={styles.tickImage}
          source={require("../../assets/approved.png")}
        />
        <Text variant="h4" style={styles.title}>
          WELCOME
        </Text>
        <Text variant="h3" style={styles.name}>
          {fullName.toUpperCase()}
        </Text>
        <Text variant="h5" style={styles.info}>
          Enjoy your visit.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  tickImage: {
    width: wp("15%"),
    height: wp("15%"),
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: wp("1%"),
    width: "42%",
    height: "5.5%",
    alignSelf: "center",
    backgroundColor: "#fff",
    opacity: 0.8,
    marginTop: "5%",
    marginBottom: "10%",
    paddingRight: 15,
    paddingLeft: 15,
    paddingTop: 15,
    borderRadius: 10,
  },
  title: {
    color: "#000",

    fontStyle: "italic",
    fontWeight: "bold",
    fontFamily: "sans-serif-condensed",
  },
  name: {
    fontWeight: "bold",
    color: "#000",
    fontStyle: "italic",
    fontFamily: "sans-serif-condensed",
  },
  info: {
    color: "#000",
    fontStyle: "italic",
    fontWeight: "bold",
    fontFamily: "sans-serif-condensed",
    marginBottom: hp("5%"),
  },
});
