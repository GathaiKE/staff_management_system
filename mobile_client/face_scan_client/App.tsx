import "./gesture-handler";
import { StatusBar } from "expo-status-bar";
import Navigator from "./app/Navigator";
import { ImageBackground, StyleSheet } from "react-native";

export default function App() {
  return (
    <>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <ImageBackground
        source={require("./assets/images/textu.jpg")}
        style={styles.backgroundImg}
      >
        <Navigator />
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImg: {
    flex: 1,
    resizeMode: "contain",
    height: "100%",
    width: "100%",
    // marginTop: "-33.5%",
  },
});
