import React from 'react';
import PropTypes from 'prop-types';

import useDeck, { DeckContext } from '../hooks/useDeck';
import isComponentType from '../utils/isComponentType.js';
import { useTransition, animated } from 'react-spring';

/**
 * Provides top level state/context provider with useDeck hook
 * Should wrap all the presentation components (slides, etc)
 *
 * Props = {
 *  loop: bool (pass in true if you want slides to loop)
 * transitionEffect: based off of react sprint useTransition
 * }
 */

const initialState = { currentSlide: 0 };

const Deck = ({ children, loop, keyboardControls }) => {
  // Our default effect for transitioning between slides
  const defaultSlideEffect = {
    from: {
      width: '100%',
      position: 'absolute',
      transform: 'translate(100%, 0%)'
    },
    enter: {
      width: '100%',
      position: 'absolute',
      transform: 'translate(0, 0%)'
    },
    leave: {
      width: '100%',
      position: 'absolute',
      transform: 'translate(-100%, 0%)'
    }
  };
  // Check for slides and then number slides.
  const filteredChildren = Array.isArray(children)
    ? children
        // filter if is a Slide
        .filter(x => isComponentType(x, 'Slide'))
    : console.error('No children passed') || [];

  // return a wrapped slide with the animated.div + style prop curried
  // and a slideNum prop based on iterator

  const Slides = filteredChildren.map((
    x,
    i // eslint-disable-next-line react/display-name
  ) => ({ style }) => (
    <animated.div style={{ ...style }}>
      {{
        ...x,
        props: { ...x.props, slideNum: i, keyboardControls }
      }}
    </animated.div>
  ));

  // Initialise useDeck hook and get state and dispatch off of it
  const [state, dispatch] = useDeck(
    initialState,
    Slides.length,
    loop ? true : false
  );

  const transitions = useTransition(
    state.currentSlide,
    p => p,
    filteredChildren[state.currentSlide].props.transitionEffect || defaultSlideEffect
  );

  return (
    <div
      style={{
        position: 'relative',
        height: '50vh',
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      <DeckContext.Provider value={[state, dispatch, Slides.length, keyboardControls]}>
        {transitions.map(({ item, props, key }) => {
          const Slide = Slides[item];
          return <Slide key={key} style={props} />;
        })}
      </DeckContext.Provider>
    </div>
  );
};

Deck.propTypes = {
  children: PropTypes.node.isRequired,
  keyboardControls: PropTypes.oneOf(['arrows', 'space']),
  loop: PropTypes.bool.isRequired
};

Deck.defaultProps = {
  loop: false,
  keyboardControls: 'arrows'
};

export default Deck;
