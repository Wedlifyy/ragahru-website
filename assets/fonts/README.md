# Fonts

Served from this site rather than from Google Fonts, so the first paint
never waits on another company's servers. Declared at the top of
`css/site.css` (section 0).

| File                              | Family             | Covers                       |
| --------------------------------- | ------------------ | ---------------------------- |
| `anek-latin.woff2`                | Anek Latin         | Latin text, every weight     |
| `anek-latin-ext.woff2`            | Anek Latin         | Extended Latin, and the ₹ sign |
| `cormorant-garamond.woff2`        | Cormorant Garamond | Headings, every weight       |
| `cormorant-garamond-italic.woff2` | Cormorant Garamond | The italic tagline           |

Each is a variable font: one file holds every weight from light to bold.
The browser only downloads a file when the page uses a character in its
range, so the extended file is fetched for the rupee sign and little else.

## Licence

Both families are published under the **SIL Open Font License 1.1**, which
allows them to be bundled and served with a website:

- Anek Latin — Ek Type — https://github.com/EkType/Anek
- Cormorant Garamond — Christian Thalmann — https://github.com/CatharsisFonts/Cormorant

Full licence text: https://openfontlicense.org
