"use client";

import { useEffect, useState } from "react";
import { Check, Download, Link2, Share2 } from "lucide-react";

function currentUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

function fileNameFromTitle(title: string, src: string) {
  const ext = src.split("?")[0]?.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() || "jpg";
  const base = title.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 60) || "news";
  return `${base}.${ext}`;
}

function openShare(href: string) {
  window.open(href, "_blank", "noopener,noreferrer,width=640,height=720");
}

export function ShareBar({
  title,
  path,
  imageSrc,
}: {
  title: string;
  path: string;
  imageSrc?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  async function copyLink() {
    await navigator.clipboard.writeText(currentUrl(path));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url: currentUrl(path) });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      await copyLink();
    }
  }

  async function downloadImage() {
    if (!imageSrc) return;
    setDownloadError(null);
    setDownloading(true);
    const absolute = new URL(imageSrc, window.location.origin).toString();
    const filename = fileNameFromTitle(title, absolute);
    try {
      const res = await fetch(absolute);
      if (!res.ok) throw new Error("이미지를 불러오지 못했습니다.");
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
      const ua = navigator.userAgent;
      const inAppOrIos =
        /iPad|iPhone|iPod/.test(ua) ||
        /KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER|wv\)|; wv/i.test(ua);

      // 한인회 앱·인앱 브라우저·iOS는 a[download]가 무시되는 경우가 많아
      // 파일 공유 시트로 사진 앱·파일 앱에 저장하게 한다.
      if (inAppOrIos && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title });
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setDownloadError("다운로드에 실패했습니다. 이미지를 길게 눌러 저장해 주세요.");
      window.open(absolute, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  function share(kind: "facebook" | "x" | "whatsapp") {
    const url = encodeURIComponent(currentUrl(path));
    const text = encodeURIComponent(title);
    if (kind === "facebook") {
      openShare(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
      return;
    }
    if (kind === "x") {
      openShare(`https://twitter.com/intent/tweet?url=${url}&text=${text}`);
      return;
    }
    openShare(`https://wa.me/?text=${text}%20${url}`);
  }

  const buttonClass =
    "inline-flex h-8 items-center rounded-lg border border-border bg-white px-3 text-xs font-medium text-foreground hover:bg-muted";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">공유</span>
      {canNativeShare && (
        <button type="button" className={buttonClass} onClick={() => void nativeShare()}>
          <Share2 className="mr-1.5 h-3.5 w-3.5" />
          공유하기
        </button>
      )}
      <button type="button" className={buttonClass} onClick={() => void copyLink()}>
        {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Link2 className="mr-1.5 h-3.5 w-3.5" />}
        {copied ? "복사됨" : "링크 복사"}
      </button>
      {imageSrc ? (
        <button
          type="button"
          className={buttonClass}
          disabled={downloading}
          onClick={() => void downloadImage()}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {downloading ? "저장 중..." : "이미지 다운로드"}
        </button>
      ) : null}
      <button type="button" className={buttonClass} onClick={() => share("facebook")}>
        Facebook
      </button>
      <button type="button" className={buttonClass} onClick={() => share("x")}>
        X
      </button>
      <button type="button" className={buttonClass} onClick={() => share("whatsapp")}>
        WhatsApp
      </button>
      {downloadError ? <p className="w-full text-xs text-red-600">{downloadError}</p> : null}
    </div>
  );
}
