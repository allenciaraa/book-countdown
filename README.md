# sarahjmaths

A countdown calculator for Sarah J. Maas fans. Pick which series you're following and which books you *haven't* read yet, and it works out how many pages or audiobook minutes a day you need to finish before **A Court of Splintered Harmony** releases (Oct 27, 2026).

## Features

- Covers Throne of Glass, A Court of Thorns and Roses, and Crescent City
- Books default to "read" — check off only the ones you haven't finished
- Optional in-progress tracking (by page or by timestamp) for a book you've started
- Live daily pace in both pages/day and minutes/day, based on days remaining
- A "road ahead" chart of every unread book, in reading order

All book data (page counts, audiobook runtimes) lives in `src/data/books.json` and is bundled at build time — nothing is fetched at runtime.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest suite |
| `npm run lint` | Run Oxlint |

## Tech stack

React 19 + TypeScript + Vite, plain CSS, no router or state library.
