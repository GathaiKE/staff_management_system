import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Image } from "react-native";
import { Text, Stack } from "@react-native-material/core";
import * as Speech from "expo-speech";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
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
    const fetchUserDets = async () => {
      const first_name = await AsyncStorage.getItem("FirstName");
      const last_name = await AsyncStorage.getItem("LastName");
      const goodbyeSpeech = first_name + "Thank you for visiting";
      const fullNamed = first_name + " " + last_name;
      setFullName(fullNamed);
      const options = {
        voice: "en-au-x-aua-local",
      };
      Speech.speak(goodbyeSpeech, options);
      const timer = setTimeout(() => {
        navigation.navigate("Welcome");
      }, 5500);

      return () => clearTimeout(timer);
    };

    // Speak the welcome speech immediately when the component mounts

    fetchUserDets();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.main}>
        {/* <MaterialCommunityIcons name="hand-clap" size={120} color="#F0EAD6" /> */}
        <Image
          style={styles.shield}
          source={require("../../assets/waving.png")}
        />
        <Text variant="h3" style={styles.name}>
          {fullName.toUpperCase()}
        </Text>
        <Text variant="h4" style={styles.title}>
          THANK YOU FOR VISITING.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    height: wp("50%"),
  },
  shield: {
    resizeMode: "cover",
    height: hp("20%"),
    width: wp("20%"),
    aspectRatio: 1,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    gap: wp("1%"),
    backgroundColor: "#fff", //,
    opacity: 0.71,
    marginTop: "5%",
    marginBottom: "10%",
    paddingRight: wp("10%"),
    paddingLeft: wp("10%"),
    paddingTop: 15,
    borderRadius: 50,
    borderColor: "#003567",
    borderWidth: 1,
  },
  title: {
    color: "#000",
    fontWeight: "bold",
    fontStyle: "italic",
    fontFamily: "sans-serif-condensed",
  },
  name: {
    fontWeight: "bold",
    color: "#000",
    fontStyle: "italic",
    fontFamily: "sans-serif-condensed",
  },
  info: {
    fontWeight: "bold",
    color: "white",
    fontStyle: "italic",
    fontFamily: "sans-serif-condensed",
  },
});
