import { useState, useEffect } from 'react';
import { useMobileStore } from '../store/mobileStore';
import { User as UserIcon, Lock, ChevronRight, LogOut, UserCheck } from 'lucide-react';

const LoginScreen = () => {
  const { users, login, setConnection, rememberedUser, forgetUser } = useMobileStore();
  const [selectedUser, setSelectedUser] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // If there is a remembered user, default to them
  useEffect(() => {
      if (rememberedUser) {
          setSelectedUser(rememberedUser.id);
      }
  }, [rememberedUser]);

  const handleLogin = () => {
    const user = users.find(u => u.id === selectedUser);
    if (!user) {
        setError("Select a user");
        return;
    }
    if (user.pin !== pin) {
        setError("Incorrect PIN");
        return;
    }
    login(user);
  };

  const handleDisconnect = () => {
      if(confirm("Disconnect from server?")) {
          setConnection('', '');
          window.location.reload();
      }
  };

  const handleSwitchUser = () => {
      forgetUser();
      setSelectedUser('');
      setPin('');
      setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-6">
        <div className="flex justify-between items-center">
            {/* Show back button or something if needed, for now just Spacer */}
            <div />
            <button onClick={handleDisconnect} className="text-slate-500 p-2">
                <LogOut className="w-5 h-5" />
            </button>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                {rememberedUser ? (
                    <p className="text-slate-400">Enter PIN for <span className="text-sky-400 font-semibold">{rememberedUser.name}</span></p>
                ) : (
                    <p className="text-slate-400">Select your profile to continue</p>
                )}
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-5">

                {/* If no remembered user, show dropdown */}
                {!rememberedUser && (
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">User</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <select
                                value={selectedUser}
                                onChange={e => setSelectedUser(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white appearance-none focus:border-sky-500 outline-none"
                            >
                                <option value="">Select User</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Show User Info if Remembered */}
                {rememberedUser && (
                    <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <div className="w-10 h-10 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold">{rememberedUser.name}</div>
                            <div className="text-xs text-slate-500 uppercase">{rememberedUser.role}</div>
                        </div>
                        <button
                            onClick={handleSwitchUser}
                            className="text-xs text-sky-500 hover:text-sky-400 font-medium"
                        >
                            Switch
                        </button>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">PIN</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="password"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            placeholder="Enter PIN"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-sky-500 outline-none"
                        />
                    </div>
                </div>

                {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                <button
                    onClick={handleLogin}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-500 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    Login <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default LoginScreen;
