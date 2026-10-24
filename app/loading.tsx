import Image from "next/image";
import loader from "@/assets/loader.gif";

const LoadingPage = () => {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <Image src={loader} alt="Memuat..." width={120} priority unoptimized />
    </div>
  );
};

export default LoadingPage;
