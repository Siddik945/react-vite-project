import { useEffect, useState } from 'react';

type Company = {
  id: number;
  name: string;
};

type Method = {
  id: number;
  name: string;
};

type Payment = {
  id: number;
  companyId: number;
  methodId: number;
  date: string;
  amount: number;
};

type PaymentFormData = {
  companyId: string;
  methodId: string;
  date: string;
  amount: string;
};

const Payments = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [formData, setFormData] = useState<PaymentFormData>({
    companyId: '',
    methodId: '',
    date: '',
    amount: '',
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchCompanies = async () => {
    const response = await fetch('http://localhost:3000/companies');
    const data = await response.json();
    setCompanies(getArray(data));
  };

  const fetchMethods = async () => {
    const response = await fetch('http://localhost:3000/methods');
    const data = await response.json();
    setMethods(getArray(data));
  };

  const fetchPayments = async () => {
    const response = await fetch('http://localhost:3000/payments');
    const data = await response.json();
    setPayments(getArray(data));
  };

  useEffect(() => {
    fetchCompanies();
    fetchMethods();
    fetchPayments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      companyId: '',
      methodId: '',
      date: '',
      amount: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const url = editId
        ? `http://localhost:3000/payments/${editId}`
        : 'http://localhost:3000/payments';

      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: Number(formData.companyId),
          methodId: Number(formData.methodId),
          date: formData.date,
          amount: Number(formData.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(editId ? 'Payment updated successfully.' : 'Payment created successfully.');

      resetForm();
      setEditId(null);
      fetchPayments();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditId(payment.id);

    setFormData({
      companyId: String(payment.companyId),
      methodId: String(payment.methodId),
      date: payment.date?.slice(0, 10),
      amount: String(payment.amount),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this payment?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/payments/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete payment');
      }

      setMessage('Payment deleted successfully.');
      fetchPayments();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    resetForm();
  };

  const getCompanyName = (companyId: number) => {
    return companies.find((company) => company.id === companyId)?.name || companyId;
  };

  const getMethodName = (methodId: number) => {
    return methods.find((method) => method.id === methodId)?.name || methodId;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        {editId ? 'Update Payment' : 'Create Payment'}
      </h1>

      <form onSubmit={handleSubmit} className="mb-8 max-w-2xl space-y-5">
        <div>
          <label htmlFor="companyId" className="mb-2 block text-sm font-medium text-slate-700">
            Company
          </label>
          <select
            id="companyId"
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company.id} value={String(company.id)}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="methodId" className="mb-2 block text-sm font-medium text-slate-700">
            Payment Method
          </label>
          <select
            id="methodId"
            name="methodId"
            value={formData.methodId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          >
            <option value="">Select Method</option>
            {methods.map((method) => (
              <option key={method.id} value={String(method.id)}>
                {method.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-slate-700">
            Payment Date
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
          <label htmlFor="amount" className="mb-2 block text-sm font-medium text-slate-700">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0"
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
            {loading ? 'Saving...' : editId ? 'Update Payment' : 'Create Payment'}
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
              <th className="p-3">Date</th>
              <th className="p-3">Company</th>
              <th className="p-3">Method</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b">
                <td className="p-3">{payment.date?.slice(0, 10)}</td>
                <td className="p-3">{getCompanyName(payment.companyId)}</td>
                <td className="p-3">{getMethodName(payment.methodId)}</td>
                <td className="p-3">{payment.amount}</td>

                <td className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(payment)}
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(payment.id)}
                    className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
