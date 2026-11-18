import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'learn'
  | 'radar'
  | 'shop'
  | 'gift'
  | 'settings'
  | 'up'
  | 'down'
  | 'lock'
  | 'check'
  | 'flame'
  | 'trophy'
  | 'close'
  | 'chevron'
  | 'back'
  | 'share'
  | 'copy'
  | 'bolt'
  | 'info'
  | 'star'
  | 'wallet';

const paths: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  learn: 'M2 8.5 12 4l10 4.5-10 4.5zM6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5M22 8.5V14',
  radar: 'M12 12 19 5M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5',
  shop: 'M6 3h12l3 6H3zM3 9l9 12 9-12M9 9l3 12 3-12M8.5 3 9 9M15.5 3 15 9',
  gift: 'M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7S10.5 3 8 3.5 7.5 7 12 7zM12 7s1.5-4 4-3.5S16.5 7 12 7z',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  up: 'M4 17 10 11l4 4 6-7M14 8h6v6',
  down: 'M4 7l6 6 4-4 6 7M14 16h6v-6',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 1 1 8 0v4',
  check: 'M4 12.5 9.5 18 20 6',
  flame: 'M12 22c4 0 7-2.7 7-7 0-5-5-7-4-13-3 2-5 5-5 8-1-1-2-2-2-4-2 2-3 5-3 8 0 5 3 8 7 8z',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'M9 5l7 7-7 7',
  back: 'M15 5l-7 7 7 7',
  share: 'M12 3v13M7 8l5-5 5 5M5 13v7h14v-7',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  info: 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
  wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7V6a2 2 0 0 1 2-2h11v3M16 13.5h2',
};

export function Icon({
  name,
  size = 22,
  color,
  stroke = 1.9,
  fill,
}: {
  name: IconName;
  size?: number;
  color: string;
  stroke?: number;
  fill?: string;
}) {
  // Wrapped in a View so it stacks above absolutely-positioned gradients (web).
  return (
    <View pointerEvents="none" style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'radar' && <Circle cx="12" cy="12" r="1.8" fill={color} />}
      <Path
        d={paths[name]}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill ?? 'none'}
      />
    </Svg>
    </View>
  );
}
