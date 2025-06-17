import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useBookPages } from "./useBookPages";

export const pageAtom = atom(0);

export const pagesAtom = atom([]);

const pictures = [
  "/textures/1.jpeg",
  "/textures/2.jpeg",
  "/textures/3.jpeg",
  "/textures/4.jpeg",
  "/textures/5.jpeg",
  "/textures/6.jpeg",
  "/textures/7.jpeg",
];

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);
  const [pages, setPages] = useAtom(pagesAtom);
  const bookPages = useBookPages(pictures);
  const [delayedPage, setDelayedPage] = useState(0);

  useEffect(() => {
    if (pages.length === 0) return; // Wait until pages are loaded
    setDelayedPage(page);
  }, [pages.length]);

  useEffect(() => {
    if (pages.length === 0) return;
    // Reset delayedPage when pages change
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage;
        } else {
          timeout = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(page - delayedPage) > 2 ? 50 : 150
          );
          if (page > delayedPage) {
            return delayedPage + 1;
          }
          if (page < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
    };
    goToPage();

    return () => clearTimeout(timeout);
  }, [page, pages.length]);

  useEffect(() => {
    if (bookPages.length < 2) return;

    const finalPages = [];
    for (let i = 0; i < bookPages.length; i++) {
      const current = bookPages[i];
      const next = bookPages[(i + 1) % bookPages.length]; // wrap around
      finalPages.push({
        front: current.back,
        back: next.front,
      });
    }

    setPages(finalPages); // ✅ this triggers updates everywhere
  }, [bookPages]);

  useEffect(() => {
    // Skip playing audio on initial load (page === 0)
    if (page === 0) return;

    const playFlipSound = () => {
      const audio = new Audio("/audios/page-flip-01a.mp3");
      audio.play().catch((e) => {
        console.warn("Autoplay blocked:", e);
      });
    };

    playFlipSound();
  }, [page]);

  return (
    <>
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        <a
          className="pointer-events-auto ml-10"
          href="#"
        >
          <img className="w-40" src="/images/logo.png" alt="Logo" />
        </a>
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300 px-4 py-2 rounded-full text-lg uppercase shrink-0 border ${
                  index === page
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Front" : `${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                page === pages.length
                  ? "bg-white/90 text-black"
                  : "bg-black/30 text-white"
              }`}
              onClick={() => setPage(pages.length)}
            >
              Back
            </button>
          </div>
        </div>
      </main>

      <div className="fixed inset-0 flex items-center -rotate-2 select-none">
        <div className="relative">
          <div className="bg-white/0 animate-horizontal-scroll flex items-center gap-8 w-max px-8">
            <h1 className="shrink-0 text-white text-10xl font-black">
              Raghuvaran
            </h1>
            <h2 className="shrink-0 text-white text-8xl italic font-light">
              Weddings
            </h2>
            <h2 className="shrink-0 text-white text-12xl font-bold">&</h2>
            <h2 className="shrink-0 text-white text-9xl font-medium">Events</h2>
          </div>
          <div className="absolute top-0 left-0 bg-white/0 animate-horizontal-scroll-2 flex items-center gap-8 px-8 w-max">
            <h1 className="shrink-0 text-white text-10xl font-black">
              Raghuvaran
            </h1>
            <h2 className="shrink-0 text-white text-8xl italic font-light">
              Weddings
            </h2>
            <h2 className="shrink-0 text-white text-12xl font-bold">&</h2>
            <h2 className="shrink-0 text-white text-9xl font-medium">Events</h2>
          </div>
        </div>
      </div>
    </>
  );
};
