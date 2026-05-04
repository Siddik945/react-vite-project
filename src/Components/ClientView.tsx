import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FilterItem {
  companyId: string;
  start_date: string;
  end_date: string;
}

interface CompanyItem {
  id: number;
  name: string;
}

interface ProductDetailsItem {
  id: number;
  date: string;
  challanNo: string;
  sellingQuantity: number;
  totalPrice: number;

  site?: {
    id: number;
    name: string;
  };

  category?: {
    id: number;
    name: string;
  };

  contract?: {
    id: number;
    rate: number;
  };
}

const API_BASE_URL = 'http://localhost:3000';

const ClientView = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [data, setData] = useState<ProductDetailsItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isSubmit, setIsSubmit] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [filter, setFilter] = useState<FilterItem>({
    companyId: '',
    start_date: '',
    end_date: '',
  });

  const selectedCompany = useMemo(() => {
    return companies.find((company) => String(company.id) === filter.companyId);
  }, [companies, filter.companyId]);

  const selectedCompanyName = selectedCompany?.name || '-';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilter((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';

    const d = new Date(dateStr);

    if (Number.isNaN(d.getTime())) {
      return dateStr;
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const getArrayData = (json: any): ProductDetailsItem[] => {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.data?.data)) return json.data.data;
    if (Array.isArray(json?.result)) return json.result;
    return [];
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/companies`);

        if (!res.ok) {
          throw new Error('Failed to fetch companies');
        }

        const json = await res.json();

        const companyList: CompanyItem[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
            ? json.data
            : [];

        setCompanies(companyList);
      } catch (error) {
        console.error(error);
        alert('Error fetching companies ❌');
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!filter.companyId) {
      alert('Please select company');
      return;
    }

    setLoading(true);
    setIsSubmit(true);
    setCurrentPage(1);

    try {
      const params = new URLSearchParams();

      if (filter.start_date) {
        params.append('start_date', filter.start_date);
      }

      if (filter.end_date) {
        params.append('end_date', filter.end_date);
      }

      const res = await fetch(
        `${API_BASE_URL}/product-details/company/${filter.companyId}?${params.toString()}`,
      );

      if (!res.ok) {
        throw new Error('Failed to fetch client report');
      }

      const json = await res.json();

      console.log('Client report response:', json);

      const reportData = getArrayData(json);

      console.log('Report data:', reportData);

      setData(reportData);
    } catch (error) {
      console.error(error);
      alert('Error fetching data ❌');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }

    return data.filter((item) => item.site?.name?.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfFirst = (currentPage - 1) * itemsPerPage;

  const currentData = filteredData.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalQuantity = filteredData.reduce(
    (sum, item) => sum + Number(item.sellingQuantity || 0),
    0,
  );

  const totalPrice = filteredData.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);

  const exportExcel = () => {
    const rows = filteredData.map((item, index) => ({
      '#': index + 1,
      Company: selectedCompanyName,
      Date: formatDate(item.date),
      'Site Name': item.site?.name || '-',
      Item: item.category?.name || '-',
      'Challan No': item.challanNo || '-',
      'Quantity (cft)': Number(item.sellingQuantity || 0),
      'Price/cft': Number(item.contract?.rate || 0),
      'Total Price': Number(item.totalPrice || 0),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Client Report');

    const buffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    saveAs(new Blob([buffer]), 'client_report.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Monsur Enterprises', pageWidth / 2, 15, {
      align: 'center',
    });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Product Report', pageWidth / 2, 23, {
      align: 'center',
    });

    doc.setFontSize(10);
    doc.text(`Company: ${selectedCompanyName}`, 14, 33);
    doc.text(`From: ${filter.start_date || '-'}`, 14, 39);
    doc.text(`To: ${filter.end_date || '-'}`, 14, 45);

    const rows = filteredData.map((item, index) => [
      index + 1,
      formatDate(item.date),
      item.site?.name || '-',
      item.category?.name || '-',
      item.challanNo || '-',
      Number(item.sellingQuantity || 0),
      Number(item.contract?.rate || 0),
      Number(item.totalPrice || 0),
    ]);

    autoTable(doc, {
      startY: 53,
      head: [['#', 'Date', 'Site Name', 'Item', 'Challan', 'Qty', 'Price/cft', 'Total']],
      body: rows,
      // foot: [['', '', '', '', 'Total', totalQuantity.toFixed(2), '', totalPrice.toFixed(2)]],
      // footStyles: {
      //   fontStyle: 'bold',
      // },
    });

    doc.save('client_report.pdf');
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap justify-center gap-4">
        <select
          name="companyId"
          value={filter.companyId}
          onChange={handleChange}
          className="border p-2"
          required
        >
          <option value="">Select Company</option>

          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="start_date"
          value={filter.start_date}
          onChange={handleChange}
          className="border p-2"
          required
        />

        <input
          type="date"
          name="end_date"
          value={filter.end_date}
          onChange={handleChange}
          className="border p-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>

      {isSubmit && (
        <>
          <div className="mb-4 text-left">
            <p className="text-lg">
              Company: <span className="font-semibold">{selectedCompanyName}</span>
            </p>
          </div>

          {filteredData.length > 0 && (
            <div className="mb-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={exportExcel}
                className="rounded bg-green-600 px-4 py-2 text-white"
              >
                Export Excel
              </button>

              <button
                type="button"
                onClick={exportPDF}
                className="rounded bg-red-600 px-4 py-2 text-white"
              >
                Export PDF
              </button>
            </div>
          )}

          <div className="mb-4 flex justify-center">
            <input
              type="text"
              placeholder="Search by site name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md border p-2"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    '#',
                    'Date',
                    'Site Name',
                    'Item',
                    'Challan No',
                    'Quantity (cft)',
                    'Price/cft',
                    'Total Price',
                  ].map((head) => (
                    <th key={head} className="border px-2 py-1 text-left">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {currentData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{indexOfFirst + index + 1}</td>

                    <td className="border px-2 py-1">{formatDate(item.date)}</td>

                    <td className="border px-2 py-1">{item.site?.name || '-'}</td>

                    <td className="border px-2 py-1">{item.category?.name || '-'}</td>

                    <td className="border px-2 py-1">{item.challanNo || '-'}</td>

                    <td className="border px-2 py-1">{Number(item.sellingQuantity || 0)}</td>

                    <td className="border px-2 py-1">{Number(item.contract?.rate || 0)}</td>

                    <td className="border px-2 py-1">{Number(item.totalPrice || 0)}</td>
                  </tr>
                ))}
              </tbody>

              {filteredData.length > 0 && (
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td colSpan={5} className="border px-2 py-1 text-right">
                      Total
                    </td>

                    <td className="border px-2 py-1">{totalQuantity.toFixed(2)}</td>

                    <td className="border px-2 py-1"></td>

                    <td className="border px-2 py-1">{totalPrice.toFixed(2)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              <span className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {filteredData.length === 0 && !loading && (
            <p className="mt-4 text-center text-gray-500">No data found</p>
          )}
        </>
      )}
    </div>
  );
};

export default ClientView;
