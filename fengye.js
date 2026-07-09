/**
 * 枫叶影院 TVBox/DRPY 爬虫脚本
 * 适用版本: TVBox/本地/远程自建自用
 */

var maccms = {
    url: 'http://www.maihaolian.com', // 替换为你当前可用的前端镜像或原站主页
};

// 1. 初始化基本配置
function init(ext) {
    console.log("枫叶影院初始化完成");
}

// 2. 首页/首屏推荐数据解析 (对应你提供的 HTML 主页)
function home(filter) {
    var classes = [
        {"type_id": "qq", "type_name": "腾讯SVIP"},
        {"type_id": "youku", "type_name": "优酷SVIP"},
        {"type_id": "bli", "type_name": "B站SVIP"},
        {"type_id": "duanju", "type_name": "红果短剧"}
    ];
    
    // 针对你给出的 HTML 代码进行结构化模拟输出
    var list = [
        {
            "vod_id": "50767",
            "vod_name": "藏海传",
            "vod_pic": "https://liangcang-material.alicdn.com/prod/upload/25e514af8b4b489886470fac8aae4614.webp",
            "vod_remarks": "更新至40集"
        },
        {
            "vod_id": "92941",
            "vod_name": "斩神之凡尘神域Ⅱ",
            "vod_pic": "https://emage.hzqingshan.com/upload/vod/20260625-1/083d2636c750ca5f3bff2b4a77e67247.jpg",
            "vod_remarks": "更新至05集"
        },
        {
            "vod_id": "89442",
            "vod_name": "盘龙",
            "vod_pic": "https://emage.hzqingshan.com/upload/vod/20260430-1/977e38e19be6cabe3c3351d95ae438b2.webp",
            "vod_remarks": "更新至13集"
        },
        {
            "vod_id": "76260",
            "vod_name": "京城奇探",
            "vod_pic": "https://emage.hzqingshan.com/upload/vod/20251114-1/c525d3d67c3c609d0e777ec6985df762.jpg",
            "vod_remarks": "更新至11集"
        }
    ];

    return JSON.stringify({
        "class": classes,
        "list": list
    });
}

// 3. 分类页动态解析
function category(tid, pg, filter, extend) {
    // 拼接真实分类网络请求
    var targetUrl = maccms.url + '/label/' + tid + '.html';
    if(pg > 1) {
        targetUrl = maccms.url + '/label/' + tid + '-' + pg + '.html';
    }
    
    // 这里使用 TVBox 引擎内置的 request 抓取
    var html = request(targetUrl);
    var vids = pdfa(html, '.public-list-box');
    var list = [];
    
    vids.forEach(function(item) {
        var id = pdfh(item, 'a.public-list-exp&&href').replace('/detail/', '').replace('.html', '');
        var name = pdfh(item, 'a.public-list-exp&&title');
        var pic = pdfh(item, 'img&&data-src') || pdfh(item, 'img&&src');
        var remarks = pdfh(item, '.public-list-prb i&&text');
        
        list.push({
            "vod_id": id,
            "vod_name": name,
            "vod_pic": pic,
            "vod_remarks": remarks
        });
    });

    return JSON.stringify({
        "page": pg,
        "pagecount": 99,
        "limit": 20,
        "total": 999,
        "list": list
    });
}

// 4. 详情页解析 (获取选集列表)
function detail(id) {
    var targetUrl = maccms.url + '/detail/' + id + '.html';
    var html = request(targetUrl);
    
    var name = pdfh(html, '.this-name&&text');
    var pic = pdfh(html, '.gen-movie-img&&src');
    
    // 解析播放列表段落
    var playlistHtml = pdfa(html, '.playlist&&a'); 
    var playUrls = [];
    playlistHtml.forEach(function(a) {
        var pName = pdfh(a, 'text');
        var pUrl = pdfh(a, 'href');
        playUrls.push(pName + '$' + pUrl);
    });

    var vod = {
        "vod_id": id,
        "vod_name": name,
        "vod_pic": pic,
        "vod_play_from": "枫叶高清",
        "vod_play_url": playUrls.join('#')
    };

    return JSON.stringify({
        "list": [vod]
    });
}

// 5. 搜索功能
function search(wd, quick) {
    var searchUrl = maccms.url + '/index.php/ajax/suggest?mid=1&wd=' + encodeURIComponent(wd);
    var html = request(searchUrl);
    var json = JSON.parse(html);
    var list = [];
    
    json.list.forEach(function(item) {
        list.push({
            "vod_id": item.id,
            "vod_name": item.name,
            "vod_pic": item.pic,
            "vod_remarks": item.text
        });
    });
    
    return JSON.stringify({
        "list": list
    });
}

// 6. 播放解析
function play(flag, id, flags) {
    // 枫叶影院底层通常包含免签劫持或默认M3U8直链，直接返回原生地址或调用内置解析
    return JSON.stringify({
        "parse": 1,
        "url": maccms.url + id,
        "header": {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36"
        }
    });
}
                 "value": [{"n": "全部", "v": ""}, {"n": "大陆", "v": "大陆"}, {"n": "香港", "v": "香港"},
                           {"n": "台湾", "v": "台湾"}, {"n": "美国", "v": "美国"}, {"n": "韩国", "v": "韩国"},
                           {"n": "日本", "v": "日本"}, {"n": "法国", "v": "法国"}, {"n": "英国", "v": "英国"},
                           {"n": "其它", "v": "其它"}]},
                {"key": "year", "name": "年份", "value": year},
                {"key": "lang", "name": "语言", "value": lang},
                {"key": "letter", "name": "字母", "value": letter},
                {"key": "sort", "name": "排序", "value": sort},
            ],
            "3": [
                {"key": "class", "name": "类型",
                 "value": [{"n": "全部", "v": "3"}, {"n": "大陆综艺", "v": "21"}, {"n": "日韩综艺", "v": "22"}]},
                {"key": "genre", "name": "剧情", "value": [{"n": v[0], "v": v[1]} for v in
                                                           [("全部", ""), ("选秀", "选秀"), ("情感", "情感"),
                                                            ("访谈", "访谈"), ("播报", "播报"), ("音乐", "音乐"),
                                                            ("美食", "美食"), ("旅游", "旅游"), ("搞笑", "搞笑"),
                                                            ("游戏", "游戏"), ("亲子", "亲子"), ("其它", "其它")]]},
                {"key": "area", "name": "地区",
                 "value": [{"n": "全部", "v": ""}, {"n": "大陆", "v": "大陆"}, {"n": "香港", "v": "香港"},
                           {"n": "台湾", "v": "台湾"}, {"n": "美国", "v": "美国"}, {"n": "韩国", "v": "韩国"},
                           {"n": "日本", "v": "日本"}, {"n": "英国", "v": "英国"}, {"n": "其它", "v": "其它"}]},
                {"key": "year", "name": "年份", "value": year},
                {"key": "lang", "name": "语言", "value": lang},
                {"key": "letter", "name": "字母", "value": letter},
                {"key": "sort", "name": "排序", "value": sort},
            ],
        }

    def homeVideoContent(self):
        html = self._fetch('/')
        return {"list": self._parse_video_list(html)}

    def categoryContent(self, tid, pg, filter, extend):
        # 构建筛选参数：参照歪比巴卜，直接取extend里的值，fallback到filter
        if tid.startswith('/label'):
            url = f'{tid}/page/{pg}.html'
            html = self._fetch(url)
            items = self._parse_video_list(html)
            page = int(pg)
            page_count = page if len(items) < 24 else page + 2
            return {"list": items, "page": page, "pagecount": page_count, "limit": 24, "total": page_count * 24}

        args = {}
        if extend and isinstance(extend, dict):
            for k, v in extend.items():
                if v:
                    args[k] = str(v)
        if isinstance(filter, dict):
            for k, v in filter.items():
                if v and k not in args:
                    args[k] = str(v)
        route_tid = args.get('class', args.get('tid', str(tid)))
        area = args.get('area', '')
        genre = args.get('genre', '')
        year = args.get('year', '')
        lang = args.get('lang', '')
        letter = args.get('letter', '')
        sort = args.get('sort', '')
        # 无筛选走正常分页
        if not area and not genre and not year and not lang and not letter and not sort:
            url = f'/cupfox-list/{route_tid}--------{pg}---.html'
            html = self._fetch(url)
            items = self._parse_video_list(html)
            page = int(pg)
            soup = BeautifulSoup(html, 'html.parser')
            pagecount = page
            for a in soup.select('a.page-link'):
                if a.text == '尾页':
                    m = re.search(r'---(\d+)---', a.get('href', ''))
                    if m:
                        pagecount = int(m.group(1))
                    break
            if not items:
                pagecount = 0
            return {"list": items, "page": page, "pagecount": pagecount, "limit": 36, "total": 9999}
        # 有筛选：{tid}-{area}-{sort}-{genre}-{lang}-{letter}------{year}.html
        segs = [route_tid, area, sort, genre, lang, letter, '', '', year]
        url = '/cupfox-list/' + '-'.join(segs) + '.html'
        html = self._fetch(url)
        items = self._parse_video_list(html)
        return {"list": items, "page": 1, "pagecount": 1, "limit": 36, "total": 9999}

    def detailContent(self, ids):
        result = {"list": []}
        vid = ids[0].split(',')[0].strip()
        try:
            html = self._fetch(f'/detail/{vid}.html')
            if not html: return result
            soup = BeautifulSoup(html, 'html.parser')
            vod_name = soup.select_one('h3.slide-info-title')
            vod_name = vod_name.text.strip() if vod_name else ''
            vod_pic = soup.select_one('img.lazy')
            vod_pic = self._fix_pic(vod_pic.get('data-src', '')) if vod_pic else ''
            vod_director = ''
            vod_actor = ''
            for el in soup.select('.slide-info'):
                text = el.get_text(' ').strip()
                if text.startswith('导演：'):
                    vod_director = text.replace('导演：', '').strip()
                elif text.startswith('演员：'):
                    vod_actor = text.replace('演员：', '').strip()
            vod_content = soup.select_one('#height_limit')
            vod_content = vod_content.get_text(' ', strip=True) if vod_content else ''
            play_from, play_url = [], []
            for tab in soup.select('.anthology-tab a.swiper-slide'):
                src_name = re.sub(r'<[^>]+>', '', str(tab)).strip() or tab.get_text(' ', strip=True).strip()
                if src_name:
                    play_from.append(src_name)
            tab_blocks = soup.select('.anthology-list-box')
            for i, block in enumerate(tab_blocks):
                ep_list = []
                for a in block.select('li a'):
                    href = a.get('href', '')
                    m = re.search(r'/play/(.*?)\.html', href)
                    if m:
                        ep_list.append(f'{a.text.strip()}${vid}-{m.group(1)}')
                ep_list.reverse()
                if ep_list and i < len(play_from):
                    play_url.append('#'.join(ep_list))
            valid_from = [pf for i, pf in enumerate(play_from) if i < len(play_url)]
            result["list"].append({
                "vod_id": vid, "vod_name": vod_name, "vod_pic": vod_pic,
                "vod_director": vod_director, "vod_actor": vod_actor,
                "vod_content": vod_content,
                "vod_play_from": "$$$".join(valid_from),
                "vod_play_url": "$$$".join(play_url),
            })
        except:
            pass
        return result

    def searchContent(self, key, quick, pg="1"):
        try:
            decoded = urllib.parse.unquote(key)
        except:
            decoded = key
        html = self._fetch(f'/cupfox-search/{urllib.parse.quote(decoded)}----------{pg}---.html')
        items = self._parse_search_list(html)
        return {"list": items, "page": int(pg), "pagecount": 1, "limit": 36, "total": len(items)}

    def playerContent(self, flag, id, vipFlags):
        url = ''
        try:
            url = id if id.startswith('http') else f'{self.host}/play/{id}.html'
            html = self._fetch(url)
            if html:
                m = re.search(r'player_aaaa=(.*?)</script>', html, re.S)
                if m:

                    try:
                        pd = json.loads(m.group(1))
                    except Exception as e:
                        print(e)
                        pd = {}
                    # print('pd:', pd)
                    play_url = pd.get('url')
                    play_id = pd.get('from')

                    api_map = {
                        'YYNB': 'https://zzrs.mfdyvip.com/player/mplayer.php',
                        'JD4K': 'https://fgsrg.hzqingshan.com/player/mplayer.php',
                    }
                    if not play_url:
                        return {"parse": 0, "url": 'https://php.doube.eu.org/error.m3u8',
                                "header": {'User-Agent': 'Mozilla/5.0'}}
                    if play_url.startswith('http') and (play_url.endswith('.m3u8') or play_url.endswith('.mp4')):
                        return {"parse": 0, "url": play_url, "header": {'User-Agent': 'Mozilla/5.0'}}

                    else:
                        headers = {
                            'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
                            'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                            'accept-language': "zh-CN,zh;q=0.9",
                            'cache-control': "no-cache",
                            'pragma': "no-cache",
                            'priority': "u=0, i",
                            'referer': "https://www.ht10010.com/",
                            'Content-Type': 'application/x-www-form-urlencoded',
                        }
                        response = requests.get(f"https://fgsrg.hzqingshan.com/player/?url={play_url}", headers=headers)
                        token = re.search(r'data-te="(.*?)"', response.text)
                        if token:
                            token = token.group(1)
                            payload = {
                                'url': play_url,
                                'token': token
                            }
                            # print('payload', payload)
                            try:
                                response = self.post(api_map[play_id], data=payload, headers=headers)

                                response.raise_for_status()
                                result = response.json()
                                # print('result:', result)
                                if result['code'] == 200 and 'url' in result:
                                    play_url = result['url']
                                    return {"parse": 0, "url": play_url, "header": {
                                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'}}
                            except Exception as e:
                                print(e)
        except Exception as e:
            print(e)
        return {"parse": 1, "url": url}

    def localProxy(self, param=''):
        return {}

    def isVideoFormat(self, url):
        return False

    def manualVideoCheck(self):
        return False

    def _fetch(self, url):
        try:
            if not url.startswith('http'):
                url = self.host + url
            rsp = self.fetch(url, headers=self.headers)
            return rsp.text if rsp else ''
        except:
            return ''

    def _fix_pic(self, u):
        if not u: return ''
        if u.startswith('//'): return 'https:' + u
        return u.replace('&amp;', '&')

    def _parse_video_list(self, html):
        videos, seen = [], set()
        soup = BeautifulSoup(html, 'html.parser')
        cards = soup.select('a.public-list-exp')
        for a in cards:
            href = a.get('href', '')
            m = re.search(r'/detail/(\d+)\.html', href)
            if not m: continue
            vod_id = m.group(1)
            if vod_id in seen: continue
            seen.add(vod_id)
            span = ','.join([span.text for span in a.select('span.public-prt')])
            # print('span', span)
            vod_name = a.get('title', '') or (a.select_one('img') and a.select_one('img').get('alt', '')) or ''
            pic_el = a.select_one('img')
            vod_pic = self._fix_pic(pic_el.get('data-src', '')) if pic_el else ''
            remark_el = a.select_one('.ft2') or a.select_one('.public-list-prb')
            vod_remarks = remark_el.text.strip() if remark_el else ''
            videos.append(
                {"vod_id": vod_id, "vod_name": vod_name.strip(), "vod_pic": vod_pic, "vod_remarks": vod_remarks, "vod_year": span})
        return videos

    def _parse_search_list(self, html):
        videos, seen = [], set()
        soup = BeautifulSoup(html, 'html.parser')
        cards = soup.select('a.public-list-exp')
        for a in cards:
            href = a.get('href', '')
            m = re.search(r'/detail/(\d+)\.html', href)
            if not m: continue
            vod_id = m.group(1)
            if vod_id in seen: continue
            seen.add(vod_id)
            pic_el = a.select_one('img')
            vod_pic = self._fix_pic(pic_el.get('data-src', '')) if pic_el else ''
            title_el = soup.select_one(f'a.thumb-txt[href="/detail/{vod_id}.html"]')
            if title_el:
                vod_name = title_el.text.strip()
            else:
                vod_name = a.select_one('img') and a.select_one('img').get('alt', '') or ''
            remark_el = a.select_one('.public-list-prb') or a.select_one('.ft2')
            vod_remarks = remark_el.text.strip() if remark_el else ''
            videos.append(
                {"vod_id": vod_id, "vod_name": vod_name.strip(), "vod_pic": vod_pic, "vod_remarks": vod_remarks})
        return videos


if __name__ == '__main__':
    sp = Spider()
    sp.init()
    # 20067-5-189
    print(sp.categoryContent('/label/qq','1',True, {}))
    # print(sp.playerContent('', '20067-6-189', []))
    # print(sp.playerContent('', '20067-5-189', []))
    pass
