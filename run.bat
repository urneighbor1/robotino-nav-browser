rem Chromeをセキュリティを緩めて起動する
start C:/"Program Files"/Google/Chrome/Application/chrome.exe --disable-web-security --user-data-dir=C:/tmp "file:///%cd%/build/index.html"