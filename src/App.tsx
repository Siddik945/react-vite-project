import { useEffect, useState } from 'react';
import Match from './Components/Match.tsx';
import { type MatchType } from './types/match';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Components/HeadingSection.tsx';
import Home from './Components/Home.tsx';

export default function App() {
  const [match, setMatch] = useState<MatchType | null>(null);
  useEffect(() => {
    fetch('/api/v4/areas/2267', {
      headers: {
        'X-Auth-Token': import.meta.env.VITE_API_KEY,
      },
    })
      .then((res) => res.json())
      .then((data) => setMatch(data))
      .catch((err) => console.error(err));
  }, []);

  // console.log(match);

  if (!match) return <p>Loading...</p>;

  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<h1>Live Match Page</h1>} />
          <Route path="/clubs" element={<Match match={match} />} />
          <Route path="/countries" element={<h1>Country List Page</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
