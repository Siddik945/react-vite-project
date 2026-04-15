import { type MatchType } from './types/match';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Components/HeadingSection.tsx';
import Insert from './Components/CustomInsert.tsx';
import Home from './Components/Home.tsx';
import SellingReport from './Components/SellingReport.tsx';
import ClientView from './Components/ClientView.tsx';
import Payment from './Components/Payment.tsx';
import Order from './Components/Order.tsx';

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order" element={<Order />} />
          <Route path="/insert" element={<Insert />} />
          <Route path="/selling" element={<SellingReport />} />
          <Route path="/client" element={<ClientView />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
