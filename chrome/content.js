//  This javascript executes on any page that matches the content_scripts.matches
const hideOptions = [
    {
        description: "5 sec",
        duration: 1000 * 5
    },
    {
        description: "15 sec",
        duration: 1000 * 15
    },
    {
        description: "30 sec",
        duration: 1000 * 30
    },
    {
        description: "1 min",
        duration: 1000 * 60 * 1
    },
    {
        description: "15 min",
        duration: 1000 * 60 * 15
    },
    {
        description: "Forever",
        duration: 1000 * 60 * 9999
    }
]

const bodyBorderSize = "10px"

const maxRetries = 6;
const retryWait = 250;
var retryI = 0;

function BuildBanner() {
    try {
        //  Clean up
        for (let i = document.getElementsByClassName("_snowflake_banner").length; i > 0; i--) {
            document.getElementsByClassName("_snowflake_banner")[i - 1].remove()
        }
    } catch (e) {
        console.log(e)
    }

    try {
        let styles = `body{
            border-top-style: solid !important;
            border-top-width: ${bodyBorderSize} !important;
            transition: border-top-width 0.5s;
        }
        ._snowflake_banner{
            position: fixed;
            bottom: 0;
            width: 100%;
            z-index: 99999;
            text-align: center;
            padding: 0.25em 0;
            opacity: 0.5;
            transition: opacity 0.5s;
        }
        ._snowflake_banner:hover{
            opacity: 1;
        }
        ._snowflake_banner ._banner_actions{
            display:none;
            position: absolute;
            right: 0;
            top: 0;
        } 
        ._snowflake_banner:hover ._banner_actions{
            display:block;
            font-style: italic;
        } 
        ._snowflake_banner ._banner_actions a{
            padding: 5px;
            border-right-width: 1px;
            border-right-style: solid;
        }
        ._snowflake_banner ._banner_actions a:last-child{
            border-right-width: 0px;
        }
        ._snowflake_banner ._banner_actions a:hover{
            cursor:pointer
        }`

        let accountId
        let url = location.href

        //  Create the banner div
        var banner = document.createElement('div')
        banner.id = "_snowflake_banner";
        banner.className = "_snowflake_banner";

        //  Create Actions container
        var actions = document.createElement('div');
        actions.className = "_banner_actions";
        actions.innerHTML = "Hide for "

        var style = document.createElement("style")
        style.type = 'text/css'
        style.id = "_snowflake_banner_style"
        style.className = "_snowflake_banner";

        //  Create styling to hide body border
        var styles2 = `body{border-top-width: 0px !important}`
        var style2 = document.createElement("style")
        if (style2.styleSheet) {
            style2.styleSheet.cssText = styles2
        } else {
            style2.appendChild(document.createTextNode(styles2))
        }
        style2.type = 'text/css'
        style2.id = "_snowflake_banner_style_override"
        style2.className = "_snowflake_banner";

        //  There might be a more efficient way of doing this
        if (url.includes("https://app.snowflake.com")) {
            let slash1pos = url.indexOf("/", 26)
            let slash2pos = url.indexOf("/", slash1pos + 1)
            accountId = url.substr(slash1pos + 1, slash2pos - slash1pos - 1)
        } else if (url.includes(".snowflakecomputing.com/")) {
            accountId = url.substr(8, url.indexOf(".snowflakecomput") - 8)
        }

        if (accountId !== undefined && accountId !== "") {
            //  Set the Text Color
            chrome.storage.sync.get(`${accountId}.textcolor`, (data) => {
                if (data !== undefined && data[`${accountId}.textcolor`] !== undefined) {
                    banner.style.color = data[`${accountId}.textcolor`]

                    //  Build the buttons for the duration options
                    for (let i = 0; i < hideOptions.length; i++) {
                        let action = document.createElement('a');
                        action.style.borderRightColor = data[`${accountId}.textcolor`]
                        action.style.color = data[`${accountId}.textcolor`]
                        action.innerHTML = hideOptions[i].description

                        //  Sets the onclick to hide for option's duration
                        action.onclick = (e) => {
                            document.getElementsByClassName('_snowflake_banner')[0].style.display = "none"
                            document.getElementsByTagName("head")[0].appendChild(style2)

                            setTimeout((e) => {
                                document.getElementsByClassName('_snowflake_banner')[0].style.display = "block"
                                document.getElementById('_snowflake_banner_override').remove()
                            }, hideOptions[i].duration)
                        }

                        actions.appendChild(action)
                    }
                }
            })

            //  Set the Banner's Background Color
            chrome.storage.sync.get(`${accountId}.bgcolor`, (data) => {
                if (data !== undefined && data[`${accountId}.bgcolor`] !== undefined) {
                    banner.style.backgroundColor = data[`${accountId}.bgcolor`]

                    //  Add border to body
                    styles += `body{
                        border-top-color: ${data[`${accountId}.bgcolor`]} !important
                    } `
                }
            })

            //  Set the Banner's Text
            chrome.storage.sync.get(`${accountId}.text`, (data) => {
                if (data !== undefined && data[`${accountId}.text`] !== undefined) {
                    banner.innerHTML = data[`${accountId}.text`]

                    //  Only append to body if text is available
                    banner.appendChild(actions)
                    document.getElementsByTagName("body")[0].prepend(banner)

                    if (style.styleSheet) {
                        style.styleSheet.cssText = styles
                    } else {
                        style.appendChild(document.createTextNode(styles))
                    }

                    document.getElementsByTagName("head")[0].appendChild(style)
                }
            })
        } else {
            if (retryI < maxRetries) {
                setTimeout(BuildBanner, retryWait);
                retryI++;
            }
        }
    } catch (e) {
        console.log(e)
    }
}

BuildBanner();