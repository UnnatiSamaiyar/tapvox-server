const express = require("express");
const router = express.Router();
const getMulterUploader = require("../middleware/upload");
const Blog = require("../models/Blogs");
const fs = require("fs");
const path = require("path");

// Setup multer for featuredImage and bannerImage
const upload = getMulterUploader("uploads/blogs");

// Two image fields: featuredImage and bannerImage
const cpUpload = upload.fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "bannerImage", maxCount: 1 },
]);

router.post("/create", cpUpload, async (req, res) => {
  try {
    const {
      title,
      description,
      bannerDesc,
      bannerLink,
      tags,
      category,
      content,
    } = req.body;

    const featuredImage = req.files?.featuredImage?.[0]
      ? `uploads/blogs/${req.files.featuredImage[0].filename}`
      : null;

    const bannerImage = req.files?.bannerImage?.[0]
      ? `uploads/blogs/${req.files.bannerImage[0].filename}`
      : null;

    const newBlog = new Blog({
      title,
      description,
      featuredImage,
      bannerImage,
      bannerDesc,
      bannerLink,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      category,
      content,
    });

    await newBlog.save();

    res
      .status(201)
      .json({ message: "Blog created successfully", blog: newBlog });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// READ
router.get("/get-blogs", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// READ SINGLE BLOG
router.get("/get-blog/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/update-blog/:id", cpUpload, async (req, res) => {
  try {
    const {
      title,
      description,
      bannerDesc,
      bannerLink,
      tags,
      category,
      content,
    } = req.body;

    // Pehle blog find karo
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // Fir images check karo aur assign karo
    if (req.files?.featuredImage?.[0]) {
      blog.featuredImage = `uploads/blogs/${req.files.featuredImage[0].filename}`;
    }
    if (req.files?.bannerImage?.[0]) {
      blog.bannerImage = `uploads/blogs/${req.files.bannerImage[0].filename}`;
    }

    // Update remaining fields
    blog.title = title;
    blog.description = description;
    blog.bannerDesc = bannerDesc;
    blog.bannerLink = bannerLink;
    blog.tags = tags ? tags.split(",").map((tag) => tag.trim()) : [];
    blog.category = category;
    blog.content = content;

    await blog.save();

    res.status(200).json({ message: "Blog updated", blog });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// DELETE
router.delete("/delete-blog/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Blog find karo
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Agar images hain toh unhe bhi delete karo
    if (blog.featuredImage) {
      const featuredPath = path.join(__dirname, "..", blog.featuredImage);
      if (fs.existsSync(featuredPath)) {
        fs.unlinkSync(featuredPath);
      }
    }

    if (blog.bannerImage) {
      const bannerPath = path.join(__dirname, "..", blog.bannerImage);
      if (fs.existsSync(bannerPath)) {
        fs.unlinkSync(bannerPath);
      }
    }

    // Blog ko delete karo
    await Blog.findByIdAndDelete(id);

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
