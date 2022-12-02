export const Direction = {
  Up: 0,
  Right: 1,
  Down: 2,
  Left: 3,
};

// FIXME: Use the app FPS instead
export const secondToTick = (sec) => {
  return sec * 60;
};
