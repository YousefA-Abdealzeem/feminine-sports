document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector('.login-card form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('input[type="email"]').value;
      const password = loginForm.querySelector('input[type="password"]').value;
      if (email === "" || password === "") {
        alert("من فضلك أدخل البريد الإلكتروني وكلمة المرور");
      } else {
        alert("تم تسجيل الدخول بنجاح!");
      }
    });
    const goToReg = document.querySelector('.register span');
    if (goToReg) {
      goToReg.onclick = () => window.location.href = "register.html";
    }
  }

  const regForm = document.querySelector('.card form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = regForm.querySelectorAll('input');
      const fullName = inputs[0].value;
      const email = inputs[1].value;
      const pass = inputs[2].value;
      const confirmPass = inputs[3].value;

      if (!fullName || !email || !pass) {
        alert("من فضلك أكمل جميع البيانات");
        return;
      }
      if (pass !== confirmPass) {
        alert("كلمة المرور غير متطابقة");
        return;
      }
      alert("تم إنشاء الحساب بنجاح");
      window.location.href = "index.html";
    });
    const goToLog = document.querySelector('.login span');
    if (goToLog) {
      goToLog.onclick = () => window.location.href = "index.html";
    }
  }
});