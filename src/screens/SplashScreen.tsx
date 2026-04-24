import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Theme, font, SPACING } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

const SplashScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.logoText}>IBA PST JST</Text>
        <Text style={styles.subText}>Test Preparation</Text>
      </Animated.View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: font.hero,
    fontWeight: 'bold',
    color: theme.textOnPrimary,
    letterSpacing: 2,
  },
  subText: {
    fontSize: font.lg,
    color: theme.textOnPrimary,
    marginTop: SPACING.sm,
    opacity: 0.9,
  },
});

export default SplashScreen;
