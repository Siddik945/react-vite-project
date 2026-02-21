import { Table, type Column } from './Component/Table.tsx';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Editor';
}

export default function App() {
  const data: User[] = [
    { id: 1, name: 'Siddik', email: 'siddik@gmail.com', role: 'Admin' },
    { id: 2, name: 'Rahim', email: 'rahim@gmail.com', role: 'User' },
    { id: 3, name: 'Karim', email: 'karim@gmail.com', role: 'Editor' },
    { id: 4, name: 'Hasan', email: 'hasan@gmail.com', role: 'User' },
    { id: 5, name: 'Arif', email: 'arif@gmail.com', role: 'Admin' },
    { id: 6, name: 'Jamal', email: 'jamal@gmail.com', role: 'User' },
  ];

  const columns: Column<User>[] = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <span
          className={`rounded px-2 py-1 text-xs ${
            row.role === 'Admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.role}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <button
          onClick={() => alert(row.name)}
          className="rounded bg-indigo-500 px-3 py-1 text-xs text-white"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="p-8">
      <Table<User> columns={columns} data={data} pageSize={3} />
    </div>
  );
}
