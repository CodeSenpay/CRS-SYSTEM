import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./components/AuthContext";
import Loading from "./components/Loading";
import "./css/App.css";
import "./css/Login.css";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Home = lazy(() => import("./pages/Home"));
const MFAPage = lazy(() => import("./pages/MFAPage"));
const AddAccount = lazy(() => import("./pages/AddAccount"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentRegistration = lazy(() => import("./pages/StudentRegistration"));

const AddGrades = lazy(() => import("./pages/input-grades/AddGrades"));
const ViewGrade = lazy(() => import("./pages/input-grades/ViewGrades"));
const Subjects = lazy(() => import("./components/Subjects"));

const ViewCluster = lazy(() => import("./pages/clustering-result/ViewCluster"));
const AtRisk = lazy(() => import("./pages/clustering-result/AtRisk"));

const RecommendedCourse = lazy(() =>
  import("./pages/recommendation/RecommendedCourse")
);
const ShiftAdvisories = lazy(() =>
  import("./pages/recommendation/ShiftAdvisories")
);

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        rtl={false}
        closeButton={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path="mfa-page" element={<MFAPage />} />
            <Route path="student-dashboard" element={<StudentDashboard />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route path="home" element={<Home />} />
              <Route path="add-account" element={<AddAccount />} />
              <Route
                path="register-student"
                element={<StudentRegistration />}
              />

              <Route path="input-grades" element={<AddGrades />} />
              <Route path="view-grades" element={<ViewGrade />} />
              <Route path="manage-subjects" element={<Subjects />} />
              <Route path="view-cluster" element={<ViewCluster />} />
              <Route path="at-risk" element={<AtRisk />} />
              <Route
                path="recommended-courses"
                element={<RecommendedCourse />}
              />
              <Route path="shift-advisory" element={<ShiftAdvisories />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
