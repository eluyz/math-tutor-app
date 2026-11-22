type FrequencyTableContent = Readonly<{
  caption: string;
  valueHeader: string;
  frequencyHeader: string;
  rows: readonly Readonly<{ value: number | string; frequency: number }>[];
}>;

export function FrequencyTable({ table, id, describedBy }: {
  table: FrequencyTableContent;
  id?: string;
  describedBy?: string;
}) {
  return <table className="statistics-frequency-table" id={id} aria-describedby={describedBy}>
    <caption>{table.caption}</caption>
    <thead><tr><th scope="col">{table.valueHeader}</th><th scope="col">{table.frequencyHeader}</th></tr></thead>
    <tbody>{table.rows.map(row => <tr key={row.value}>
      <th scope="row">{row.value}</th><td>{row.frequency}</td>
    </tr>)}</tbody>
  </table>;
}
