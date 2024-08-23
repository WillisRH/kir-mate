"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faChevronDown, faChevronUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow, parseISO, format as formatDateFns } from 'date-fns'; 
import logo from '@/public/logofull.png';
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import swal from 'sweetalert';

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
  const [sortOption, setSortOption] = useState<string>("class");
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [secretKey, setSecretKey] = useState<string>("");
  const [isKeyError, setIsKeyError] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  const router = useRouter();

  const secretKeyEnv = process.env.NEXT_PUBLIC_SECRET_KEY

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


    const failed = Cookies.get("fkis_list_failed");
    if (failed) {
      setHasFailed(true);
    }

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
  
      if (new Date(item.submittedAt) > new Date(aggregated[item.name].submittedAt)) {
        aggregated[item.name].submittedAt = item.submittedAt;
      }
  
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
    return `${relativeTime} (${exactDate})`; 
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

  // const handleDumpAll = async () => {
  //   if (secretKey === "your-secret-key") {
  //     try {
  //       await axios.delete("/api/fkis");
  //       setData([]);
  //       setIsModalOpen(false);
  //       setIsKeyError(false);
  //     } catch (err) {
  //       setError("Failed to delete data");
  //     }
  //   } else {
  //     setIsKeyError(true);
  //   }
  // };

  const handleDumpAll = async () => {
    if (secretKey === secretKeyEnv) {
      await axios.delete("/api/fkis");
        setData([]);
        setIsModalOpen(false);
        setIsKeyError(false);
        swal({
          title: "Success!",
          text: "Sukses menghapus semua data kehadiran!",
          icon: "success",
        });
      setIsModalOpen(false);
    } else {
      setFailedAttempts(prevAttempts => {
        const newAttempts = prevAttempts + 1;
        if (newAttempts >= 5) {
          Cookies.set("fkis_list_failed", "true", { expires: 1 });
          setHasFailed(true)
          swal({
            title: "Failed",
            text: "Kamu gagal memasukkan password sebanyak 5 kali!",
            icon: "error",
          }).then(() => {
            // Set a cookie to indicate that the form has been submitted
             // Expires in 1 day
            router.push("/")
  
            // setTimeout(() => {
            //   window.open('https://chat.whatsapp.com/EuAKD4nhcqwAhjG3frP1XF', '_blank');
            // }, 1000); 
          });
          // router.push('/')
        }
        return newAttempts;
      });
    }
  };

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (hasFailed) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        Blacklisted for 1 day!
      </div>
    );
  }

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
        <div className="flex space-x-4">
          <button
            onClick={downloadExcel}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
            Export to XLS
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Dump All
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Nama</th>
              <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Kelas</th>
              <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Izin</th>
              <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Sakit</th>
              <th className="border px-2 md:px-4 py-2 text-sm md:text-base">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {aggregatedData.map((entry) => (
              <>
                <tr key={entry.name} onClick={() => handleRowClick(entry.name)} className="cursor-pointer hover:bg-gray-100">
                  <td className="border px-2 md:px-4 py-2 text-sm md:text-base">{entry.name} <FontAwesomeIcon
                      icon={expandedName === entry.name ? faChevronUp : faChevronDown}
                      className="ml-2"
                    /></td>
                  <td className="border px-2 md:px-4 py-2 text-sm md:text-base">{entry.class}</td>
                  <td className="border px-2 md:px-4 py-2 text-sm md:text-base">{entry.countIzin}</td>
                  <td className="border px-2 md:px-4 py-2 text-sm md:text-base">{entry.countSakit}</td>
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

      {/* Modal for confirmation and secret key */}
      {isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
    <div className="relative bg-white p-8 rounded shadow-lg w-full max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">Confirm Delete All Data</h2>
      <p className="mb-4">Please enter the secret key to confirm deletion:</p>
      <input
        type="password"
        value={secretKey}
        onChange={(e) => setSecretKey(e.target.value)}
        className="bg-gray-200 border rounded w-full py-2 px-3 mb-4"
      />
      {failedAttempts > 0 && (
  <p className="text-red-500 mb-4">
    Incorrect secret key. Please try again.
  </p>
)}

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setIsModalOpen(false)}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleDumpAll}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete All
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default FkisListPage;
