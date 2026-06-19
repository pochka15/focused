import classes from "./backlog-modal.module.css";

// ─── Shared ghost span ────────────────────────────────────────────────────────

function Ghost({
  emoji,
  visible,
  onClick,
  title,
}: {
  emoji: string;
  visible: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <span
      title={title}
      style={{
        fontSize: "2rem",
        lineHeight: 1,
        opacity: visible ? 0.25 : 0,
        cursor: visible && onClick ? "pointer" : "default",
        transition: "opacity 150ms ease",
      }}
      onClick={() => visible && onClick?.()}
    >
      {emoji}
    </span>
  );
}

// ─── CarouselStep ─────────────────────────────────────────────────────────────
// For N≥3 options — always shows prev/next ghost on both sides.

export type CarouselOption<T> = {
  value: T;
  emoji: string;
  label: string;
};

type CarouselStepProps<T> = {
  options: CarouselOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function CarouselStep<T>({
  options,
  value,
  onChange,
}: CarouselStepProps<T>) {
  const idx = options.findIndex((opt) => opt.value === value);
  const safeIdx = idx >= 0 ? idx : 0;
  const current = options[safeIdx]!;
  const prev = options[(safeIdx - 1 + options.length) % options.length]!;
  const next = options[(safeIdx + 1) % options.length]!;

  return (
    <div className={classes.stepArea}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Ghost
          emoji={prev.emoji}
          visible
          title={prev.label}
          onClick={() => onChange(prev.value)}
        />
        <div
          className={`${classes.emojiBox} ${classes.optAnim}`}
          style={{ cursor: "pointer" }}
          onClick={() => onChange(next.value)}
        >
          <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>
            {current.emoji}
          </span>
        </div>
        <Ghost
          emoji={next.emoji}
          visible
          title={next.label}
          onClick={() => onChange(next.value)}
        />
      </div>
      <div className={classes.question}>{current.label}</div>
    </div>
  );
}

// ─── BinaryStep ───────────────────────────────────────────────────────────────
// For exactly 2 options — left is always falseOpt, right is always trueOpt.
// The non-selected side is visible as a ghost; the selected side ghost is hidden.

export type BinaryOption = {
  emoji: string;
  label: string;
};

type BinaryStepProps = {
  value: boolean;
  falseOpt: BinaryOption;
  trueOpt: BinaryOption;
  onChange: (value: boolean) => void;
};

export function BinaryStep({
  value,
  falseOpt,
  trueOpt,
  onChange,
}: BinaryStepProps) {
  const current = value ? trueOpt : falseOpt;
  return (
    <div className={classes.stepArea}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Ghost
          emoji={falseOpt.emoji}
          visible={value}
          onClick={() => onChange(false)}
          title={falseOpt.label}
        />
        <div
          className={`${classes.emojiBox} ${classes.optAnim}`}
          style={{ cursor: "pointer" }}
          onClick={() => onChange(!value)}
        >
          <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>
            {current.emoji}
          </span>
        </div>
        <Ghost
          emoji={trueOpt.emoji}
          visible={!value}
          onClick={() => onChange(true)}
          title={trueOpt.label}
        />
      </div>
      <div className={classes.question}>{current.label}</div>
    </div>
  );
}
