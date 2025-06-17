"use client"

import { atom, useAtom } from "jotai"
import { useEffect, useState } from "react"
import { useBookPages } from "./useBookPages"
import { useOrientation } from "./OrientationProvider"

export const pageAtom = atom(0)
export const pagesAtom = atom([])

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
  const [page, setPage] = useAtom(pageAtom)
  const [pages, setPages] = useAtom(pagesAtom)
  const bookPages = useBookPages(pictures)
  const [delayedPage, setDelayedPage] = useState(0)
  const { isMobile, isLandscape } = useOrientation()

  useEffect(() => {
    if (pages.length === 0) return
    setDelayedPage(page)
  }, [pages.length, page])

  useEffect(() => {
    if (pages.length === 0) return
    let timeout
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage
        } else {
          timeout = setTimeout(
            () => {
              goToPage()
            },
            Math.abs(page - delayedPage) > 2 ? 50 : 150,
          )
          if (page > delayedPage) {
            return delayedPage + 1
          }
          if (page < delayedPage) {
            return delayedPage - 1
          }
        }
        return delayedPage
      })
    }
    goToPage()

    return () => clearTimeout(timeout)
  }, [page, pages.length])

  useEffect(() => {
    if (bookPages.length < 2) return

    const finalPages = []
    for (let i = 0; i < bookPages.length; i++) {
      const current = bookPages[i]
      const next = bookPages[(i + 1) % bookPages.length]
      finalPages.push({
        front: current.back,
        back: next.front,
      })
    }

    setPages(finalPages)
  }, [bookPages, setPages])

  useEffect(() => {
    if (page === 0) return

    const playFlipSound = () => {
      const audio = new Audio("/placeholder.svg?height=1&width=1")
      audio.play().catch((e) => {
        console.warn("Autoplay blocked:", e)
      })
    }

    playFlipSound()
  }, [page])

  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)

  useEffect(() => {
    if (pages.length === 0) {
      setLoadingComplete(false)
      setLoadingProgress(0)
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 10 + 5
        setLoadingProgress(Math.min(progress, 95))
      }, 100)
      return () => clearInterval(interval)
    } else {
      setLoadingProgress(100)
      setTimeout(() => setLoadingComplete(true), 400)
    }
  }, [pages.length])

  if (!loadingComplete) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center z-50"
        style={{
          background: "radial-gradient(#004959, #232323 80%)",
        }}
      >
        <h1 className="text-white text-2xl mb-6">Loading...</h1>
        <div className="w-64 h-3 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 border-2 border-white"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      </div>
    )
  }

  // Hide page numbers in mobile landscape mode
  const showPageNumbers = !(isMobile && isLandscape)

  return (
    <>
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        <a className="pointer-events-auto" href="#">
          <img
            className={`${isMobile && isLandscape ? "w-24" : "w-40"}`}
            src="/images/logo.png"
            alt="Logo"
          />
        </a>

        {showPageNumbers && (
          <div className="w-full overflow-auto pointer-events-auto flex justify-center">
            <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
              {[...pages].map((_, index) => (
                <button
                  key={index}
                  className={`border-transparent hover:border-white transition-all duration-300 px-4 py-2 rounded-full text-lg uppercase shrink-0 border ${
                    index === page ? "bg-white/90 text-black" : "bg-black/30 text-white"
                  }`}
                  onClick={() => setPage(index)}
                >
                  {index === 0 ? "Front" : `${index}`}
                </button>
              ))}
              <button
                className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                  page === pages.length ? "bg-white/90 text-black" : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(pages.length)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="fixed inset-0 flex items-center -rotate-2 select-none">
        <div className="relative">
          <div className="bg-white/0 animate-horizontal-scroll flex items-center gap-8 w-max px-8">
            <h1 className={`shrink-0 text-white font-black ${isMobile && isLandscape ? "text-6xl" : "text-10xl"}`}>
              Raghuvaran
            </h1>
            <h2
              className={`shrink-0 text-white italic font-light ${isMobile && isLandscape ? "text-4xl" : "text-8xl"}`}
            >
              Weddings
            </h2>
            <h2 className={`shrink-0 text-white font-bold ${isMobile && isLandscape ? "text-7xl" : "text-12xl"}`}>&</h2>
            <h2 className={`shrink-0 text-white font-medium ${isMobile && isLandscape ? "text-5xl" : "text-9xl"}`}>
              Events
            </h2>
          </div>
          <div className="absolute top-0 left-0 bg-white/0 animate-horizontal-scroll-2 flex items-center gap-8 px-8 w-max">
            <h1 className={`shrink-0 text-white font-black ${isMobile && isLandscape ? "text-6xl" : "text-10xl"}`}>
              Raghuvaran
            </h1>
            <h2
              className={`shrink-0 text-white italic font-light ${isMobile && isLandscape ? "text-4xl" : "text-8xl"}`}
            >
              Weddings
            </h2>
            <h2 className={`shrink-0 text-white font-bold ${isMobile && isLandscape ? "text-7xl" : "text-12xl"}`}>&</h2>
            <h2 className={`shrink-0 text-white font-medium ${isMobile && isLandscape ? "text-5xl" : "text-9xl"}`}>
              Events
            </h2>
          </div>
        </div>
      </div>
    </>
  )
}
