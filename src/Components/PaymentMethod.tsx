import { useEffect, useState } from 'react';

type PaymentMethodType = {
  id: number;
  name: string;
};

const PaymentMethod = () => {
  const [methods, setMethods] = useState<PaymentMethodType[]>([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchMethods = async () => {
    try {
      const response = await fetch('http://localhost:3000/methods');
      const data = await response.json();
      setMethods(getArray(data));
    } catch (error) {
      console.error(error);
      setMessage('Failed to load payment methods');
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const url = editId
        ? `http://localhost:3000/methods/${editId}`
        : 'http://localhost:3000/methods';

      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(
        editId ? 'Payment method updated successfully.' : 'Payment method created successfully.',
      );

      setName('');
      setEditId(null);
      fetchMethods();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: PaymentMethodType) => {
    setEditId(method.id);
    setName(method.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this payment method?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/methods/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete payment method');
      }

      setMessage('Payment method deleted successfully.');
      fetchMethods();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setName('');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        {editId ? 'Update Payment Method' : 'Create Payment Method'}
      </h1>

      <form onSubmit={handleSubmit} className="mb-8 max-w-2xl space-y-5">
        <div>
          <label htmlFor="methodName" className="mb-2 block text-sm font-medium text-slate-700">
            Payment Method Name
          </label>

          <input
            id="methodName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cash / Bank / Bkash"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Saving...' : editId ? 'Update Method' : 'Create Method'}
          </button>

          {editId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg bg-slate-500 px-6 py-3 font-semibold text-white hover:bg-slate-600"
            >
              Cancel
            </button>
          )}
        </div>

        {message && <p className="text-sm font-medium text-slate-700">{message}</p>}
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Method Name</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {methods.map((method) => (
              <tr key={method.id} className="border-b">
                <td className="p-3">{method.name}</td>
                <td className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(method)}
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(method.id)}
                    className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {methods.length === 0 && (
              <tr>
                <td colSpan={2} className="p-4 text-center text-slate-500">
                  No payment methods found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentMethod;
