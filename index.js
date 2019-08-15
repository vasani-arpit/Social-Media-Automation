var lineHelper = new LineHelper();
lineHelper.drawLine("#left-instagram", ".dashboard");
lineHelper.drawLine("#left-facebook", ".dashboard");
lineHelper.drawLine("#left-linkedin", ".dashboard");
lineHelper.drawLine("#left-twitter", ".dashboard");
lineHelper.drawLine("#left-skype", ".dashboard");
lineHelper.drawLine(".dashboard", "#right-instagram");
lineHelper.drawLine(".dashboard", "#right-twitter");
lineHelper.drawLine(".dashboard", "#right-facebook");
lineHelper.drawLine(".dashboard", "#right-skype");
$("p.center.white").numberAnimate();
//lineHelper.highlightLine("#left-twitter", ".dashboard","New post received");
//$("p.center.white").numberAnimate("set",400);

//For demo purpose
// setTimeout(() => { lineHelper.highlightLine("#left-twitter", ".dashboard", "New post received"); }, 1000)
// //increase number
// setTimeout(() => { $("p.center.white").eq(0).numberAnimate("set", 267); }, 6000);
// setTimeout(() => { lineHelper.highlightLine(".dashboard", "#right-instagram", "Publishing a post as scheduled"); }, 11000);

// //descrese number
// setTimeout(() => { $("p.center.white").eq(1).numberAnimate("set", 246); }, 13000);
// setTimeout(() => { $("p.center.white").eq(2).numberAnimate("set", 277); }, 13000);