"use strict";

function none() {}

export default function fetchResolver(index = 0, opts = {}, cb = none) {
  if (!opts.prefetch || index >= opts.prefetch.length) {
    cb();
  } else {
    opts.prefetch[index](opts, err =>
      err ? cb(err) : fetchResolver(index + 1, opts, cb)
    );
  }
}
