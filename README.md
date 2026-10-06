# Falling Letters

A typing game. One letter at a time crosses the screen from left to right while the full passage stays in view below, so you always see the words you are typing.

## How to play

- Press **Space** or the start button to begin.
- Type the letter moving along the runway before it reaches the floor.
- A wrong key or a missed letter costs a life. You have three.
- Clear a passage to move on. Each stage adds 50 words and a little more speed.
- Press **Esc** to pause.

Your best score is saved in the browser.

## Run it locally

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

```bash
npm run build      # production build in dist/
npm run preview    # serve the production build
npm run typecheck  # TypeScript check
```

## Project layout

```
src/
  App.tsx                 game screen
  hooks/useTypingGame.ts  game state, passage generation, input handling
  components/             error boundary
  index.css               styles
```

## Built with

React, TypeScript, Vite and Tailwind CSS.

## License

MIT. Built by [Reabot6](https://seofg.xyz).