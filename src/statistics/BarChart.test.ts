import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { BarChart } from "./BarChart";
import { chartCopy } from "./st107Copy";
import { generateChartTask } from "./chartTasks";

it("provides a named graphic and marks the visible axis, exact categories and values", () => {
  const task = generateChartTask("easy", 1);
  const copy = chartCopy(task, "pl");
  const markup = renderToStaticMarkup(
    createElement(BarChart, { rows: task.rows, labels: copy.chart, tableId: "chart-table", questionId: "chart-question" }),
  );
  expect(markup).toContain('aria-describedby="chart-question"');
  expect(markup).toMatch(/role="img"[^>]+aria-labelledby="[^"]+"[^>]+aria-describedby="[^"]+"[^>]+aria-details="chart-table"/);
  expect(markup).toContain("Wykres słupkowy wizyt według sali");
  expect(markup).toContain("Dokładne liczby wizyt");
  expect(markup).toContain(">Liczba wizyt</text>");
  expect(markup).toContain(">Sala</text>");
  expect(markup).toMatch(/data-tick="0".*?>0<\/text>/);
  for (const { category, value } of task.rows) {
    expect(markup).toMatch(new RegExp(`data-category="${category}".*?data-value-label="true"[^>]*>${value}<.*?data-category-label="true"[^>]*>${category}<`));
  }
});

it("prints zero for every room and gives all-zero bars no positive height", () => {
  const task = generateChartTask("easy", 0);
  const copy = chartCopy(task, "en");
  const markup = renderToStaticMarkup(
    createElement(BarChart, { rows: task.rows, labels: copy.chart, tableId: "chart-table", questionId: "chart-question" }),
  );
  expect([...markup.matchAll(/<rect[^>]*height="([^"]+)"/g)].map(match => match[1])).toEqual(["0", "0", "0"]);
  expect(markup.match(/data-value-label="true"[^>]*>0<\/text>/g)).toHaveLength(3);
  expect(markup).toMatch(/data-tick="0".*?>0<\/text>/);
  expect(markup).toMatch(/data-tick="[1-9]\d*"/);
  expect(markup).not.toMatch(/NaN|Infinity/);
});
