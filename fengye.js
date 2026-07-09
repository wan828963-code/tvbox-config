/**
 * ☁云霄免扫影院 - 动态全自动解析源 (DRPY 规范)
 * 完美匹配：http://www.maihaolian.com
 */

var rule = {
    title: '云霄免扫影院',
    host: 'http://www.maihaolian.com',
    url: '/label/fy.html',
    searchUrl: '/index.php/ajax/suggest?mid=1&wd=**',
    searchable: 1,
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
    },
    timeout: 5000,
    
    // 静态分类
    class_name: '腾讯SVIP&优酷SVIP&B站SVIP&红果短剧',
    class_url: 'qq&youku&bli&duanju',

    // 1. 首页推荐解析
    home: function () {
        var html = request(this.host);
        var jsdata = [];
        
        // 解析腾讯SVIP热映等列表
        var blocks = pdfa(html, '.public-list-box');
        blocks.forEach(function (block) {
            var id = pdfh(block, 'a.public-list-exp&&href').replace('/detail/', '').replace('.html', '');
            var name = pdfh(block, 'a.public-list-exp&&title');
            var pic = pdfh(block, 'img&&data-src') || pdfh(block, 'img&&src');
            var remarks = pdfh(block, '.public-list-prb i&&text') || '4K';
            
            if (id && name) {
                jsdata.push({
                    vod_id: id,
                    vod_name: name,
                    vod_pic: pic,
                    vod_remarks: remarks
                });
            }
        });
        return JSON.stringify({ list: jsdata });
    },

    // 2. 分类页动态解析
    category: function (tid, pg, filter, extend) {
        var pageUrl = this.host + '/label/' + tid + '.html';
        var html = request(pageUrl);
        var jsdata = [];
        
        var blocks = pdfa(html, '.public-list-box');
        blocks.forEach(function (block) {
            var id = pdfh(block, 'a.public-list-exp&&href').replace('/detail/', '').replace('.html', '');
            var name = pdfh(block, 'a.public-list-exp&&title');
            var pic = pdfh(block, 'img&&data-src') || pdfh(block, 'img&&src');
            var remarks = pdfh(block, '.public-list-prb i&&text') || '4K';
            
            if (id && name) {
                jsdata.push({
                    vod_id: id,
                    vod_name: name,
                    vod_pic: pic,
                    vod_remarks: remarks
                });
            }
        });
        return JSON.stringify({ list: jsdata });
    },

    // 3. 详情页（集数列表解析）
    detail: function (id) {
        var detailUrl = this.host + '/detail/' + id + '.html';
        var html = request(detailUrl);
        
        var name = pdfh(html, '.slide-info-types span&&text') || '云霄4K专属影院';
        var pic = pdfh(html, '.slide-time-img3&&style').match(/url\((.*?)\)/)[1] || '';
        
        // 自动提取该网页中所有的播放集数链接
        var playUrls = [];
        var links = pdfa(html, '.public-list-box a') || pdfa(html, 'a[href*="/detail/"]');
        
        if (links.length > 0) {
            links.forEach(function(item, index) {
                playUrls.push('正片集数 ' + (index + 1) + '$' + 'http://www.maihaolian.com/play/' + id + '-1-' + (index + 1) + '.html');
            });
        } else {
            playUrls.push('高清正片$http://www.maihaolian.com/play/' + id + '-1-1.html');
        }

        var vod = {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: "枫叶4K极速源",
            vod_play_from: "云霄秒播",
            vod_play_url: playUrls.join('#')
        };
        return JSON.stringify({ list: [vod] });
    },

    // 4. 搜索功能
    search: function (wd, quick) {
        var searchUrl = this.host + '/index.php/ajax/suggest?mid=1&wd=' + encodeURIComponent(wd);
        var html = request(searchUrl);
        var json = JSON.parse(html);
        var jsdata = [];
        
        if (json && json.list) {
            json.list.forEach(function(item) {
                jsdata.push({
                    vod_id: item.id,
                    vod_name: item.name,
                    vod_pic: item.pic,
                    vod_remarks: item.text
                });
            });
        }
        return JSON.stringify({ list: jsdata });
    },

    // 5. 播放解析
    play: function (flag, id, flags) {
        return JSON.stringify({
            parse: 1, // 开启内置免签/Web解析机制
            url: id,
            header: this.headers
        });
    }
};

export default {
    init: function() {},
    home: rule.home,
    category: rule.category,
    detail: rule.detail,
    search: rule.search,
    play: rule.play
};
