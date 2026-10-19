// Show / hide password
const toggle = document.querySelector(".input__toggle");
const password = document.getElementById("password");

toggle.addEventListener("click", () => {
  const isHidden = password.type === "password";
  password.type = isHidden ? "text" : "password";
  toggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});

// Light / dark theme
document.querySelectorAll(".theme-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;

    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  });
});

// Views: login, forgot password, dashboard
const titles = {
  login: "ORVIA - Login",
  forgot: "ORVIA - Forgot Password",
  dashboard: "ORVIA - Account Manager Dashboard",
};

function showView() {
  const hash = location.hash.slice(1);
  const view = hash in titles ? hash : "login";

  document.body.dataset.view = view;
  document.title = titles[view];
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", showView);
showView();

// Sign in opens the dashboard
document.querySelector("[data-form='login']").addEventListener("submit", (event) => {
  event.preventDefault();
  location.hash = "#dashboard";
});

// Collapse / expand the sidebar
const app = document.querySelector(".app");

document.querySelector(".sidebar__collapse").addEventListener("click", () => {
  app.dataset.collapsed = app.dataset.collapsed === "true" ? "false" : "true";
});
