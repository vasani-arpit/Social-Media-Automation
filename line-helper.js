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

        //draw line from start element to element
        console.log(checkOrGetElement(startElement));

        var line = new LeaderLine(
            checkOrGetElement(startElement),
            LeaderLine.pointAnchor({ element: checkOrGetElement(EndElement), x: -5, y: '50%' }),
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
        //find the line 
        var line = this.allLines.find(line => line.from === startElement && line.to === EndElement);
        //remove the line 
        line.line.remove();
        this.allLines.splice(this.allLines.indexOf(line), 1);
        highlightLineConfigs.middleLabel = LeaderLine.pathLabel({ text: message || `New post received` });
        var highlightLine = new LeaderLine(
            checkOrGetElement(startElement),
            LeaderLine.pointAnchor({ element: checkOrGetElement(EndElement), x: -5, y: '50%' }),
            highlightLineConfigs,
        );
        highlightLine.show("draw");
        //create a new for a 1500ms
        setTimeout(() => {
            highlightLine.remove();
            this.drawLine(startElement, EndElement);
        }, 5000)
        //create the normal line again
    }

    function checkOrGetElement(element) {
        //returning element if it is a HTML element already
        if (element instanceof Element || element instanceof HTMLDocument) {
            return element;
        } else if (typeof element === 'string') {
            if (document.querySelector(element) !== null) {
                return document.querySelector(element);
            } else {
                throw Error("Invalid element selector");
            }
        } else {
            throw Error("Invalid element selector");
        }
    }

    return this;
}

