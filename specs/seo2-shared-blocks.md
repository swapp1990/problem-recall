# seo2 shared blocks (copy EXACTLY; used by every seo2-<site>-spec.md)

## A. Founder block (visible HTML)
Markup (adapt only the class names / inline styles to the site's CSS; keep the words and the link exactly):
```html
<aside class="founder" aria-label="About the maker">
  <p><strong>Made by <a href="https://swapp1990.org/">Swapnil (swapp1990)</a></strong></p>
  <p>Senior Software Engineer @ Phoenix Bioinformatics &middot; SF Bay Area. I keep the world's reference plant-biology database running by day &mdash; and ship AI products, games, and agent tooling at night.</p>
</aside>
```
(The second paragraph is the bio text from swapp1990.org's home page, verbatim. Do not add any other credential, title or claim.)

## B. Person JSON-LD (one `<script type="application/ld+json">`, valid JSON)
```json
{"@context":"https://schema.org","@type":"Person","name":"Swapnil Sawant","alternateName":"swapp1990","url":"https://swapp1990.org/","jobTitle":"Senior Software Engineer","worksFor":{"@type":"Organization","name":"Phoenix Bioinformatics"},"homeLocation":{"@type":"Place","name":"SF Bay Area"},"sameAs":["https://github.com/swapp1990","https://linkedin.com/in/swapnil-sawant-b038b480","https://x.com/swapp19902"]}
```
(The three sameAs URLs are exactly the GitHub, LinkedIn and X links shown on https://swapp1990.org/. Nothing else.)

## C. Cross-links footer ("More from Swapnil"), omit the link to the site you are on
```html
<nav class="sister-sites" aria-label="More from Swapnil">
  <span>More from Swapnil:</span>
  <a href="https://swapp1990.org/">swapp1990.org</a>
  <a href="https://writer.swapp1990.org/">WriteForYou</a>
  <a href="https://designforyou.swapp1990.org/">DesignForYou</a>
  <a href="https://vacationphotos.swapp1990.org/">Vacation Photos</a>
  <a href="https://actforyou.swapp1990.org/">Let Me Act</a>
  <a href="https://readforyou.swapp1990.org/">ReadForYou</a>
  <a href="https://molty.swapp1990.org/">Molty</a>
  <a href="https://snapforyou.swapp1990.org/">SnapForYou</a>
  <a href="https://jobalerts.swapp1990.org/">JobsForYou</a>
  <a href="https://leetcode.swapp1990.org/">Problem Recall</a>
</nav>
```
Separators (" · ") and wrapping styles are up to the site's CSS. **Never** add links to any other *.swapp1990.org host
(no agency, analytics, taxes, keywords, stockbroker, videogen, moltbot, vncreator, cars, destruction).

## D. FAQ rules
- The visible FAQ (`<section id="faq"><h2>Frequently asked questions</h2>` + one `<h3>` question and `<p>` answer each, or `<details><summary>`)
  and the `FAQPage` JSON-LD must contain **the same questions and answers, word for word** (JSON-LD answer text = plain text of the visible answer).
- Use only the Q&A text given in the site spec. Don't add, embellish or reword facts. Never name or imply AI models/providers.
- Exactly one `<h1>` per page stays true.

## E. JSON-LD hygiene
- Every `application/ld+json` block must `JSON.parse`/`json.loads` cleanly. Escape `</` as `<\/` inside script text when generated.
- Each page has at most one block per @type.
