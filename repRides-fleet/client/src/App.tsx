import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { FleetPage } from "@/pages/FleetPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { RentalsPage } from "@/pages/RentalsPage";
import { DueSoonPage } from "@/pages/DueSoonPage";
import { RequestRentalPage } from "@/pages/RequestRentalPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/request" element={<RequestRentalPage />} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/fleet" replace />} />
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/rentals" element={<RentalsPage />} />
          <Route path="/due-soon" element={<DueSoonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
