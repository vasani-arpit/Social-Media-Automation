// This JS will help draw the animated likens between the Elements

function LineHelper() {
    var normalLineConfigs = {
        dash: { len: 10, gap: 25, animation: { duration: 200 } },
        endPlug: "arrow2",
        hide:true
    };
    var highlightLineConfigs = {
        dash: { len: 500, gap: 900, animation: { duration: 2000 } },
        endPlug: "arrow2",
        hide:true
    };

    this.allLines = [];
    this.drawLine = function (startElement, EndElement) {
        var startNode = checkOrGetElement(startElement);
        var endNode = checkOrGetElement(EndElement);

        if (!startNode || !endNode) {
            return;
        }

        var duplicateLine = this.allLines.find(function (line) {
            return line.from === startElement && line.to === EndElement;
        });

        if (duplicateLine) {
            duplicateLine.line.remove();
            this.allLines = this.allLines.filter(function (line) {
                return line !== duplicateLine;
            });
        }

        var line = new LeaderLine(
            startNode,
            LeaderLine.pointAnchor({ element: endNode, x: -5, y: '50%' }),
            normalLineConfigs
        );

        var LineObject = {};
        LineObject.from = startElement;
        LineObject.to = EndElement;
        LineObject.line = line;
        this.allLines.push(LineObject);
        line.show("fade");
    }

    this.highlightLine = function (startElement, EndElement, message) {
        var startNode = checkOrGetElement(startElement);
        var endNode = checkOrGetElement(EndElement);

        if (!startNode || !endNode) {
            return;
        }

        var line = this.allLines.find(function (line) {
            return line.from === startElement && line.to === EndElement;
        });

        if (line) {
            line.line.remove();
            this.allLines = this.allLines.filter(function (item) {
                return item !== line;
            });
        }

        highlightLineConfigs.middleLabel = LeaderLine.pathLabel({ text: message || 'New post received' });
        var highlightLine = new LeaderLine(
            startNode,
            LeaderLine.pointAnchor({ element: endNode, x: -5, y: '50%' }),
            highlightLineConfigs,
        );
        highlightLine.show("draw");

        setTimeout(() => {
            highlightLine.remove();
            this.drawLine(startElement, EndElement);
        }, 5000)
    }

    function checkOrGetElement(element) {
        if (element instanceof Element || element instanceof HTMLDocument) {
            return element;
        }

        if (typeof element === 'string') {
            var foundElement = document.querySelector(element);
            if (foundElement !== null) {
                return foundElement;
            }
        }

        return null;
    }

    return this;
}

