import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FilterItem {
  start_date: string;
  end_date: string;
}

interface ProductDetailsItem {
  id: number;
  date: string;
  challanNo: string;

  buyingQuantity: number;
  buyingPricePerCft: number;
  rentCost: number;
  labourCost: number;
  otherCost: number;

  sellingQuantity: number;
  totalPrice: number;
  totalCost: number;
  profit: number;

  company?: {
    id: number;
    name: string;
  };

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

const SellingReport = () => {
  const [data, setData] = useState<ProductDetailsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isSubmit, setIsSubmit] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [filter, setFilter] = useState<FilterItem>({
    start_date: '',
    end_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const res = await fetch(`${API_BASE_URL}/product-details/sellingReport?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Failed to fetch selling report');
      }

      const json = await res.json();

      console.log('Selling report response:', json);

      const reportData = getArrayData(json);

      console.log('Selling report data:', reportData);

      setData(reportData);
    } catch (error) {
      console.error(error);
      alert('Error fetching selling report ❌');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }

    const searchText = search.toLowerCase();

    return data.filter((item) => {
      const companyName = item.company?.name || '';
      const siteName = item.site?.name || '';
      const categoryName = item.category?.name || '';
      const challanNo = item.challanNo || '';

      return (
        companyName.toLowerCase().includes(searchText) ||
        siteName.toLowerCase().includes(searchText) ||
        categoryName.toLowerCase().includes(searchText) ||
        challanNo.toLowerCase().includes(searchText)
      );
    });
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfFirst = (currentPage - 1) * itemsPerPage;

  const currentData = filteredData.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalBuyingQuantity = filteredData.reduce(
    (sum, item) => sum + Number(item.buyingQuantity || 0),
    0,
  );

  const totalSellingQuantity = filteredData.reduce(
    (sum, item) => sum + Number(item.sellingQuantity || 0),
    0,
  );

  const totalCost = filteredData.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);

  const totalSales = filteredData.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);

  const totalProfit = filteredData.reduce((sum, item) => sum + Number(item.profit || 0), 0);

  const exportExcel = () => {
    const rows = filteredData.map((item, index) => ({
      '#': index + 1,
      Date: formatDate(item.date),
      Company: item.company?.name || '-',
      'Site Name': item.site?.name || '-',
      Item: item.category?.name || '-',
      'Challan No': item.challanNo || '-',
      'Buying Qty': Number(item.buyingQuantity || 0),
      'Buying Price/cft': Number(item.buyingPricePerCft || 0),
      'Rent Cost': Number(item.rentCost || 0),
      'Labour Cost': Number(item.labourCost || 0),
      'Other Cost': Number(item.otherCost || 0),
      'Selling Qty': Number(item.sellingQuantity || 0),
      'Selling Price/cft': Number(item.contract?.rate || 0),
      'Total Cost': Number(item.totalCost || 0),
      'Total Sales': Number(item.totalPrice || 0),
      Profit: Number(item.profit || 0),
    }));

    rows.push({
      '#': '',
      Date: '',
      Company: '',
      'Site Name': '',
      Item: '',
      'Challan No': 'Total',
      'Buying Qty': totalBuyingQuantity,
      'Buying Price/cft': 0,
      'Rent Cost': 0,
      'Labour Cost': 0,
      'Other Cost': 0,
      'Selling Qty': totalSellingQuantity,
      'Selling Price/cft': 0,
      'Total Cost': totalCost,
      'Total Sales': totalSales,
      Profit: totalProfit,
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Selling Report');

    const buffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    saveAs(new Blob([buffer]), 'selling_report.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Monsur Enterprises', pageWidth / 2, 15, {
      align: 'center',
    });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Selling Report', pageWidth / 2, 23, {
      align: 'center',
    });

    doc.setFontSize(10);
    doc.text(`From: ${filter.start_date || '-'}`, 14, 33);
    doc.text(`To: ${filter.end_date || '-'}`, 14, 39);

    doc.setFont('helvetica', 'bold');
    doc.text(`Total Sales: ${totalSales.toFixed(2)}`, 14, 45);
    doc.text(`Total Cost: ${totalCost.toFixed(2)}`, 80, 45);
    doc.text(`Total Profit: ${totalProfit.toFixed(2)}`, 145, 45);

    const rows = filteredData.map((item, index) => [
      index + 1,
      formatDate(item.date),
      item.company?.name || '-',
      item.site?.name || '-',
      item.category?.name || '-',
      item.challanNo || '-',
      Number(item.buyingQuantity || 0),
      Number(item.buyingPricePerCft || 0),
      Number(item.rentCost || 0),
      Number(item.labourCost || 0),
      Number(item.otherCost || 0),
      Number(item.sellingQuantity || 0),
      Number(item.contract?.rate || 0),
      Number(item.totalCost || 0),
      Number(item.totalPrice || 0),
      Number(item.profit || 0),
    ]);

    autoTable(doc, {
      startY: 53,
      head: [
        [
          '#',
          'Date',
          'Company',
          'Site',
          'Item',
          'Challan',
          'Buy Qty',
          'Buy Price',
          'Rent',
          'Labour',
          'Other',
          'Sell Qty',
          'Sell Price',
          'Total Cost',
          'Total Sales',
          'Profit',
        ],
      ],
      body: rows,
      foot: [
        [
          '',
          '',
          '',
          '',
          '',
          'Total',
          totalBuyingQuantity.toFixed(2),
          '',
          '',
          '',
          '',
          totalSellingQuantity.toFixed(2),
          '',
          totalCost.toFixed(2),
          totalSales.toFixed(2),
          totalProfit.toFixed(2),
        ],
      ],
      footStyles: {
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7,
      },
      headStyles: {
        fontSize: 7,
      },
    });

    doc.save('selling_report.pdf');
  };

  return (
    <div className="mx-auto max-w-7xl px-4">
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap justify-center gap-4">
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
          <div className="mb-4 grid gap-4 text-center md:grid-cols-3">
            <div className="rounded border bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-xl font-bold text-green-700">{totalSales.toFixed(2)}</p>
            </div>

            <div className="rounded border bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-xl font-bold text-red-700">{totalCost.toFixed(2)}</p>
            </div>

            <div className="rounded border bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Total Profit</p>
              <p
                className={`text-xl font-bold ${
                  totalProfit < 0 ? 'text-red-700' : 'text-green-700'
                }`}
              >
                {totalProfit.toFixed(2)}
              </p>
            </div>
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
              placeholder="Search by company, site, item, challan..."
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
                    'Company',
                    'Site',
                    'Item',
                    'Challan',
                    'Buy Qty',
                    'Buy Price',
                    'Rent',
                    'Labour',
                    'Other',
                    'Sell Qty',
                    'Sell Price',
                    'Total Cost',
                    'Total Sales',
                    'Profit',
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

                    <td className="border px-2 py-1">{item.company?.name || '-'}</td>

                    <td className="border px-2 py-1">{item.site?.name || '-'}</td>

                    <td className="border px-2 py-1">{item.category?.name || '-'}</td>

                    <td className="border px-2 py-1">{item.challanNo || '-'}</td>

                    <td className="border px-2 py-1">{Number(item.buyingQuantity || 0)}</td>

                    <td className="border px-2 py-1">{Number(item.buyingPricePerCft || 0)}</td>

                    <td className="border px-2 py-1">{Number(item.rentCost || 0)}</td>

                    <td className="border px-2 py-1">{Number(item.labourCost || 0)}</td>

                    <td className="border px-2 py-1">{Number(item.otherCost || 0)}</td>

                    <td className="border px-2 py-1">{Number(item.sellingQuantity || 0)}</td>

                    <td className="border px-2 py-1">{Number(item.contract?.rate || 0)}</td>

                    <td className="border px-2 py-1">{Number(item.totalCost || 0)}</td>

                    <td className="border px-2 py-1">{Number(item.totalPrice || 0)}</td>

                    <td
                      className={`border px-2 py-1 font-semibold ${
                        Number(item.profit || 0) < 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {Number(item.profit || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>

              {filteredData.length > 0 && (
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td colSpan={6} className="border px-2 py-1 text-right">
                      Total
                    </td>

                    <td className="border px-2 py-1">{totalBuyingQuantity.toFixed(2)}</td>

                    <td className="border px-2 py-1"></td>
                    <td className="border px-2 py-1"></td>
                    <td className="border px-2 py-1"></td>
                    <td className="border px-2 py-1"></td>

                    <td className="border px-2 py-1">{totalSellingQuantity.toFixed(2)}</td>

                    <td className="border px-2 py-1"></td>

                    <td className="border px-2 py-1">{totalCost.toFixed(2)}</td>

                    <td className="border px-2 py-1">{totalSales.toFixed(2)}</td>

                    <td
                      className={`border px-2 py-1 font-bold ${
                        totalProfit < 0 ? 'text-red-700' : 'text-green-700'
                      }`}
                    >
                      {totalProfit.toFixed(2)}
                    </td>
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

export default SellingReport;
