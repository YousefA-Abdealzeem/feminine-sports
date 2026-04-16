document.addEventListener("DOMContentLoaded", () => {
  // كود صفحة الـ Login
  const loginForm = document.querySelector('.login-card form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("تم تسجيل الدخول بنجاح!");
    });
    const goToReg = document.querySelector('.register span');
    if (goToReg) { goToReg.onclick = () => window.location.href = "register.html"; }
  }

  // كود صفحة الـ Register
  const regCard = document.querySelector('.card');
  if (regCard) {
    const regForm = regCard.querySelector('form');
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("تم إنشاء الحساب بنجاح!");
      window.location.href = "index.html";
    });
    const goToLog = document.querySelector('.login span');
    if (goToLog) { goToLog.onclick = () => window.location.href = "index.html"; }
  }
});