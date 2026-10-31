"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: "sans-serif", padding: 24 }}>
        <h2>문제가 발생했습니다.</h2>
        <button type="button" onClick={() => reset()}>
          다시 시도
        </button>
      </body>
    </html>
  );
}
