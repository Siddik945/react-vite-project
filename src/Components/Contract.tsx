import { useEffect, useState } from 'react';

type ContractType = {
  id: number;
  date: string;
  companyId: number;
  siteId: number;
  productCategoriesId: number;
  rate: number;
};

type Company = {
  id: number;
  name: string;
};

type Site = {
  id: number;
  name: string;
  companyId: number;
};

type Category = {
  id: number;
  name: string;
};

type ContractFormData = {
  date: string;
  companyId: string;
  siteId: string;
  productCategoriesId: string;
  rate: string;
};

const Contract = () => {
  const [contracts, setContracts] = useState<ContractType[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<ContractFormData>({
    date: '',
    companyId: '',
    siteId: '',
    productCategoriesId: '',
    rate: '',
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
      date: '',
      companyId: '',
      siteId: '',
      productCategoriesId: '',
      rate: '',
    });

    setEditId(null);
    setFilteredSites([]);
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
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_BASE_URL}/contracts`, {
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
      setContracts(getArray(data));
    } catch (error) {
      console.error(error);
      setMessage('Failed to load contracts');
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_BASE_URL}/companies`, {
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
      setCompanies(getArray(data));
    } catch (error) {
      console.error(error);
      setMessage('Failed to load companies');
    }
  };

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_BASE_URL}/sites`, {
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

      const response = await fetch(`${API_BASE_URL}/product-categories`, {
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

  useEffect(() => {
    fetchContracts();
    fetchCompanies();
    fetchSites();
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'companyId') {
      const filtered = sites.filter((site) => site.companyId === Number(value));

      setFilteredSites(filtered);

      setFormData((prev) => ({
        ...prev,
        companyId: value,
        siteId: '',
      }));

      return;
    }

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
      const url = editId ? `${API_BASE_URL}/contracts/${editId}` : `${API_BASE_URL}/contracts`;

      const method = editId ? 'PUT' : 'POST';
      const token = localStorage.getItem('access_token');

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          companyId: Number(formData.companyId),
          siteId: Number(formData.siteId),
          productCategoriesId: Number(formData.productCategoriesId),
          rate: Number(formData.rate),
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

      setMessage(editId ? 'Contract updated successfully.' : 'Contract created successfully.');

      resetForm();
      setIsModalOpen(false);
      fetchContracts();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contract: ContractType) => {
    setEditId(contract.id);

    const companySites = sites.filter((site) => site.companyId === contract.companyId);
    setFilteredSites(companySites);

    setFormData({
      date: contract.date?.slice(0, 10),
      companyId: String(contract.companyId),
      siteId: String(contract.siteId),
      productCategoriesId: String(contract.productCategoriesId),
      rate: String(contract.rate),
    });

    setMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this contract?');

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(`http://localhost:3000/contracts/${id}`, {
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
        throw new Error(data.message || 'Failed to delete contract');
      }

      setMessage('Contract deleted successfully.');
      fetchContracts();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const getCompanyName = (companyId: number) => {
    return companies.find((company) => company.id === companyId)?.name || companyId;
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
        <h1 className="text-2xl font-bold text-slate-800">Contract List</h1>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white transition hover:bg-green-800"
        >
          Create Contract
        </button>
      </div>

      {message && <p className="mb-4 text-sm font-medium text-slate-700">{message}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Company</th>
              <th className="p-3">Site</th>
              <th className="p-3">Product Category</th>
              <th className="p-3">Rate</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id} className="border-b">
                <td className="p-3">{contract.date?.slice(0, 10)}</td>
                <td className="p-3">{getCompanyName(contract.companyId)}</td>
                <td className="p-3">{getSiteName(contract.siteId)}</td>
                <td className="p-3">{getCategoryName(contract.productCategoriesId)}</td>
                <td className="p-3">{contract.rate}</td>

                <td className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(contract)}
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(contract.id)}
                    className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {contracts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">
                  No contracts found.
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
                {editId ? 'Update Contract' : 'Create Contract'}
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
                <label htmlFor="date" className="mb-2 block text-sm font-medium text-slate-700">
                  Date
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
                <label htmlFor="siteId" className="mb-2 block text-sm font-medium text-slate-700">
                  Site
                </label>

                <select
                  id="siteId"
                  name="siteId"
                  value={formData.siteId}
                  onChange={handleChange}
                  required
                  disabled={!formData.companyId}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {formData.companyId ? 'Select Site' : 'Select Company First'}
                  </option>

                  {filteredSites.map((site) => (
                    <option key={site.id} value={String(site.id)}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="productCategoriesId"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Product Category
                </label>

                <select
                  id="productCategoriesId"
                  name="productCategoriesId"
                  value={formData.productCategoriesId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Select Product Category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="rate" className="mb-2 block text-sm font-medium text-slate-700">
                  Rate
                </label>

                <input
                  id="rate"
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
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
                  {loading ? 'Saving...' : editId ? 'Update Contract' : 'Create Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contract;
