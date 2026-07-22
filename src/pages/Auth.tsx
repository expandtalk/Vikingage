
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, Shield, Mail } from 'lucide-react';
import { validateEmail, validatePassword, sanitizeTextInput } from '@/utils/security/inputValidation';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  // Redirecta inloggade: admin rakt till /admin (arbetsläget), övriga till startsidan.
  // Vänta tills rollen laddats så vi inte redirectar fel och sedan hoppar.
  useEffect(() => {
    if (user && !roleLoading) {
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    }
  }, [user, isAdmin, roleLoading, navigate]);

  // Simple rate limiting for login attempts
  const isRateLimited = loginAttempts >= 5;

  const validateInput = (email: string, password: string, fullName?: string) => {
    // Validate email with enhanced security checks
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.reason || 'Invalid email');
    }
    
    // Validate password with security requirements
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.reason || 'Invalid password');
    }
    
    // Validate full name if provided
    if (fullName !== undefined) {
      const sanitizedName = sanitizeTextInput(fullName);
      if (sanitizedName.trim().length === 0) {
        throw new Error('Full name is required');
      }
      if (sanitizedName.length > 100) {
        throw new Error('Full name is too long');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRateLimited) {
      setError('Too many login attempts. Please wait before trying again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      validateInput(email.trim(), password);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setLoginAttempts(prev => prev + 1);
        
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          setError('Unable to sign in. Please try again later.');
        }
        return;
      }
      
      // Reset login attempts on successful login. Redirect hanteras av useEffect
      // ovan när user + roll är laddade (admin -> /admin, övriga -> /).
      setLoginAttempts(0);
    } catch (error: any) {
      setError(error.message);
      setLoginAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      validateInput(email.trim(), password, fullName.trim());

      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim(),
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be')) {
          setError('Password should be at least 6 characters long.');
        } else if (error.message.includes('Unable to validate email')) {
          setError('Please enter a valid email address.');
        } else {
          setError('Unable to create account. Please try again later.');
        }
        return;
      }
      
      setMessage('Check your email for the confirmation link!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const emailValidation = validateEmail(email.trim());
      if (!emailValidation.isValid) {
        setError(emailValidation.reason || 'Invalid email');
        return;
      }

      const redirectUrl = `${window.location.origin}/auth`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        if (error.message.includes('Unable to validate email')) {
          setError('Please enter a valid email address.');
        } else {
          setError('Unable to send password reset email. Please try again later.');
        }
        return;
      }
      
      setMessage('Check your email for the password reset link!');
      setShowForgotPassword(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🗿</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Runic AI Research Platform
          </h1>
          <p className="text-slate-400">
            Sign in to access advanced research features
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                {!showForgotPassword ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="your@email.com"
                        maxLength={255}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true);
                            setError('');
                            setMessage('');
                          }}
                          className="text-sm text-purple-400 hover:text-purple-300 underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="••••••••"
                        maxLength={128}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={loading || isRateLimited}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : isRateLimited ? (
                        'Too many attempts - Please wait'
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-white flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="your@email.com"
                        maxLength={255}
                      />
                      <p className="text-sm text-slate-400">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setError('');
                          setMessage('');
                        }}
                        disabled={loading}
                        className="flex-1 border-white/20 text-white hover:bg-white/5"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Reset Link
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Your Name"
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="your@email.com"
                      maxLength={255}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="••••••••"
                      minLength={6}
                      maxLength={128}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4 border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="mt-4 border-green-500/50 bg-green-500/10">
                <AlertDescription className="text-green-400">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {isRateLimited && (
              <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/10">
                <AlertDescription className="text-yellow-400">
                  Rate limit reached. Please wait before trying again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
