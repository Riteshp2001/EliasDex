import Image from "next/image";

const Loader = ({ className, width = 96, height = 96 }) => {
  return (
    <div className={`flex loader justify-center select-none items-center ${className}`}>
      <Image
        src="/images/loader.gif"   // langsung dari public
        alt="Loading..."
        width={width}
        height={height}
        className="w-auto h-auto"
        unoptimized   // diperlukan agar GIF animasi tetap berjalan
        priority
      />
    </div>
  );
};

export default Loader;