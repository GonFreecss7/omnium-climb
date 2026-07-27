import { AppStateProvider, useAppState } from "./state/AppState";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import GuideView from "./views/GuideView";
import TechniquesView from "./views/TechniquesView";
import DrillsView from "./views/DrillsView";
import SessionView from "./views/SessionView";

function Main() {
  const { tab } = useAppState();
  return (
    <main className="app__main">
      {tab === "guide" && <GuideView />}
      {tab === "techniques" && <TechniquesView />}
      {tab === "drills" && <DrillsView />}
      {tab === "session" && <SessionView />}
    </main>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <div className="app">
        <Header />
        <Main />
        <TabBar />
      </div>
    </AppStateProvider>
  );
}
