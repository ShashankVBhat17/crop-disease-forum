// Check if user is logged in
const token = localStorage.getItem("token");
if (!token) {
  alert("You must login first!");
  window.location.href = "login.html";
}

// Post form
const postForm = document.getElementById("postForm");

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get values
  const crop = document.getElementById("crop").value;
  const description = document.getElementById("description").value;
  const tags = document.getElementById("tags").value
    .split(",")
    .map(t => t.trim());
  const imageFile = document.getElementById("image").files[0];

  // Prepare FormData
  const formData = new FormData();
  formData.append("crop", crop);
  formData.append("description", description);
  formData.append("tags", JSON.stringify(tags));
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`  // Correct token format
      },
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      alert("Post added successfully!");
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      // If token invalid or expired, force logout
      if (data.msg === "Token is not valid" || data.msg === "No token, authorization denied") {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        window.location.href = "login.html";
      } else {
        alert(data.msg);
      }
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Server error. Try again later.");
  }
});
