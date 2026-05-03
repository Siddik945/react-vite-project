// import React, { use, useEffect, useState } from 'react';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// interface filterItem {
//   company: string;
//   start_date: string;
//   end_date: string;
// }

// const PaymentReport = () => {
//   const [price, setPrice] = useState(0);
//   const [payment, setPayment] = useState(0);
//   const [totalDue, setTotalDue] = useState(0);
//   const [isActive, setIsActive] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState('');
//   const [isSubmit, setIsSubmit] = useState(false);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 7;

//   const [date, setDate] = useState<filterItem>({
//     company: '',
//     start_date: '',
//     end_date: '',
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setDate({ ...date, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setIsSubmit(true);

//     try {
//       const query = `?startDate=${date.start_date}&endDate=${date.end_date}`;
//       const res = await fetch(`http://localhost:3000/getPayments${query}`);
//       const data = await res.json();
//       setReport(data);
//       //   console.log(data);
//       //   console.log(report);
//     } catch (error) {
//       alert('Error fetching data ❌');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔍 Filter
//   const filteredData = report.data;

//   // 📄 Pagination
//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentData = filteredData.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search]);

//   // 📊 Excel Export
//   const exportExcel = () => {
//     const ws = XLSX.utils.json_to_sheet(filteredData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Report');

//     const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     saveAs(new Blob([buffer]), 'report.xlsx');
//   };

//   const exportPDF = () => {
//     const doc = new jsPDF();

//     // 📌 Page width for center alignment
//     const pageWidth = doc.internal.pageSize.getWidth();

//     // 🏢 Company Name (CENTER)
//     doc.setFontSize(18);
//     doc.setFont('undefined', 'bold');
//     doc.text('Monsur Enterprises', pageWidth / 2, 15, { align: 'center' });

//     // 📄 Report Title (CENTER)
//     doc.setFontSize(14);
//     doc.setFont('undefined', 'normal');
//     doc.text('Payment Details Report', pageWidth / 2, 25, { align: 'center' });

//     // 📅 Info Section (LEFT)
//     doc.setFontSize(10);
//     doc.setFont('undefined', 'normal');
//     doc.text(`Starting Date: ${date.start_date}`, 14, 35);
//     doc.text(`Ending Date: ${date.end_date}`, 14, 40);
//     doc.setFont('undefined', 'bold');
//     doc.text(`Total Due: ${totalDue}`, 14, 45);

//     // 📊 Table Data
//     const rows = filteredData.map((r, i) => [i + 1, formatDate(r.date), r.method, r.amount]);

//     // 📄 Table
//     autoTable(doc, {
//       startY: 55, // push table below header
//       head: [['#', 'Date', 'Method', 'Amount']],
//       body: rows,
//     });

//     // 💾 Save
//     doc.save('monsur-payment-report.pdf');
//   };

//   const formatDate = (date: string) => {
//     const d = new Date(date);

//     const day = String(d.getDate()).padStart(2, '0');
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const year = d.getFullYear();

//     return `${day}-${month}-${year}`;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch Total Price
//         const priceRes = await fetch('http://localhost:3000/totalPrice');
//         const priceData = await priceRes.json();
//         const totalPrice = Number(priceData.total_price || 0);
//         setPrice(totalPrice);

//         // Fetch Payment Sum
//         const paymentRes = await fetch('http://localhost:3000/paymentSum');
//         const paymentData = await paymentRes.json();
//         const totalPayment = Number(paymentData.total_payment || 0);
//         setPayment(totalPayment);

//         // Calculate Due
//         setTotalDue(totalPrice - totalPayment);
//       } catch (error) {
//         console.error(error);
//         alert('Error fetching data ❌');
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="mx-auto max-w-6xl px-4 text-center">
//       <h2 className="mb-4 text-2xl font-bold">Payment Summary</h2>
//       {/* Form */}
//       <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap justify-center gap-4">
//         <input
//           type="company"
//           name="company"
//           onChange={handleChange}
//           className="border p-2"
//           placeholder="company"
//           required
//         />
//         <input
//           type="date"
//           name="start_date"
//           onChange={handleChange}
//           className="border p-2"
//           placeholder="date"
//           required
//         />
//         <input
//           type="date"
//           name="end_date"
//           onChange={handleChange}
//           className="border p-2"
//           placeholder="date"
//           required
//         />
//         <button className="rounded bg-blue-500 px-4 py-2 text-white">
//           {loading ? 'Loading...' : 'Submit'}
//         </button>
//       </form>

//       <p className="text-left text-lg">Total Price: {price}</p>
//       <p className="text-left text-lg">Payment: {payment}</p>
//       <p className="mb-4 text-left text-xl font-semibold text-red-500">Total Due: {totalDue}</p>

//       {/* Export Buttons */}
//       {isSubmit && (
//         <div className="mt-2 mb-2 flex justify-center gap-3">
//           <button onClick={exportExcel} className="rounded bg-green-600 px-4 py-2 text-white">
//             Excel
//           </button>
//           <button onClick={exportPDF} className="rounded bg-red-600 px-4 py-2 text-white">
//             PDF
//           </button>
//         </div>
//       )}

//       {/* Form */}

//       {/* Table */}
//       {/* {isSubmit && ( */}
//       <div className="overflow-x-auto">
//         <table className="w-full border text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               {['#', 'Date', 'Method', 'Amount'].map((h) => (
//                 <th key={h} className="border px-2 py-1">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {currentData.map((r, i) => (
//               <tr key={r.id}>
//                 <td className="border px-2">{i + 1}</td>
//                 <td className="border px-2">{formatDate(r.date)}</td>
//                 <td className="border px-2">{r.method}</td>
//                 <td className="border px-2">{r.amount}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       {/* )} */}
//       {/* Pagination */}
//       {currentData.length > 0 && (
//         <div className="mt-6 flex items-center justify-center gap-3">
//           {/* Prev Button */}
//           <button
//             onClick={() => setCurrentPage((p) => p - 1)}
//             disabled={currentPage === 1}
//             className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             Prev
//           </button>

//           {/* Page Info */}
//           <span className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold shadow-sm">
//             {currentPage} / {totalPages || 1}
//           </span>

//           {/* Next Button */}
//           <button
//             onClick={() => setCurrentPage((p) => p + 1)}
//             disabled={currentPage === totalPages || totalPages === 0}
//             className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       )}
//       {/* No Data */}
//       {filteredData.length === 0 && !loading && <p className="mt-4 text-center">No data found</p>}
//     </div>
//   );
// };

// export default PaymentReport;
