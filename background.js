/*
  Called when the item has been created, or when creation failed due to an error.
  We'll just log success/failure here.
*/
function onCreated() {
    if (browser.runtime.lastError) {
	console.log(`Error: ${browser.runtime.lastError}`);
    } else {
	console.log("Item created successfully");
    }
}

/*
  Create all the context menu items.
*/
browser.menus.create({
    id: "log-selection",
    title: browser.i18n.getMessage("menuItemSelectionLogger"),
    contexts: ["selection"]
}, onCreated);

/*
  The click event listener, where we perform the appropriate action given the
  ID of the menu item that was clicked.
*/
browser.menus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
    case "log-selection":
	console.log(info.selectionText);
	break;
    }
});
