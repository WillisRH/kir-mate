"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow, parseISO, format as formatDateFns } from 'date-fns'; // Import additional date-fns functions
import logo from '@/public/logofull.png';
import Image from "next/image";

type KeteranganKehadiran = {
  _id: string;
  name: string;
  class: string;
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
  const [sortOption, setSortOption] = useState<string>("submittedAt");
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const aggregateData = (data: KeteranganKehadiran[]) => {
    const aggregated: { [key: string]: { countIzin: number; countSakit: number; class: string; keterangan: string; submittedAt: string; details: KeteranganKehadiran[] } } = {};

    data.forEach(item => {
      if (!aggregated[item.name]) {
        aggregated[item.name] = { countIzin: 0, countSakit: 0, class: item.class, keterangan: item.keterangan, submittedAt: item.submittedAt, details: [] };
      }
      if (item.status.izin) aggregated[item.name].countIzin += 1;
      if (item.status.sakit) aggregated[item.name].countSakit += 1;
      aggregated[item.name].details.push(item);
    });

    return Object.keys(aggregated).map(name => ({
      name,
      class: aggregated[name].class,
      countIzin: aggregated[name].countIzin,
      countSakit: aggregated[name].countSakit,
      keterangan: aggregated[name].keterangan,
      submittedAt: aggregated[name].submittedAt,
      details: aggregated[name].details,
    }));
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    const relativeTime = formatDistanceToNow(date, { addSuffix: true });
    const exactDate = formatDateFns(date, 'dd/MM/yyyy');
    return `${relativeTime} (${exactDate})`; // Combine both relative time and exact date
  };

  const sortData = (data: any[]) => {
    switch (sortOption) {
      case "name":
        return data.sort((a, b) => a.name.localeCompare(b.name));
      case "class":
        return data.sort((a, b) => a.class.localeCompare(b.class));
      case "submittedAt":
        return data.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
      default:
        return data;
    }
  };

  const handleRowClick = (name: string) => {
    setExpandedName(expandedName === name ? null : name);
  };

  const downloadExcel = () => {
    const transformedData = data.map((item) => ({
      ID: item._id,
      Nama: item.name,
      Kelas: item.class,
      Izin: item.status.izin ? "Yes" : "No",
      Sakit: item.status.sakit ? "Yes" : "No",
      Keterangan: item.keterangan,
      "Submitted At": formatDate(item.submittedAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(transformedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Keterangan Kehadiran");
    XLSX.writeFile(workbook, "keterangan_kehadiran.xlsx");
  };

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  const aggregatedData = sortData(aggregateData(data)).filter(entry =>
    entry.name.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
      <Image
        alt="logo"
        src={logo}
        width={200}
        height={200}
        style={{ backgroundColor: "#383433" }}
        className="mx-auto my-5 rounded-full aspect-square object-contain"
      />
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Data Keterangan Kehadiran</h1>
      <p className="text-center mb-8">Bagian ini untuk melihat laporan FKIS (Formulir Keterangan Izin/Sakit)</p>
      <input
            type="text"
            placeholder="Search by Name"
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-white border rounded py-2 px-2 my-2 mr-4"
          />
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="flex items-center mb-4 md:mb-0">
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="bg-white border rounded py-2 px-2"
          >
            <option value="name">Sort by Name</option>
            <option value="class">Sort by Class</option>
            <option value="submittedAt">Sort by Submitted At</option>
          </select>
        </div>
        <button
          onClick={downloadExcel}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
          Export to XLS
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Nama</th>
              <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Kelas</th>
              <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Izin</th>
              <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Sakit</th>
              {/* <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Keterangan</th> */}
              <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {aggregatedData.map((entry) => (
              <>
                <tr key={entry.name} onClick={() => handleRowClick(entry.name)} className="cursor-pointer">
                  <td className="border px-2 md:px-4 py-2 text-sm md:text-base flex items-center">
                    {entry.name}
                    <FontAwesomeIcon
                      icon={expandedName === entry.name ? faChevronUp : faChevronDown}
                      className="ml-2"
                    />
                  </td>
                  <td className="border px-2 md:px-4 py-2 text-sm md:text-base">{entry.class}</td>
                  <td className="border px-2 md:px-4 py-2 text-sm md:text-base">{entry.countIzin}</td>
                  <td className="border px-2 md:px-4 py-2 text-sm md:text-base">{entry.countSakit}</td>
                  {/* <td className="border px-2 md:px-4 py-2 text-sm md:text-base">{entry.keterangan}</td> */}
                  <td className="border px-2 md:px-4 py-2 text-sm md:text-base">{formatDate(entry.submittedAt)}</td>
                </tr>
                {expandedName === entry.name && (
                  <tr>
                    <td colSpan={6} className="bg-gray-100">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">Detailed Reasons</h3>
                        <div className="text-sm mb-4 mt-2 text-gray-600">
                              <div><strong>IZIN:</strong> {entry.countIzin}</div>
                              <div><strong>SAKIT:</strong> {entry.countSakit}</div>

                              </div>
                        <ul>
                          {entry.details.map((detail: any, index: any) => (
                            <li key={index} className="border-b py-2">
                              <div><strong>Status:</strong> {detail.status.izin ? "Izin" : detail.status.sakit ? "Sakit" : "N/A"}</div>
                              <div><strong>Keterangan:</strong> {detail.keterangan}</div>
                              <div><strong>Submitted At:</strong> {formatDate(detail.submittedAt)}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FkisListPage;
