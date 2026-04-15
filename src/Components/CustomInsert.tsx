import { useState } from 'react';

interface Business {
  date: string;
  side_name: string;
  item: string;
  challen_no: string;
  buying_quantity: number | '';
  buying_price: number | '';
  labor_cost: number | '';
  extra_cost: number | '';
  selling_price_per_cft: number | '';
  selling_quantity: number | '';
}

const CustomInsert = () => {
  const [form, setForm] = useState<Business>({
    date: '',
    side_name: '',
    item: '',
    challen_no: '',
    buying_quantity: '',
    buying_price: '',
    labor_cost: '',
    extra_cost: '',
    selling_price_per_cft: '',
    selling_quantity: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name.includes('quantity') || name.includes('price') || name.includes('cost')
          ? value === ''
            ? ''
            : Number(value)
          : value,
    }));
  };

  // ✅ handleSubmit added
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      // const data = await res.json();
      // console.log('Success:', data);

      alert('Data inserted successfully ✅');

      // reset form
      setForm({
        date: '',
        side_name: '',
        item: '',
        challen_no: '',
        buying_quantity: '',
        buying_price: '',
        labor_cost: '',
        extra_cost: '',
        selling_price_per_cft: '',
        selling_quantity: '',
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong ❌');
    }
  };

  return (
    <div className="mx-auto max-w-2xl pt-20">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Date */}
        <div>
          <label className="mb-1 block">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border p-2"
            placeholder="date"
            required
          />
        </div>

        {/* Side Name */}
        <div>
          <label className="mb-1 block">Side Name</label>
          <input
            type="text"
            name="side_name"
            value={form.side_name}
            onChange={handleChange}
            placeholder="Enter side name"
            className="w-full border p-2"
            required
          />
        </div>

        {/* Item */}
        <div>
          <label className="mb-1 block">Item</label>
          <input
            type="text"
            name="item"
            value={form.item}
            onChange={handleChange}
            placeholder="Enter item name"
            className="w-full border p-2"
            required
          />
        </div>

        {/* Challen */}
        <div>
          <label className="mb-1 block">Challen No</label>
          <input
            type="text"
            name="challen_no"
            value={form.challen_no}
            onChange={handleChange}
            placeholder="Enter challen number"
            className="w-full border p-2"
            required
          />
        </div>

        {/* Buying Quantity */}
        <div>
          <label className="mb-1 block">Buying Quantity</label>
          <input
            type="number"
            name="buying_quantity"
            value={form.buying_quantity}
            onChange={handleChange}
            placeholder="e.g. 100"
            className="w-full border p-2"
            required
          />
        </div>

        {/* Buying Price */}
        <div>
          <label className="mb-1 block">Buying Price</label>
          <input
            type="number"
            name="buying_price"
            value={form.buying_price}
            onChange={handleChange}
            placeholder="e.g. 100"
            className="w-full border p-2"
            required
          />
        </div>

        {/* Labor Cost */}
        <div>
          <label className="mb-1 block">Labor Cost</label>
          <input
            type="number"
            name="labor_cost"
            value={form.labor_cost}
            onChange={handleChange}
            placeholder="e.g. 100"
            className="w-full border p-2"
          />
        </div>

        {/* Extra Cost */}
        <div>
          <label className="mb-1 block">Extra Cost</label>
          <input
            type="number"
            name="extra_cost"
            value={form.extra_cost}
            onChange={handleChange}
            placeholder="e.g. 100"
            className="w-full border p-2"
          />
        </div>

        {/* Selling Quantity */}
        <div>
          <label className="mb-1 block">Selling Quantity</label>
          <input
            type="number"
            name="selling_quantity"
            value={form.selling_quantity}
            onChange={handleChange}
            placeholder="e.g. 100"
            className="w-full border p-2"
            required
          />
        </div>

        {/* Selling Price */}
        <div>
          <label className="mb-1 block">Selling Price per CFT</label>
          <input
            type="number"
            name="selling_price_per_cft"
            value={form.selling_price_per_cft}
            onChange={handleChange}
            placeholder="e.g. 100"
            className="w-full border p-2"
            required
          />
        </div>

        {/* Button full width */}
        <div className="col-span-1 flex justify-center md:col-span-2">
          <button className="w-full rounded bg-blue-500 px-6 py-2 text-white md:w-auto">
            Submit Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomInsert;
