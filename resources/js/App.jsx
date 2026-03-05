import { ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import darkTheme from "./config/antTheme";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmailsPage from "./pages/EmailsPage";
import BuyersPage from "./pages/BuyersPage";
import ReportsPage from "./pages/ReportsPage";
import GmailPage from "./pages/GmailPage";
import "./config/global.css";
import OAuthSuccessPage from "./pages/OAuthSuccessPage";
import PrivateRoute from "./components/shared/PrivateRoute";
import ThreadConversationPage from "./pages/ThreadConversationPage";
import SalesListPage from "./pages/SalesListPage";

export default function App() {
    return (
        <ConfigProvider theme={darkTheme}>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/oauth-success"
                        element={<OAuthSuccessPage />}
                    />
                    <Route
                        path="/"
                        element={
                            localStorage.getItem("token") ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* Protected */}
                    <Route element={<AppLayout />}>
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute roles={["admin", "sales"]}>
                                    <DashboardPage />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/emails"
                            element={
                                <PrivateRoute roles={["admin"]}>
                                    <EmailsPage />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/emails/thread/:threadId"
                            element={
                                <PrivateRoute roles={["admin"]}>
                                    <ThreadConversationPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/gmail"
                            element={
                                <PrivateRoute roles={["admin"]}>
                                    <GmailPage />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/buyers"
                            element={
                                <PrivateRoute roles={["admin"]}>
                                    <BuyersPage />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/sales-list"
                            element={
                                <PrivateRoute roles={["admin"]}>
                                    <SalesListPage />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/reports"
                            element={
                                <PrivateRoute roles={["admin"]}>
                                    <ReportsPage />
                                </PrivateRoute>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    );
}
