let gaid;
window.getGoogleId = function (gid) {
    gaid = gid;
}
window.dataLayer = window.dataLayer || [];

function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', gaid, {
    'send_page_view': false
});