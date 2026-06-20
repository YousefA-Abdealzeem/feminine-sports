<div align="center">

# ✦ feminine-sports

### Arabic Women's Sports Platform with AI-Based Hate Speech Detection

[![Live Demo](https://img.shields.io/badge/Live%20Demo-feminine--sports.vercel.app-a855f7?style=for-the-badge&logo=vercel)](https://feminine-sports.vercel.app/)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.io/)
[![License](https://img.shields.io/badge/License-Academic-f59e0b?style=for-the-badge)](.)

**Egyptian E-Learning University (EELU) · Faculty of Computer Science & IT**
**Graduation Project · Academic Year 2025–2026**

---

🎬 **[User Demo Video](https://drive.google.com/file/d/1liHzrBtftdsLXD_AHg2KCg7rpv9FTaRY/view?usp=sharing)** &nbsp;|&nbsp; 🔐 **[Admin Demo Video](https://drive.google.com/file/d/1knD1xLpSfMh7gJnFh2Mqzedg0I5w4NfP/view?usp=sharing)**

</div>

---

## 📌 Project Overview

**feminine-sports** is the first Arabic-language platform dedicated exclusively to women's sports, integrated with an AI-powered hate speech detection system built to protect female athletes in digital spaces.

The platform provides sports news, athlete profiles, community discussion, and an admin moderation panel — all backed by a fine-tuned **MARBERT** AI model trained on 7,487 real-world Arabic tweets.

### Key Results

| Metric | Result |
|--------|--------|
| 🎯 AI Accuracy | 92% |
| 📊 F1-Score | 0.895 |
| 🐦 Training Dataset | 7,487 Arabic tweets |
| ⏱ Project Duration | 9 Months (Oct 2025 – Jun 2026) |

---

## 👩‍💻 Team

| Name | Student ID |
|------|------------|
| Yousef Alian Abdelzeem | 2202823 |
| Makarious Samwuel | 2100953 |
| Amira Khaled Ibrahim | 2202717 |
| Mai Mohamed Maher | 2202704 |
| Eman Mahmoud Bahlol | 2202713 |
| Abdelrazek Abdelmenem | 2202715 |
| Rahma Mohamed | 2202680 |
| Abanoub Atef Fawzy | 2202763 |

**Supervisors:** Dr. Yasmine &nbsp;·&nbsp; Eng. Maryam

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21, Bootstrap, FontAwesome, Animate.css |
| Backend | ASP.NET Core |
| AI Service | Python · Fine-tuned MARBERT |
| Deployment | Vercel (Frontend) · Monster (Backend & AI) |

---

## 📂 Repository Structure

```
feminine-sports/
├── frontend/                  ← Angular 21 app
│   └── src/
│       ├── app/
│       │    ├── feature/
│       │    │     └── womens-sports/
│       │    │           ├── pages/
│       │    │           ├── shared/
│       │    │           └── dashboard/
│       │    ├── app.routes.ts
│       │    └── app.config.ts
│       ├── assets/
│       └── styles.css
├── backend/                   ← ASP.NET Core API
├── ai-service/                ← Python MARBERT microservice
└── docs/                      ← Presentation & documentation
    ├── feminine-sports.pptx
    └── feminine-sports-document.pdf
```

---

## 🚀 Getting Started (Frontend)

### Prerequisites
- Node.js 18+
- Angular CLI: `npm install -g @angular/cli`

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/YousefA-Abdealzeem/feminine-sports.git
cd feminine-sports/frontend

# 2. Install dependencies
npm install

# 3. Run the development server
ng serve
```

Then open: **http://localhost:4200/**

> **If you run into errors:**
> ```bash
> rm -rf node_modules package-lock.json
> npm install
> ```

---

## ⚙️ Getting Started (Backend)

> Backend source will be added to `/backend`. Setup instructions coming soon.

### Environment Variables

Copy the example config and fill in your values — **never commit real credentials**:

```bash
cp backend/appsettings.Example.json backend/appsettings.Development.json
```

---

## 🤖 AI Service

The hate speech detection microservice runs as a standalone Python REST API.

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

- Model: Fine-tuned **MARBERT** on Arabic X-sphere dataset
- Endpoint: `POST /predict` — accepts Arabic text, returns classification + confidence score

---

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| Frontend | [feminine-sports.vercel.app](https://feminine-sports.vercel.app/) |
| Backend API | Monster Server |
| AI Microservice | Monster Server |

---

## 📋 Features

| Feature | Status |
|---------|--------|
| 🏠 Home / Hero Page | ✅ Live |
| 📄 About Page | ✅ Live |
| 📞 Contact Page | ✅ Live |
| 👤 Profile Page | ✅ Live |
| 🔐 Login & Register | ✅ Live |
| 📚 Posts & Post Details | ✅ Live |
| ⚙️ Admin Dashboard | ✅ Live |
| 🤖 AI Hate Speech Detection | ✅ Live |
| 🛡️ Real-time Comment Moderation | ✅ Live |

---

## 👥 Team Workflow (For Contributors)

### Rules
- ❌ Do **not** work directly on `main`
- ❌ Do **not** push broken code
- ❌ Do **not** upload `node_modules`
- ✅ Always work on a branch
- ✅ Pull latest changes before starting

### Branch Workflow

```bash
# Step 1: Switch to dev and pull latest
git checkout dev
git pull

# Step 2: Create your feature branch
git checkout -b feature/your-feature-name

# Branch naming convention:
# feature/login  |  feature/profile  |  feature/dashboard  |  feature/posts

# Step 3: Work on your feature

# Step 4: Commit and push
git add .
git commit -m "feat: add login page"
git push origin feature/your-feature-name
```

**Team Leader — merge to dev:**

```bash
git checkout dev
git pull
git merge feature/your-feature-name
git push origin dev
```

### Commit Message Format

```
feat: add new feature
fix: resolve bug in component
docs: update README
style: fix formatting
refactor: restructure dashboard module
```

---

## 🎨 Styling Guide

- Global styles → `src/styles.css`
- Component styles → inside each component's `.css` file
- Use Bootstrap utility classes when possible
- Follow the project color palette: Deep Purple `#0d0118` · Gold `#f59e0b` · Violet `#a855f7`

---

## 📚 Documentation

| Document | Link |
|----------|------|
| 📊 Presentation (PPTX) | [`docs/feminine-sports.pptx`](https://docs.google.com/presentation/d/1M1__UMAHJZ5z61_9yb0S255sjrmajkWv/edit?usp=drive_link&ouid=107648029928631212846&rtpof=true&sd=true) |
| 📄 Project Document | [`docs/`](https://docs.google.com/document/d/1_tdMhCNrqR0KC1EwK-zGP6RMsA9YdKr1/edit?usp=drive_link&ouid=107648029928631212846&rtpof=true&sd=true) |
| 🎬 User Demo | [Watch on Drive](https://drive.google.com/file/d/1liHzrBtftdsLXD_AHg2KCg7rpv9FTaRY/view?usp=sharing) |
| 🔐 Admin Demo | [Watch on Drive](https://drive.google.com/file/d/1knD1xLpSfMh7gJnFh2Mqzedg0I5w4NfP/view?usp=sharing) |

---

## 📖 References

- Mubarak et al. — *Arabic X-sphere: Cyberhate Detection in Arabic Social Media*
- Abdul-Mageed et al. (2021) — *MARBERT: Multidialectal Arabic BERT*
- World Athletics (2021) — *Online Abuse Study, Tokyo Olympic Games*
- Springer (2022) — *Automatic Classification of Hate Speech in the Sports Domain*
- UN Report — *Violence Against Women & Girls in Sports*

---

<div align="center">

**✦ feminine-sports · EELU · Graduation Project 2026**

*Built with ❤️ to empower Arab women in sports*

</div>
