import { useEffect, useState } from "react";

// Views: login, forgot password, dashboard
export const titles = {
  login: "ORVIA - Login",
  forgot: "ORVIA - Forgot Password",
  dashboard: "ORVIA - Account Manager Dashboard",
};

function readView() {
  const hash = window.location.hash.slice(1);
  return hash in titles ? hash : "login";
}

export default function useHashView() {
  const [view, setView] = useState(readView);

  useEffect(() => {
    const onChange = () => setView(readView());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  // The stylesheet switches screens through body[data-view]
  useEffect(() => {
    document.body.dataset.view = view;
    document.title = titles[view];
    window.scrollTo(0, 0);
  }, [view]);

  return view;
}
