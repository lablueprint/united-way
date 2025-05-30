import { useEffect, useState } from 'react';
import '../_styles/EventEndMarker.css';
import { emptyLogo } from '../../../public/Landing/Landing-index';
import Image from 'next/image';

export default function EventEndMarker() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const pageHeight = document.body.offsetHeight;

      const buffer = windowHeight * 0.7;
      const nearBottom = scrollY + windowHeight >= pageHeight - buffer;
      setVisible(nearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className={`fade-message ${visible ? 'visible' : ''}`}>
      <div className="empty-event">
        <div className="empty-content">
          <Image src={emptyLogo} alt="United Way Sheer Blue Logo" width={80} />
          <p className="empty-text">No more upcoming events.</p>
        </div>
      </div>
    </div>
  );
}

export function VisibleEventEndMarker() {
  return (
    <div className='visible'>
      <div className="empty-event">
        <div className="content">
          <Image src={emptyLogo} alt="United Way Sheer Blue Logo" width={80} />
          <div className="content-text">No events created.</div>
        </div>
      </div>
    </div>
  );
}