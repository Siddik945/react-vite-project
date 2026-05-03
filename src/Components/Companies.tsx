import { useEffect, useState } from 'react';

type Company = {
  id: number;
  name: string;
  address: string;
  contact: string;
  email: string;
};

type CompanyForm = {
  name: string;
  address: string;
  contact: string;
  email: string;
};

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState<CompanyForm>({
    name: '',
    address: '',
    contact: '',
    email: '',
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:3000/companies');
      const data = await response.json();

      if (Array.isArray(data)) {
        setCompanies(data);
      } else if (Array.isArray(data.data)) {
        setCompanies(data.data);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error(error);
      setMessage('Failed to load companies');
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        ? `http://localhost:3000/companies/${editId}`
        : 'http://localhost:3000/companies';

      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(editId ? 'Company updated successfully.' : 'Company created successfully.');

      setFormData({
        name: '',
        address: '',
        contact: '',
        email: '',
      });

      setEditId(null);
      fetchCompanies();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditId(company.id);
    setFormData({
      name: company.name,
      address: company.address,
      contact: company.contact,
      email: company.email,
    });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this company?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/companies/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete company');
      }

      setMessage('Company deleted successfully.');
      fetchCompanies();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({
      name: '',
      address: '',
      contact: '',
      email: '',
    });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        {editId ? 'Update Company' : 'Create Company'}
      </h1>

      <form onSubmit={handleSubmit} className="mb-8 max-w-2xl space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Company Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Monsur Enterprise"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St, Dhaka"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Contact-0123456789"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="info@monsur.com"
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
            {loading ? 'Saving...' : editId ? 'Update Company' : 'Create Company'}
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
              <th className="p-3">Company Name</th>
              <th className="p-3">Address</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Email</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-b">
                <td className="p-3">{company.name}</td>
                <td className="p-3">{company.address}</td>
                <td className="p-3">{company.contact}</td>
                <td className="p-3">{company.email}</td>
                <td className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(company)}
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(company.id)}
                    className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Companies;
