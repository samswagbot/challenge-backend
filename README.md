# Challenge Backend — Project Configuration & Documentation

This repository contains my implementation, which focuses on configuring the project to be closer to a real, production-ready backend service. The goal is to demonstrate practical engineering decisions, explain why each choice was made, and provide clear documentation for anyone running or extending the project.

---

## ## Overview of Improvements (Production-Ready Additions)

I updated the repository to include several foundational elements expected in real-world backend systems:

1. **Pinned Node.js version (`.nvmrc` + engines field)**  
2. **Environment variable management (`.env.local`)**  
3. **Project-wide linting & formatting (ESLint 9 flat config + Prettier)**  
4. **Basic automated testing setup with Jest**  
5. **GitHub Actions CI pipeline (lint + test on push/PR)**  
6. **Documentation explaining all decisions (this README)**  

---

# 🚀 Getting Started

## **Prerequisites**

- **Node.js ≥ 20.x**  
  (A `.nvmrc` file is included, so if you use `nvm`, run: `nvm use`)

- **npm** (ships with Node)

## **Installation**

```bash
npm install
