import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { FeedCard } from '../components/FeedCard';
import { Input } from '../components/Input';
import { ScreenLayout } from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      navigation.goBack();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <FeedCard title={mode === 'login' ? 'Sign in' : 'Create account'} accent="profile">
        <Text style={styles.intro}>
          {mode === 'login'
            ? 'Sign in to see your profile and resume history. Admins use the admin username.'
            : 'Register to save uploads to your profile.'}
        </Text>

        {mode === 'register' && (
          <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        )}
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={mode === 'register' ? 'Min. 6 characters' : 'Password'}
        />

        <Button
          title={mode === 'login' ? 'Sign in' : 'Register'}
          onPress={submit}
          loading={loading}
        />

        <Pressable
          onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={styles.switch}
        >
          <Text style={styles.switchText}>
            {mode === 'login'
              ? 'New here? Create an account'
              : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </FeedCard>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  intro: { ...typography.body, marginBottom: spacing.lg },
  switch: { marginTop: spacing.xl, alignItems: 'center' },
  switchText: { ...typography.bodyStrong, color: colors.accent },
});
