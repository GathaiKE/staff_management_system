import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome5";
import Iconlg from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toastnotify from "../ToastNotify";

const Header = (props) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      // navigation.navigate("Login");
      Toastnotify("success", "loged out", "");
    } catch (error) {
      Toastnotify("error", "logout failed", "");
    }
  };
  return (
    <SafeAreaView>
      <View className="flex flex-row justify-between px-5  opacity-95  border-[0.5px] border-solid border-gray-400">
        <View className="flex justify-center items-center ml-10">
          <Image
            source={require("../../assets/cintelcoreams-logo.png")}
            resizeMode="contain"
          />
        </View>

        <View className="flex flex-row justify-center items-center mr-10">
          <Text className="text-gray-700 font-medium text-xl">Powered by</Text>
          <Image
            source={require("../../assets/Vector.png")}
            resizeMode="contain"
            style={styles.imagelogo}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  imagelogo: {
    // height: hp("12%"),
    width: wp("10%"),
    aspectRatio: 1,
  },
  // button: {
  //   // paddingTop: 10,
  //   // marginTop: hp("1%"),
  //   position: "absolute",
  //   bottom: "30%",
  //   right: "2.5%",
  // },
  // headers: {
  //   // display: "flex",
  //   // justifyContent: "space-between",
  //   // paddingHorizontal: wp("2%"),
  //   height: hp("10%"),
  //   // paddingTop: 10,
  //   // width: wp("100%"),
  //   // paddingVertical: hp("1.5%"),
  // },
});
