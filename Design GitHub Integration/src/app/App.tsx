import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

type Unit = "ml" | "L" | "oz" | "gal";

const UNIT_FACTORS: Record<Unit, number> = {
  ml: 1,
  L: 1000,
  oz: 29.5735,
  gal: 3785.41,
};

function toMl(value: number, unit: Unit) {
  return value * UNIT_FACTORS[unit];
}

function fromMl(value: number, unit: Unit) {
  return value / UNIT_FACTORS[unit];
}

function formatNum(n: number, unit: Unit) {
  const converted = fromMl(n, unit);
  if (converted >= 1000) return converted.toFixed(1);
  if (converted >= 10) return converted.toFixed(2);
  return converted.toFixed(3);
}

export default function App() {
  const [currentAbv, setCurrentAbv] = useState("");
  const [currentVolume, setCurrentVolume] = useState("");
  const [desiredAbv, setDesiredAbv] = useState("");
  const [unit, setUnit] = useState<Unit>("ml");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function calculate() {
    setError("");
    const c = parseFloat(currentAbv);
    const v = parseFloat(currentVolume);
    const d = parseFloat(desiredAbv);

    if (isNaN(c) || isNaN(v) || isNaN(d)) {
      setError("All fields are required.");
      return;
    }
    if (c <= 0 || c > 100 || d <= 0 || d > 100) {
      setError("ABV must be between 0 and 100%.");
      return;
    }
    if (d >= c) {
      setError("Desired ABV must be lower than current ABV.");
      return;
    }
    if (v <= 0) {
      setError("Volume must be greater than zero.");
      return;
    }

    const volumeMl = toMl(v, unit);
    const waterMl = (c * volumeMl) / d - volumeMl;
    setResult(waterMl);
    setHasCalculated(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  function reset() {
    setCurrentAbv("");
    setCurrentVolume("");
    setDesiredAbv("");
    setResult(null);
    setError("");
    setHasCalculated(false);
  }

  const totalVolume = result !== null && currentVolume
    ? parseFloat(currentVolume) + fromMl(result, unit)
    : null;

  const finalAbvCheck = result !== null && currentVolume && currentAbv
    ? (parseFloat(currentAbv) * parseFloat(currentVolume)) /
      (parseFloat(currentVolume) + fromMl(result, unit))
    : null;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Karla', sans-serif" }}
    >
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(ellipse, #C8921A 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 md:py-24">

        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-primary opacity-60" />
            <span
              className="text-xs tracking-[0.2em] text-muted-foreground uppercase"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Dilution Calculator
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl font-normal leading-[1.05] mb-5 text-foreground"
            style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}
          >
            Cut to{" "}
            <span className="italic" style={{ color: "#C8921A" }}>
              Proof
            </span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-md" style={{ fontWeight: 300 }}>
            Calculate exactly how much water to add to bring your spirit to the desired strength.
          </p>
        </header>

        {/* Calculator card */}
        <div
          className="rounded-sm border border-border bg-card p-8 md:p-10 mb-4"
          style={{ borderRadius: "2px" }}
        >
          <div className="grid gap-8">

            {/* Unit selector */}
            <div>
              <label
                className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Volume Unit
              </label>
              <div className="flex gap-2">
                {(["ml", "L", "oz", "gal"] as Unit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className="px-4 py-2 text-sm transition-all duration-150"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      borderRadius: "1px",
                      border: unit === u ? "1px solid #C8921A" : "1px solid rgba(200,146,26,0.15)",
                      background: unit === u ? "rgba(200,146,26,0.1)" : "transparent",
                      color: unit === u ? "#C8921A" : "#8A7F72",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Field
                label="Current ABV"
                unit="%"
                value={currentAbv}
                onChange={setCurrentAbv}
                placeholder="40.0"
                hint="e.g. cask strength"
              />
              <Field
                label={`Current Volume`}
                unit={unit}
                value={currentVolume}
                onChange={setCurrentVolume}
                placeholder="1000"
                hint={`amount you have`}
              />
            </div>

            <Field
              label="Desired ABV"
              unit="%"
              value={desiredAbv}
              onChange={setDesiredAbv}
              placeholder="40.0"
              hint="target strength — must be lower"
            />

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "#C0392B" }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{ border: "1px solid #C0392B" }}
                  >
                    !
                  </span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <div className="flex gap-3">
              <button
                onClick={calculate}
                className="flex-1 py-4 font-medium tracking-wide transition-all duration-150 hover:opacity-90 active:scale-[0.99]"
                style={{
                  background: "#C8921A",
                  color: "#0C0B09",
                  borderRadius: "1px",
                  fontFamily: "'Karla', sans-serif",
                  letterSpacing: "0.06em",
                  fontSize: "0.875rem",
                }}
              >
                CALCULATE
              </button>
              {hasCalculated && (
                <button
                  onClick={reset}
                  className="px-5 py-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  style={{
                    border: "1px solid rgba(200,146,26,0.15)",
                    borderRadius: "1px",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result !== null && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2"
            >
              <div
                className="border border-border p-8 md:p-10"
                style={{
                  borderRadius: "2px",
                  background: "linear-gradient(135deg, rgba(200,146,26,0.06) 0%, rgba(160,92,44,0.04) 100%)",
                  borderColor: "rgba(200,146,26,0.3)",
                }}
              >
                {/* Main result */}
                <div className="mb-8">
                  <p
                    className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    Water to Add
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-6xl md:text-7xl"
                      style={{
                        fontFamily: "'Libre Baskerville', Georgia, serif",
                        color: "#C8921A",
                        fontWeight: 400,
                        lineHeight: 1,
                      }}
                    >
                      {formatNum(result, unit)}
                    </span>
                    <span
                      className="text-2xl text-muted-foreground"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {unit}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3" style={{ fontWeight: 300 }}>
                    Also equivalent to{" "}
                    <span className="text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {result < 1000
                        ? `${result.toFixed(1)} ml`
                        : `${(result / 1000).toFixed(3)} L`}
                    </span>
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-border mb-8" />

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-6">
                  <Stat
                    label="Final Volume"
                    value={totalVolume !== null ? formatNum(toMl(totalVolume, unit), unit) : "—"}
                    unit={unit}
                  />
                  <Stat
                    label="Verified ABV"
                    value={finalAbvCheck !== null ? finalAbvCheck.toFixed(1) : "—"}
                    unit="%"
                  />
                  <Stat
                    label="Dilution Ratio"
                    value={
                      result !== null && currentVolume
                        ? `1 : ${(result / toMl(parseFloat(currentVolume), unit)).toFixed(2)}`
                        : "—"
                    }
                    unit=""
                  />
                </div>

                {/* Formula note */}
                <div
                  className="mt-8 pt-6 border-t border-border"
                  style={{ borderColor: "rgba(200,146,26,0.1)" }}
                >
                  <p
                    className="text-xs text-muted-foreground leading-relaxed"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    V<sub>water</sub> = (C<sub>1</sub> × V<sub>1</sub> / C<sub>2</sub>) − V<sub>1</sub>
                    {"  "}·{"  "}Pearson square method
                  </p>
                </div>
              </div>

              {/* Practical note */}
              <div className="mt-3 px-1">
                <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontWeight: 300 }}>
                  Add water gradually and allow the spirit to rest before measuring. Temperature affects
                  volume — for precision work, calibrate at 20°C / 68°F.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <span
              className="text-xs text-muted-foreground tracking-widest uppercase"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              cyz · cut to proof
            </span>
            <span className="text-xs text-muted-foreground" style={{ fontWeight: 300 }}>
              Drink responsibly.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  unit,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hint?: string;
}) {
  return (
    <div>
      <label
        className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-muted text-foreground placeholder:text-muted-foreground pr-16 py-3.5 pl-4 outline-none focus:ring-1 transition-all"
          style={{
            borderRadius: "1px",
            border: "1px solid rgba(200,146,26,0.12)",
            fontFamily: "'DM Mono', monospace",
            fontSize: "1.125rem",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ["--tw-ring-color" as any]: "#C8921A",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(200,146,26,0.5)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(200,146,26,0.12)";
          }}
        />
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {unit}
        </span>
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground mt-2" style={{ fontWeight: 300 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p
        className="text-xs tracking-[0.12em] uppercase text-muted-foreground mb-2"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </p>
      <p className="text-foreground" style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.05rem" }}>
        {value}
        {unit && (
          <span className="text-muted-foreground text-sm ml-1">{unit}</span>
        )}
      </p>
    </div>
  );
}
