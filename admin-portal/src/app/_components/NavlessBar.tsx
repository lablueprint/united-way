import Image from 'next/image';

import "../_styles/NavlessBar.css";

export default function NavlessBar() {
    return (
        <div className="logoContainer">
            <Image
                src="/uw-logo-white.svg"
                width={149}
                height={40.02}
                alt="UW Logo"
            />
        </div>
    )
}
