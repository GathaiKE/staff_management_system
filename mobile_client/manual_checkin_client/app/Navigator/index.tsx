import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageBackground, StyleSheet } from "react-native";
import Header from "../Header";
import Welcome from "../Welcome";
import Login from "../Login";

import NamesForm from "../components/NamesForm";
import IdForm from "../components/IdForm";
import OtpForm from "../components/OtpForm";
import Floor from "../Floor";
import Office from "../Office";
import Checkout from "../Checkout";
import Reasons from "../Reasons";
import Goodbye from "../Goodbye";
import Final from "../Final";
import Checkin from "../Checkin";
import Toast from "react-native-toast-message";

const StackNav = createNativeStackNavigator();

function Navigator() {
  return (
    <NavigationContainer>
      <Header />
      <Toast />

      <StackNav.Navigator
        initialRouteName="Login"
        screenOptions={{
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <StackNav.Screen
          name="Login"
          options={{ headerShown: false }}
          component={Login}
        />
        <StackNav.Screen
          name="Welcome"
          options={{ headerShown: false }}
          component={Welcome}
        />

        <StackNav.Screen
          name="NamesForm"
          options={{ headerShown: false }}
          component={NamesForm}
        />
        <StackNav.Screen
          name="IdForm"
          options={{ headerShown: false }}
          component={IdForm}
        />
        <StackNav.Screen
          name="OtpForm"
          options={{ headerShown: false }}
          component={OtpForm}
        />
        <StackNav.Screen
          name="Floor"
          options={{ headerShown: false }}
          component={Floor}
        />
        <StackNav.Screen
          name="Office"
          options={{ headerShown: false }}
          component={Office}
        />
        <StackNav.Screen
          name="Checkout"
          options={{ headerShown: false }}
          component={Checkout}
        />
        <StackNav.Screen
          name="Final"
          options={{ headerShown: false }}
          component={Final}
        />
        <StackNav.Screen
          name="Reasons"
          options={{ headerShown: false }}
          component={Reasons}
        />
        <StackNav.Screen
          name="Goodbye"
          options={{ headerShown: false }}
          component={Goodbye}
        />
        <StackNav.Screen
          name="Checkin"
          options={{ headerShown: false }}
          component={Checkin}
        />
      </StackNav.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;

const styles = StyleSheet.create({
  backgroundImg: {
    flex: 1,
    resizeMode: "contain",
    // marginTop: "-33.5%",
  },
});
