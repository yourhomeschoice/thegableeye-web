import type { ComparedOption } from "@/lib/publication/types";

type ComparedOptionsProps = {
  eyebrow: string;
  heading: string;
  introduction: string;
  options: readonly ComparedOption[];
};

export function ComparedOptions({ eyebrow, heading, introduction, options }: ComparedOptionsProps) {
  return (
    <section className="article-comparison" aria-labelledby="comparison-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id="comparison-heading" className="editorial">{heading}</h2>
      <p>{introduction}</p>
      <table>
        <thead><tr><th scope="col">Provider</th><th scope="col">Option</th><th scope="col">Displayed price</th><th scope="col">Factual attributes</th><th scope="col">Supplied details</th></tr></thead>
        <tbody>{options.map((option) => <tr key={option.provider}>
          <th scope="row" data-label="Provider">{option.provider}</th>
          <td data-label="Option">{option.optionLabel}</td>
          <td data-label="Displayed price">{option.displayedPrice}</td>
          <td data-label="Factual attributes"><ul>{option.attributes.map((attribute) => <li key={attribute.label}>{attribute.label}: {attribute.value}</li>)}</ul></td>
          <td data-label="Supplied details">{option.details.length > 0 ? <ul>{option.details.map((detail) => <li key={detail}>{detail}</li>)}</ul> : <span aria-hidden="true">—</span>}</td>
        </tr>)}</tbody>
      </table>
    </section>
  );
}
