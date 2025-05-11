import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

function getLocalPointerPos(e, rect) {
  let clientX = 0, clientY = 0;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function getMouseDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

class TextItem {
  DOM = { el: null, inner: null };
  defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 };
  rect = null;

  constructor(DOM_el) {
    this.DOM.el = DOM_el;
    this.DOM.inner = this.DOM.el.querySelector('.content__text-inner');
    this.getRect();
    this.initEvents();
  }
  
  initEvents() {
    this.resize = () => {
      gsap.set(this.DOM.el, this.defaultStyle);
      this.getRect();
    };
    window.addEventListener('resize', this.resize);
  }
  
  getRect() {
    this.rect = this.DOM.el.getBoundingClientRect();
  }
}

class TextTrailEffect {
  constructor(container) {
    this.container = container;
    this.DOM = { el: container };
    this.texts = [...this.DOM.el.querySelectorAll('.content__text')].map(text => new TextItem(text));
    this.textsTotal = this.texts.length;
    this.textPosition = 0;
    this.zIndexVal = 1;
    this.activeTextsCount = 0;
    this.isIdle = true;
    this.threshold = 30; // Lower threshold to make trail appear more frequently

    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    // Add local event listeners
    const handlePointerMove = ev => {
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handlePointerMove);

    // Force an initial pointer position
    this.mousePos = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
    this.lastMousePos = { ...this.mousePos };
    this.cacheMousePos = { ...this.mousePos };

    // Start rendering immediately
    requestAnimationFrame(() => this.render());
  }

  render() {
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (distance > this.threshold) {
      this.showNextText();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }
    requestAnimationFrame(() => this.render());
  }

  showNextText() {
    ++this.zIndexVal;
    this.textPosition = this.textPosition < this.textsTotal - 1 ? this.textPosition + 1 : 0;
    const text = this.texts[this.textPosition];

    gsap.killTweensOf(text.DOM.el);
    gsap.timeline({
      onStart: () => this.onTextActivated(),
      onComplete: () => this.onTextDeactivated()
    })
      .fromTo(text.DOM.el, {
        opacity: 1,
        scale: 0.5,
        zIndex: this.zIndexVal,
        x: this.cacheMousePos.x - text.rect.width / 2,
        y: this.cacheMousePos.y - text.rect.height / 2
      }, {
        duration: 0.4,
        ease: 'power1',
        scale: 1,
        x: this.mousePos.x - text.rect.width / 2,
        y: this.mousePos.y - text.rect.height / 2
      }, 0)
      .to(text.DOM.el, {
        duration: 0.8,
        ease: 'power3',
        opacity: 0,
        scale: 0.5,
        y: '-=30', // Move slightly upward when fading
        rotationZ: () => gsap.utils.random(-10, 10) // Random rotation for dynamic effect
      }, 0.4);
  }

  onTextActivated() {
    this.activeTextsCount++;
    this.isIdle = false;
  }
  
  onTextDeactivated() {
    this.activeTextsCount--;
    if (this.activeTextsCount === 0) {
      this.isIdle = true;
    }
  }
}

const phrasesAboutAnalysis = [
  "Analyzing content",
  "Processing data",
  "Evaluating patterns",
  "Interpreting context",
  "Extracting insights",
  "Scanning elements",
  "Parsing information",
  "Decrypting signals",
  "Identifying trends",
  "Examining structures",
  "Computing analysis",
  "Learning patterns",
  "Collecting data points",
  "Reading content",
  "Synthesizing information"
];

export default function TextTrail({ variant = 1 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Make sure all text elements are initially properly sized
    const texts = containerRef.current.querySelectorAll('.content__text');
    texts.forEach(text => {
      const inner = text.querySelector('.content__text-inner');
      if (inner) {
        const rect = inner.getBoundingClientRect();
        text.style.width = `${rect.width}px`;
        text.style.height = `${rect.height}px`;
      }
    });
    
    // Initialize the effect after a small delay to ensure DOM is ready
    setTimeout(() => {
      new TextTrailEffect(containerRef.current);
    }, 100);

    // Trigger a fake mousemove to initialize trail
    const fakeEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2
    });
    containerRef.current.dispatchEvent(fakeEvent);
  }, [variant]);

  return (
    <div className="w-full h-full absolute inset-0 z-[100] bg-transparent overflow-visible pointer-events-auto" ref={containerRef}>
      {phrasesAboutAnalysis.map((phrase, i) => (
        <div 
          className="content__text absolute top-0 left-0 opacity-0 overflow-visible [will-change:transform,opacity] pointer-events-none" 
          key={i}
        >
          <div className="content__text-inner text-base text-center md:text-lg font-mono text-white whitespace-nowrap px-4 py-2 rounded-lg bg-black/80 backdrop-blur-sm shadow-lg border border-white/10">
            {phrase}
          </div>
        </div>
      ))}
    </div>
  );
}