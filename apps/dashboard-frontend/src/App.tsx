import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { SignIn } from "./pages/Signin";
import { SignUp } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Credits } from "./pages/Credits";
import { ApiKeys } from "./pages/ApiKeys";
import { Landing } from "./pages/Landing";
import { Models } from "./pages/Models";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/apikeys" element={<ApiKeys />} />
        <Route path="/models" element={<Models />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
