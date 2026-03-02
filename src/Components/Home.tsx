import { useEffect, useState } from 'react';
import { type liveMatch, type live } from '../types/match';
import './Home.css';

const Home = () => {
  const [live, setLive] = useState<liveMatch | null>(null);
  useEffect(() => {
    fetch('/api/v4/teams/759/matches', {
      headers: {
        'X-Auth-Token': '716ddf6070c242bc87e8d97975ebb221',
      },
    })
      .then((res) => res.json())
      .then((data) => setLive(data))
      .catch((err) => console.error(err));
  }, []);
  console.log(live);
  if (!live) return <p>Loading...</p>;
  return (
    <div>
      {live.matches.map((match: live) => (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 py-10">
          {live.matches.map((match) => (
            <div key={match.id} className="mb-8 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
              {/* Teams Section */}
              <div className="flex items-center justify-center gap-10">
                <div className="text-center">
                  <img
                    src={match.homeTeam.crest}
                    alt={match.homeTeam.name}
                    className="mx-auto"
                    width={80}
                  />
                  <p className="mt-2 font-semibold">{match.homeTeam.name}</p>
                </div>

                <span className="text-2xl font-bold">VS</span>

                <div className="text-center">
                  <img
                    src={match.awayTeam.crest}
                    alt={match.awayTeam.name}
                    className="mx-auto"
                    width={80}
                  />
                  <p className="mt-2 font-semibold">{match.awayTeam.name}</p>
                </div>
              </div>

              {/* Match Info Section */}
              <div className="mt-6 text-center">
                <h3 className="text-xl font-semibold">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </h3>
                <p className="text-gray-600">Status: {match.status}</p>
                <p className="text-sm text-gray-500">{new Date(match.utcDate).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Home;
