import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

export function LoginHeaderButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) return null;

  return (
    <Pressable
      onPress={() => navigation.navigate('Login')}
      style={styles.btn}
      hitSlop={8}
    >
      <Text style={styles.text}>Log in</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent,
    marginRight: spacing.sm,
  },
  text: { ...typography.captionBold, color: colors.accent },
});
