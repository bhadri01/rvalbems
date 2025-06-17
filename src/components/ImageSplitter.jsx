import React, { useRef, useState } from "react";

const ImageSplitter = () => {
  const [splitImages, setSplitImages] = useState([]);
  const imageRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => splitImage(img);
    img.src = URL.createObjectURL(file);
    imageRef.current = img;
  };

  const splitImage = (img) => {
    const width = img.width;
    const height = img.height;
    const chunkWidth = width / 2; // Cut in center vertically

    const canvas = document.createElement("canvas");
    canvas.width = chunkWidth;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    const parts = [];

    for (let i = 0; i < 2; i++) {
      ctx.clearRect(0, 0, chunkWidth, height);
      ctx.drawImage(
        img,
        i * chunkWidth, // source x
        0, // source y
        chunkWidth, // source width
        height, // source height
        0, // dest x
        0, // dest y
        chunkWidth, // dest width
        height // dest height
      );
      parts.push(canvas.toDataURL("image/png"));
    }

    setSplitImages(parts);
  };

  return (
    <div>
      <h2>Upload 12x36 Image to Split into Two 12x18 Images</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        {splitImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Split part ${index + 1}`}
            style={{
              border: "1px solid black",
              maxWidth: "100%",
              height: "auto",
              imageRendering: "auto",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSplitter;
