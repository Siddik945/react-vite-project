import { type MatchType } from '../types/match';
import './Match.css';

interface MatchProps {
  match: MatchType;
}

const Match = ({ match }: MatchProps) => {
  return (
    <div>
      {match.childAreas.map((area) => (
        <div
          key={area.id}
          className="mx-auto mb-6 w-full max-w-md rounded-2xl bg-white p-6 shadow-md transition duration-300 hover:shadow-xl"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Flag */}
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border bg-gray-50">
              <img src={area.flag} alt={area.name} className="h-full w-full object-cover" />
            </div>

            {/* Name */}
            <div>
              <h2 className="text-xl font-bold text-gray-800">{area.name}</h2>
              <p className="text-sm text-gray-500">Club / Country</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Match;
