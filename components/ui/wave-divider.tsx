interface WaveDividerProps {
  color?: string;
  flip?: boolean;
}

export function WaveDivider({ color = "fill-background", flip = false }: WaveDividerProps) {
  return (
    <div className={`w-full overflow-hidden leading-none${flip ? " rotate-180" : ""}`}>
      <svg
        viewBox="0 0 1440 60"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-12 md:h-16"
        aria-hidden="true"
      >
        <path
          d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
          className={color}
        />
      </svg>
    </div>
  );
}
