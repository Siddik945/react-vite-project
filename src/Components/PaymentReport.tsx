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
  name?: string;
  company_name?: string;
  title?: string;
}

interface PaymentMethod {
  id?: number;
  name?: string;
  title?: string;
  method_name?: string;
}

interface PaymentItem {
  id: number;
  date: string;
  amount: number;
  method?: string | PaymentMethod | null;
}

const API_BASE_URL = 'http://localhost:3000';

const PaymentReport = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  const [price, setPrice] = useState(0);
  const [payment, setPayment] = useState(0);
  const [totalDue, setTotalDue] = useState(0);

  const [loading, setLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [filter, setFilter] = useState<FilterItem>({
    companyId: '',
    start_date: '',
    end_date: '',
  });

  const getCompanyName = (company: CompanyItem) => {
    return company.name || company.company_name || company.title || `Company ${company.id}`;
  };

  const selectedCompany = useMemo(() => {
    return companies.find((company) => String(company.id) === filter.companyId);
  }, [companies, filter.companyId]);

  const selectedCompanyName = selectedCompany ? getCompanyName(selectedCompany) : '-';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  const formatDate = (value: string) => {
    if (!value) return '';

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
      return value;
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const getMethodName = (method: PaymentItem['method']) => {
    if (!method) return '-';

    if (typeof method === 'string') {
      return method;
    }

    return method.name || method.method_name || method.title || '-';
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/companies`);

        if (!res.ok) {
          throw new Error('Failed to fetch companies');
        }

        const data = await res.json();

        const companyList: CompanyItem[] = Array.isArray(data)
          ? data
          : data?.data || data?.companies || [];

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

      // Date filter only payment list er jonno
      if (filter.start_date) {
        params.append('start_date', filter.start_date);
      }

      if (filter.end_date) {
        params.append('end_date', filter.end_date);
      }

      const paymentListUrl = `${API_BASE_URL}/payments/company/${filter.companyId}?${params.toString()}`;

      // Total Price and Total Payment date diye filter hobe na
      const totalPriceUrl = `${API_BASE_URL}/product-details/company/${filter.companyId}/summary`;
      const totalPaymentUrl = `${API_BASE_URL}/payments/company/${filter.companyId}/total`;

      const [paymentListRes, totalPriceRes, totalPaymentRes] = await Promise.all([
        fetch(paymentListUrl),
        fetch(totalPriceUrl),
        fetch(totalPaymentUrl),
      ]);

      if (!paymentListRes.ok) {
        throw new Error('Failed to fetch payment list');
      }

      if (!totalPriceRes.ok) {
        throw new Error('Failed to fetch total price');
      }

      if (!totalPaymentRes.ok) {
        throw new Error('Failed to fetch total payment');
      }

      const paymentListData = await paymentListRes.json();
      const totalPriceData = await totalPriceRes.json();
      const totalPaymentData = await totalPaymentRes.json();

      const paymentList: PaymentItem[] = Array.isArray(paymentListData)
        ? paymentListData
        : paymentListData?.data || [];

      const companyTotalPrice = Number(
        totalPriceData?.data?.totalPrice ||
          totalPriceData?.totalPrice ||
          totalPriceData?.total_price ||
          0,
      );

      const companyTotalPayment = Number(
        totalPaymentData?.data?.totalPaid ||
          totalPaymentData?.totalPaid ||
          totalPaymentData?.total_payment ||
          0,
      );

      setPayments(paymentList);
      setPrice(companyTotalPrice);
      setPayment(companyTotalPayment);
      setTotalDue(companyTotalPrice - companyTotalPayment);
    } catch (error) {
      console.error(error);
      alert('Error fetching data ❌');

      setPayments([]);
      setPrice(0);
      setPayment(0);
      setTotalDue(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return payments;
  }, [payments]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const exportExcel = () => {
    const excelData = filteredData.map((item, index) => ({
      SL: index + 1,
      Company: selectedCompanyName,
      Date: formatDate(item.date),
      Method: getMethodName(item.method),
      Amount: Number(item.amount || 0),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Payment Report');

    const buffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    saveAs(new Blob([buffer]), 'monsur-payment-report.xlsx');
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
    doc.text('Payment Details Report', pageWidth / 2, 25, {
      align: 'center',
    });

    doc.setFontSize(10);
    doc.text(`Company: ${selectedCompanyName}`, 14, 35);
    doc.text(`Starting Date: ${filter.start_date || '-'}`, 14, 40);
    doc.text(`Ending Date: ${filter.end_date || '-'}`, 14, 45);

    doc.setFont('helvetica', 'bold');
    doc.text(`Total Price: ${price}`, 14, 50);
    doc.text(`Total Payment: ${payment}`, 14, 55);
    doc.text(`Total Due: ${totalDue}`, 14, 60);

    const rows = filteredData.map((item, index) => [
      index + 1,
      formatDate(item.date),
      getMethodName(item.method),
      Number(item.amount || 0),
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['#', 'Date', 'Method', 'Amount']],
      body: rows,
    });

    doc.save('monsur-payment-report.pdf');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 text-center">
      <h2 className="mb-4 text-2xl font-bold">Payment Summary</h2>

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
              {getCompanyName(company)}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="start_date"
          value={filter.start_date}
          onChange={handleChange}
          className="border p-2"
        />

        <input
          type="date"
          name="end_date"
          value={filter.end_date}
          onChange={handleChange}
          className="border p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>

      <div className="mb-4">
        <p className="text-left text-lg">
          Company: <span className="font-semibold">{selectedCompanyName}</span>
        </p>

        <p className="text-left text-lg">Total Price: {price}</p>

        <p className="text-left text-lg">Payment: {payment}</p>

        <p className="text-left text-xl font-semibold text-red-500">Total Due: {totalDue}</p>
      </div>

      {isSubmit && filteredData.length > 0 && (
        <div className="mt-2 mb-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={exportExcel}
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Excel
          </button>

          <button
            type="button"
            onClick={exportPDF}
            className="rounded bg-red-600 px-4 py-2 text-white"
          >
            PDF
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              {['#', 'Date', 'Method', 'Amount'].map((head) => (
                <th key={head} className="border px-2 py-1">
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentData.map((item, index) => (
              <tr key={item.id}>
                <td className="border px-2 py-1">{indexOfFirst + index + 1}</td>

                <td className="border px-2 py-1">{formatDate(item.date)}</td>

                <td className="border px-2 py-1">{getMethodName(item.method)}</td>

                <td className="border px-2 py-1">{Number(item.amount || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentData.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>

          <span className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold shadow-sm">
            {currentPage} / {totalPages || 1}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {isSubmit && filteredData.length === 0 && !loading && (
        <p className="mt-4 text-center">No data found</p>
      )}
    </div>
  );
};

export default PaymentReport;
