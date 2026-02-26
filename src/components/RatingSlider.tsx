"use client";

interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RatingSlider({ value, onChange }: RatingSliderProps) {
  return (
    <div className="slider-wrap">
      <label>
        <span>Ta note</span>
        <span className="note-val">
          {value}
          <span className="note-denom">/10</span>
        </span>
      </label>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider-ticks">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <span key={n} className={n <= value ? "tick active" : "tick"} />
        ))}
      </div>
    </div>
  );
}