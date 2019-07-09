var line = new LeaderLine(
    document.querySelector("#left-instagram"),
    document.querySelector(".dashboard"),
    {
        dash: { len: 15, gap: 25 },
        middleLabel: LeaderLine.pathLabel({ text: `This is additional label` }),
        endPlug: "arrow2"
    });