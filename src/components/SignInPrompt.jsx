import { useNavigate } from 'react-router-dom';

const SignInPrompt = ({ message = "Sign in to see full details" }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl rounded-xl p-8 max-w-md w-full">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign in to continue
          </h2>
          <p className="text-gray-400 mb-6">
            {message}
          </p>

          {/* Sign In Button */}
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg mb-3"
          >
            Sign In with Google
          </button>

          {/* Info */}
          <p className="text-xs text-gray-500">
            You're viewing limited information. Sign in to see contributor details, comments, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPrompt;
