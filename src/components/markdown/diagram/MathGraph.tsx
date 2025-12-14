"use client";

import { useEffect, useRef, useState } from "react";
import functionPlot, { Chart } from "function-plot";

// ----------------------------------------------------------------------
// Constants & Types
// ----------------------------------------------------------------------

// Standard colors used by function-plot or fallback
const LEGEND_COLORS = [
  "#2563eb", // Blue
  "#dc2626", // Red
  "#16a34a", // Green
  "#9333ea", // Purple
  "#ea580c", // Orange
  "#0891b2", // Cyan
  "#db2777", // Pink
];

type FunctionItem = {
  fn?: string;
  fnType?: "linear" | "implicit" | "parametric" | "points" | "vector";
  color?: string;
  graphType?: "polyline" | "scatter" | "interval";
  points?: number[][];
  vector?: [number, number];
  range?: [number, number];
  closed?: boolean;
  nSamples?: number;
  label?: string; // Label for the legend
};

type AdvancedPlotConfig = {
  data: FunctionItem[];
  title?: string;
  xAxis?: {
    domain?: [number, number];
    label?: string;
  };
  yAxis?: {
    domain?: [number, number];
    label?: string;
  };
  grid?: boolean;
  disableZoom?: boolean;
};

export default function MathGraph({ code }: { code: string }) {
  const rootEl = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Chart>(null);

  const [dimensions, setDimensions] = useState({ width: 500, height: 350 });
  const [error, setError] = useState<string | null>(null);

  // Store processed items to render the custom legend
  const [legendItems, setLegendItems] = useState<FunctionItem[]>([]);

  // 1. Responsive Resizing
  useEffect(() => {
    if (!rootEl.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Ensure a minimum width to prevent collapse
        setDimensions({
          width: Math.max(width, 300),
          height: height || 350,
        });
      }
    });

    observer.observe(rootEl.current);
    return () => observer.disconnect();
  }, []);

  // 2. Plotting Logic
  useEffect(() => {
    const drawGraph = async () => {
      if (!rootEl.current) return;
      setError(null);

      try {
        const parsed = JSON.parse(code);
        let config: AdvancedPlotConfig;

        // Normalization
        if (Array.isArray(parsed.data)) {
          config = parsed as AdvancedPlotConfig;
        } else {
          // Handle shorthand or legacy format
          config = {
            data: [
              {
                fn: parsed.fn || "x",
                color: LEGEND_COLORS[0],
                graphType: "polyline",
                label: parsed.fn,
              },
            ],
            xAxis: { domain: parsed.domain || [-10, 10] },
            yAxis: { domain: [-10, 10] },
            grid: true,
          };
        }

        rootEl.current.innerHTML = "";

        // Pre-process data to ensure colors are assigned for the legend
        const processedData: FunctionItem[] = config.data.map(
          (item, index) => ({
            ...item,
            fnType: item.fnType || "linear",
            graphType: item.graphType || "polyline",
            // Assign color from config, or cycle through palette
            color: item.color || LEGEND_COLORS[index % LEGEND_COLORS.length],
            // Ensure label exists (fallback to fn string)
            label: item.label || item.fn || `Function ${index + 1}`,
            // Map vector tuple if present
            vector: item.vector ? [item.vector[0], item.vector[1]] : undefined,
          }),
        );

        setLegendItems(processedData);

        const instance = functionPlot({
          target: rootEl.current,
          width: dimensions.width,
          height: dimensions.height,
          title: config.title,
          grid: config.grid !== false,
          disableZoom: config.disableZoom,

          tip: {
            xLine: true,
            yLine: true,
            renderer: (x, y) => {
              return `x: ${x.toFixed(2)}, y: ${y.toFixed(2)}`;
            },
          },
          xAxis: {
            domain: config.xAxis?.domain || [-10, 10],
            label: config.xAxis?.label || "x",
          },
          yAxis: {
            domain: config.yAxis?.domain || [-10, 10],
            label: config.yAxis?.label || "y",
          },
          // Use the processed data with explicit colors
          data: processedData as never,
        });

        chartInstance.current = instance;
      } catch (e) {
        console.error("MathGraph Render Error:", e);
        setError("Invalid graph data received.");
      }
    };

    const timer = setTimeout(drawGraph, 0);
    return () => clearTimeout(timer);
  }, [code, dimensions.height, dimensions.width]);

  return (
    <div className="group relative w-full my-6 rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden">
      <style jsx global>{`
        .function-plot text {
          fill: #374151 !important; /* gray-700 */
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          font-size: 12px !important;
        }
        .function-plot .domain {
          stroke: #9ca3af !important; /* gray-400 */
        }
        .function-plot .tick line {
          stroke: #e5e7eb !important; /* gray-200 */
        }
        .function-plot .origin {
          stroke: #d1d5db !important; /* gray-300 */
          opacity: 1 !important;
        }
        /* We hide the internal SVG legend to use our custom React legend */
        .function-plot .top-right-legend {
          display: none;
        }
      `}</style>

      {/* Graph Container */}
      <div
        ref={rootEl}
        className="w-full bg-white text-gray-900"
        style={{ minHeight: "350px" }}
      />

      {/* Custom Legend Section */}
      {legendItems.length > 0 && !error && (
        <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 bg-gray-50/50 px-4 py-3">
          {legendItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs font-medium text-gray-900"
            >
              <span
                className="block h-3 w-3 rounded-full shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 border border-red-100 shadow-sm">
            ⚠️ {error}
          </div>
        </div>
      )}
    </div>
  );
}
