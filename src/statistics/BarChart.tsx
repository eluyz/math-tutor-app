import { useId } from "react";
import type { ChartRow } from "./chartTasks";

type ChartLabels = Readonly<{ title: string; description: string; categoryAxis: string; countAxis: string }>;

const plot = { left: 42, right: 308, top: 50, baseline: 155 } as const;
const tickSteps = [1, 2, 5, 10, 20];

export function BarChart({ rows, labels, tableId, questionId }: {
  rows: readonly ChartRow[];
  labels: ChartLabels;
  tableId: string;
  questionId: string;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const highest = Math.max(...rows.map(row => row.value));
  const step = tickSteps.find(candidate => 5 * candidate >= highest) ?? 20;
  // Leave a real scale even if all observed counts are zero.
  const intervals = Math.max(1, Math.ceil(highest / step));
  const maximum = intervals * step;
  const height = (value: number) => value / maximum * (plot.baseline - plot.top);
  const slot = (plot.right - plot.left) / rows.length;
  const barWidth = slot * 0.58;

  return <figure className="statistics-chart-figure" aria-describedby={questionId}>
    <svg className="statistics-bar-chart" width="320" height="211" viewBox="0 0 320 211" role="img"
      aria-labelledby={titleId} aria-describedby={descriptionId} aria-details={tableId} focusable="false">
      <title id={titleId}>{labels.title}</title>
      <desc id={descriptionId}>{labels.description}</desc>
      <text x={plot.left} y={20} className="statistics-chart-axis-label">{labels.countAxis}</text>
      {Array.from({ length: intervals + 1 }, (_, index) => {
        const tick = index * step;
        const y = plot.baseline - height(tick);
        return <g key={tick} data-tick={tick}>
          <line x1={plot.left - 4} x2={plot.right} y1={y} y2={y} className="statistics-chart-grid" />
          <text x={plot.left - 10} y={y} textAnchor="end" dominantBaseline="middle">{tick}</text>
        </g>;
      })}
      {rows.map(({ category, value }, index) => {
        const center = plot.left + (index + 0.5) * slot;
        const barHeight = height(value);
        const barTop = plot.baseline - barHeight;
        return <g key={category} data-category={category}>
          <rect className="statistics-chart-bar" x={center - barWidth / 2} y={barTop} width={barWidth} height={barHeight} />
          <text className="statistics-chart-value" x={center} y={barTop - 8} textAnchor="middle" data-value-label="true">{value}</text>
          <text x={center} y={177} textAnchor="middle" data-category-label="true">{category}</text>
        </g>;
      })}
      <line data-axis="count" className="statistics-chart-axis" x1={plot.left} y1={plot.top} x2={plot.left} y2={plot.baseline} />
      <line data-axis="baseline" className="statistics-chart-axis" x1={plot.left} y1={plot.baseline} x2={plot.right} y2={plot.baseline} />
      <text x={(plot.left + plot.right) / 2} y={200} textAnchor="middle" className="statistics-chart-axis-label">{labels.categoryAxis}</text>
    </svg>
  </figure>;
}
