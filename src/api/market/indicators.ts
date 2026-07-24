export function percentageChange(
    current: number,
    previous: number
) {

    return (
        (
            current -
            previous
        ) /
        previous
    ) * 100;

}
