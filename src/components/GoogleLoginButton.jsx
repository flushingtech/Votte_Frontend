import googleLogo from '../assets/google-logo.png'; // Adjust the path based on your project structure

function GoogleLoginButton({ onClick, isLoading }) {
    return (
        <div className="flex justify-center">
            <button
                className={`bg-white text-gray-600 py-4 px-6 rounded-lg shadow-md transition duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center ${
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
                            className="h-5 w-5 mr-4" 
                        />
                        <span className="text-sm font-medium">Continue with Google</span>
                    </>
                )}
            </button>
        </div>
    );
}

export default GoogleLoginButton;
