import { animated, useTransition } from '@react-spring/web';
import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import useResizeObserver from 'use-resize-observer/polyfilled';
import { randomId } from '../../utils/math';

import { useAnalytics } from '../../context';
import colors from '../../enums/colors';
import { mergeRefs } from '../../utils/refs';
import { StyledSubcomponentType, SubcomponentPropsType } from '../commonTypes';

const Container = styled(animated.div)`
  position: relative;
`;

const SVGContainer = styled.svg`
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
`;

type Animation = { cx: string; cy: string; id: string };
type Transition = { r: string } & Animation;
export type InteractionFeedbackProps = {
  StyledContainer?: StyledSubcomponentType;
  StyledSVGContainer?: StyledSubcomponentType;
  containerProps?: SubcomponentPropsType;
  svgContainerProps?: SubcomponentPropsType;

  children?: React.ReactNode;
  color?: string;
  interpolationFunctions?: Record<string, (val: any) => any>;
  // TODO add proper type from react-spring
  transitionProps?: any;
  containerRef?: React.RefObject<HTMLDivElement>;
  SVGContainerRef?: React.RefObject<SVGElement>;
};

const defaultInterpolationFunctions = {
  r: (r: any) => r.to((val: string) => `${Math.abs(parseFloat(val)).toFixed(1)}`),
  opacity: (opacity: any) => opacity.to((val: number) => val.toFixed(2)),
};
const defaultTransitionProps = {
  from: {
    r: 0,
    opacity: 0.5,
  },
  enter: {
    r: 100,
    opacity: 0,
  },
  config: {
    mass: 90,
    tension: 1000,
    friction: 20,
    clamp: true,
  },
};
const InteractionFeedback = ({
  StyledContainer = Container,
  StyledSVGContainer = SVGContainer,
  containerRef,
  SVGContainerRef,
  containerProps = {},
  svgContainerProps = {},
  color = colors.primary,

  children,
  interpolationFunctions = defaultInterpolationFunctions,
  transitionProps = { ...defaultTransitionProps },
}: InteractionFeedbackProps): JSX.Element => {
  const internalRef = useRef<HTMLDivElement>();
  const { ref, width = 0, height = 0 } = useResizeObserver<HTMLDivElement>();
  const [animations, setAnimations] = useState<Array<Animation>>([]);

  const transitions = useTransition(animations, {
    keys: (item: Animation) => item.id,
    onRest: (item: Transition) => setAnimations(a => a.filter(ani => ani.id === item.id)),
    ...transitionProps,
  });
  const fragment = transitions((style, item) => {
    const circleProps = Object.entries(style).reduce((acc, [key, val]) => {
      return {
        ...acc,
        [key]: interpolationFunctions[key] ? interpolationFunctions[key](val) : val,
      };
    }, {});
    return <animated.circle cx={item.cx} cy={item.cy} fill={color} {...circleProps} />;
  });

  const mouseDownHandler = useCallback(
    (e: React.MouseEvent) => {
      if (internalRef && internalRef.current) {
        e.persist();
        const boundingRect = internalRef.current.getBoundingClientRect();
        const { clientX, clientY } = e;
        const percentX = (100 * (clientX - boundingRect.left)) / boundingRect.width;
        const percentY = (100 * (clientY - boundingRect.top)) / boundingRect.height;

        setAnimations(a => [...a, { cx: `${percentX}%`, cy: `${percentY}%`, id: randomId(18) }]);
      }
    },
    [internalRef],
  );

  const handleEventWithAnalytics = useAnalytics();
  const handleMouseDown = (e: any) =>
    handleEventWithAnalytics(
      'InteractionFeedback',
      mouseDownHandler,
      'onMouseDown',
      e,
      containerProps,
    );

  return (
    <StyledContainer
      ref={mergeRefs([ref, internalRef, containerRef])}
      onMouseDown={handleMouseDown}
      {...containerProps}
    >
      {children}
      <StyledSVGContainer
        width={`${width}px`}
        height={`${height}px`}
        viewBox={`0 0 ${width} ${height}`}
        ref={SVGContainerRef}
        {...svgContainerProps}
      >
        {fragment}
      </StyledSVGContainer>
    </StyledContainer>
  );
};

InteractionFeedback.Container = Container;
InteractionFeedback.SVGContainer = SVGContainer;
InteractionFeedback.defaultTransitionProps = defaultTransitionProps;
InteractionFeedback.defaultInterpolationFunctions = defaultInterpolationFunctions;

export default InteractionFeedback;
