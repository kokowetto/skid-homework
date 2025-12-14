import functionPlot from "function-plot";
import { useEffect, useRef } from "react";

type MathPlotData = {
  fn: string; // e.g., "x^2"
  domain?: [number, number];
};

export default function MathGraph({ code }: { code: string }) {
  const rootEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const data: MathPlotData = JSON.parse(code);

      if (rootEl.current) {
        functionPlot({
          target: rootEl.current,
          width: 500,
          height: 300,
          grid: true,
          data: [
            {
              fn: data.fn,
              color: "#2563eb", // blue-600
              graphType: "polyline",
            },
          ],
          xAxis: { domain: data.domain || [-10, 10] },
          yAxis: { domain: [-10, 10] },
        });
      }
    } catch (e) {
      console.error("Failed to render math graph", e);
    }
  }, [code]);

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
      <div ref={rootEl} />
    </div>
  );
}
