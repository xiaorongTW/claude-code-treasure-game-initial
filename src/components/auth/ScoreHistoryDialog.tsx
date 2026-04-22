import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { fetchScoreHistory } from '../../lib/api';
import type { ScoreHistory } from '../../types/auth';

interface Props {
  token: string;
}

export default function ScoreHistoryDialog({ token }: Props) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ScoreHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchScoreHistory(token);
        setHistory(data);
      } catch {
        setError('Failed to load scores');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-amber-400 text-amber-800 hover:bg-amber-100">
          Score History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-900">Your Score History</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        {!loading && !error && history && (
          <>
            {history.bestScore !== null && (
              <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 text-center">
                <span className="text-amber-800 text-sm font-medium">Best Score: </span>
                <span className={`font-bold ${history.bestScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${history.bestScore}
                </span>
              </div>
            )}

            {history.scores.length === 0 ? (
              <p className="text-center text-amber-700 text-sm py-4">
                No games played yet. Play a game to see your history!
              </p>
            ) : (
              <ScrollArea className="max-h-72">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.scores.map((record, i) => (
                      <TableRow key={record.id}>
                        <TableCell className="text-amber-700">{i + 1}</TableCell>
                        <TableCell className={record.score >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          ${record.score}
                        </TableCell>
                        <TableCell className="text-amber-700 text-sm">
                          {new Date(record.played_at * 1000).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
