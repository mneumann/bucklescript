// GENERATED CODE BY BUCKLESCRIPT VERSION 0.5.5 , PLEASE EDIT WITH CARE
'use strict';


function caml_int32_float_of_bits(x) {
  var int32 = new Int32Array(/* array */[x]);
  var float32 = new Float32Array(int32.buffer);
  return float32[0];
}

function caml_int32_bits_of_float(x) {
  var float32 = new Float32Array(/* float array */[x]);
  return new Int32Array(float32.buffer)[0];
}

function caml_classify_float(x) {
  if (isFinite(x)) {
    if (Math.abs(x) >= 2.2250738585072014e-308) {
      return /* FP_normal */0;
    }
    else if (x !== 0) {
      return /* FP_subnormal */1;
    }
    else {
      return /* FP_zero */2;
    }
  }
  else if (isNaN(x)) {
    return /* FP_nan */4;
  }
  else {
    return /* FP_infinite */3;
  }
}

function caml_modf_float(x) {
  if (isFinite(x)) {
    var neg = +(1 / x < 0);
    var x$1 = Math.abs(x);
    var i = Math.floor(x$1);
    var f = x$1 - i;
    if (neg) {
      return /* tuple */[
              -f,
              -i
            ];
    }
    else {
      return /* tuple */[
              f,
              i
            ];
    }
  }
  else if (isNaN(x)) {
    return /* tuple */[
            NaN,
            NaN
          ];
  }
  else {
    return /* tuple */[
            1 / x,
            x
          ];
  }
}

var caml_ldexp_float = ( function (x,exp) {
    exp |= 0;
    if (exp > 1023) {
        exp -= 1023;
        x *= Math.pow(2, 1023);
        if (exp > 1023) {  // in case x is subnormal
            exp -= 1023;
            x *= Math.pow(2, 1023);
        }
    }
    if (exp < -1023) {
        exp += 1023;
        x *= Math.pow(2, -1023);
    }
    x *= Math.pow(2, exp);
    return x;
}
);

var caml_frexp_float = (function (x) {
    if ((x == 0) || !isFinite(x)) return [ x, 0];
    var neg = x < 0;
    if (neg) x = - x;
    var exp = Math.floor(Math.LOG2E*Math.log(x)) + 1;
    x *= Math.pow(2,-exp);
    if (x < 0.5) { x *= 2; exp -= 1; }
    if (neg) x = - x;
    return [x, exp];
}
);

function caml_float_compare(x, y) {
  if (x === y) {
    return 0;
  }
  else if (x < y) {
    return -1;
  }
  else if (x > y || x === x) {
    return 1;
  }
  else if (y === y) {
    return -1;
  }
  else {
    return 0;
  }
}

function caml_copysign_float(x, y) {
  var x$1 = Math.abs(x);
  var y$1 = y === 0 ? 1 / y : y;
  if (y$1 < 0) {
    return -x$1;
  }
  else {
    return x$1;
  }
}

function caml_expm1_float(x) {
  var y = Math.exp(x);
  var z = y - 1;
  if (Math.abs(x) > 1) {
    return z;
  }
  else if (z === 0) {
    return x;
  }
  else {
    return x * z / Math.log(y);
  }
}

var caml_hypot_float = ( function (x, y) {
    var x0 = Math.abs(x), y0 = Math.abs(y);
    var a = Math.max(x0, y0), b = Math.min(x0,y0) / (a?a:1);
    return a * Math.sqrt(1 + b*b);
}
);

var caml_log10_float = ( function  (x) { 
   return Math.LOG10E * Math.log(x); }
);

exports.caml_int32_float_of_bits = caml_int32_float_of_bits;
exports.caml_int32_bits_of_float = caml_int32_bits_of_float;
exports.caml_classify_float      = caml_classify_float;
exports.caml_modf_float          = caml_modf_float;
exports.caml_ldexp_float         = caml_ldexp_float;
exports.caml_frexp_float         = caml_frexp_float;
exports.caml_float_compare       = caml_float_compare;
exports.caml_copysign_float      = caml_copysign_float;
exports.caml_expm1_float         = caml_expm1_float;
exports.caml_hypot_float         = caml_hypot_float;
exports.caml_log10_float         = caml_log10_float;
/* caml_ldexp_float Not a pure module */
