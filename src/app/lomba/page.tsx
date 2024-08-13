"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define an interface for contest data
interface Contest {
  _id: string;
  title: string;
  description: string;
  date: string;
  thumbnail?: string; // optional
}

const ContestList = () => {
  const [contestData, setContestData] = useState<Contest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch('/api/lomba');
        const data = await res.json();
        if (data.success) {
          setContestData(data.data);
        } else {
          console.error('Failed to fetch contests');
        }
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };

    fetchContests();
  }, []);

  const calculateTimeLeft = (date: string) => {
    const contestDate: any = new Date(date);
    const currentDate: any = new Date();
    const timeDifference = contestDate - currentDate;

    if (timeDifference > 0) {
      const daysLeft = Math.floor(timeDifference / (1000 * 3600 * 24));
      const hoursLeft = Math.floor((timeDifference % (1000 * 3600 * 24)) / (1000 * 3600));
      const minutesLeft = Math.floor((timeDifference % (1000 * 3600)) / (1000 * 60));
      const secondsLeft = Math.floor((timeDifference % (1000 * 60)) / 1000);

      if (daysLeft > 2) {
        return `Contest starts in ${daysLeft} days`;
      } else {
        return `Contest starts in ${hoursLeft} hours ${minutesLeft} minutes ${secondsLeft} seconds`;
      }
    } else {
      return "Contest has started";
    }
  };

  const filteredContests = contestData.filter((contest) =>
    contest.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClick = (id: string) => {
    router.push(`/lomba/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Upcoming Contests</h1>
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contests..."
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {filteredContests.map((contest) => (
            <div
              key={contest._id}
              className="bg-white p-6 rounded-lg shadow-md flex items-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
              onClick={() => handleClick(contest._id)}
            >
              {contest.thumbnail && (
                <img
                  src={`data:image/jpeg;base64,${contest.thumbnail}`}
                  alt={contest.title}
                  className="w-24 h-24 object-cover rounded-lg mr-6"
                />
              )}
              <div>
                <h2 className="text-2xl font-semibold text-black mb-2">{contest.title}</h2>
                <p className="text-gray-700 mb-4">
                  {contest.description.length > 100
                    ? `${contest.description.substring(0, 100)}...`
                    : contest.description}
                </p>
                <p className="text-gray-500">Date: {new Date(contest.date).toLocaleDateString()}</p>
                <p className="text-gray-500">{calculateTimeLeft(contest.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContestList;
