import { Redirect } from 'expo-router';

// Entry point. The root layout's auth gate sends logged-in users to the app;
// everyone else starts on the welcome screen.
export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
