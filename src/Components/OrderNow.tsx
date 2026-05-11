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

type OrderFormData = {
  siteId: string;
  categoriesId: string;
  status: string;
  date: string;
};

const OrderNow = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [formData, setFormData] = useState<OrderFormData>({
    siteId: '',
    categoriesId: '',
    status: 'Pending',
    date: '',
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  const resetForm = () => {
    setFormData({
      siteId: '',
      categoriesId: '',
      status: 'Pending',
      date: '',
    });
    setEditId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch('http://localhost:3000/sites', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        window.location.href = '/';
        return;
      }

      const data = await response.json();
      setSites(getArray(data));
    } catch (error) {
      console.error(error);
      setMessage('Failed to load sites');
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch('http://localhost:3000/product-categories', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        window.location.href = '/';
        return;
      }

      const data = await response.json();
      setCategories(getArray(data));
    } catch (error) {
      console.error(error);
      setMessage('Failed to load categories');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch('http://localhost:3000/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        window.location.href = '/';
        return;
      }

      const data = await response.json();
      setOrders(getArray(data));
    } catch (error) {
      console.error(error);
      setMessage('Failed to load orders');
    }
  };

  useEffect(() => {
    fetchSites();
    fetchCategories();
    fetchOrders();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const url = editId
        ? `http://localhost:3000/orders/${editId}`
        : 'http://localhost:3000/orders';

      const method = editId ? 'PUT' : 'POST';
      const token = localStorage.getItem('access_token');

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId: Number(formData.siteId),
          categoriesId: Number(formData.categoriesId),
          status: formData.status,
          date: formData.date,
        }),
      });

      if (response.status === 401) {
        window.location.href = '/';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(editId ? 'Order updated successfully.' : 'Order created successfully.');

      resetForm();
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order: Order) => {
    setEditId(order.id);

    setFormData({
      siteId: String(order.siteId),
      categoriesId: String(order.categoriesId),
      status: order.status,
      date: order.date?.slice(0, 10),
    });

    setMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this order?');

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(`http://localhost:3000/orders/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        window.location.href = '/';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete order');
      }

      setMessage('Order deleted successfully.');
      fetchOrders();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const getSiteName = (siteId: number) => {
    return sites.find((site) => site.id === siteId)?.name || siteId;
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((category) => category.id === categoryId)?.name || categoryId;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Order List</h1>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white transition hover:bg-green-800"
        >
          Create Order
        </button>
      </div>

      {message && <p className="mb-4 text-sm font-medium text-slate-700">{message}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Site</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const isCompleted = order.status === 'Completed';
              const textClass = isCompleted ? 'p-3 text-slate-400 line-through' : 'p-3';

              return (
                <tr key={order.id} className={`border-b ${isCompleted ? 'bg-slate-100' : ''}`}>
                  <td className={textClass}>{order.date?.slice(0, 10)}</td>
                  <td className={textClass}>{getSiteName(order.siteId)}</td>
                  <td className={textClass}>{getCategoryName(order.categoriesId)}</td>
                  <td className={textClass}>{order.status}</td>

                  <td className="flex gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(order)}
                      className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Update
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(order.id)}
                      className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editId ? 'Update Order' : 'Create Order'}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="text-2xl font-bold text-slate-500 hover:text-slate-800"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="siteId" className="mb-2 block text-sm font-medium text-slate-700">
                  Site
                </label>
                <select
                  id="siteId"
                  name="siteId"
                  value={formData.siteId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Select Site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={String(site.id)}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="categoriesId"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Product Category
                </label>
                <select
                  id="categoriesId"
                  name="categoriesId"
                  value={formData.categoriesId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="mb-2 block text-sm font-medium text-slate-700">
                  Order Date
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="Pending">Pending</option>
                  <option value="Running">Running</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg bg-slate-500 px-6 py-3 font-semibold text-white hover:bg-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? 'Saving...' : editId ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderNow;
