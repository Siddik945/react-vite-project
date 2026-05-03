import { useEffect, useState } from 'react';

type Category = {
  id: number;
  name: string;
  description?: string;
};

const ProductCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/product-categories');
      const data = await response.json();

      if (Array.isArray(data)) {
        setCategories(data);
      } else if (Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error(error);
      setMessage('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const url = editId
        ? `http://localhost:3000/product-categories/${editId}`
        : 'http://localhost:3000/product-categories';

      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(editId ? 'Category updated successfully.' : 'Category created successfully.');

      setFormData({
        name: '',
        description: '',
      });

      setEditId(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this category?');
    console.log(confirmDelete);

    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/product-categories/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      setMessage('Category deleted successfully.');
      fetchCategories();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Product Categories</h1>

      <form onSubmit={handleSubmit} className="mb-8 max-w-2xl space-y-5">
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Category Name"
          required
          className="w-full rounded-lg border px-4 py-3"
        />

        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description"
          className="w-full rounded-lg border px-4 py-3"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white disabled:bg-slate-400"
          >
            {loading ? 'Saving...' : editId ? 'Update Category' : 'Create Category'}
          </button>

          {editId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg bg-slate-500 px-6 py-3 font-semibold text-white"
            >
              Cancel
            </button>
          )}
        </div>

        {message && <p className="text-sm font-medium">{message}</p>}
      </form>

      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Description</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.description || '-'}</td>
              <td className="flex gap-2 p-3">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Update
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductCategories;
