"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "pending" | "updating" | "complete";

const policies = ["AML Policy", "KYC Procedures", "Risk Framework", "Compliance Manual"];
const LOOP_INTERVAL = 5000;

function ZapIcon({ animated }: { animated: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: animated ? "revelio-pulse 0.5s ease-in-out infinite" : "none" }}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function FileCheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "#22c55e" }}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

/** "One-Click Policy Updates" demo: each policy updates in turn, then the cycle repeats. */
export default function PolicyUpdates() {
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>(() => policies.map(() => "pending"));
  const timers = useRef<number[]>([]);

  const run = useCallback(() => {
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    setRunning(true);
    setDone(false);
    setStatuses(policies.map(() => "pending"));
    setActive(-1);
    policies.forEach((_, index) => {
      later(() => {
        setActive(index);
        setStatuses((prev) => prev.map((s, i) => (i === index ? "updating" : s)));
        later(() => {
          setStatuses((prev) => prev.map((s, i) => (i === index ? "complete" : s)));
          if (index === policies.length - 1) {
            later(() => {
              setDone(true);
              setRunning(false);
              setActive(-1);
            }, 500);
          }
        }, 600);
      }, index * 800);
    });
  }, []);

  useEffect(() => {
    const pending = timers.current;
    const first = window.setTimeout(run, 0);
    const interval = window.setInterval(run, LOOP_INTERVAL);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
      pending.forEach(clearTimeout);
    };
  }, [run]);

  return (
    <div style={{ maxWidth: 800, width: "100%", margin: "0 auto", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>One-Click Policy Updates</h3>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Update all documentation instantly with complete audit trails</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, width: "100%", maxWidth: 600 }}>
          {policies.map((name, index) => {
            const status = statuses[index];
            const isActive = active === index;
            return (
              <div
                key={name}
                style={{
                  background: status === "complete" ? "#dcfce7" : "white",
                  padding: 24,
                  borderRadius: 12,
                  boxShadow: isActive ? "0 0 0 3px #3b82f6, 0 8px 16px rgba(59, 130, 246, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  border: `2px solid ${status === "complete" ? "#22c55e" : status === "updating" ? "#3b82f6" : "#e2e8f0"}`,
                  transition: "all 0.3s ease",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)",
                      animation: "revelio-shimmer 0.6s ease-in-out"
                    }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {status === "complete" ? (
                      <FileCheckIcon />
                    ) : (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          borderWidth: 3,
                          borderStyle: "solid",
                          borderTopColor: "transparent",
                          borderRightColor: status === "updating" ? "#3b82f6" : "#cbd5e1",
                          borderBottomColor: status === "updating" ? "#3b82f6" : "#cbd5e1",
                          borderLeftColor: status === "updating" ? "#3b82f6" : "#cbd5e1",
                          animation: status === "updating" ? "revelio-spin 0.6s linear infinite" : "none"
                        }}
                      />
                    )}
                    <span style={{ fontSize: 16, fontWeight: 600, color: status === "complete" ? "#166534" : "#1e293b" }}>{name}</span>
                  </div>
                  <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        background: status === "complete" ? "#22c55e" : "#3b82f6",
                        width: status === "complete" ? "100%" : status === "updating" ? "70%" : "0%",
                        transition: "width 0.6s ease",
                        borderRadius: 2
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                    {status === "complete" ? "✓ Updated" : status === "updating" ? "Updating..." : "Ready"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={run}
          disabled={running}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: done
              ? "linear-gradient(to right, #22c55e, #16a34a)"
              : running
                ? "linear-gradient(to right, #64748b, #475569)"
                : "linear-gradient(to right, #3b82f6, #2563eb)",
            color: "white",
            padding: "16px 40px",
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 700,
            border: "none",
            cursor: running ? "not-allowed" : "pointer",
            boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s",
            opacity: running ? 0.7 : 1
          }}
        >
          <ZapIcon animated={running} />
          {done ? "All Policies Updated!" : running ? "Applying Updates..." : "Apply All Updates"}
        </button>
        {done && (
          <div
            style={{
              background: "#dcfce7",
              padding: "12px 20px",
              borderRadius: 8,
              border: "2px solid #22c55e",
              animation: "revelio-slide-up 0.3s ease-out",
              textAlign: "center"
            }}
          >
            <span style={{ fontSize: 14, color: "#166534", fontWeight: 600 }}>
              ✓ 4 policies updated • Audit trail saved • All teams notified
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
