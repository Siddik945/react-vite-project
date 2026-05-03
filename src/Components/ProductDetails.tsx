import { useEffect, useState } from 'react';

type Company = {
  id: number;
  name: string;
};

type Site = {
  id: number;
  name: string;
  companyId: number;
  company?: Company;
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
  site?: Site;
  category?: Category;
};

type Contract = {
  id: number;
  date: string;
  companyId: number;
  siteId: number;
  productCategoriesId: number;
  rate: number;
  company?: Company;
  site?: Site;
  productCategory?: Category;
};

type ProductDetailsType = {
  id: number;

  orderId: number;
  companyId: number;
  siteId: number;
  categoriesId: number;
  contractId: number;

  date: string;
  challanNo: string;

  buyingQuantity: number;
  buyingPricePerCft: number;
  rentCost: number;
  labourCost: number;
  otherCost: number;

  sellingQuantity: number;
  status: string;

  totalPrice: number;
  totalCost: number;
  profit: number;

  company?: Company;
  site?: Site;
  category?: Category;
  contract?: Contract;
  order?: Order;
};

type ProductDetailsFormData = {
  orderId: string;
  date: string;
  companyId: string;
  siteId: string;
  categoriesId: string;
  contractId: string;
  challanNo: string;
  buyingQuantity: string;
  buyingPricePerCft: string;
  rentCost: string;
  labourCost: string;
  otherCost: string;
  sellingQuantity: string;
  status: string;
};

const ProductDetails = () => {
  const [productDetails, setProductDetails] = useState<ProductDetailsType[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);

  const [formData, setFormData] = useState<ProductDetailsFormData>({
    orderId: '',
    date: '',
    companyId: '',
    siteId: '',
    categoriesId: '',
    contractId: '',
    challanNo: '',
    buyingQuantity: '',
    buyingPricePerCft: '',
    rentCost: '',
    labourCost: '',
    otherCost: '',
    sellingQuantity: '',
    status: '',
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [detailsData, setDetailsData] = useState<ProductDetailsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchProductDetails = async () => {
    const response = await fetch('http://localhost:3000/product-details');
    const data = await response.json();
    setProductDetails(getArray(data));
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

  const fetchContracts = async () => {
    const response = await fetch('http://localhost:3000/contracts');
    const data = await response.json();
    setContracts(getArray(data));
  };

  const fetchOrders = async () => {
    const response = await fetch('http://localhost:3000/orders');
    const data = await response.json();
    setOrders(getArray(data));
  };

  useEffect(() => {
    fetchProductDetails();
    fetchCompanies();
    fetchSites();
    fetchCategories();
    fetchContracts();
    fetchOrders();
  }, []);

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return date.slice(0, 10);
  };

  const getCompanyNameById = (companyId: string | number) => {
    return companies.find((company) => company.id === Number(companyId))?.name || 'N/A';
  };

  const getSiteNameById = (siteId: string | number) => {
    return sites.find((site) => site.id === Number(siteId))?.name || 'N/A';
  };

  const getCategoryNameById = (categoryId: string | number) => {
    return categories.find((category) => category.id === Number(categoryId))?.name || 'N/A';
  };

  const getCompanyName = (product: ProductDetailsType) => {
    return (
      product.company?.name ||
      product.order?.site?.company?.name ||
      companies.find((company) => company.id === product.companyId)?.name ||
      'N/A'
    );
  };

  const getSiteName = (product: ProductDetailsType) => {
    return (
      product.site?.name ||
      product.order?.site?.name ||
      sites.find((site) => site.id === product.siteId)?.name ||
      'N/A'
    );
  };

  const getCategoryName = (product: ProductDetailsType) => {
    return (
      product.category?.name ||
      product.order?.category?.name ||
      categories.find((category) => category.id === product.categoriesId)?.name ||
      'N/A'
    );
  };

  const getContractRate = (product: ProductDetailsType) => {
    return (
      product.contract?.rate ??
      contracts.find((contract) => contract.id === product.contractId)?.rate ??
      0
    );
  };

  const getOrderSite = (order: Order) => {
    return order.site || sites.find((site) => site.id === order.siteId);
  };

  const getOrderCompanyId = (order: Order) => {
    const site = getOrderSite(order);
    return site?.companyId || '';
  };

  const getOrderLabel = (order: Order) => {
    const site = getOrderSite(order);
    const company = site?.company || companies.find((company) => company.id === site?.companyId);
    const category =
      order.category || categories.find((category) => category.id === order.categoriesId);

    return `Order #${order.id} - ${company?.name || 'No Company'} - ${
      site?.name || 'No Site'
    } - ${category?.name || 'No Category'} - ${formatDate(order.date)}`;
  };

  const getContractsByOrder = (order: Order) => {
    const companyId = getOrderCompanyId(order);
    const siteId = order.siteId;
    const categoriesId = order.categoriesId;

    return contracts.filter((contract) => {
      return (
        contract.companyId === Number(companyId) &&
        contract.siteId === Number(siteId) &&
        contract.productCategoriesId === Number(categoriesId)
      );
    });
  };

  const fillFormFromOrder = (orderId: string) => {
    const selectedOrder = orders.find((order) => order.id === Number(orderId));

    if (!selectedOrder) {
      setFormData((prev) => ({
        ...prev,
        orderId: '',
        date: '',
        companyId: '',
        siteId: '',
        categoriesId: '',
        contractId: '',
        status: '',
      }));

      setFilteredContracts([]);
      return;
    }

    const companyId = getOrderCompanyId(selectedOrder);
    const siteId = selectedOrder.siteId;
    const categoriesId = selectedOrder.categoriesId;

    setFilteredContracts(getContractsByOrder(selectedOrder));

    setFormData((prev) => ({
      ...prev,
      orderId,
      date: selectedOrder.date?.slice(0, 10) || '',
      companyId: String(companyId),
      siteId: String(siteId),
      categoriesId: String(categoriesId),
      contractId: '',
      status: selectedOrder.status || '',
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'orderId') {
      fillFormFromOrder(value);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      orderId: '',
      date: '',
      companyId: '',
      siteId: '',
      categoriesId: '',
      contractId: '',
      challanNo: '',
      buyingQuantity: '',
      buyingPricePerCft: '',
      rentCost: '',
      labourCost: '',
      otherCost: '',
      sellingQuantity: '',
      status: '',
    });

    setFilteredContracts([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const url = editId
        ? `http://localhost:3000/product-details/${editId}`
        : 'http://localhost:3000/product-details';

      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: Number(formData.orderId),
          companyId: Number(formData.companyId),
          siteId: Number(formData.siteId),
          categoriesId: Number(formData.categoriesId),
          contractId: Number(formData.contractId),
          date: formData.date,
          challanNo: formData.challanNo,
          buyingQuantity: Number(formData.buyingQuantity),
          buyingPricePerCft: Number(formData.buyingPricePerCft),
          rentCost: Number(formData.rentCost || 0),
          labourCost: Number(formData.labourCost || 0),
          otherCost: Number(formData.otherCost || 0),
          sellingQuantity: Number(formData.sellingQuantity),
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(
        editId ? 'Product details updated successfully.' : 'Product details created successfully.',
      );

      // After successfully creating the product details, update the order status to "completed"
      if (response.ok && !editId) {
        await fetch(`http://localhost:3000/orders/${formData.orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'Order Done',
          }),
        });
      }

      resetForm();
      setEditId(null);
      fetchProductDetails();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: ProductDetailsType) => {
    setEditId(product.id);

    const selectedOrder = product.order || orders.find((order) => order.id === product.orderId);

    if (selectedOrder) {
      setFilteredContracts(getContractsByOrder(selectedOrder));
    } else {
      const matchedContracts = contracts.filter((contract) => {
        return (
          contract.companyId === product.companyId &&
          contract.siteId === product.siteId &&
          contract.productCategoriesId === product.categoriesId
        );
      });

      setFilteredContracts(matchedContracts);
    }

    setFormData({
      orderId: String(product.orderId),
      date: product.date?.slice(0, 10),
      companyId: String(product.companyId),
      siteId: String(product.siteId),
      categoriesId: String(product.categoriesId),
      contractId: String(product.contractId),
      challanNo: product.challanNo,
      buyingQuantity: String(product.buyingQuantity),
      buyingPricePerCft: String(product.buyingPricePerCft),
      rentCost: String(product.rentCost),
      labourCost: String(product.labourCost),
      otherCost: String(product.otherCost),
      sellingQuantity: String(product.sellingQuantity),
      status: product.status,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product details?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/product-details/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product details');
      }

      setMessage('Product details deleted successfully.');
      fetchProductDetails();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    resetForm();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        {editId ? 'Update Product Details' : 'Create Product Details'}
      </h1>

      <form onSubmit={handleSubmit} className="mb-8 max-w-2xl space-y-5">
        <div>
          <label htmlFor="orderId" className="mb-2 block text-sm font-medium text-slate-700">
            Order
          </label>

          <select
            id="orderId"
            name="orderId"
            value={formData.orderId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          >
            <option value="">Select Order</option>

            {orders
              .filter((order) => order.status === 'Completed')
              .map((order) => (
                <option key={order.id} value={String(order.id)}>
                  {getOrderLabel(order)}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-slate-700">
            Date
          </label>

          <input
            id="date"
            type="date"
            value={formData.date}
            readOnly
            required
            className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-slate-700">
            Company Name
          </label>

          <input
            id="companyName"
            type="text"
            value={formData.companyId ? getCompanyNameById(formData.companyId) : ''}
            readOnly
            placeholder="Company will be filled from order"
            className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label htmlFor="siteName" className="mb-2 block text-sm font-medium text-slate-700">
            Site Name
          </label>

          <input
            id="siteName"
            type="text"
            value={formData.siteId ? getSiteNameById(formData.siteId) : ''}
            readOnly
            placeholder="Site will be filled from order"
            className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label htmlFor="categoryName" className="mb-2 block text-sm font-medium text-slate-700">
            Item / Product Category
          </label>

          <input
            id="categoryName"
            type="text"
            value={formData.categoriesId ? getCategoryNameById(formData.categoriesId) : ''}
            readOnly
            placeholder="Item will be filled from order"
            className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label htmlFor="contractId" className="mb-2 block text-sm font-medium text-slate-700">
            Contract / Selling Price
          </label>

          <select
            id="contractId"
            name="contractId"
            value={formData.contractId}
            onChange={handleChange}
            required
            disabled={!formData.orderId}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">{formData.orderId ? 'Select Contract' : 'Select Order First'}</option>

            {filteredContracts.map((contract) => (
              <option key={contract.id} value={String(contract.id)}>
                {/* Contract #{contract.id} - Rate:  */}
                {contract.rate}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="challanNo" className="mb-2 block text-sm font-medium text-slate-700">
            Challan No
          </label>

          <input
            id="challanNo"
            type="text"
            name="challanNo"
            value={formData.challanNo}
            onChange={handleChange}
            required
            placeholder="Enter challan no"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label htmlFor="buyingQuantity" className="mb-2 block text-sm font-medium text-slate-700">
            Buying Quantity
          </label>

          <input
            id="buyingQuantity"
            type="number"
            step="any"
            name="buyingQuantity"
            value={formData.buyingQuantity}
            onChange={handleChange}
            required
            placeholder="Enter buying quantity"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="buyingPricePerCft"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Buying Price Per CFT
          </label>

          <input
            id="buyingPricePerCft"
            type="number"
            step="any"
            name="buyingPricePerCft"
            value={formData.buyingPricePerCft}
            onChange={handleChange}
            required
            placeholder="Enter buying price per CFT"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label htmlFor="rentCost" className="mb-2 block text-sm font-medium text-slate-700">
            Rent Cost
          </label>

          <input
            id="rentCost"
            type="number"
            step="any"
            name="rentCost"
            value={formData.rentCost}
            onChange={handleChange}
            placeholder="Enter rent cost"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label htmlFor="labourCost" className="mb-2 block text-sm font-medium text-slate-700">
            Labour Cost
          </label>

          <input
            id="labourCost"
            type="number"
            step="any"
            name="labourCost"
            value={formData.labourCost}
            onChange={handleChange}
            required
            placeholder="Enter labour cost"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label htmlFor="otherCost" className="mb-2 block text-sm font-medium text-slate-700">
            Other Cost
          </label>

          <input
            id="otherCost"
            type="number"
            step="any"
            name="otherCost"
            value={formData.otherCost}
            onChange={handleChange}
            required
            placeholder="Enter other cost"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="sellingQuantity"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Selling Quantity
          </label>

          <input
            id="sellingQuantity"
            type="number"
            step="any"
            name="sellingQuantity"
            value={formData.sellingQuantity}
            onChange={handleChange}
            required
            placeholder="Enter selling quantity"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {/* <div>
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
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div> */}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Saving...' : editId ? 'Update Product Details' : 'Create Product Details'}
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
              <th className="p-3">Site</th>
              <th className="p-3">Item</th>
              <th className="p-3">Challan</th>
              <th className="p-3">Selling Quantity</th>
              <th className="p-3">Selling Price</th>
              <th className="p-3">Profit</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {productDetails.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-3">{formatDate(product.date)}</td>
                <td className="p-3">{getSiteName(product)}</td>
                <td className="p-3">{getCategoryName(product)}</td>
                <td className="p-3">{product.challanNo}</td>
                <td className="p-3">{product.sellingQuantity}</td>
                <td className="p-3">{getContractRate(product)}</td>
                <td className="p-3">{product.profit}</td>

                <td className="flex gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailsData(product)}
                    className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}

            {productDetails.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-slate-500">
                  No product details found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detailsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Product Details</h2>

              <button
                type="button"
                onClick={() => setDetailsData(null)}
                className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailsItem label="Date" value={formatDate(detailsData.date)} />
              <DetailsItem label="Company" value={getCompanyName(detailsData)} />
              <DetailsItem label="Site" value={getSiteName(detailsData)} />
              <DetailsItem label="Item" value={getCategoryName(detailsData)} />
              <DetailsItem label="Challan" value={detailsData.challanNo} />

              <DetailsItem label="Buying Quantity" value={detailsData.buyingQuantity} />
              <DetailsItem label="Buying Price Per CFT" value={detailsData.buyingPricePerCft} />
              <DetailsItem label="Rent Cost" value={detailsData.rentCost} />
              <DetailsItem label="Labour Cost" value={detailsData.labourCost} />
              <DetailsItem label="Other Cost" value={detailsData.otherCost} />

              <DetailsItem label="Selling Quantity" value={detailsData.sellingQuantity} />
              <DetailsItem label="Selling Price" value={getContractRate(detailsData)} />
              {/* <DetailsItem label="Status" value={detailsData.status} /> */}
              <DetailsItem label="Total Price" value={detailsData.totalPrice} />
              <DetailsItem label="Total Cost" value={detailsData.totalCost} />
              <DetailsItem label="Profit" value={detailsData.profit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type DetailsItemProps = {
  label: string;
  value: string | number | null | undefined;
};

const DetailsItem = ({ label, value }: DetailsItemProps) => {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value ?? 'N/A'}</p>
    </div>
  );
};

export default ProductDetails;
