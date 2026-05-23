import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoginHeaderButton } from '../components/LoginHeaderButton';
import { useAuth } from '../context/AuthContext';
import { fonts } from '../fonts';
import { AboutScreen } from '../screens/AboutScreen';
import { AnalyzeScreen } from '../screens/AnalyzeScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { colors, typography } from '../theme';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_BAR_BASE = 60;
const ICON_SIZE = 24;

type TabIconName = keyof typeof Ionicons.glyphMap;

const tabIcons: Record<keyof TabParamList, { active: TabIconName; inactive: TabIconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Analyze: { active: 'document-text', inactive: 'document-text-outline' },
  Feedback: { active: 'chatbox', inactive: 'chatbox-outline' },
  About: { active: 'information-circle', inactive: 'information-circle-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const navTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: '400' },
    medium: { fontFamily: fonts.medium, fontWeight: '500' },
    bold: { fontFamily: fonts.bold, fontWeight: '700' },
    heavy: { fontFamily: fonts.bold, fontWeight: '700' },
  },
};

const headerOptions = {
  headerStyle: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  } as const,
  headerTitleStyle: {
    ...typography.heading,
    color: colors.text,
  },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerRight: () => <LoginHeaderButton />,
};

function TabIcon({
  routeName,
  focused,
  color,
}: {
  routeName: keyof TabParamList;
  focused: boolean;
  color: string;
}) {
  const icons = tabIcons[routeName];
  return (
    <Ionicons
      name={focused ? icons.active : icons.inactive}
      size={ICON_SIZE}
      color={color}
    />
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
      {label}
    </Text>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);
  const { isLoggedIn, isAdmin, booting } = useAuth();

  if (booting) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName="Home"
      safeAreaInsets={{ bottom: bottomInset }}
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon routeName={route.name as keyof TabParamList} focused={focused} color={color} />
        ),
        tabBarLabel: ({ focused }) => {
          const labels: Record<keyof TabParamList, string> = {
            Home: 'Home',
            Analyze: 'Tech resume',
            Feedback: 'Feedback',
            About: 'About',
            Profile: isAdmin ? 'Admin' : 'Profile',
          };
          return (
            <TabLabel label={labels[route.name as keyof TabParamList]} focused={focused} />
          );
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: TAB_BAR_BASE + bottomInset,
          paddingTop: 10,
          paddingBottom: bottomInset + 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: styles.tabItem,
      })}
    >
      <Tab.Screen name="Home" component={LandingScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Analyze" component={AnalyzeScreen} options={{ title: 'Tech resume' }} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
      <Tab.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      {isLoggedIn ? (
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      ) : null}
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Tech report' }} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Sign in', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  tabItem: {
    paddingTop: 4,
    paddingBottom: 2,
  },
  tabLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  tabLabelActive: { fontFamily: fonts.bold, color: colors.accent },
});
