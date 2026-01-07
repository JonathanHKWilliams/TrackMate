import { Stack } from 'expo-router';

export default function EstimateHubLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000' },
        animation: 'fade',
      }}
    />
  );
}
