//  This javascript executes on any page that matches the content_scripts.matches

var banner = document.createElement('div')
banner.className = "_snowflake_banner";
banner.style.position = "fixed";
banner.style.top = 0;
banner.style.width = "100%"
banner.style.zIndex = 99999
banner.style.textAlign = "center"
banner.style.padding = "5px"

//  Hide the banner when mouseover
banner.onmouseover = (e) => {
    e.target.style.display = "none"
    var _e = e

    //  Show banner again after 10 seconds
    setTimeout((e) => {
        _e.target.style.display = "block"
    }, 10000)
}

let accountId
let url = location.href

//  There might be a more efficient way of doing this
if (url.includes("https://app.snowflake.com/")) {
    let slash1pos = url.indexOf("/", 26)
    let slash2pos = url.indexOf("/", slash1pos + 1)
    accountId = url.substr(slash1pos + 1, slash2pos - slash1pos - 1)
} else if (url.includes(".snowflakecomputing.com/")) {
    accountId = url.substr(8, url.indexOf(".snowflakecomput") - 8)
}

if (accountId !== undefined) {
    //  Set the Text Color
    chrome.storage.sync.get(`${accountId}.textcolor`, (data) => {
        if (data !== undefined && data[`${accountId}.textcolor`] !== undefined) {
            banner.style.color = data[`${accountId}.textcolor`]
        }
    })

    //  Set the Banner's Background Color
    chrome.storage.sync.get(`${accountId}.bgcolor`, (data) => {
        if (data !== undefined && data[`${accountId}.bgcolor`] !== undefined) {
            banner.style.backgroundColor = data[`${accountId}.bgcolor`]
        }
    })

    //  Set the Banner's Text
    chrome.storage.sync.get(`${accountId}.text`, (data) => {
        if (data !== undefined && data[`${accountId}.text`] !== undefined) {
            banner.innerHTML = data[`${accountId}.text`]

            //  Only append to body if text is available
            let body = document.getElementsByTagName("body")
            body[0].prepend(banner)
        }
    })
}