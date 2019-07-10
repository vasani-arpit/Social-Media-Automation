var line = new LeaderLine(
    document.querySelector("#left-instagram"),
    document.querySelector(".dashboard"),
    {
        dash: { len: 4, gap: 25, animation: { duration: 200 } },
        middleLabel: LeaderLine.pathLabel({ text: `This is additional label` }),
        endPlug: "arrow2"
    });

var postReceived = () => {
    line.setOptions({ dash: { len: 300, gap: 900, animation: { duration: 2000 } } });
    setTimeout(() => {
        line.setOptions({ dash: { len: 4, gap: 25, animation: { duration: 200 } } });
    }, 1500);
}