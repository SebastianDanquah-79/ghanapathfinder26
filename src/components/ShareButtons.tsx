import { useState, RefObject } from "react";
import { Share2, Copy, Download, Check, MessageCircle } from "@/lib/icons";

interface ShareButtonsProps {
  studentName: string;
  resultRef: RefObject<HTMLDivElement | null>;
}

const ShareButtons = ({ studentName, resultRef }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `I just found my perfect university match on GhanaPathFinder 🇬🇭 Check it out!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${pageUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    console.log("1. Button clicked");
    if (!resultRef.current) {
      console.log("2. STOPPED: resultRef.current is null");
      return;
    }
    console.log("2. resultRef found, element:", resultRef.current);
    try {
      console.log("3. Loading html2canvas...");
      const html2canvas = (await import("html2canvas")).default;
      console.log("4. html2canvas loaded, starting capture...");
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: "#0a1628",
        scale: 2,
        useCORS: true,
      });
      console.log("5. Canvas captured, size:", canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        console.log("6. toBlob callback fired, blob:", blob);
        if (!blob) {
          console.log("7. STOPPED: blob is null");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `GhanaPathFinder-${studentName.replace(/\s+/g, "-")}.png`;
        link.href = url;
        document.body.appendChild(link);
        console.log("8. Triggering click on:", link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("9. Done");
      }, "image/png");
    } catch (err) {
      console.log("ERROR CAUGHT:", err);
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${pageUrl}`)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, "_blank");
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, "_blank");
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground flex items-center gap-2">
        <Share2 className="h-4 w-4 text-primary" />
        Share Your Results
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={shareWhatsApp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366]/20 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/30 transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </button>
        <button
          onClick={shareFacebook}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2]/20 text-[#1877F2] text-sm font-medium hover:bg-[#1877F2]/30 transition-colors"
        >
          Facebook
        </button>
        <button
          onClick={shareLinkedIn}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A66C2]/20 text-[#0A66C2] text-sm font-medium hover:bg-[#0A66C2]/30 transition-colors"
        >
          LinkedIn
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors"
        >
          <Download className="h-4 w-4" /> Download PNG
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;
