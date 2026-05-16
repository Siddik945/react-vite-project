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
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  const getArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchSites = async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/sites`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // Token expired or missing, redirect to login
    if (response.status === 401) {
      window.location.href = '/';
    }
    setSites(getArray(data));
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/product-categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // Token expired or missing, redirect to login
    if (response.status === 401) {
      window.location.href = '/';
    }
    setCategories(getArray(data));
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // Token expired or missing, redirect to login
    if (response.status === 401) {
      window.location.href = '/';
    }
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
