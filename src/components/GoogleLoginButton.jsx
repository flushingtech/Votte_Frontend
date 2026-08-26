import googleLogo from '../assets/google-logo.png'; // Adjust the path based on your project structure

function GoogleLoginButton({ onClick, isLoading }) {
    return (
        <div className="w-full">
            <button
                className={`w-full bg-white text-gray-700 py-4 px-6 rounded-xl shadow-lg shadow-black/20 ring-2 ring-site_orange/40 hover:ring-site_orange transition duration-300 ease-in-out hover:shadow-xl hover:shadow-site_orange/20 hover:-translate-y-0.5 flex items-center justify-center ${
                    isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
                onClick={onClick}
                disabled={isLoading}  // Disable the button when loading
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin h-5 w-5 text-blue-500 inline mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                            />
                        </svg>
                        Loading...
                    </>
                ) : (
                    <>
                        <img
                            src={googleLogo}
                            alt="Google logo"
                            className="h-6 w-6 mr-3"
                        />
                        <span className="text-base font-semibold">Continue with Google</span>
                    </>
                )}
            </button>
        </div>
    );
}

export default GoogleLoginButton;
