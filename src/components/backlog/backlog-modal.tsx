import { useSimpleForm } from "@/hooks/use-simple-form";
import type { BacklogTask, BacklogTaskKind } from "@/lib/stores/planning-store";
import { KIND_META } from "./backlog-task-card";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import {
  Box,
  Button,
  Group,
  Kbd,
  Modal,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import classes from "./backlog-modal.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

type BacklogFormValues = {
  name: string;
  description: string;
  kind: BacklogTaskKind;
  isNext: boolean;
  chunkable: boolean;
};

const defaultValues = (task?: BacklogTask): BacklogFormValues => ({
  name: task?.name ?? "",
  description: task?.description ?? "",
  kind: task?.kind ?? "doing-it-today",
  isNext: task?.isNext ?? false,
  chunkable: task?.chunkable ?? true,
});

const ALL_KINDS: BacklogTaskKind[] = [
  "doing-it-today",
  "they-asked-me-to",
  "thank-yourself-later",
];

function cycleKind(current: BacklogTaskKind): BacklogTaskKind {
  const idx = ALL_KINDS.indexOf(current);
  return ALL_KINDS[(idx + 1) % ALL_KINDS.length]!;
}

// ─── SVG chart points ─────────────────────────────────────────────────────────
// All three share a 100×60 viewBox. Points are [x, y] pairs for a polyline.
// "they-asked-me-to": scattered dots, no connecting line (lineOpacity → 0)

const W = 100;
const H = 60;

type ChartShape = {
  points: [number, number][];
  lineOpacity: number;
  dotted: boolean; // render as individual circles instead of polyline
};

const CHART: Record<BacklogTaskKind, ChartShape> = {
  // Sigmoid: rises steeply, plateaus — finite feature with a done state
  "doing-it-today": {
    points: [
      [0, H],
      [20, H - 8],
      [40, H - 28],
      [60, H - 46],
      [80, H - 52],
      [W, H - 54],
    ],
    lineOpacity: 1,
    dotted: false,
  },
  // Scattered: unclear signal, just observing
  "they-asked-me-to": {
    points: [
      [8, H - 20],
      [28, H - 38],
      [48, H - 14],
      [68, H - 44],
      [88, H - 30],
      [W - 4, H - 22],
    ],
    lineOpacity: 0,
    dotted: true,
  },
  // Exponential: starts flat, breaks upward, no ceiling
  "thank-yourself-later": {
    points: [
      [0, H - 2],
      [20, H - 6],
      [40, H - 14],
      [60, H - 28],
      [80, H - 46],
      [W, H - 60],
    ],
    lineOpacity: 1,
    dotted: false,
  },
};

function pointsToStr(pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x},${y}`).join(" ");
}

function KindChart({ kind }: { kind: BacklogTaskKind }) {
  const shape = CHART[kind];
  const prev = useRef<BacklogTaskKind>(kind);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (prev.current !== kind) {
      prev.current = kind;
      setAnimKey((k) => k + 1);
    }
  }, [kind]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={160}
      height={96}
      style={{ overflow: "visible", cursor: "pointer" }}
    >
      {/* Axes */}
      <line
        x1={0}
        y1={H}
        x2={W}
        y2={H}
        stroke="var(--mantine-color-default-border)"
        strokeWidth={1}
      />
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={H}
        stroke="var(--mantine-color-default-border)"
        strokeWidth={1}
      />

      {/* Line (hidden for dotted) */}
      {!shape.dotted && (
        <polyline
          key={`line-${animKey}`}
          points={pointsToStr(shape.points)}
          fill="none"
          stroke="var(--mantine-color-blue-5)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={shape.lineOpacity}
          className={classes.chartLine}
        />
      )}

      {/* Dots */}
      {shape.points.map(([x, y], i) => (
        <circle
          key={`dot-${animKey}-${i}`}
          cx={x}
          cy={y}
          r={shape.dotted ? 3 : 2}
          fill="var(--mantine-color-blue-5)"
          className={shape.dotted ? classes.chartDotScatter : classes.chartDot}
          style={{ animationDelay: `${i * 40}ms` }}
        />
      ))}
    </svg>
  );
}

// ─── Step 0: IsNext ───────────────────────────────────────────────────────────

const IS_NEXT_OPTS = [
  { value: true, emoji: "🔥", label: "On my plate right now" },
  { value: false, emoji: "🫙", label: "Parking it for later" },
] as const;

function IsNextStep({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const active = value ? IS_NEXT_OPTS[0] : IS_NEXT_OPTS[1];
  return (
    <div className={classes.stepArea}>
      <div
        key={active.emoji}
        className={`${classes.emojiBox} ${classes.optAnim}`}
        style={{ cursor: "pointer" }}
        onClick={() => onChange(!value)}
      >
        <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>
          {active.emoji}
        </span>
      </div>
      <div className={classes.question}>{active.label}</div>
    </div>
  );
}

// ─── Step 1: Kind (SVG morph) ─────────────────────────────────────────────────

function KindStep({
  value,
  onChange,
}: {
  value: BacklogTaskKind;
  onChange: (v: BacklogTaskKind) => void;
}) {
  const meta = KIND_META[value];
  return (
    <div className={classes.stepArea}>
      <div
        style={{ cursor: "pointer" }}
        onClick={() => onChange(cycleKind(value))}
      >
        <KindChart kind={value} />
      </div>
      <div className={classes.question}>
        <span style={{ marginRight: 6 }}>{meta.emoji}</span>
        {meta.label}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {ALL_KINDS.map((k) => (
          <div
            key={k}
            onClick={() => onChange(k)}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background:
                k === value
                  ? "var(--mantine-color-blue-5)"
                  : "var(--mantine-color-default-border)",
              cursor: "pointer",
              transition: "background 200ms",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Chunkable ────────────────────────────────────────────────────────

function ChunkableStep({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const dotX = value ? [-28, 0, 28] : [0, 0, 0];
  const dotOpacity = value ? [1, 1, 1] : [0, 1, 0];
  return (
    <div className={classes.stepArea}>
      <div
        className={classes.chunkDots}
        style={{ cursor: "pointer" }}
        onClick={() => onChange(!value)}
      >
        {dotX.map((x, i) => (
          <div
            key={i}
            className={classes.chunkDot}
            style={{ transform: `translateX(${x}px)`, opacity: dotOpacity[i] }}
          />
        ))}
      </div>
      <div className={classes.question}>
        {value ? "Can knock it out in 15 min" : "Needs a proper block of time"}
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const STEP_COUNT = 3;

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<BacklogTask, "id">) => void;
  editing?: BacklogTask;
};

export function BacklogModal({ opened, onClose, onSubmit, editing }: Props) {
  const { values, setValues, reset } = useSimpleForm<BacklogFormValues>(
    defaultValues(editing)
  );
  const nameRef = useRef<HTMLTextAreaElement>(null);
  const [step, setStep] = useState(0);
  const [stepKey, setStepKey] = useState(0);

  useEffect(() => {
    if (opened) {
      setValues(defaultValues(editing));
      setStep(0);
      setStepKey((k) => k + 1);
      setTimeout(() => nameRef.current?.focus(), 0);
    }
  }, [opened]);

  const goStep = (dir: -1 | 1) => {
    setStep((s) => Math.max(0, Math.min(STEP_COUNT - 1, s + dir)));
    setStepKey((k) => k + 1);
  };

  const cycleCurrentStep = () => {
    if (step === 0) {
      setValues((prev) => ({ ...prev, isNext: !prev.isNext }));
    } else if (step === 1) {
      setValues((prev) => ({ ...prev, kind: cycleKind(prev.kind) }));
    } else if (step === 2) {
      setValues((prev) => ({ ...prev, chunkable: !prev.chunkable }));
    }
  };

  const handleSubmit = () => {
    if (!values.name.trim()) return;
    onSubmit({
      name: values.name.trim(),
      description: values.description,
      kind: values.kind,
      isNext: values.isNext,
      chunkable: values.chunkable,
    });
    reset();
    onClose();
  };

  useShortcuts({
    name: "backlogModal",
    enabled: opened,
    keys: (key, event) => {
      if (key === "Enter") {
        event.preventDefault();
        handleSubmit();
        return true;
      }
      if (key === "ctrl+n" || key === "ctrl+p") {
        event.preventDefault();
        nameRef.current?.focus();
        return true;
      }
      const el = document.activeElement as HTMLElement | null;
      const inputFocused =
        el?.tagName === "INPUT" || el?.tagName === "TEXTAREA";
      if (inputFocused) return true;

      if (key === "h") {
        goStep(-1);
        return true;
      }
      if (key === "l") {
        if (step === STEP_COUNT - 1) {
          handleSubmit();
          return true;
        }
        goStep(1);
        return true;
      }
      if (key === "j") {
        cycleCurrentStep();
        return true;
      }
      return true;
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editing ? "Edit task" : "New task"}
      size="sm"
    >
      <Stack gap="sm">
        <Textarea
          label="Name"
          placeholder="Task name"
          ref={nameRef}
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          autosize
          minRows={1}
        />
        <Textarea
          label="Description"
          placeholder="Optional context"
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
          autosize
          minRows={2}
        />

        <Box key={stepKey} className={classes.stepIn}>
          {step === 0 && (
            <IsNextStep
              value={values.isNext}
              onChange={(n) => setValues((v) => ({ ...v, isNext: n }))}
            />
          )}
          {step === 1 && (
            <KindStep
              value={values.kind}
              onChange={(k) => setValues((v) => ({ ...v, kind: k }))}
            />
          )}
          {step === 2 && (
            <ChunkableStep
              value={values.chunkable}
              onChange={(c) => setValues((v) => ({ ...v, chunkable: c }))}
            />
          )}
        </Box>

        <div className={classes.stepNav}>
          <Text size="xs" c="dimmed">
            <Kbd size="xs">h</Kbd>/<Kbd size="xs">l</Kbd> step
          </Text>
          <div className={classes.dots}>
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <div
                key={i}
                className={i === step ? classes.dotActive : classes.dot}
                onClick={() => {
                  setStep(i);
                  setStepKey((k) => k + 1);
                }}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
          <Text size="xs" c="dimmed">
            <Kbd size="xs">j</Kbd> cycle
          </Text>
        </div>

        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{editing ? "Save" : "Add"}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
