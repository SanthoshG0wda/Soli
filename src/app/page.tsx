import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-[720px] mx-auto py-12 sm:py-16">
      <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.03em] leading-[1.05] text-white">
        Research Indian law
        <br />
        <span className="text-[#9AA0A8] font-normal">with sources you can cite.</span>
      </h1>
      <p className="mt-4 max-w-[520px] text-[15px] leading-6 text-[#9AA0A8]">
        Ask questions across your Acts and judgments. Every answer includes the exact sections to verify.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link href="/chat" className="inline-flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-[13px] font-medium transition-colors">
          Start researching <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link href="/documents" className="text-[13px] font-medium text-[#9AA0A8] hover:text-white px-3 py-2">
          Browse library
        </Link>
      </div>
    </div>
  );
}
