require.config({
    paths: {
        'common': 'common.min',
        'jquery': "jquery-3.2.1"
    }
});
define(['common', 'jquery'], function (core, $) {
    let modal = {};

    modal.env = "dev";

    modal.server = {
        "dev": "//dev.xiangdao.info",
        "pro": "//www.xiangdao.info"
    };

    function q (selector) {
        return document.querySelector(selector)
    }

    core.init();



});