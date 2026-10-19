import useHashView from "./useHashView.js";
import { Sprite } from "./components/Icons.jsx";
import Login from "./components/Login.jsx";
import Showcase from "./components/Showcase.jsx";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  // Syncs body[data-view] + document.title with the URL hash
  useHashView();

  return (
    <>
      <main className="page">
        <Login />
        <Showcase />
      </main>

      <Sprite />
      <Dashboard />
    </>
  );
}
