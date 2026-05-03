import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout';
import Home from './Components/Home';
import SellingReport from './Components/SellingReport';
import ClientView from './Components/ClientView';
import PaymentReport from './Components/PaymentReport';
import Companies from './Components/Companies';
import Sites from './Components/Sites';
import ProductCategories from './Components/ProductCategories';
import OrderNow from './Components/OrderNow';
import ProductDetails from './Components/ProductDetails';
import PaymentMethods from './Components/PaymentMethod';
import Payments from './Components/Payments';
import TotalDue from './Components/TotalDue';
import Contract from './Components/Contract';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="selling" element={<SellingReport />} />
          <Route path="client" element={<ClientView />} />
          <Route path="payment-report" element={<PaymentReport />} />
          <Route path="companies" element={<Companies />} />
          <Route path="sites" element={<Sites />} />
          <Route path="categories" element={<ProductCategories />} />
          <Route path="order-now" element={<OrderNow />} />
          <Route path="product-details" element={<ProductDetails />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="payments" element={<Payments />} />
          <Route path="total-due" element={<TotalDue />} />
          <Route path="contract" element={<Contract />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
