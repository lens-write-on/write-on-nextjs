import React, { useRef, useEffect } from 'react';
import Orbs from './Orbs';
import TextTrail from '../Trail/TextTrail';

export default function OrbWithTextTrail({
  hue = 0,
  hoverIntensity = 0.5,
  rotateOnHover = true,
  forceHoverState = false,
  height = null,
  width = null,
  fillContainer = true,
}) {
  const containerRef = useRef(null);
  const orbContainerRef = useRef(null);

  useEffect(() => {
    // Manual handling of mouse events to ensure both components receive events
    if (!containerRef.current) return;

    const handleMouseMove = (e) => {
      // We need to manually send mouse events to the orb container
      // since the trail sits on top but is pointer-events-none
      if (orbContainerRef.current) {
        const rect = orbContainerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create a new MouseEvent for the orb
        const mouseEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: e.clientX,
          clientY: e.clientY
        });

        // Dispatch to orb container
        orbContainerRef.current.dispatchEvent(mouseEvent);
      }
    };

    // Attach mouse move listener to container
    containerRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {/* The Orb component with a ref for event handling */}
      <div className="w-full h-full" ref={orbContainerRef}>
        <Orbs
          hue={hue}
          hoverIntensity={hoverIntensity}
          rotateOnHover={rotateOnHover}
          forceHoverState={forceHoverState}
          height={height}
          width={width}
          fillContainer={fillContainer}
        />
      </div>
      
      {/* The TextTrail effect that follows mouse movement */}
      <TextTrail variant={1} />
    </div>
  );
}