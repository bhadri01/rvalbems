"use client";

import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { pageAtom, pagesAtom } from "./UI";
import { useOrientation } from "./OrientationProvider";

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

// Responsive page dimensions
const getPageDimensions = (isMobile, isLandscape) => {
  if (isMobile && isLandscape) {
    return {
      PAGE_WIDTH: 3.2,
      PAGE_HEIGHT: 2.1,
      PAGE_DEPTH: 0.003,
      PAGE_SEGMENTS: 30,
    };
  }
  return {
    PAGE_WIDTH: 2.58,
    PAGE_HEIGHT: 1.71,
    PAGE_DEPTH: 0.003,
    PAGE_SEGMENTS: 30,
  };
};

const createPageGeometry = (dimensions) => {
  const { PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS } = dimensions;
  const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

  const pageGeometry = new BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENTS,
    2
  );

  pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

  const position = pageGeometry.attributes.position;
  const vertex = new Vector3();
  const skinIndexes = [];
  const skinWeights = [];

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;

    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
    const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }

  pageGeometry.setAttribute(
    "skinIndex",
    new Uint16BufferAttribute(skinIndexes, 4)
  );
  pageGeometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4)
  );

  return { pageGeometry, SEGMENT_WIDTH };
};

const whiteColor = new Color("white");
const emissiveColor = new Color("orange");

const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
];

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const [pages] = useAtom(pagesAtom);
  const [picture, picture2] = useTexture([front, back]);
  const { isMobile, isLandscape } = useOrientation();

  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const skinnedMeshRef = useRef();

  const dimensions = getPageDimensions(isMobile, isLandscape);
  const { pageGeometry, SEGMENT_WIDTH } = useMemo(
    () => createPageGeometry(dimensions),
    [isMobile, isLandscape]
  );

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= dimensions.PAGE_SEGMENTS; i++) {
      const bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }
    const skeleton = new Skeleton(bones);
    const isCover = number === 0 || number === pages.length - 1;
    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        roughness: 0.1,
        emissive: emissiveColor,
        emissiveIntensity: isCover ? 0.05 : 0.15,
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        roughness: 0.1,
        emissive: emissiveColor,
        emissiveIntensity: isCover ? 0.05 : 0.15,
      }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [pageGeometry, SEGMENT_WIDTH, picture, picture2, pages.length, number]);

  const [_, setPage] = useAtom(pageAtom);
  const [highlighted, setHighlighted] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const emissiveIntensity = highlighted ? 0.02 : 0;
    skinnedMeshRef.current.material[4].emissiveIntensity =
      skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
        skinnedMeshRef.current.material[4].emissiveIntensity,
        emissiveIntensity,
        0.01
      );

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }
    let turningTime =
      Math.min(400, new Date().getTime() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;
      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }
      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  picture.colorSpace = picture2.colorSpace = SRGBColorSpace;

  useCursor(highlighted && !isMobile);

  useEffect(() => {
    const preventScroll = (e) => {
      if (touchStart) e.preventDefault();
    };
    document.body.addEventListener("touchmove", preventScroll, {
      passive: false,
    });
    return () => {
      document.body.removeEventListener("touchmove", preventScroll);
    };
  }, [touchStart]);

  return (

  <group
  {...props}
  ref={group}
  onPointerDown={(e) => {
    e.stopPropagation();
    group.current.userData.pointerDown = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      type: e.pointerType,
    };
  }}
  onPointerUp={(e) => {
    e.stopPropagation();
    const down = group.current.userData.pointerDown;
    if (!down) return;

    const dx = Math.abs(e.clientX - down.x);
    const dy = Math.abs(e.clientY - down.y);
    const dt = Date.now() - down.time;

    // Tap detection threshold
    const isTap = dx < 10 && dy < 10 && dt < 300;

    if (isTap) {
      setPage(opened ? number : number + 1);
    }

    // Reset
    group.current.userData.pointerDown = null;
  }}
  onPointerEnter={(e) => {
    if (e.pointerType === "mouse") setHighlighted(true);
  }}
  onPointerLeave={(e) => {
    if (e.pointerType === "mouse") setHighlighted(false);
  }}
>

      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={
          -number * dimensions.PAGE_DEPTH + page * dimensions.PAGE_DEPTH
        }
      />
    </group>
  );
};

export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);
  const [pages] = useAtom(pagesAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const { isMobile } = useOrientation();

  useEffect(() => {
    pages.forEach((pageData) => {
      useTexture.preload(pageData.front);
      useTexture.preload(pageData.back);
    });
  }, [pages]);

  useEffect(() => {
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
        return delayedPage;
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [page]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {[...pages].map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          {...pageData}
        />
      ))}
    </group>
  );
};
