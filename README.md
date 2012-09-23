Pets.js
=======

I built this in a few hours in the middle of the night so please forgive how crappy this is.

JS is a pretty terrible language but we have to live with it. Even after reading Crockford you're still stuck
with its crappy evented I/O. Well, evented I/O isn't bad in and of itself, but without some sort of coroutine
(like goroutines, tasklets or generators, which most reasonable languages implement these days) it's hard to do
multiple rounds of fetching. Also it's really hard for newbies to grasp which sucks when they are trying to do a
hackathon or something.

So I came up with this terrible idea that makes your code look synchronous. Basically it's just a special way to
invoke functions that expect callbacks as if they were synchronous. How is this black magic accomplished? Well
basically when you invoke a function we construct a unique key and check if we've fetched it yet. If we have we
don't actually call that function and instead we just return the result. If we have not yet called it, we queue
the fetch and throw an exception to bail out. When the fetches come back, we call the function again from the
beginning. Keep looping until it's all done. Brilliant!

Future work
===========

Build a Deferred-based abstraction on this maybe?

FAQ
===

  * Wait, my code gets run multiple times? What about side effects!

Yeah, sorry. Just don't put any side effects in your fetching code until after the last call to invoke().

  * What about Step.js / Async.js?

Confusing. I want to be able to explain it to an undergrad in 5 minutes. But probably better solutions for your
production code since this is just silly.

  * What about Streamline.js?

Cool, but does desugaring which is kind of icky.

  * Why doesn't JS just implement generators?

It's in Harmony and Firefox has them, but the v8 guys don't want to implement them I guess. And v8 is awesome.

  * I only care about Node, is there some magic C++ hack that is better than this?

https://github.com/laverdet/node-fibers

If you're doing that much fetching though, are you sure you're using the right tool for the job? :P

  * Hey, is there some language better than JavaScript which makes this easier?

http://www.python.org/
