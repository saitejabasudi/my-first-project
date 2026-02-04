
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function generateImageMetadata() {
  return [
    {
      id: '192',
      size: { width: 192, height: 192 },
    },
    {
      id: '512',
      size: { width: 512, height: 512 },
    },
  ];
}

export default function Icon({ id }: { id: string }) {
  const isSmall = id === '192';
  const size = isSmall ? 192 : 512;
  const svgSize = isSmall ? 120 : 320;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#221448',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '25%',
        }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5l-7 7 7 7" />
          <path d="M15 5l7 7-7 7" />
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
