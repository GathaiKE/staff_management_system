import { Slot } from "expo-router";
import { ImageBackground, StyleSheet } from "react-native";
import { Header } from "./Header";
import { StatusBar } from "expo-status-bar";

export default function HomeLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <ImageBackground
        source={require("../assets/images/5026563.jpg")}
        style={styles.backgroundImg}
      >
        <Header />
        <Slot />
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImg: {
    flex: 1,
    resizeMode: "contain",
    marginTop: "-33.5%",
  },
});
