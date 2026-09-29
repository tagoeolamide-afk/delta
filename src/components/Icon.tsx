import {
  ArrowLeft, ArrowUpDown, Bell, ChartPie, Check, ChevronDown, ChevronRight, CircleAlert, CircleCheck, Clock, Compass,
  Delete, Ellipsis, Eye, EyeOff, History, House, Info, Landmark, Layers, Minus, Plus, RefreshCw, Search, ShieldCheck,
  Sparkles, Star, TriangleAlert, User, Wallet, WifiOff, X, type LucideIcon,
} from "lucide-react";

/** Lucide icon set (1.75px stroke). Names are Delta's semantic names, not Lucide's. */
const ICONS = {
  back: ArrowLeft,
  close: X,
  star: Star,
  bell: Bell,
  search: Search,
  info: Info,
  alert: TriangleAlert,
  alertCircle: CircleAlert,
  check: Check,
  checkCircle: CircleCheck,
  clock: Clock,
  chevron: ChevronRight,
  chevronDown: ChevronDown,
  swap: ArrowUpDown,
  home: House,
  compass: Compass,
  pie: ChartPie,
  user: User,
  wifiOff: WifiOff,
  backspace: Delete,
  refresh: RefreshCw,
  shield: ShieldCheck,
  dots: Ellipsis,
  plus: Plus,
  minus: Minus,
  wallet: Wallet,
  history: History,
  eye: Eye,
  eyeOff: EyeOff,
  bank: Landmark,
  layers: Layers,
  sparkles: Sparkles,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, filled = false, strokeWidth = 1.75, title }: { name: IconName; size?: number; filled?: boolean; strokeWidth?: number; title?: string }) {
  const C = ICONS[name];
  return (
    <C
      size={size}
      strokeWidth={strokeWidth}
      fill={filled ? "currentColor" : "none"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      role={title ? "img" : undefined}
    />
  );
}
