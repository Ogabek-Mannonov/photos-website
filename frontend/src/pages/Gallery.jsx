import React, { useState, useEffect } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode";

const API_URL = 'https://photos-website-4.onrender.com/api'
const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Gallery({ onLogout }) {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (e) {
      console.error("Token decode error:", e);
    }
  }

  const fetchImages = async () => {
    try {
      const res = await axios.get(`${API_URL}/images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages(res.data);
    } catch {
      alert("Failed to load images");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const uploadImage = async () => {
    if (!selectedFile) {
      alert("Please select an image file");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a title for the image");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("title", title);

    try {
      setLoading(true);
      await axios.post(`${API_URL}/images`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSelectedFile(null);
      setTitle("");
      fetchImages();
    } catch {
      alert("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (imageId) => {
    try {
      await axios.post(`${API_URL}/images/${imageId}/like`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchImages();
    } catch {
      alert("Failed to toggle like");
    }
  };

  const postComment = async (imageId) => {
    if (!commentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/comments/${imageId}`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText("");
      fetchImages();
    } catch {
      alert("Failed to post comment");
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await axios.delete(`${API_URL}/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchImages();
    } catch {
      alert("Failed to delete image");
    }
  };

  return (
    <div className="container">
      <button onClick={onLogout} className="btn logout-btn">
        Logout
      </button>
      <h2>Gallery</h2>

      <div>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Image Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
        />
        <button onClick={uploadImage} disabled={loading} className="btn">
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      <hr />

      {images.length === 0 && <p>No images uploaded yet.</p>}

      {images.map((img) => (
        <div key={img.id} className="image-card">
          <p>
            <b>{img.title || "Untitled"}</b> uploaded by{" "}
            <b>{img.username}</b> at {new Date(img.uploaded_at).toLocaleString()}
          </p>
          <img
            src={`${BASE_URL}/${img.image_url.replace("\\", "/")}`}
            alt={img.title}
            className="uploaded-image"
          />
          <div>
            <button onClick={() => toggleLike(img.id)} className="btn like-btn">
              👍 Like ({img.likes_count || 0})
            </button>
            {img.user_id === userId && (
              <button onClick={() => deleteImage(img.id)} className="btn delete-btn">
                Delete
              </button>
            )}
          </div>
          <div className="comments-section">
            <h4>Comments:</h4>
            {img.comments && img.comments.length > 0 ? (
              img.comments.map((c) => (
                <div key={c.id} className="comment">
                  <b>{c.username}:</b> {c.text}{" "}
                  <small>({new Date(c.created_at).toLocaleString()})</small>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
            <input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input-field comment-input"
            />
            <button onClick={() => postComment(img.id)} className="btn">
              Post
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
