// a loop for the other sections '.section'
var sections = gsap.utils.toArray(".st-section-pin").forEach(function(elem) {

  // select the relevant elements
  var frames = elem.querySelectorAll(".st-frames");

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: elem,
      fastScrollEnd: true,
      pin:elem,
      scrub:2,
      start: "-=7,2%",
      end: '+=300%',
    },
  })
  // .to(frames, {autoAlpha:1,  duration:0.7, ease:'power2.out', stagger:0.3},0, false)
 .to(frames, {autoAlpha:1,  duration:2, ease:'power2.out', stagger:2},1)

});
