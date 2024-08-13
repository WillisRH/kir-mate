"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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

const FkisPage = () => {
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedNameId, setSelectedNameId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [keterangan, setKeterangan] = useState<string>("");
  const [izinSakit, setIzinSakit] = useState<"izin" | "sakit" | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const router = useRouter();

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

    // Check if the user has already submitted
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
      const newMemberId = Date.now().toString();
      setAnggota([...anggota, { _id: newMemberId, name: newName, phoneNumber: "", class: "", agreement: "", alasan: "", eskul: "", __v: 0 }]);
      setSelectedName(newName);
      setSelectedNameId(newMemberId);
      setNewName("");
    }
  };

  const handleIzinSakitChange = (value: "izin" | "sakit") => {
    setIzinSakit(value);
  };

  const handleSubmit = async () => {
    if (selectedNameId && izinSakit && keterangan) {
      try {
        const data = {
          name: selectedName,
          userId: selectedNameId,
          izin: izinSakit === "izin", // true if 'izin' is selected, false otherwise
          sakit: izinSakit === "sakit", // true if 'sakit' is selected, false otherwise
          keterangan,
        };
  
        await axios.post("/api/fkis", data);
  
        // Set cookie to prevent resubmission for one day
        Cookies.set("fkis_submitted", "true", { expires: 1 });
  
        // Redirect or show a success message
        setHasSubmitted(true);
      } catch (error) {
        setError("Failed to submit data");
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
              <span className="ml-2">{member.name}</span>
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
          >
            Tambah
          </button>
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
      >
        Submit
      </button>
    </div>
  );
};

export default FkisPage;
