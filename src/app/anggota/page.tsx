"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import logo from '@/public/logo.png';
import Image from "next/image";

interface PendaftaranKIR {
  _id: string;
  name: string;
  phoneNumber: string;
  class: string;
  agreement: boolean;
  alasan: string;
  eskul: string[];
}

const dateFromObjectId = (objectId: string) => {
  return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const AnggotaPage = () => {
  const [anggota, setAnggota] = useState<PendaftaranKIR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState({
    _id: "",
    name: "",
    phoneNumber: "",
    class: "",
    alasan: "",
    eskul: "",
    timestamp: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api");
        setAnggota(response.data.data);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof searchQueries
  ) => {
    setSearchQueries({
      ...searchQueries,
      [field]: e.target.value,
    });
  };

  const downloadExcel = (data: PendaftaranKIR[]) => {
    const transformedData = data.map((item) => {
      const date = dateFromObjectId(item._id);
      return {
        DATABASE_ID: item._id,
        NAMA_LENGKAP: item.name,
        NOMOR_TELEPON: item.phoneNumber,
        KELAS: item.class,
        PERSETUJUAN: item.agreement,
        ALASAN: item.alasan,
        ESKUL_SELAIN_KIR: item.eskul.join(", "), // Convert array to string
        TIMESTAMP_DATE: formatDate(date),
        TIMESTAMP_TIME: formatTime(date),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(transformedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pendaftaran KIR");
    XLSX.writeFile(workbook, "pendaftaran_kir.xlsx");
  };

  const filteredAnggota = anggota.filter((member) => {
    const date = dateFromObjectId(member._id);
    const timestamp = `${formatDate(date)} ${formatTime(date)}`.toLowerCase();
    return (
      member._id.toLowerCase().includes(searchQueries._id.toLowerCase()) &&
      member.name.toLowerCase().includes(searchQueries.name.toLowerCase()) &&
      member.phoneNumber.toLowerCase().includes(searchQueries.phoneNumber.toLowerCase()) &&
      member.class.toLowerCase().includes(searchQueries.class.toLowerCase()) &&
      member.alasan.toLowerCase().includes(searchQueries.alasan.toLowerCase()) &&
      member.eskul.join(", ").toLowerCase().includes(searchQueries.eskul.toLowerCase()) &&
      timestamp.includes(searchQueries.timestamp.toLowerCase())
    );
  });

  const filteredAnggotas = anggota.filter((member) => {
    const fullName = member.name.toLowerCase();
    const phoneNumber = member.phoneNumber.toLowerCase();
    const classField = member.class.toLowerCase();
    const alasan = member.alasan.toLowerCase();
    const eskul = member.eskul.join(", ").toLowerCase();
    const timestamp = `${formatDate(dateFromObjectId(member._id))} ${formatTime(dateFromObjectId(member._id))}`.toLowerCase();
    const searchTerm = searchQuery.toLowerCase();
  
    return (
      fullName.includes(searchTerm) ||
      phoneNumber.includes(searchTerm) ||
      classField.includes(searchTerm) ||
      alasan.includes(searchTerm) ||
      eskul.includes(searchTerm) ||
      timestamp.includes(searchTerm)
    );
  })

  function getFirstName(fullName: String) {
    // Handle edge cases (empty string, single word)
    if (!fullName || !fullName.trim()) {
      return "";
    }
  
    // Split on whitespace, considering multiple spaces and non-breaking spaces
    const nameParts = fullName.trim().split(/\s+/);
  
    // Return the first non-empty part (handles names with leading/trailing spaces)
    return nameParts.find(part => part) || "";
  }


  const handleSearchChangecard = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
       <Image
                alt="logo"
                src={logo}
                width={200}
                height={200}
                style={{ backgroundColor: "#383433" }}
                className="mx-auto my-5 rounded-full aspect-square object-contain"
            />
      <h1 className="text-2xl font-bold mt-2 mb-2 text-center">Data Anggota KIR</h1>
      <p className="text-center mb-8">There are <span className="underline">{anggota.length}</span> registered students in the kir-mate database.</p>
      <div className="flex justify-left mb-4">
      <button
  onClick={() => downloadExcel(viewMode === 'table' ? filteredAnggota : filteredAnggotas)}
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
>
  Export to XLS
</button>

        <button
          onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
          className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {viewMode === "table" ? "View as Cards" : "View as Table"}
        </button>
      </div>
      <div className="overflow-x-auto">
        {viewMode === "table" ? (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">No</th>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Nama</th>
                <th className="py-2 px-4 border-b">Nomor Telepon</th>
                <th className="py-2 px-4 border-b">Kelas</th>
                <th className="py-2 px-4 border-b">Alasan</th>
                <th className="py-2 px-4 border-b">Eskul (Selain KIR)</th>
                <th className="py-2 px-4 border-b">Timestamp</th>
              </tr>
              <tr>
                <th className="py-2 px-4 border-b"></th>
                <th className="py-2 px-4 border-b">
                  <input
                    type="text"
                    value={searchQueries._id}
                    onChange={(e) => handleSearchChange(e, "_id")}
                    className="w-full px-2 py-1 border rounded"
                    placeholder="Search ID"
                  />
                </th>
                <th className="py-2 px-4 border-b">
                  <input
                    type="text"
                    value={searchQueries.name}
                    onChange={(e) => handleSearchChange(e, "name")}
                    className="w-full px-2 py-1 border rounded"
                    placeholder="Search Name"
                  />
                </th>
                <th className="py-2 px-4 border-b">
                  <input
                    type="text"
                    value={searchQueries.phoneNumber}
                    onChange={(e) => handleSearchChange(e, "phoneNumber")}
                    className="w-full px-2 py-1 border rounded"
                    placeholder="Search Phone Number"
                  />
                </th>
                <th className="py-2 px-4 border-b">
                  <input
                    type="text"
                    value={searchQueries.class}
                    onChange={(e) => handleSearchChange(e, "class")}
                    className="w-full px-2 py-1 border rounded"
                    placeholder="Search Class"
                  />
                </th>
                <th className="py-2 px-4 border-b">
                  <input
                    type="text"
                    value={searchQueries.alasan}
                    onChange={(e) => handleSearchChange(e, "alasan")}
                    className="w-full px-2 py-1 border rounded"
                    placeholder="Search Alasan"
                  />
                </th>
                <th className="py-2 px-4 border-b">
                  <input
                    type="text"
                    value={searchQueries.eskul}
                    onChange={(e) => handleSearchChange(e, "eskul")}
                    className="w-full px-2 py-1 border rounded"
                    placeholder="Search Eskul"
                  />
                </th>
                <th className="py-2 px-4 border-b">
                  <input
                    type="text"
                    value={searchQueries.timestamp}
                    onChange={(e) => handleSearchChange(e, "timestamp")}
                    className="w-full px-2 py-1 border rounded"
                    placeholder="Search Timestamp"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAnggota.map((member, index) => {
                const date = dateFromObjectId(member._id);
                return (
                  <tr key={member._id}>
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">{member._id}</td>
                    <td className="py-2 px-4 border-b">{member.name}</td>
                    <td className="py-2 px-4 border-b">{member.phoneNumber}</td>
                    <td className="py-2 px-4 border-b">{member.class}</td>
                    <td className="py-2 px-4 border-b">{member.alasan}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex flex-wrap">
                        {member.eskul.map((eskul, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-200 rounded-e px-3 py-1 text-sm font-semibold text-gray-700 m-1"
                          >
                            {eskul}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex flex-wrap">
                        <span className="inline-block bg-gray-200 rounded-e px-3 py-1 text-sm font-semibold text-gray-700 m-1">
                          {formatDate(date)}
                        </span>
                        <span className="inline-block bg-gray-200 rounded-e px-3 py-1 text-sm font-semibold text-gray-700 m-1">
                          {formatTime(date)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-wrap justify-center">
            <div className="w-full px-3 mb-6 md:mb-0">
        <input
          className="w-full border rounded-md p-2"
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChangecard}
        />
      </div>
      <div className="flex flex-wrap justify-center">
        {filteredAnggotas.map((member, index) => {
          const date = dateFromObjectId(member._id);
          return (
            <div
              key={member._id}
              className="bg-white rounded-lg shadow-lg p-4 m-2 w-full sm:w-1/2 lg:w-1/3"
            >
              <h2 className="text-2xl font-bold mb-2">{getFirstName(member.name)}</h2>
              {/* <p><strong>ID:</strong> {member._id}</p> */}
              <p><strong>Nama Lengkap:</strong> {member.name}</p>
              <p><strong>Nomor Telepon:</strong> {member.phoneNumber}</p>
              <p><strong>Kelas:</strong> {member.class}</p>
              <p><strong>Alasan:</strong> {member.alasan}</p>
              {member.eskul.length > 0 && (
  <>
    <p><strong>Eskul (Selain KIR):</strong></p>
    <div className="flex flex-wrap">
      {member.eskul.map((eskul, index) => (
        <span
          key={index}
          className="inline-block bg-gray-200 rounded-e px-3 py-1 text-sm font-semibold text-gray-700 m-1"
        >
          {eskul}
        </span>
      ))}
    </div>
  </>
)}

              <div className="mt-2">
                <div className="inline-block bg-gray-200 rounded-lg px-3 py-1 text-sm font-semibold text-gray-700 m-1">
                  {formatDate(date)}
                </div>
                <div className="inline-block bg-gray-200 rounded-lg px-3 py-1 text-sm font-semibold text-gray-700 m-1">
                  {formatTime(date)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnggotaPage;
