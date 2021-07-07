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

        for (let i = 0; i < sections.length; i++) {
            let _section = sections[i]

            console.log(`Getting ${accountId}.${_section}`)
            chrome.storage.sync.get(`${accountId}.${_section}`, (data) => {

                for (let i = 0; i < ColorPalette.length; i++) {
                    let color = ColorPalette[i]

                    let button = document.createElement("button")
                    button.value = color;
                    button.style.border = "1px solid grey";
                    button.style.backgroundColor = color;
                    button.addEventListener("click", (e) => {
                        let tmp = {}
                        tmp[`${accountId}.${_section}`] = color
                        chrome.storage.sync.set(tmp)
                        console.log(tmp)

                        resetClasses(_section)
                        button.className = "current"
                    })

                    console.log(data)
                    if (data !== undefined) {
                        let _activeColor = data[`${accountId}.${_section}`]

                        console.log(_activeColor)
                        console.log(color)
                        if (_activeColor === color) {
                            button.className = "current"
                        }
                    }

                    document.querySelectorAll(`td.${_section}`)[0].appendChild(button)
                }
            })

            // let button1 = document.createElement("button")
            // button1.value = color;
            // button1.style.border = "1px solid grey";
            // button1.style.backgroundColor = color;
            // button1.addEventListener("click", (e) => {
            //     let tmp = {}
            //     tmp[`${accountId}.${_section}`] = color
            //     chrome.storage.sync.set(tmp)

            //     resetClasses(_section)
            //     button1.className = "current"
            // })
            // document.querySelectorAll(`td.textcolor`)[0].appendChild(button1)
        }


        document.getElementById("accountId").innerHTML = accountId

        // for (let i = 0; i < sections.length; i++) {
        //     let _section = sections[i]

        //     resetClasses(_section)


        // });
    }
    // chrome.storage.sync.get(`${accountId}.textcolor`, ({ data }) => {
    //     let _buttons = document.querySelectorAll('td.textcolor button')
    //     let _activeColor = data[`${accountId}.textcolor`]

    //     resetClasses("textcolor")
    //     if (_activeColor !== undefined) {
    //         for (let i = 0; i < _buttons.length; i++) {
    //             if (_buttons[i].value === data[`${accountId}.textcolor`]) {
    //                 _buttons[i].className = "current"
    //             }
    //         }
    //     }
    // });

    //  Set the Text Input
    chrome.storage.sync.get(`${accountId}.text`, (data) => {
        if (data !== undefined && data[`${accountId}.text`] !== undefined) {
            document.getElementById("text").value = data[`${accountId}.text`]
        }
    })

    //  Show the configurations if on Snowflake page
    document.getElementById("SnowflakePage").style.display = "block"
    document.getElementById("NotSnowflakePage").style.display = "none"
    // }
}

chrome.tabs.query(query, callback);


document.getElementById("text").onkeyup = (err) => {
    let tmp = {}
    tmp[`${accountId}.text`] = document.getElementById("text").value
    chrome.storage.sync.set(tmp);
}


// for (let i = 0; i < sections.length; i++) {
//     let _section = sections[i]
//     let _buttons = document.querySelectorAll(`td.${_section} button`)
//     for (let i = 0; i < _buttons.length; i++) {
//         _buttons[i].addEventListener("click", (e) => {
//             let tmp = {}
//             tmp[`${accountId}.${_section}`] = _buttons[i].value
//             chrome.storage.sync.set(tmp)

//             resetClasses(_section)
//             _buttons[i].className = "current"
//         })
//     }
// }

function resetClasses(cls) {
    let _buttons = document.querySelectorAll(`td.${cls} button`)
    for (let i = 0; i < _buttons.length; i++) {
        _buttons[i].className = ""
    }
}

document.getElementById("Reset").addEventListener("click", () => {
    chrome.storage.sync.set({ [`${accountId}.text`]: "" });
    document.getElementById("text").value = "";

    for (let i = 0; i < sections.length; i++) {
        chrome.storage.sync.set({ [`${accountId}.${sections[i]}`]: undefined });
        resetClasses(sections[i])
    }
})