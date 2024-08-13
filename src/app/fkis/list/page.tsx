// src/app/fkis/list.tsx
"use client"
import { useEffect, useState } from "react";
import axios from "axios";

type KeteranganKehadiran = {
  _id: string;
  name: string;
  status: {
    izin: boolean;
    sakit: boolean;
  };
  keterangan: string;
  submittedAt: string;
};

const FkisListPage = () => {
  const [data, setData] = useState<KeteranganKehadiran[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/fkis");
        setData(response.data.data);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Data Keterangan Kehadiran</h1>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Izin</th>
            <th className="border px-4 py-2">Sakit</th>
            <th className="border px-4 py-2">Keterangan</th>
            <th className="border px-4 py-2">Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry._id}>
              <td className="border px-4 py-2">{entry.name}</td>
              <td className="border px-4 py-2">{entry.status.izin ? "Yes" : "No"}</td>
              <td className="border px-4 py-2">{entry.status.sakit ? "Yes" : "No"}</td>
              <td className="border px-4 py-2">{entry.keterangan}</td>
              <td className="border px-4 py-2">{new Date(entry.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FkisListPage;
