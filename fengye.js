import cheerio from 'assets://js/lib/cheerio.min.js';

const appConfig = {
    siteName: "枫叶影院",
    siteUrl: "https://maihaolian.com"
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

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
        filters: {} // 可后续补充完整过滤器
    });
}

async function category(tid, pg, filter, extend) {
    pg = pg || 1;
    let url = "";
    const isLabel = tid.startsWith("/label");
    
    if (isLabel) {
        url = `\( {appConfig.siteUrl} \){tid}/page/${pg}.html`;
    } else {
        // 基础分类页
        url = `\( {appConfig.siteUrl}/cupfox-list/ \){tid}----${pg}---.html`;
    }

    const html = (await req(url)).content;
    const $ = cheerio.load(html);
    let list = [];

    $(".public-list-div.public-list-bj").each(function() {
        let vod_id = $(this).find("a.public-list-exp").attr("href");
        let vod_name = $(this).find("a.public-list-exp").attr("title").trim();
        let vod_pic = $(this).find(".public-list-exp img").attr("data-src");
        let remarks = $(this).find(".public-prt-g,.ft2").text().trim();
        
        list.push({ vod_id, vod_name, vod_pic, vod_remarks: remarks });
    });

    return JSON.stringify({ list, pagecount: 50 });
}

async function detail(id) {
    const url = appConfig.siteUrl + id;
    const html = (await req(url)).content;
    const $ = cheerio.load(html);

    const vod = {
        vod_id: id,
        vod_name: $('.slide-info-title').text().trim(),
        vod_pic: $('.detail-pic img').attr("data-src"),
        vod_actor: $('.slide-info').eq(2).text().trim(),
        vod_remarks: $('.slide-info').eq(4).text().trim(),
        vod_content: $('#height_limit').text().trim(),
        vod_play_from: "枫叶",
        vod_play_url: "" // 待完善播放解析
    };

    return JSON.stringify({ list: [vod] });
}

async function search(wd, quick, page) {
    if (page > 1) return JSON.stringify({ list: [] });
    const url = `\( {appConfig.siteUrl}/cupfox-search/-------------.html?wd= \){wd}`;
    const html = (await req(url)).content;
    const $ = cheerio.load(html);
    let list = [];

    $('.search-box').each(function() {
        const vod_id = $(this).find(".thumb-txt a").attr('href');
        const vod_name = $(this).find(".thumb-txt a").text().trim();
        const vod_pic = $(this).find('img').attr('data-src');
        const vod_remarks = $(this).find('.public-list-prb').text().trim();
        list.push({ vod_id, vod_name, vod_pic, vod_remarks });
    });

    return JSON.stringify({ list });
}

async function play(flag, id, flags) {
    return JSON.stringify({
        parse: 0,
        url: appConfig.siteUrl + id,
        header: { "User-Agent": UA }
    });
}

export default { init, home, category, detail, search, play };