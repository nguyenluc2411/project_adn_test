import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../config/AxiosClient";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./BlogList.css"; 

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([{ name: "Kiến thức y khoa", count: 0 }]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get("/api/blogs", { params: { page, size: 6 } })
      .then((res) => {
        setBlogs(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => setBlogs([]));
  }, [page]);

  useEffect(() => {
    axiosClient
      .get("/api/blogs?size=9999")
      .then((res) => {
        const total = res.data?.content?.length || 0;
        setCategories([{ name: "Kiến thức y khoa", count: total }]);
      })
      .catch(() => {});
  }, []);

  return (
    <Header>
      <div className="bloglist-wrapper">
        <div className="bloglist-container">
          <div className="bloglist-main">
            <h2 className="bloglist-title">Kiến Thức Y Khoa</h2>
            <div className="bloglist-list">
              {blogs.length === 0 && <div className="bloglist-empty">Chưa có bài viết nào.</div>}
              {blogs.map((blog) => (
                <div key={blog.blogId} className="bloglist-item">
                  <img
                    src={blog.thumbnailUrl || "/src/assets/bang-gia-xet-nghiem.jpg"}
                    alt={blog.title}
                    className="bloglist-thumb"
                  />
                  <div className="bloglist-content">
                    <span className="bloglist-category">Kiến Thức Y Khoa</span>
                    <h3 className="bloglist-item-title" onClick={() => navigate(`/blogs/${blog.id}`)}>
                      {blog.title}
                    </h3>
                    <div
                      className="bloglist-desc"
                      dangerouslySetInnerHTML={{
                        __html: blog.content?.slice(0, 300) + "..."
                      }}
                    />
                    <div className="bloglist-meta">
                      Tác giả: <span className="bloglist-author">{blog.createdBy?.fullName || "DNA-GenX"}</span> - {blog.createdAt?.slice(0, 10)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bloglist-pagination">
              <button disabled={page <= 0} onClick={() => setPage((prev) => Math.max(prev - 1, 0))}>
                Trang trước
              </button>
              <span>
                Trang {page + 1} / {totalPages}
              </span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage((prev) => prev + 1)}>
                Trang sau
              </button>
            </div>
          </div>

          <div className="bloglist-sidebar">
            <div className="bloglist-sidebar-box">
              <div className="bloglist-sidebar-title">CHUYÊN MỤC</div>
              <ul>
                {categories.map((cat, idx) => (
                  <li
                    key={idx}
                    className={`bloglist-sidebar-item ${idx === 0 ? "active" : ""}`}
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
      <Footer />
    </Header>
  );
};

export default BlogList;