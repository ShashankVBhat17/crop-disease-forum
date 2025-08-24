const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const postsContainer = document.getElementById("postsContainer");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  window.location.href = "login.html";
});

// Fetch posts
async function fetchPosts() {
  try {
    const res = await fetch("http://localhost:5000/api/posts", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    // Fetch comments for each post
    for (let post of data) {
      const commentRes = await fetch(`http://localhost:5000/api/comments/${post._id}`);
      const comments = await commentRes.json();
      post.comments = comments;
    }

    if (res.ok) renderPosts(data);
    else alert(data.msg);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch posts. Server error.");
  }
}

// Render posts
function renderPosts(posts) {
  postsContainer.innerHTML = "";
  posts.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    // Header
    const postHeader = document.createElement("div");
    postHeader.classList.add("post-header");
    postHeader.innerHTML = `<h3>${post.crop}</h3><span>By: ${post.userId.name}</span>`;

    // Image
    const postImg = document.createElement("img");
    postImg.src = post.image ? `http://localhost:5000/${post.image}` : "";
    postImg.classList.add("post-img");

    // Description
    const postDesc = document.createElement("p");
    postDesc.textContent = post.description;

    // Tags
    const tagsDiv = document.createElement("div");
    tagsDiv.classList.add("tags-container");
    post.tags.forEach(tag => {
      const tagSpan = document.createElement("span");
      tagSpan.classList.add("tag-badge");
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });

    // Actions
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("post-actions");
    actionsDiv.innerHTML = `
      <button class="likeBtn">❤️ ${post.likes.length}</button>
      <button class="toggleCommentBtn">💬 ${post.comments.length}</button>
      ${post.userId._id === getUserId() ? '<button class="deleteBtn">🗑️ Delete</button>' : ''}
    `;

    // Comments
    const commentsDiv = document.createElement("div");
    commentsDiv.classList.add("commentsContainer", "collapse");

    post.comments.forEach(c => {
      const commentP = document.createElement("p");
      commentP.textContent = `${c.userId.name}: ${c.text}`;

      // Reply container
      const replyDiv = document.createElement("div");
      replyDiv.classList.add("comment-replies");

      if (c.replies && c.replies.length > 0) {
        c.replies.forEach(r => {
          const replyP = document.createElement("p");
          const replierName = r.userId?.name || "Unknown"; // Correctly get name
          replyP.textContent = `${replierName}: ${r.text}`;
          replyDiv.appendChild(replyP);
        });
      }

      // Reply button
      const replyBtn = document.createElement("button");
      replyBtn.textContent = "Reply";
      replyBtn.style.marginTop = "0.2rem";
      replyBtn.style.fontSize = "0.8rem";

      // Reply form (hidden initially)
      const replyForm = document.createElement("form");
      replyForm.innerHTML = `<input type="text" placeholder="Write a reply..." required>
                             <button type="submit">Add</button>`;
      replyForm.style.display = "none";

      replyBtn.addEventListener("click", () => {
        replyForm.style.display = replyForm.style.display === "none" ? "flex" : "none";
      });

      replyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = replyForm.querySelector("input").value;
        // Send reply to backend
        const res = await fetch(`http://localhost:5000/api/comments/reply/${c._id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        if (res.ok) {
          replyForm.querySelector("input").value = "";
          fetchPosts();
        }
      });

      commentsDiv.appendChild(commentP);
      commentsDiv.appendChild(replyDiv);
      commentsDiv.appendChild(replyBtn);
      commentsDiv.appendChild(replyForm);
    });

    // Add comment form
    const commentForm = document.createElement("form");
    commentForm.innerHTML = `<input type="text" placeholder="Add comment..." required><button type="submit">Add</button>`;
    commentsDiv.appendChild(commentForm);

    // Event listeners
    actionsDiv.querySelector(".likeBtn").addEventListener("click", () => handleLike(post._id));
    actionsDiv.querySelector(".toggleCommentBtn").addEventListener("click", () => commentsDiv.classList.toggle("collapse"));
    if (post.userId._id === getUserId()) {
      actionsDiv.querySelector(".deleteBtn").addEventListener("click", () => handleDelete(post._id));
    }
    commentForm.addEventListener("submit", (e) => handleComment(e, post._id));

    // Append all
    postDiv.appendChild(postHeader);
    postDiv.appendChild(postImg);
    postDiv.appendChild(postDesc);
    postDiv.appendChild(tagsDiv);
    postDiv.appendChild(actionsDiv);
    postDiv.appendChild(commentsDiv);
    postsContainer.appendChild(postDiv);
  });
}

// Get logged-in user ID
function getUserId() {
  const tokenData = JSON.parse(atob(token.split('.')[1]));
  return tokenData.user.id;
}

// Like post
async function handleLike(postId) {
  const res = await fetch(`http://localhost:5000/api/posts/like/${postId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) fetchPosts();
}

// Delete post
async function handleDelete(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;
  const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) fetchPosts();
}

// Add comment
async function handleComment(e, postId) {
  e.preventDefault();
  const input = e.target.querySelector("input");
  const text = input.value;
  const res = await fetch(`http://localhost:5000/api/comments/${postId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (res.ok) { input.value = ""; fetchPosts(); }
}

// Search
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  document.querySelectorAll(".post").forEach(postDiv => {
    const crop = postDiv.querySelector("h3").textContent.toLowerCase();
    const desc = postDiv.querySelector("p").textContent.toLowerCase();
    postDiv.style.display = crop.includes(term) || desc.includes(term) ? "block" : "none";
  });
});

// Initial fetch
fetchPosts();
