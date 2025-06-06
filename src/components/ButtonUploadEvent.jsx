// ✅ New Component: ButtonUploadEvent.jsx
import axios from 'axios';
import { useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ButtonUploadEvent = ({ eventId }) => {
  const [file, setFile] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('uploadImages', file);

    try {
      const uploadPromise = axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/images/upload-event/${eventId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      await toast.promise(uploadPromise, {
        loading: 'Uploading...',
        success: 'Event image uploaded!',
        error: 'Upload failed!',
      });

      setFile('');
      inputRef.current.value = '';
      window.location.reload();
    } catch (error) {
      console.error('❌ Upload failed:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col">
      {/* <p className="text-white text-sm self-start">Upload an image for this event:</p> */}

      <div className="flex flex-wrap  items-center justify-start w-full max-w-md">
        <input
          type="file"
          id="uploadImages"
          name="uploadImages"
          hidden
          ref={inputRef}
          onChange={(e) => e.target.files[0] && setFile(e.target.files[0])}
          accept="image/*"
          disabled={loading}
        />

        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
          disabled={loading}
        >
          {file ? 'Change Image' : 'Choose Image'}
        </button>

        {file && (
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Submit Image'}
          </button>
        )}
      </div>

      <Toaster />
    </form>
  );
};

export default ButtonUploadEvent;
