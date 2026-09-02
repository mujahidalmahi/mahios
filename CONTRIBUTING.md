# Contributing to MahiOS

First off, thank you for considering contributing to **MahiOS**! Projects like this thrive because of people like you.

Whether you're fixing a bug, adding a new retro application, enhancing CRT shaders, or proposing new features, all contributions are warmly welcomed.

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🚀 How to Contribute

### 1. Fork & Clone the Repository
```bash
git clone https://github.com/mujahidalmahi/mahios.git
cd mahios
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Note: MahiOS comes with full offline demo fallback data out-of-the-box. You don't need Supabase or Cloudinary credentials to run and develop locally!)*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the retro desktop and [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin CMS.

---

## 🌿 Git Branch & Commit Conventions

1. Create a descriptive feature branch from `main`:
   ```bash
   git checkout -b feat/my-awesome-feature
   # or
   git checkout -b fix/window-drag-glitch
   ```

2. Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` A new feature or desktop application
   - `fix:` A bug fix
   - `docs:` Documentation changes
   - `style:` Formatting, UI tweaks
   - `refactor:` Code refactoring without functionality changes
   - `perf:` Performance improvements
   - `test:` Adding or updating tests

3. Test your build before submitting:
   ```bash
   npm run build
   npm run lint
   ```

---

## 🛠️ Architecture & Code Standards

- **Next.js 16 App Router**: Strict adherence to App Router conventions (`proxy.ts`, server components, dynamic routes).
- **TypeScript**: Strict types across all components and database models in `src/types/database.ts`.
- **Styling**: Tailwind CSS v4 alongside modular retro stylesheets (`src/styles/retro.css`, `src/styles/crt.css`, `src/styles/matrix.css`).
- **State Management**: Zustand for window state and system sound synthesizer (`src/stores/`).

---

## 📬 Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feat/my-awesome-feature
   ```
2. Open a Pull Request on the main repository (`https://github.com/mujahidalmahi/mahios`).
3. Fill out the PR template, include screenshots/recordings for UI changes, and describe your modifications.

Thank you for helping make MahiOS the most expressive retro web OS portfolio! 🌟
