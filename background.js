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
    
    zoomLink = parseZoom(str);
    if(zoomLink)
	output.zoomLink = zoomLink;
    
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
