interface StitchDividerProps {
  inverted?: boolean;
}

export default function StitchDivider({ inverted = false }: StitchDividerProps) {
  return (
    <svg className="stitch-divider" viewBox="0 0 1200 26" preserveAspectRatio="none" aria-hidden="true">
      <path
        d={
          inverted
            ? 'M0 13 Q30 24, 60 13 T 120 13 T 180 13 T 240 13 T 300 13 T 360 13 T 420 13 T 480 13 T 540 13 T 600 13 T 660 13 T 720 13 T 780 13 T 840 13 T 900 13 T 960 13 T 1020 13 T 1080 13 T 1140 13 T 1200 13'
            : 'M0 13 Q30 2, 60 13 T 120 13 T 180 13 T 240 13 T 300 13 T 360 13 T 420 13 T 480 13 T 540 13 T 600 13 T 660 13 T 720 13 T 780 13 T 840 13 T 900 13 T 960 13 T 1020 13 T 1080 13 T 1140 13 T 1200 13'
        }
      />
      <circle cx="60" cy="13" r="3" />
      <circle cx="180" cy="13" r="3" />
      <circle cx="300" cy="13" r="3" />
      <circle cx="420" cy="13" r="3" />
      <circle cx="540" cy="13" r="3" />
      <circle cx="660" cy="13" r="3" />
      <circle cx="780" cy="13" r="3" />
      <circle cx="900" cy="13" r="3" />
      <circle cx="1020" cy="13" r="3" />
      <circle cx="1140" cy="13" r="3" />
    </svg>
  );
}
