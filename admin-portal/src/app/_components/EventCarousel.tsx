import { useEffect, useState } from 'react';
import '@/app/_styles/EventCarousel.css';
import Image from 'next/image';
import placeholder from '../../../public/images/event-img.svg';
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
  imageURL?: string;
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
  const [nextItemIndex, setNextItemIndex] = useState(visibleCount);

  useEffect(() => {
    if (events.length >= visibleCount) {
      setVisibleEvents(events.slice(0, visibleCount));
      setFocusIndex(0);
      setNextItemIndex(visibleCount);
    }
  }, [events, visibleCount]);

  useEffect(() => {
    if (visibleEvents.length < visibleCount) return;

    const interval = setInterval(() => {
      setFocusIndex((prev) => {
        if (prev < visibleCount - 1) {
          return prev + 1;
        } else {
          const nextEvent = events[nextItemIndex % events.length];
          setVisibleEvents((prevEvents) => [nextEvent, ...prevEvents.slice(0, visibleCount - 1)]);
          setNextItemIndex((i) => (i + 1) % events.length);
          return 0;
        }
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [visibleEvents, nextItemIndex, events, visibleCount, intervalMs]);

  return (
    <div className="event-carousel-wrapper">
        {/* Featured image */}
        <div className="carousel-img-container">
            <Image className="carousel-img" fill src={visibleEvents[focusIndex]?.imageURL || placeholderTwo} alt="Featured event thumbnail." />
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
                        <div className="event-name-wrapper">
                            {i === focusIndex && <Image src={rightArrowDark} alt="Right arrow icon" />}
                            <p className="event-name">{event.name}</p>
                        </div>
                        <div className="event-date-time">
                            <p className="event-date">Today</p>
                            <p className="event-time">{startTime} - {endTime}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    </div>
    
  );
}
