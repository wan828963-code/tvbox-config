import cheerio from 'assets://js/lib/cheerio.min.js';

const appConfig = {
    siteName: "枫叶影院",
    siteUrl: "https://maihaolian.com"
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

async function init(ext) {}

async function home(filter) {
    return JSON.stringify({
        class: [
            { type_id: "/label/qq", type_name: "腾讯VIP精选" },
            { type_id: "/label/bli", type_name: "B站VIP精选" },
            { type_id: "/label/youku", type_name: "优酷VIP精选" },
            { type_id: "5", type_name: "红果短剧" },
            { type_id: "2", type_name: "电视剧" },
            { type_id: "1", type_name: "电影" },
            { type_id: "4", type_name: "动漫" },
            { type_id: "3", type_name: "综艺" }
        ],
        filters: {}
    });
}

async function category(tid, pg, filter, extend) {
    pg = pg || 1;
    let url = "";

    if (tid.startsWith("/label")) {
        url = `\( {appConfig.siteUrl} \){tid}/page/${pg}.html`;
    } else {
        url = `\( {appConfig.siteUrl}/cupfox-list/ \){tid}----${pg}---.html`;
    }

    const html = (await req(url, {headers: {"User-Agent": UA}})).content;
    const $ = cheerio.load(html);
    let list = [];

    // 调整选择器
    $(".public-list-div, .module-list .module-item").each(function() {
        let a = $(this).find("a").first();
        let vod_id = a.attr("href");
        let vod_name = a.attr("title") || a.text().trim();
        let img = $(this).find("img");
        let vod_pic = img.attr("data-src") || img.attr("src");
        let remarks = $(this).find(".public-prt-g, .module-item-note, .ft2").text().trim();

        if (vod_id && vod_name) {
            list.push({
                vod_id,
                vod_name,
                vod_pic: vod_pic ? (vod_pic.startsWith('http') ? vod_pic : appConfig.siteUrl + vod_pic) : '',
                vod_remarks: remarks
            });
        }
    });

    return JSON.stringify({
        list,
        pagecount: 20
    });
}

async function search(wd, quick, page) {
    const url = `\( {appConfig.siteUrl}/cupfox-search/-------------.html?wd= \){encodeURIComponent(wd)}`;
    const html = (await req(url)).content;
    const $ = cheerio.load(html);
    let list = [];

    $('.search-box, .module-item').each(function() {
        let a = $(this).find("a").first();
        let vod_id = a.attr("href");
        let vod_name = a.attr("title") || a.text().trim();
        let vod_pic = $(this).find("img").attr("data-src");
        let remarks = $(this).find('.public-list-prb, .module-item-note').text().trim();
        if (vod_id && vod_name) list.push({vod_id, vod_name, vod_pic, vod_remarks: remarks});
    });

    return JSON.stringify({list});
}

// 详情和播放暂时简化
async function detail(id) {
    return JSON.stringify({
        list: [{
            vod_id: id,
            vod_name: "加载中...",
            vod_play_from: "枫叶",
            vod_play_url: id
        }]
    });
}

async function play(flag, id, flags) {
    return JSON.stringify({ parse: 0, url: appConfig.siteUrl + (id.startsWith('/') ? id : '/' + id) });
}

export default { init, home, category, detail, search, play };