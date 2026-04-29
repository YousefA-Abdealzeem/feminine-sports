# Admin login gmail : admin@herpower.com
# Admin login password : herpower123

# علشان تشغلي المشروع بعد متنزل الريبو عندك علي الجهاز تروح داخل ال VS.code في التيرمينال تكتب npm install هينزل ملف ال node module 
# بعد مينزل ف التيرمينال برضو تكتب  ng s هيطلع link تفتح اللينك هتلاقي المشروع 
# علشان توصل لصفحات ال dashboard بتكبت مثلا http://localhost:4200/dashboard 

# 🚀 WomensSport Project

## 📌 Project Overview

WomensSport is an Angular web application focused on managing and displaying sports-related content for women.
The project is structured using Angular best practices (features, shared components, routing).

---

# 🛠️ Tech Stack

* Angular 21
* Bootstrap
* FontAwesome
* Animate.css

---

# ⚙️ Getting Started (Important)

## 🥇 1) Clone the repository

```bash
git clone https://github.com/YousefA-Abdealzeem/feminine-sports.git
cd feminine-sports
```

---

## 🥈 2) Install dependencies

```bash
npm install
```

---

## 🥉 3) Run the project

```bash
ng serve
```

Then open:

```
http://localhost:4200/
```

---

# 📂 Project Structure

```
src/
 ├── app/
 │    ├── feature/
 │    │     └── womens-sports/
 │    │           ├── pages/
 │    │           ├── shared/
 │    │           └── dashboard/
 │    ├── app.routes.ts
 │    └── app.config.ts
 ├── assets/
 └── styles.css
```

---

# 👨‍💻 Team Workflow (VERY IMPORTANT)

## ⚠️ Rules

* ❌ Do NOT work directly on `main`

* ❌ Do NOT push broken code

* ❌ Do NOT upload node_modules

* ✅ Always work on a branch

* ✅ Pull latest changes before starting

---

## 🥇 Step 1: Switch to dev branch

```bash
git checkout dev
git pull
```

---

## 🥈 Step 2: Create your own branch

Example:

```bash
git checkout -b feature/login
```

Branch naming:

```
feature/login
feature/profile
feature/dashboard
feature/posts
```

---

## 🥉 Step 3: Work normally

Create your components, pages, styling, etc.

---

## 🏁 Step 4: Save your work

```bash
git add .
git commit -m "add login page"
git push origin feature/login
```

---

## 🔁 Step 5: Merge into dev (Team Leader)

```bash
git checkout dev
git pull
git merge feature/login
git push origin dev
```

---

# 📌 Features in the Project

* 🏠 Hero / Home Page
* 📄 About Page
* 📞 Contact Page
* 👤 Profile Page
* 🔐 Login & Register
* 📚 Posts & Post Details
* ⚙️ Dashboard (Admin)

---

# 🎨 Styling Rules

* Global styles → `styles.css`
* Component styles → inside each component
* Use Bootstrap classes when possible

---

# ⚠️ Important Notes

* Run `npm install` after pulling any updates
* If errors happen:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

# 👨‍💻 Team Roles (Optional)

* Frontend UI (Components)
* Routing & Navigation
* API Integration
* Dashboard

---

# 🔥 Final Notes

* Keep code clean
* Follow naming conventions
* Communicate before big changes

---

# ❤️ Good Luck Team 🚀

