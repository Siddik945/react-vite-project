import React, { useEffect, useState } from 'react';

interface CompanySummary {
  companyId: number | string;
  companyName: string;
  totalPrice: number;
  totalPaid: number;
  totalDue: number;
}

const API_BASE_URL = 'http://localhost:3000';

const TotalDue = () => {
  const [data, setData] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(false);

  const getArrayData = (response: any) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.result)) return response.result;
    return [];
  };

  const getCompanyId = (item: any) => {
    return item.companyId || item.company_id || item.id || item.company?.id;
  };

  const getCompanyName = (item: any) => {
    return (
      item.companyName ||
      item.company_name ||
      item.name ||
      item.company?.name ||
      item.company?.company_name ||
      'Unknown Company'
    );
  };

  const grandTotalDue = data.reduce((sum, item) => sum + Number(item.totalDue || 0), 0);

  useEffect(() => {
    const fetchTotalDue = async () => {
      setLoading(true);

      try {
        const [priceRes, paidRes] = await Promise.all([
          fetch(`${API_BASE_URL}/product-details/allCompany/summary`),
          fetch(`${API_BASE_URL}/payments/allCompany/summary`),
        ]);

        if (!priceRes.ok) {
          throw new Error('Failed to fetch total price summary');
        }

        if (!paidRes.ok) {
          throw new Error('Failed to fetch total paid summary');
        }

        const priceJson = await priceRes.json();
        const paidJson = await paidRes.json();

        const priceList = getArrayData(priceJson);
        const paidList = getArrayData(paidJson);

        const paidMap = new Map<string, any>();

        paidList.forEach((item: any) => {
          const companyId = String(getCompanyId(item));
          paidMap.set(companyId, item);
        });

        const mergedData: CompanySummary[] = priceList.map((priceItem: any) => {
          const companyId = getCompanyId(priceItem);
          const paidItem = paidMap.get(String(companyId));

          const totalPrice = Number(
            priceItem.totalPrice || priceItem.total_price || priceItem.price || 0,
          );

          const totalPaid = Number(
            paidItem?.totalPaid ||
              paidItem?.total_paid ||
              paidItem?.totalPayment ||
              paidItem?.total_payment ||
              0,
          );

          return {
            companyId,
            companyName: getCompanyName(priceItem),
            totalPrice,
            totalPaid,
            totalDue: totalPrice - totalPaid,
          };
        });

        setData(mergedData);
      } catch (error) {
        console.error(error);
        alert('Error fetching total due data ❌');
      } finally {
        setLoading(false);
      }
    };

    fetchTotalDue();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <h1 className="mb-6 text-center text-2xl font-bold">Total Due</h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">#</th>
                <th className="border px-3 py-2">Company Name</th>
                <th className="border px-3 py-2">Total Price</th>
                <th className="border px-3 py-2">Total Paid</th>
                <th className="border px-3 py-2">Total Due</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr key={item.companyId}>
                  <td className="border px-3 py-2 text-center">{index + 1}</td>

                  <td className="border px-3 py-2">{item.companyName}</td>

                  <td className="border px-3 py-2 text-right">{item.totalPrice}</td>

                  <td className="border px-3 py-2 text-right">{item.totalPaid}</td>

                  <td className="border px-3 py-2 text-right font-semibold text-red-600">
                    {item.totalDue}
                  </td>
                </tr>
              ))}

              {data.length > 0 && (
                <tr className="bg-gray-100 font-bold">
                  <td className="border px-3 py-2 text-center" colSpan={4}>
                    Total Due
                  </td>

                  <td className="border px-3 py-2 text-right text-red-700">{grandTotalDue}</td>
                </tr>
              )}

              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="border px-3 py-4 text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TotalDue;
