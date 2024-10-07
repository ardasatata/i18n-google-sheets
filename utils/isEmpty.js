const isEmpty = (str) => {
  if(str === undefined){
    return false
  }
  return str.trim().length === 0
}

module.exports = isEmpty