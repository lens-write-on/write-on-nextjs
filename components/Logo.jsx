import AsciiText from "@/components/AsciiText";
import Link from "next/link";
const Logo = ({href='/'}) => {
    return (
    <Link href={href}>
    <div>
      <AsciiText 
          text='WRITEON'
          enableWaves={true}
          asciiFontSize={1}
          mouseMove={true}
          className="relative"
          style={{
            width: '180px',
            height: '80px',
          }}
      />
    </div>
    </Link>
    );
};

export default Logo;