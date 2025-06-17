import { useEffect, useState } from "react";

export const useBookPages = (imagePaths) => {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const splitAll = async () => {
      const results = [];

      for (const path of imagePaths) {
        const img = await loadImage(path);
        const [left, right] = await splitImageVertically(img);
        results.push({ front: left, back: right });
      }

      setPages(results);
    };

    splitAll();
  }, [imagePaths]);

  return pages;
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function splitImageVertically(img) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const width = img.width / 2;
    const height = img.height;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Left
    ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);
    canvas.toBlob((leftBlob) => {
      const leftUrl = URL.createObjectURL(leftBlob);

      // Right
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, width, 0, width, height, 0, 0, width, height);
      canvas.toBlob((rightBlob) => {
        const rightUrl = URL.createObjectURL(rightBlob);
        resolve([leftUrl, rightUrl]);
      }, "image/jpeg");
    }, "image/jpeg");
  });
}
