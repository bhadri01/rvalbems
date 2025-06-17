"use client"


import { createContext, useContext, useEffect, useState } from "react"


const OrientationContext = createContext({
  isMobile: false,
  isLandscape: false,
  showRotateAlert: false,
})

export const useOrientation = () => useContext(OrientationContext)

export function OrientationProvider({ children }) {
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [showRotateAlert, setShowRotateAlert] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      const mobile = window.innerWidth <= 768
      const landscape = window.innerWidth > window.innerHeight

      setIsMobile(mobile)
      setIsLandscape(landscape)
      setShowRotateAlert(mobile && !landscape)
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", () => {
      setTimeout(checkOrientation, 100) // Small delay for orientation change
    })

    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  return (
    <OrientationContext.Provider value={{ isMobile, isLandscape, showRotateAlert }}>
      {showRotateAlert && <RotateAlert />}
      <div className={showRotateAlert ? "hidden" : "block h-screen"}>{children}</div>
    </OrientationContext.Provider>
  )
}

function RotateAlert() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center text-white p-8">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto mb-4 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03L12 1.51c1.73.07 3.37.53 4.48 1.01zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l6.36 6.36c.59.59 1.54.59 2.12 0L16.59 10.23c.59-.59.59-1.54 0-2.12L10.23 1.75zm-.71 12.38L3.16 7.77l6.36-6.36 6.36 6.36-6.36 6.36z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Please Rotate Your Device</h2>
        <p className="text-lg opacity-80">For the best experience, please rotate your device to landscape mode</p>
      </div>
    </div>
  )
}
