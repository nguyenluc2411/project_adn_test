import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../config/AxiosClient";
import ReactMarkdown from "react-markdown";
import ReactStars from "react-rating-stars-component";
import Header from "../Header/Header";
import { useAuth } from "../Context/AuthContext";
import "./BlogDetail.css";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import Rating from "react-rating";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [rating, setRating] = useState({ averageRating: 0, totalVotes: 0 });
  const [categories, setCategories] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const hasLoadedRef = useRef(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      // Tránh load dữ liệu nhiều lần với useRef
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;
      
      try {
        // Tải blog
        const blogRes = await axiosClient.get(`/api/blogs/${id}`);
        setBlog(blogRes.data);
        
        // Tải rating
        const ratingRes = await axiosClient.get(`/api/blogs/${id}/rating`);
        setRating(ratingRes.data);
        
        // Kiểm tra đánh giá hiện tại của user
        const user = localStorage.getItem("user");
        if (user) {
          try {
            const userObj = JSON.parse(user);
            const userId = userObj.id || userObj.userId;
            
            // Kiểm tra user đã đánh giá chưa (tạm thời dùng localStorage để check)
            const userRatingKey = `user_${userId}_blog_${id}_rating`;
            const existingRating = localStorage.getItem(userRatingKey);
            
            if (existingRating) {
              setHasRated(true);
              setUserRating(parseInt(existingRating));
            }
          } catch (error) {
            console.error("Error parsing user object:", error);
          }
        }
        
        // Đánh dấu đã load xong
        setIsDataLoaded(true);
      } catch (error) {
        console.error("❌ Không thể tải dữ liệu:", error);
        if (error.response?.status === 404) {
          navigate("/blog-list");
        }
      }
    };
    
    loadData();
  }, [id, navigate]);

  useEffect(() => {
    axiosClient
      .get("/api/blogs?size=9999")
      .then((res) => {
        const total = res.data?.content?.length || 0;
        setCategories([{ name: "Kiến thức y khoa", count: total }]);
      })
      .catch((err) => {
        console.error("Lỗi khi đếm số lượng blog:", err);
      });
  }, []);

  const handleRatingChange = (newRating) => {
    setUserRating(newRating);
  };

  const handleEditRating = () => {
    setIsEditing(true);
  };

  const submitRating = async () => {
    if (userRating === 0) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }

    console.log("Submitting rating:", userRating);

    const user = localStorage.getItem("user");
    console.log("user from localStorage:", user);

    if (!user) {
      alert("Bạn cần đăng nhập để đánh giá!");
      return;
    }

    // Parse user object to get userId
    let userId, userName;
    try {
      const userObj = JSON.parse(user);
      userId = userObj.id || userObj.userId;
      userName = userObj.name || userObj.username || "Người dùng";
    } catch (error) {
      console.error("Error parsing user object:", error);
      alert("Lỗi đăng nhập, vui lòng đăng nhập lại!");
      return;
    }

    console.log("userId extracted:", userId);

    try {
      console.log("Sending rating request:", { blogId: id, rating: userRating });
      // Gửi request theo API mới - không cần truyền userId, backend sẽ lấy từ token
      await axiosClient.post(`/api/blogs/rate`, {
        blogId: id,
        rating: userRating,
      });
      
      // Cập nhật rating trung bình từ backend
      const res = await axiosClient.get(`/api/blogs/${id}/rating`);
      setRating(res.data);
      
      // Lưu rating của user vào localStorage để tracking
      const userRatingKey = `user_${userId}_blog_${id}_rating`;
      localStorage.setItem(userRatingKey, userRating.toString());
      
      setHasRated(true);
      setIsEditing(false);
      
      console.log("Rating updated successfully:", res.data);
      alert(hasRated ? "Đánh giá đã được cập nhật!" : "Đánh giá thành công!");
    } catch (error) {
      console.error("Rating error:", error);
      alert("Không thể gửi đánh giá. Vui lòng thử lại!");
    }
  };

  return (
    <Header>
      <div className="blogdetail-wrapper">
        <div className="blogdetail-container">
          <div className="blogdetail-main">
            {!blog ? (
              <div className="loading">Đang tải bài viết...</div>
            ) : (
              <>
                <button
                  onClick={() => navigate(-1)}
                  className="blogdetail-back"
                >
                  ← Quay lại
                </button>

                <h1 className="blogdetail-title">{blog.title}</h1>

                {blog.thumbnailUrl && (
                  <img
                    src={blog.thumbnailUrl}
                    alt={blog.title}
                    className="blogdetail-image"
                  />
                )}

                <div className="blogdetail-content">
                  <ReactMarkdown>{blog.content}</ReactMarkdown>
                </div>

                <div className="blogdetail-meta">
                  <span>
                    Tác giả:{" "}
                    <span className="author">{blog.authorName || "GENX"}</span>
                  </span>
                  <span>• {blog.createdAt?.slice(0, 10)}</span>
                  <span>
                    • {new Intl.NumberFormat("vi-VN").format(blog.viewCount)}{" "}
                    lượt xem
                  </span>
                  <span className="rating">
                    • {rating.averageRating || 0} ⭐
                    <ReactStars
                      count={5}
                      value={rating.averageRating}
                      size={20}
                      isHalf={true}
                      edit={false}
                      activeColor="#ffd700"
                    />
                    <span className="rating-count">
                      ({rating.totalVotes} lượt đánh giá)
                    </span>
                  </span>
                  <span className="user-rating">
                    • Đánh giá của bạn:
                    {localStorage.getItem("user") ? (
                      hasRated && !isEditing ? (
                        // Hiển thị đánh giá của user hiện tại và nút Sửa
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ display: 'flex' }}>
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                size={20} 
                                color={i < userRating ? "#ffc107" : "#ccc"} 
                              />
                            ))}
                          </div>
                          <span>({userRating} sao)</span>
                          <button
                            onClick={handleEditRating}
                            style={{
                              background: '#28a745',
                              color: 'white',
                              border: 'none',
                              padding: '5px 15px',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Sửa
                          </button>
                        </div>
                      ) : (
                        // Hiển thị rating để chọn và nút Gửi
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Rating
                            initialRating={userRating}
                            emptySymbol={<FaRegStar size={24} color="#ccc" />}
                            fullSymbol={<FaStar size={24} color="#ffc107" />}
                            onClick={handleRatingChange}
                          />
                          <button
                            onClick={submitRating}
                            style={{
                              background: '#0070c0',
                              color: 'white',
                              border: 'none',
                              padding: '5px 15px',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            {hasRated ? 'Cập nhật' : 'Gửi'}
                          </button>
                          {isEditing && (
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                // Reset về rating cũ nếu có
                                const user = localStorage.getItem("user");
                                if (user) {
                                  const userObj = JSON.parse(user);
                                  const userId = userObj.id || userObj.userId;
                                  const userRatingKey = `user_${userId}_blog_${id}_rating`;
                                  const existingRating = localStorage.getItem(userRatingKey);
                                  if (existingRating) {
                                    setUserRating(parseInt(existingRating));
                                  }
                                }
                              }}
                              style={{
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '5px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => navigate("/login")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#0070c0",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontSize: "0.875rem",
                        }}
                      >
                        Đăng nhập để đánh giá
                      </button>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="blogdetail-sidebar">
            <div className="blogdetail-sidebar-box">
              <div className="blogdetail-sidebar-title">CHUYÊN MỤC</div>
              <ul>
                {categories.map((cat, idx) => (
                  <li
                    key={idx}
                    className={`blogdetail-sidebar-item ${
                      idx === 0 ? "active" : ""
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span>{cat.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Header>
  );
};

export default BlogDetail;
