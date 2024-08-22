"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '@/public/logo.png';
import uneso from '@/public/uneso.png';
import kir from '@/public/kir.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import bg1 from '@/public/bg1.png'
import bg2 from '@/public/bg2.png'
import bg3 from '@/public/bg3.png'
import bg4 from '@/public/bg4.png'
import bg5 from '@/public/bg5.png'
import bg6 from '@/public/bg6.png'
import bg7 from '@/public/bg7.png'
import Link from 'next/link';
const angkatan_sekarang: number = parseInt(process.env.NEXT_PUBLIC_ANGKATAN_SEKARANG ?? "9999999999999999", 10);

export default function Home() {
  const [isContentVisible, setContentVisible] = useState(false);
  const [showEmojis, setShowEmojis] = useState(true);
  const [currentPage, setCurrentPage] = useState(-1);
  const [emojiPositions, setEmojiPositions] = useState<{ top: string, left: string }[]>([]);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [counter, setCounter] = useState(0);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };


  const images = [
    { src: bg1, description: "PRESENTASI HASIL EKSPERIMEN" },
    { src: kir, description: "PELAKSANAAN EKSPERIMEN BURNING MONEY" },
    { src: bg2, description: "KEGIATAN LOMBA KIR DAERAH DKI JAKARTA" },
    { src: bg3, description: "PERSIAPAN EKSPERIMEN BURNING MONEY" },
    { src: bg4, description: "PELATIHAN" },
    { src: bg5, description: "MERAWAT GREENHOUSE DALAM RANGKA HARI BUMI" },
    { src: bg6, description: "KEGIATAN LOMBA" },
    { src: bg7, description: "-" },
  ];


  const handleClick = () => {
    setContentVisible(true);
    setShowEmojis(false);
    setCurrentPage(0);
  };

  useEffect(() => {
    document.body.style.height = '420vh';

    const checkScrollSpeed = (function(settings: { delay?: number } = {}) {
      let lastPos: number | null = null, newPos: number, timer: NodeJS.Timeout, delta = 0;
      const delay = settings.delay || 50;

      function clear() {
        lastPos = null;
        delta = 0;
      }

      clear();

      return function() {
        newPos = window.scrollY;
        if (lastPos !== null) {
          delta = newPos - lastPos;
        }
        lastPos = newPos;
        clearTimeout(timer);
        timer = setTimeout(clear, delay);
        return delta;
      };
    })();



    const handleScroll = () => {
      const speed = checkScrollSpeed();
      setScrollSpeed(speed);

      if (speed > 50) {
        // window.scrollTo({ top: 0, behavior: 'smooth' });
        // toast.error('Please do not scroll to fast!', {
        //   position: "top-right",
        // });
        return;
      }

      const scrollThreshold = document.body.offsetHeight * 0.92;
      if (window.innerHeight + window.scrollY >= scrollThreshold) {
        setContentVisible(true);
        setShowEmojis(false);
        setCurrentPage((prevPage) => (prevPage + 1 < headers.length ? prevPage + 1 : prevPage));
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

        window.removeEventListener('scroll', handleScroll);
        setTimeout(() => window.addEventListener('scroll', handleScroll), 1000);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Generate emoji positions once when the component mounts
    const generateRandomPosition = () => {
      const randomTop = Math.floor(Math.random() * 80) + 10 + 'vh';
      const randomLeft = Math.floor(Math.random() * 80) + 10 + 'vw';
      return { top: randomTop, left: randomLeft };
    };

    const initialEmojiPositions = [...Array(5)].map(generateRandomPosition);
    setEmojiPositions(initialEmojiPositions);


    

  const fetchData = async () => {
    try {
      const response = await axios.get("/api");
      const data = response.data.data;


      // Set the counter to the length of the data
      setCounter(data.length);
    } catch (err) {
      // Handle the error here
    } finally {
      // Do any final operations here
    }
  };


    fetchData();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  const handleEmojiClick = (emojiType: 'balloon' | 'leaves') => {
    if (emojiType === 'balloon') {
      router.push('/balloon');
    } else if (emojiType === 'leaves') {
      router.push('/leaves');
    }
  };


  const headers = ["APA ITU KIR?", "KEGIATAN KIR SMAN 12 JAKARTA", "CONTACT", "JOIN US"];
  const pagesContent = [
    (
      <>
      <hr className="line"></hr>
        <article className="mb-8 text-center items-center ">
          <div className="relative w-full h-full">
            <Image
              src={uneso}
              alt="Article image"
              width={600}
              height={400}
              className="block mx-auto" 
            />
          </div>
          <h2 className="text-2xl font-bold mt-4">SEJARAH KIR</h2>
          <p className="text-gray-600">1963 - now</p>
          <p className="mt-2 text-gray-700">
          Youth Science Club (disingkat YSC) awalnya dibentuk bagi remaja yang berusia 12-18 tahun oleh UNESCO pada tahun 1963, tetapi pada tahun 1970 batasan usia tersebut diubah menjadi 12-21 tahun. <br></br><br></br>Di Indonesia, Youth Science Club dikenal dengan nama Kelompok Ilmiah Remaja yang terbentuk atas inisiatif remaja Indonesia itu sendiri. Pembentukannya diawali pada tahun 1969 saat koran Harian Berita Yudha membentuk Remaja Yudha Club (RYC). <br></br><br></br>Selanjutnya, setelah difasilitasi oleh LIPI dan mengalami perkembangan, maka Remaja Yudha Club (RYC) berubah menjadi Kelompok Ilmiah Remaja. Istilah ini masih digunakan hingga saat ini, dan masih aktif dilaksanakan di berbagai sekolah di seluruh Indonesia. Kelompok Ilmiah Remaja pertama dan tertua di Indonesia adalah Kelompok Ilmiah Remaja Jakarta Utara (KIRJU) yang berdiri sejak 11 Maret 1982. Sekretariat KIRJU berada di Gedung Auditorium lantai 2 Gelanggang Remaja Jakarta Utara.
          </p>  
        </article>

        <section>
          <h2 className="text-2xl font-bold mb-4">Tentang KIR</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Image
                src={kir}
                alt="Article image"
                width={600}
                height={400}
                className="w-full h-auto"
              />
              <h3 className="text-xl font-bold mt-4">Apa itu KIR</h3>
              <p className="text-gray-600">2023</p>
              <p className="mt-2 text-gray-700">
              Kelompok Ilmiah Remaja (KIR) adalah kegiatan ekstrakurikuler di sekolah yang terbuka bagi para remaja yang ingin mengembangkan kreativitas, ilmu pengetahuan, dan teknologi.
              <br></br> <br></br>
              Anggota KIR diharapkan menerapkan sikap ilmiah, jujur dalam memecahkan masalah, memiliki kepekaan yang tinggi, dan menggunakan metode yang sistematis, objektif, rasional, dan berprosedur. KIR bertujuan untuk mengembangkan kompetensi pengembangan diri dalam kehidupan.
              <br></br><br></br>
              Di Indonesia, KIR juga dikenal dengan nama Kelompok Ilmiah Remaja dan telah aktif dilaksanakan di berbagai sekolah di seluruh negeri. Kelompok Ilmiah Remaja pertama dan tertua di Indonesia adalah Kelompok Ilmiah Remaja Jakarta Utara (KIRJU) yang berdiri sejak 11 Maret 1982
              </p>
              {/* <p className="text-gray-500 mt-2">By Username LastName</p> */}
            </div>
            <div>
              <Image
                src={logo}
                alt="Article image"
                width={600}
                height={400}
                className="w-full h-auto"
              />
              <h3 className="text-xl font-bold mt-4">Apa itu INKIRDIBLE</h3>
              <p className="text-gray-600">2023</p>
              <p className="mt-2 text-gray-700">
              INKIRDIBLE, singkatan dari Inovatif, Kreatif, dan Inspiratif, merupakan ekstrakurikuler (ekskul) Kelompok Ilmiah Remaja (KIR) di SMAN 12 Jakarta. Ekskul ini didirikan dengan tujuan untuk menumbuhkan minat dan bakat siswa dalam bidang sains dan teknologi, serta mendorong kamu untuk menjadi generasi muda yang inovatif dan kreatif.
              <br></br> <br></br>
              Di INKIRDIBLE, kalian tidak hanya mempelajari teori sains dan teknologi secara mendalam, tetapi juga dilibatkan dalam berbagai kegiatan praktikum dan penelitian yang menarik. Hal ini memungkinkan kamu untuk menerapkan pengetahuannya secara langsung dan mengembangkan kemampuan problem solvingmu.
              <br></br><br></br>
              Selain itu, INKIRDIBLE juga aktif mengikuti berbagai lomba dan kompetisi sains di tingkat regional, nasional, bahkan internasional.
                
              </p>
              {/* <p className="text-gray-500 mt-2">By Username LastName</p> */}
            </div>
          </div>
        </section>
      </>
    ),
    (
      <>
      <hr className='line'></hr>
      <div className="relative flex flex-col items-center min-h-screen">
      {/* <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src={images[currentImageIndex].src}
          alt={`Background Image ${currentImageIndex + 1}`}
          layout="fill"
          objectFit="cover"
          className="opacity-40"
        />
      </div> */}

<div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
  {images.map((src, index) => (
    <div key={index} className="relative w-full h-64">
      <Image
        src={src.src}
        alt={`Image ${index + 1}`}
        layout="fill"
        objectFit="cover"
        className="opacity-20 z-[-1]"
      />
    </div>  
  ))}
</div>

<h1 className='mb-5'>
  Bosan dengan pelajaran di kelas yang monoton? Ingin merasakan sensasi belajar sambil bereksperimen dan berpetualang? KIR hadir untuk membantumu! Lebih dari sekadar ekstrakulikuler sains, KIR adalah wadah untuk mengembangkan kreativitas, inovasi, dan kepemimpinanmu. Berikut ini adalah potret keseruan kegiatan dalam eskul KIR!
</h1>

<div className="relative w-full h-64 md:h-96 lg:h-128">
  <Image
    src={images[currentImageIndex].src}
    alt={`Image ${currentImageIndex + 1}`}
    layout="fill"
    className="w-max"
    objectFit="contain"
  />

  <div className="absolute inset-0 flex justify-between items-center px-4">
    <button
      onClick={handlePreviousImage}
      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300 "
    >
      &lt;&lt;
    </button>
    <button
      onClick={handleNextImage}
      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300"
    >
      &gt;&gt;
    </button>
  </div>
</div>

<p className="mt-12 lg:mt-16 text-xl md:text-2xl text-black z-10 transition-transform">
  {images[currentImageIndex].description}
</p>

          <h1 className='mt-8'>Ayo Tunggu Apalagi, Hey Kamu Scientist!
          Dunia menanti ide-ide brilianmu! Di KIR, kamu akan menemukan ruang untuk mengembangkan bakat dan minatmumu di bidang sains, teknologi, dan penelitian.</h1>
        
        
        {/* <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-white text-indigo-700 rounded-md shadow-md hover:bg-gray-200 transition duration-300"
        >
          Back to Home
        </button> */}
      </div>
      </>
    
    ),
    (
      <>
      <div className='slide-in-bottom'>
        <hr className="line"></hr>
        <div className='mx-auto text-center space-x-5 grid-cols-2 grid'>
        <div className=''>
        <Link href={"https://www.instagram.com/inkirdible/"} className="text-gray-700 text-7xl slide-in-bottom font-logos">
Q
        </Link>
        <h1 className='mt-2'>@inkirdible</h1>
        </div>
        <div className=''>
        <Link href={"https://wa.me/6282134947596"} className="text-gray-700 text-7xl slide-in-bottom font-logos ">
L
        </Link>
        <h1 className='mt-2'>+6282134947596</h1>
        </div>
        </div>
      </div>
      </>
    ),
    (
      <>
      <div className="flex flex-col items-center justify-center slide-in-bottom">
        <p className="slide-in-bottom">Ayo ikut berkontribusi dengan mengikuti eskul KIR, dimana tempat kita dapat belajar bersama-sama akan pentingnya alam di sekitar kita</p>
        <button
          onClick={() => router.push('/daftar')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded pixel-button "
        >
          Daftar Sekarang
        </button>
      </div>
      </>
    )
  ];

  const handlePrevious = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleNext = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, headers.length - 1));
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 relative flex flex-col items-center justify-center min-h-screen">
      <header className={`text-center mb-8 transition-transform duration-1000 ease-in-out ${isContentVisible ? 'translate-y-[15px]' : 'centered-content'}`}>
        <div className="slide-in-bottom">
          <h1 className="text-5xl font-bold">
            {isContentVisible ? (currentPage >= 0 && currentPage < headers.length ? headers[currentPage] : "AYO JOIN KIR") : "KIR SMAN 12 JAKARTA TIMUR"}
          </h1>
          {!isContentVisible && (
            <p className="text-sm text-gray-500 text-xl">Surat terbuka untuk kalian, calon scientist!</p>
          )}
          {!isContentVisible && (
            <p className="mt-4 p-4 bg-gray-100 shadow-lg rounded text-center text-sm">
            Ayo bergabung dengan <span className="underline">{counter + angkatan_sekarang}</span> anggota lainnya!
          </p>
          )}

          {!isContentVisible && showEmojis && (
            <button
              onClick={handleClick}
              className="mt-4 mr-4 px-4 py-2 bg-blue-500 text-white rounded pixel-button"
            >
              Learn More
            </button>
          )}
          {!isContentVisible && (
            <button
              onClick={() => router.push('/daftar')}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded pixel-button-d"
            >
              Daftar Sekarang
            </button>
          )}
        </div>
        {!isContentVisible && showEmojis && (
            <>
              <span
                className="floating-emoji hover:cursor-help"
                style={emojiPositions[0]}
                // onClick={() => handleEmojiClick('balloon')}
              >
                🎈
              </span>
              <span
                className="floating-emoji hover:cursor-help"
                style={emojiPositions[1]}
                // onClick={() => handleEmojiClick('leaves')}
              >
                🍃
              </span>
            </>
          )}
      </header>

      {isContentVisible && currentPage >= 0 && currentPage < headers.length && (
        <main className="slide-in-bottom ">
          {pagesContent[currentPage]}
        </main>
      )}

      {isContentVisible && currentPage >= 0 && (
        <div className="fixed bottom-4 flex justify-between items-center w-full px-4">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 bg-gray-500 text-white rounded"
            disabled={currentPage === 0}
          >
            &lt;&lt;
          </button>
          <p className="px-4 py-2 text-center bg-gray-500 text-white rounded">{currentPage + 1} / {headers.length}</p>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-gray-500 text-white rounded"
            disabled={currentPage === headers.length - 1}
          >
            &gt;&gt;
          </button>
        </div>
      )}
      <div className={`fixed ${isContentVisible ? 'bottom-16' : 'bottom-2'} left-4 bg-white p-2 rounded shadow`}>
  {/* {scrollSpeed > 20 ? (
    <p style={{ color: 'red' }}>You're scrolling too fast!</p>
  ) : (
    <p style={{ color: 'black' }}>
      Scroll Velocity: {scrollSpeed.toFixed(2)} px/ms
    </p>
  )} */}
</div>


      <ToastContainer />
    </div>
  );
}