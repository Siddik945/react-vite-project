import { useEffect, useState } from 'react';

type Site = {
  id: number;
  name: string;
};

type Category = {
  id: number;
  name: string;
};

type Order = {
  id: number;
  siteId: number;
  categoriesId: number;
  status: string;
  date: string;
};

const Home = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const getArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchSites = async () => {
    const response = await fetch('http://localhost:3000/sites');
    const data = await response.json();
    setSites(getArray(data));
  };

  const fetchCategories = async () => {
    const response = await fetch('http://localhost:3000/product-categories');
    const data = await response.json();
    setCategories(getArray(data));
  };

  const fetchOrders = async () => {
    const response = await fetch('http://localhost:3000/orders');
    const data = await response.json();
    setOrders(getArray(data));
  };

  useEffect(() => {
    fetchSites();
    fetchCategories();
    fetchOrders();
  }, []);

  const getSiteName = (siteId: number) => {
    return sites.find((site) => site.id === siteId)?.name || siteId;
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((category) => category.id === categoryId)?.name || categoryId;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Order List</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Site</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => {
                const isCompleted = order.status === 'Completed';
                const textClass = isCompleted ? 'p-3 text-slate-400 line-through' : 'p-3';
                return (
                  <tr key={order.id} className={`border-b ${isCompleted ? 'bg-slate-100' : ''}`}>
                    <td className={textClass}>{order.date?.slice(0, 10)}</td>
                    <td className={textClass}>{getSiteName(order.siteId)}</td>
                    <td className={textClass}>{getCategoryName(order.categoriesId)}</td>
                    <td className={textClass}>{order.status}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
