import Image from 'next/image';
import { useRouter } from 'next/navigation';

import "../_styles/NavBar.css";

export default function NavigationBar() {
    const router = useRouter();

    return (
        <div className="body">
            <div className="leftContainer">
                <div className="NavBar-logoContainer" onClick={() => { router.push("/landing") }}>
                    <Image
                        src="/uwlogo.svg"
                        width={149}
                        height={40.02}
                        alt="UW Logo"
                    />
                </div>
                <div className="tabContainer">
                    <button className="NavBar-tabHeader" onClick={() => { router.push('/landing'); }}>Home</button>
                    <button className="NavBar-tabHeader" onClick={() => { router.push('/events'); }}>Events</button>
                    <button className="NavBar-tabHeader" onClick={() => { router.push('/rewards'); }}>Rewards</button>
                </div>
            </div>
            <div className="rightContainer">
                <button className="NavBar-tabHeader" onClick={() => { router.push('/profile'); }}>
                    <Image
                        src="/profilelogo.svg"
                        width={32}
                        height={32}
                        alt="UW Logo"
                    />
                </button>
            </div >
        </div >
    )
}
