import { useId, type ReactNode } from 'react'
import type { BuildingType } from './types'

const art: Record<BuildingType, ReactNode> = {
  house: (
    <>
      <path fill="#f5c66b" stroke="#8d5736" strokeWidth="2" strokeLinejoin="round" d="M29 47 67 32l28 15v39L67 99 29 83Z" />
      <path fill="#e9a84f" stroke="#8d5736" strokeWidth="2" strokeLinejoin="round" d="m67 32 28 15v39L67 99Z" />
      <path fill="#d95d4c" stroke="#8d5736" strokeWidth="2" strokeLinejoin="round" d="m23 47 31-28 21 13-8 12-19-10-19 20Z" />
      <path fill="#b94741" stroke="#8d5736" strokeWidth="2" strokeLinejoin="round" d="m54 19 32 17 13 12-12 6-20-12-10 2 8-12Z" />
      <path fill="#8d5736" d="M54 69a8 8 0 0 1 16 0v27l-16 6Z" />
      <path fill="#b8e8ed" stroke="#8d5736" strokeWidth="2" d="M36 56 49 61v13l-13-5Zm38 0 13 6v13l-13-5Z" />
      <path stroke="#fff0b7" strokeWidth="2" d="M42 57v13m-6-7 13 5m26-11v13m-6-7 13 5" />
      <path fill="#75472e" d="M59 82h5v2h-5z" />
      <path fill="#a94e3f" stroke="#8d5736" strokeWidth="2" d="M78 30V15l9 5v15Z" />
    </>
  ),
  lumber: (
    <>
      <path fill="#c8884b" stroke="#784a30" strokeWidth="2" strokeLinejoin="round" d="m24 53 39-17 33 17v30L63 100 24 82Z" />
      <path fill="#a9693e" stroke="#784a30" strokeWidth="2" strokeLinejoin="round" d="m63 36 33 17v30L63 100Z" />
      <path fill="#b65f45" stroke="#784a30" strokeWidth="2" strokeLinejoin="round" d="m18 53 44-25 41 22-11 8-30-16-28 17Z" />
      <path fill="#ead39a" stroke="#784a30" strokeWidth="2" d="m36 60 27-14v36L36 95Z" />
      <path fill="#d9b66e" stroke="#784a30" strokeWidth="2" d="m64 61 19-10v24L64 86Z" />
      <path fill="#8d5232" d="m31 83 26-13v5L31 89Zm0 7 26-13v5L31 96Z" />
      <path fill="#e5bc72" stroke="#784a30" strokeWidth="2" d="M74 84q12-9 23-2l-1 7q-11-6-22 2Z" />
      <path fill="#b87742" stroke="#784a30" strokeWidth="2" d="M76 87q11-7 19-2v5q-10-4-19 3Z" />
      <path fill="#f5d58f" stroke="#784a30" strokeWidth="2" d="m36 48 16-9 8 5-16 9Z" />
      <path stroke="#fff0bd" strokeWidth="2" d="m39 48 14-7" />
    </>
  ),
  quarry: (
    <>
      <path fill="#8a9b9a" stroke="#4d6661" strokeWidth="2" strokeLinejoin="round" d="m25 67 17-31 14 12 11-25 16 28 13-9 10 32-27 20-43-8Z" />
      <path fill="#b5c4ad" stroke="#4d6661" strokeWidth="2" strokeLinejoin="round" d="m42 36 14 12 11-25 8 27-19 7-15-6Z" />
      <path fill="#718784" stroke="#4d6661" strokeWidth="2" d="m67 50 16 1 13-9 10 32-27 20-9-6Z" />
      <path fill="#667976" stroke="#405652" strokeWidth="2" d="M43 82q0-21 17-21t17 21v16H43Z" />
      <path fill="#344a45" d="M50 83q0-13 10-13t10 13v12H50Z" />
      <path fill="#f5d17d" d="m77 68 4-2 2 5-4 2zm8 8 4-2 2 5-4 2zm-40-1 4-3 3 5-4 3z" />
      <path fill="#d59658" stroke="#6c563d" strokeWidth="2" d="m85 28 4-2 8 21-4 2Z" />
      <path stroke="#6c563d" strokeWidth="3" strokeLinecap="round" d="m82 28 11-4" />
      <path fill="#e9b961" stroke="#6c563d" strokeWidth="2" d="m78 27 9-4 4 8-9 4Z" />
    </>
  ),
  market: (
    <>
      <path fill="#f3d7a0" stroke="#86593a" strokeWidth="2" strokeLinejoin="round" d="m24 49 40-17 33 17v34L64 100 24 82Z" />
      <path fill="#e2bd78" stroke="#86593a" strokeWidth="2" strokeLinejoin="round" d="m64 32 33 17v34L64 100Z" />
      <path fill="#f4f0d7" stroke="#86593a" strokeWidth="2" d="m34 58 29-13v34L34 92Z" />
      <path fill="#a85744" stroke="#86593a" strokeWidth="2" d="m64 59 23-11v27L64 87Z" />
      <path fill="#f4f0d7" stroke="#86593a" strokeWidth="2" d="M69 65v17l13-6V59Z" />
      <path fill="#df6250" stroke="#86593a" strokeWidth="2" strokeLinejoin="round" d="m27 47 7-14 61 1 8 15-8 7-7-9-8 12-8-8-9 14-8-9-9 15-8-9-8 12-8-7Z" />
      <path fill="#fff0d2" d="m34 38 10 1-7 17-10-9zm20 1 10 1-7 17-10-5zm21 0 10 1-8 17-9-7z" />
      <path fill="#9c623b" d="M40 64h12v4H40zm0 8h12v4H40zm38-30h8v5h-8z" />
      <path fill="#91c9bc" d="m39 57 5-11 9 4-5 11z" />
    </>
  ),
  hut: (
    <>
      <path fill="#e0ae68" stroke="#835437" strokeWidth="2" strokeLinejoin="round" d="m31 49 34-15 29 15v37L65 99 31 82Z" />
      <path fill="#cc8e50" stroke="#835437" strokeWidth="2" strokeLinejoin="round" d="m65 34 29 15v37L65 99Z" />
      <path fill="#8b6445" stroke="#65432f" strokeWidth="2" strokeLinejoin="round" d="m25 49 39-29 36 26-8 11-27-18-32 21Z" />
      <path fill="#5a4939" stroke="#65432f" strokeWidth="2" d="M53 71a12 12 0 0 1 24 0v25l-24 6Z" />
      <path fill="#a7dce1" stroke="#65432f" strokeWidth="2" d="m35 58 12 6v12l-12-6Z" />
      <path fill="#eee0b8" d="M57 76h16v3H57z" />
      <path stroke="#65432f" strokeWidth="2" d="M81 55v27m6-24v24" />
      <path fill="#e0c48b" stroke="#65432f" strokeWidth="2" d="m81 53 11-6 1 6-12 7Z" />
      <path fill="#d5b479" stroke="#65432f" strokeWidth="2" d="m78 54 5-12 6 3-4 12Z" />
      <path fill="#765035" d="m31 81 20 9v5l-20-9z" />
    </>
  ),
  tower: (
    <>
      <path fill="#b9bec0" stroke="#606b70" strokeWidth="2" strokeLinejoin="round" d="m36 41 28-12 30 15v44L64 101 36 86Z" />
      <path fill="#929ea1" stroke="#606b70" strokeWidth="2" strokeLinejoin="round" d="m64 29 30 15v44L64 101Z" />
      <path fill="#d7d9d2" stroke="#606b70" strokeWidth="2" d="M43 41V29l8 4v-8l8 4v-8l10 5v12Z" />
      <path fill="#b7bfbe" stroke="#606b70" strokeWidth="2" d="M64 38V26l9 5v-8l8 4v-8l10 6v22Z" />
      <path fill="#8d4f4e" stroke="#60413c" strokeWidth="2" strokeLinejoin="round" d="m29 42 35-25 38 24-9 10-29-18-27 19Z" />
      <path fill="#b86a5c" stroke="#60413c" strokeWidth="2" strokeLinejoin="round" d="m64 17 38 24-9 10-29-18Z" />
      <path fill="#614c43" stroke="#4b413a" strokeWidth="2" d="M55 73a9 9 0 0 1 18 0v25l-18 7Z" />
      <path fill="#f5cf78" stroke="#606b70" strokeWidth="2" d="M44 51h8v13h-8zm35 1h8v13h-8z" />
      <path fill="#78b7c0" stroke="#606b70" strokeWidth="2" d="M70 53h8v12h-8z" />
      <path fill="#d0e4d7" d="M48 53h1v8h-1zm34 1h1v8h-1z" />
      <path fill="#e9c56c" d="m61 75 3-5 3 5v7h-6Z" />
    </>
  ),
  castle: (
    <>
      <path fill="#c7c7bb" stroke="#5d6262" strokeWidth="2" strokeLinejoin="round" d="m22 53 42-22 40 22v35L64 108 22 86Z" />
      <path fill="#a3aaa5" stroke="#5d6262" strokeWidth="2" strokeLinejoin="round" d="m64 31 40 22v35L64 108Z" />
      <path fill="#d6d4c7" stroke="#5d6262" strokeWidth="2" d="M29 54V36l8 4V29l9 5V24l10 5v17Zm37-19V20l9 4V15l9 5V11l10 6v25Z" />
      <path fill="#b7bdb7" stroke="#5d6262" strokeWidth="2" d="M64 46V32l8 4V25l9 5V21l9 5v23Z" />
      <path fill="#9d554d" stroke="#62433d" strokeWidth="2" strokeLinejoin="round" d="m24 39 18-23 19 23-8 8-11-13-11 15Zm37-1 20-29 22 31-9 9-13-18-12 18Z" />
      <path fill="#bd6b5b" stroke="#62433d" strokeWidth="2" strokeLinejoin="round" d="m61 38 20-29 22 31-9 9-13-18-12 18Z" />
      <path fill="#57483e" stroke="#423a33" strokeWidth="2" d="M54 77a10 10 0 0 1 20 0v27l-20 10Z" />
      <path fill="#f1d27d" stroke="#5d6262" strokeWidth="2" d="M34 61h9v14h-9zm48 0h9v14h-9zM58 49h9v13h-9z" />
      <path fill="#768e89" stroke="#5d6262" strokeWidth="2" d="M72 54h8v13h-8z" />
      <path fill="#e1c173" d="M61 80h5v2h-5z" />
    </>
  ),
}

export default function BuildingArt({ type, progress = 1 }: { type: BuildingType; progress?: number }) {
  const clipId = useId().replace(/:/g, '')
  const reveal = progress >= 1 ? 1 : progress < 0.25 ? 0 : progress < 0.55 ? 0.52 : 0.88
  const foundationColors: Record<BuildingType, string> = {
    house: '#d8b982',
    lumber: '#bd8c5b',
    quarry: '#9aa39d',
    market: '#d7c69d',
    hut: '#bda47c',
    tower: '#aeb8b5',
    castle: '#aeb8b5',
  }

  return (
    <svg viewBox="0 0 120 110" aria-hidden="true" focusable="false">
      <ellipse cx="61" cy="86" rx="49" ry="19" fill="#57834b" opacity=".34" />
      <ellipse cx="59" cy="83" rx="47" ry="18" fill="#a7cf72" />
      <path d="m21 82 8-4m58 11 8-4M45 96l4-4m36-21 5-2" stroke="#e4e99b" strokeWidth="2" strokeLinecap="round" />
      <path d="m17 85 3-2m81-8 3-2M36 97l3-2" stroke="#638b4b" strokeWidth="3" strokeLinecap="round" />
      {progress < 1 && (
        <>
          <path d="m28 80 35-16 34 16-34 18Z" fill={foundationColors[type]} stroke="#655d4d" strokeWidth="2" strokeLinejoin="round" />
          <path d="m37 81 26-12 26 12-26 13Z" fill="none" stroke="#e9dfc4" strokeWidth="2" />
        </>
      )}
      {reveal > 0 && (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y={110 * (1 - reveal)} width="120" height={110 * reveal} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>{art[type]}</g>
        </>
      )}
      <path d="M22 82c2 0 3 2 2 4-2 2-5 0-4-2m77 8c2 0 3 2 2 4-2 2-5 0-4-2" fill="#f7e794" />
    </svg>
  )
}
