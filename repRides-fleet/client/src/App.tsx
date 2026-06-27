import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { FleetPage } from "@/pages/FleetPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { RentalsPage } from "@/pages/RentalsPage";
import { DueSoonPage } from "@/pages/DueSoonPage";
import { LandingPage } from "@/pages/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/request" element={<Navigate to="/#request" replace />} />
        <Route element={<Layout />}>
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/rentals" element={<RentalsPage />} />
          <Route path="/due-soon" element={<DueSoonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
