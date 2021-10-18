import React, { FC, SVGProps } from 'react';
import classNames from 'classnames';

interface Props {
  icon: FC<SVGProps<SVGSVGElement>>,
  iconColorClass: string,
  bgColorClass: string,
}

const RoundIcon: FC<Props> = ({
  icon: Icon,
  iconColorClass,
  bgColorClass
}) => {
  const baseStyle = 'p-3 rounded-full';

  const cls = classNames(baseStyle, iconColorClass, bgColorClass);
  return (
    <div className={cls}>
      <Icon className="w-5 h-5" />
    </div>
  );
};

export default RoundIcon;
