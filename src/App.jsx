import { Toaster } from "react-hot-toast";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <>
      <Dashboard />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
