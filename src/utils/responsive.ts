import { Dimensions, PixelRatio } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');
const shortestSide = Math.min(width, height);
const isTablet = shortestSide >= 600;

const tabletClamp = (raw: number) => {
  if (!isTablet) return raw;
  const phoneEquivalent = raw * (400 / shortestSide);
  return Math.min(raw, phoneEquivalent * 1.3);
};

export const RW = (value: number | string) => tabletClamp(wp(value));
export const RH = (value: number | string) => tabletClamp(hp(value));

export const font = {
  xs: RH('1.5%'),
  sm: RH('1.8%'),
  md: RH('2%'),
  lg: RH('2.3%'),
  xl: RH('2.8%'),
  xxl: RH('3.2%'),
  xxxl: RH('4%'),
  hero: RH('5.2%'),
};

export const ICON = {
  sm: RW('4%'),
  md: RW('5%'),
  lg: RW('6%'),
  xl: RW('7%'),
  xxl: RW('12%'),
};

export const DIM = {
  hairline: 1 / PixelRatio.get(),
  progressBarThin: RH('0.8%'),
  progressBarThick: RH('1%'),
  optionCircle: RW('8%'),
  button: RH('6.8%'),
  scoreCircle: RW('38%'),
  iconContainer: RW('12%'),
};
