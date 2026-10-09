import { faqItems } from "../data/faq.js";

export default function Faq() {
  return (
    <section id="faq">
      <h2>Frequently asked questions</h2>
      {faqItems.map((item) => (
        <div key={item.q} className="faq-item">
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </div>
      ))}
    </section>
  );
}
