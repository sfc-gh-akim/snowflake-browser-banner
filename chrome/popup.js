//  This is the javascript for the button that appears in the browser
//  This creates the colored buttons and saves the results

const ColorPalette = [
    "#29B5E8",
    "#11567F",
    "#FF9F36",
    "#7D44CF",
    "#D45B90",
    "#8A999E",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#00FFFF",
    "#000000",
    "#FFFFFF"
]

//  Button Sections
const sections = ['textcolor', 'bgcolor']

var query = { active: true, currentWindow: true };
var accountId;

function callback(tabs) {
    var currentTab = tabs[0]; // there will be only one in this array

    let url = currentTab.url

    //  There might be a more efficient way of doing this
    if (url.includes("https://app.snowflake.com/")) {
        let slash1pos = url.indexOf("/", 26)
        let slash2pos = url.indexOf("/", slash1pos + 1)
        accountId = url.substr(slash1pos + 1, slash2pos - slash1pos - 1)
    } else if (url.includes(".snowflakecomputing.com/")) {
        accountId = url.substr(8, url.indexOf(".snowflakecomput") - 8)
    }

    if (accountId !== undefined) {
        //  Iterate through button sections
        for (let i = 0; i < sections.length; i++) {
            let _section = sections[i]

            //  Get saved settings
            chrome.storage.sync.get(`${accountId}.${_section}`, (data) => {

                //  Iterate through colors
                for (let i = 0; i < ColorPalette.length; i++) {
                    let color = ColorPalette[i]

                    //  Create buttons
                    let button = document.createElement("button")
                    button.value = color;
                    button.style.border = "1px solid grey";
                    button.style.backgroundColor = color;

                    //  Set class to "current if matches saved color"                    
                    if (data !== undefined) {
                        if (data[`${accountId}.${_section}`] === color) {
                            button.className = "current"
                        }
                    }

                    //  Click event to save color on click
                    button.addEventListener("click", (e) => {
                        chrome.storage.sync.set({ [`${accountId}.${_section}`]: color })

                        //  Remove "current" from class
                        resetClasses(_section)

                        //  Add "current to clicked button"
                        button.className = "current"
                    })

                    //  Add the button to the section
                    document.querySelectorAll(`td.${_section}`)[0].appendChild(button)
                }
            })
        }

        //  Display the AccountID
        document.getElementById("accountId").innerHTML = accountId

        //  Set the Text Input
        chrome.storage.sync.get(`${accountId}.text`, (data) => {
            if (data !== undefined && data[`${accountId}.text`] !== undefined) {
                document.getElementById("text").value = data[`${accountId}.text`]
            }
        })

        //  Show the configurations if on Snowflake page
        document.getElementById("SnowflakePage").style.display = "block"
        document.getElementById("NotSnowflakePage").style.display = "none"
    }
}

//  Query the Chrome tabs for active tab
chrome.tabs.query(query, callback);

//  Bind onKeyUp for text field and save
document.getElementById("text").onkeyup = (err) => {
    chrome.storage.sync.set({ [`${accountId}.text`]: document.getElementById("text").value });
}

//  Empty class attribute for buttons
function resetClasses(cls) {
    let _buttons = document.querySelectorAll(`td.${cls} button`)
    for (let i = 0; i < _buttons.length; i++) {
        _buttons[i].className = ""
    }
}

//  Bind to Reset Button
document.getElementById("Reset").addEventListener("click", () => {
    chrome.storage.sync.set({ [`${accountId}.text`]: "" });
    document.getElementById("text").value = "";

    for (let i = 0; i < sections.length; i++) {
        chrome.storage.sync.set({ [`${accountId}.${sections[i]}`]: undefined });
        resetClasses(sections[i])
    }
})