export default function TransferBanner({
  open,
  openTitle,
  openBody,
  shutTitle,
  shutBody,
}: {
  open: boolean;
  openTitle: string;
  openBody: string;
  shutTitle: string;
  shutBody: string;
}) {
  const title = open ? openTitle : shutTitle;
  const body = open ? openBody : shutBody;
  return (
    <div className={`border-b ${open ? "bg-[#EAF3EA] border-[#CFE3CF]" : "bg-[#F3E9E4] border-[#E3D0C6]"}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-x-2 gap-y-0.5">
        <span className={`text-sm font-semibold ${open ? "text-[#2B5A2B]" : "text-[#8A4A2E]"}`}>{title}</span>
        <span className="text-sm text-[#55503F]">{body}</span>
      </div>
    </div>
  );
}
