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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchContracts = async () => {
    const response = await fetch('http://localhost:3000/contracts');
    const data = await response.json();
    setContracts(getArray(data));
  };

  const fetchCompanies = async () => {
    const response = await fetch('http://localhost:3000/companies');
    const data = await response.json();
    setCompanies(getArray(data));
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

  const resetForm = () => {
    setFormData({
      date: '',
      companyId: '',
      siteId: '',
      productCategoriesId: '',
      rate: '',
    });

    setFilteredSites([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const url = editId
        ? `http://localhost:3000/contracts/${editId}`
        : 'http://localhost:3000/contracts';

      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(editId ? 'Contract updated successfully.' : 'Contract created successfully.');

      resetForm();
      setEditId(null);
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this contract?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/contracts/${id}`, {
        method: 'DELETE',
      });

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

  const handleCancelEdit = () => {
    setEditId(null);
    resetForm();
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
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        {editId ? 'Update Contract' : 'Create Contract'}
      </h1>

      <form onSubmit={handleSubmit} className="mb-8 max-w-2xl space-y-5">
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
            <option value="">{formData.companyId ? 'Select Site' : 'Select Company First'}</option>

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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Saving...' : editId ? 'Update Contract' : 'Create Contract'}
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
    </div>
  );
};

export default Contract;
