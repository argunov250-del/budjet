import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { IconName } from '../store/types';

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number };

/** Stroke icons from the prototype (24x24 viewBox). */
export function Icon({ name, size = 24, color, strokeWidth = 2 }: Props) {
  const c = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;
  let body;
  switch (name) {
    case 'cart': body = (<><Path d="M3 4h2.5l2 11h10l2-8H7" {...c} /><Circle cx="9" cy="19.5" r="1.4" {...c} /><Circle cx="17" cy="19.5" r="1.4" {...c} /></>); break;
    case 'kid': body = (<><Circle cx="12" cy="8" r="4" {...c} /><Path d="M5 21a7 7 0 0 1 14 0" {...c} /></>); break;
    case 'coffee': body = (<><Path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" {...c} /><Path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2" {...c} /><Path d="M8 3v2M12 3v2" {...c} /></>); break;
    case 'car': body = (<><Path d="M5 16V11l2-5h10l2 5v5z" {...c} /><Path d="M5 12h14" {...c} /><Circle cx="8" cy="16" r="1" {...c} /><Circle cx="16" cy="16" r="1" {...c} /><Path d="M6 16v3M18 16v3" {...c} /></>); break;
    case 'tag': body = (<><Path d="M3 12V4h8l10 10-8 8z" {...c} /><Circle cx="7.5" cy="8.5" r="1.3" {...c} /></>); break;
    case 'home': body = (<><Path d="M4 11l8-7 8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z" {...c} /><Path d="M10 20.5v-5h4v5" {...c} /></>); break;
    case 'house': body = <Path d="M4 11l8-7 8 7v8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z" {...c} />; break;
    case 'heart': body = <Path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" {...c} />; break;
    case 'ticket': body = (<><Path d="M3.5 8.5a2 2 0 0 0 0 4v0a2 2 0 0 1 0 0V16a1.5 1.5 0 0 0 1.5 1.5h14A1.5 1.5 0 0 0 20.5 16v-3.5a2 2 0 0 1 0-4V7A1.5 1.5 0 0 0 19 5.5H5A1.5 1.5 0 0 0 3.5 7z" {...c} /><Path d="M14 6v12" strokeDasharray="1.5 2.5" {...c} /></>); break;
    case 'repeat': body = (<><Path d="M4 11V9a3 3 0 0 1 3-3h11l-3-3M20 13v2a3 3 0 0 1-3 3H6l3 3" {...c} /></>); break;
    case 'list': body = (<><Path d="M8 6h12M8 12h12M8 18h12" {...c} /><Circle cx="4" cy="6" r="1" {...c} /><Circle cx="4" cy="12" r="1" {...c} /><Circle cx="4" cy="18" r="1" {...c} /></>); break;
    case 'sparkles': body = (<><Path d="M10 4l1.8 4.7L16.5 10.5l-4.7 1.8L10 17l-1.8-4.7L3.5 10.5l4.7-1.8z" {...c} /><Path d="M18 3v4M16 5h4M18.5 15v3.5M16.8 16.8h3.4" {...c} /></>); break;
    case 'target': body = (<><Circle cx="12" cy="12" r="8.5" {...c} /><Circle cx="12" cy="12" r="4.5" {...c} /><Circle cx="12" cy="12" r="1" {...c} fill={color} /></>); break;
    case 'bars': body = <Path d="M5 20V12M12 20V5M19 20v-5" {...c} />; break;
    case 'calendar': body = (<><Rect x="3.5" y="5" width="17" height="15" rx="3.5" {...c} /><Path d="M8 3v4M16 3v4M3.5 10h17M8 14.5h2M13 14.5h3" {...c} /></>); break;
    case 'sun': body = (<><Circle cx="12" cy="12" r="4" {...c} /><Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" {...c} /></>); break;
    case 'check': body = <Path d="M5 12.5l4.5 4.5L19 7.5" {...c} />; break;
    case 'plus': body = <Path d="M12 5v14M5 12h14" {...c} />; break;
  }
  return <Svg width={size} height={size} viewBox="0 0 24 24">{body}</Svg>;
}
