"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Image from "next/image";
import logo from '@/public/logo.png';
import swal from 'sweetalert';

type Anggota = {
  _id: string;
  name: string;
  phoneNumber: string;
  class: string;
  agreement: string;
  alasan: string;
  eskul: string;
  __v: number;
};

type Kehadiran = {
  _id: string;
  name: string;
  class: string;
};

const FkisPage = () => {
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false); // Add loading state
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedNameId, setSelectedNameId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [keterangan, setKeterangan] = useState<string>("");
  const [izinSakit, setIzinSakit] = useState<"izin" | "sakit" | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anggotaResponse, kehadiranResponse] = await Promise.all([
          axios.get("/api"),
          axios.get("/api/fkis")
        ]);

        // Combine names from both sources, ensuring no duplicates by using a Map
        const combinedMap = new Map();

        anggotaResponse.data.data.forEach((item: Anggota) => {
          combinedMap.set(item.name, item);
        });

        kehadiranResponse.data.data.forEach((item: Kehadiran) => {
          if (!combinedMap.has(item.name)) {
            combinedMap.set(item.name, item);
          }
        });

        // Convert Map back to an array
        const combinedData = Array.from(combinedMap.values());
        setAnggota(combinedData);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const submitted = Cookies.get("fkis_submitted");
    if (submitted) {
      setHasSubmitted(true);
    }
  }, []);

  const handleNameChange = (name: string, id: string) => {
    setSelectedName(name);
    setSelectedNameId(id);
  };

  const handleAddName = () => {
    if (newName && !anggota.some(member => member.name === newName)) {
      const newMemberId = Date.now().toString() + Math.random();
      setAnggota([...anggota, { _id: newMemberId, name: newName, phoneNumber: "", class: "", agreement: "", alasan: "", eskul: "", __v: 0 }]);
      setSelectedName(newName);
      setSelectedNameId(newMemberId);
      setNewName("");
    }
  };

  const handleIzinSakitChange = (value: "izin" | "sakit") => {
    setIzinSakit(value);
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };

  const handleSubmit = async () => {
    if (selectedNameId && izinSakit && keterangan) {
      setLoading(true); // Set loading to true
      swal({
        title: "Submitting...",
        text: "Please wait while we submit your form.",
        icon: "info",
        closeOnClickOutside: false,
        closeOnEsc: false,
      });
      try {
        const data = {
          name: selectedName,
          userId: selectedNameId,
          studentclass: selectedClass,
          izin: izinSakit === "izin",
          sakit: izinSakit === "sakit",
          keterangan,
        };

        await axios.post("/api/fkis", data);

        Cookies.set("fkis_submitted", "true", { expires: 1 });
        setHasSubmitted(true);

        // Show success swal
        swal({
          title: "Pendaftaran Sukses",
          text: "Terimakasih sudah mengikuti ekstrakurikuler KIR! Dan sudah berkontribusi dalam rangka peduli lingkungan!",
          icon: "success",
        })

      } catch (error) {
        // Show error swal
        swal({
          title: "Error",
          text: "Telah terjadi error mohon hubungi kontak/instagram @inkirdible",
          icon: "error",
        });
        setError("Failed to submit data");
      } finally {
        setLoading(false); // Reset loading state
      }
    } else {
      setError("Please fill out all fields.");
    }
  };

  if (hasSubmitted) {
    return <div className="max-w-xl mx-auto p-6 text-center">You have already submitted the form. Please come back later.</div>;
  }

  if (isLoading) return <div className="max-w-xl mx-auto p-6 text-center">Loading...</div>;
  if (error) return <div className="max-w-xl mx-auto p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Image
        alt="logo"
        src={logo}
        width={200}
        height={200}
        style={{ backgroundColor: "#383433" }}
        className="mx-auto my-5 rounded-full aspect-square object-contain"
      />
      <h1 className="text-3xl font-bold mb-6 text-center">Formulir Keterangan Izin/Sakit</h1>

      {/* Name Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Pilih Nama:</h2>
        <div className="space-y-2">
          {anggota.map((member) => (
            <label key={member._id} className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox text-blue-500 h-5 w-5"
                checked={selectedName === member.name}
                onChange={() => handleNameChange(member.name, member._id)}
              />
              <span className="ml-2">{member.name.toUpperCase()}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tambah Nama"
            className="border p-2 flex-grow rounded-l"
          />
          <button
            onClick={handleAddName}
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
            disabled={!newName}
          >
            Tambah
          </button>
        </div>
        {/* Class Selection */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-3">Pilih Kelas:</h2>
          <div className="space-y-2">
            {["X-1", "X-2", "X-3", "X-4", "X-5", "X-6", "XI-1", "XI-2", "XI-3", "XI-4", "XI-5", "XI-6"].map((kelas) => (
              <label key={kelas} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-500 h-5 w-5"
                  checked={selectedClass === kelas}
                  onChange={() => handleClassChange(kelas)}
                />
                <span className="ml-2">{kelas}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Keterangan */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Keterangan:</h2>
        <textarea
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          className="border p-3 w-full rounded"
          rows={4}
          placeholder="Masukkan keterangan..."
        />
      </div>

      {/* Izin/Sakit Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Status:</h2>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox text-blue-500 h-5 w-5"
              checked={izinSakit === "izin"}
              onChange={() => handleIzinSakitChange("izin")}
            />
            <span className="ml-2">Izin</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox text-blue-500 h-5 w-5"
              checked={izinSakit === "sakit"}
              onChange={() => handleIzinSakitChange("sakit")}
            />
            <span className="ml-2">Sakit</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-200"
        disabled={loading} // Disable button while loading
      >
        Submit
      </button>
    </div>
  );
};

export default FkisPage;
