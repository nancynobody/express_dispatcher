// DATETIME UTILITIES //

function diff_mins(dt2, dt1) {
    let diff_ms = dt2 - dt1;
    return (((diff_ms % 86400000) % 3600000) / 60000);
}

function diff_hours(dt2, dt1) {
    let diff_ms = dt2 - dt1;
    return Math.floor((diff_ms % 86400000) / 3600000);
}

function diff_days(dt2, dt1) {
    let diff_ms = dt2 - dt1;
    return Math.floor(diff_ms / 86400000);
}

module.exports = {
    diff_mins,
    diff_hours,
    diff_days,
};