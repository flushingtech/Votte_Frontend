import axios from 'axios';
import { useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ButtonUpload = ({ ideaId }) => {
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
        `${import.meta.env.VITE_BASE_URL}/api/images/upload/${ideaId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const res = await toast.promise(uploadPromise, {
        loading: 'Uploading...',
        success: 'Image uploaded!',
        error: 'Upload failed!',
      });

      console.log('✅ Upload success:', res.data);
      setFile('');
      inputRef.current.value = '';
      window.location.reload(); // refresh to show image
    } catch (error) {
      console.error('❌ Upload failed:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
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

      <label
        htmlFor="uploadImages"
        className="cursor-pointer border-2 border-dashed border-gray-400 rounded-lg p-4 text-center text-gray-300 hover:border-white transition-all w-full max-w-md"
      >
        {file ? file.name : 'Click to select an image'}
      </label>

      {file && (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          className="max-w-md w-full h-auto rounded-lg border border-gray-500"
        />
      )}

      {file && (
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Submit Image'}
        </button>
      )}

      <Toaster />
    </form>
  );
};

export default ButtonUpload;
