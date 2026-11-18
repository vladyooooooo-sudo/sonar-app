import { useApp } from '@/store/app-store';
import { palettes } from '@/theme/tokens';

export function useTheme() {
  const { theme } = useApp();
  return palettes[theme];
}
