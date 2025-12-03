import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-red-500';
  if (score >= 50) colorClass = 'text-yellow-500';
  if (score >= 80) colorClass = 'text-green-500';

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-40 h-40">
        <svg
          height="100%"
          width="100%"
          className="transform -rotate-90"
        >
          <circle
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx="50%"
            cy="50%"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx="50%"
            cy="50%"
            className={colorClass}
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <span className={`text-4xl font-bold ${colorClass}`}>{score}</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">ATS SCORE</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;