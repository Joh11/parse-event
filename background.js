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
	obj = parseEvent(info.selectionText);
	console.log(obj);
	// Send the object to the ics generation
	icsContent = parsedObjectToIcs(obj);
	console.log(icsContent);

	blob = new Blob([icsContent], {type: "text/calendar"});
	url = URL.createObjectURL(blob);
	browser.downloads.download({url: url})
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

// -----------------------------------------------------------------------------
// Create the ics file content
// -----------------------------------------------------------------------------

function datetimeValue(year, month, day, hour, minute, second, localTime = true)
{
    utcSuffix = localTime ? "" : "Z";
    month = ('00' + month).slice(-2)
    day = ('00' + day).slice(-2)
    hour = ('00' + hour).slice(-2)
    minute = ('00' + minute).slice(-2)
    second = ('00' + second).slice(-2)
    return `${year}${month}${day}T${hour}${minute}${second}${utcSuffix}`;
}

function parsedObjectToIcs(obj)
{
    monthNum = {january: "01", february: "02", march: "03", april: "04", may: "05", june: "06", july: "07", august: "08", september: "09", october: "10", november: "11", december: "12"}[obj.date.month]
    
    time = obj.time.replace(':', '');
    
    return `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//hacksw/handcal//NONSGML v1.0//EN\r
BEGIN:VEVENT\r
DTSTAMP:19980119T070000Z\r
UID:19960401T080045Z-4000F192713-0052@example.com\r
DTSTART:${datetimeValue(2020, monthNum, obj.date.day, 22, 00, 00)}\r
DTEND:${datetimeValue(2020, monthNum, obj.date.day, 23, 00, 00)}\r
SUMMARY:${obj.zoomLink}\r
END:VEVENT\r
END:VCALENDAR\r
`;
}
