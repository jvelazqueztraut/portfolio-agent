import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import radGradImage from '@/assets/img/rad-grad.png';

interface GradientSpriteProps {
  position: [number, number, number];
  color: THREE.Color;
  opacity: number;
  size: number;
  texture: THREE.Texture;
  hasFog?: boolean;
}

function GradientSprite({
  position,
  color,
  opacity,
  size,
  texture,
  hasFog = true,
}: GradientSpriteProps) {
  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial
        map={texture}
        color={color}
        opacity={opacity}
        transparent
        fog={hasFog}
        depthWrite={false}
      />
    </sprite>
  );
}

interface GradientBackgroundProps {
  hue?: number;
  numSprites?: number;
  opacity?: number;
  radius?: number;
  size?: number;
  z?: number;
  sat?: number;
  hasFog?: boolean;
}

export function GradientBackground({
  hue = 0.0,
  numSprites = 10,
  opacity = 1,
  radius = 1,
  size = 1,
  z = 0,
  sat = 0.5,
  hasFog = true,
}: GradientBackgroundProps) {
  const gradientTexture = useTexture(radGradImage.src);

  // Configure texture properties for smooth background rendering
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    gradientTexture.magFilter = THREE.LinearFilter;
    gradientTexture.minFilter = THREE.LinearFilter;
  }, [gradientTexture]);

  const sprites = useMemo(() => {
    const spriteData: Array<{
      position: [number, number, number];
    }> = [];

    /* eslint-disable react-hooks/purity */
    for (let i = 0; i < numSprites; i += 1) {
      const angle = (i / numSprites) * Math.PI * 2;
      const randomRadius = Math.random() * radius;
      const pos: [number, number, number] = [
        Math.cos(angle) * randomRadius,
        Math.sin(angle) * randomRadius,
        z + Math.random(),
      ];

      spriteData.push({ position: pos });
    }

    return spriteData;
  }, [numSprites, radius, z]);

  const color = useMemo(
    () => new THREE.Color().setHSL(hue, 1, sat),
    [hue, sat]
  );

  return (
    <group>
      {sprites.map((sprite, index) => (
        <GradientSprite
          key={index}
          position={sprite.position}
          color={color}
          opacity={opacity}
          size={size}
          hasFog={hasFog}
          texture={gradientTexture}
        />
      ))}
    </group>
  );
}
