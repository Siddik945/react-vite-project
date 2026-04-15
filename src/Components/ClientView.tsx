import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface filterItem {
  start_date: string;
  end_date: string;
}

interface dataItem {
  id: number;
  date: string;
  side_name: string;
  item: string;
  challen_no: string;
  selling_price_per_cft: number;
  selling_quantity: number;
  total_selling_price: number;
}
interface ReportItem {
  data: dataItem[];
}

const ClientView = () => {
  const [report, setReport] = useState<ReportItem>({
    data: [],
  });

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isSubmit, setIsSubmit] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [date, setDate] = useState<filterItem>({
    start_date: '',
    end_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate({ ...date, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsSubmit(true);

    try {
      const query = `?startDate=${date.start_date}&endDate=${date.end_date}`;
      const res = await fetch(`http://localhost:5000/ClientView${query}`);
      const data = await res.json();
      setReport(data);
      //   console.log(data);
      //   console.log(report);
    } catch (error) {
      alert('Error fetching data ❌');
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filter
  const filteredData = report.data.filter((item) =>
    item.side_name.toLowerCase().includes(search.toLowerCase()),
  );

  // 📄 Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // 📊 Excel Export
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'report.xlsx');
  };

  // 📄 PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 🏢 Company Name (CENTER)
    doc.setFontSize(18);
    doc.setFont('undefined', 'bold');
    doc.text('Monsur Enterprises', pageWidth / 2, 15, { align: 'center' });

    // 📄 Report Title (CENTER)
    doc.setFontSize(14);
    doc.setFont('undefined', 'normal');
    doc.text('Product Details Report', pageWidth / 2, 25, { align: 'center' });

    // 📅 Info Section (LEFT)
    doc.setFontSize(10);
    doc.setFont('undefined', 'normal');
    doc.text(`Starting Date: ${date.start_date}`, 14, 35);
    doc.text(`Ending Date: ${date.end_date}`, 14, 40);

    const rows = filteredData.map((r, i) => [
      i + 1,
      formatDate(r.date),
      r.side_name,
      r.item,
      r.challen_no,
      Math.floor(r.selling_quantity),
      Math.floor(r.selling_price_per_cft),
      Math.floor(r.total_selling_price),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['#', 'Date', 'Side Name', 'Item', 'Challen', 'Quantity', 'Price', 'Total Price']],
      body: rows,
    });

    doc.save('report.pdf');
  };

  const formatDate = (date: string) => {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-20">
      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap justify-center gap-4">
        <input
          type="date"
          name="start_date"
          onChange={handleChange}
          className="border p-2"
          placeholder="date"
          required
        />
        <input
          type="date"
          name="end_date"
          onChange={handleChange}
          className="border p-2"
          placeholder="date"
          required
        />
        <button className="rounded bg-blue-500 px-4 py-2 text-white">
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>

      {/* Export Buttons */}
      {isSubmit && (
        <div className="mb-4 flex justify-center gap-3">
          <button onClick={exportExcel} className="rounded bg-green-600 px-4 py-2 text-white">
            Excel
          </button>
          <button onClick={exportPDF} className="rounded bg-red-600 px-4 py-2 text-white">
            PDF
          </button>
        </div>
      )}

      {/* 🔍 Search */}
      {isSubmit && (
        <div className="mb-4 flex justify-center">
          <input
            type="text"
            placeholder="Search by Side Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border p-2"
          />
        </div>
      )}
      {/* Table */}
      {isSubmit && (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                {[
                  '#',
                  'Date',
                  'Side Name',
                  'Item',
                  'Challen no',
                  'Quantity',
                  'Price',
                  'Total Price',
                ].map((h) => (
                  <th key={h} className="border px-2 py-1">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((r, i) => (
                <tr key={r.id}>
                  <td className="border px-2">{i + 1}</td>
                  <td className="border px-2">{formatDate(r.date)}</td>
                  <td className="border px-2">{r.side_name}</td>
                  <td className="border px-2">{r.item}</td>
                  <td className="border px-2">{r.challen_no}</td>

                  <td className="border px-2">{r.selling_quantity}</td>
                  <td className="border px-2">{r.selling_price_per_cft}</td>
                  <td className="border px-2">{r.total_selling_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      {currentData.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {/* Prev Button */}
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>

          {/* Page Info */}
          <span className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold shadow-sm">
            {currentPage} / {totalPages || 1}
          </span>

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      {/* No Data */}
      {filteredData.length === 0 && !loading && <p className="mt-4 text-center">No data found</p>}
    </div>
  );
};

export default ClientView;
