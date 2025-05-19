'use client';
import { useEffect, useRef, useState } from 'react';
import '@/app/_styles/EventCarousel.css';
import Image from 'next/image';
import placeholderTwo from '../../../public/Landing/images/single-event.svg';
import rightArrowDark from '../../../public/EventCarousel/images/right-arrow-dark.svg';

export interface EventData {
  _id: string;
  name: string;
  date: Date;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  startTime: string;
  endTime: string;
  organizerID: string;
  tags: string[];
  registeredUsers: string[];
  imageURL: string;
}

interface Props {
  events: EventData[];
  intervalMs?: number;
  visibleCount?: number;
}

export default function EventCarousel({
  events,
  intervalMs = 3000,
  visibleCount = 4,
}: Props) {
  const [visibleEvents, setVisibleEvents] = useState<EventData[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const totalPages = Math.ceil(events.length / visibleCount);

  // Initialize first page on load
  useEffect(() => {
    if (events.length === 0) return;
    const start = 0;
    const end = visibleCount;
    setVisibleEvents(events.slice(start, end));
    setFocusIndex(0);
    setPageIndex(0);
  }, [events, visibleCount]);

  // Auto scroll and rotate pages
  // Auto scroll and rotate pages
  useEffect(() => {
    if (events.length === 0) return;

    const totalPages = Math.ceil(events.length / visibleCount);

    const interval = setInterval(() => {
      if (totalPages <= 1) {
        setFocusIndex((prev) =>
          prev < visibleEvents.length - 1 ? prev + 1 : 0
        );
        return;
      }

      setFocusIndex((prevFocus) => {
        const isAtBottom = prevFocus >= visibleEvents.length - 1;

        if (!isAtBottom) {
          return prevFocus + 1;
        }

        setTransitioning(true);

        setTimeout(() => {
          const nextPage = (pageIndex + 1) % totalPages;
          const start = nextPage * visibleCount;
          const end = start + visibleCount;
          const nextVisibleEvents = events.slice(start, end);

          setVisibleEvents(nextVisibleEvents);
          setPageIndex(nextPage);
          setFocusIndex(0);
          setTransitioning(false);
        }, 300);

        return prevFocus;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [events, intervalMs, visibleCount, pageIndex, visibleEvents.length]);

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
          <div className={`event-page ${transitioning ? 'page-transition' : ''}`}>
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
                        {event.startTime} - {event.endTime} PM
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
