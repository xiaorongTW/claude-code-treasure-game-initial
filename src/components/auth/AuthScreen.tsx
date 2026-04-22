import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { signup, signin } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: { username?: string; password?: string } = {};
    if (!username.trim()) {
      next.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      next.username = 'Username must be 3-20 alphanumeric characters or underscores';
    }
    if (!password) {
      next.password = 'Password is required';
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);
    setLoading(true);
    try {
      const result = mode === 'signup'
        ? await signup(username, password)
        : await signin(username, password);
      login(result.user, result.token);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor={`${mode}-username`}>Username</Label>
        <Input
          id={`${mode}-username`}
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && (
          <p className="text-destructive text-xs">{errors.username}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <Input
          id={`${mode}-password`}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <p className="text-destructive text-xs">{errors.password}</p>
        )}
      </div>

      {apiError && (
        <p className="text-destructive text-sm">{apiError}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
      </Button>
    </form>
  );
}

export default function AuthScreen() {
  const { enterGuestMode } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl border-2 border-amber-300">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl text-amber-900">🏴‍☠️ Treasure Hunt</CardTitle>
          <p className="text-amber-700 text-sm">Sign in to save your scores!</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')}>
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="pt-4">
              {tab === 'signin' && <AuthForm mode="signin" />}
            </TabsContent>
            <TabsContent value="signup" className="pt-4">
              {tab === 'signup' && <AuthForm mode="signup" />}
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-amber-600 text-xs">or</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="w-full border-amber-400 text-amber-800 hover:bg-amber-100"
            onClick={enterGuestMode}
          >
            Continue as Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
