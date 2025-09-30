import { JSX } from "react";

export interface IconFCProps {
  className?: string;
  style?: React.CSSProperties;
}

export type IconFC = (props?: IconFCProps) => JSX.Element;

type SvgProps = React.PropsWithChildren & {
  width?: number;
  height?: number;
  viewBox?: string;
  className?: string;
};

export const Svg = (props: SvgProps) => (
  <svg
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="geometricPrecision"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    {...props}
  />
);
