import axios from 'axios';
import { useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ButtonUpload = () => {
  const [file, setFile] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { uploadImages } = e.target;

    const formData = new FormData();
    formData.append('uploadImages', uploadImages.files[0]);

    try {
        const uploadPromise = axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/images/upload`,
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
      
        console.log('✅ Upload success:');
        console.log('📄 Cloudinary URL:', res.data?.data?.[0]?.cloudinary_url || 'No URL returned');
        console.log('🔁 Full response:', res.data);
      
        setFile('');
        inputRef.current.value = '';
      } catch (error) {
        console.error('❌ Upload failed:', error.response?.data || error.message);
      }
      finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        className="inputsBorder fs-normal form-control"
        id="uploadImages"
        name="uploadImages"
        hidden
        onChange={(file) => {
          file.target.files[0] && setFile(file.target.files[0]);
        }}
        disabled={loading}
        accept="image/*"
        ref={inputRef}
      />

      <div className="box-img">
        {file ? (
          <label className="label-image" style={{ display: 'block' }} htmlFor="uploadImages">
            <img src={URL.createObjectURL(file)} />
          </label>
        ) : (
          <p className="text-center">No image selected</p>
        )}
      </div>

      <div>
        {file ? (
          <button type="submit" disabled={loading} className="btn">
            Upload image
          </button>
        ) : (
          <label className="btn" htmlFor="uploadImages">
            Import image
          </label>
        )}
      </div>

      <Toaster />
    </form>
  );
};

export default ButtonUpload;
