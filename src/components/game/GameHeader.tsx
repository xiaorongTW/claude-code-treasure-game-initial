import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import ScoreHistoryDialog from '../auth/ScoreHistoryDialog';

interface Props {
  score: number;
}

export default function GameHeader({ score }: Props) {
  const { user, token, isGuest, logout } = useAuth();

  return (
    <div className="text-center mb-8 w-full">
      <div className="flex justify-end mb-2 gap-2">
        {user && token && (
          <>
            <span className="text-amber-800 text-sm self-center">👤 {user.username}</span>
            <ScoreHistoryDialog token={token} />
          </>
        )}
        {isGuest && (
          <span className="text-amber-600 text-sm self-center italic">Playing as Guest</span>
        )}
        <Button
          variant="outline"
          size="sm"
          className="border-amber-400 text-amber-800 hover:bg-amber-100"
          onClick={logout}
        >
          Sign Out
        </Button>
      </div>

      <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
      <p className="text-amber-800 mb-4">
        Click on the treasure chests to discover what's inside!
      </p>
      <p className="text-amber-700 text-sm">
        💰 Treasure: +$100 | 💀 Skeleton: -$50
      </p>

      <div className="mt-4">
        <div className="inline-block text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={score >= 0 ? 'text-green-600' : 'text-red-600'}>
            ${score}
          </span>
        </div>
      </div>
    </div>
  );
}
