import { useEffect, useState } from 'react';

type Company = {
  id: number;
  name: string;
};

type Site = {
  id: number;
  companyId: number;
  name: string;
  address: string;
  engrName: string;
  engrContact: string;
};

type SiteFormData = {
  companyId: string;
  name: string;
  address: string;
  engrName: string;
  engrContact: string;
};

const Sites = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [formData, setFormData] = useState<SiteFormData>({
    companyId: '',
    name: '',
    address: '',
    engrName: '',
    engrContact: '',
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
      companyId: '',
      name: '',
      address: '',
      engrName: '',
      engrContact: '',
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

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const res = await fetch('http://localhost:3000/companies', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401) {
        window.location.href = '/';
        return;
      }

      const data = await res.json();
      setCompanies(getArray(data));
    } catch (error) {
      console.error(error);
      setMessage('Failed to load companies');
    }
  };

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const res = await fetch('http://localhost:3000/sites', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401) {
        window.location.href = '/';
        return;
      }

      const data = await res.json();
      setSites(getArray(data));
    } catch (error) {
      console.error(error);
      setMessage('Failed to load sites');
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchSites();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
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
      const url = editId ? `http://localhost:3000/sites/${editId}` : 'http://localhost:3000/sites';

      const method = editId ? 'PUT' : 'POST';
      const token = localStorage.getItem('access_token');

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          companyId: Number(formData.companyId),
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

      setMessage(editId ? 'Site updated successfully.' : 'Site created successfully.');

      resetForm();
      setIsModalOpen(false);
      fetchSites();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (site: Site) => {
    setEditId(site.id);
    setFormData({
      companyId: String(site.companyId),
      name: site.name,
      address: site.address,
      engrName: site.engrName,
      engrContact: site.engrContact,
    });
    setMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this site?');

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(`http://localhost:3000/sites/${id}`, {
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
        throw new Error(data.message || 'Failed to delete site');
      }

      setMessage('Site deleted successfully.');
      fetchSites();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const getCompanyName = (companyId: number) => {
    return companies.find((company) => company.id === companyId)?.name || companyId;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Site List</h1>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white transition hover:bg-green-800"
        >
          Create Site
        </button>
      </div>

      {message && <p className="mb-4 text-sm font-medium text-slate-700">{message}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Company</th>
              <th className="p-3">Site Name</th>
              <th className="p-3">Address</th>
              <th className="p-3">Engineer</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {sites.map((site) => (
              <tr key={site.id} className="border-b">
                <td className="p-3">{getCompanyName(site.companyId)}</td>
                <td className="p-3">{site.name}</td>
                <td className="p-3">{site.address}</td>
                <td className="p-3">{site.engrName}</td>
                <td className="p-3">{site.engrContact}</td>
                <td className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(site)}
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(site.id)}
                    className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {sites.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">
                  No sites found.
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
                {editId ? 'Update Site' : 'Create Site'}
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
                <label
                  htmlFor="companyId"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
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
                <label htmlFor="siteName" className="mb-2 block text-sm font-medium text-slate-700">
                  Site Name
                </label>
                <input
                  id="siteName"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Site Name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Site Address"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label htmlFor="engrName" className="mb-2 block text-sm font-medium text-slate-700">
                  Engineer Name
                </label>
                <input
                  id="engrName"
                  type="text"
                  name="engrName"
                  value={formData.engrName}
                  onChange={handleChange}
                  placeholder="Engineer Name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="engrContact"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Engineer Contact
                </label>
                <input
                  id="engrContact"
                  type="text"
                  name="engrContact"
                  value={formData.engrContact}
                  onChange={handleChange}
                  placeholder="Engineer Contact"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
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
                  {loading ? 'Saving...' : editId ? 'Update Site' : 'Create Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sites;
