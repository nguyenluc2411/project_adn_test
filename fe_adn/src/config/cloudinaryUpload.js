export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "blog_unsigned"); // Tên preset bạn đã cấu hình trên Cloudinary
  formData.append("folder", "blog-thumbnails");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dbihuiif1/image/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload thất bại với status ${res.status}`);
    }

    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    console.error("❌ Upload ảnh thất bại:", err);
    return null;
  }
};
