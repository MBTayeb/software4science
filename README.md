# Software for Science

A self-study course that guides learners through structured pathways of external video, audio, text, and software resources to build practical software engineering skills for research.

To visit the website, open [https://mbtayeb.github.io/software4science/](https://mbtayeb.github.io/software4science/)

## Examples of topics covered:

- Introduction to Linux and the command line
- Editors and IDEs
- Compilers, build systems, and software libraries
- Version control and source code repositories
- Debugging, testing, and optimizing scientific software

## What this repository contains

This repository holds the full source of the "Software for Science" site — both the static course content (chapters, subchapters) and the code that renders it (HTML, JS, and CSS in).

## Reusing this template

This repo's structure (static content + HTML/JS/CSS renderer) could be reused as a starting point for other simple static book/course-style sites.

## Site structure

The site is static content rendered with a small JS layer:

```raw
/<chapter>/             # one folder per chapter
    page.html           # static chapter content
    index.html          # entry point; JS imports page.html
                        # and applies modifications
    title.txt           # raw title of the chapter
    /Sub-<subchapter>/  # one folder per subchapter
                        # must start with "Sub-"
        page.html       # static subchapter content
        index.html      # subchapter entry point
        title.txt       # raw title of the subchapter
/assets/                # stylesheets and scripts
    /downloads/         # downloadable files referenced by chapters
```

Each `page.html` holds only the static content for that chapter/subchapter.\
`index.html` uses JavaScript (from `/assets/`) to import the local `page.html` at runtime and apply layout/formatting changes (e.g. injecting navigation links, setting the page title) before displaying it.

## Making a chapter/subchapter

1. Create a new folder under the appropriate parent. For a subchapter, the folder name must start with `Sub-`.
1. Add a `page.html` with the chapter's static content.
1. Add an `index.html` entry point (copy the pattern from a sibling folder).
1. Add a `title.txt` with the chapter's title.
1. If it's a chapter (not a subchapter), add a reference to it in `topics/page.html`.
1. To insert a new chapter between chapter X and chapter Y, you'll need to edit **three** `index.html` files:
   - **The new chapter's `index.html`** — set `previous` to X and `next` to Y
   - **Chapter X's `index.html`** — update `next` to point to the new chapter
   - **Chapter Y's `index.html`** — update `previous` to point to the new chapter

## Contributing

Corrections, dead-link fixes, and better resource suggestions are welcome. Please open an issue or pull request.

## Credits

- Course prepared by **Tayb Marrakchi-Benjaafar**, under the supervision of **Martin Korth**.
- Funded by the **IVV NWZ** (Information Processing and Supply Unit) for the Faculties of Biology, Chemistry and Pharmacy, and Physics at the University of Münster.
- Corrections and contributions from **Carsten Kemena** and **Daniel Nüst**.

## Third-Party Code

- `assets/highlight.js` — [highlight.js](https://github.com/highlightjs/highlight.js) v11.11.1, by Josh Goebel and contributors, licensed under [BSD-3-Clause](https://github.com/highlightjs/highlight.js/blob/main/LICENSE)
- `assets/monokai.css` — Monokai style, ported by Luigi Maselli ([grigio.org](http://grigio.org))
- `assets/downloads/vimrc` — from [The Missing Semester](https://missing.csail.mit.edu/), licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Development Notes

The remaining JavaScript was written with the help of LLMs.

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You are free to share and adapt this material for non-commercial purposes, as long as you give appropriate credit and distribute any derivative works under the same license.
