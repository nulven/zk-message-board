  export function formatMoney(amount, decimalCount = 0, decimal = ".", thousands = ",") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";
      const digits = amount.toString().length
      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;
      if(digits > 6 && digits <= 9){
        let money = amount / 1000000
        decimalCount = decimalPlaces(Math.abs(money - i)) < 2 ? decimalPlaces(Math.abs(money - i)) : 2;
        i = parseInt(amount = Math.abs(Number(money) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;
        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "")+"m";
      } else if(digits > 9){
        let money = amount / 1000000000
        decimalCount = decimalPlaces(Math.abs(money - i)) < 2 ? decimalPlaces(Math.abs(money - i)) : 2;
        i = parseInt(amount = Math.abs(Number(money) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;
        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "")+"b";
      } else{
        let j = (i.length > 3) ? i.length % 3 : 0;
        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
      }
    } catch (e) {
      console.log(e)
    }
  };

function decimalPlaces(n) {
  var s = "" + (+n);
  var match = /(?:\.(\d+))?(?:[eE]([+\-]?\d+))?$/.exec(s);
  if (!match) { return 0; }
  return Math.max(
      0,  // lower limit.
      (match[1] == '0' ? 0 : (match[1] || '').length)  // fraction length
      - (match[2] || 0));  // exponent
}

  export function calculateVolume(variants){
  var sum = 0
  for(var i = 0; i < variants.length; i++){
    sum += variants[i].clicks
  }
  return formatMoney(sum)
}

  export function calculateRevenue(variants){
  var sum = 0
  for(var i = 0; i < variants.length; i++){
    sum += variants[i].revenue
  }
  return "$"+formatMoney(sum)
}

  export function calculateBestPrice(variants){
  let best = 0;
  for(var i = 0; i < variants.length; i++){
    if(variants[i].price > best){
      best = variants[i].price
    }
  }
  return "$"+formatMoney(best)
  }