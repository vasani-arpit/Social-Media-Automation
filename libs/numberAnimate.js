/*global define:false, WebKitCSSMatrix:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, evil:true, 
    laxbreak:true, bitwise:true, strict:true, undef:true, unused:true, browser:true,
    jquery:true, indent:4, curly:false, maxerr:50 */

//Set the plugin up so that it'll work as a AMD module or regular import
//See: https://github.com/umdjs/umd/blob/master/jqueryPlugin.js..
(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    "use strict";
    
    //first figure out which CSS3 properties to set..
    var prefixes = ["", "O", "ms", "Webkit", "Moz"];

    //using same idea as jquery transform plugin..
    var testDivStyle = document.createElement('div').style;
    var css3Prefix = null;
    for (var i = 0, len = prefixes.length; i < len; i++) {
        if (prefixes[i] + "Transition" in testDivStyle &&
                prefixes[i] + "Transform" in testDivStyle) {
            css3Prefix = prefixes[i];
            break;
        }
    }
    var animationSupported = css3Prefix !== null;

    //get the transition ended event name for the css3Prefix..
    var transitionEndEvent;
    switch (css3Prefix) {
    case "O":
        transitionEndEvent = "otransitionend";
        break;
    case "ms":
        transitionEndEvent = "msTransitionEnd";
        break;
    case "Webkit":
        transitionEndEvent = "webkitTransitionEnd";
        break;
    default:
        transitionEndEvent = "transitionend";
    }
    
    //allow the use of hardware accellerated transforms for older webkit browsers, adapted from:
    //http://www.appmobi.com/documentation/content/Articles/Article_UsingBestPractices/index.html?r=8684
    var translateOpen = window.WebKitCSSMatrix 
                && 'm11' in new WebKitCSSMatrix() ? "translate3d(0, " : "translate(0, ";
    var translateClose = window.WebKitCSSMatrix
                && 'm11' in new WebKitCSSMatrix() ? "px ,0)" : "px)";

    /**
      * Binds the given function onto the given jQuery array $el on the transitionEndEvent and unbinds it after execution.
      * Also handles the case where the event doesn't fire, in which case a timeout is used to ensure execution, which runs
      * after the given number of milliseconds plus an additional 100ms grace period.
      */
    var bindToTransitionEndForSingleRun = function ($el, funcToExec, maxMSTillTransitionEnd) {
        var firedFunc = false;
        var wrappedFunc = function () {
            funcToExec();
            firedFunc = true;
            $el.unbind(transitionEndEvent, wrappedFunc);
        };
        $el.bind(transitionEndEvent, wrappedFunc);
        setTimeout(function () {
            if (!firedFunc) wrappedFunc();
        }, maxMSTillTransitionEnd + 100);
    };
    
    //all allowed characters (note: you get a bizzare error in Opera and IE
    //if the non-digit characters are at the end for some reason)..
    var allChars = ', . - + 0 1 2 3 4 5 6 7 8 9';

    //checks that the given value makes sense to use..
    var checkValue = function (str) {
        //check there are no odd chars first..
        for (var i = 0, len = str.length; i < len; i++) {
            if (allChars.indexOf(str.charAt(i)) < 0) {
                $.error("numberAnimate plugin requires that value used " +
                    "only contain character in: \"" + allChars + "\"");
                return false;
            }                
        }
        return true;
    };
    
    //Given a div which holder a character, it shift it to the required character,
    //note, the givenholder div should be attached prior to calling this for the animation
    //to take effect..
    var shiftToChar = function ($holderDiv, character, shiftTime) {
        var innerStyle = $holderDiv.children()[0].style;
        innerStyle[css3Prefix + 'Transition'] = "all " + shiftTime + "ms ease-in-out";
 
        var indexOfChar = allChars.indexOf(character);
        var transformY;
        if (indexOfChar < 0 || /\s/.test(character)) {
            transformY = $holderDiv.height();
        } else {
            transformY = 0 - (indexOfChar / 2) * $holderDiv.height();
        }
        innerStyle[css3Prefix + 'Transform'] = translateOpen + transformY + translateClose;
    };
    
    //Function to create a new character wrapper div to wrap the given character
    //setting the holding div to have the given dimension and given "position".
    //You should attach the element returned by this function to the DOM straight
    //away in order for the animation to take effect..
    //The animationTimes is an array of milliseconds which defines: creation,
    //shift and remove times..
    var createDivForChar = function (character, height, width, position, animationTimes) {
        var creationTime = animationTimes[0];
        var shiftTime = animationTimes[1];

        var holderDiv = $(document.createElement('div')).css({
            width: (creationTime ? 0 : width) + 'px',
            height: height + 'px',
            overflow: 'hidden',
            display: 'inline-block'
        }).attr("data-numberAnimate-pos", position);
        
        var innerDiv = $(document.createElement('div')).html(allChars);
        //fix annoying flickering for older webkit browsers..
        if (css3Prefix === 'Webkit')
            innerDiv[0].style['-webkit-backface-visibility'] = 'hidden';

        //initially show blank..
        innerDiv[0].style[css3Prefix + 'Transform'] =  translateOpen + height + translateClose;
        holderDiv.append(innerDiv);

        //animate to the correct character when finished animating creation if necessary..
        var shiftToCorrectChar = function () {
            shiftToChar(holderDiv, character, shiftTime);
        };

        //shift if after creation and after attachment if animating..
        if (creationTime) {            
            //bit of a hack - transition will only work if the element is attached to the DOM
            //so use a timeout to make this possible (no onattached event)..
            setTimeout(function () {
                bindToTransitionEndForSingleRun(holderDiv, shiftToCorrectChar, creationTime);
                var holderStyle = holderDiv[0].style;
                holderStyle[css3Prefix + 'Transition'] = "all " + creationTime + "ms ease-in-out";
                holderStyle.width = width + "px";
            }, 20);
        } else if (shiftTime) {
            setTimeout(shiftToCorrectChar, 20); 
        } else {
            shiftToCorrectChar();
        }

        return holderDiv[0];
    };
    
    //Removes the elements in thegiven jQuery collection using animation.. 
    var removeDivsForChars = function ($divs, animationTimes) {
        var shiftTime = animationTimes[1];
        var removeTime = animationTimes[2];

        $divs.removeAttr("data-numberAnimate-pos");
        $divs.each(function (i, div) {
            var $div = $(div);
            var style = div.style;

            //then remove it..
            var animateRemoval = function () {
                style[css3Prefix + 'Transition'] = "all " + removeTime + "ms ease-in-out";
                style.width = "1px";

                bindToTransitionEndForSingleRun($div, function () {
                    $div.remove();
                }, removeTime); 
            };
            if (shiftTime) {
                bindToTransitionEndForSingleRun($div, animateRemoval, shiftTime); 
            } else {
                animateRemoval();
            }
            
            //first move it so that the no break space is showing..
            shiftToChar($div, 'not there', shiftTime);
        });
    };

    var methods = {
        init: function (options) {
            var settings = $.extend({}, {
                animationTimes: [500, 500, 500] //creation, animation, removal ms
            }, options);

            this.css('display', 'inline-block'); //otherwise height/width calculated incorrectly..
            
            $.each(this, function () {
                var $this = $(this);

                //get initial value and set it as data..
                var valueStr = this.innerHTML;
                if (!checkValue(valueStr)) return;

                $this.attr("data-numberAnimate-value", valueStr);
                
                if (!animationSupported) return; //do nothing..

                //get width of a single character (assume mono-spaced font)..
                $this.html("1");
                var characterWidth = $this.width();
                var characterHeight = $this.height();
                $this.attr("data-numberAnimate-characterHeight", characterHeight);
                $this.attr("data-numberAnimate-characterWidth", characterWidth);
                $this.html("");

                //required to get things to line up..
                $this.css({
                    "vertical-align": "top",
                    "display": "inline-block",
                    "height": characterHeight + "px"
                });

                $this.attr("data-numberAnimate-animationTimes", "[" + settings.animationTimes + "]");
                
                //we positionthings relative to the dot, so store it's position..
                var indexOfPoint = valueStr.indexOf(".");
                if (indexOfPoint < 0) indexOfPoint = valueStr.length;
                
                //add divs representing each character..
                var docFrag = document.createDocumentFragment();
                for (var i = 0, len = valueStr.length; i < len; i++) {
                    var character = valueStr.charAt(i);
                    //create the divs with zero animation time..
                    docFrag.appendChild(
                        createDivForChar(character, characterHeight,
                            characterWidth, indexOfPoint - i, [0, 0, 0])
                    );
                }
                $this.append(docFrag); //add in one go.
            });
            
            return this;
        },
      
        /**
         * Obtains the string value that is being animating for the first matched element.
         */
        val: function () {
            return this.attr("data-numberAnimate-value");
        },

        /**
         * Sets the value to the new given one, using the given animationTimes if provided.
         * If animationTimes are not provided the ones associated with this object are used.
         */
        set: function (newValue, animationTimes) {
            if (typeof newValue === 'number') //normalize to a string..
                newValue = "" + newValue;
            if (!animationTimes)
                animationTimes = $.parseJSON(this.attr('data-numberAnimate-animationTimes'));

            //get the number value and update the stored value..
            if (!checkValue(newValue))  return;
            this.attr("data-numberAnimate-value", newValue);

            //if not animating just change the value..
            if (!animationSupported) {
                this.html(newValue);
                return;
            }

            //work out which characters are required relative to the dot..
            var indexOfPoint = newValue.indexOf(".");
            if (indexOfPoint < 0) indexOfPoint = newValue.length;
            
            $.each(this, function () {
                var $this = $(this);
            
                var numberHolderDivs = $this.find("[data-numberAnimate-pos]");
                var characterHeight = $this.attr('data-numberAnimate-characterHeight') * 1;
                var characterWidth = $this.attr('data-numberAnimate-characterWidth') * 1;

                //if new characters are required, this will be set to one of the newly created ones..
                var newlyCreatedHoldingDiv;

                //add/remove those at the start.. 
                var largestCurrentPos = numberHolderDivs.attr('data-numberAnimate-pos') * 1;
                if (isNaN(largestCurrentPos)) largestCurrentPos = 0;
                var largestRequiredPos = indexOfPoint;
                var docFragment, pos, character, index;
                if (largestCurrentPos < largestRequiredPos) {
                    docFragment = document.createDocumentFragment();
                    for (pos = largestRequiredPos, index = 0;
                            pos >= largestCurrentPos + 1; pos--, index++) {
                        character = newValue.charAt(index);
                        docFragment.appendChild(
                            createDivForChar(character, characterHeight,
                                    characterWidth, pos, animationTimes)
                        );
                    }
                    newlyCreatedHoldingDiv = docFragment.firstChild;
                    $this.prepend(docFragment);
                } else if (largestCurrentPos > largestRequiredPos) {
                    removeDivsForChars(
                        numberHolderDivs.slice(0, largestCurrentPos - largestRequiredPos),
                        animationTimes
                    );
                }

                //add/remove at the end of the list..
                var smallestCurrentPos =  numberHolderDivs.last()
                        .attr('data-numberAnimate-pos') * 1;
                if (isNaN(smallestCurrentPos)) smallestCurrentPos = 1;
                var smallestRequiredPos = indexOfPoint - newValue.length + 1;
                if (smallestRequiredPos < smallestCurrentPos) {
                    docFragment = document.createDocumentFragment();
                    for (pos = smallestCurrentPos - 1,
                            index = newValue.length - (smallestCurrentPos - smallestRequiredPos);
                            pos >= smallestRequiredPos; pos--, index++) {
                        character = newValue.charAt(index);
                        docFragment.appendChild(
                            createDivForChar(character, characterHeight,
                                    characterWidth, pos, animationTimes)
                        );
                    }
                    newlyCreatedHoldingDiv = docFragment.firstChild;
                    $this.append(docFragment);
                } else if (smallestRequiredPos > smallestCurrentPos) {
                    removeDivsForChars(
                        numberHolderDivs.slice(
                            numberHolderDivs.length - (smallestRequiredPos - smallestCurrentPos)
                        ),
                        animationTimes
                    );
                }
                
                //performs the animation of the characters that are already there..
                var shiftPresentCharacters = function () {
                    var shiftTime = animationTimes[1];
                    pos = Math.min(largestRequiredPos, largestCurrentPos);
                    var endPos = Math.max(smallestRequiredPos, smallestCurrentPos);
                    index = indexOfPoint - pos;
                    for (; pos >= endPos; pos--, index++) {
                        character = newValue.charAt(index);
                        var holdingDiv = $this.find("[data-numberAnimate-pos=" + pos + "]");
                        shiftToChar(holdingDiv, character, shiftTime);
                    }
                };
                
                //execute above function straight away or once the newly created holding div has finished animating..
                if (newlyCreatedHoldingDiv) {
                    bindToTransitionEndForSingleRun(
                        $(newlyCreatedHoldingDiv), shiftPresentCharacters, animationTimes[0] + 100);
                } else {
                    shiftPresentCharacters();
                }
            });
            
            return this;
        },
        
        /**
         * Undoes the changes made by this plugin to the selected elements.
         */
        destroy: function () {
            $.each(this, function () {
                var $this = $(this);
                
                var value = $this.numberAnimate('val');
                if (value === null) return; //continue

                $this.html(value);
                //remove attributes that may have been added - code adapted from:
                //cletus's answer for: http://stackoverflow.com/questions/1870441/remove-all-attributes
                var attributesToRemove = $.map(this.attributes, function (attr) {
                    var name = attr.name;
                    return name.indexOf('data-numberanimate') === 0 ? name : null; 
                });
                $this.removeAttr(attributesToRemove.join(' '));
            });
            
            return this;
        }
    };

    $.fn.numberAnimate = function (method) {
        // Method calling logic (adapted from http://docs.jquery.com/Plugins/Authoring)..
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.numberAnimate');
        }
    };

}));