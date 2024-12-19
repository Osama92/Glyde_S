// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack />;
// }


import { Slot, Stack } from "expo-router";
import { View } from "react-native";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot screenOptions={{headerShown: false}}/>
    </View>
  );
}

