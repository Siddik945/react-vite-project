import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FilterItem {
  start_date: string;
  end_date: string;
}

interface DataItem {
  id: number;
  date: string;
  site_name: string;
  item: string;
  challan_no: string;
  selling_price_per_cft: number;
  selling_quantity: number;
  total_selling_price: number;
}

const ClientView = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isSubmit, setIsSubmit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [date, setDate] = useState<FilterItem>({
    start_date: '',
    end_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsSubmit(true);

    try {
      const query = `?startDate=${date.start_date}&endDate=${date.end_date}`;
      const res = await fetch(`http://localhost:5000/ClientView${query}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      // Support both { data: [] } and plain array responses
      setData(Array.isArray(json) ? json : (json.data ?? []));
    } catch (error) {
      alert('Error fetching data ❌');
    } finally {
      setLoading(false);
    }
  };

  // Filter by site name
  const filteredData = data.filter((item) =>
    item.site_name.toLowerCase().includes(search.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfFirst + itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Totals
  const totalQuantity = filteredData.reduce((sum, r) => sum + r.selling_quantity, 0);
  const totalPrice = filteredData.reduce((sum, r) => sum + r.total_selling_price, 0);

  // Excel Export
  const exportExcel = () => {
    const rows = filteredData.map((r, i) => ({
      '#': i + 1,
      Date: formatDate(r.date),
      'Site Name': r.site_name,
      Item: r.item,
      'Challan No': r.challan_no,
      'Quantity (cft)': r.selling_quantity,
      'Price/cft': r.selling_price_per_cft,
      'Total Price': r.total_selling_price,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Client Report');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'client_report.xlsx');
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Monsur Enterprises', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Client Report', pageWidth / 2, 23, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`From: ${date.start_date}`, 14, 33);
    doc.text(`To:   ${date.end_date}`, 14, 39);

    const rows = filteredData.map((r, i) => [
      i + 1,
      formatDate(r.date),
      r.site_name,
      r.item,
      r.challan_no,
      Math.floor(r.selling_quantity),
      Math.floor(r.selling_price_per_cft),
      Math.floor(r.total_selling_price),
    ]);

    autoTable(doc, {
      startY: 47,
      head: [['#', 'Date', 'Site Name', 'Item', 'Challan', 'Qty', 'Price/cft', 'Total']],
      body: rows,
      foot: [['', '', '', '', 'Total', Math.floor(totalQuantity), '', Math.floor(totalPrice)]],
      footStyles: { fontStyle: 'bold' },
    });

    doc.save('client_report.pdf');
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap justify-center gap-4">
        <input
          type="date"
          name="start_date"
          value={date.start_date}
          onChange={handleChange}
          className="border p-2"
          placeholder="date"
          required
        />
        <input
          type="date"
          name="end_date"
          value={date.end_date}
          onChange={handleChange}
          className="border p-2"
          placeholder="date"
          required
        />
        <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white">
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>

      {isSubmit && (
        <>
          {/* Export Buttons */}
          <div className="mb-4 flex justify-center gap-3">
            <button onClick={exportExcel} className="rounded bg-green-600 px-4 py-2 text-white">
              Export Excel
            </button>
            <button onClick={exportPDF} className="rounded bg-red-600 px-4 py-2 text-white">
              Export PDF
            </button>
          </div>

          {/* Search */}
          <div className="mb-4 flex justify-center">
            <input
              type="text"
              placeholder="Search by site name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md border p-2"
            />
          </div>

          {/* Table */}
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
                    'Qty (cft)',
                    'Price/cft',
                    'Total Price',
                  ].map((h) => (
                    <th key={h} className="border px-2 py-1 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    {/* Use global row number, not page-local i */}
                    <td className="border px-2">{indexOfFirst + i + 1}</td>
                    <td className="border px-2">{formatDate(r.date)}</td>
                    <td className="border px-2">{r.site_name}</td>
                    <td className="border px-2">{r.item}</td>
                    <td className="border px-2">{r.challan_no}</td>
                    <td className="border px-2">{r.selling_quantity}</td>
                    <td className="border px-2">{r.selling_price_per_cft}</td>
                    <td className="border px-2">{r.total_selling_price}</td>
                  </tr>
                ))}
              </tbody>
              {/* Summary totals row */}
              {filteredData.length > 0 && (
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td colSpan={5} className="border px-2 py-1 text-right">
                      Total
                    </td>
                    <td className="border px-2">{totalQuantity.toFixed(2)}</td>
                    <td className="border px-2"></td>
                    <td className="border px-2">{totalPrice.toFixed(2)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <span className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* No Data */}
          {filteredData.length === 0 && !loading && (
            <p className="mt-4 text-center text-gray-500">No data found</p>
          )}
        </>
      )}
    </div>
  );
};

export default ClientView;
