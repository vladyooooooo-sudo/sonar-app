import { Tabs } from 'expo-router/js-tabs';

import { SonarTabBar } from '@/components/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <SonarTabBar {...props} />} screenOptions={{ headerShown: false, animation: 'shift' }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="impara" />
      <Tabs.Screen name="radar" />
      <Tabs.Screen name="shop" />
      <Tabs.Screen name="invita" />
    </Tabs>
  );
}
