<div align="center">

# Falling Letters

**A typing game built to make learning the keyboard more fun.**

Type each moving letter before it reaches the floor. Clear passages, survive each stage, and improve your typing skills.

[**Play Falling Letters →**](https://falling-letters-rho.vercel.app/)

<br />

![React](https://img.shields.io/badge/React-2026-61DAFB?logo=react\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Powered-646CFF?logo=vite\&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## Why i built it 

My sister got a keyboard for her tablet and needed a way to learn how to type on it.

So I built her a game.

**Falling Letters** turns typing practice into a simple challenge: watch the letter, find the key, and type it before it reaches the floor.

## How to Play

1. Press **Space** or click the start button to begin.
2. Type the letter moving across the runway before it reaches the floor.
3. Avoid mistakes. Wrong keys and missed letters cost a life.
4. Clear the passage to advance to the next stage.
5. Keep going as passages get longer and letters move faster.

You start with **three lives**. Press **Esc** to pause.

Your best score is saved in your browser.

## Getting Started

### Requirements

* [Node.js](https://nodejs.org/) 20 or newer
* npm

### Installation

```bash
git clone https://github.com/Reabot6/falling-letters
cd falling-letters
npm install
npm run dev
```

Open the local URL printed in your terminal. Vite typically uses `http://localhost:5173`.

### Available Commands

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Build the production version |
| `npm run preview`   | Preview the production build |
| `npm run typecheck` | Check TypeScript types       |

## Project Structure

```text
src/
├── App.tsx
├── hooks/
│   └── useTypingGame.ts
├── components/
├── index.css
└── ...
```

| Path                     | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `App.tsx`                | Main game screen                                   |
| `hooks/useTypingGame.ts` | Game state, passage generation, and keyboard input |
| `components/`            | UI components and error boundary                   |
| `index.css`              | Global styles                                      |

## Built With

* [React](https://react.dev/)
* [TypeScript](https://www.typescriptlang.org/)
* [Vite](https://vite.dev/)
* [Tailwind CSS](https://tailwindcss.com/)

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

**[Play the Game](https://falling-letters-rho.vercel.app/)** · Built by [Reabot6](https://seofg.xyz/)

</div>
