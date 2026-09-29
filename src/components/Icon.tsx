const P: Record<string, string> = {
  back: "M15 5l-7 7 7 7",
  close: "M6 6l12 12M18 6L6 18",
  star: "M12 3.8l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8z",
  bell: "M6 16V11a6 6 0 1112 0v5l1.5 2h-15zM10 20.5a2 2 0 004 0",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  info: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5.5M12 7.6v.1",
  alert: "M12 4l9 16H3zM12 10v4.5M12 17.4v.1",
  check: "M5 12.5l4.5 4.5L19 7.5",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7.5V12l3 2",
  chevron: "M9 5l7 7-7 7",
  swap: "M7 4v16M3.5 7.5L7 4l3.5 3.5M17 20V4M13.5 16.5L17 20l3.5-3.5",
  home: "M4 11l8-7 8 7v9h-5.5v-6h-5v6H4z",
  compass: "M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5z",
  pie: "M12 3v9h9M12 3a9 9 0 109 9",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20.5c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5",
  wifiOff: "M3 3l18 18M8.5 16.5a5 5 0 017 0M5 12.5a10 10 0 015.2-2.8M19 12.5a10 10 0 00-2.4-1.7M12 20h.01",
  backspace: "M9 5h11v14H9l-6-7zM12.5 9.5l5 5M17.5 9.5l-5 5",
  refresh: "M20 11a8 8 0 10-2.3 5.7M20 5v6h-6",
  shield: "M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z",
  dots: "M5 12h.01M12 12h.01M19 12h.01",
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 22, filled = false, strokeWidth = 1.75, title }: { name: IconName; size?: number; filled?: boolean; strokeWidth?: number; title?: string }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={name === "dots" ? 3 : strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={title ? undefined : true} role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      <path d={P[name]} />
    </svg>
  );
}
