"use client";
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Correct import for Next.js router
import { useState, ChangeEvent, FormEvent } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import swal from 'sweetalert';
import logo from '@/public/logo.png';

const classOptions = ['X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6'];
const eskulOptions = ['SAMAN', 'TAEKWONDO', 'PADUS', 'TATRA', 'PMR', 'ROHKRIS (Rohani Kristen)', 'PASKIB', 'VOLI', 'BASKET', 'FUTSAL', 'AKUSTIK', 'DESAIN GRAFIS', 'LIRA', 'ENGLISH CLUB', 'ROHIS (Rohani Islam)']; // Placeholder options

interface FormState {
  name: string;
  phoneNumber: string;
  class: string;
  agreement: boolean;
  alasan: string;
  eskul: string[];
}

function Pendaftaran() {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    phoneNumber: '',
    class: '',
    agreement: false,
    alasan: '', // New state for alasan
    eskul: [], // New state for eskul
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  // useEffect(() => {
  //   const hasSubmitted = getCookie('formSubmitted');
  //   if (hasSubmitted) {
  //     router.push('/'); // Redirect to home if form has been submitted
  //   }
  // }, [router]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox' && event.target instanceof HTMLInputElement) {
      const target = event.target as HTMLInputElement; // Explicitly cast to HTMLInputElement
      if (name === 'eskul') {
        setFormState((prevFormState) => {
          const updatedEskul = target.checked
            ? [...prevFormState.eskul, value]
            : prevFormState.eskul.filter((eskul) => eskul !== value);
          return { ...prevFormState, eskul: updatedEskul };
        });
      } else {
        setFormState((prevFormState) => ({
          ...prevFormState,
          [name]: target.checked,
        }));
      }
    } else {
      setFormState((prevFormState) => ({
        ...prevFormState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.agreement) {
      toast.error('You must agree to the terms and conditions.', {
        position: "top-right",
      });
      return;
    }

    setIsSubmitting(true);

    swal({
      title: "Submitting...",
      text: "Please wait while we submit your form.",
      icon: "info",
      closeOnClickOutside: false,
      closeOnEsc: false,
    });

    try {
      const response = await axios.post('/api', formState);

      if (response.status === 201) { 
        toast.success('Form submitted successfully!', {
          position: "top-right",
        });

        setTimeout(() => {
          window.open('https://chat.whatsapp.com/EuAKD4nhcqwAhjG3frP1XF', '_blank');
        }, 1000); 

        swal({
          title: "Pendaftaran Sukses",
          text: "Terimakasih sudah mengikuti ekstrakurikuler KIR! Dan sudah berkontribusi dalam rangka peduli lingkungan!",
          icon: "success",
        }).then(() => {
          // Set a cookie to indicate that the form has been submitted
          document.cookie = "formSubmitted=true; path=/; max-age=86400"; // Expires in 1 day
          router.push("/")

          // setTimeout(() => {
          //   window.open('https://chat.whatsapp.com/EuAKD4nhcqwAhjG3frP1XF', '_blank');
          // }, 1000); 
        });

      } else {
        toast.error('Failed to submit the form!', {
          position: "top-right",
        });

        swal({
          title: "Error",
          text: "Telah terjadi error mohon hubungi kontak/instagram @inkirdible",
          icon: "error",
        });

        console.error('Failed to save form:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit the form!', {
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
      setFormState({
        name: '',
        phoneNumber: '',
        class: '',
        agreement: false,
        alasan: '',
        eskul: [],
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md mt-8">
      <Image
                alt="logo"
                src={logo}
                width={200}
                height={200}
                style={{ backgroundColor: "#383433" }}
                className="mx-auto my-5 rounded-full aspect-square object-contain"
            />
      <h2 className="text-2xl font-bold mb-4 text-center text-black">FORMULIR PENDAFTARAN EKSTRAKURIKULER KELOMPOK ILMIAH REMAJA</h2>
      <hr className="line"></hr>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="name" className="block text-black font-bold mb-2">Nama Lengkap:</label>
          <input 
            type="text"
            id="name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
            style={{ color: 'black' }}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="phoneNumber" className="block text-black font-bold mb-2">Nomor Telepon (62xxxxxxxxxx):</label>
          <input 
            type="number"
            id="phoneNumber"
            name="phoneNumber"
            value={formState.phoneNumber}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded"
            pattern="[0-9]*" // Ensure only numbers are allowed
            required
            style={{ color: 'black' }}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="class" className="block text-black font-bold mb-2">Kelas:</label>
          <select
            id="class"
            name="class"
            value={formState.class}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
            style={{ color: 'black' }}
          >
            <option value="">Select Class</option>
            {classOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="alasan" className="block text-black font-bold mb-2">Alasan Bergabung:</label>
          <textarea
            id="alasan"
            name="alasan"
            value={formState.alasan}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
            style={{ color: 'black' }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-black font-bold mb-2">Eskul Yang Kamu Ikuti (Selain KIR):</label>
          {eskulOptions.map((option) => (
            <div key={option} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`eskul-${option}`}
                name="eskul"
                value={option}
                checked={formState.eskul.includes(option)}
                onChange={handleInputChange}
                className="form-checkbox text-blue-600"
              />
              <label htmlFor={`eskul-${option}`} className="ml-2 text-black">{option}</label>
            </div>
          ))}
        </div>


<label className="block text-black font-bold mb-2">Persetujuan Murid Dan Orang Tua:</label>
        <div className="mb-6">
          <label className="inline-flex items-center">
            <input 
              type="checkbox"
              name="agreement"
              checked={formState.agreement}
              onChange={handleInputChange}
              className="form-checkbox text-blue-600"
            />
            <span className="ml-2 text-black">Dengan ini saya setuju saya akan mengikuti KIR dengan bersungguh-sungguh dan mengikuti segala aturan pada ekstrakurikuler KIR</span>
          </label>
        </div>

        <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Pendaftaran;
