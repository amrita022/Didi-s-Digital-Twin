import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { setUserName } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      setUserName(email.split('@')[0]);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to log in: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 relative overflow-hidden">
      {/* Decorative Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-orange-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 border-4 border-pink-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border-4 border-yellow-400 rounded-full"></div>
      </div>

      {/* Left Side - Illustration Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold text-orange-600 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            दीदी का डिजिटल साथी
          </h1>
          <p className="text-2xl text-gray-700 mb-8">Empowering Women Entrepreneurs</p>
          
          {/* Beautiful SVG Illustrations of Indian Women Entrepreneurs */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            {/* Woman with basket - Food Business */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="w-32 h-32 mx-auto mb-3">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <ellipse cx="100" cy="140" rx="35" ry="50" fill="#fb923c" />
                  <path d="M 70 120 Q 65 110 75 100 L 85 140" fill="#fbbf24" opacity="0.8" />
                  <ellipse cx="70" cy="110" rx="8" ry="25" fill="#fcd34d" transform="rotate(-20 70 110)" />
                  <ellipse cx="130" cy="110" rx="8" ry="25" fill="#fcd34d" transform="rotate(20 130 110)" />
                  <rect x="120" y="130" width="30" height="25" rx="5" fill="#d97706" />
                  <circle cx="125" cy="135" r="4" fill="#dc2626" />
                  <circle cx="135" cy="137" r="4" fill="#16a34a" />
                  <rect x="92" y="75" width="16" height="15" fill="#fcd34d" />
                  <circle cx="100" cy="65" r="22" fill="#fcd34d" />
                  <ellipse cx="100" cy="55" rx="23" ry="18" fill="#0f172a" />
                  <circle cx="93" cy="63" r="2" fill="#0f172a" />
                  <circle cx="107" cy="63" r="2" fill="#0f172a" />
                  <path d="M 96 73 Q 100 76 104 73" stroke="#0f172a" strokeWidth="2" fill="none" />
                  <circle cx="100" cy="58" r="2" fill="#dc2626" />
                  <circle cx="80" cy="65" r="4" fill="#fbbf24" />
                  <circle cx="120" cy="65" r="4" fill="#fbbf24" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 text-center">Food & Pickles</p>
            </div>

            {/* Woman tailoring */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="w-32 h-32 mx-auto mb-3">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <rect x="110" y="120" width="50" height="30" rx="3" fill="#475569" />
                  <circle cx="135" cy="110" r="12" fill="#64748b" />
                  <ellipse cx="80" cy="130" rx="30" ry="45" fill="#60a5fa" />
                  <ellipse cx="60" cy="115" rx="8" ry="22" fill="#fcd34d" transform="rotate(-15 60 115)" />
                  <ellipse cx="100" cy="120" rx="8" ry="20" fill="#fcd34d" transform="rotate(25 100 120)" />
                  <rect x="72" y="70" width="16" height="12" fill="#fcd34d" />
                  <circle cx="80" cy="60" r="20" fill="#fcd34d" />
                  <ellipse cx="80" cy="50" rx="21" ry="16" fill="#0f172a" />
                  <circle cx="74" cy="58" r="2" fill="#0f172a" />
                  <circle cx="86" cy="58" r="2" fill="#0f172a" />
                  <path d="M 76 66 Q 80 69 84 66" stroke="#0f172a" strokeWidth="2" fill="none" />
                  <circle cx="80" cy="53" r="2" fill="#dc2626" />
                  <path d="M 55 75 Q 50 85 60 95 L 70 80" fill="#a855f7" opacity="0.6" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 text-center">Tailoring</p>
            </div>

            {/* Woman with craft products */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="w-32 h-32 mx-auto mb-3">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <ellipse cx="130" cy="165" rx="15" ry="20" fill="#dc2626" opacity="0.7" />
                  <ellipse cx="155" cy="168" rx="12" ry="18" fill="#f59e0b" opacity="0.7" />
                  <ellipse cx="100" cy="130" rx="32" ry="48" fill="#4ade80" />
                  <ellipse cx="70" cy="110" rx="8" ry="24" fill="#fcd34d" transform="rotate(-25 70 110)" />
                  <ellipse cx="130" cy="115" rx="8" ry="22" fill="#fcd34d" transform="rotate(15 130 115)" />
                  <ellipse cx="135" cy="135" rx="10" ry="14" fill="#dc2626" opacity="0.8" />
                  <rect x="92" y="70" width="16" height="14" fill="#fcd34d" />
                  <circle cx="100" cy="58" r="21" fill="#fcd34d" />
                  <ellipse cx="100" cy="48" rx="22" ry="17" fill="#0f172a" />
                  <rect x="96" y="75" width="8" height="40" fill="#0f172a" />
                  <circle cx="93" cy="56" r="2" fill="#0f172a" />
                  <circle cx="107" cy="56" r="2" fill="#0f172a" />
                  <path d="M 95 64 Q 100 67 105 64" stroke="#0f172a" strokeWidth="2" fill="none" />
                  <circle cx="100" cy="51" r="2" fill="#dc2626" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 text-center">Handicrafts</p>
            </div>

            {/* Woman beauty worker */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="w-32 h-32 mx-auto mb-3">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <rect x="120" y="140" width="8" height="25" rx="2" fill="#ec4899" />
                  <rect x="135" y="135" width="10" height="30" rx="2" fill="#8b5cf6" />
                  <ellipse cx="90" cy="125" rx="30" ry="45" fill="#c084fc" />
                  <ellipse cx="65" cy="110" rx="8" ry="23" fill="#fcd34d" transform="rotate(-20 65 110)" />
                  <ellipse cx="115" cy="115" rx="8" ry="22" fill="#fcd34d" transform="rotate(20 115 115)" />
                  <line x1="120" y1="130" x2="135" y2="145" stroke="#92400e" strokeWidth="2" />
                  <ellipse cx="137" cy="147" rx="4" ry="6" fill="#fb7185" />
                  <rect x="82" y="68" width="16" height="13" fill="#fcd34d" />
                  <circle cx="90" cy="56" r="20" fill="#fcd34d" />
                  <ellipse cx="90" cy="46" rx="21" ry="16" fill="#0f172a" />
                  <circle cx="82" cy="56" r="2" fill="#0f172a" />
                  <circle cx="98" cy="56" r="2" fill="#0f172a" />
                  <path d="M 85 64 Q 90 66 95 64" stroke="#0f172a" strokeWidth="2" fill="none" />
                  <circle cx="90" cy="49" r="2" fill="#dc2626" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 text-center">Beauty Services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10">
        <div className="max-w-md w-full">
          {/* Card with Indian-inspired design */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border-t-4 border-orange-500 relative overflow-hidden">
            {/* Decorative corner elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-200 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-pink-200 to-transparent rounded-tr-full"></div>

            {/* Header */}
            <div className="text-center mb-8 relative">
              <div className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full px-6 py-2 mb-4 shadow-lg">
                <span className="text-2xl">🙏</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                नमस्ते, दीदी!
              </h2>
              <p className="text-gray-600">Welcome back to your business dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg animate-shake">
                  <p className="font-semibold">⚠️ {error}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none bg-white/50"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔒 Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none bg-white/50"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In ✨</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-semibold">OR</span>
              </div>
            </div>

            {/* Signup Link */}
            <div className="text-center">
              <p className="text-gray-600 mb-3">New to Didi's Digital Twin?</p>
              <Link
                to="/signup"
                className="text-orange-600 hover:text-pink-600 font-bold text-lg underline decoration-2 underline-offset-4 transition-colors"
              >
                Create your account →
              </Link>
            </div>

            {/* Footer Quote */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
              <p className="text-sm text-gray-500 italic">
                "सर्वजन हिताय सर्वजन सुखाय" - For the welfare of all
              </p>
            </div>
          </div>

          {/* Mobile illustration hint */}
          <div className="lg:hidden mt-8 grid grid-cols-4 gap-4">
            <div className="text-center">
              <span className="text-4xl">🧺</span>
              <p className="text-xs mt-1 text-gray-600">Food</p>
            </div>
            <div className="text-center">
              <span className="text-4xl">🪡</span>
              <p className="text-xs mt-1 text-gray-600">Tailoring</p>
            </div>
            <div className="text-center">
              <span className="text-4xl">🎨</span>
              <p className="text-xs mt-1 text-gray-600">Crafts</p>
            </div>
            <div className="text-center">
              <span className="text-4xl">💄</span>
              <p className="text-xs mt-1 text-gray-600">Beauty</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;