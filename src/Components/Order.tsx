import { useState, useEffect } from 'react';

interface DataItem {
  id: number;
  date: string;
  side_name: string;
  item: string;
  is_done: boolean;
}

interface ListItem {
  count: number;
  data: DataItem[];
}

const Order = () => {
  const [form, setForm] = useState({
    date: '',
    side_name: '',
    item: '',
  });

  const [report, setReport] = useState<ListItem>({
    count: 0,
    data: [],
  });

  // 🔁 Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/orders');
      const result = await res.json();
      setReport(result);
    } catch (error) {
      console.error(error);
      alert('Error fetching data ❌');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 📝 Handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ➕ Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      await res.json();

      alert('Order Added ✅');

      // reset form
      setForm({
        date: '',
        side_name: '',
        item: '',
      });

      // 🔁 refresh list
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert('Error ❌');
    }
  };

  // ❌ Delete item
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure to delete?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/orders/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Deleted successfully ✅');

        // remove from UI instantly
        setReport((prev) => ({
          ...prev,
          count: prev.count - 1,
          data: prev.data.filter((item) => item.id !== id),
        }));
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Delete failed ❌');
    }
  };

  // ✅ Strike toggle
  const handleStrike = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`http://localhost:5000/orders/strike/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_done: !currentStatus,
        }),
      });

      const updated = await res.json();

      // update UI
      setReport((prev) => ({
        ...prev,
        data: prev.data.map((item) =>
          item.id === id ? { ...item, is_done: updated.is_done } : item,
        ),
      }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-20 text-center">
      <h2 className="mb-4 text-2xl font-bold">Order Now</h2>

      {/* 📝 Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap justify-center gap-4">
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="rounded border p-2"
          required
        />

        <input
          type="text"
          name="side_name"
          value={form.side_name}
          onChange={handleChange}
          className="rounded border p-2"
          placeholder="Enter Side Name"
          required
        />

        <input
          type="text"
          name="item"
          value={form.item}
          onChange={handleChange}
          className="rounded border p-2"
          placeholder="Enter Item Name"
          required
        />

        <button className="rounded bg-blue-500 px-4 py-2 text-white shadow-md transition-all duration-150 hover:bg-blue-600 hover:shadow-lg active:scale-95 active:bg-blue-700">
          Add Order
        </button>
      </form>

      <h2 className="mb-4 text-2xl font-bold">Order List ({report.count})</h2>

      {/* 📊 Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Date</th>
              <th className="border p-2">Side Name</th>
              <th className="border p-2">Item</th>
              <th className="border p-2">Done</th>
              <th className="border p-2">Edit</th>
              <th className="border p-2">Delete</th>
            </tr>
          </thead>

          <tbody>
            {report.data.length > 0 ? (
              report.data.map((item) => (
                <tr
                  key={item.id}
                  className={`${item.is_done ? 'text-gray-400 line-through opacity-60' : ''}`}
                >
                  <td className="p-2">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                  <td className="p-2">{item.side_name}</td>
                  <td className="p-2">{item.item}</td>

                  <td className="p-2">
                    <button
                      onClick={() => handleStrike(item.id, item.is_done)}
                      className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600 active:scale-95"
                    >
                      Done
                    </button>
                  </td>

                  <td className="p-2">
                    <button className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600 active:scale-95">
                      Edit
                    </button>
                  </td>

                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 active:scale-95"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Order;
