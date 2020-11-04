// -----------------------------------------------------------------------------
// General hook for the context menu button
// -----------------------------------------------------------------------------

// Called when the item has been created, or when creation failed due to an error.
// We'll just log success/failure here.
function onCreated() {
    if (browser.runtime.lastError) {
	console.log(`Error: ${browser.runtime.lastError}`);
    } else {
	console.log("Item created successfully");
    }
}

browser.menus.create({
    id: "log-selection",
    title: browser.i18n.getMessage("menuItemParseEvent"),
    contexts: ["selection"]
}, onCreated);

browser.menus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
    case "log-selection":
	// For now just print the output of the parsing step
	console.log(info.selectionText);
	console.log(parseEvent(info.selectionText));
	break;
    }
});

// -----------------------------------------------------------------------------
// The parsing function itself
// -----------------------------------------------------------------------------

// Returns an object with several fields that it managed to parse
function parseEvent(str)
{
    output = {str: str};
    parseFuns = {time: parseTime,
		 zoomLink: parseZoom,
		 date: parseDate};

    for (const prop in parseFuns) {
	x = parseFuns[prop](str);
	if(x)
	    output[prop] = x;
    }
    
    return output;
}

function parseZoom(str)
{
    var re = /epfl\.zoom\.us\/j\/(\d+)/;
    res = str.match(re);

    if(res)
	return "https://epfl.zoom.us/j/" + res[1];

    return null;
}

function parseTime(str)
{
    var re = /\d\d:\d\d/;
    res = str.match(re);

    if(res)
	return res[0];
    
    return null;
}

function parseDate(str)
{
    var re = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\W*(january|february|march|april|may|june|july|august|september|october|november|december)\W*(\d{1,2})(st|nd|rd|th|)/;
    res = str.toLowerCase().match(re);

    if(res) {
	return {dayName: res[1],
		month:res[2],
		day: Number(res[3])};
    }
    return null;
}
