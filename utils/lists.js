// LIST UTILITIES //

function isin(item, list) {  // checks if item is in list
  if (item == null) { throw new Error("The item to search for in the list can not be null or undefined") };
  if (list == null) { throw new Error("The list search in for the item can not be null or undefined")};
  
  const index = list.indexOf(item);
  if (index > -1) { return index; } 
  else { return false; }
}

function add(item, list) {  // adds item to list without duplicating
  if (item == null) { throw new Error("The item to search for in the list can not be null or undefined") };
  if (list == null) { throw new Error("The list search in for the item can not be null or undefined")};
  if (!isin(item, list)) {
    list.push(item);
    return list.length;
  } else {
    logger.info(`item (${item}) already in list`);
    return true;
  }
}

function rmv(item, list) {  // removes item from list if exists
  if (item == null) { throw new Error("The item to search for in the list can not be null or undefined") };
  if (list == null) { throw new Error("The list search in for the item can not be null or undefined")};
  let idx = isin(item, list);
  if (typeof(idx) == "number") {
    list.splice(idx, 1);
    return true;
  } else {
    logger.info(`item (${item}) not in list`);
    return false;
  }
}

function get_random(list) {  // return random item from list
  if (list == null) { throw new Error("The list search in for the item can not be null or undefined")};
  let res = list[Math.floor(Math.random()*list.length)];
  return res;
}

module.exports = {
  isin,
  add,
  rmv,
  get_random,
}  