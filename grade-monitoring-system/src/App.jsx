import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./components/AuthContext";
import Loading from "./components/Loading";
import "./css/App.css";
import "./css/Login.css";

const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const AddGrades = lazy(() => import("./pages/input-grades/AddGrades"));
const ViewGrade = lazy(() => import("./pages/input-grades/ViewGrades"));

const ViewCluster = lazy(() => import("./pages/clustering-result/ViewCluster"));
const AtRisk = lazy(() => import("./pages/clustering-result/AtRisk"));

const RecommendedCourse = lazy(() =>
  import("./pages/recommendation/RecommendedCourse")
);
const ShiftAdvisories = lazy(() =>
  import("./pages/recommendation/ShiftAdvisories")
);
const Home = lazy(() => import("./pages/Home"));

const AddAccount = lazy(() => import("./pages/AddAccount"));
const StudentRegistration = lazy(() => import("./pages/StudentRegistration"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Navigate to="login" replace />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="login" element={<Login />} />
      {/* <Route path="/mfa-page" element={<MFAPage />} /> */}

      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="add-account" element={<AddAccount />} />
        <Route path="register-student" element={<StudentRegistration />} />
        <Route path="home" element={<Home />} />
        <Route path="input-grades" element={<AddGrades />} />
        <Route path="view-grades" element={<ViewGrade />} />
        <Route path="view-cluster" element={<ViewCluster />} />
        <Route path="at-risk" element={<AtRisk />} />
        <Route path="recommended-courses" element={<RecommendedCourse />} />
        <Route path="shift-advisory" element={<ShiftAdvisories />} />

        {/* <Route
          path="reports/collection-report"
          element={<CollectionReport />}
        /> */}
        {/* <Route path="reports/student-ledger" element={<StudentLedger />} />
        <Route path="settings/schedule-of-fees" element={<ScheduleOfFees />} />
        <Route path="settings/mfa-setup-page" element={<MFASetupPage />} />
        <Route path="settings/user-account" element={<UserAccount />} />
        <Route path="settings/date-setting" element={<DateSetting />} /> */}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

function App() {
  return (
    <>
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
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </>
  );
}

export default App;
