import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import Icon from '@mdi/react';
import { mdiCheck, mdiClose, mdiMenuDown, mdiMenuUp } from '@mdi/js';
import { shade, tint, getLuminance, darken, readableColor } from 'polished';

import { useTheme } from '../../context';
import Button from '../Button/Button';
import variants from '../../enums/variants';
import timings from '../../enums/timings';
import { Div, Span } from '../../htmlElements';
import Tag, { TagProps } from '../Tag/Tag';
import { getFontColorFromVariant, getBackgroundColorFromVariant } from '../../utils/color';
import { SubcomponentPropsType, StyledSubcomponentType } from '../commonTypes';
import { getShadowStyle, getDropdownTagStyle } from '../../utils/styles';
import { mergeRefs } from '../../utils/refs';

export type OptionProps = {
  id: number | string;
  optionValue: ReactNode;
  isSelected?: boolean;
};

type UsefulDropdownState = {
  color: string;
  multi?: boolean;
  selected?: boolean;
  variant: variants;
  isOpenedBelow?: boolean;
  isHidden?: boolean;
};

const Container = styled(Div)`
  ${({ elevation, isOpen }) => {
    const { colors } = useTheme();
    return `
      width: fit-content;
      transition: filter ${timings.slow}, box-shadow ${timings.slow};
      ${getShadowStyle(elevation, colors.shadow)}
      position: relative;
      z-index: ${isOpen ? '7' : '1'};
    `;
  }}
`;
// TODO - Add constants for width
export const ValueContainer = styled(Button.Container)`
  ${({ isOpen, isOpenedBelow, isHidden }) => {
    const openedDirection = isOpenedBelow ? 'bottom' : 'top';
    const openStyle = `
      border-${openedDirection}: 0px solid transparent;
      border-${openedDirection}-right-radius: 0rem;
      border-${openedDirection}-left-radius: 0rem;
    `;

    return `
    user-select: none;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    ${isOpen && !isHidden ? openStyle : ''}
    width: 15rem;
    padding: .5rem 1rem;
  `;
  }}
`;

// TODO: Don't use explicit height here - this div is ending up larger than the icon otherwise
export const CloseIconContainer = styled(Div)`
  height: 1.125rem;
  z-index: 1;
`;

export const ArrowIconContainer = styled(Div)`
  height: 1.125rem;
  z-index: 1;
`;

const ValueItem = styled(Div)`
  width: 100%;
  text-align: left;
`;

const OptionsContainer = styled(Div)`
  ${({ color, variant, isOpenedBelow, isHidden }: UsefulDropdownState) => {
    const direction = isOpenedBelow ? 'top' : 'bottom';
    const borderStyle = isOpenedBelow ? '0rem 0rem 0.25rem 0.25rem' : '0.25rem 0.25rem 0rem 0rem';

    return `
    background: white;
    position: absolute;
    left: 0px;
    max-height: 10rem;
    overflow-y: auto;
    width: 15rem;
    ${
      variant !== variants.text
        ? `
            border: 1px solid ${color};
          `
        : ''
    }
    z-index: 1000;
    ${direction}: 100%;
    border-${direction}: 0px solid transparent;
    border-radius: ${borderStyle};
    ${isHidden ? 'visibility: hidden;' : ''}
  `;
  }}
`;

const HiddenOptionsContainer = styled(OptionsContainer)`
  ${({ isOpenedAbove }) => {
    const direction = isOpenedAbove ? 'top' : 'bottom';

    return `
    visibility: hidden;
    ${direction}: 100%;
  `;
  }}
`;

const OptionItem = styled(Div)`
  ${({ selected, color, variant }: UsefulDropdownState) => {
    const { colors } = useTheme();
    const unselectedBgColor = getBackgroundColorFromVariant(variant, color);
    const selectedBgColor = getLuminance(color) > 0.5 ? shade(0.125, color) : tint(0.5, color);
    const backgroundColor = selected ? selectedBgColor : unselectedBgColor;
    return `
      user-select: none;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      color: ${
        selected
          ? readableColor(backgroundColor, colors.background, color, true)
          : getFontColorFromVariant(variant, color)
      };
      background-color: ${backgroundColor};
      &:hover {
        background-color: ${
          backgroundColor !== 'transparent' ? darken(0.05, backgroundColor) : 'rgba(0, 0, 0, 0.05)'
        };
        cursor: pointer;
        outline: none;
      }
      &:focus {
        outline: none;
        background-color: ${
          backgroundColor !== 'transparent' ? darken(0.05, backgroundColor) : 'rgba(0, 0, 0, 0.1)'
        };
      }
    `;
  }}
`;

const CheckContainer = styled(Div)`
  ${({ color }: UsefulDropdownState) => {
    const { colors } = useTheme();
    const backgroundColor = getLuminance(color) > 0.5 ? shade(0.125, color) : tint(0.5, color);
    return `
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${readableColor(backgroundColor, colors.background, color, true)};
      padding-right: 0.2rem;
      width: 2rem;
    `;
  }}
`;

const PlaceholderContainer = styled(Span)`
  opacity: 0.8;
`;

const StyledTagContainer = styled(Tag.Container)`
  ${({
    dropdownVariant,
    tagVariant,
    dropdownColor,
    transparentColor,
  }: {
    dropdownVariant: variants;
    tagVariant: variants;
    dropdownColor: string;
    transparentColor: string;
  }) => `
    ${
      tagVariant === variants.text
        ? `
          padding: 0;
          line-height: 1;
          margin-top: 0 !important;
        `
        : ''
    }
    ${getDropdownTagStyle(dropdownVariant, tagVariant, dropdownColor, transparentColor)}
  `}
`;

export interface DropdownProps {
  StyledContainer?: StyledSubcomponentType;
  StyledValueContainer?: StyledSubcomponentType;
  StyledValueItem?: StyledSubcomponentType;
  StyledOptionsContainer?: StyledSubcomponentType;
  StyledHiddenOptionsContainer?: StyledSubcomponentType;
  StyledOptionItem?: StyledSubcomponentType;
  StyledCheckContainer?: StyledSubcomponentType;
  StyledPlaceholder?: StyledSubcomponentType;
  StyledCloseIconContainer?: StyledSubcomponentType;
  StyledArrowIconContainer?: StyledSubcomponentType;

  containerProps?: SubcomponentPropsType;
  valueContainerProps?: SubcomponentPropsType;
  valueItemProps?: SubcomponentPropsType;
  optionsContainerProps?: SubcomponentPropsType;
  optionItemProps?: SubcomponentPropsType;
  checkContainerProps?: SubcomponentPropsType;
  placeholderProps?: SubcomponentPropsType;
  closeIconProps?: SubcomponentPropsType;
  arrowIconProps?: SubcomponentPropsType;
  valueItemTagProps?: TagProps;

  containerRef?: React.RefObject<HTMLElement>;
  optionsContainerRef?: React.RefObject<HTMLElement>;
  hiddenOptionsContainerRef?: React.RefObject<HTMLElement>;
  optionItemRef?: React.RefObject<HTMLElement>;
  valueContainerRef?: React.RefObject<HTMLButtonElement>;
  valueItemRef?: React.RefObject<HTMLElement>;
  checkContainerRef?: React.RefObject<HTMLElement>;
  placeholderRef?: React.RefObject<HTMLElement>;
  closeIconRef?: React.RefObject<HTMLElement>;
  arrowIconRef?: React.RefObject<HTMLElement>;

  color?: string;
  elevation?: number;
  multi?: boolean;
  name?: string;
  placeholder?: string;

  componentUUID?: string;

  onBlur?: () => void;
  onClear?: () => void;
  onFocus?: () => void;
  onSelect: (selected?: Array<string | number>) => void;

  rememberScrollPosition?: boolean;

  values?: Array<string | number>;
  options?: Array<OptionProps>;
  tabIndex?: number;
  variant?: variants;
  optionsVariant?: variants;
  valueVariant?: variants;

  shouldStayInView?: boolean;
  intersectionThreshold?: number;
  intersectionObserverPrecision?: number;
}

const Dropdown = ({
  StyledContainer = Container,
  StyledValueContainer = ValueContainer,
  StyledValueItem = ValueItem,
  StyledOptionsContainer = OptionsContainer,
  StyledHiddenOptionsContainer = HiddenOptionsContainer,
  StyledOptionItem = OptionItem,
  StyledCheckContainer = CheckContainer,
  StyledPlaceholder = PlaceholderContainer,
  StyledCloseIconContainer = CloseIconContainer,
  StyledArrowIconContainer = ArrowIconContainer,

  containerProps,
  valueContainerProps,
  valueItemProps,
  optionsContainerProps,
  optionItemProps,
  checkContainerProps,
  placeholderProps,
  closeIconProps,
  arrowIconProps,
  valueItemTagProps = {},

  containerRef,
  optionsContainerRef,
  hiddenOptionsContainerRef,
  optionItemRef,
  valueContainerRef,
  valueItemRef,
  checkContainerRef,
  placeholderRef,
  closeIconRef,
  arrowIconRef,

  color,
  elevation = 0,
  multi = false,
  name = 'dropdown',
  placeholder,

  onBlur,
  onFocus,
  onClear,
  onSelect,
  options = [],
  tabIndex = 0,
  variant = variants.outline,
  optionsVariant = variants.outline,
  rememberScrollPosition = true,
  valueVariant = variants.text,
  values = [],

  shouldStayInView = true,
  intersectionThreshold = 0.95,
  intersectionObserverPrecision = 100,
}: DropdownProps): JSX.Element | null => {
  const { colors } = useTheme();
  const defaultedColor = color || colors.grayDark;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerInternalRef = useRef<HTMLDivElement>(null);
  const optionsContainerInternalRef = useRef<HTMLDivElement>(null);
  const hiddenOptionsContainerInternalRef = useRef<HTMLDivElement>(null);

  const [focusWithin, setFocusWithin] = useState<boolean>(false);
  const [focusTimeoutId, setFocusTimeoutId] = useState<number>();

  const scrollPos = useRef<number>(0);

  const [isOpenedBelow, setIsOpenedBelow] = useState<boolean>(true);
  const [isHidden, setIsHidden] = useState<boolean>(true);
  const [isScrollingDown, setIsScrollingDown] = useState<boolean>(false);
  const prevIntersectionRatio = useRef<number>(0.5);
  const ticking = useRef<boolean>(false);

  // Merge the default styled container prop and the placeholderProps object to get user styles
  const placeholderMergedProps = {
    StyledContainer: PlaceholderContainer,
    ...placeholderProps,
  };

  const tagContainerItemProps = valueItemTagProps.containerProps || {};

  // effect to determine if user is scrolling up or down
  useEffect(() => {
    const threshold = 0;
    let lastScrollY = window.pageYOffset;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking.current = false;
        return;
      }
      setIsScrollingDown(scrollY > lastScrollY);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDir);
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const intersectOptions = useMemo(() => {
    const buildThresholdArray = () =>
      Array.from(
        Array(intersectionObserverPrecision + 1).keys(), // + 1 to always get intersection at 100% in viewport
        i => i / intersectionObserverPrecision,
      );

    return {
      root: null,
      rootMargin: '0px',
      threshold: buildThresholdArray(),
    };
  }, [intersectionObserverPrecision]);

  const intersectionCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (shouldStayInView) {
        if (entries.length === 1) {
          const [entry] = entries;
          // swap the dropdown to open downward if its hitting the top
          if (
            entry.intersectionRatio < intersectionThreshold &&
            entry.target === optionsContainerInternalRef.current
          ) {
            if (isScrollingDown) {
              if (!isOpenedBelow && entry.intersectionRatio < prevIntersectionRatio.current) {
                setIsOpenedBelow(true);
              }
            } else if (isOpenedBelow && entry.intersectionRatio < prevIntersectionRatio.current) {
              setIsOpenedBelow(false);
            }
          }
          prevIntersectionRatio.current = entry.intersectionRatio;
        } else if (entries.length === 2) {
          const [dropdown, invisibleDrop] = entries;
          // flip the view if the other direction is more visible in viewport
          if (invisibleDrop.intersectionRatio > dropdown.intersectionRatio) {
            setIsOpenedBelow(drop => !drop);
          }
        }
        setIsHidden(false);
      } else {
        setIsHidden(false);
      }
    },
    [isOpenedBelow, isScrollingDown, intersectionThreshold, shouldStayInView],
  );

  const intersectObserver = useMemo(
    () => new IntersectionObserver(intersectionCallback, intersectOptions),
    [intersectOptions, intersectionCallback],
  );

  useEffect(() => {
    if (optionsContainerInternalRef.current) {
      intersectObserver.observe(optionsContainerInternalRef.current);
    }
    if (hiddenOptionsContainerInternalRef.current) {
      intersectObserver.observe(hiddenOptionsContainerInternalRef.current);
    }
    if (optionsContainerInternalRef.current && hiddenOptionsContainerInternalRef.current) {
      // height is returned in pixels
      hiddenOptionsContainerInternalRef.current.style.height = `${
        optionsContainerInternalRef.current.getBoundingClientRect().height
      }px`;
    }
    return () => intersectObserver.disconnect();
  }, [optionsContainerInternalRef, hiddenOptionsContainerInternalRef, intersectObserver, isOpen]);

  const optionsHash: { [key: string]: OptionProps } = useMemo(() => {
    const hash: { [key: string]: OptionProps } = {};
    options.forEach(option => {
      hash[option.id] = { ...option, isSelected: values.includes(option.id) };
    });

    return hash;
  }, [options, values]);

  const scrollListener = () => {
    scrollPos.current = optionsContainerInternalRef.current
      ? optionsContainerInternalRef.current.scrollTop
      : 0;
  };

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      e.preventDefault();

      setFocusTimeoutId(
        window.setTimeout(() => {
          if (focusWithin) {
            setFocusWithin(false);
            setIsOpen(false);
            if (onBlur) {
              onBlur();
            }
          }
        }, 0),
      );
    },
    [onBlur, focusWithin],
  );

  const handleFocus = useCallback(() => {
    clearTimeout(focusTimeoutId);

    if (!focusWithin) {
      setFocusWithin(true);
    }

    setIsOpen(true);
    if (onFocus) {
      onFocus();
    }
  }, [onFocus, focusWithin, focusTimeoutId]);

  const handleSelect = useCallback(
    (clickedId: string | number) => {
      if (!multi) {
        setIsOpen(false);
        onSelect([clickedId]);
      } else {
        const previouslySelected = optionsHash[clickedId].isSelected;
        const newValues = previouslySelected
          ? values.filter(val => val !== clickedId)
          : [...values, clickedId];
        onSelect(newValues);
      }
    },
    [onSelect, multi, values, optionsHash],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();
      onSelect(multi ? [] : undefined);
      if (onClear) {
        onClear();
      }
    },
    [multi, onClear, onSelect],
  );

  const handleMouseDownOnButton = useCallback(
    (e: React.MouseEvent) => {
      if (isOpen) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - It's okay if target is null in this case as we want it to close regardless
        handleBlur(e);
      } else {
        setIsHidden(true);
        setIsOpenedBelow(true);
        handleFocus();
      }
    },
    [isOpen, handleBlur, handleFocus],
  );

  const keyDownHandler = useCallback(
    ({ key }) => {
      // setTimeout(0) needed when responding to key events to push back call
      // to activeElement to after it is updated in the DOM
      window.setTimeout(() => {
        const focusedElement = document.activeElement;
        switch (key) {
          case 'Enter':
            const match = focusedElement && focusedElement.id.match(`${name}-option-(.*)`);
            if (match) {
              handleSelect(match[1]);
            }
            break;
          case 'ArrowUp':
            if (focusedElement && focusedElement.id.match(`${name}-option-.*`)) {
              const sibling = focusedElement.previousElementSibling as HTMLElement | null;
              if (sibling) {
                sibling.focus();
              }
            }
            break;
          case 'ArrowDown':
            if (focusedElement && focusedElement.id === `${name}-dropdown-button`) {
              const button = focusedElement.parentNode as HTMLElement | undefined;
              // get parent before nextElementSibling because buttons are nested inside of skeletons
              const optionsContainer = button ? button.nextElementSibling : null;
              if (optionsContainer) {
                const toFocus = optionsContainer.children[0] as HTMLElement | undefined;
                if (toFocus) {
                  toFocus.focus();
                }
              }
            } else if (focusedElement && focusedElement.id.match(`${name}-option-.*`)) {
              const sibling = focusedElement.nextElementSibling as HTMLElement | null;
              if (sibling) {
                sibling.focus();
              }
            }
            break;
          default:
            break;
        }
      }, 0);
    },
    [handleSelect, name],
  );

  useEffect(() => {
    window.removeEventListener('keydown', keyDownHandler);
    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [keyDownHandler]);

  const optionsScrollListenerCallbackRef = useCallback(
    node => {
      if (node && rememberScrollPosition) {
        node.addEventListener('scroll', scrollListener, true);

        if (scrollPos.current) {
          node.scrollTop = scrollPos.current;
        }
      }
    },
    [rememberScrollPosition],
  );

  const closeIcons = (
    <>
      {onClear && values.length > 0 && (
        <StyledCloseIconContainer
          onClick={handleClear}
          onFocus={(e: React.FocusEvent) => e.stopPropagation()}
          tabIndex={tabIndex}
          ref={closeIconRef}
          {...closeIconProps}
        >
          <Icon path={mdiClose} size="1em" />
        </StyledCloseIconContainer>
      )}
      <StyledArrowIconContainer ref={arrowIconRef} {...arrowIconProps}>
        <Icon path={isOpen ? mdiMenuUp : mdiMenuDown} size="1.25em" />
      </StyledArrowIconContainer>
    </>
  );

  return (
    <StyledContainer
      id={`${name}-container`}
      elevation={elevation}
      isOpen={isOpen}
      onBlur={handleBlur}
      onFocus={handleFocus}
      name={name}
      aria-label={placeholder}
      ref={mergeRefs([containerRef, containerInternalRef])}
      {...containerProps}
    >
      <Button
        StyledContainer={StyledValueContainer}
        id={`${name}-dropdown-button`}
        color={defaultedColor}
        onMouseDown={handleMouseDownOnButton}
        variant={variant}
        containerRef={valueContainerRef}
        {...valueContainerProps}
        containerProps={{
          isOpen,
          isOpenedBelow,
          isHidden,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          ...(valueContainerProps ? valueContainerProps.containerProps : {}),
        }}
      >
        <StyledValueItem id={`${name}-value-item`} ref={valueItemRef} {...valueItemProps}>
          {values
            .filter(val => val !== undefined && optionsHash[val] !== undefined)
            .map((val, i, arr) =>
              optionsHash[val] !== undefined ? (
                <Tag
                  StyledContainer={StyledTagContainer}
                  variant={valueVariant}
                  {...valueItemTagProps}
                  containerProps={{
                    dropdownVariant: variant,
                    tagVariant: valueVariant,
                    dropdownColor: defaultedColor,
                    transparentColor: colors.transparent,
                    ...tagContainerItemProps,
                  }}
                  key={val}
                >
                  {optionsHash[val].optionValue}
                  {valueVariant === variants.text && i !== arr.length - 1 && ','}
                </Tag>
              ) : undefined,
            )}
          {(!values || !values.length) && (
            <StyledPlaceholder
              ref={placeholderRef}
              id={`${name}-placeholder`}
              {...placeholderMergedProps}
            >
              {placeholder}
            </StyledPlaceholder>
          )}
        </StyledValueItem>
        {closeIcons}
      </Button>
      {isOpen && (
        <>
          <StyledOptionsContainer
            color={defaultedColor}
            variant={optionsVariant}
            role="listbox"
            ref={mergeRefs([
              optionsContainerRef,
              optionsContainerInternalRef,
              optionsScrollListenerCallbackRef,
            ])}
            isOpenedBelow={isOpenedBelow}
            isHidden={isHidden}
            {...optionsContainerProps}
          >
            {options.map(option => (
              <StyledOptionItem
                id={`${name}-option-${option.id}`}
                key={`${name}-option-${option.id}`}
                onClick={() => handleSelect(option.id)}
                tabIndex={-1}
                color={defaultedColor}
                variant={optionsVariant}
                multi={multi}
                selected={optionsHash[option.id].isSelected}
                ref={optionItemRef}
                role="option"
                {...optionItemProps}
              >
                {multi && (
                  <StyledCheckContainer
                    color={defaultedColor}
                    selected={optionsHash[option.id].isSelected}
                    variant={optionsVariant}
                    multi={multi}
                    ref={checkContainerRef}
                    {...checkContainerProps}
                  >
                    {optionsHash[option.id].isSelected && <Icon path={mdiCheck} size="1em" />}
                  </StyledCheckContainer>
                )}
                <Span>{option.optionValue}</Span>
              </StyledOptionItem>
            ))}
          </StyledOptionsContainer>
          {shouldStayInView && (
            <StyledHiddenOptionsContainer
              ref={mergeRefs([hiddenOptionsContainerInternalRef, hiddenOptionsContainerRef])}
              isOpenedAbove={!isOpenedBelow}
            />
          )}
        </>
      )}
    </StyledContainer>
  );
};

Dropdown.Container = Container;
Dropdown.OptionsContainer = OptionsContainer;
Dropdown.HiddenOptionsContainer = HiddenOptionsContainer;
Dropdown.OptionItem = OptionItem;
Dropdown.ValueContainer = ValueContainer;
Dropdown.ValueItem = ValueItem;
Dropdown.Placeholder = PlaceholderContainer;

export default Dropdown;
