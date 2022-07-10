
export
const randomInt = (min = 0, max = 1): number => {
    if (min > max) [min, max] = [max, min];
    return Number((Math.random() * (max - min) + min).toFixed());
};
