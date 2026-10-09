const SITES = [
  ["https://swapp1990.org/", "swapp1990.org"],
  ["https://writer.swapp1990.org/", "WriteForYou"],
  ["https://designforyou.swapp1990.org/", "DesignForYou"],
  ["https://vacationphotos.swapp1990.org/", "Vacation Photos"],
  ["https://actforyou.swapp1990.org/", "Let Me Act"],
  ["https://readforyou.swapp1990.org/", "ReadForYou"],
  ["https://molty.swapp1990.org/", "Molty"],
  ["https://snapforyou.swapp1990.org/", "SnapForYou"],
  ["https://jobalerts.swapp1990.org/", "JobsForYou"],
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <aside className="founder" aria-label="About the maker">
        <p>
          <strong>
            Made by <a href="https://swapp1990.org/">Swapnil (swapp1990)</a>
          </strong>
        </p>
        <p>
          Senior Software Engineer @ Phoenix Bioinformatics &middot; SF Bay Area. I keep the world's
          reference plant-biology database running by day &mdash; and ship AI products, games, and
          agent tooling at night.
        </p>
      </aside>
      <nav className="sister-sites" aria-label="More from Swapnil">
        <span className="sister-label">More from Swapnil:</span>
        {SITES.map(([href, label], i) => (
          <span key={href}>
            {i > 0 ? " · " : null}
            <a href={href}>{label}</a>
          </span>
        ))}
      </nav>
    </footer>
  );
}
