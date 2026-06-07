import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { SignIn } from "./pages/Signin";
import { SignUp } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Credits } from "./pages/Credits";
import { ApiKeys } from "./pages/ApiKeys";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/apikeys" element={<ApiKeys />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
