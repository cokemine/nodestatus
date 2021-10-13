import React, { FC, ReactNode } from 'react';

interface Props {
  icon: ReactNode,
  title: string;
  count: number,
}

const StateCard: FC<Props> = ({ icon, title, count }) => (
  <div className="flex items-center p-4 bg-white rounded-lg ring-1 ring-black ring-opacity-5">
    {icon}
    <div className="ml-4">
      <h1 className="text-lg mb-2">{title}</h1>
      <p className="text-base font-semibold">{count}</p>
    </div>
  </div>
);

export default StateCard;
