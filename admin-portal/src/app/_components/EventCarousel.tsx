import { useEffect, useRef, useState } from 'react';
import '@/app/_styles/EventCarousel.css';
import Image from 'next/image';
import placeholderTwo from '../../../public/images/single-event.svg';
import rightArrowDark from '../../../public/images/right-arrow-dark.svg';

export interface EventData {
  _id: string;
  name: string;
  date: Date;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  organizerID: string;
  tags: string[];
  registeredUsers: string[];
  imageURL: string;
}

interface Props {
  events: EventData[];
  intervalMs?: number;
  visibleCount?: number;
  startTime?: string;
  endTime?: string;
}

export default function EventCarousel({
  events,
  intervalMs = 3000,
  visibleCount = 4,
  startTime = "12:00",
  endTime = "12:01",
}: Props) {
  const [visibleEvents, setVisibleEvents] = useState<EventData[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const visibleRef = useRef<EventData[]>([]);

  // Sync visibleEvents ref
  useEffect(() => {
    visibleRef.current = visibleEvents;
  }, [visibleEvents]);

  // Initialize visible window when events load
  useEffect(() => {
    if (events.length === 0) return;
    setVisibleEvents(events.slice(0, visibleCount));
    setFocusIndex(0);
  }, [events, visibleCount]);

  // Rotation + focus logic
  useEffect(() => {
    if (events.length === 0 || visibleEvents.length === 0) return;

    const interval = setInterval(() => {
      setFocusIndex((prevFocus) => {
        const isAtBottom = prevFocus >= visibleEvents.length - 1;

        if (!isAtBottom) {
          return prevFocus + 1;
        }

        // Reset focus
        if (events.length <= visibleCount) {
          return 0;
        }

        // Rotate visible window forward
        const currentVisible = visibleRef.current;
        const first = currentVisible[0];
        const firstIndex = events.findIndex((e) => e._id === first._id);
        const newStart = (firstIndex - 1 + events.length) % events.length;

        const newWindow = [];
        for (let i = 0; i < visibleCount; i++) {
          newWindow.push(events[(newStart + i) % events.length]);
        }

        setVisibleEvents(newWindow);
        return 0;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [events, intervalMs, visibleCount, visibleEvents.length]);

  const featuredEvent = visibleEvents[focusIndex];

  return (
    <div className="event-carousel-wrapper">
      {/* Featured image */}
      <div className="carousel-img-container">
        <Image
          className="carousel-img"
          fill
          src={featuredEvent?.imageURL || placeholderTwo}
          alt="Featured event thumbnail."
        />
      </div>

      {/* Event slider */}
      <div className="slider-container">
        <div className="slider-track">
          <div className="list-title">
            <h2 className="subtitle">Events Today</h2>
          </div>
          <div>
            {visibleEvents.map((event, i) => (
              <div
                key={`${event._id}-${i}`}
                className={`event-slide ${i === focusIndex ? 'focused' : ''}`}
              >
                {event.name ? (
                  <>
                    <div className="event-name-wrapper">
                      {i === focusIndex && (
                        <Image src={rightArrowDark} alt="Right arrow icon" />
                      )}
                      <p className="event-name">{event.name}</p>
                    </div>
                    <div className="event-date-time">
                      <p className="event-date">Today</p>
                      <p className="event-time">
                        {startTime} - {endTime}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="event-placeholder" style={{ height: '48px' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
