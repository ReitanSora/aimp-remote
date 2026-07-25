import Constants from "expo-constants";
import { Dimensions } from "react-native";

export const { width: MAX_WIDTH, height: MAX_HEIGHT } = Dimensions.get("window");
export const statusBarHeight = Constants.statusBarHeight;